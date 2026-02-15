// 🦄 Emis Einhorn-Welt - Pädagogische Version
// Basiert auf Jesper Juul Prinzipien

// === SETTINGS ===
let settings = {
    showScore: false,
    language: 'de-DE'
};

try {
    const saved = localStorage.getItem('emiSettings');
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
} catch(e) {}

// === STATE ===
let currentMode = 'explore';
let points = 0;
let gameActive = false;
let itemInterval = null;
let sessionMemories = new Set();
let lastTouchTime = 0;
let chainCount = 0;
let countingNumber = 0;

// Colors for color mode
const colors = [
    { name: 'rot', css: 'red', hex: '#ff6464' },
    { name: 'blau', css: 'blue', hex: '#6496ff' },
    { name: 'gelb', css: 'yellow', hex: '#ffe664' },
    { name: 'grün', css: 'green', hex: '#64dc64' },
    { name: 'pink', css: 'pink', hex: '#ffb4c8' },
    { name: 'lila', css: 'purple', hex: '#c896ff' },
    { name: 'orange', css: 'orange', hex: '#ffb464' }
];
let targetColor = null;

// Items by mode
const items = {
    explore: [
        { emoji: '🦄', name: 'Einhorn', color: 'pink' },
        { emoji: '🌈', name: 'Regenbogen', color: 'pink' },
        { emoji: '⭐', name: 'Stern', color: 'yellow' },
        { emoji: '☁️', name: 'Wolke', color: 'blue' },
        { emoji: '🌸', name: 'Blume', color: 'pink' },
        { emoji: '🦋', name: 'Schmetterling', color: 'blue' },
        { emoji: '💜', name: 'Herz', color: 'purple' },
        { emoji: '✨', name: 'Glitzer', color: 'yellow' },
        { emoji: '🎀', name: 'Schleife', color: 'pink' },
        { emoji: '👑', name: 'Krone', color: 'yellow' },
    ],
    animals: [
        { emoji: '🐶', name: 'Hund', sound: 'wuff wuff' },
        { emoji: '🐱', name: 'Katze', sound: 'miau' },
        { emoji: '🐮', name: 'Kuh', sound: 'muh' },
        { emoji: '🐷', name: 'Schwein', sound: 'oink oink' },
        { emoji: '🐸', name: 'Frosch', sound: 'quak' },
        { emoji: '🦁', name: 'Löwe', sound: 'roar' },
        { emoji: '🐦', name: 'Vogel', sound: 'piep piep' },
        { emoji: '🦆', name: 'Ente', sound: 'quak quak' },
        { emoji: '🐴', name: 'Pferd', sound: 'wieher' },
        { emoji: '🐑', name: 'Schaf', sound: 'mäh' },
    ],
    feelings: [
        { emoji: '😊', name: 'fröhlich', message: 'Das ist fröhlich!' },
        { emoji: '😢', name: 'traurig', message: 'Das ist traurig.' },
        { emoji: '😮', name: 'überrascht', message: 'Oh, überrascht!' },
        { emoji: '😴', name: 'müde', message: 'Ganz müde...' },
        { emoji: '😄', name: 'glücklich', message: 'So glücklich!' },
        { emoji: '🥰', name: 'verliebt', message: 'Ganz verliebt!' },
        { emoji: '😠', name: 'wütend', message: 'Das ist wütend.' },
        { emoji: '🤗', name: 'liebevoll', message: 'Eine Umarmung!' },
    ],
    shapes: [
        { emoji: '⭐', name: 'Stern', shape: 'star' },
        { emoji: '❤️', name: 'Herz', shape: 'heart' },
        { emoji: '🔵', name: 'Kreis', shape: 'circle' },
        { emoji: '🔷', name: 'Raute', shape: 'diamond' },
        { emoji: '⬛', name: 'Quadrat', shape: 'square' },
        { emoji: '🔺', name: 'Dreieck', shape: 'triangle' },
    ],
    colors: [
        { emoji: '🍎', name: 'Apfel', color: 'red' },
        { emoji: '🍓', name: 'Erdbeere', color: 'red' },
        { emoji: '❤️', name: 'Herz', color: 'red' },
        { emoji: '🔵', name: 'Kreis', color: 'blue' },
        { emoji: '🦋', name: 'Schmetterling', color: 'blue' },
        { emoji: '💧', name: 'Tropfen', color: 'blue' },
        { emoji: '⭐', name: 'Stern', color: 'yellow' },
        { emoji: '🌻', name: 'Sonnenblume', color: 'yellow' },
        { emoji: '🍋', name: 'Zitrone', color: 'yellow' },
        { emoji: '🍀', name: 'Kleeblatt', color: 'green' },
        { emoji: '🐸', name: 'Frosch', color: 'green' },
        { emoji: '🥒', name: 'Gurke', color: 'green' },
        { emoji: '🌸', name: 'Blume', color: 'pink' },
        { emoji: '🦩', name: 'Flamingo', color: 'pink' },
        { emoji: '💜', name: 'Herz', color: 'purple' },
        { emoji: '🍇', name: 'Traube', color: 'purple' },
        { emoji: '🥕', name: 'Karotte', color: 'orange' },
        { emoji: '🏀', name: 'Ball', color: 'orange' },
    ],
    counting: [
        { emoji: '🦄', name: 'Einhorn' },
        { emoji: '⭐', name: 'Stern' },
        { emoji: '🌸', name: 'Blume' },
        { emoji: '🦋', name: 'Schmetterling' },
        { emoji: '💜', name: 'Herz' },
    ]
};

// === DOM ELEMENTS ===
const modeScreen = document.getElementById('mode-screen');
const gameScreen = document.getElementById('game-screen');
const magicArea = document.getElementById('magic-area');
const scoreDisplay = document.getElementById('score');
const pointsDisplay = document.getElementById('points');
const modeIndicator = document.getElementById('mode-indicator');
const colorPrompt = document.getElementById('color-prompt');
const memoryModal = document.getElementById('memory-modal');
const memoryGrid = document.getElementById('memory-grid');
const settingsModal = document.getElementById('settings-modal');
const unicornHelper = document.getElementById('unicorn-helper');

// === AUDIO (Web Speech API) ===
let speechSynth = window.speechSynthesis;

function speak(text, callback) {
    if (!speechSynth) return;
    
    // Cancel any ongoing speech
    speechSynth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.language;
    utterance.rate = 0.8; // Slower for kids
    utterance.pitch = 1.2; // Slightly higher
    
    if (callback) utterance.onend = callback;
    
    speechSynth.speak(utterance);
}

// Simple sound effects
let audioCtx;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playTone(freq, duration = 0.2) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch(e) {}
}

function playHappySound() {
    [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.15), i * 100));
}

function playSuccessSound() {
    [440, 554, 659, 880].forEach((f, i) => setTimeout(() => playTone(f, 0.1), i * 80));
}

// === SPARKLE EFFECTS ===
function createSparkles(x, y, count = 5) {
    const sparkles = ['✨', '⭐', '💫', '🌟'];
    for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        const angle = (i / count) * Math.PI * 2;
        const dist = 30 + Math.random() * 30;
        s.style.left = (x + Math.cos(angle) * dist) + 'px';
        s.style.top = (y + Math.sin(angle) * dist) + 'px';
        magicArea.appendChild(s);
        setTimeout(() => s.remove(), 600);
    }
}

function createChainRing(x, y) {
    const ring = document.createElement('div');
    ring.className = 'chain-ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    magicArea.appendChild(ring);
    setTimeout(() => ring.remove(), 800);
}

// === MODE HANDLERS ===
const modeNames = {
    explore: '✨ Entdecken',
    colors: '🎨 Farben',
    counting: '🔢 Zählen',
    animals: '🐾 Tiere',
    feelings: '💜 Gefühle',
    shapes: '⭐ Formen'
};

function startMode(mode) {
    currentMode = mode;
    gameActive = true;
    points = 0;
    countingNumber = 0;
    sessionMemories.clear();
    
    modeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    modeIndicator.textContent = modeNames[mode];
    pointsDisplay.textContent = '0';
    
    // Show/hide score based on settings
    if (settings.showScore) {
        scoreDisplay.classList.remove('hidden');
    } else {
        scoreDisplay.classList.add('hidden');
    }
    
    // Mode-specific setup
    if (mode === 'colors') {
        pickNewTargetColor();
        colorPrompt.classList.remove('hidden');
    } else {
        colorPrompt.classList.add('hidden');
    }
    
    // Start spawning items
    createItem();
    itemInterval = setInterval(createItem, 2000);
    
    // Schedule helper unicorn (appears after ~30 items)
    setTimeout(maybeShowHelper, 60000);
}

function stopGame() {
    gameActive = false;
    if (itemInterval) {
        clearInterval(itemInterval);
        itemInterval = null;
    }
    
    // Clear all items
    magicArea.querySelectorAll('.magic-item').forEach(el => el.remove());
    
    gameScreen.classList.remove('active');
    modeScreen.classList.add('active');
}

// === COLOR MODE ===
function pickNewTargetColor() {
    targetColor = colors[Math.floor(Math.random() * colors.length)];
    document.getElementById('target-color-name').textContent = targetColor.name;
    document.getElementById('target-color-preview').style.backgroundColor = targetColor.hex;
    
    // Announce
    speak('Finde alle ' + targetColor.name + 'en Sachen!');
}

// === ITEM CREATION ===
function createItem() {
    if (!gameActive) return;
    
    const modeItems = items[currentMode] || items.explore;
    let item;
    
    if (currentMode === 'colors') {
        // In color mode, bias towards target color
        const colorItems = modeItems.filter(i => i.color === targetColor.css);
        const otherItems = modeItems.filter(i => i.color !== targetColor.css);
        item = Math.random() < 0.4 ? 
            colorItems[Math.floor(Math.random() * colorItems.length)] :
            modeItems[Math.floor(Math.random() * modeItems.length)];
    } else {
        item = modeItems[Math.floor(Math.random() * modeItems.length)];
    }
    
    const el = document.createElement('div');
    el.className = 'magic-item';
    
    const size = 70 + Math.random() * 30;
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = Math.random() * (window.innerWidth - size) + 'px';
    el.style.animationDuration = (10 + Math.random() * 5) + 's';
    
    if (item.color) {
        el.dataset.color = item.color;
    } else {
        el.style.background = 'radial-gradient(circle, rgba(255,200,220,0.8) 0%, rgba(255,150,180,0.4) 100%)';
    }
    
    const emoji = document.createElement('span');
    emoji.className = currentMode === 'feelings' ? 'emoji feeling-face' : 'emoji';
    emoji.textContent = item.emoji;
    emoji.style.fontSize = (size * 0.5) + 'px';
    el.appendChild(emoji);
    
    // Add label for animals/shapes/feelings
    if (currentMode === 'animals' || currentMode === 'shapes' || currentMode === 'feelings') {
        const label = document.createElement('span');
        label.className = 'item-label';
        label.textContent = item.name;
        el.appendChild(label);
    }
    
    el._itemData = item;
    
    const handleTouch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        touchItem(el, item);
    };
    
    el.addEventListener('click', handleTouch);
    el.addEventListener('touchstart', handleTouch, { passive: false });
    
    magicArea.appendChild(el);
    
    setTimeout(() => {
        if (el.parentNode && !el.classList.contains('touched')) {
            el.remove();
        }
    }, 15000);
}

function touchItem(el, item) {
    if (el.classList.contains('touched')) return;
    
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    el.classList.add('touched');
    
    // Chain effect (replaces combo)
    const now = Date.now();
    if (now - lastTouchTime < 1500) {
        chainCount++;
        if (chainCount >= 2) {
            createChainRing(x, y);
        }
    } else {
        chainCount = 1;
    }
    lastTouchTime = now;
    
    // Add to memories
    sessionMemories.add(item.emoji);
    
    // Mode-specific feedback
    switch (currentMode) {
        case 'animals':
            handleAnimalTouch(item, x, y);
            break;
        case 'feelings':
            handleFeelingTouch(item, x, y);
            break;
        case 'colors':
            handleColorTouch(item, x, y);
            break;
        case 'counting':
            handleCountingTouch(item, x, y);
            break;
        case 'shapes':
            handleShapeTouch(item, x, y);
            break;
        default:
            // Explore mode - just sparkles and joy
            createSparkles(x, y);
            playHappySound();
    }
    
    // Update score (hidden by default)
    points++;
    pointsDisplay.textContent = points;
    
    setTimeout(() => el.remove(), 400);
}

function handleAnimalTouch(item, x, y) {
    createSparkles(x, y);
    playHappySound();
    
    // Say animal name
    speak(item.name);
    
    // Show label
    const items = document.querySelectorAll('.magic-item');
    items.forEach(i => i.classList.add('show-label'));
    setTimeout(() => items.forEach(i => i.classList.remove('show-label')), 2000);
}

function handleFeelingTouch(item, x, y) {
    createSparkles(x, y, 8);
    playHappySound();
    
    // Say the feeling
    speak(item.message || item.name);
}

function handleColorTouch(item, x, y) {
    if (item.color === targetColor.css) {
        // Correct color!
        createSparkles(x, y, 10);
        playSuccessSound();
        speak('Ja! ' + targetColor.name + '!');
        
        // Pick new color after a few correct
        if (Math.random() < 0.3) {
            setTimeout(pickNewTargetColor, 2000);
        }
    } else {
        // Wrong color - gentle feedback, no punishment
        createSparkles(x, y, 3);
        playTone(300, 0.1);
        
        // Show what color it actually is
        const actualColor = colors.find(c => c.css === item.color);
        if (actualColor) {
            speak('Das ist ' + actualColor.name);
        }
    }
}

function handleCountingTouch(item, x, y) {
    countingNumber++;
    createSparkles(x, y);
    playHappySound();
    
    // Speak the number
    const numbers = ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
    if (countingNumber <= 10) {
        speak(numbers[countingNumber - 1] + '!');
    } else {
        speak(countingNumber.toString());
    }
    
    // Celebrate at milestones
    if (countingNumber === 10 || countingNumber === 20) {
        setTimeout(() => {
            speak('Super! ' + countingNumber + ' geschafft!');
            celebrate();
        }, 500);
    }
}

function handleShapeTouch(item, x, y) {
    createSparkles(x, y);
    playHappySound();
    speak('Ein ' + item.name + '!');
}

function celebrate() {
    const unicorn = document.getElementById('unicorn');
    unicorn.classList.add('celebrating');
    setTimeout(() => unicorn.classList.remove('celebrating'), 1500);
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createSparkles(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight * 0.6,
                8
            );
        }, i * 200);
    }
}

// === HELPER UNICORN (replaces boss) ===
let helperActive = false;
let helperHappiness = 0;

function maybeShowHelper() {
    if (!gameActive || helperActive) return;
    if (Math.random() < 0.5) {
        showHelper();
    } else {
        setTimeout(maybeShowHelper, 30000);
    }
}

function showHelper() {
    helperActive = true;
    helperHappiness = 0;
    
    unicornHelper.classList.remove('hidden');
    updateHelperDisplay();
    
    speak('Oh! Das Einhorn ist traurig. Kannst du es trösten?');
    
    const helperUnicorn = document.getElementById('helper-unicorn');
    
    const petUnicorn = (e) => {
        e.preventDefault();
        helperHappiness += 15;
        updateHelperDisplay();
        playTone(400 + helperHappiness * 3, 0.1);
        createSparkles(window.innerWidth / 2, window.innerHeight / 2, 3);
        
        if (helperHappiness >= 100) {
            unicornHappy();
        }
    };
    
    helperUnicorn.addEventListener('click', petUnicorn);
    helperUnicorn.addEventListener('touchstart', petUnicorn, { passive: false });
    
    // Timeout - unicorn leaves sad after 20 seconds
    setTimeout(() => {
        if (helperActive && helperHappiness < 100) {
            hideHelper();
            speak('Das Einhorn muss gehen. Vielleicht nächstes Mal!');
        }
    }, 20000);
}

function updateHelperDisplay() {
    const fill = document.getElementById('happiness-fill');
    const mood = document.getElementById('helper-mood');
    const message = document.getElementById('helper-message');
    const unicorn = document.getElementById('helper-unicorn');
    
    fill.style.width = helperHappiness + '%';
    
    if (helperHappiness < 30) {
        mood.textContent = '😢';
        message.textContent = 'Das Einhorn ist traurig...';
    } else if (helperHappiness < 60) {
        mood.textContent = '😐';
        message.textContent = 'Es geht ihm schon besser!';
    } else if (helperHappiness < 100) {
        mood.textContent = '😊';
        message.textContent = 'Noch ein bisschen...';
    }
}

function unicornHappy() {
    const mood = document.getElementById('helper-mood');
    const message = document.getElementById('helper-message');
    const unicorn = document.getElementById('helper-unicorn');
    
    mood.textContent = '🥰';
    message.textContent = 'Das Einhorn ist glücklich! Danke!';
    unicorn.classList.add('happy');
    
    playSuccessSound();
    speak('Danke! Das Einhorn ist jetzt glücklich!');
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createSparkles(
                window.innerWidth / 2 + (Math.random() - 0.5) * 300,
                window.innerHeight / 2 + (Math.random() - 0.5) * 200,
                6
            );
        }, i * 150);
    }
    
    sessionMemories.add('🦄💜');
    
    setTimeout(hideHelper, 3000);
}

function hideHelper() {
    unicornHelper.classList.add('hidden');
    helperActive = false;
    document.getElementById('helper-unicorn').classList.remove('happy');
    
    // Schedule next appearance
    setTimeout(maybeShowHelper, 45000);
}

// === MEMORY GALLERY ===
function showMemoryGallery() {
    const allItems = [];
    Object.values(items).forEach(modeItems => {
        modeItems.forEach(item => {
            if (!allItems.find(i => i.emoji === item.emoji)) {
                allItems.push(item);
            }
        });
    });
    
    memoryGrid.innerHTML = '';
    
    // Show only what was discovered this session
    sessionMemories.forEach(emoji => {
        const div = document.createElement('div');
        div.className = 'memory-item';
        div.textContent = emoji;
        memoryGrid.appendChild(div);
    });
    
    // Fill remaining with empty slots
    const remaining = 10 - sessionMemories.size;
    for (let i = 0; i < Math.max(0, remaining); i++) {
        const div = document.createElement('div');
        div.className = 'memory-item empty';
        div.textContent = '?';
        memoryGrid.appendChild(div);
    }
    
    memoryModal.classList.add('active');
}

// === SETTINGS ===
function showSettings() {
    document.getElementById('show-score').checked = settings.showScore;
    document.getElementById('language').value = settings.language;
    settingsModal.classList.add('active');
}

function saveSettings() {
    settings.showScore = document.getElementById('show-score').checked;
    settings.language = document.getElementById('language').value;
    
    try {
        localStorage.setItem('emiSettings', JSON.stringify(settings));
    } catch(e) {}
    
    settingsModal.classList.remove('active');
}

// === EVENT LISTENERS ===
document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => startMode(btn.dataset.mode));
});

document.getElementById('back-btn').addEventListener('click', stopGame);
document.getElementById('memory-btn').addEventListener('click', showMemoryGallery);
document.getElementById('close-memory').addEventListener('click', () => memoryModal.classList.remove('active'));
document.getElementById('settings-btn').addEventListener('click', showSettings);
document.getElementById('close-settings').addEventListener('click', saveSettings);

// Close modals on background click
[memoryModal, settingsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

console.log('🦄 Emis Einhorn-Welt geladen!');
