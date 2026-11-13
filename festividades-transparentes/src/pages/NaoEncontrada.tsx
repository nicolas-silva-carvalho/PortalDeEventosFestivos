import {Link} from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#F4F6F8] flex flex-col items-center justify-center p-6 font-sans text-center animate-in fade-in duration-500">
      <h1 className="text-[120px] md:text-[180px] font-black text-[#08325c] leading-none tracking-tighter drop-shadow-sm mb-2">
        404
      </h1>
      <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#212B36] mb-3 tracking-tight">
        Página não encontrada
      </h2>
      <p className="text-[14px] md:text-[16px] text-[#637381] font-medium mb-10 max-w-md leading-relaxed">
        O link que tentou aceder não existe, foi movido ou está temporariamente
        indisponível. Verifique o endereço digitado.
      </p>
      <Link
        to="/"
        className="flex items-center justify-center gap-2 bg-[#08325c] text-white font-bold text-[14px] px-8 py-3.5 rounded-xl transition-all duration-300 hover:bg-[#052240] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(8,50,92,0.25)] w-full sm:w-auto"
      >
        <Home size={18} strokeWidth={2.5} />
        Voltar ao Início
      </Link>
    </div>
  );
}
