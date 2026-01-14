# Setup Bottoni Hover con Immagini

## 📋 Panoramica

Sono stati aggiunti 10 bottoni discreti nella pagina che mostrano immagini quando ci passi il mouse sopra. I bottoni hanno un colore simile al fondo per non essere troppo appariscenti.

## 🎨 Caratteristiche

- **10 bottoni** distribuiti strategicamente sulla pagina
- **Colore discreto** (slate-800/40) che si integra con il fondo
- **Animazione fluida** quando il mouse passa sopra
- **Immagine che si espande** con effetto di glow
- **Responsive** - funziona su mobile e desktop

## 📝 Come Aggiungere le Tue Immagini

### Step 1: Prepara le Immagini

1. Prepara 10 immagini (formati supportati: JPG, PNG, WEBP)
2. Dimensioni consigliate: **800x800px** o superiore (quadrate funzionano meglio)
3. Ottimizza le immagini per il web (usa strumenti come TinyPNG)

### Step 2: Aggiungi le Immagini al Progetto

1. Crea una cartella `public/images/` se non esiste già
2. Aggiungi le tue immagini nella cartella `public/images/`
3. Nomina le immagini come preferisci (es: `hover-1.jpg`, `hover-2.jpg`, ecc.)

### Step 3: Configura i Path delle Immagini

Apri il file `src/components/HoverImageButtons.tsx` e modifica l'array `defaultButtons`:

```typescript
const defaultButtons: HoverImageButton[] = defaultPositions.map((pos, index) => ({
  id: `hover-btn-${index + 1}`,
  imageUrl: `/images/tua-immagine-${index + 1}.jpg`, // Sostituisci con i tuoi path
  position: pos,
}));
```

**Esempio completo:**

```typescript
const defaultButtons: HoverImageButton[] = [
  {
    id: 'hover-btn-1',
    imageUrl: '/images/food-safety-1.jpg',
    position: { top: '10%', left: '5%' },
  },
  {
    id: 'hover-btn-2',
    imageUrl: '/images/food-safety-2.jpg',
    position: { top: '20%', right: '8%' },
  },
  // ... aggiungi gli altri 8 bottoni
];
```

### Step 4: Personalizza le Posizioni (Opzionale)

Se vuoi cambiare le posizioni dei bottoni, modifica l'array `defaultPositions`:

```typescript
const defaultPositions = [
  { top: '10%', left: '5%' },      // In alto a sinistra
  { top: '20%', right: '8%' },    // In alto a destra
  { bottom: '15%', left: '4%' },  // In basso a sinistra
  // ... ecc.
];
```

## 🎯 Personalizzazione Avanzata

### Cambiare il Numero di Bottoni

Per avere più o meno di 10 bottoni:

1. Modifica l'array `defaultPositions` aggiungendo o rimuovendo posizioni
2. Aggiorna l'array `defaultButtons` di conseguenza

### Cambiare Colore dei Bottoni

Nel file `HoverImageButtons.tsx`, modifica le classi CSS:

```typescript
// Bottone normale
bg-slate-800/40 hover:bg-slate-700/60

// Per renderlo più scuro
bg-slate-900/50 hover:bg-slate-800/70

// Per renderlo più chiaro
bg-slate-700/30 hover:bg-slate-600/50
```

### Cambiare Dimensione delle Immagini

Modifica le classi `w-` e `h-` nell'elemento `<img>`:

```typescript
// Dimensioni attuali
w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96

// Per immagini più piccole
w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64

// Per immagini più grandi
w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem]
```

### Cambiare Velocità dell'Animazione

Modifica la durata delle transizioni:

```typescript
// Animazione più veloce (300ms)
transition-all duration-300

// Animazione più lenta (1000ms)
transition-all duration-1000
```

## 🎨 Effetti Disponibili

- **Scale Animation**: L'immagine si espande da 0 a 1
- **Fade In**: Opacità da 0 a 100
- **Glow Effect**: Effetto di bagliore quando hover
- **Rotate**: Leggera rotazione durante l'animazione
- **Brightness**: Aumento della luminosità quando hover

## 📱 Responsive Design

I bottoni sono completamente responsive:
- **Mobile**: Bottoni più piccoli (3x3 o 4x4)
- **Tablet**: Dimensioni medie
- **Desktop**: Dimensioni complete

## 🐛 Troubleshooting

### Le immagini non appaiono

1. Verifica che i path siano corretti (devono iniziare con `/`)
2. Controlla che le immagini siano nella cartella `public/images/`
3. Verifica la console del browser per errori 404

### I bottoni non sono visibili

1. I bottoni sono volutamente discreti
2. Prova a passare il mouse nelle aree dove dovrebbero essere
3. Se necessario, aumenta l'opacità nel codice

### Le animazioni sono troppo lente/veloci

Modifica la durata delle transizioni nel codice (vedi sezione "Personalizzazione Avanzata")

## ✅ Checklist

- [ ] Ho preparato 10 immagini
- [ ] Ho aggiunto le immagini in `public/images/`
- [ ] Ho aggiornato i path in `HoverImageButtons.tsx`
- [ ] Ho testato su desktop
- [ ] Ho testato su mobile
- [ ] Le animazioni funzionano correttamente
