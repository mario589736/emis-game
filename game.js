// 🦄 Emis Einhorn-Spiel mit Handerkennung! 🖐️

const magicArea = document.getElementById('magic-area');
const pointsDisplay = document.getElementById('points');
const webcamElement = document.getElementById('webcam');
const startCameraBtn = document.getElementById('start-camera');
const handLeft = document.getElementById('hand-left');
const handRight = document.getElementById('hand-right');

let points = 0;
let handPositions = { left: null, right: null };
let cameraActive = false;

// Items
const unicornItems = [
    { emoji: '🍦', size: 75, points: 2, name: 'icecream' },
    { emoji: '🐶', size: 80, points: 2, name: 'dog' },
    { emoji: '🐱', size: 80, points: 2, name: 'cat' },
    { emoji: '🐕', size: 75, points: 2, name: 'puppy' },
    { emoji: '🐈', size: 75, points: 2, name: 'kitty' },
    { emoji: '🍨', size: 70, points: 2, name: 'sundae' },
    { emoji: '🦄', size: 90, points: 3, name: 'unicorn' },
    { emoji: '🌈', size: 100, points: 2, name: 'rainbow' },
    { emoji: '☁️', size: 80, points: 1, name: 'cloud' },
    { emoji: '⭐', size: 70, points: 1, name: 'star' },
    { emoji: '💜', size: 65, points: 1, name: 'heart' },
    { emoji: '🎀', size: 65, points: 1, name: 'bow' },
    { emoji: '✨', size: 60, points: 1, name: 'sparkle' },
    { emoji: '🌸', size: 70, points: 1, name: 'flower' },
];

const magicColors = [
    'radial-gradient(circle, rgba(255,182,193,0.8) 0%, rgba(255,105,180,0.4) 100%)',
    'radial-gradient(circle, rgba(221,160,221,0.8) 0%, rgba(186,85,211,0.4) 100%)',
    'radial-gradient(circle, rgba(173,216,230,0.8) 0%, rgba(135,206,250,0.4) 100%)',
    'radial-gradient(circle, rgba(255,218,233,0.8) 0%, rgba(255,182,193,0.4) 100%)',
    'radial-gradient(circle, rgba(230,230,250,0.8) 0%, rgba(200,162,200,0.4) 100%)',
];

// Audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playMagicPop() {
    if (audioContext.state === 'suspended') audioContext.resume();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.25);
}

function playUnicornSound() {
    if (audioContext.state === 'suspended') audioContext.resume();
    [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5 + i * 0.05);
        osc.start(audioContext.currentTime + i * 0.05);
        osc.stop(audioContext.currentTime + 0.5 + i * 0.05);
    });
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

function catchItem(element, item) {
    if (element.classList.contains('caught')) return;
    
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    element.classList.add('caught');
    
    if (item.name === 'unicorn') {
        playUnicornSound();
        createSparkles(x, y, 12);
        createRainbowTrail(x, y);
    } else {
        playMagicPop();
        createSparkles(x, y, 5);
    }
    
    points += item.points;
    pointsDisplay.textContent = points;
    
    if (points % 10 === 0) celebrateUnicorn();
    
    setTimeout(() => element.remove(), 300);
}

function createMagicItem() {
    let item;
    const rand = Math.random();
    if (rand < 0.12) item = unicornItems.find(i => i.name === 'unicorn');
    else if (rand < 0.20) item = unicornItems.find(i => i.name === 'rainbow');
    else item = unicornItems[Math.floor(Math.random() * unicornItems.length)];
    
    const element = document.createElement('div');
    element.className = 'magic-item';
    element.dataset.itemName = item.name;
    if (item.name === 'unicorn') element.classList.add('unicorn-special');
    if (item.name === 'rainbow') element.classList.add('rainbow-special');
    
    const baseSize = item.size + Math.random() * 25;
    element.style.width = baseSize + 'px';
    element.style.height = baseSize + 'px';
    element.style.left = Math.random() * (window.innerWidth - baseSize) + 'px';
    element.style.background = magicColors[Math.floor(Math.random() * magicColors.length)];
    element.style.animationDuration = (8 + Math.random() * 4) + 's';
    
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = item.emoji;
    emoji.style.fontSize = (baseSize * 0.6) + 'px';
    element.appendChild(emoji);
    
    // Store item data for hand collision
    element._itemData = item;
    
    // Touch/click still works
    const handleCatch = (e) => {
        e.preventDefault();
        catchItem(element, item);
    };
    element.addEventListener('click', handleCatch);
    element.addEventListener('touchstart', handleCatch);
    
    magicArea.appendChild(element);
    
    setTimeout(() => {
        if (!element.classList.contains('caught')) element.remove();
    }, 12000);
}

function celebrateUnicorn() {
    playUnicornSound();
    const unicorn = document.getElementById('unicorn');
    unicorn.classList.add('celebrating');
    setTimeout(() => unicorn.classList.remove('celebrating'), 1000);
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createSparkles(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.7, 8);
        }, i * 150);
    }
}

// ========== HAND TRACKING ==========

function checkHandCollisions() {
    if (!cameraActive) return;
    
    const items = document.querySelectorAll('.magic-item:not(.caught)');
    
    ['left', 'right'].forEach(hand => {
        const pos = handPositions[hand];
        if (!pos) return;
        
        items.forEach(element => {
            const rect = element.getBoundingClientRect();
            const itemCenterX = rect.left + rect.width / 2;
            const itemCenterY = rect.top + rect.height / 2;
            
            // Check if hand is close to item (within ~80px)
            const distance = Math.sqrt(
                Math.pow(pos.x - itemCenterX, 2) + 
                Math.pow(pos.y - itemCenterY, 2)
            );
            
            if (distance < (rect.width / 2 + 40)) {
                // Caught it!
                const handEl = hand === 'left' ? handLeft : handRight;
                handEl.classList.add('grabbing');
                setTimeout(() => handEl.classList.remove('grabbing'), 200);
                
                catchItem(element, element._itemData);
            }
        });
    });
}

async function startHandTracking() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 640, height: 480 } 
        });
        webcamElement.srcObject = stream;
        webcamElement.classList.add('active');
        startCameraBtn.classList.add('hidden');
        
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0, // Faster
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        hands.onResults((results) => {
            // Reset positions
            handPositions.left = null;
            handPositions.right = null;
            handLeft.classList.remove('active');
            handRight.classList.remove('active');
            
            if (results.multiHandLandmarks && results.multiHandedness) {
                results.multiHandLandmarks.forEach((landmarks, idx) => {
                    const handedness = results.multiHandedness[idx].label;
                    
                    // Get index finger tip (landmark 8) for pointing
                    const indexTip = landmarks[8];
                    
                    // Mirror X coordinate and convert to screen space
                    const x = (1 - indexTip.x) * window.innerWidth;
                    const y = indexTip.y * window.innerHeight;
                    
                    // MediaPipe labels are from camera's perspective, so flip
                    const hand = handedness === 'Left' ? 'right' : 'left';
                    handPositions[hand] = { x, y };
                    
                    // Update hand cursor
                    const handEl = hand === 'left' ? handLeft : handRight;
                    handEl.classList.add('active');
                    handEl.style.left = (x - 40) + 'px';
                    handEl.style.top = (y - 40) + 'px';
                });
            }
            
            checkHandCollisions();
        });
        
        const camera = new Camera(webcamElement, {
            onFrame: async () => {
                await hands.send({ image: webcamElement });
            },
            width: 640,
            height: 480
        });
        camera.start();
        
        cameraActive = true;
        
    } catch (err) {
        console.error('Camera error:', err);
        alert('Kamera konnte nicht gestartet werden. Spiel funktioniert trotzdem mit Touch! 📱');
    }
}

// Start camera button
startCameraBtn.addEventListener('click', startHandTracking);

// Start game
function startGame() {
    createMagicItem();
    setInterval(createMagicItem, 1500);
}

window.addEventListener('load', startGame);
