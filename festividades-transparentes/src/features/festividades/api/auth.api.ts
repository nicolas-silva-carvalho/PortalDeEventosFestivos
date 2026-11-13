import { http } from "@/core/http/http-client";
import { authStore } from "@/core/auth/auth-store";

export async function realizarLoginSilencioso() {
  if (authStore.get()) return;

  try {
    const resposta = await http<{ token: string; nome?: string; expiraEm?: string }>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { 
        email: "pie@tce.ce.gov.br",
        senha: ":S06?1un]?8G7j,b!dq}zq0E55NVI*X|YL=tZ{838G9d#%xN"
      }
    });

    authStore.definir({
      token: resposta.token,
      nome: resposta.nome || "Visitante Público",
      expiraEm: resposta.expiraEm || null
    });
    
  } catch (erro) {
    console.error("Falha no login silencioso:", erro);
    throw erro; 
  }
}