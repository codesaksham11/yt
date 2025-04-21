// --- DOM Elements ---
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');
const gameTitle = document.getElementById('game-title');
const appContainer = document.getElementById('app-container');
const cupGameContainer = document.getElementById('cup-game-container');
const emojiGameContainer = document.getElementById('emoji-game-container');

const cupGameArea = cupGameContainer.querySelector('.game-area');
const cupGameText = cupGameContainer.querySelector('.game-text');
const popperOverlay = cupGameContainer.querySelector('.popper-overlay');

const emojiGameArea = emojiGameContainer.querySelector('.game-area');
const emojiGameText = emojiGameContainer.querySelector('.game-text');

const ohNoSound = document.getElementById('oh-no-sound');
const yeahSound = document.getElementById('yeah-sound');

// --- Game State ---
let currentGame = 1; // Start with Game 1
let gameActive = false; // Flag to track if games are running

// --- Configuration ---
const CUP_COUNT = 3;
const CUP_WIDTH = 120; 
const CUP_SPACING = 80; // Increased space between cups

const EMOJI_GRID_SIZE = 7;
const EMOJI_TOTAL_CELLS = EMOJI_GRID_SIZE * EMOJI_GRID_SIZE;
const EMOJI_OPTIONS = ["😀", "😂", "😍", "🥳", "😎", "😭", "😡", "🤔", "🤯", "👍", "👎", "👻", "👽", "🤖", "🍕", "🍔", "🍎", "⚽️", "🚗", "🚀"];

// Timings (in milliseconds) - SIGNIFICANTLY INCREASED FOR BETTER VISIBILITY
const T_CUP_INTRO = 3000;         // 3s - Show the cups and ball
const T_CUP_BALL_HIDE = 4000;     // 4s - Time for ball to hide under cup
const T_CUP_SHUFFLE = 8000;       // 8s - Slower shuffling
const T_CUP_WAIT = 4000;          // 4s - Wait time after shuffle
const T_CUP_REVEAL_LOSER = 2500;  // 2.5s - Each loser reveal
const T_CUP_REVEAL_WINNER = 3000; // 3s - Winner reveal time
const T_CUP_CELEBRATE = 5000;     // 5s - Celebration time
const T_CUP_TOTAL = T_CUP_INTRO + T_CUP_BALL_HIDE + T_CUP_SHUFFLE + T_CUP_WAIT + (T_CUP_REVEAL_LOSER * 2) + T_CUP_REVEAL_WINNER + T_CUP_CELEBRATE;

const T_EMOJI_INTRO = 3000;       // 3s - Intro time
const T_EMOJI_WAIT = 10000;       // 10s - Time to find the odd emoji
const T_EMOJI_HIGHLIGHT = 5000;   // 5s - Highlight time
const T_EMOJI_PAUSE = 2000;       // 2s - Pause before next game
const T_EMOJI_TOTAL = T_EMOJI_INTRO + T_EMOJI_WAIT + T_EMOJI_HIGHLIGHT + T_EMOJI_PAUSE;

// --- Sound Helper ---
function playSound(soundElement) {
    soundElement.currentTime = 0;
    soundElement.play().catch(error => {
        console.error("Audio play failed:", error);
    });
}

// --- Initialize Event Listeners ---
startButton.addEventListener('click', function() {
    // Hide the start overlay
    startOverlay.style.display = 'none';
    
    // Set flag and start game loop
    gameActive = true;
    runGameLoop();
    
    // Play a sound to confirm audio permissions
    playSound(yeahSound);
});

// --- Popper Helper ---
function showPoppers() {
    popperOverlay.innerHTML = '';
    const popperCount = 50; // More poppers!

    for (let i = 0; i < popperCount; i++) {
        const popper = document.createElement('div');
        popper.classList.add('popper');
        // Random size for more fun
        const size = 5 + Math.random() * 15;
        popper.style.width = `${size}px`;
        popper.style.height = `${size * 2}px`;
        // Random horizontal start position
        popper.style.left = `${Math.random() * 100}%`;
        // Random animation delay for staggered effect
        popper.style.animationDelay = `${Math.random() * 1}s`;
        popperOverlay.appendChild(popper);

        // Remove popper after animation
        setTimeout(() => {
            popper.remove();
        }, 4500);
    }
    playSound(yeahSound);
}

// --- Game 1: Cup Game Logic ---
function runCupGame() {
    console.log("Starting Cup Game");
    
    // --- Setup ---
    cupGameArea.innerHTML = '';
    cupGameText.textContent = 'WATCH THE BALL!';
    popperOverlay.innerHTML = '';

    const cups = [];
    const ball = document.createElement('div');
    ball.classList.add('ball');
    cupGameArea.appendChild(ball);

    const winningCupIndex = Math.floor(Math.random() * CUP_COUNT);
    let cupElements = [];

    // Calculate starting positions for cups
    const totalWidth = CUP_COUNT * CUP_WIDTH + (CUP_COUNT - 1) * CUP_SPACING;
    const startLeft = (cupGameArea.offsetWidth - totalWidth) / 2;

    for (let i = 0; i < CUP_COUNT; i++) {
        const cup = document.createElement('div');
        cup.classList.add('cup');
        cup.dataset.index = i;
        const leftPos = startLeft + i * (CUP_WIDTH + CUP_SPACING);
        cup.style.left = `${leftPos}px`;
        cup.style.bottom = '20px';
        cupElements.push(cup);
        cupGameArea.appendChild(cup);

        if (i === winningCupIndex) {
            cup.dataset.hasBall = "true";
        }
    }

    // Initial ball position
    ball.style.left = `${cupElements[winningCupIndex].offsetLeft + (CUP_WIDTH / 2) - 30}px`;
    ball.style.bottom = '60px';
    ball.style.opacity = '1';

    // --- Animation Sequence ---
    
    // 0. Introduction text
    setTimeout(() => {
        cupGameText.textContent = "BALL GOES UNDER A CUP!";
    }, 1000);

    // 1. Animate ball hiding
    setTimeout(() => {
        cupGameText.textContent = "WATCH CAREFULLY NOW!";
        // Move ball under the winning cup
        const targetLeft = cupElements[winningCupIndex].offsetLeft + (CUP_WIDTH / 2) - 30;
        ball.style.left = `${targetLeft}px`;
        ball.style.animation = `hideBall 2s ease-in forwards`;
        ball.style.bottom = '30px';
    }, T_CUP_INTRO);

    // 2. Shuffle Cups
    setTimeout(() => {
        cupGameText.textContent = "CUPS ARE SHUFFLING!";
        ball.style.opacity = '0'; // Hide ball completely during shuffle
        shuffleCups(cupElements);
    }, T_CUP_INTRO + T_CUP_BALL_HIDE);

    // 3. Show "Which Cup?" Text
    setTimeout(() => {
        cupGameText.textContent = "WHICH CUP HAS THE BALL???";
        // Add bigger pulse animation
        cupGameText.style.animation = "pulseText 0.8s infinite ease-in-out";
    }, T_CUP_INTRO + T_CUP_BALL_HIDE + T_CUP_SHUFFLE);

    // 4. Reveal Losing Cups
    setTimeout(() => {
        cupGameText.textContent = "LET'S CHECK...";
        
        // First losing cup
        const losers = cupElements.filter(cup => cup.dataset.hasBall !== "true");
        
        setTimeout(() => {
            losers[0].style.animation = `liftCup 1s ease-out forwards`;
            losers[0].classList.add('wrong');
            playSound(ohNoSound);
        }, 500);
        
        // Second losing cup with delay
        setTimeout(() => {
            losers[1].style.animation = `liftCup 1s ease-out forwards`;
            losers[1].classList.add('wrong');
            playSound(ohNoSound);
        }, 3000);
        
    }, T_CUP_INTRO + T_CUP_BALL_HIDE + T_CUP_SHUFFLE + T_CUP_WAIT);

    // 5. Reveal Winning Cup
    setTimeout(() => {
        cupGameText.textContent = "HERE IT IS!!!";
        
        const winningCup = cupElements.find(cup => cup.dataset.hasBall === "true");
        winningCup.style.animation = `liftCup 1s ease-out forwards`;
        winningCup.classList.add('winner');
        
        // Make ball visible again
        setTimeout(() => {
            ball.style.opacity = '1';
            const cupPos = winningCup.offsetLeft + (CUP_WIDTH / 2) - 30;
            ball.style.left = `${cupPos}px`;
            playSound(yeahSound);
        }, 500);
        
    }, T_CUP_INTRO + T_CUP_BALL_HIDE + T_CUP_SHUFFLE + T_CUP_WAIT + (T_CUP_REVEAL_LOSER * 2));

    // 6. Celebration Poppers
    setTimeout(() => {
        cupGameText.textContent = "AWESOME JOB!";
        showPoppers();
    }, T_CUP_INTRO + T_CUP_BALL_HIDE + T_CUP_SHUFFLE + T_CUP_WAIT + (T_CUP_REVEAL_LOSER * 2) + T_CUP_REVEAL_WINNER);

    // 7. Transition to Next Game
    setTimeout(() => {
        console.log("Transitioning to Emoji Game");
        currentGame = 2;
        if (gameActive) runGameLoop();
    }, T_CUP_TOTAL);
}

// --- Cup Shuffle Helper ---
function shuffleCups(cupElements) {
    const shuffleSteps = 8; // Fewer but more noticeable swaps
    const stepDuration = T_CUP_SHUFFLE / shuffleSteps;
    let currentStep = 0;

    function doShuffleStep() {
        if (currentStep >= shuffleSteps) return;

        // Pick two random distinct cup indices
        let i1 = Math.floor(Math.random() * CUP_COUNT);
        let i2 = Math.floor(Math.random() * CUP_COUNT);
        while (i1 === i2) {
            i2 = Math.floor(Math.random() * CUP_COUNT);
        }

        // Get current positions
        const cup1 = cupElements[i1];
        const cup2 = cupElements[i2];
        const pos1 = cup1.style.left;
        const pos2 = cup2.style.left;

        // Swap positions (CSS transition handles the movement)
        cup1.style.left = pos2;
        cup2.style.left = pos1;

        // Swap elements in the array
        [cupElements[i1], cupElements[i2]] = [cupElements[i2], cupElements[i1]];

        currentStep++;
        setTimeout(doShuffleStep, stepDuration);
    }

    doShuffleStep();
}

// --- Game 2: Emoji Game Logic ---
function runEmojiGame() {
    console.log("Starting Emoji Game");
    
    // --- Setup ---
    emojiGameArea.innerHTML = '';
    emojiGameText.textContent = "GET READY FOR EMOJI CHALLENGE!";

    // Choose common and odd emoji
    let commonEmoji = EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
    let oddEmoji = EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
    while (commonEmoji === oddEmoji) {
        oddEmoji = EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
    }

    const oddEmojiIndex = Math.floor(Math.random() * EMOJI_TOTAL_CELLS);
    let oddEmojiElement = null;

    // Create grid
    for (let i = 0; i < EMOJI_TOTAL_CELLS; i++) {
        const cell = document.createElement('span');
        cell.classList.add('emoji-cell');
        if (i === oddEmojiIndex) {
            cell.textContent = oddEmoji;
            cell.dataset.isOdd = "true";
            oddEmojiElement = cell;
        } else {
            cell.textContent = commonEmoji;
        }
        emojiGameArea.appendChild(cell);
    }

    // --- Animation Sequence ---
    
    // 1. Introduction
    setTimeout(() => {
        emojiGameText.textContent = "FIND THE ODD ONE OUT!";
    }, T_EMOJI_INTRO);

    // 2. Wait and Highlight
    setTimeout(() => {
        emojiGameText.textContent = "DID YOU SPOT IT?";
    }, T_EMOJI_INTRO + T_EMOJI_WAIT / 2);
    
    setTimeout(() => {
        emojiGameText.textContent = "HERE IT IS!";
        if (oddEmojiElement) {
            oddEmojiElement.classList.add('highlight');
        }
    }, T_EMOJI_INTRO + T_EMOJI_WAIT);

    // 3. Celebration
    setTimeout(() => {
        emojiGameText.textContent = "GREAT JOB!";
        playSound(yeahSound);
    }, T_EMOJI_INTRO + T_EMOJI_WAIT + T_EMOJI_HIGHLIGHT / 2);

    // 4. Remove Highlight and Transition
    setTimeout(() => {
        console.log("Transitioning to Cup Game");
        if (oddEmojiElement) {
            oddEmojiElement.classList.remove('highlight');
        }
        currentGame = 1;
        if (gameActive) runGameLoop();
    }, T_EMOJI_INTRO + T_EMOJI_WAIT + T_EMOJI_HIGHLIGHT + T_EMOJI_PAUSE);
}

// --- Master Game Loop ---
function runGameLoop() {
    console.log(`--- Running Game ${currentGame} ---`);
    if (currentGame === 1) {
        cupGameContainer.classList.replace('hidden-game', 'active-game');
        emojiGameContainer.classList.replace('active-game', 'hidden-game');
        runCupGame();
    } else { // currentGame === 2
        emojiGameContainer.classList.replace('hidden-game', 'active-game');
        cupGameContainer.classList.replace('active-game', 'hidden-game');
        runEmojiGame();
    }
}

// --- Initialisation ---
// Do NOT auto-start - wait for button click instead
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded - Hypno Loop V2 ready");
    // Display start overlay - do not auto-start
});
