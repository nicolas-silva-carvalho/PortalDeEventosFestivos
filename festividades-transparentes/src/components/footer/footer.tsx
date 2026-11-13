import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full font-sans border-t border-dashed border-[#919eab]/30 flex flex-col bg-white">
      <div className="w-full max-w-[1300px] mx-auto px-6 md:px-12 py-12 flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-8">
          <div className="flex flex-col gap-5 w-full lg:w-2/3">
            <h3 className="text-[16px] font-extrabold text-[#0D4881] tracking-tight">
              Tribunal de Contas do Estado do Ceará
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[#212B36]">Endereço</span>
                <p className="text-[#637381] leading-relaxed">
                  Rua Sena Madureira, 1047 — Centro
                  <br />
                  Fortaleza, CE — CEP: 60055-080
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[#212B36]">
                  Horário de Funcionamento
                </span>
                <p className="text-[#637381]">
                  Segunda a sexta-feira, das 8h às 17h
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[#212B36]">Telefone</span>
                <p className="text-[#637381]">(85) 3125-8365</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[#212B36]">E-mail</span>
                <a
                  href="mailto:carnaval.transparente@tce.ce.gov.br"
                  className="text-[#0D4881] hover:underline font-medium"
                >
                  carnaval.transparente@tce.ce.gov.br
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full lg:w-1/3 lg:items-end">
            <span className="text-[13px] font-bold text-[#212B36]">
              Redes Sociais
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.tce.ce.gov.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#F4F6F8] hover:bg-[#0D4881] text-[#637381] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                title="Site Oficial"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/tceceara"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#F4F6F8] hover:bg-[#0D4881] text-[#637381] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/tceceara/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#F4F6F8] hover:bg-[#0D4881] text-[#637381] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/tceceara"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#F4F6F8] hover:bg-[#0D4881] text-[#637381] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="w-full h-[200px] md:h-[240px] rounded-2xl overflow-hidden shadow-[0px_2px_8px_rgba(0,0,0,0.06)] border border-[#919eab]/20 relative bg-[#F4F6F8] block mt-2">
          <iframe
            title="Localização TCE Ceará"
            src="https://www.google.com/maps?q=Tribunal+de+Contas+do+Estado+do+Cear%C3%A1,+Fortaleza,+CE&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
      <div className="w-full py-10 mt-auto relative overflow-hidden bg-[#08325c]">
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(107,174,214,0.25), transparent 45%), radial-gradient(ellipse at bottom left, rgba(14,91,139,0.4), transparent 40%), linear-gradient(135deg, #020d1c 0%, #08325c 40%, #0a3c6e 75%, #03182e 100%)",
          }}
        />
        <div className="w-full max-w-[1300px] mx-auto px-6 md:px-12 flex flex-col items-center justify-center relative z-10">
          <img
            src="/logo_tce.png"
            alt="Logo Tribunal de Contas do Estado do Ceará"
            width={280}
            height={80}
            className="object-contain filter invert brightness-0 opacity-90 hover:opacity-100 hover:scale-[1.02] transition-all duration-300"
          />
          <p className="text-[11px] text-blue-100/60 font-bold mt-5 tracking-widest uppercase text-center">
            © {new Date().getFullYear()} TCE-CE • Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
