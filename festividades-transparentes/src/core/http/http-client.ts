import { env } from "@/core/env";
import { ApiError } from "./api-error";

export interface Parser<T> {
  safeParse(
    dado: unknown,
  ):
    | { success: true; data: T }
    | { success: false; error: { issues: unknown } };
}

interface RequestOptions<T> {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  schema?: Parser<T>;
  timeoutMs?: number;
}

function extrairMensagem(dados: unknown): string | null {
  if (typeof dados === "string") {
    const t = dados.trim();
    return t && !t.startsWith("<") ? t.slice(0, 200) : null;
  }
  if (dados && typeof dados === "object") {
    const o = dados as Record<string, unknown>;
    for (const k of ["mensagem", "message", "erro", "error", "detail"]) {
      if (typeof o[k] === "string" && o[k]) return o[k] as string;
    }
  }
  return null;
}

export async function http<T = unknown>(
  path: string,
  opts: RequestOptions<T> = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
    schema,
    timeoutMs = 20_000,
  } = opts;

  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) headers.set("Content-Type", "application/json");

  const timeout = AbortSignal.timeout(timeoutMs);
  const combinado = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let res: Response;
  try {
    res = await fetch(`${env.VITE_API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: combinado,
      credentials: "omit", // portal público: nunca envia cookies/sessão
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    if (e instanceof DOMException && e.name === "TimeoutError") {
      throw new ApiError(408, "O servidor demorou demais para responder.");
    }
    throw new ApiError(0, "Não foi possível conectar ao servidor.");
  }

  const texto = await res.text();
  let dados: unknown;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      extrairMensagem(dados) ?? `Erro ${res.status} ao falar com o servidor.`,
      dados,
    );
  }

  if (schema) {
    const r = schema.safeParse(dados);
    if (!r.success) {
      console.error(`[http] resposta fora do contrato em ${path}`, r.error.issues);
      throw new ApiError(502, "O servidor respondeu em formato inesperado.", r.error.issues);
    }
    return r.data;
  }
  return dados as T;
}
