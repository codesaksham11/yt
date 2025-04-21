// --- DOM Elements ---
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

// --- Configuration ---
const CUP_COUNT = 3;
const CUP_WIDTH = 120; // Must match CSS roughly for positioning
const CUP_SPACING = 50; // Space between cups

const EMOJI_GRID_SIZE = 7;
const EMOJI_TOTAL_CELLS = EMOJI_GRID_SIZE * EMOJI_GRID_SIZE;
// List of potential emojis (add more diverse ones!)
const EMOJI_OPTIONS = ["😀", "😂", "😍", "🥳", "😎", "😭", "😡", "🤔", "🤯", "👍", "👎", "👻", "👽", "🤖", "🍕", "🍔", "🍎", "⚽️", "🚗", "🚀"];

// Timings (in milliseconds)
const T_CUP_BALL_HIDE = 3000;       // 3s
const T_CUP_SHUFFLE = 5000;        // 5s
const T_CUP_WAIT = 7000;           // 7s
const T_CUP_REVEAL_LOSER = 2000;   // 2s
const T_CUP_REVEAL_WINNER = 2000;  // 2s
const T_CUP_CELEBRATE = 3000;      // 3s (Popper duration)
const T_CUP_TOTAL = T_CUP_BALL_HIDE + T_CUP_SHUFFLE + T_CUP_WAIT + (T_CUP_REVEAL_LOSER * 2) + T_CUP_REVEAL_WINNER + T_CUP_CELEBRATE; // ~24s

const T_EMOJI_WAIT = 8000;         // 8s
const T_EMOJI_HIGHLIGHT = 4000;    // 4s
const T_EMOJI_PAUSE = 1000;        // 1s
const T_EMOJI_TOTAL = T_EMOJI_WAIT + T_EMOJI_HIGHLIGHT + T_EMOJI_PAUSE; // ~13s


// --- Sound Helper ---
function playSound(soundElement) {
    // Reset playback position and attempt to play
    soundElement.currentTime = 0;
    soundElement.play().catch(error => {
        // Silently catch errors - browser likely blocked autoplay
        // console.error("Audio play failed:", error);
    });
}

// --- Popper Helper ---
function showPoppers() {
    popperOverlay.innerHTML = ''; // Clear old poppers
    const popperCount = 20; // How many poppers to show

    for (let i = 0; i < popperCount; i++) {
        const popper = document.createElement('div');
        popper.classList.add('popper');
        // Random horizontal start position
        popper.style.left = `${Math.random() * 100}%`;
        // Random animation delay for staggered effect
        popper.style.animationDelay = `${Math.random() * 0.5}s`;
        popperOverlay.appendChild(popper);

        // Remove popper after animation (3s duration + small buffer)
        setTimeout(() => {
            popper.remove();
        }, 3500);
    }
     playSound(yeahSound); // Play celebration sound with poppers
}


// --- Game 1: Cup Game Logic ---
function runCupGame() {
    console.log("Starting Cup Game");
    // --- Setup ---
    cupGameArea.innerHTML = ''; // Clear previous elements
    cupGameText.textContent = ''; // Clear text
    popperOverlay.innerHTML = ''; // Clear poppers

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
        cup.dataset.index = i; // Store original index if needed
        const leftPos = startLeft + i * (CUP_WIDTH + CUP_SPACING);
        cup.style.left = `${leftPos}px`;
        cup.style.bottom = '20px'; // Starting position from CSS
        cupElements.push(cup);
        cupGameArea.appendChild(cup);

        // Store reference to the winning cup element
        if (i === winningCupIndex) {
            cup.dataset.hasBall = "true";
        }
    }

    const winningCupElement = cupElements[winningCupIndex];
    const winningCupRect = winningCupElement.getBoundingClientRect();
    const gameAreaRect = cupGameArea.getBoundingClientRect();

    // Initial ball position calculation (center of game area horizontally, below cups)
    ball.style.left = `${cupGameArea.offsetWidth / 2}px`; // Centered initially
    ball.style.bottom = '60px'; // Position slightly above where it will hide

    // --- Animation Sequence ---

    // 1. Animate ball hiding
    setTimeout(() => {
        console.log("Hiding ball under cup:", winningCupIndex);
        // Move ball towards the winning cup's horizontal center
        const targetLeft = winningCupElement.offsetLeft + (CUP_WIDTH / 2) - (ball.offsetWidth / 2);
        ball.style.left = `${targetLeft}px`;
        // Apply hiding animation (moves down, fades slightly, shrinks - defined in CSS)
        ball.style.animation = `hideBall 0.5s ease-in forwards`;
        ball.style.bottom = '30px'; // Final vertical position under cup (visually)
    }, 500); // Small delay before hiding starts

    // 2. Shuffle Cups
    setTimeout(() => {
        console.log("Shuffling cups");
        ball.style.display = 'none'; // Hide ball completely during shuffle
        shuffleCups(cupElements);
    }, T_CUP_BALL_HIDE);

    // 3. Show "Which Cup?" Text (after shuffle finishes)
    setTimeout(() => {
        console.log("Showing 'Which Cup?' text");
        cupGameText.textContent = "WHICH CUP???";
         // Ensure pulsing animation is active (it's default on .game-text)
    }, T_CUP_BALL_HIDE + T_CUP_SHUFFLE);

    // 4. Reveal Losing Cups
    setTimeout(() => {
        console.log("Revealing losers");
        let losersRevealed = 0;
        cupElements.forEach((cup, index) => {
            if (cup.dataset.hasBall !== "true") {
                // Stagger the reveals slightly
                setTimeout(() => {
                    cup.style.animation = `liftCup 0.5s ease-out forwards`;
                    playSound(ohNoSound);
                }, losersRevealed * (T_CUP_REVEAL_LOSER / 2) ); // Reveal losers one after another within the loser reveal time
                 losersRevealed++;
            }
        });
    }, T_CUP_BALL_HIDE + T_CUP_SHUFFLE + T_CUP_WAIT);

    // 5. Reveal Winning Cup
    setTimeout(() => {
        console.log("Revealing winner");
         cupElements.forEach(cup => {
            if (cup.dataset.hasBall === "true") {
                cup.style.animation = `liftCup 0.5s ease-out forwards`;
                // Make ball visible again under the lifted cup
                ball.style.display = 'block';
                ball.style.opacity = '1';
                ball.style.transform = 'translateX(-50%) scale(1)'; // Reset scale if needed
                const cupRect = cup.getBoundingClientRect();
                 const gameAreaRect = cupGameArea.getBoundingClientRect();
                ball.style.left = `${cup.offsetLeft + (CUP_WIDTH / 2) - (ball.offsetWidth / 2)}px`; // Ensure ball is centered under winner
                ball.style.bottom = '30px'; // Position ball correctly
                playSound(yeahSound); // Play win sound immediately
            }
        });
         cupGameText.textContent = "!!!"; // Change text
    }, T_CUP_BALL_HIDE + T_CUP_SHUFFLE + T_CUP_WAIT + T_CUP_REVEAL_LOSER * 2); // After both losers revealed

    // 6. Celebration Poppers
    setTimeout(() => {
        console.log("Showing poppers");
        showPoppers();
        cupGameText.textContent = ""; // Clear text during celebration
    }, T_CUP_BALL_HIDE + T_CUP_SHUFFLE + T_CUP_WAIT + (T_CUP_REVEAL_LOSER * 2) + T_CUP_REVEAL_WINNER);

    // 7. Transition to Next Game
    setTimeout(() => {
        console.log("Transitioning to Emoji Game");
        currentGame = 2;
        runGameLoop();
    }, T_CUP_TOTAL);
}

// --- Cup Shuffle Helper ---
function shuffleCups(cupElements) {
    const shuffleSteps = 10; // Number of quick swaps
    const stepDuration = T_CUP_SHUFFLE / shuffleSteps;
    let currentStep = 0;

    function doShuffleStep() {
        if (currentStep >= shuffleSteps) return; // Shuffle complete

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

        // Swap elements in the array too, so reveal logic works correctly
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
    emojiGameArea.innerHTML = ''; // Clear previous grid
    emojiGameText.textContent = "FIND THE ODD ONE!"; // Set text

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
            oddEmojiElement = cell; // Store reference to the odd one
        } else {
            cell.textContent = commonEmoji;
        }
        emojiGameArea.appendChild(cell);
    }

    // --- Animation Sequence ---

    // 1. Wait and Highlight
    setTimeout(() => {
        console.log("Highlighting odd emoji");
        if (oddEmojiElement) {
            oddEmojiElement.classList.add('highlight');
        }
         emojiGameText.textContent = "!!!"; // Change text
    }, T_EMOJI_WAIT);

    // 2. Remove Highlight and Transition
    setTimeout(() => {
        console.log("Transitioning to Cup Game");
         if (oddEmojiElement) {
            oddEmojiElement.classList.remove('highlight');
        }
        currentGame = 1;
        runGameLoop();
    }, T_EMOJI_WAIT + T_EMOJI_HIGHLIGHT); // Total time before transition starts
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
// Ensure DOM is fully loaded before starting
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded - Starting Hypno Loop V1");
    runGameLoop(); // Start the first game
});
