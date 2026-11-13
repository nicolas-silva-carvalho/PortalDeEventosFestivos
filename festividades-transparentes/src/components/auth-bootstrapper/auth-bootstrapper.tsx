import { useState, useEffect, type ReactNode } from "react";
import { realizarLoginSilencioso } from "@/features/festividades/api/auth.api";

export function AuthBootstrapper({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    realizarLoginSilencioso()
      .then(() => {
        setCarregando(false);
      })
      .catch(() => {
        setErro(true);
        setCarregando(false);
      });
  }, []);

  // Se o login der erro (backend fora, senha errada), mostra essa tela amigável
  if (erro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F6F8] font-sans">
        <div className="text-center p-8 bg-white rounded-2xl shadow-[0_4px_16px_rgba(145,158,171,0.06)] border border-[#919eab]/24 max-w-sm">
          <h2 className="text-[16px] font-extrabold text-[#FF5630]">Falha de Segurança</h2>
          <p className="text-[13px] text-[#637381] mt-2 font-medium">
            Não foi possível estabelecer uma conexão autenticada com o servidor.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-5 py-2.5 bg-[#08325c] text-white text-[12px] font-bold rounded-lg hover:bg-[#0b427a] transition-all shadow-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Enquanto está autenticando "por debaixo dos panos", mostra o loading
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08325c]"></div>
      </div>
    );
  }

  // Login concluído com sucesso, libera a renderização do site!
  return <>{children}</>;
}