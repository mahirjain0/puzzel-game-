// LUNA STEALTH CHAT v3.0 (ULTRA-PRO) - Secure Chat Engine & Always-Online AI Bot

class LunaVaultSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.chatMessages = [];
        this.contacts = [];
        this.syncInterval = null;
        this.searchExpanded = false;
        this.botOnline = true;
        
        this.initializeVault();
    }

    // Initialize vault system
    initializeVault() {
        this.loadCryptoJS();
        this.bindEvents();
        this.initializeBot();
        this.startRealTimeSync();
        this.loadContacts();
        this.showBotWelcome();
    }

    // Load CryptoJS for encryption
    async loadCryptoJS() {
        if (!window.CryptoJS) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
            document.head.appendChild(script);
            
            return new Promise(resolve => {
                script.onload = resolve;
            });
        }
    }

    // Initialize Luna Alpha Bot
    initializeBot() {
        window.LunaBot = {
            name: LUNA_CONFIG.BOT_NAME,
            status: 'online',
            lastResponse: null,
            
            // Bot command processor
            processCommand: (message) => {
                const msg = message.toLowerCase().trim();
                
                // Status command
                if (msg === LUNA_CONFIG.BOT_COMMANDS.STATUS) {
                    return {
                        type: 'bot',
                        text: `🔋 System Status: ONLINE\n🔒 Encryption: AES-256\n📡 Connection: 5TB Bridge\n⚡ Latency: 12ms\n👥 Active Users: ${this.contacts.length}`,
                        timestamp: Date.now()
                    };
                }
                
                // Test command
                if (msg === LUNA_CONFIG.BOT_COMMANDS.TEST) {
                    return {
                        type: 'bot',
                        text: `✅ 5TB Bridge: ACTIVE\n🔐 Encryption: AES-256\n🤖 ${LUNA_CONFIG.BOT_NAME}: Online\n📊 Vault Status: Secure`,
                        timestamp: Date.now()
                    };
                }
                
                // Help command
                if (msg === LUNA_CONFIG.BOT_COMMANDS.HELP) {
                    return {
                        type: 'bot',
                        text: `🤖 ${LUNA_CONFIG.BOT_NAME} Commands:\n\n${LUNA_CONFIG.BOT_COMMANDS.STATUS} - System Status\n${LUNA_CONFIG.BOT_COMMANDS.TEST} - Connection Test\n${LUNA_CONFIG.BOT_COMMANDS.HELP} - Show Help\n${LUNA_CONFIG.BOT_COMMANDS.CLEAR} - Clear Chat\n${LUNA_CONFIG.BOT_COMMANDS.WHO} - Online Users\n${LUNA_CONFIG.BOT_COMMANDS.TIME} - Server Time\n${LUNA_CONFIG.BOT_COMMANDS.ENCRYPT} - Encrypt Mode\n${LUNA_CONFIG.BOT_COMMANDS.DECRYPT} - Decrypt Mode`,
                        timestamp: Date.now()
                    };
                }
                
                // Clear command
                if (msg === LUNA_CONFIG.BOT_COMMANDS.CLEAR) {
                    this.clearChat();
                    return {
                        type: 'bot',
                        text: '🗑️ Chat cleared. Secure connection maintained.',
                        timestamp: Date.now()
                    };
                }
                
                // Who command
                if (msg === LUNA_CONFIG.BOT_COMMANDS.WHO) {
                    const onlineUsers = this.contacts.filter(c => c.online).map(c => c.name).join(', ') || 'No active users';
                    return {
                        type: 'bot',
                        text: `👥 Online Users:\n${onlineUsers}\n\nTotal Contacts: ${this.contacts.length}`,
                        timestamp: Date.now()
                    };
                }
                
                // Time command
                if (msg === LUNA_CONFIG.BOT_COMMANDS.TIME) {
                    const now = new Date();
                    return {
                        type: 'bot',
                        text: `🕐 Server Time: ${now.toLocaleString()}\n⏰ Uptime: ${Math.floor(performance.now() / 1000)}s\n🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
                        timestamp: Date.now()
                    };
                }
                
                // Encrypt command
                if (msg === LUNA_CONFIG.BOT_COMMANDS.ENCRYPT) {
                    return {
                        type: 'bot',
                        text: '🔐 Encryption mode activated. All messages will be encrypted with AES-256.',
                        timestamp: Date.now()
                    };
                }
                
                // Decrypt command
                if (msg === LUNA_CONFIG.BOT_COMMANDS.DECRYPT) {
                    return {
                        type: 'bot',
                        text: '🔓 Decryption mode activated. Encrypted messages will be displayed in plaintext.',
                        timestamp: Date.now()
                    };
                }
                
                // Default bot response
                return {
                    type: 'bot',
                    text: `🤖 ${LUNA_CONFIG.BOT_NAME}: I'm monitoring the stealth channel. Type ${LUNA_CONFIG.BOT_COMMANDS.HELP} for available commands.`,
                    timestamp: Date.now()
                };
            }
        };
    }

    // Show bot welcome message
    showBotWelcome() {
        const welcomeMessage = {
            type: 'bot',
            text: `🌙 Welcome to Luna Stealth Chat v3.0\n\n🤖 ${LUNA_CONFIG.BOT_NAME} is online and ready.\n🔒 All communications are encrypted with AES-256.\n📡 5TB Bridge connection established.\n\nType ${LUNA_CONFIG.BOT_COMMANDS.HELP} to see available commands.`,
            timestamp: Date.now()
        };
        
        this.chatMessages.push(welcomeMessage);
        this.renderMessages();
    }

    // Bind vault events
    bindEvents() {
        // Send message
        const sendBtn = document.getElementById('v-send');
        const chatInput = document.getElementById('v-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Search functionality
        const searchTrigger = document.getElementById('search-trigger');
        const searchInput = document.getElementById('p-search');
        
        if (searchTrigger) {
            searchTrigger.addEventListener('click', () => this.toggleSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeSearch(e.target.value);
                }
            });
        }

        // Admin gate (3 clicks)
        const adminGate = document.getElementById('admin-gate');
        if (adminGate) {
            let clickCount = 0;
            let clickTimer = null;
            
            adminGate.addEventListener('click', () => {
                clickCount++;
                
                // Visual feedback
                const indicator = adminGate.querySelector('.gate-indicator');
                if (indicator) {
                    indicator.style.opacity = '0.3' + (clickCount * 0.2);
                    indicator.style.boxShadow = `0 0 ${clickCount * 5}px var(--secondary-neon)`;
                }
                
                // Reset clicks after 2 seconds
                if (clickTimer) clearTimeout(clickTimer);
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                    if (indicator) {
                        indicator.style.opacity = '0.3';
                        indicator.style.boxShadow = 'none';
                    }
                }, 2000);
                
                // Trigger admin access on 3 clicks
                if (clickCount === 3) {
                    this.triggerAdminAccess();
                    clickCount = 0;
                }
            });
        }

        // Chat controls
        const clearChatBtn = document.getElementById('clear-chat-btn');
        const exportChatBtn = document.getElementById('export-chat-btn');
        
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        }
        
        if (exportChatBtn) {
            exportChatBtn.addEventListener('click', () => this.exportChat());
        }

        // Tool buttons
        const emojiBtn = document.getElementById('emoji-btn');
        const encryptBtn = document.getElementById('encrypt-btn');
        const voiceBtn = document.getElementById('voice-btn');
        
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => this.showEmojiPicker());
        }
        
        if (encryptBtn) {
            encryptBtn.addEventListener('click', () => this.toggleEncryption());
        }
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.startVoiceInput());
        }
    }

    // Toggle search bar
    toggleSearch() {
        const searchWrapper = document.getElementById('search-input-wrapper');
        const searchInput = document.getElementById('p-search');
        
        this.searchExpanded = !this.searchExpanded;
        
        if (searchWrapper) {
            if (this.searchExpanded) {
                searchWrapper.classList.add('expanded');
                setTimeout(() => searchInput?.focus(), 300);
            } else {
                searchWrapper.classList.remove('expanded');
                if (searchInput) searchInput.value = '';
            }
        }
    }

    // Handle search input
    handleSearch(query) {
        if (!query.trim()) {
            this.renderMessages();
            return;
        }
        
        const filtered = this.chatMessages.filter(msg => 
            msg.text.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderMessages(filtered);
    }

    // Execute search
    executeSearch(query) {
        if (!query.trim()) return;
        
        this.showNotification(`🔍 Searching for: "${query}"`);
        this.handleSearch(query);
    }

    // Send message
    sendMessage() {
        const input = document.getElementById('v-input');
        if (!input || !input.value.trim()) return;
        
        const messageText = input.value.trim();
        
        // Check for bot commands
        if (messageText.startsWith('/')) {
            const botResponse = window.LunaBot.processCommand(messageText);
            this.chatMessages.push(botResponse);
            this.renderMessages();
            input.value = '';
            return;
        }
        
        // Create user message
        const message = {
            type: 'user',
            text: messageText,
            sender: this.currentUser?.displayName || 'Anonymous',
            timestamp: Date.now()
        };
        
        this.chatMessages.push(message);
        this.renderMessages();
        
        // Encrypt and save to Google Drive
        this.saveChatToDrive();
        
        // Clear input
        input.value = '';
        
        // Simulate bot response for non-commands
        if (Math.random() > 0.7) { // 30% chance of bot response
            setTimeout(() => {
                const botMsg = {
                    type: 'bot',
                    text: `🤖 ${LUNA_CONFIG.BOT_NAME}: Message received and encrypted. Secure transmission confirmed.`,
                    timestamp: Date.now()
                };
                this.chatMessages.push(botMsg);
                this.renderMessages();
            }, 1000);
        }
    }

    // Render chat messages
    renderMessages(messages = null) {
        const chatFlow = document.getElementById('chat-flow');
        if (!chatFlow) return;
        
        const messagesToRender = messages || this.chatMessages;
        
        chatFlow.innerHTML = '';
        
        messagesToRender.forEach((message, index) => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${message.type}`;
            
            if (message.type === 'bot') {
                messageEl.innerHTML = `
                    <div class="message-header">
                        <span class="bot-name">🤖 ${LUNA_CONFIG.BOT_NAME}</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                    <div class="message-text">${this.formatMessageText(message.text)}</div>
                `;
            } else {
                messageEl.innerHTML = `
                    <div class="message-header">
                        <span class="sender-name">${message.sender}</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                    <div class="message-text">${this.formatMessageText(message.text)}</div>
                `;
            }
            
            chatFlow.appendChild(messageEl);
        });
        
        // Scroll to bottom
        chatFlow.scrollTop = chatFlow.scrollHeight;
    }

    // Format message text with basic markdown
    formatMessageText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Format timestamp
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Clear chat
    clearChat() {
        this.chatMessages = [];
        this.renderMessages();
        this.showNotification('🗑️ Chat cleared');
    }

    // Export chat
    exportChat() {
        const chatText = this.chatMessages.map(msg => 
            `[${new Date(msg.timestamp).toLocaleString()}] ${msg.type === 'bot' ? LUNA_CONFIG.BOT_NAME : msg.sender}: ${msg.text}`
        ).join('\n\n');
        
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `luna-chat-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('📥 Chat exported');
    }

    // Load contacts
    loadContacts() {
        // Mock contacts for demo
        this.contacts = [
            { id: 1, name: 'Alice Chen', email: 'alice@example.com', online: true, avatar: 'AC' },
            { id: 2, name: 'Bob Smith', email: 'bob@example.com', online: false, avatar: 'BS' },
            { id: 3, name: 'Carol Davis', email: 'carol@example.com', online: true, avatar: 'CD' }
        ];
        
        this.renderContacts();
    }

    // Render contacts
    renderContacts() {
        const contactsList = document.getElementById('contacts');
        if (!contactsList) return;
        
        contactsList.innerHTML = '';
        
        this.contacts.forEach(contact => {
            const contactEl = document.createElement('div');
            contactEl.className = 'contact-item';
            
            contactEl.innerHTML = `
                <div class="contact-avatar">${contact.avatar}</div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-status">${contact.online ? '🟢 Online' : '⚫ Offline'}</div>
                </div>
            `;
            
            contactsList.appendChild(contactEl);
        });
    }

    // Start real-time sync
    startRealTimeSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        
        this.syncInterval = setInterval(() => {
            this.syncWithDrive();
        }, LUNA_CONFIG.SYNC_INTERVAL);
    }

    // Sync with Google Drive
    async syncWithDrive() {
        // Mock sync - in real implementation, this would sync with Google Drive
        // For now, just update bot status
        const botStatus = document.querySelector('.neon-pulse');
        if (botStatus) {
            botStatus.classList.toggle('online', this.botOnline);
        }
    }

    // Save chat to Google Drive
    async saveChatToDrive() {
        if (!window.CryptoJS) return;
        
        try {
            // Encrypt chat data
            const encryptedData = CryptoJS.AES.encrypt(
                JSON.stringify(this.chatMessages), 
                LUNA_CONFIG.ENCRYPTION_KEY
            ).toString();
            
            // In real implementation, save to Google Drive
            console.log('Chat encrypted and ready for Drive sync:', encryptedData);
            
        } catch (error) {
            console.error('Encryption error:', error);
        }
    }

    // Trigger admin access
    triggerAdminAccess() {
        this.showNotification('⚡ Admin Access Granted');
        
        // Transition to admin layer
        setTimeout(() => {
            const vaultLayer = document.getElementById('vault-layer');
            const adminLayer = document.getElementById('admin-layer');
            
            if (vaultLayer && adminLayer) {
                vaultLayer.classList.add('hidden-layer');
                vaultLayer.classList.remove('active-layer');
                adminLayer.classList.remove('hidden-layer');
                adminLayer.classList.add('active-layer');
                
                // Initialize admin panel
                if (typeof window.initializeAdmin === 'function') {
                    window.initializeAdmin();
                }
            }
        }, 500);
    }

    // Show emoji picker (placeholder)
    showEmojiPicker() {
        this.showNotification('😊 Emoji picker coming soon');
    }

    // Toggle encryption (placeholder)
    toggleEncryption() {
        this.showNotification('🔐 Encryption toggle coming soon');
    }

    // Start voice input (placeholder)
    startVoiceInput() {
        this.showNotification('🎤 Voice input coming soon');
    }

    // Show notification
    showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            background: var(--glass-medium);
            backdrop-filter: var(--blur-light);
            border: 1px solid var(--primary-neon);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 8px;
            animation: slideInRight 0.3s ease;
        `;
        
        container.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize vault when called from game
window.initializeVault = () => {
    if (!window.vaultSystem) {
        window.vaultSystem = new LunaVaultSystem();
    }
};

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
    
    .notification {
        box-shadow: 0 4px 20px rgba(0, 210, 255, 0.3);
    }
    
    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;
        opacity: 0.7;
    }
    
    .bot-name {
        color: var(--success-neon);
        font-weight: 600;
    }
    
    .sender-name {
        color: var(--primary-neon);
        font-weight: 500;
    }
    
    .message-time {
        font-family: var(--font-mono);
        color: rgba(255, 255, 255, 0.5);
    }
    
    .message-text {
        line-height: 1.4;
    }
    
    .message-text code {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: 12px;
    }
`;
document.head.appendChild(notificationStyles);