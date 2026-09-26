import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  MinusIcon,
  PlusIcon,
  RulerIcon } from
'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface DetectionMarker {
  id: string;
  /** Percentage position within the sheet. */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
}

export interface Sheet {
  id: string;
  code: string;
  title: string;
  image: string;
  markers: DetectionMarker[];
}

/**
 * Construction drawing viewer for the takeoff workspace: sheet navigation,
 * zoom, pan and the AI's detection regions drawn over the sheet. Selecting a
 * material highlights the region it was measured from.
 */
export function BlueprintViewer({
  sheets,
  sheetIndex,
  onSheetChange,
  activeMarkerId,
  onMarkerSelect,
  className







}: {sheets: Sheet[];sheetIndex: number;onSheetChange: (index: number) => void;activeMarkerId?: string | null;onMarkerSelect?: (markerId: string) => void;className?: string;}) {
  const sheet = sheets[sheetIndex];
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{x: number;y: number;ox: number;oy: number;} | null>(null);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [sheetIndex]);

  const clampZoom = (z: number) => Math.min(3, Math.max(1, Number(z.toFixed(2))));

  return (
    <div className={twMerge('flex min-h-0 flex-col border border-ink-100 bg-white', className)}>
      {/* Sheet navigator — reads like a drawing index, not a file list. */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => onSheetChange(Math.max(0, sheetIndex - 1))}
            disabled={sheetIndex === 0}
            aria-label="Previous sheet"
            className="rounded-[3px] border border-ink-200 bg-white p-1 text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600 disabled:opacity-40">
            
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>
          <div className="min-w-0">
            <p className="measure text-[12px] font-bold text-ink-900">{sheet.code}</p>
            <p className="truncate text-[11px] text-ink-400">{sheet.title}</p>
          </div>
          <button
            onClick={() => onSheetChange(Math.min(sheets.length - 1, sheetIndex + 1))}
            disabled={sheetIndex === sheets.length - 1}
            aria-label="Next sheet"
            className="rounded-[3px] border border-ink-200 bg-white p-1 text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600 disabled:opacity-40">
            
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="measure hidden text-[10.5px] text-ink-400 sm:inline">
            {sheetIndex + 1}/{sheets.length}
          </span>
          <div className="flex items-center rounded-[3px] border border-ink-200 bg-white">
            <button
              onClick={() => setZoom((z) => clampZoom(z - 0.25))}
              aria-label="Zoom out"
              className="px-1.5 py-1 text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
              
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="measure w-9 border-x border-ink-200 py-1 text-center text-[10.5px] font-semibold text-ink-600">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => clampZoom(z + 0.25))}
              aria-label="Zoom in"
              className="px-1.5 py-1 text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
              
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            aria-label="Fit sheet to view"
            className="rounded-[3px] border border-ink-200 bg-white p-1 text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
            
            <MaximizeIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Drawing surface. */}
      <div
        className="blueprint reg-marks relative min-h-[320px] flex-1 cursor-grab overflow-hidden text-white/25 active:cursor-grabbing"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setOffset({
            x: drag.current.ox + (e.clientX - drag.current.x),
            y: drag.current.oy + (e.clientY - drag.current.y)
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
        }}>
        
        <div
          className="absolute inset-0 origin-center transition-transform duration-200 ease-smooth"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
          
          <img
            src={sheet.image}
            alt={`Sheet ${sheet.code} — ${sheet.title}`}
            className="h-full w-full object-contain mix-blend-screen opacity-90"
            draggable={false} />
          

          {sheet.markers.map((m) => {
            const active = activeMarkerId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onMarkerSelect?.(m.id)}
                aria-label={`Detection region for ${m.label}, ${m.confidence}% confidence`}
                className={twMerge(
                  'absolute rounded-[2px] border-2 transition-colors duration-150 ease-smooth',
                  active ?
                  'border-brand-400 bg-brand-500/25' :
                  'border-info-500/70 bg-info-500/10 hover:border-brand-300'
                )}
                style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, height: `${m.h}%` }}>
                
                <span
                  className={twMerge(
                    /* Capped so a long object tag cannot run past the sheet edge. */
                    'measure absolute -top-[18px] left-0 max-w-[160px] truncate px-1 text-[9.5px] font-bold',
                    active ? 'bg-brand-500 text-white' : 'bg-info-500/80 text-white'
                  )}>
                  
                  {m.label}
                </span>
              </button>);

          })}
        </div>

        {/* Scale bar, as printed on a drawing. */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 bg-ink-900/70 px-2 py-1">
          <RulerIcon className="h-3 w-3 text-white/60" aria-hidden />
          <span className="measure text-[10px] text-white/70">SCALE 1/4&quot; = 1&apos;-0&quot;</span>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 bg-ink-900/70 px-2 py-1">
          <span className="measure text-[10px] text-white/70">
            {sheet.markers.length} detections on this sheet
          </span>
        </div>
      </div>
    </div>);

}