// Pattern Logic - 15-Piece Sliding Tile Puzzle

class PatternLogic {
    constructor() {
        this.tiles = [];
        this.emptyIndex = 15;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.currentLevel = 'easy';
        this.isGameActive = false;
        this.gridSize = 4;
        
        this.initialize();
    }
    
    initialize() {
        this.bindEvents();
        this.createGrid();
        this.resetGame();
    }
    
    bindEvents() {
        // Level buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setLevel(e.target.dataset.level);
            });
        });
        
        // Control buttons
        document.getElementById('pattern-shuffle')?.addEventListener('click', () => this.shuffle());
        document.getElementById('pattern-solve')?.addEventListener('click', () => this.solve());
        document.getElementById('pattern-reset')?.addEventListener('click', () => this.resetGame());
    }
    
    setLevel(level) {
        this.currentLevel = level;
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        document.getElementById('pattern-level').textContent = level.charAt(0).toUpperCase() + level.slice(1);
        this.resetGame();
    }
    
    createGrid() {
        const grid = document.getElementById('pattern-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        grid.style.gap = '8px';
        grid.style.padding = '24px';
        grid.style.background = 'var(--glass-medium)';
        grid.style.backdropFilter = 'blur(20px)';
        grid.style.borderRadius = '16px';
        grid.style.border = '1px solid var(--glass-border)';
        grid.style.width = '100%';
        grid.style.maxWidth = '400px';
        grid.style.aspectRatio = '1';
        
        for (let i = 0; i < 16; i++) {
            const tile = document.createElement('div');
            tile.className = 'pattern-tile';
            tile.dataset.index = i;
            tile.style.cssText = `
                background: var(--glass-light);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 600;
                color: var(--primary-neon);
                cursor: pointer;
                transition: all 0.15s ease;
                user-select: none;
            `;
            tile.addEventListener('click', () => this.handleTileClick(i));
            grid.appendChild(tile);
        }
    }
    
    resetGame() {
        this.tiles = [...Array(15).keys()].map(x => x + 1);
        this.tiles.push(null);
        this.emptyIndex = 15;
        this.moves = 0;
        this.timer = 0;
        this.isGameActive = false;
        this.stopTimer();
        this.updateDisplay();
        this.renderTiles();
    }
    
    renderTiles() {
        const grid = document.getElementById('pattern-grid');
        if (!grid) return;
        
        const tiles = grid.querySelectorAll('.pattern-tile');
        tiles.forEach((tile, index) => {
            const value = this.tiles[index];
            tile.textContent = value || '';
            tile.classList.toggle('empty', value === null);
            
            if (value === null) {
                tile.style.background = 'transparent';
                tile.style.border = '1px dashed rgba(255, 255, 255, 0.2)';
            } else {
                tile.style.background = 'var(--glass-light)';
                tile.style.border = '1px solid var(--glass-border)';
            }
        });
    }
    
    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / this.gridSize);
        const col1 = index1 % this.gridSize;
        const row2 = Math.floor(index2 / this.gridSize);
        const col2 = index2 % this.gridSize;
        
        return (row1 === row2 && Math.abs(col1 - col2) === 1) ||
               (col1 === col2 && Math.abs(row1 - row2) === 1);
    }
    
    handleTileClick(index) {
        if (!this.isGameActive) {
            this.showNotification('Click Shuffle to start!');
            return;
        }
        
        if (this.isAdjacent(index, this.emptyIndex)) {
            this.moveTile(index);
        }
    }
    
    moveTile(index) {
        this.tiles[this.emptyIndex] = this.tiles[index];
        this.tiles[index] = null;
        this.emptyIndex = index;
        this.moves++;
        this.updateDisplay();
        this.renderTiles();
        
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
        this.showNotification('🎉 Pattern Solved!');
    }
    
    shuffle() {
        const moves = this.currentLevel === 'easy' ? 50 : this.currentLevel === 'medium' ? 100 : 200;
        
        for (let i = 0; i < moves; i++) {
            const adjacent = this.getAdjacentIndices(this.emptyIndex);
            const randomIndex = adjacent[Math.floor(Math.random() * adjacent.length)];
            
            this.tiles[this.emptyIndex] = this.tiles[randomIndex];
            this.tiles[randomIndex] = null;
            this.emptyIndex = randomIndex;
        }
        
        this.moves = 0;
        this.timer = 0;
        this.isGameActive = true;
        this.updateDisplay();
        this.renderTiles();
        this.startTimer();
        this.showNotification('Game started! Good luck!');
    }
    
    getAdjacentIndices(index) {
        const adjacent = [];
        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;
        
        if (row > 0) adjacent.push(index - this.gridSize);
        if (row < this.gridSize - 1) adjacent.push(index + this.gridSize);
        if (col > 0) adjacent.push(index - 1);
        if (col < this.gridSize - 1) adjacent.push(index + 1);
        
        return adjacent;
    }
    
    solve() {
        this.resetGame();
        this.showNotification('Puzzle reset');
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
        document.getElementById('pattern-moves').textContent = this.moves;
        document.getElementById('pattern-time').textContent = this.formatTime(this.timer);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            background: var(--glass-medium);
            backdrop-filter: blur(20px);
            border: 1px solid var(--primary-neon);
            border-radius: 12px;
            padding: 12px 20px;
            color: white;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 210, 255, 0.3);
            animation: slideInRight 0.3s ease;
            margin-bottom: 8px;
        `;
        
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.patternGame = new PatternLogic();
});

window.PatternLogic = PatternLogic;
