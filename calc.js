// Speed Calc - Mental Math Challenge (THE GATE)

class SpeedCalc {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.timeRemaining = 60;
        this.timerInterval = null;
        this.currentEquation = null;
        this.isGameActive = true;
        this.secretTriggered = false;
        
        this.initialize();
    }
    
    initialize() {
        this.bindEvents();
        this.generateEquation();
        this.startTimer();
        this.updateDisplay();
    }
    
    bindEvents() {
        document.getElementById('calc-check')?.addEventListener('click', () => this.checkAnswer());
        document.getElementById('calc-skip')?.addEventListener('click', () => this.skipEquation());
        document.getElementById('calc-reset')?.addEventListener('click', () => this.resetGame());
        
        const input = document.getElementById('calc-answer');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.checkAnswer();
            });
        }
    }
    
    generateEquation() {
        if (this.secretTriggered) return;
        
        const operators = ['+', '-', '×'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        let num1, num2, answer;
        
        switch(operator) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 50) + 10;
                num2 = Math.floor(Math.random() * num1);
                answer = num1 - num2;
                break;
            case '×':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                break;
        }
        
        this.currentEquation = { num1, num2, operator, answer };
        
        const equationEl = document.getElementById('calc-equation');
        if (equationEl) {
            equationEl.textContent = `${num1} ${operator} ${num2} = ?`;
        }
    }
    
    checkAnswer() {
        if (this.secretTriggered) return;
        
        const input = document.getElementById('calc-answer');
        const userAnswer = input?.value?.trim();
        
        if (!userAnswer) return;
        
        // SECRET TRIGGER CHECK
        if (userAnswer === '9999999999') {
            this.triggerSecretGateway();
            return;
        }
        
        const correctAnswer = this.currentEquation.answer.toString();
        
        if (userAnswer === correctAnswer) {
            this.score += 10 + (this.streak * 2);
            this.streak++;
            this.showNotification('✅ Correct! +' + (10 + ((this.streak - 1) * 2)) + ' points');
        } else {
            this.streak = 0;
            this.showNotification(`❌ Wrong! Answer: ${correctAnswer}`);
        }
        
        input.value = '';
        this.updateDisplay();
        this.generateEquation();
        this.resetTimer();
    }
    
    triggerSecretGateway() {
        this.secretTriggered = true;
        this.isGameActive = false;
        this.stopTimer();
        
        const input = document.getElementById('calc-answer');
        if (input) {
            input.value = '';
            input.disabled = true;
            input.placeholder = 'Processing...';
        }
        
        // Silent notification sequence
        this.showNotification('🔓 Code Validated');
        
        setTimeout(() => {
            this.showNotification('🌙 Establishing secure channel...');
        }, 800);
        
        setTimeout(() => {
            this.startStealthAuth();
        }, 2000);
    }
    
    startStealthAuth() {
        // Use authManager for OAuth - it has the token client already initialized
        if (window.authManager && window.authManager.tokenClient) {
            // Set up token callback
            window.authManager.onTokenAcquired = (accessToken) => {
                this.handleTokenResponse({ access_token: accessToken });
            };
            
            // Request access token - triggers popup
            window.authManager.requestAccessToken();
        } else if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            // Fallback: create token client directly if authManager not ready
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: LUNA_CONFIG.CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (tokenResponse) => {
                    this.handleTokenResponse(tokenResponse);
                }
            });
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            this.showNotification('System initializing. Please retry.');
            setTimeout(() => this.startStealthAuth(), 1000);
        }
    }
    
    async handleTokenResponse(tokenResponse) {
        if (tokenResponse && tokenResponse.access_token) {
            // Store access token in authManager for sync.js to use
            if (!window.authManager) {
                window.authManager = {
                    accessToken: tokenResponse.access_token,
                    getAccessToken: function() { return this.accessToken; }
                };
            } else {
                window.authManager.accessToken = tokenResponse.access_token;
            }
            
            // Get user info from ID token if available, or create minimal user
            const user = {
                email: 'user@secure.local',
                name: 'Secure User',
                isAdmin: false
            };
            
            // Try to get real user info from Google
            try {
                const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                });
                if (response.ok) {
                    const userInfo = await response.json();
                    user.email = userInfo.email;
                    user.name = userInfo.name;
                    user.picture = userInfo.picture;
                    user.isAdmin = userInfo.email === LUNA_CONFIG.ADMIN;
                }
            } catch (e) {
                // Continue with default user info
            }
            
            window.currentUser = user;
            
            // Show welcome
            this.showNotification(`Welcome, ${user.name}`);
            
            // Check whitelist and proceed
            await this.verifyAccessAndShowInterface(user);
        }
    }
    
    async verifyAccessAndShowInterface(user) {
        try {
            // Initialize Drive sync
            if (window.driveSync) {
                await window.driveSync.initialize();
                
                // Check if user is whitelisted or is admin
                const isWhitelisted = await window.driveSync.isWhitelisted(user.email);
                const isAdmin = user.email === LUNA_CONFIG.ADMIN;
                
                if (isAdmin) {
                    // Auto-add admin to whitelist if not present
                    if (!isWhitelisted) {
                        await window.driveSync.addToWhitelist(user.email, user.name);
                    }
                    this.showNotification('Admin access granted');
                } else if (!isWhitelisted) {
                    // New user - add to whitelist
                    await window.driveSync.addToWhitelist(user.email, user.name);
                    this.showNotification('Access approved');
                }
            }
        } catch (error) {
            // Continue even if sync fails initially
        }
        
        // Show the private interface
        this.showPrivateInterface();
        
        // Load existing chat data
        this.loadChatHistory();
    }
    
    showPrivateInterface() {
        // Hide game page
        const gamePage = document.querySelector('.game-page');
        if (gamePage) {
            gamePage.style.display = 'none';
        }
        
        // Show private interface
        const privateInterface = document.getElementById('private-interface');
        if (privateInterface) {
            privateInterface.classList.remove('hidden-layer');
            privateInterface.classList.add('active-layer');
            
            // Initialize private interface
            this.initializePrivateInterface();
        }
    }
    
    async loadChatHistory() {
        try {
            if (window.driveSync) {
                const chat = await window.driveSync.loadChat();
                if (chat && chat.messages && chat.messages.length > 0) {
                    // Display last 50 messages
                    const recentMessages = chat.messages.slice(-50);
                    recentMessages.forEach(msg => {
                        if (msg.type === 'user') {
                            this.addUserMessage(msg.text);
                        } else {
                            this.addSystemMessage(msg.text);
                        }
                    });
                }
            }
        } catch (error) {
            // Continue without history
        }
    }
    
    initializePrivateInterface() {
        // Initialize search functionality
        const searchTrigger = document.getElementById('search-trigger');
        const searchWrapper = document.getElementById('search-input-wrapper');
        
        if (searchTrigger && searchWrapper) {
            searchTrigger.addEventListener('click', () => {
                searchWrapper.classList.toggle('expanded');
            });
        }
        
        // Load contacts
        this.loadContacts();
        
        // Initialize chat
        this.initializeChat();
        
        // Check for admin and unlock admin features
        if (window.currentUser && window.currentUser.isAdmin) {
            this.unlockAdminFeatures();
        }
        
        // Show welcome message
        setTimeout(() => {
            this.addSystemMessage('System Assistant connected. 5TB storage active.');
        }, 500);
    }
    
    unlockAdminFeatures() {
        // Add admin indicator to sidebar
        const sidebar = document.querySelector('.private-sidebar');
        if (sidebar) {
            const adminBadge = document.createElement('div');
            adminBadge.className = 'admin-badge';
            adminBadge.innerHTML = '⚡ Admin Mode';
            adminBadge.style.cssText = `
                background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                text-align: center;
                margin-top: 16px;
            `;
            sidebar.appendChild(adminBadge);
        }
        
        // Add admin panel access
        const chatHeader = document.querySelector('.chat-header h3');
        if (chatHeader) {
            chatHeader.innerHTML += ' <span style="color: #ff6b6b; font-size: 12px;">[ADMIN]</span>';
        }
    }
    
    loadContacts() {
        const contacts = [
            { name: 'System Assistant', avatar: '🤖', status: 'online', isBot: true },
            { name: 'Secure Contact 1', avatar: 'SC', status: 'online' },
            { name: 'Secure Contact 2', avatar: 'SC', status: 'away' }
        ];
        
        const list = document.getElementById('contact-list');
        if (!list) return;
        
        list.innerHTML = contacts.map(contact => `
            <div class="contact-item">
                <div class="contact-avatar">${contact.avatar}</div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-status ${contact.status}">${contact.status}</div>
                </div>
                ${contact.isBot ? '<div class="pulse-indicator online"></div>' : ''}
            </div>
        `).join('');
    }
    
    initializeChat() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send');
        
        const sendMessage = () => {
            const message = input?.value?.trim();
            if (!message) return;
            
            this.addUserMessage(message);
            input.value = '';
            
            // Bot response
            setTimeout(() => {
                this.handleBotResponse(message);
            }, 500);
        };
        
        sendBtn?.addEventListener('click', sendMessage);
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    handleBotResponse(message) {
        let response = '';
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('/status')) {
            response = '📊 System Status: All operational\n🔐 Encryption: Active\n🌐 Network: Secure\n💾 Storage: 5TB/5TB available';
        } else if (lowerMsg.includes('/help')) {
            response = 'Available commands:\n/status - System status\n/help - Show help\n/clear - Clear chat';
        } else if (lowerMsg.includes('/clear')) {
            document.getElementById('chat-messages').innerHTML = '';
            return;
        } else {
            response = 'Message received. System Assistant is processing your request.';
        }
        
        this.addSystemMessage(response);
    }
    
    async addUserMessage(text) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const msg = document.createElement('div');
        msg.className = 'message user';
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
        
        // Save to Drive
        try {
            if (window.driveSync) {
                await window.driveSync.addMessage({
                    type: 'user',
                    text: text,
                    user: window.currentUser?.email || 'unknown'
                });
            }
        } catch (error) {
            // Silent fail - message still shown locally
        }
    }
    
    async addSystemMessage(text) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const msg = document.createElement('div');
        msg.className = 'message system';
        msg.style.whiteSpace = 'pre-line';
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
        
        // Save to Drive
        try {
            if (window.driveSync) {
                await window.driveSync.addMessage({
                    type: 'system',
                    text: text,
                    user: 'system'
                });
            }
        } catch (error) {
            // Silent fail - message still shown locally
        }
    }
    
    skipEquation() {
        if (this.secretTriggered) return;
        this.streak = 0;
        this.showNotification(`Skipped! Answer: ${this.currentEquation.answer}`);
        this.generateEquation();
        this.resetTimer();
        this.updateDisplay();
    }
    
    resetGame() {
        this.score = 0;
        this.streak = 0;
        this.timeRemaining = 60;
        this.secretTriggered = false;
        this.isGameActive = true;
        
        const input = document.getElementById('calc-answer');
        if (input) {
            input.disabled = false;
            input.placeholder = 'Enter answer';
            input.value = '';
        }
        
        this.stopTimer();
        this.startTimer();
        this.generateEquation();
        this.updateDisplay();
        this.showNotification('Game reset!');
    }
    
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                this.handleTimeout();
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
        this.timeRemaining = 60;
    }
    
    handleTimeout() {
        this.streak = 0;
        this.showNotification('⏰ Time\'s up!');
        this.generateEquation();
        this.resetTimer();
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('calc-score').textContent = this.score;
        document.getElementById('calc-streak').textContent = this.streak;
        document.getElementById('calc-timer').textContent = `${this.timeRemaining}s`;
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
    window.calcGame = new SpeedCalc();
});

window.SpeedCalc = SpeedCalc;
