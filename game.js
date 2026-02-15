// 🦄 Emis Einhorn-Welt - Lernspiel für 4-Jährige
// Pädagogisch: Entdecken, nicht Gewinnen. Freude, nicht Druck.

// === ITEM COLLECTIONS ===
const allItems = [
    { emoji: '🦄', name: 'Einhorn', points: 5, rare: true, color: 'pink' },
    { emoji: '🌈', name: 'Regenbogen', points: 3, color: 'bunt' },
    { emoji: '⭐', name: 'Stern', points: 2, color: 'gelb' },
    { emoji: '🦋', name: 'Schmetterling', points: 2, color: 'blau' },
    { emoji: '🎀', name: 'Schleife', points: 2, color: 'pink' },
    { emoji: '👑', name: 'Krone', points: 3, color: 'gelb' },
    { emoji: '🧁', name: 'Cupcake', points: 2, color: 'pink' },
    { emoji: '🍦', name: 'Eis', points: 2, color: 'bunt' },
    { emoji: '💜', name: 'Herz', points: 2, color: 'lila' },
    { emoji: '🌸', name: 'Blume', points: 2, color: 'pink' },
    { emoji: '🍎', name: 'Apfel', points: 2, color: 'rot' },
    { emoji: '🍊', name: 'Orange', points: 2, color: 'orange' },
    { emoji: '🍋', name: 'Zitrone', points: 2, color: 'gelb' },
    { emoji: '🥕', name: 'Karotte', points: 2, color: 'orange' },
    { emoji: '🍀', name: 'Kleeblatt', points: 2, color: 'grün' },
    { emoji: '🌻', name: 'Sonnenblume', points: 2, color: 'gelb' },
];

const animalItems = [
    { emoji: '🐶', name: 'Hund', points: 3, sound: 'Wuff wuff!' },
    { emoji: '🐱', name: 'Katze', points: 3, sound: 'Miau!' },
    { emoji: '🐰', name: 'Hase', points: 3, sound: 'Hoppel hoppel!' },
    { emoji: '🐻', name: 'Bär', points: 3, sound: 'Brumm!' },
    { emoji: '🦊', name: 'Fuchs', points: 3, sound: 'Yip yip!' },
    { emoji: '🐸', name: 'Frosch', points: 3, sound: 'Quak quak!' },
    { emoji: '🐷', name: 'Schwein', points: 3, sound: 'Oink oink!' },
    { emoji: '🐮', name: 'Kuh', points: 3, sound: 'Muuuh!' },
    { emoji: '🦁', name: 'Löwe', points: 3, sound: 'Roar!' },
    { emoji: '🐘', name: 'Elefant', points: 3, sound: 'Törööö!' },
    { emoji: '🦒', name: 'Giraffe', points: 3, sound: 'Sooo groß!' },
    { emoji: '🐧', name: 'Pinguin', points: 3, sound: 'Watschel!' },
];

// Color groups for color game
const colorGroups = {
    rot: { name: 'Rot', items: ['🍎', '❤️', '🍓', '🌹', '🎈'] },
    orange: { name: 'Orange', items: ['🍊', '🥕', '🧡', '🏀', '🦊'] },
    gelb: { name: 'Gelb', items: ['⭐', '🌻', '🍋', '💛', '🌟', '👑'] },
    grün: { name: 'Grün', items: ['🍀', '🥒', '🐸', '💚', '🌲', '🥦'] },
    blau: { name: 'Blau', items: ['💙', '🦋', '🐳', '💎', '🧢'] },
    lila: { name: 'Lila', items: ['💜', '🍇', '🔮', '🦄', '☂️'] },
    pink: { name: 'Pink', items: ['🌸', '🎀', '💗', '🧁', '🦩'] },
};

// Magic unicorn (streicheln!)
let magicUnicornActive = false;
let magicUnicornEnergy = 0;
const MAGIC_UNICORN_MAX_ENERGY = 100;

// === STATE ===
let score = 0;
let gameActive = false;
let useCamera = false;
let itemInterval = null;
let combo = 0;
let lastCatchTime = 0;
let stickers = new Set();
let handX = 0, handY = 0;

// Game mode state
let currentMode = 'explore'; // explore, colors, counting, animals
let currentColor = null;
let countTarget = 0;
let countCurrent = 0;
let currentAnimal = null;

// Load saved stickers
try {
    const saved = localStorage.getItem('emiStickers');
    if (saved) stickers = new Set(JSON.parse(saved));
} catch(e) {}

// === DOM ===
const startScreen = document.getElementById('start-screen');
const controlScreen = document.getElementById('control-screen');
const gameScreen = document.getElementById('game-screen');
const magicArea = document.getElementById('magic-area');
const pointsDisplay = document.getElementById('points');
const video = document.getElementById('camera');
const handCursor = document.getElementById('hand-cursor');
const albumModal = document.getElementById('album-modal');
const stickerGrid = document.getElementById('sticker-grid');
const toast = document.getElementById('sticker-toast');
const taskDisplay = document.getElementById('task-display');
const countDisplay = document.getElementById('count-display');
const celebration = document.getElementById('celebration');

// === AUDIO (gentle, musical sounds) ===
let audioCtx;
function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playTone(freq, dur = 0.15, type = 'sine') {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
        osc.start();
        osc.stop(ctx.currentTime + dur);
    } catch(e) {}
}

function playPop() {
    playTone(600 + Math.random() * 200, 0.1);
}

function playSuccess() {
    // Happy ascending melody
    [523, 659, 784, 1047].forEach((f, i) => 
        setTimeout(() => playTone(f, 0.15), i * 100));
}

function playWrongItem() {
    // Gentle "try again" sound (not negative!)
    playTone(350, 0.2, 'triangle');
}

function playCombo() {
    [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.1), i * 80));
}

function playPetSound() {
    // Gentle ascending tone when petting
    playTone(400 + magicUnicornEnergy * 3, 0.1);
}

function playUnicornHappy() {
    [440, 554, 659, 880, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.12), i * 80));
}

function playCelebration() {
    // Triumphant melody for completing a task
    const melody = [523, 523, 659, 784, 659, 784, 1047];
    melody.forEach((f, i) => setTimeout(() => playTone(f, 0.12), i * 100));
}

// === SPARKLES & EFFECTS ===
function createSparkles(x, y, count = 5, color = null) {
    const sparkles = color ? ['✨', '⭐', '💫'] : ['✨', '⭐', '💫', '🌟'];
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

function showPoints(x, y, pts, isCombo) {
    const el = document.createElement('div');
    el.className = 'points-popup' + (isCombo ? ' combo' : '');
    el.textContent = '+' + pts;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    magicArea.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function showCelebration(text = 'Super!', emoji = '🎉') {
    celebration.querySelector('.celebration-text').textContent = text;
    celebration.querySelector('.celebration-emoji').textContent = emoji;
    celebration.classList.remove('hidden');
    playCelebration();
    
    // Create confetti
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.textContent = ['🎉', '⭐', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 6)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (2 + Math.random()) + 's';
            magicArea.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
    
    setTimeout(() => celebration.classList.add('hidden'), 2000);
}

// === STICKER TOAST ===
function showStickerToast(emoji) {
    document.getElementById('toast-emoji').textContent = emoji;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2000);
}

// === GAME MODE LOGIC ===
function getItemsForMode() {
    switch (currentMode) {
        case 'animals':
            return animalItems;
        case 'colors':
            return allItems; // Will filter by color in createItem
        case 'counting':
            return allItems.slice(0, 8); // Fewer items for counting
        default:
            return allItems;
    }
}

function setupColorTask() {
    const colors = Object.keys(colorGroups);
    currentColor = colors[Math.floor(Math.random() * colors.length)];
    const colorData = colorGroups[currentColor];
    taskDisplay.innerHTML = `<span class="task-label">Finde alles</span> <span class="task-color ${currentColor}">${colorData.name}e</span>!`;
    taskDisplay.classList.add('active');
}

function setupCountingTask() {
    countTarget = 3 + Math.floor(Math.random() * 4); // 3-6 items
    countCurrent = 0;
    document.getElementById('count-number').textContent = '0';
    document.getElementById('count-target').textContent = ' / ' + countTarget;
    countDisplay.classList.remove('hidden');
    taskDisplay.innerHTML = `<span class="task-label">Fange ${countTarget} Sachen!</span>`;
    taskDisplay.classList.add('active');
}

function setupAnimalTask() {
    const animal = animalItems[Math.floor(Math.random() * animalItems.length)];
    currentAnimal = animal;
    taskDisplay.innerHTML = `<span class="task-label">Wo ist der</span> <span class="task-animal">${animal.name}</span>? ${animal.emoji}`;
    taskDisplay.classList.add('active');
}

function updateCountDisplay() {
    document.getElementById('count-number').textContent = countCurrent;
    
    // Add bounce animation
    const numEl = document.getElementById('count-number');
    numEl.classList.add('bounce');
    setTimeout(() => numEl.classList.remove('bounce'), 300);
}

// === ITEM CREATION ===
function createItem() {
    if (!gameActive) return;
    
    let item;
    let isCorrect = true;
    
    if (currentMode === 'colors' && currentColor) {
        // Color mode: 70% correct color, 30% wrong (to make it a challenge)
        if (Math.random() < 0.7) {
            const colorItems = colorGroups[currentColor].items;
            const emoji = colorItems[Math.floor(Math.random() * colorItems.length)];
            item = { emoji, name: currentColor, points: 3, isCorrectColor: true, color: currentColor };
        } else {
            // Wrong color
            const wrongColors = Object.keys(colorGroups).filter(c => c !== currentColor);
            const wrongColor = wrongColors[Math.floor(Math.random() * wrongColors.length)];
            const wrongItems = colorGroups[wrongColor].items;
            const emoji = wrongItems[Math.floor(Math.random() * wrongItems.length)];
            item = { emoji, name: wrongColor, points: 0, isCorrectColor: false, color: wrongColor };
        }
    } else if (currentMode === 'animals' && currentAnimal) {
        // Animal mode: 40% correct animal, 60% other animals
        if (Math.random() < 0.4) {
            item = { ...currentAnimal, isCorrectAnimal: true };
        } else {
            const others = animalItems.filter(a => a.emoji !== currentAnimal.emoji);
            item = { ...others[Math.floor(Math.random() * others.length)], isCorrectAnimal: false };
        }
    } else if (currentMode === 'counting') {
        // Counting mode: simple items
        const items = getItemsForMode();
        item = items[Math.floor(Math.random() * items.length)];
    } else {
        // Explore mode: all items (magic unicorn handled separately)
        const items = [...allItems, ...animalItems.slice(0, 4)];
        item = items[Math.floor(Math.random() * items.length)];
    }
    
    const el = document.createElement('div');
    el.className = 'magic-item';
    
    // Extra large for kids!
    const size = 85 + Math.random() * 25;
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = (20 + Math.random() * (window.innerWidth - size - 40)) + 'px';
    
    // Slower fall for young kids
    el.style.animationDuration = (12 + Math.random() * 4) + 's';
    
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = item.emoji;
    emoji.style.fontSize = (size * 0.55) + 'px';
    el.appendChild(emoji);
    
    el._item = item;
    
    // Touch/click handler
    const handleTouch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        catchItem(el);
    };
    el.addEventListener('click', handleTouch);
    el.addEventListener('touchstart', handleTouch, { passive: false });
    
    magicArea.appendChild(el);
    
    // Remove if not caught
    setTimeout(() => {
        if (el.parentNode && !el.classList.contains('caught')) {
            el.remove();
        }
    }, item.isBoss ? 20000 : 16000);
}

function catchItem(el) {
    if (el.classList.contains('caught')) return;
    
    const item = el._item;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Mode-specific handling
    if (currentMode === 'colors') {
        if (item.isCorrectColor) {
            handleSuccessfulCatch(el, item, x, y);
        } else {
            // Wrong color - gentle feedback, item just wobbles
            el.classList.add('wobble');
            playWrongItem();
            setTimeout(() => el.classList.remove('wobble'), 400);
            return; // Don't remove, let kid try again
        }
    } else if (currentMode === 'animals') {
        if (item.isCorrectAnimal) {
            handleSuccessfulCatch(el, item, x, y);
            // Show name bubble
            showAnimalName(x, y, item.name);
            // Start new task after celebration
            setTimeout(() => {
                if (gameActive) setupAnimalTask();
            }, 1500);
        } else {
            // Wrong animal - show its name anyway (learning opportunity!)
            el.classList.add('wobble');
            showAnimalName(x, y, item.name);
            playWrongItem();
            setTimeout(() => el.classList.remove('wobble'), 400);
            return;
        }
    } else if (currentMode === 'counting') {
        handleSuccessfulCatch(el, item, x, y);
        countCurrent++;
        updateCountDisplay();
        
        if (countCurrent >= countTarget) {
            showCelebration(`${countTarget} geschafft!`, '🔢');
            setTimeout(() => {
                if (gameActive) setupCountingTask();
            }, 2500);
        }
    } else {
        // Explore mode - catch everything!
        handleSuccessfulCatch(el, item, x, y);
    }
}

function handleSuccessfulCatch(el, item, x, y) {
    el.classList.add('caught');
    playPop();
    createSparkles(x, y);
    
    // Combo
    const now = Date.now();
    if (now - lastCatchTime < 1500) {
        combo++;
        if (combo >= 3) {
            playCombo();
        }
    } else {
        combo = 1;
    }
    lastCatchTime = now;
    
    const multiplier = combo >= 3 ? Math.min(combo - 1, 5) : 1;
    const pts = (item.points || 2) * multiplier;
    score += pts;
    pointsDisplay.textContent = score;
    showPoints(x, y, pts, multiplier > 1);
    
    // Sticker collection
    if (!stickers.has(item.emoji)) {
        stickers.add(item.emoji);
        try { localStorage.setItem('emiStickers', JSON.stringify([...stickers])); } catch(e) {}
        showStickerToast(item.emoji);
    }
    
    setTimeout(() => el.remove(), 300);
}

function showAnimalName(x, y, name) {
    const bubble = document.createElement('div');
    bubble.className = 'animal-name-bubble';
    bubble.textContent = name;
    bubble.style.left = x + 'px';
    bubble.style.top = (y - 50) + 'px';
    magicArea.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1500);
}

// === CAMERA / HAND TRACKING ===
let hands = null;
let camera = null;
let cameraInitialized = false;

async function startCamera() {
    // If already initialized, just show the video
    if (cameraInitialized) {
        video.classList.add('active');
        handCursor.classList.add('active');
        return;
    }
    
    try {
        hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        hands.onResults(onHandResults);
        
        camera = new Camera(video, {
            onFrame: async () => {
                if (hands && gameActive && useCamera) {
                    await hands.send({ image: video });
                }
            },
            width: 320,
            height: 240
        });
        
        await camera.start();
        cameraInitialized = true;
        video.classList.add('active');
        handCursor.classList.add('active');
        
    } catch (err) {
        console.error('Camera error:', err);
        alert('Kamera konnte nicht gestartet werden. Spiel wechselt zu Touch-Modus.');
        useCamera = false;
        startGame();
    }
}

function onHandResults(results) {
    if (!results.multiHandLandmarks || !results.multiHandLandmarks[0]) {
        return;
    }
    
    const tip = results.multiHandLandmarks[0][8];
    handX = (1 - tip.x) * window.innerWidth;
    handY = tip.y * window.innerHeight;
    
    handCursor.style.left = handX + 'px';
    handCursor.style.top = handY + 'px';
    
    // Check for collisions
    const items = document.querySelectorAll('.magic-item:not(.caught)');
    items.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Larger hit area for camera mode
        const padding = 15;
        if (handX > rect.left - padding && handX < rect.right + padding &&
            handY > rect.top - padding && handY < rect.bottom + padding) {
            catchItem(el);
        }
    });
}

// === MAGIC UNICORN (flies across, needs petting!) ===
let magicUnicornTimeout = null;

function spawnMagicUnicorn() {
    if (magicUnicornActive || !gameActive) return;
    
    magicUnicornActive = true;
    magicUnicornEnergy = 0;
    
    const unicorn = document.createElement('div');
    unicorn.id = 'magic-unicorn';
    unicorn.innerHTML = `
        <div class="mu-emoji">🦄</div>
        <div class="mu-energy-bar">
            <div class="mu-energy-fill"></div>
        </div>
        <div class="mu-hint">Streichle mich! 💜</div>
    `;
    
    magicArea.appendChild(unicorn);
    
    // Pet/stroke handler
    const petUnicorn = (e) => {
        e.preventDefault();
        if (!magicUnicornActive) return;
        
        magicUnicornEnergy += 8;
        playPetSound();
        createSparkles(
            unicorn.getBoundingClientRect().left + 60,
            unicorn.getBoundingClientRect().top + 60,
            3
        );
        
        // Update energy bar
        unicorn.querySelector('.mu-energy-fill').style.width = magicUnicornEnergy + '%';
        
        // Unicorn gets happier
        if (magicUnicornEnergy >= 100) {
            magicUnicornHappy(unicorn);
        }
    };
    
    unicorn.addEventListener('click', petUnicorn);
    unicorn.addEventListener('touchstart', petUnicorn, { passive: false });
    
    // Also check for camera hand collision
    if (useCamera) {
        const checkHandCollision = setInterval(() => {
            if (!magicUnicornActive) {
                clearInterval(checkHandCollision);
                return;
            }
            const rect = unicorn.getBoundingClientRect();
            if (handX > rect.left && handX < rect.right &&
                handY > rect.top && handY < rect.bottom) {
                magicUnicornEnergy += 2;
                unicorn.querySelector('.mu-energy-fill').style.width = magicUnicornEnergy + '%';
                if (magicUnicornEnergy % 10 < 3) {
                    playPetSound();
                    createSparkles(handX, handY, 2);
                }
                if (magicUnicornEnergy >= 100) {
                    clearInterval(checkHandCollision);
                    magicUnicornHappy(unicorn);
                }
            }
        }, 100);
    }
    
    // Unicorn leaves after 15 seconds if not fully petted
    setTimeout(() => {
        if (magicUnicornActive && magicUnicornEnergy < 100) {
            unicorn.classList.add('leaving');
            setTimeout(() => {
                unicorn.remove();
                magicUnicornActive = false;
                scheduleMagicUnicorn();
            }, 1000);
        }
    }, 15000);
}

function magicUnicornHappy(unicorn) {
    magicUnicornActive = false;
    
    unicorn.classList.add('happy');
    playUnicornHappy();
    
    // Big celebration!
    score += 25;
    pointsDisplay.textContent = score;
    showCelebration('Einhorn glücklich!', '🦄💜');
    
    // Add unicorn sticker
    if (!stickers.has('🦄💜')) {
        stickers.add('🦄💜');
        try { localStorage.setItem('emiStickers', JSON.stringify([...stickers])); } catch(e) {}
        showStickerToast('🦄💜');
    }
    
    setTimeout(() => {
        unicorn.remove();
        scheduleMagicUnicorn();
    }, 2000);
}

function scheduleMagicUnicorn() {
    if (magicUnicornTimeout) clearTimeout(magicUnicornTimeout);
    // Spawn every 30-60 seconds in explore mode
    if (currentMode === 'explore' && gameActive) {
        magicUnicornTimeout = setTimeout(spawnMagicUnicorn, 30000 + Math.random() * 30000);
    }
}

// === GAME CONTROL ===
function selectMode(mode) {
    currentMode = mode;
    const modeNames = {
        explore: '🌈 Entdecken',
        colors: '🎨 Farben',
        counting: '🔢 Zählen',
        animals: '🐾 Tiere'
    };
    document.getElementById('mode-subtitle').textContent = modeNames[mode];
    
    startScreen.classList.remove('active');
    controlScreen.classList.add('active');
}

function startGame() {
    gameActive = true;
    score = 0;
    combo = 0;
    countCurrent = 0;
    pointsDisplay.textContent = '0';
    
    controlScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    // Setup mode-specific UI
    taskDisplay.classList.remove('active');
    countDisplay.classList.add('hidden');
    
    if (currentMode === 'colors') {
        setupColorTask();
    } else if (currentMode === 'counting') {
        setupCountingTask();
    } else if (currentMode === 'animals') {
        setupAnimalTask();
    }
    
    if (useCamera) {
        startCamera();
    } else {
        video.classList.remove('active');
        handCursor.classList.remove('active');
    }
    
    // Start spawning items
    createItem();
    itemInterval = setInterval(createItem, currentMode === 'counting' ? 1800 : 2200);
    
    // Schedule magic unicorn in explore mode
    if (currentMode === 'explore') {
        scheduleMagicUnicorn();
    }
}

function stopGame() {
    gameActive = false;
    if (itemInterval) {
        clearInterval(itemInterval);
        itemInterval = null;
    }
    if (magicUnicornTimeout) {
        clearTimeout(magicUnicornTimeout);
        magicUnicornTimeout = null;
    }
    magicUnicornActive = false;
    
    magicArea.querySelectorAll('.magic-item, .confetti, .animal-name-bubble, #magic-unicorn').forEach(el => el.remove());
    
    gameScreen.classList.remove('active');
    startScreen.classList.add('active');
    
    if (camera) {
        video.classList.remove('active');
        handCursor.classList.remove('active');
    }
    
    // Reset task display
    taskDisplay.classList.remove('active');
    countDisplay.classList.add('hidden');
}

// === STICKER ALBUM ===
function showAlbum() {
    stickerGrid.innerHTML = '';
    
    const allCollectable = [...allItems, ...animalItems];
    allCollectable.forEach(item => {
        const div = document.createElement('div');
        div.className = 'sticker-slot' + (stickers.has(item.emoji) ? ' collected' : '');
        div.innerHTML = stickers.has(item.emoji) 
            ? `<span class="sticker-emoji">${item.emoji}</span><span class="sticker-name">${item.name}</span>`
            : '?';
        stickerGrid.appendChild(div);
    });
    
    albumModal.classList.add('active');
}

// === EVENT LISTENERS ===
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => selectMode(btn.dataset.mode));
});

document.getElementById('back-to-modes').addEventListener('click', () => {
    controlScreen.classList.remove('active');
    startScreen.classList.add('active');
});

document.getElementById('touch-mode-btn').addEventListener('click', () => {
    useCamera = false;
    startGame();
});

document.getElementById('camera-mode-btn').addEventListener('click', () => {
    if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        alert('Kamera-Modus funktioniert nur am Computer!');
        return;
    }
    useCamera = true;
    startGame();
});

document.getElementById('back-btn').addEventListener('click', stopGame);
document.getElementById('album-btn').addEventListener('click', showAlbum);
document.getElementById('close-album').addEventListener('click', () => albumModal.classList.remove('active'));

albumModal.addEventListener('click', (e) => {
    if (e.target === albumModal) albumModal.classList.remove('active');
});

// Hide camera button on mobile
if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    document.getElementById('camera-mode-btn').style.display = 'none';
}

console.log('🦄 Emis Einhorn-Welt geladen! Spielmodi: Entdecken, Farben, Zählen, Tiere');
