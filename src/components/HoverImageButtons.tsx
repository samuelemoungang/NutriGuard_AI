'use client';

import { useState, useEffect } from 'react';

interface HoverImageButton {
  id: string;
  imageUrl: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
}

interface HoverImageButtonsProps {
  buttons?: HoverImageButton[];
}

// Posizioni predefinite: 5 bottoni a sinistra e 5 a destra, allineati verticalmente
const defaultPositions: Array<{ top?: string; bottom?: string; left?: string; right?: string }> = [
  // 5 bottoni a SINISTRA (allineati verticalmente)
  { top: '10%', left: '3%' },
  { top: '25%', left: '3%' },
  { top: '40%', left: '3%' },
  { top: '55%', left: '3%' },
  { top: '70%', left: '3%' },
  // 5 bottoni a DESTRA (allineati verticalmente)
  { top: '10%', right: '3%' },
  { top: '25%', right: '3%' },
  { top: '40%', right: '3%' },
  { top: '55%', right: '3%' },
  { top: '70%', right: '3%' },
];

// ============================================
// CONFIGURAZIONE IMMAGINI
// ============================================
// 
// STEP 1: Aggiungi le tue immagini nella cartella:
//    public/images/
//
// STEP 2: Modifica i path qui sotto con i nomi delle tue immagini
//    Esempio: se la tua immagine si chiama "food-1.jpg"
//    cambia: imageUrl: '/images/food-1.jpg'
//
// ============================================

const defaultButtons: HoverImageButton[] = [
  // 5 BOTTONI A SINISTRA (allineati verticalmente)
  {
    id: 'hover-btn-1',
    imageUrl: '/images/hover-1.jpg', // Immagine Getting Started with Roboflow
    position: { top: '10%', left: '3%' },
  },
  {
    id: 'hover-btn-2',
    imageUrl: '/images/Entrypage_FLOWISE.png', // Immagine Flowchart Roboflow YOLOv
    position: { top: '25%', left: '3%' },
  },
  {
    id: 'hover-btn-3',
    imageUrl: '/images/Flowchart Roboflow YOLOv8.png', // Immagine Code of Signal Processing
    position: { top: '40%', left: '3%' },
  },
  {
    id: 'hover-btn-4',
    imageUrl: '/images/Code of SignalProcessing.png', // 👈 CAMBIA QUESTO
    position: { top: '55%', left: '3%' },
  },
  {
    id: 'hover-btn-5',
    imageUrl: '/images/Quality classification Agent.png', // 👈 CAMBIA QUESTO
    position: { top: '70%', left: '3%' },
  },
  // 5 BOTTONI A DESTRA (allineati verticalmente)
  {
    id: 'hover-btn-6',
    imageUrl: '/images/hover-6.jpg', // 👈 CAMBIA QUESTO
    position: { top: '10%', right: '3%' },
  },
  {
    id: 'hover-btn-7',
    imageUrl: '/images/hover-7.jpg', // 👈 CAMBIA QUESTO
    position: { top: '25%', right: '3%' },
  },
  {
    id: 'hover-btn-8',
    imageUrl: '/images/hover-8.jpg', // 👈 CAMBIA QUESTO
    position: { top: '40%', right: '3%' },
  },
  {
    id: 'hover-btn-9',
    imageUrl: '/images/hover-9.jpg', // 👈 CAMBIA QUESTO
    position: { top: '55%', right: '3%' },
  },
  {
    id: 'hover-btn-10',
    imageUrl: '/images/CODE QR.png', // 👈 CAMBIA QUESTO
    position: { top: '70%', right: '3%' },
  },
];

export default function HoverImageButtons({ buttons = defaultButtons }: HoverImageButtonsProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {buttons.map((button) => (
        <div
          key={button.id}
          className="absolute pointer-events-auto cursor-pointer group"
          style={{
            top: button.position.top,
            bottom: button.position.bottom,
            left: button.position.left,
            right: button.position.right,
            width: '32px',
            height: '32px',
            transform: 'translate(-50%, -50%)',
          }}
          onMouseEnter={() => {
            setHoveredButton(button.id);
          }}
          onMouseLeave={() => {
            setHoveredButton(null);
          }}
        >
          {/* Bottone discreto - area cliccabile più grande */}
          <div
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-5 h-5 sm:w-6 sm:h-6 rounded-full
              bg-slate-700/70 hover:bg-slate-600/90
              border-2 border-slate-500/60 hover:border-cyan-500/50
              transition-all duration-300 ease-out
              ${hoveredButton === button.id ? 'scale-150 bg-cyan-500/50 ring-4 ring-cyan-500/30' : 'scale-100'}
            `}
            title={`Hover button ${button.id}`}
          />

        </div>
      ))}
      
      {/* Container separato per le immagini al centro - renderizzato fuori dal loop */}
      {hoveredButton && buttons.find(b => b.id === hoveredButton) && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            pointerEvents: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          <div
            className="relative"
            style={{
              animation: 'expandImage 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <img
              src={buttons.find(b => b.id === hoveredButton)!.imageUrl}
              alt="Hover image"
              className="rounded-xl shadow-2xl border-2 border-slate-700/50"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: 'min(90vw, 600px)',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e) => {
                console.error('Image load error:', buttons.find(b => b.id === hoveredButton)!.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Glow effect */}
            <div
              className="absolute rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-100 -z-10 blur-xl"
              style={{
                top: '-20px',
                left: '-20px',
                right: '-20px',
                bottom: '-20px',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
