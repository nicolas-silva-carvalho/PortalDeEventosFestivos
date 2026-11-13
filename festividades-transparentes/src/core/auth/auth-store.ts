import { useSyncExternalStore } from "react";

export interface Sessao {
  token: string;
  nome: string;
  expiraEm: string | null;
}

const CHAVE = "festividades_sessao";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; secure; samesite=strict`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

function eraseCookie(name: string) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

function expirada(s: Sessao): boolean {
  if (!s.expiraEm) return false;
  const t = Date.parse(s.expiraEm);
  return Number.isFinite(t) && t <= Date.now();
}

function lerDoCookie(): Sessao | null {
  try {
    const bruto = getCookie(CHAVE);
    if (!bruto) return null;
    const s = JSON.parse(bruto) as Sessao;
    return s?.token && !expirada(s) ? s : null;
  } catch {
    return null;
  }
}

let atual: Sessao | null = lerDoCookie();
let timer: ReturnType<typeof setTimeout> | undefined;
const ouvintes = new Set<() => void>();

function emitir() {
  ouvintes.forEach((f) => f());
}

function agendarExpiracao(s: Sessao | null) {
  if (timer) clearTimeout(timer);
  if (!s?.expiraEm) return;
  const restante = Date.parse(s.expiraEm) - Date.now();
  if (Number.isFinite(restante) && restante > 0 && restante < 2_147_000_000) {
    timer = setTimeout(() => authStore.limpar(), restante);
  }
}

agendarExpiracao(atual);

export const authStore = {
  get: (): Sessao | null => atual,

  definir(sessao: Sessao) {
    atual = sessao;
    try {
      setCookie(CHAVE, JSON.stringify(sessao));
    } catch {
      /* fallback: a sessão vive só em memória se cookies estiverem bloqueados no navegador */
    }
    agendarExpiracao(sessao);
    emitir();
  },

  limpar() {
    atual = null;
    try {
      eraseCookie(CHAVE);
    } catch {
      /* ignore */
    }
    agendarExpiracao(null);
    emitir();
  },

  subscribe(fn: () => void) {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  },
};

export function useSessao(): Sessao | null {
  return useSyncExternalStore(authStore.subscribe, authStore.get, () => null);
}