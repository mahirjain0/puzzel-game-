// Memory Matrix - Card Matching Game

class MemoryMatrix {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.isProcessing = false;
        this.icons = ['◆', '●', '■', '▲', '★', '♦', '♥', '♠'];
        
        this.initialize();
    }
    
    initialize() {
        this.bindEvents();
        this.createGrid();
        this.startNewGame();
    }
    
    bindEvents() {
        document.getElementById('matrix-new')?.addEventListener('click', () => this.startNewGame());
        document.getElementById('matrix-hint')?.addEventListener('click', () => this.showHint());
    }
    
    createGrid() {
        const grid = document.getElementById('matrix-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            padding: 24px;
            background: var(--glass-medium);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            border: 1px solid var(--glass-border);
            max-width: 400px;
            margin: 0 auto;
        `;
    }
    
    startNewGame() {
        this.createCards();
        this.renderCards();
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.isProcessing = false;
        this.updateDisplay();
        this.showNotification('New game started!');
        
        // Preview cards
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
    
    createCards() {
        this.cards = [];
        
        // Create pairs
        for (let i = 0; i < 8; i++) {
            this.cards.push({ id: i, icon: this.icons[i], isFlipped: false, isMatched: false });
            this.cards.push({ id: i, icon: this.icons[i], isFlipped: false, isMatched: false });
        }
        
        // Shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        this.flippedCards = [];
    }
    
    renderCards() {
        const grid = document.getElementById('matrix-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'matrix-card';
            cardElement.dataset.index = index;
            
            const isRevealed = card.isFlipped || card.isMatched;
            
            cardElement.style.cssText = `
                aspect-ratio: 1;
                background: ${isRevealed ? 'linear-gradient(135deg, var(--primary-neon), var(--secondary-neon))' : 'var(--glass-light)'};
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: ${isRevealed ? 'var(--deep-charcoal)' : 'var(--primary-neon)'};
                cursor: ${card.isMatched ? 'default' : 'pointer'};
                transition: all 0.3s ease;
                transform-style: preserve-3d;
                ${card.isMatched ? 'opacity: 0.7;' : ''}
            `;
            
            cardElement.textContent = isRevealed ? card.icon : '?';
            
            if (!card.isMatched) {
                cardElement.addEventListener('click', () => this.flipCard(index));
            }
            
            grid.appendChild(cardElement);
        });
    }
    
    flipCard(index) {
        if (this.isProcessing) return;
        
        const card = this.cards[index];
        if (card.isFlipped || card.isMatched) return;
        
        card.isFlipped = true;
        this.flippedCards.push(index);
        this.renderCards();
        
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
                this.score += 100;
                this.flippedCards = [];
                this.isProcessing = false;
                this.renderCards();
                this.updateDisplay();
                
                if (this.matchedPairs === 8) {
                    this.handleWin();
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                this.flippedCards = [];
                this.isProcessing = false;
                this.renderCards();
            }, 1000);
        }
    }
    
    handleWin() {
        this.score += 500; // Bonus
        this.updateDisplay();
        this.showNotification('🎉 Memory Matrix Complete!');
    }
    
    showHint() {
        if (this.isProcessing) return;
        
        // Find an unmatched pair
        const unmatched = this.cards.filter(card => !card.isMatched);
        if (unmatched.length === 0) return;
        
        // Briefly show all unmatched cards
        unmatched.forEach(card => card.isFlipped = true);
        this.renderCards();
        
        setTimeout(() => {
            unmatched.forEach(card => {
                if (!this.flippedCards.includes(this.cards.indexOf(card))) {
                    card.isFlipped = false;
                }
            });
            this.renderCards();
        }, 1500);
        
        this.score = Math.max(0, this.score - 50); // Penalty
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('matrix-pairs').textContent = `${this.matchedPairs}/8`;
        document.getElementById('matrix-moves').textContent = this.moves;
        document.getElementById('matrix-score').textContent = this.score;
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
    window.matrixGame = new MemoryMatrix();
});

window.MemoryMatrix = MemoryMatrix;
