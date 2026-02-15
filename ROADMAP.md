# 🦄 Emis Einhorn-Welt - Entwicklungsplan

## Zielgruppe
- **Emi, 4 Jahre alt**
- Einfach, langsam, große Targets
- Belohnend, nicht frustrierend
- **Pädagogisch wertvoll** (inspiriert von Montessori, Jesper Juul)

---

## ✅ Phase 1: Basis-Spiel (DONE)
- [x] Bubble-Pop Mechanik
- [x] Langsame Items (12-16s Fallzeit)
- [x] Große Items (85-110px)
- [x] Kinderfreundliche Items (Einhörner, Tiere, Süßigkeiten, etc.)
- [x] Punkte-System
- [x] Touch/Click Steuerung
- [x] Mobile-kompatibel
- [x] GitHub Pages deployed

## ✅ Phase 2: Sammeln & Belohnung (DONE)
- [x] Sticker-Sammlung (beim Fangen neuer Items)
- [x] Album-Ansicht mit Namen
- [x] Toast-Benachrichtigung (nicht störend)
- [x] Combo-System (3+ schnelle Fänge = Multiplikator)
- [x] Boss-Einhorn (5 Treffer, 20 Punkte)

## ✅ Phase 3: Kamera-Steuerung (DONE)
- [x] MediaPipe Hand-Tracking
- [x] Mode-Auswahl (Touch vs Kamera) - nur Desktop
- [x] **Kleine Kamera-Vorschau** (140x105px in der Ecke)
- [x] Hand-Cursor (✨) zeigt Position mit größerer Hitbox
- [x] Kamera-Feed NICHT fullscreen

## ✅ Phase 4: Spielmodi (DONE)
- [x] **Modus-Auswahl** auf Startscreen (2x2 Grid)
- [x] **🌈 Entdecken**: Freies Spielen, alle Items
- [x] **🎨 Farben**: "Finde alle roten Sachen!" (7 Farbgruppen)
- [x] **🔢 Zählen**: Items zählen (3-6), große Zählanzeige
- [x] **🐾 Tiere**: Tiernamen lernen (12 Tiere)
- [x] Modus-spezifische Item-Sets
- [x] Sanftes Wobble bei "falschem" Item (keine Bestrafung!)
- [x] Celebration mit Confetti bei erreichten Zielen

## ✅ Phase 5: Audio (DONE)
- [x] Sanfte Sound-Effekte (Pop, Combo, Boss)
- [x] Celebration-Melodie
- [x] "Falsch"-Sound ist sanft (Dreieck-Ton, nicht frustrierend)
- [x] **KEINE Computer-Stimme** ✓

## 📋 Phase 6: Polish (PLANNED)
- [ ] Mehr Tiere (Bauernhof, Zoo, Wald)
- [ ] Schwierigkeitsgrade (langsamer/schneller)
- [ ] Partikel-Effekte verbessern
- [ ] Achievements?
- [ ] Fortschritts-Speicherung pro Modus

---

## Pädagogische Prinzipien

### Montessori
- **Selbstständiges Entdecken**: Kind wählt Modus
- **Keine externen Belohnungen überbetonen**: Freude am Tun
- **Wiederholung ohne Druck**: Items können verpasst werden
- **Natürliches Lernen**: Tiernamen erscheinen auch bei "falscher" Wahl

### Jesper Juul
- **Intrinsische Motivation**: Keine Strafen, kein Versagen
- **Kind ernst nehmen**: Große, langsame Targets
- **Gleichwürdigkeit**: Sanftes Wobble statt "Falsch!"

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
│  │ Kind │    (140x105px)            │
│  └──────┘                           │
└─────────────────────────────────────┘
```

### Farbgruppen
- 🔴 Rot: 🍎 ❤️ 🍓 🌹 🎈
- 🟠 Orange: 🍊 🥕 🧡 🏀 🦊
- 🟡 Gelb: ⭐ 🌻 🍋 💛 🌟 👑
- 🟢 Grün: 🍀 🥒 🐸 💚 🌲 🥦
- 🔵 Blau: 💙 🦋 🐳 💎 🧢
- 🟣 Lila: 💜 🍇 🔮 🦄 ☂️
- 💗 Pink: 🌸 🎀 💗 🧁 🦩

### Tiere
🐶 Hund, 🐱 Katze, 🐰 Hase, 🐻 Bär, 🦊 Fuchs, 🐸 Frosch,
🐷 Schwein, 🐮 Kuh, 🦁 Löwe, 🐘 Elefant, 🦒 Giraffe, 🐧 Pinguin
