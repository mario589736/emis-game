// 🦄 Emis Einhorn-Spiel 🦄

const magicArea = document.getElementById('magic-area');
const pointsDisplay = document.getElementById('points');
let points = 0;

// Einhorn-themed items! 
const unicornItems = [
    { emoji: '🦄', size: 70, points: 3, name: 'unicorn' },
    { emoji: '🌈', size: 80, points: 2, name: 'rainbow' },
    { emoji: '☁️', size: 60, points: 1, name: 'cloud' },
    { emoji: '⭐', size: 50, points: 1, name: 'star' },
    { emoji: '💜', size: 45, points: 1, name: 'heart' },
    { emoji: '🎀', size: 45, points: 1, name: 'bow' },
    { emoji: '✨', size: 40, points: 1, name: 'sparkle' },
    { emoji: '🌸', size: 50, points: 1, name: 'flower' },
];

// Pastel rainbow colors for backgrounds
const magicColors = [
    'radial-gradient(circle, rgba(255,182,193,0.8) 0%, rgba(255,105,180,0.4) 100%)',
    'radial-gradient(circle, rgba(221,160,221,0.8) 0%, rgba(186,85,211,0.4) 100%)',
    'radial-gradient(circle, rgba(173,216,230,0.8) 0%, rgba(135,206,250,0.4) 100%)',
    'radial-gradient(circle, rgba(255,218,233,0.8) 0%, rgba(255,182,193,0.4) 100%)',
    'radial-gradient(circle, rgba(230,230,250,0.8) 0%, rgba(200,162,200,0.4) 100%)',
];

// Sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playMagicPop() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.25);
}

function playUnicornSound() {
    // Special magical chord for unicorns!
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

function createMagicItem() {
    // Weight towards unicorns appearing sometimes
    let item;
    const rand = Math.random();
    if (rand < 0.15) {
        item = unicornItems[0]; // Unicorn (15% chance)
    } else if (rand < 0.25) {
        item = unicornItems[1]; // Rainbow (10% chance)
    } else {
        item = unicornItems[2 + Math.floor(Math.random() * (unicornItems.length - 2))];
    }
    
    const element = document.createElement('div');
    element.className = 'magic-item';
    if (item.name === 'unicorn') element.classList.add('unicorn-special');
    if (item.name === 'rainbow') element.classList.add('rainbow-special');
    
    const baseSize = item.size + Math.random() * 20;
    element.style.width = baseSize + 'px';
    element.style.height = baseSize + 'px';
    element.style.left = Math.random() * (window.innerWidth - baseSize) + 'px';
    element.style.background = magicColors[Math.floor(Math.random() * magicColors.length)];
    element.style.animationDuration = (3.5 + Math.random() * 2) + 's';
    
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = item.emoji;
    emoji.style.fontSize = (baseSize * 0.6) + 'px';
    element.appendChild(emoji);
    
    // Pop on click/touch
    const catchItem = (e) => {
        e.preventDefault();
        if (element.classList.contains('caught')) return;
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
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
        
        // Big celebration every 15 points
        if (points % 15 === 0) {
            celebrateUnicorn();
        }
        
        setTimeout(() => element.remove(), 300);
    };
    
    element.addEventListener('click', catchItem);
    element.addEventListener('touchstart', catchItem);
    
    magicArea.appendChild(element);
    
    setTimeout(() => {
        if (!element.classList.contains('caught')) {
            element.remove();
        }
    }, 5500);
}

function celebrateUnicorn() {
    playUnicornSound();
    
    // Unicorn does a happy dance
    const unicorn = document.getElementById('unicorn');
    unicorn.classList.add('celebrating');
    setTimeout(() => unicorn.classList.remove('celebrating'), 1000);
    
    // Sparkle explosion!
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createSparkles(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight * 0.7,
                8
            );
        }, i * 150);
    }
}

// Start game
function startGame() {
    createMagicItem();
    setInterval(createMagicItem, 1000);
}

window.addEventListener('load', startGame);
