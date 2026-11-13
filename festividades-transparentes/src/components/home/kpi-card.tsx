"use client";

import type { ElementType } from "react";

interface KpiCardProps {
  titulo: string;
  valor: string | number;
  icone: ElementType;
  cor?: string;
}

export function KpiCard({
  titulo,
  valor,
  icone: Icone,
  cor = "#08325c",
}: KpiCardProps) {
  return (
    <div
      className="
        flex-1
        flex flex-row md:flex-col
        items-center
        justify-center
        gap-3 md:gap-0
        py-3 px-4
        md:py-6 md:px-4
        lg:py-7 lg:px-6
        text-left md:text-center
        group
        transition-colors duration-300
        hover:bg-[#F9FAFB]/50
        cursor-default
      "
    >
      <div
        data-testid="kpi-icone"
        className="
          w-9 h-9
          md:w-12 md:h-12
          lg:w-14 lg:h-14
          shrink-0
          rounded-full
          flex items-center justify-center
          mb-0 md:mb-3 lg:mb-4
          transition-transform duration-300
          group-hover:scale-[1.05]
        "
        style={{
          backgroundColor: `${cor}15`,
          color: cor,
        }}
      >
        <Icone
          className="
            w-4 h-4
            md:w-5 md:h-5
            lg:w-6 lg:h-6
            stroke-[2px]
            transition-transform duration-300
            group-hover:scale-110
          "
        />
      </div>
      <div className="flex flex-col md:items-center">
        <h4
          className="
            text-xl
            md:text-2xl
            lg:text-3xl
            font-extrabold
            text-[#102a43]
            tracking-tight
            mb-0 md:mb-1
            drop-shadow-sm
            transition-transform duration-300
          "
        >
          {valor}
        </h4>
        <p
          className="
            text-[9px]
            md:text-[10px]
            lg:text-[11px]
            font-bold
            text-[#637381]
            uppercase
            tracking-widest
            leading-tight
          "
        >
          {titulo}
        </p>
      </div>
    </div>
  );
}
