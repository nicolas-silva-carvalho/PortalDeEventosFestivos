import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  ExternalLink,
  X,
  Home,
  Info,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { CustomTooltip } from "../ui/custom-tooltip";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  const handleInicioClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`w-full sticky top-0 z-40 transition-all duration-300 font-sans ${"bg-white/95 backdrop-blur-md border-b border-[#919eab]/20 shadow-[0px_2px_10px_rgba(0,0,0,0.04)]"}`}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#08325c] via-[#1a5a9c] to-[#08325c] relative z-40"></div>
        <div className="flex h-[72px] items-center justify-between px-5 md:px-12 w-full mx-auto max-w-[1300px]">
          <div className="flex items-center gap-4 relative z-40">
            <Link
              to="/"
              onClick={handleInicioClick}
              className="inline-block max-h-[48px] py-1 transition-opacity hover:opacity-80"
            >
              <img
                src="/TCE_LOGO HORIZONTAL (1).png"
                alt="Tribunal de Contas do Estado do Ceará"
                width={150}
                height={45}
                className="object-contain w-[130px] sm:w-[150px]"
              />
            </Link>
            <div className="h-6 w-px bg-[#919eab]/30 hidden sm:inline-block"></div>
            <span className="text-[#08325c] font-bold text-sm md:text-[16px] tracking-tight hidden sm:inline-block">
              Portal de Eventos Festivos
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-[14px] font-semibold text-[#637381]">
            <Link
              to="/"
              onClick={handleInicioClick}
              className={`transition-colors relative py-6 ${
                pathname === "/"
                  ? "text-[#08325c] after:absolute after:bottom-[0px] after:left-0 after:w-full after:h-[3px] after:bg-[#08325c] after:rounded-t-md"
                  : "hover:text-[#08325c]"
              }`}
            >
              Início
            </Link>
            <Link
              to="/sobre"
              className={`hover:text-[#08325c] py-6 transition-colors relative ${
                pathname === "/sobre"
                  ? "text-[#08325c] after:absolute after:bottom-[0px] after:left-0 after:w-full after:h-[3px] after:bg-[#08325c] after:rounded-t-md"
                  : ""
              }`}
            >
              Sobre o Portal
            </Link>
            <Link
              to="/legislacao"
              className={`hover:text-[#08325c] py-6 transition-colors relative ${
                pathname === "/legislacao"
                  ? "text-[#08325c] after:absolute after:bottom-[0px] after:left-0 after:w-full after:h-[3px] after:bg-[#08325c] after:rounded-t-md"
                  : ""
              }`}
            >
              Legislação & Guias
            </Link>
            <div className="h-4 w-px bg-[#919eab]/30"></div>
            <CustomTooltip
              content="Fazer uma denúncia no TCE"
              position="bottom"
            >
              <a
                href="https://www.tce.ce.gov.br/ouvidoria/contate-a-ouvidoria"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#08325c] font-bold hover:text-[#1a5a9c] transition-colors"
              >
                Ouvidoria <ExternalLink size={14} />
              </a>
            </CustomTooltip>
          </nav>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 text-[#212b36] hover:bg-[#F4F6F8] rounded-lg transition-colors outline-none relative z-40"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>
      <div
        className={`md:hidden fixed inset-0 bg-[#212b36]/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl z-[110] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#dfe3e8] h-[63px]">
          <div className="flex items-center gap-2">
            <img
              src="/TCE_LOGo_icone.png"
              alt="TCE Ceará"
              width={33}
              height={33}
              className="object-contain shrink-0"
            />
            <span className="text-[#08325c] font-extrabold text-[12px] tracking-tight leading-tight">
              Portal de <br /> Eventos Festivos
            </span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 text-[#637381] hover:bg-[#F4F6F8] hover:text-[#212b36] rounded-md transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-5 px-4 flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#919eab] mb-1.5 px-2">
            Navegação
          </span>

          <Link
            to="/"
            onClick={handleInicioClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              pathname === "/"
                ? "bg-[#08325c]/5 text-[#08325c]"
                : "text-[#637381] hover:bg-[#F4F6F8] hover:text-[#212b36]"
            }`}
          >
            <Home
              size={18}
              className={pathname === "/" ? "text-[#08325c]" : "text-[#919eab]"}
            />
            Início
          </Link>
          <Link
            to="/sobre"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              pathname === "/sobre"
                ? "bg-[#08325c]/5 text-[#08325c]"
                : "text-[#637381] hover:bg-[#F4F6F8] hover:text-[#212b36]"
            }`}
          >
            <Info
              size={18}
              className={
                pathname === "/sobre" ? "text-[#08325c]" : "text-[#919eab]"
              }
            />
            Sobre o Portal
          </Link>
          <Link
            to="/legislacao"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              pathname === "/legislacao"
                ? "bg-[#08325c]/5 text-[#08325c]"
                : "text-[#637381] hover:bg-[#F4F6F8] hover:text-[#212b36]"
            }`}
          >
            <BookOpen
              size={18}
              className={
                pathname === "/legislacao" ? "text-[#08325c]" : "text-[#919eab]"
              }
            />
            Legislação & Guias
          </Link>
          <div className="h-px w-full bg-[#dfe3e8] mt-1 mb-1.5"></div>
          <a
            href="https://www.tce.ce.gov.br/ouvidoria/contate-a-ouvidoria"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-bold text-[#637381] hover:bg-[#F4F6F8] hover:text-[#212b36] transition-all"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-[#919eab]" />
              Ouvidoria TCE
            </div>
            <ExternalLink size={15} className="text-[#919eab]" />
          </a>
        </div>
      </div>
    </>
  );
}
