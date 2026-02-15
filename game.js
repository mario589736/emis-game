// 🦄 Emis Einhorn-Welt - Bubble Pop mit Kamera
// Touch/Click ODER Kamera-Steuerung

// === ITEMS ===
const allItems = [
    { emoji: '🦄', name: 'Einhorn', points: 5, rare: true },
    { emoji: '🌈', name: 'Regenbogen', points: 3 },
    { emoji: '⭐', name: 'Stern', points: 2 },
    { emoji: '🦋', name: 'Schmetterling', points: 2 },
    { emoji: '🎀', name: 'Schleife', points: 2 },
    { emoji: '👑', name: 'Krone', points: 3 },
    { emoji: '🧁', name: 'Cupcake', points: 2 },
    { emoji: '🍦', name: 'Eis', points: 2 },
    { emoji: '🐶', name: 'Hund', points: 2 },
    { emoji: '🐱', name: 'Katze', points: 2 },
    { emoji: '💜', name: 'Herz', points: 2 },
    { emoji: '🌸', name: 'Blume', points: 2 },
];

// Boss unicorn - needs multiple hits
const bossItem = { emoji: '🦄', name: 'Boss-Einhorn', points: 20, hits: 5, isBoss: true };

// === STATE ===
let score = 0;
let gameActive = false;
let useCamera = false;
let itemInterval = null;
let combo = 0;
let lastCatchTime = 0;
let stickers = new Set();
let handX = 0, handY = 0;
let voiceEnabled = false;

// Load saved stickers
try {
    const saved = localStorage.getItem('emiStickers');
    if (saved) stickers = new Set(JSON.parse(saved));
} catch(e) {}

try {
    voiceEnabled = localStorage.getItem('emiVoice') === 'true';
} catch(e) {}

// === DOM ===
const modeScreen = document.getElementById('mode-screen');
const gameScreen = document.getElementById('game-screen');
const magicArea = document.getElementById('magic-area');
const pointsDisplay = document.getElementById('points');
const video = document.getElementById('camera');
const handCursor = document.getElementById('hand-cursor');
const albumModal = document.getElementById('album-modal');
const stickerGrid = document.getElementById('sticker-grid');
const settingsModal = document.getElementById('settings-modal');
const toast = document.getElementById('sticker-toast');

// === AUDIO ===
let audioCtx;
function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playTone(freq, dur = 0.15) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
        osc.start();
        osc.stop(ctx.currentTime + dur);
    } catch(e) {}
}

function playPop() {
    playTone(600 + Math.random() * 200, 0.1);
}

function playCombo() {
    [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.1), i * 80));
}

function playBossHit() {
    playTone(300, 0.15);
}

function playBossDefeat() {
    [440, 554, 659, 880].forEach((f, i) => setTimeout(() => playTone(f, 0.12), i * 100));
}

// Voice (optional, kid-friendly)
let synth = window.speechSynthesis;
let kidVoice = null;

function initVoice() {
    if (!synth) return;
    const voices = synth.getVoices();
    // Try to find a friendly German voice
    kidVoice = voices.find(v => v.lang.startsWith('de') && v.name.toLowerCase().includes('female')) ||
               voices.find(v => v.lang.startsWith('de')) ||
               voices[0];
}
if (synth) {
    synth.onvoiceschanged = initVoice;
    initVoice();
}

function speak(text) {
    if (!voiceEnabled || !synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = kidVoice;
    u.rate = 0.85;
    u.pitch = 1.3;
    u.lang = 'de-DE';
    synth.speak(u);
}

// === SPARKLES ===
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

function showPoints(x, y, pts, isCombo) {
    const el = document.createElement('div');
    el.className = 'points-popup' + (isCombo ? ' combo' : '');
    el.textContent = '+' + pts;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    magicArea.appendChild(el);
    setTimeout(() => el.remove(), 800);
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

// === ITEM CREATION ===
function createItem() {
    if (!gameActive) return;
    
    // 10% chance for boss unicorn every 30 seconds
    const isBoss = Math.random() < 0.1 && !document.querySelector('.boss');
    const item = isBoss ? { ...bossItem } : allItems[Math.floor(Math.random() * allItems.length)];
    
    const el = document.createElement('div');
    el.className = 'magic-item' + (isBoss ? ' boss' : '');
    
    const size = isBoss ? 120 : (70 + Math.random() * 30);
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = Math.random() * (window.innerWidth - size) + 'px';
    el.style.animationDuration = (isBoss ? 15 : 10 + Math.random() * 5) + 's';
    
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = item.emoji;
    emoji.style.fontSize = (size * 0.5) + 'px';
    el.appendChild(emoji);
    
    if (isBoss) {
        const hp = document.createElement('div');
        hp.className = 'boss-hp';
        hp.innerHTML = '❤️'.repeat(item.hits);
        el.appendChild(hp);
        el._hitsLeft = item.hits;
    }
    
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
    }, isBoss ? 18000 : 15000);
}

function catchItem(el) {
    if (el.classList.contains('caught')) return;
    
    const item = el._item;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Boss handling
    if (item.isBoss) {
        el._hitsLeft--;
        playBossHit();
        el.querySelector('.boss-hp').innerHTML = '❤️'.repeat(el._hitsLeft);
        el.classList.add('hit');
        setTimeout(() => el.classList.remove('hit'), 200);
        
        if (el._hitsLeft <= 0) {
            el.classList.add('caught');
            createSparkles(x, y, 15);
            playBossDefeat();
            score += item.points;
            pointsDisplay.textContent = score;
            showPoints(x, y, item.points, true);
            speak('Super! Boss besiegt!');
            setTimeout(() => el.remove(), 500);
        }
        return;
    }
    
    // Normal item
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
    const pts = item.points * multiplier;
    score += pts;
    pointsDisplay.textContent = score;
    showPoints(x, y, pts, multiplier > 1);
    
    // Sticker collection
    if (!stickers.has(item.emoji)) {
        stickers.add(item.emoji);
        try { localStorage.setItem('emiStickers', JSON.stringify([...stickers])); } catch(e) {}
        showStickerToast(item.emoji);
        speak('Neuer Sticker!');
    }
    
    setTimeout(() => el.remove(), 300);
}

// === CAMERA / HAND TRACKING ===
let hands = null;
let camera = null;

async function startCamera() {
    if (hands) return; // Already initialized
    
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
            width: 640,
            height: 480
        });
        
        await camera.start();
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
    
    // Index finger tip (landmark 8)
    const tip = results.multiHandLandmarks[0][8];
    handX = (1 - tip.x) * window.innerWidth; // Mirror
    handY = tip.y * window.innerHeight;
    
    handCursor.style.left = handX + 'px';
    handCursor.style.top = handY + 'px';
    
    // Check for collisions
    const items = document.querySelectorAll('.magic-item:not(.caught)');
    items.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (handX > rect.left && handX < rect.right &&
            handY > rect.top && handY < rect.bottom) {
            catchItem(el);
        }
    });
}

// === GAME CONTROL ===
function startGame() {
    gameActive = true;
    score = 0;
    combo = 0;
    pointsDisplay.textContent = '0';
    
    modeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    if (useCamera) {
        startCamera();
    } else {
        video.classList.remove('active');
        handCursor.classList.remove('active');
    }
    
    createItem();
    itemInterval = setInterval(createItem, 2000);
}

function stopGame() {
    gameActive = false;
    if (itemInterval) {
        clearInterval(itemInterval);
        itemInterval = null;
    }
    
    magicArea.querySelectorAll('.magic-item').forEach(el => el.remove());
    
    gameScreen.classList.remove('active');
    modeScreen.classList.add('active');
    
    if (camera) {
        // Don't stop camera, just hide
        video.classList.remove('active');
        handCursor.classList.remove('active');
    }
}

// === STICKER ALBUM ===
function showAlbum() {
    stickerGrid.innerHTML = '';
    
    allItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'sticker-slot' + (stickers.has(item.emoji) ? ' collected' : '');
        div.textContent = stickers.has(item.emoji) ? item.emoji : '?';
        stickerGrid.appendChild(div);
    });
    
    albumModal.classList.add('active');
}

// === SETTINGS ===
function showSettings() {
    document.getElementById('voice-enabled').checked = voiceEnabled;
    settingsModal.classList.add('active');
}

function saveSettings() {
    voiceEnabled = document.getElementById('voice-enabled').checked;
    try { localStorage.setItem('emiVoice', voiceEnabled); } catch(e) {}
    settingsModal.classList.remove('active');
}

// === EVENT LISTENERS ===
document.getElementById('touch-mode-btn').addEventListener('click', () => {
    useCamera = false;
    startGame();
});

document.getElementById('camera-mode-btn').addEventListener('click', () => {
    // Only show camera option on desktop
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
document.getElementById('settings-btn').addEventListener('click', showSettings);
document.getElementById('close-settings').addEventListener('click', saveSettings);

// Close modals on background click
[albumModal, settingsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

// Hide camera button on mobile
if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    document.getElementById('camera-mode-btn').style.display = 'none';
}

console.log('🦄 Emis Einhorn-Welt geladen!');
