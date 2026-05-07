// LUNA STEALTH CHAT v3.0 (ULTRA-PRO) - Real 15-Piece Sliding Tile Logic

class LunaPuzzleGame {
    constructor() {
        this.tiles = [];
        this.emptyIndex = 15;
        this.moves = 0;
        this.timer = 45;
        this.timerInterval = null;
        this.isGameActive = false;
        this.longPressTimer = null;
        this.isLongPressing = false;
        
        this.initializeGame();
        this.bindEvents();
    }

    // Initialize the puzzle with solved state
    initializeGame() {
        this.tiles = [...Array(15).keys()].map(x => x + 1);
        this.tiles.push(null); // Empty space at position 15
        this.emptyIndex = 15;
        this.moves = 0;
        this.timer = 45;
        this.isGameActive = false;
        
        this.renderGame();
        this.updateDisplay();
    }

    // Render the puzzle grid
    renderGame() {
        const grid = document.getElementById('puzzle-grid');
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
                
                // Check if tile is adjacent to empty space
                if (this.isAdjacent(index, this.emptyIndex)) {
                    tile.classList.add('movable');
                }
            }
            
            tile.addEventListener('click', () => this.handleTileClick(index));
            grid.appendChild(tile);
        });
    }

    // Check if two positions are adjacent
    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / 4);
        const col1 = index1 % 4;
        const row2 = Math.floor(index2 / 4);
        const col2 = index2 % 4;
        
        // Check if same row and adjacent columns
        if (row1 === row2 && Math.abs(col1 - col2) === 1) return true;
        
        // Check if same column and adjacent rows
        if (col1 === col2 && Math.abs(row1 - row2) === 1) return true;
        
        return false;
    }

    // Handle tile click
    handleTileClick(tileIndex) {
        if (!this.isGameActive) return;
        
        const tileValue = this.tiles[tileIndex];
        if (tileValue === null) return; // Don't click empty space
        
        // Check if tile can move to empty space
        if (this.isAdjacent(tileIndex, this.emptyIndex)) {
            this.moveTile(tileIndex);
        }
    }

    // Move tile to empty space
    moveTile(tileIndex) {
        // Swap tile with empty space
        this.tiles[this.emptyIndex] = this.tiles[tileIndex];
        this.tiles[tileIndex] = null;
        this.emptyIndex = tileIndex;
        
        this.moves++;
        this.updateDisplay();
        this.renderGame();
        
        // Check for win condition
        if (this.checkWin()) {
            this.handleWin();
        }
        
        // Add move animation
        this.animateMove(tileIndex);
    }

    // Animate tile movement
    animateMove(tileIndex) {
        const tiles = document.querySelectorAll('.puzzle-tile');
        const movedTile = tiles[tileIndex];
        if (movedTile) {
            movedTile.style.transform = 'scale(0.95)';
            setTimeout(() => {
                movedTile.style.transform = 'scale(1)';
            }, 150);
        }
    }

    // Check if puzzle is solved
    checkWin() {
        for (let i = 0; i < 15; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[15] === null;
    }

    // Handle win condition
    handleWin() {
        this.isGameActive = false;
        this.stopTimer();
        
        // Show win notification
        this.showNotification('🎉 Puzzle Solved! Access Granted');
        
        // Auto-transition to vault after 2 seconds
        setTimeout(() => {
            this.transitionToVault();
        }, 2000);
    }

    // Shuffle the puzzle
    shuffle() {
        // Perform valid moves to shuffle (ensures solvability)
        const moves = 100;
        for (let i = 0; i < moves; i++) {
            const adjacentIndices = this.getAdjacentIndices(this.emptyIndex);
            const randomIndex = adjacentIndices[Math.floor(Math.random() * adjacentIndices.length)];
            
            // Swap without incrementing moves counter
            this.tiles[this.emptyIndex] = this.tiles[randomIndex];
            this.tiles[randomIndex] = null;
            this.emptyIndex = randomIndex;
        }
        
        this.moves = 0;
        this.timer = 45;
        this.isGameActive = true;
        this.updateDisplay();
        this.renderGame();
        this.startTimer();
        
        this.showNotification('Puzzle Shuffled - Good Luck!');
    }

    // Get all adjacent indices to a position
    getAdjacentIndices(index) {
        const adjacent = [];
        const row = Math.floor(index / 4);
        const col = index % 4;
        
        // Check up
        if (row > 0) adjacent.push(index - 4);
        // Check down
        if (row < 3) adjacent.push(index + 4);
        // Check left
        if (col > 0) adjacent.push(index - 1);
        // Check right
        if (col < 3) adjacent.push(index + 1);
        
        return adjacent;
    }

    // Auto-solve the puzzle (for demo purposes)
    autoSolve() {
        this.initializeGame();
        this.isGameActive = false;
        this.showNotification('Puzzle Reset to Solved State');
    }

    // Timer functions
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateDisplay();
            
            if (this.timer <= 0) {
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

    handleTimeOut() {
        this.isGameActive = false;
        this.stopTimer();
        this.showNotification('⏰ Time\'s Up! Try Again');
        
        // Reset after 2 seconds
        setTimeout(() => {
            this.initializeGame();
        }, 2000);
    }

    // Update display elements
    updateDisplay() {
        const movesElement = document.getElementById('moves');
        const timerElement = document.querySelector('.timer');
        
        if (movesElement) movesElement.textContent = this.moves;
        if (timerElement) timerElement.textContent = `00:${String(this.timer).padStart(2, '0')}`;
    }

    // Show notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--primary-neon), var(--secondary-neon));
            color: var(--deep-charcoal);
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: notificationSlide 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Transition to vault layer
    transitionToVault() {
        // Fade out game layer
        const gameLayer = document.getElementById('game-layer');
        const vaultLayer = document.getElementById('vault-layer');
        
        if (gameLayer && vaultLayer) {
            gameLayer.style.animation = 'fadeOut 0.5s ease';
            
            setTimeout(() => {
                gameLayer.classList.add('hidden-layer');
                gameLayer.classList.remove('active-layer');
                vaultLayer.classList.remove('hidden-layer');
                vaultLayer.classList.add('active-layer');
                
                // Initialize vault system
                if (typeof window.initializeVault === 'function') {
                    window.initializeVault();
                }
            }, 500);
        }
    }

    // Bind control events
    bindEvents() {
        // Shuffle button
        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.shuffle());
        }

        // Auto-solve button
        const solveBtn = document.getElementById('solve-btn');
        if (solveBtn) {
            solveBtn.addEventListener('click', () => this.autoSolve());
        }

        // Direct access button
        const directAccessBtn = document.getElementById('direct-access-btn');
        if (directAccessBtn) {
            directAccessBtn.addEventListener('click', () => this.directAccess());
        }

        // Long press trigger on LEVEL 11
        const triggerLevel = document.getElementById('trigger-level');
        if (triggerLevel) {
            this.bindLongPress(triggerLevel);
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    // Bind long press event
    bindLongPress(element) {
        // Mouse events
        element.addEventListener('mousedown', (e) => this.startLongPress(e));
        element.addEventListener('mouseup', () => this.endLongPress());
        element.addEventListener('mouseleave', () => this.endLongPress());
        
        // Touch events
        element.addEventListener('touchstart', (e) => this.startLongPress(e));
        element.addEventListener('touchend', () => this.endLongPress());
        element.addEventListener('touchcancel', () => this.endLongPress());
    }

    // Start long press
    startLongPress(e) {
        e.preventDefault();
        if (this.isLongPressing) return;
        
        this.isLongPressing = true;
        
        // Visual feedback
        const trigger = document.getElementById('trigger-level');
        if (trigger) {
            trigger.style.transform = 'scale(0.95)';
            trigger.style.background = 'var(--glass-light)';
        }
        
        // Start long press timer
        this.longPressTimer = setTimeout(() => {
            this.triggerSecretAccess();
        }, LUNA_CONFIG.LONG_PRESS_DURATION);
    }

    // End long press
    endLongPress() {
        if (!this.isLongPressing) return;
        
        this.isLongPressing = false;
        
        // Clear timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        // Reset visual feedback
        const trigger = document.getElementById('trigger-level');
        if (trigger) {
            trigger.style.transform = 'scale(1)';
            trigger.style.background = 'transparent';
        }
    }

    // Direct access to vault
    directAccess() {
        this.showNotification('🚀 Quick Access Granted');
        this.transitionToVault();
    }

    // Trigger secret access
    triggerSecretAccess() {
        this.endLongPress();
        this.showNotification('🔓 Secret Access Triggered');
        
        // Transition to vault after 1 second
        setTimeout(() => {
            this.transitionToVault();
        }, 1000);
    }

    // Handle keyboard input
    handleKeyPress(e) {
        if (!this.isGameActive) return;
        
        const key = e.key;
        const emptyRow = Math.floor(this.emptyIndex / 4);
        const emptyCol = this.emptyIndex % 4;
        
        let targetIndex = -1;
        
        // Arrow key mappings
        switch(key) {
            case 'ArrowUp':
                if (emptyRow < 3) targetIndex = this.emptyIndex + 4;
                break;
            case 'ArrowDown':
                if (emptyRow > 0) targetIndex = this.emptyIndex - 4;
                break;
            case 'ArrowLeft':
                if (emptyCol < 3) targetIndex = this.emptyIndex + 1;
                break;
            case 'ArrowRight':
                if (emptyCol > 0) targetIndex = this.emptyIndex - 1;
                break;
        }
        
        if (targetIndex >= 0 && targetIndex < 16) {
            e.preventDefault();
            this.moveTile(targetIndex);
        }
    }
}

// Initialize game when DOM is loaded
let lunaGame;

document.addEventListener('DOMContentLoaded', () => {
    lunaGame = new LunaPuzzleGame();
    
    // Hide loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.remove(), 500);
        }, 1000);
    }
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes notificationSlide {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    
    @keyframes notificationSlideOut {
        from { opacity: 1; transform: translate(-50%, 0); }
        to { opacity: 0; transform: translate(-50%, -20px); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .game-notification {
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 210, 255, 0.3);
    }
    
    .puzzle-tile.movable {
        cursor: pointer;
        background: var(--glass-light);
        border-color: var(--primary-neon);
        box-shadow: 0 0 15px rgba(0, 210, 255, 0.2);
    }
    
    .puzzle-tile.movable:hover {
        transform: scale(1.05);
        box-shadow: 0 0 25px rgba(0, 210, 255, 0.4);
    }
`;
document.head.appendChild(style);

// Export for global access
window.LunaPuzzleGame = LunaPuzzleGame;
window.lunaGame = lunaGame;