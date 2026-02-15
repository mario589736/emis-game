# 🦄 Emis Einhorn-Welt - Entwicklungsplan

## Zielgruppe
- **Emi, 4 Jahre alt**
- Einfach, langsam, große Targets
- Belohnend, nicht frustrierend

---

## ✅ Phase 1: Basis-Spiel (DONE)
- [x] Bubble-Pop Mechanik
- [x] Langsame Items (10-15s Fallzeit)
- [x] Große Items (70-120px)
- [x] Kinderfreundliche Items (Einhörner, Tiere, Süßigkeiten, etc.)
- [x] Punkte-System
- [x] Touch/Click Steuerung
- [x] Mobile-kompatibel
- [x] GitHub Pages deployed

## ✅ Phase 2: Sammeln & Belohnung (DONE)
- [x] Sticker-Sammlung (beim Fangen neuer Items)
- [x] Album-Ansicht
- [x] Toast-Benachrichtigung (nicht störend)
- [x] Combo-System (3+ schnelle Fänge = Multiplikator)
- [x] Boss-Einhorn (5 Treffer, 20 Punkte)

## 🔄 Phase 3: Kamera-Steuerung (IN PROGRESS)
- [x] MediaPipe Hand-Tracking
- [x] Mode-Auswahl (Touch vs Kamera) - nur Desktop
- [ ] **Kleine Kamera-Vorschau** (Ecke, nicht Fullscreen!)
- [ ] Hand-Cursor (✨) zeigt Position
- [ ] Kamera-Feed NICHT fullscreen (Kinder sollen nicht sich selbst starren)

## 📋 Phase 4: Spielmodi (PLANNED)
- [ ] **Modus-Auswahl** auf Startscreen
- [ ] **Entdecken**: Freies Spielen, alle Items
- [ ] **Farben**: "Finde alle roten Sachen!"
- [ ] **Zählen**: Items zählen (1, 2, 3...)
- [ ] **Tiere**: Tiernamen lernen
- [ ] Modus-spezifische Item-Sets

## 📋 Phase 5: Audio (PLANNED - optional)
- [ ] Sound-Effekte (Pop, Combo, Boss)
- [ ] Hintergrundmusik (optional, toggle)
- [ ] **KEINE Computer-Stimme** - nur wenn wir echte kindgerechte Stimme haben

## 📋 Phase 6: Polish (PLANNED)
- [ ] Animationen verbessern
- [ ] Partikel-Effekte
- [ ] Achievements?
- [ ] Tägliche Belohnungen?

---

## Technische Notizen

### Kamera-Steuerung
```
┌─────────────────────────────────────┐
│                                     │
│         🎮 SPIELFELD                │
│         (Rainbow Gradient)          │
│                                     │
│    ✨ <- Hand-Cursor                │
│                                     │
│         🦄 🌈 ⭐ <- Items          │
│                                     │
│  ┌──────┐                           │
│  │ 📷   │ <- Kleine Vorschau       │
│  │ Kind │    (optional)             │
│  └──────┘                           │
└─────────────────────────────────────┘
```

### MediaPipe
- Nur auf Desktop (Mobile = Touch only)
- Hand-Tracking Landmark 8 = Zeigefinger-Spitze
- Gespiegelt für natürliches Gefühl
