// LUNA OMNI-VAULT - Multi-Game Arcade System

class LunaArcadeSystem {
    constructor() {
        this.currentGame = 'sliding';
        this.games = {
            sliding: new SlidingTileGame(),
            memory: new MemoryMatchGame(),
            math: new MathChallengeGame()
        };
        
        this.initializeArcade();
    }

    // Initialize the arcade system
    initializeArcade() {
        this.bindEvents();
        this.switchGame('sliding');
        this.initializeGames();
    }

    // Bind arcade events
    bindEvents() {
        // Game tab switching
        const gameTabs = document.querySelectorAll('.game-tab');
        gameTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const gameType = tab.dataset.game;
                this.switchGame(gameType);
            });
        });
    }

    // Switch between games
    switchGame(gameType) {
        // Update tab states
        document.querySelectorAll('.game-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-game="${gameType}"]`).classList.add('active');

        // Update game content visibility
        document.querySelectorAll('.game-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${gameType}-game`).classList.add('active');

        // Initialize the selected game
        this.currentGame = gameType;
        this.games[gameType].initialize();
    }

    // Initialize all games
    initializeGames() {
        Object.values(this.games).forEach(game => game.initialize());
    }
}

// ==================== SLIDING TILE GAME ====================

class SlidingTileGame {
    constructor() {
        this.tiles = [];
        this.emptyIndex = 15;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameActive = false;
    }

    initialize() {
        this.createPuzzle();
        this.bindEvents();
        this.updateDisplay();
    }

    createPuzzle() {
        this.tiles = [...Array(15).keys()].map(x => x + 1);
        this.tiles.push(null);
        this.emptyIndex = 15;
        this.moves = 0;
        this.timer = 0;
        this.isGameActive = false;
        
        this.renderPuzzle();
    }

    renderPuzzle() {
        const grid = document.getElementById('sliding-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.tiles.forEach((tileValue, index) => {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            
            if (tileValue === null) {
                tile.classList.add('empty');
            } else {
                tile.textContent = tileValue;
                tile.dataset.value = tileValue;
                tile.dataset.index = index;
                
                if (this.isAdjacent(index, this.emptyIndex)) {
                    tile.classList.add('movable');
                }
            }
            
            tile.addEventListener('click', () => this.handleTileClick(index));
            grid.appendChild(tile);
        });
    }

    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / 4);
        const col1 = index1 % 4;
        const row2 = Math.floor(index2 / 4);
        const col2 = index2 % 4;
        
        return (row1 === row2 && Math.abs(col1 - col2) === 1) ||
               (col1 === col2 && Math.abs(row1 - row2) === 1);
    }

    handleTileClick(tileIndex) {
        if (!this.isGameActive) return;
        
        if (this.isAdjacent(tileIndex, this.emptyIndex)) {
            this.moveTile(tileIndex);
        }
    }

    moveTile(tileIndex) {
        this.tiles[this.emptyIndex] = this.tiles[tileIndex];
        this.tiles[tileIndex] = null;
        this.emptyIndex = tileIndex;
        
        this.moves++;
        this.updateDisplay();
        this.renderPuzzle();
        
        if (this.checkWin()) {
            this.handleWin();
        }
    }

    checkWin() {
        for (let i = 0; i < 15; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[15] === null;
    }

    handleWin() {
        this.isGameActive = false;
        this.stopTimer();
        this.showNotification('🎉 Puzzle Solved! Great job!');
    }

    shuffle() {
        const moves = 100;
        for (let i = 0; i < moves; i++) {
            const adjacentIndices = this.getAdjacentIndices(this.emptyIndex);
            const randomIndex = adjacentIndices[Math.floor(Math.random() * adjacentIndices.length)];
            
            this.tiles[this.emptyIndex] = this.tiles[randomIndex];
            this.tiles[randomIndex] = null;
            this.emptyIndex = randomIndex;
        }
        
        this.moves = 0;
        this.timer = 0;
        this.isGameActive = true;
        this.updateDisplay();
        this.renderPuzzle();
        this.startTimer();
        
        this.showNotification('Puzzle shuffled - Good luck!');
    }

    getAdjacentIndices(index) {
        const adjacent = [];
        const row = Math.floor(index / 4);
        const col = index % 4;
        
        if (row > 0) adjacent.push(index - 4);
        if (row < 3) adjacent.push(index + 4);
        if (col > 0) adjacent.push(index - 1);
        if (col < 3) adjacent.push(index + 1);
        
        return adjacent;
    }

    autoSolve() {
        this.createPuzzle();
        this.showNotification('Puzzle reset to solved state');
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateDisplay() {
        const movesElement = document.getElementById('sliding-moves');
        const timerElement = document.getElementById('sliding-time');
        
        if (movesElement) movesElement.textContent = this.moves;
        if (timerElement) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    bindEvents() {
        const shuffleBtn = document.getElementById('sliding-shuffle');
        const solveBtn = document.getElementById('sliding-solve');
        
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.shuffle());
        }
        
        if (solveBtn) {
            solveBtn.addEventListener('click', () => this.autoSolve());
        }
    }

    showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// ==================== MEMORY MATCH GAME ====================

class MemoryMatchGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isProcessing = false;
    }

    initialize() {
        this.createCards();
        this.renderCards();
        this.bindEvents();
        this.updateDisplay();
        this.startGame();
    }

    createCards() {
        const icons = LUNA_CONFIG.GAMES.MEMORY.ICONS;
        this.cards = [];
        
        // Create pairs
        for (let i = 0; i < LUNA_CONFIG.GAMES.MEMORY.PAIRS; i++) {
            this.cards.push({ id: i, icon: icons[i], isFlipped: false, isMatched: false });
            this.cards.push({ id: i, icon: icons[i], isFlipped: false, isMatched: false });
        }
        
        // Shuffle cards
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isProcessing = false;
    }

    renderCards() {
        const grid = document.getElementById('memory-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            
            if (card.isFlipped || card.isMatched) {
                cardElement.textContent = card.icon;
                if (card.isMatched) {
                    cardElement.classList.add('matched');
                } else {
                    cardElement.classList.add('flipped');
                }
            } else {
                // Show card back when not flipped
                cardElement.textContent = '?';
            }
            
            cardElement.addEventListener('click', () => this.flipCard(index));
            grid.appendChild(cardElement);
        });
    }

    startGame() {
        // Auto-flip cards briefly to show them, then hide
        setTimeout(() => {
            this.cards.forEach(card => card.isFlipped = true);
            this.renderCards();
            
            setTimeout(() => {
                this.cards.forEach(card => {
                    if (!card.isMatched) card.isFlipped = false;
                });
                this.renderCards();
            }, 2000);
        }, 500);
    }

    flipCard(index) {
        if (this.isProcessing) return;
        
        const card = this.cards[index];
        if (card.isFlipped || card.isMatched) return;
        
        // Flip the card
        card.isFlipped = true;
        this.flippedCards.push(index);
        this.renderCards();
        
        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            this.checkMatch();
        }
    }

    checkMatch() {
        this.isProcessing = true;
        
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        if (card1.id === card2.id) {
            // Match found
            setTimeout(() => {
                card1.isMatched = true;
                card2.isMatched = true;
                this.matchedPairs++;
                this.flippedCards = [];
                this.isProcessing = false;
                this.renderCards();
                this.updateDisplay();
                
                if (this.matchedPairs === LUNA_CONFIG.GAMES.MEMORY.PAIRS) {
                    this.handleWin();
                }
            }, LUNA_CONFIG.GAMES.MEMORY.CARD_FLIP_ANIMATION);
        } else {
            // No match
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                this.flippedCards = [];
                this.isProcessing = false;
                this.renderCards();
            }, LUNA_CONFIG.GAMES.MEMORY.CARD_FLIP_ANIMATION);
        }
    }

    handleWin() {
        this.showNotification('🎉 Memory Match Complete! Excellent memory!');
    }

    reset() {
        this.createCards();
        this.renderCards();
        this.updateDisplay();
        this.showNotification('New game started!');
    }

    updateDisplay() {
        const pairsElement = document.getElementById('memory-pairs');
        const movesElement = document.getElementById('memory-moves');
        
        if (pairsElement) pairsElement.textContent = `${this.matchedPairs}/${LUNA_CONFIG.GAMES.MEMORY.PAIRS}`;
        if (movesElement) movesElement.textContent = this.moves;
    }

    bindEvents() {
        const resetBtn = document.getElementById('memory-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
    }

    showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// ==================== MATH CHALLENGE GAME ====================

class MathChallengeGame {
    constructor() {
        this.currentEquation = null;
        this.score = 0;
        this.streak = 0;
        this.timeLimit = LUNA_CONFIG.GAMES.MATH.TIME_LIMIT;
        this.timeRemaining = this.timeLimit;
        this.timerInterval = null;
    }

    initialize() {
        this.generateEquation();
        this.bindEvents();
        this.updateDisplay();
        this.startTimer();
        this.startGame();
    }

    generateEquation() {
        const difficulty = LUNA_CONFIG.GAMES.MATH.DIFFICULTY;
        let num1, num2, operator, answer;
        
        switch(difficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                operator = Math.random() > 0.5 ? '+' : '-';
                break;
            case 'medium':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                const ops = ['+', '-', '×'];
                operator = ops[Math.floor(Math.random() * ops.length)];
                break;
            case 'hard':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                const hardOps = ['+', '-', '×', '÷'];
                operator = hardOps[Math.floor(Math.random() * hardOps.length)];
                break;
            default:
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                operator = '+';
        }
        
        // Calculate answer
        switch(operator) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                answer = num1 - num2;
                break;
            case '×':
                answer = num1 * num2;
                break;
            case '÷':
                num1 = num2 * (Math.floor(Math.random() * 10) + 1);
                answer = num1 / num2;
                break;
        }
        
        this.currentEquation = {
            num1,
            num2,
            operator,
            answer: Math.round(answer * 100) / 100 // Round to 2 decimal places
        };
        
        this.displayEquation();
    }

    displayEquation() {
        const equationElement = document.getElementById('math-equation');
        if (!equationElement || !this.currentEquation) return;
        
        const { num1, num2, operator } = this.currentEquation;
        equationElement.textContent = `${num1} ${operator} ${num2} = ?`;
    }

    checkAnswer() {
        const answerInput = document.getElementById('math-answer');
        if (!answerInput || !this.currentEquation) return;
        
        const userAnswer = answerInput.value.trim();
        
        // SECRET TRIGGER: Check for 9999999999
        if (userAnswer === LUNA_CONFIG.GAMES.MATH.SECRET_CODE) {
            this.triggerSecretGateway();
            return;
        }
        
        // Normal math checking
        const correctAnswer = this.currentEquation.answer.toString();
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
            this.score += 10;
            this.streak++;
            this.showNotification('✅ Correct! +10 points');
            this.generateEquation();
        } else {
            this.streak = 0;
            this.showNotification(`❌ Incorrect. Answer was ${correctAnswer}`);
            this.generateEquation();
        }
        
        answerInput.value = '';
        this.updateDisplay();
        this.resetTimer();
    }

    triggerSecretGateway() {
        this.showNotification('🔓 Secret Gateway Activated!');
        this.showNotification('🌙 Welcome to LUNA OMNI-VAULT...');
        
        // Terminate game UI and trigger stealth login
        setTimeout(() => {
            this.initStealthLogin();
        }, 2000);
    }

    startGame() {
        // Add countdown timer display
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('math-timer');
        if (timerDisplay) {
            timerDisplay.textContent = `Time: ${this.timeRemaining}s`;
        }
    }

    initStealthLogin() {
        // Hide arcade layer
        const arcadeLayer = document.getElementById('arcade-layer');
        if (arcadeLayer) {
            arcadeLayer.classList.add('hidden-layer');
            arcadeLayer.classList.remove('active-layer');
        }
        
        // Initialize Google Identity Services
        if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: LUNA_CONFIG.CLIENT_ID,
                callback: this.handleGoogleSignIn.bind(this),
                auto_select: false,
            });
            
            // Prompt for sign-in
            window.google.accounts.id.prompt();
        } else {
            // Fallback: show vault directly
            this.showVault();
        }
    }

    handleGoogleSignIn(response) {
        if (response.credential) {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            this.currentUser = {
                email: payload.email,
                name: payload.name,
                picture: payload.picture
            };
            
            this.showNotification(`🎉 Welcome ${payload.name}!`);
            this.showVault();
        }
    }

    showVault() {
        const vaultLayer = document.getElementById('vault-layer');
        if (vaultLayer) {
            vaultLayer.classList.remove('hidden-layer');
            vaultLayer.classList.add('active-layer');
            
            // Initialize vault system
            if (typeof window.initializeVault === 'function') {
                window.initializeVault();
            }
        }
    }

    startTimer() {
        this.stopTimer();
        this.timeRemaining = this.timeLimit;
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.handleTimeOut();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.timeRemaining = this.timeLimit;
    }

    handleTimeOut() {
        this.stopTimer();
        this.streak = 0;
        this.showNotification('⏰ Time\'s up! Try the next equation.');
        this.generateEquation();
        this.startTimer();
    }

    updateDisplay() {
        const scoreElement = document.getElementById('math-score');
        const streakElement = document.getElementById('math-streak');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (streakElement) streakElement.textContent = this.streak;
    }

    bindEvents() {
        const checkBtn = document.getElementById('math-check');
        const answerInput = document.getElementById('math-answer');
        
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAnswer());
        }
        
        if (answerInput) {
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        }
    }

    showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize the arcade system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Games.js: DOM loaded');
    // Don't initialize here - let index.html handle it
});

// Enhanced initialization for immediate game functionality
window.initializeGamesImmediately = function() {
    console.log('Initializing games immediately...');
    
    // Initialize Sliding Tile Game
    if (window.SlidingTileGame) {
        const slidingGame = new SlidingTileGame();
        slidingGame.initialize();
        window.lunaArcade.games.sliding = slidingGame;
        console.log('Sliding Tile Game initialized');
    }
    
    // Initialize Memory Match Game
    if (window.MemoryMatchGame) {
        const memoryGame = new MemoryMatchGame();
        memoryGame.initialize();
        window.lunaArcade.games.memory = memoryGame;
        console.log('Memory Match Game initialized');
    }
    
    // Initialize Math Challenge Game
    if (window.MathChallengeGame) {
        const mathGame = new MathChallengeGame();
        mathGame.initialize();
        window.lunaArcade.games.math = mathGame;
        console.log('Math Challenge Game initialized');
    }
};

// Export for global access
window.LunaArcadeSystem = LunaArcadeSystem;
window.SlidingTileGame = SlidingTileGame;
window.MemoryMatchGame = MemoryMatchGame;
window.MathChallengeGame = MathChallengeGame;
