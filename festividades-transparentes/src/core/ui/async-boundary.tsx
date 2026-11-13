import { Component, Suspense, type ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { mensagemDeErro } from "@/core/http/api-error";

export function DashboardSkeleton() {
  return (
    <div className="w-full animate-pulse px-4 py-6 md:px-10" aria-busy="true" aria-live="polite">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#919eab]/15" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-[420px] rounded-2xl bg-[#919eab]/15 lg:col-span-2" />
        <div className="h-[420px] rounded-2xl bg-[#919eab]/15" />
      </div>
      <span className="sr-only">Carregando dados…</span>
    </div>
  );
}

export function ErroPainel({ erro, onRetry }: { erro: Error; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="mx-auto my-16 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-[#919eab]/20 bg-white p-8 text-center shadow-sm"
    >
      <AlertTriangle className="text-[#FF5630]" size={32} />
      <h2 className="text-base font-bold text-[#212B36]">Não foi possível carregar os dados</h2>
      <p className="text-sm text-[#637381]">{mensagemDeErro(erro)}</p>
      <button
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#08325c] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        <RefreshCw size={14} /> Tentar novamente
      </button>
    </div>
  );
}

interface BoundaryProps {
  children: ReactNode;
  onReset: () => void;
  fallback: (erro: Error, tentarDeNovo: () => void) => ReactNode;
}

class Boundary extends Component<BoundaryProps, { erro: Error | null }> {
  state: { erro: Error | null } = { erro: null };

  static getDerivedStateFromError(erro: Error) {
    return { erro };
  }

  tentarDeNovo = () => {
    this.props.onReset();
    this.setState({ erro: null });
  };

  render() {
    if (this.state.erro) return this.props.fallback(this.state.erro, this.tentarDeNovo);
    return this.props.children;
  }
}

export function AsyncBoundary({
  children,
  skeleton = <DashboardSkeleton />,
}: {
  children: ReactNode;
  skeleton?: ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Boundary
          onReset={reset}
          fallback={(erro, tentar) => <ErroPainel erro={erro} onRetry={tentar} />}
        >
          <Suspense fallback={skeleton}>{children}</Suspense>
        </Boundary>
      )}
    </QueryErrorResetBoundary>
  );
}
