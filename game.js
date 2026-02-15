// Emis Einhorn-Spiel 🦄

const magicArea = document.getElementById('magic-area');
const pointsDisplay = document.getElementById('points');
let points = 0;

// Magical items that can appear
const magicItems = ['⭐', '🌟', '💖', '💜', '🦋', '🌈', '✨', '🎀', '💫', '🌸'];
const bubbleColors = [
    'rgba(255, 182, 193, 0.7)',  // pink
    'rgba(221, 160, 221, 0.7)',  // plum
    'rgba(230, 230, 250, 0.7)',  // lavender
    'rgba(176, 224, 230, 0.7)',  // powder blue
    'rgba(255, 218, 233, 0.7)',  // light pink
    'rgba(200, 162, 200, 0.7)',  // lilac
];

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playPopSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playMagicSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
}

function createSparkles(x, y) {
    const sparkles = ['✨', '⭐', '💫', '🌟'];
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
        sparkle.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
        magicArea.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 600);
    }
}

function createRainbow(x, y) {
    if (Math.random() < 0.3) { // 30% chance for rainbow
        const rainbow = document.createElement('div');
        rainbow.className = 'rainbow';
        rainbow.style.left = (x - 100) + 'px';
        rainbow.style.top = (y - 50) + 'px';
        magicArea.appendChild(rainbow);
        
        setTimeout(() => rainbow.remove(), 1000);
    }
}

function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    const size = 60 + Math.random() * 40;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * (window.innerWidth - size) + 'px';
    bubble.style.backgroundColor = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = magicItems[Math.floor(Math.random() * magicItems.length)];
    bubble.appendChild(emoji);
    
    // Pop on click/touch
    const popBubble = (e) => {
        e.preventDefault();
        if (bubble.classList.contains('popped')) return;
        
        // Resume audio context on first interaction
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const rect = bubble.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        bubble.classList.add('popped');
        playPopSound();
        createSparkles(x, y);
        createRainbow(x, y);
        
        points += 1;
        pointsDisplay.textContent = points;
        
        // Special celebration every 10 points
        if (points % 10 === 0) {
            playMagicSound();
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createSparkles(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight
                    );
                }, i * 100);
            }
        }
        
        setTimeout(() => bubble.remove(), 300);
    };
    
    bubble.addEventListener('click', popBubble);
    bubble.addEventListener('touchstart', popBubble);
    
    magicArea.appendChild(bubble);
    
    // Remove bubble after animation
    setTimeout(() => {
        if (!bubble.classList.contains('popped')) {
            bubble.remove();
        }
    }, 4000);
}

// Create bubbles at intervals
function startGame() {
    createBubble();
    setInterval(createBubble, 1200);
}

// Start when page loads
window.addEventListener('load', startGame);

// Handle window resize
window.addEventListener('resize', () => {
    // Bubbles will naturally stay in bounds on new ones
});
