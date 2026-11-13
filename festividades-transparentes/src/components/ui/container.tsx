// src/components/ui/container.tsx
import type { ElementType, ReactNode } from "react";

const LARGURAS = {
  sm: "max-w-[1000px]",
  md: "max-w-[1100px]",
  lg: "max-w-[1200px]",
  xl: "max-w-[1300px]",
} as const;

interface ContainerProps {
  children: ReactNode;
  size?: keyof typeof LARGURAS;
  className?: string;
  as?: ElementType;
}

// Margem lateral padrão de TODA a página. Pra ajustar o espaçamento no
// futuro, muda só aqui — não precisa mexer em cada componente.
const PADDING_LATERAL = "px-6 md:px-10 lg:px-14";

export function Container({ children, size = "lg", className = "", as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={`w-full ${LARGURAS[size]} mx-auto ${PADDING_LATERAL} ${className}`}>
      {children}
    </Tag>
  );
}