"use client";

import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, Home } from "lucide-react";
import { slugify } from "@/lib/slugify";
import { useMemo, useEffect, useRef } from "react";

function MapController({ corForte }: { corForte: string }) {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col bg-white rounded-xl shadow-[0px_2px_10px_rgba(0,0,0,0.04)] border border-[#919eab]/20 overflow-hidden">
      <button onClick={(e) => { e.stopPropagation(); map.zoomIn(); }} className="p-2.5 hover:bg-[#F4F6F8] text-[#637381] transition-colors border-b border-[#919eab]/20" title="Aumentar Zoom">
        <Plus className="w-4 h-4" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); map.zoomOut(); }} className="p-2.5 hover:bg-[#F4F6F8] text-[#637381] transition-colors border-b border-[#919eab]/20" title="Diminuir Zoom">
        <Minus className="w-4 h-4" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); map.flyTo([-5.3, -39.3], 7.2, { duration: 1.5 }); }} className="p-2.5 hover:bg-[#F4F6F8] text-[#637381] transition-colors" title="Resetar Zoom (Padrão)">
        <Home className="w-4 h-4" />
      </button>
    </div>
  );
}

function MapZoomController({ municipioSelecionado, geoJsonRef }: { municipioSelecionado: string | null | undefined, geoJsonRef: any }) {
  const map = useMap();
  const prevSelection = useRef(municipioSelecionado);

  useEffect(() => {
    if (prevSelection.current === municipioSelecionado) return;
    
    prevSelection.current = municipioSelecionado;

    const timer = setTimeout(() => {
      if (!geoJsonRef.current) return;

      if (municipioSelecionado) {
        const layers = geoJsonRef.current.getLayers();
        const selectedLayer = layers.find((layer: any) => {
          const nome = layer.feature?.properties?.name || layer.feature?.properties?.NOME || layer.feature?.properties?.nome || "";
          return nome === municipioSelecionado;
        });

        if (selectedLayer) {
          map.flyToBounds(selectedLayer.getBounds(), { padding: [40, 40], duration: 1.5 });
        }
      } else {
        map.flyTo([-5.3, -39.3], 7.2, { duration: 1.5 });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [municipioSelecionado, map, geoJsonRef]);

  return null;
}

interface MapViewProps {
  geoData: any;
  valoresPorMunicipio: Record<string, number>;
  escala: { min: number; cor: string; label: string; textColor: string }[];
  municipioSelecionadoMapa?: string | null; 
  onCityClick?: (nomeMunicipio: string) => void;
}

function nomeMunicipio(feature: any): string {
  return feature?.properties?.name || feature?.properties?.NOME || feature?.properties?.nome || "";
}

export default function MapView({ geoData, valoresPorMunicipio, escala, municipioSelecionadoMapa, onCityClick }: MapViewProps) {
  const corForte = escala[0]?.cor || "#08325c";
  const geoJsonRef = useRef<any>(null);

  const getFeatureStyle = (feature?: any) => {
    const nome = nomeMunicipio(feature) || "Município";
    const valor = valoresPorMunicipio[slugify(nome)] ?? 0;
    const isSelected = municipioSelecionadoMapa === nome;
    
    let fillColor = escala[escala.length - 1]?.cor || "#F0F3F7";
    for (const tier of escala) {
      if (valor >= tier.min) {
        fillColor = tier.cor;
        break;
      }
    }
    
    return {
      fillColor,
      weight: isSelected ? 3.5 : 0.8,
      opacity: 1,
      color: isSelected ? "#FF5630" : "#212B36",
      fillOpacity: isSelected ? 1 : (valor > 0 ? 0.9 : 0.4),
    };
  };

  if (!geoData) return null;

  const mapKey = useMemo(() => {
    return corForte + JSON.stringify(valoresPorMunicipio) + municipioSelecionadoMapa;
  }, [corForte, valoresPorMunicipio, municipioSelecionadoMapa]);

  return (
    <MapContainer
      center={[-5.3, -39.3]}
      zoom={7.2}
      scrollWheelZoom={true}
      dragging={true}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%", background: "transparent", borderRadius: "12px", zIndex: 0 }}
    >
      <MapController corForte={corForte} />
      
      <MapZoomController municipioSelecionado={municipioSelecionadoMapa} geoJsonRef={geoJsonRef} />

      <GeoJSON
        ref={geoJsonRef}
        key={mapKey}
        data={geoData}
        style={getFeatureStyle as any}
        onEachFeature={(feature, layer: any) => {
          const nome = nomeMunicipio(feature) || "Município";
          const valor = valoresPorMunicipio[slugify(nome)] ?? 0;
          const valorFormatado =
            valor > 0 ? valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00";

          const tooltipHtml = `
            <div style="background-color: #ffffff; border: 1px solid rgba(145, 158, 171, 0.24); box-shadow: 0px 8px 24px rgba(145, 158, 171, 0.16); border-radius: 12px; padding: 12px 16px; font-family: ui-sans-serif, system-ui, sans-serif; min-width: max-content;">
              <div style="font-size: 15px; font-weight: 800; color: ${corForte}; margin-bottom: 8px;">
                ${nome}
              </div>
              <div style="font-size: 13px; color: #637381; display: flex; align-items: center; gap: 6px;">
                gastou 
                <span style="background-color: #F4F6F8; color: ${corForte}; font-weight: 800; padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(145, 158, 171, 0.12); letter-spacing: -0.3px;">
                  ${valorFormatado}
                </span>
              </div>
            </div>
          `;

          layer.bindTooltip(tooltipHtml, { 
            sticky: true, 
            direction: "top", 
            className: "!bg-transparent !border-0 !shadow-none !p-0 !m-0" 
          });

          layer.on({
            click: () => {
              if (onCityClick) onCityClick(nome);
            },
          });
        }}
      />
    </MapContainer>
  );
}