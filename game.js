// 🦄 Emis Einhorn-Spiel 🦄

const magicArea = document.getElementById('magic-area');
const pointsDisplay = document.getElementById('points');
const webcamElement = document.getElementById('webcam');
const handLeft = document.getElementById('hand-left');
const handRight = document.getElementById('hand-right');
const modeSelector = document.getElementById('mode-selector');

let points = 0;
let handPositions = { left: null, right: null };
let cameraActive = false;
let gameStarted = false;

// Detect mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || ('ontouchstart' in window && window.innerWidth < 1024);

// Combo system
let lastCatchTime = 0;
let comboCount = 0;
let comboTimeout = null;

// Stickers
let stickerCollection = {};
try { stickerCollection = JSON.parse(localStorage.getItem('emiStickers') || '{}'); } catch(e) {}

const unicornItems = [
    { emoji: '🍦', size: 75, points: 2, name: 'icecream', label: 'Eis' },
    { emoji: '🐶', size: 80, points: 2, name: 'dog', label: 'Hund' },
    { emoji: '🐱', size: 80, points: 2, name: 'cat', label: 'Katze' },
    { emoji: '🐕', size: 75, points: 2, name: 'puppy', label: 'Welpe' },
    { emoji: '🐈', size: 75, points: 2, name: 'kitty', label: 'Kätzchen' },
    { emoji: '🍨', size: 70, points: 2, name: 'sundae', label: 'Eisbecher' },
    { emoji: '🦄', size: 90, points: 3, name: 'unicorn', label: 'Einhorn' },
    { emoji: '🌈', size: 100, points: 2, name: 'rainbow', label: 'Regenbogen' },
    { emoji: '☁️', size: 80, points: 1, name: 'cloud', label: 'Wolke' },
    { emoji: '⭐', size: 70, points: 1, name: 'star', label: 'Stern' },
    { emoji: '💜', size: 65, points: 1, name: 'heart', label: 'Herz' },
    { emoji: '🎀', size: 65, points: 1, name: 'bow', label: 'Schleife' },
    { emoji: '✨', size: 60, points: 1, name: 'sparkle', label: 'Glitzer' },
    { emoji: '🌸', size: 70, points: 1, name: 'flower', label: 'Blume' },
    { emoji: '🦋', size: 75, points: 2, name: 'butterfly', label: 'Schmetterling' },
    { emoji: '👑', size: 70, points: 3, name: 'crown', label: 'Krone' },
    { emoji: '🧁', size: 70, points: 2, name: 'cupcake', label: 'Cupcake' },
    { emoji: '🎠', size: 80, points: 3, name: 'carousel', label: 'Karussell' },
];

const magicColors = [
    'radial-gradient(circle, rgba(255,182,193,0.8) 0%, rgba(255,105,180,0.4) 100%)',
    'radial-gradient(circle, rgba(221,160,221,0.8) 0%, rgba(186,85,211,0.4) 100%)',
    'radial-gradient(circle, rgba(173,216,230,0.8) 0%, rgba(135,206,250,0.4) 100%)',
    'radial-gradient(circle, rgba(255,218,233,0.8) 0%, rgba(255,182,193,0.4) 100%)',
];

// Audio
let audioContext;
try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}

function playMagicPop() {
    if (!audioContext) return;
    try {
        if (audioContext.state === 'suspended') audioContext.resume();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain); gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(600, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
        osc.start(); osc.stop(audioContext.currentTime + 0.25);
    } catch(e) {}
}

function playUnicornSound() {
    if (!audioContext) return;
    try {
        if (audioContext.state === 'suspended') audioContext.resume();
        [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain); gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.05);
            gain.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc.start(audioContext.currentTime + i * 0.05);
            osc.stop(audioContext.currentTime + 0.5);
        });
    } catch(e) {}
}

function playComboSound(level) {
    if (!audioContext) return;
    try {
        if (audioContext.state === 'suspended') audioContext.resume();
        const baseFreq = 400 + (level * 100);
        for (let i = 0; i < 3; i++) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain); gain.connect(audioContext.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(baseFreq + i * 150, audioContext.currentTime + i * 0.05);
            gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            osc.start(audioContext.currentTime + i * 0.05);
            osc.stop(audioContext.currentTime + 0.25);
        }
    } catch(e) {}
}

function playBossHit() {
    if (!audioContext) return;
    try {
        if (audioContext.state === 'suspended') audioContext.resume();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain); gain.connect(audioContext.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        osc.start(); osc.stop(audioContext.currentTime + 0.2);
    } catch(e) {}
}

function playBossDefeat() {
    if (!audioContext) return;
    try {
        if (audioContext.state === 'suspended') audioContext.resume();
        [523, 659, 784, 880, 1047, 1319, 1568].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain); gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.08);
            gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc.start(audioContext.currentTime + i * 0.08);
            osc.stop(audioContext.currentTime + 0.6);
        });
    } catch(e) {}
}

function createSparkles(x, y, count = 6) {
    const sparkles = ['✨', '⭐', '💫', '🌟', '💜', '💖'];
    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        const angle = (i / count) * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        sparkle.style.left = (x + Math.cos(angle) * distance) + 'px';
        sparkle.style.top = (y + Math.sin(angle) * distance) + 'px';
        magicArea.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 700);
    }
}

function createRainbowTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'rainbow-trail';
    trail.style.left = (x - 60) + 'px';
    trail.style.top = (y - 30) + 'px';
    magicArea.appendChild(trail);
    setTimeout(() => trail.remove(), 800);
}

// Combo
function showCombo(x, y, combo) {
    const el = document.createElement('div');
    el.className = 'combo-popup';
    el.innerHTML = `<span class="combo-count">${combo}x</span><span class="combo-text">COMBO!</span>`;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    magicArea.appendChild(el);
    playComboSound(combo);
    setTimeout(() => el.remove(), 1000);
}

function updateCombo(x, y) {
    const now = Date.now();
    if (now - lastCatchTime < 1500) {
        comboCount++;
        if (comboCount >= 3) { showCombo(x, y, comboCount); return comboCount; }
    } else { comboCount = 1; }
    lastCatchTime = now;
    clearTimeout(comboTimeout);
    comboTimeout = setTimeout(() => comboCount = 0, 2000);
    return 1;
}

// Stickers
function addSticker(item) {
    if (!stickerCollection[item.name]) {
        stickerCollection[item.name] = { count: 0, emoji: item.emoji, label: item.label };
        showNewSticker(item);
    }
    stickerCollection[item.name].count++;
    try { localStorage.setItem('emiStickers', JSON.stringify(stickerCollection)); } catch(e) {}
    updateStickerCount();
}

function showNewSticker(item) {
    const toast = document.createElement('div');
    toast.className = 'sticker-toast';
    toast.innerHTML = `<span class="toast-new">✨</span> ${item.emoji} <span class="toast-label">${item.label}</span>`;
    document.body.appendChild(toast);
    const btn = document.getElementById('sticker-btn');
    if (btn) { btn.classList.add('new-sticker-glow'); setTimeout(() => btn.classList.remove('new-sticker-glow'), 2000); }
    setTimeout(() => toast.remove(), 2000);
}

function updateStickerCount() {
    const el = document.getElementById('sticker-count');
    if (el) el.textContent = Object.keys(stickerCollection).length;
}

function showStickerAlbum() {
    const album = document.createElement('div');
    album.className = 'sticker-album';
    album.innerHTML = `
        <div class="album-header"><h2>📖 Sticker-Album</h2><button class="close-album">✕</button></div>
        <div class="album-grid">
            ${unicornItems.map(item => {
                const c = stickerCollection[item.name];
                return `<div class="album-sticker ${c ? 'collected' : 'locked'}">
                    <span class="sticker-emoji">${c ? item.emoji : '❓'}</span>
                    ${c ? `<span class="sticker-count">×${c.count}</span>` : ''}
                </div>`;
            }).join('')}
        </div>
        <div class="album-footer">${Object.keys(stickerCollection).length} / ${unicornItems.length} gesammelt</div>
    `;
    document.body.appendChild(album);
    album.querySelector('.close-album').onclick = () => album.remove();
    album.onclick = (e) => { if (e.target === album) album.remove(); };
}

// Boss
let bossActive = false;
let bossSpawnCounter = 0;

function spawnBoss() {
    if (bossActive) return;
    bossActive = true;
    
    const boss = document.createElement('div');
    boss.className = 'boss-unicorn';
    boss.innerHTML = `<div class="boss-health-bar"><div class="boss-health-fill"></div></div><div class="boss-emoji">🦄</div>`;
    
    let health = 5;
    let posX = Math.random() * (window.innerWidth - 200) + 100;
    let posY = Math.random() * (window.innerHeight - 300) + 100;
    let velX = (Math.random() - 0.5) * 3;
    let velY = (Math.random() - 0.5) * 3;
    
    boss.style.left = posX + 'px'; boss.style.top = posY + 'px';
    boss._itemData = { name: 'boss', emoji: '👑🦄', points: 20, label: 'Boss-Einhorn' };
    
    const hitBoss = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        health--;
        boss.querySelector('.boss-health-fill').style.width = (health / 5 * 100) + '%';
        playBossHit();
        boss.classList.add('boss-hit');
        setTimeout(() => boss.classList.remove('boss-hit'), 200);
        createSparkles(posX + 75, posY + 75, 4);
        if (health <= 0) defeatBoss(boss, posX + 75, posY + 75);
    };
    
    boss.addEventListener('click', hitBoss);
    boss.addEventListener('touchstart', hitBoss, { passive: false });
    boss._hit = hitBoss;
    magicArea.appendChild(boss);
    
    const moveInt = setInterval(() => {
        if (!document.contains(boss)) { clearInterval(moveInt); return; }
        posX += velX; posY += velY;
        if (posX < 0 || posX > window.innerWidth - 150) velX *= -1;
        if (posY < 50 || posY > window.innerHeight - 200) velY *= -1;
        posX = Math.max(0, Math.min(window.innerWidth - 150, posX));
        posY = Math.max(50, Math.min(window.innerHeight - 200, posY));
        boss.style.left = posX + 'px'; boss.style.top = posY + 'px';
    }, 50);
    
    setTimeout(() => {
        if (document.contains(boss) && health > 0) {
            boss.classList.add('boss-escape');
            setTimeout(() => { boss.remove(); bossActive = false; }, 500);
        }
    }, 15000);
}

function defeatBoss(boss, x, y) {
    playBossDefeat();
    boss.classList.add('boss-defeated');
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createSparkles(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 200, 10);
            createRainbowTrail(x + (Math.random() - 0.5) * 150, y + (Math.random() - 0.5) * 150);
        }, i * 100);
    }
    addSticker({ name: 'boss', emoji: '👑🦄', label: 'Boss-Einhorn' });
    points += 20;
    pointsDisplay.textContent = points;
    setTimeout(() => { boss.remove(); bossActive = false; }, 1000);
}

// Main item
function catchItem(element, item) {
    if (element.classList.contains('caught')) return;
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    element.classList.add('caught');
    const mult = updateCombo(x, y);
    
    if (item.name === 'unicorn') { playUnicornSound(); createSparkles(x, y, 12); createRainbowTrail(x, y); }
    else { playMagicPop(); createSparkles(x, y, 5); }
    
    addSticker(item);
    const earned = item.points * mult;
    points += earned;
    pointsDisplay.textContent = points;
    
    if (mult > 1) {
        const p = document.createElement('div');
        p.className = 'points-popup'; p.textContent = `+${earned}`;
        p.style.left = x + 'px'; p.style.top = y + 'px';
        magicArea.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
    
    if (points % 10 === 0) celebrateUnicorn();
    
    bossSpawnCounter++;
    if (bossSpawnCounter >= 20 && Math.random() < 0.3 && !bossActive) {
        bossSpawnCounter = 0;
        setTimeout(spawnBoss, 1000);
    }
    
    setTimeout(() => element.remove(), 300);
}

function createMagicItem() {
    if (!gameStarted) return;
    
    let item;
    const rand = Math.random();
    if (rand < 0.10) item = unicornItems.find(i => i.name === 'unicorn');
    else if (rand < 0.18) item = unicornItems.find(i => i.name === 'rainbow');
    else item = unicornItems[Math.floor(Math.random() * unicornItems.length)];
    
    const el = document.createElement('div');
    el.className = 'magic-item';
    if (item.name === 'unicorn') el.classList.add('unicorn-special');
    if (item.name === 'rainbow') el.classList.add('rainbow-special');
    
    const size = item.size + Math.random() * 25;
    el.style.width = size + 'px'; el.style.height = size + 'px';
    el.style.left = Math.random() * (window.innerWidth - size) + 'px';
    el.style.background = magicColors[Math.floor(Math.random() * magicColors.length)];
    el.style.animationDuration = (8 + Math.random() * 4) + 's';
    
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = item.emoji;
    emoji.style.fontSize = (size * 0.6) + 'px';
    el.appendChild(emoji);
    
    el._itemData = item;
    
    const handle = (e) => { e.preventDefault(); e.stopPropagation(); catchItem(el, item); };
    el.addEventListener('click', handle);
    el.addEventListener('touchstart', handle, { passive: false });
    
    magicArea.appendChild(el);
    setTimeout(() => { if (!el.classList.contains('caught')) el.remove(); }, 12000);
}

function celebrateUnicorn() {
    playUnicornSound();
    const u = document.getElementById('unicorn');
    if (u) { u.classList.add('celebrating'); setTimeout(() => u.classList.remove('celebrating'), 1000); }
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createSparkles(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.7, 8), i * 150);
    }
}

// Hand tracking (camera mode)
function checkHandCollisions() {
    if (!cameraActive) return;
    const items = document.querySelectorAll('.magic-item:not(.caught)');
    const boss = document.querySelector('.boss-unicorn:not(.boss-defeated)');
    
    ['left', 'right'].forEach(hand => {
        const pos = handPositions[hand];
        if (!pos) return;
        
        items.forEach(el => {
            const rect = el.getBoundingClientRect();
            const dist = Math.sqrt(Math.pow(pos.x - (rect.left + rect.width/2), 2) + Math.pow(pos.y - (rect.top + rect.height/2), 2));
            if (dist < (rect.width/2 + 40)) {
                const h = hand === 'left' ? handLeft : handRight;
                if (h) { h.classList.add('grabbing'); setTimeout(() => h.classList.remove('grabbing'), 200); }
                catchItem(el, el._itemData);
            }
        });
        
        if (boss && boss._hit) {
            const rect = boss.getBoundingClientRect();
            const dist = Math.sqrt(Math.pow(pos.x - (rect.left + rect.width/2), 2) + Math.pow(pos.y - (rect.top + rect.height/2), 2));
            if (dist < 100) boss._hit();
        }
    });
}

async function startCameraMode() {
    // Load MediaPipe dynamically
    try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
    } catch(e) {
        alert('Kamera-Bibliotheken konnten nicht geladen werden. Bitte Touch/Klick-Modus verwenden.');
        startTouchMode();
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        webcamElement.srcObject = stream;
        webcamElement.classList.add('active');
        
        const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 2, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        
        hands.onResults((results) => {
            handPositions.left = null; handPositions.right = null;
            if (handLeft) handLeft.classList.remove('active');
            if (handRight) handRight.classList.remove('active');
            
            if (results.multiHandLandmarks && results.multiHandedness) {
                results.multiHandLandmarks.forEach((landmarks, idx) => {
                    const lr = results.multiHandedness[idx].label;
                    const tip = landmarks[8];
                    const x = (1 - tip.x) * window.innerWidth;
                    const y = tip.y * window.innerHeight;
                    const hand = lr === 'Left' ? 'right' : 'left';
                    handPositions[hand] = { x, y };
                    const h = hand === 'left' ? handLeft : handRight;
                    if (h) { h.classList.add('active'); h.style.left = (x - 40) + 'px'; h.style.top = (y - 40) + 'px'; }
                });
            }
            checkHandCollisions();
        });
        
        const camera = new Camera(webcamElement, {
            onFrame: async () => { await hands.send({ image: webcamElement }); },
            width: 640, height: 480
        });
        camera.start();
        cameraActive = true;
        startGame();
    } catch (err) {
        console.error('Camera error:', err);
        alert('Kamera nicht verfügbar. Bitte Touch/Klick-Modus verwenden.');
        startTouchMode();
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

function startTouchMode() {
    if (modeSelector) modeSelector.classList.remove('show');
    startGame();
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    if (modeSelector) modeSelector.classList.remove('show');
    createMagicItem();
    setInterval(createMagicItem, 1500);
    console.log('🦄 Spiel gestartet!');
}

// Init
function init() {
    updateStickerCount();
    
    const stickerBtn = document.getElementById('sticker-btn');
    if (stickerBtn) stickerBtn.addEventListener('click', showStickerAlbum);
    
    if (isMobile) {
        // Mobile: Start immediately with touch
        startGame();
    } else {
        // Desktop: Show mode selector
        if (modeSelector) {
            modeSelector.classList.add('show');
            document.getElementById('mode-touch')?.addEventListener('click', startTouchMode);
            document.getElementById('mode-camera')?.addEventListener('click', () => {
                modeSelector.classList.remove('show');
                startCameraMode();
            });
        } else {
            startGame();
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
