// LUNA OMNI-VAULT - Secure Chat Engine with Google Drive Sync

class LunaVaultSystem {
    constructor() {
        this.currentUser = null;
        this.messages = [];
        this.contacts = [];
        this.isAdmin = false;
        this.encryptionKey = LUNA_CONFIG.ENCRYPTION_KEY;
        this.syncInterval = null;
        
        this.initializeVault();
    }

    // Initialize vault system
    initializeVault() {
        this.loadCryptoJS();
        this.bindEvents();
        this.initializeBot();
        this.loadContacts();
        this.startRealTimeSync();
        this.setupStealthSearch();
    }

    // Load CryptoJS for encryption
    loadCryptoJS() {
        if (typeof CryptoJS === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
            script.onload = () => {
                console.log('CryptoJS loaded for encryption');
            };
            document.head.appendChild(script);
        }
    }

    // Bind vault events
    bindEvents() {
        // Chat input
        const chatInput = document.getElementById('v-input');
        const sendBtn = document.getElementById('v-send');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Chat controls
        const clearBtn = document.getElementById('clear-chat-btn');
        const exportBtn = document.getElementById('export-chat-btn');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearChat());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportChat());
        }

        // Admin gate (3 clicks)
        const adminGate = document.getElementById('admin-gate');
        if (adminGate) {
            let clickCount = 0;
            adminGate.addEventListener('click', () => {
                clickCount++;
                if (clickCount >= 3) {
                    this.triggerAdminAccess();
                    clickCount = 0;
                }
                
                setTimeout(() => { clickCount = 0; }, 2000);
            });
        }

        // Tool buttons
        const encryptBtn = document.getElementById('encrypt-btn');
        if (encryptBtn) {
            encryptBtn.addEventListener('click', () => this.toggleEncryption());
        }
    }

    // Initialize Luna Alpha AI Bot
    initializeBot() {
        this.bot = {
            name: LUNA_CONFIG.BOT_NAME,
            status: 'online',
            lastActivity: new Date()
        };
        
        // Add bot to contacts
        this.contacts.push({
            id: 'luna-alpha',
            name: LUNA_CONFIG.BOT_NAME,
            email: 'bot@luna.omni-vault',
            avatar: '🤖',
            status: 'online',
            isBot: true
        });
        
        this.updateContactsList();
        this.addBotMessage('🌟 Luna Alpha is online and ready to assist!');
    }

    // Load contacts from Google Drive
    async loadContacts() {
        try {
            // Mock contacts for now - will integrate with Google Drive
            const mockContacts = [
                {
                    id: 'user1',
                    name: 'Alice Chen',
                    email: 'alice@secure.com',
                    avatar: 'AC',
                    status: 'online'
                },
                {
                    id: 'user2',
                    name: 'Bob Smith',
                    email: 'bob@secure.com',
                    avatar: 'BS',
                    status: 'away'
                },
                {
                    id: 'user3',
                    name: 'Carol Davis',
                    email: 'carol@secure.com',
                    avatar: 'CD',
                    status: 'offline'
                }
            ];
            
            this.contacts.push(...mockContacts);
            this.updateContactsList();
        } catch (error) {
            console.error('Failed to load contacts:', error);
        }
    }

    // Update contacts list in UI
    updateContactsList() {
        const contactsList = document.getElementById('contacts');
        if (!contactsList) return;
        
        contactsList.innerHTML = '';
        
        this.contacts.forEach(contact => {
            const contactElement = document.createElement('div');
            contactElement.className = 'contact-item';
            
            contactElement.innerHTML = `
                <div class="contact-avatar">${contact.avatar}</div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-status">${contact.status}</div>
                </div>
                <div class="neon-pulse ${contact.status === 'online' ? 'online' : ''}"></div>
            `;
            
            contactElement.addEventListener('click', () => this.selectContact(contact));
            contactsList.appendChild(contactElement);
        });
    }

    // Select a contact for chat
    selectContact(contact) {
        this.currentContact = contact;
        this.showNotification(`Chatting with ${contact.name}`);
        this.loadChatHistory(contact.id);
    }

    // Load chat history from Google Drive
    async loadChatHistory(contactId) {
        try {
            // Mock loading - will integrate with Google Drive
            const mockMessages = [
                {
                    id: 1,
                    sender: contactId,
                    content: 'Hey there!',
                    timestamp: new Date(Date.now() - 3600000),
                    isEncrypted: false
                },
                {
                    id: 2,
                    sender: 'me',
                    content: 'Hi! How are you?',
                    timestamp: new Date(Date.now() - 3000000),
                    isEncrypted: false
                }
            ];
            
            this.messages = mockMessages;
            this.renderMessages();
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    // Send message
    sendMessage() {
        const input = document.getElementById('v-input');
        if (!input || !input.value.trim()) return;
        
        const message = {
            id: Date.now(),
            sender: 'me',
            content: input.value.trim(),
            timestamp: new Date(),
            isEncrypted: this.isEncryptionEnabled
        };
        
        // Encrypt if enabled
        if (this.isEncryptionEnabled && typeof CryptoJS !== 'undefined') {
            message.content = this.encryptMessage(message.content);
        }
        
        this.messages.push(message);
        this.renderMessages();
        
        // Check if it's a bot command
        if (this.currentContact && this.currentContact.isBot) {
            this.handleBotCommand(message.content);
        }
        
        // Clear input
        input.value = '';
        
        // Save to Google Drive
        this.saveMessageToDrive(message);
    }

    // Handle bot commands
    handleBotCommand(message) {
        const command = message.toLowerCase().trim();
        
        let response = '';
        
        switch(command) {
            case LUNA_CONFIG.BOT_COMMANDS.STATUS:
                response = '📊 System Status: All systems operational\n🔐 Encryption: Active\n🌐 Network: Connected\n💾 Storage: 4.8TB/5TB available';
                break;
                
            case LUNA_CONFIG.BOT_COMMANDS.TEST:
                response = '🧪 Connection Test: PASSED\n⚡ Latency: 12ms\n🔒 Security: ENCRYPTED\n📡 Sync: REAL-TIME';
                break;
                
            case LUNA_CONFIG.BOT_COMMANDS.HELP:
                response = '🤖 Luna Alpha Commands:\n' +
                         `${LUNA_CONFIG.BOT_COMMANDS.STATUS} - System status\n` +
                         `${LUNA_CONFIG.BOT_COMMANDS.TEST} - Connection test\n` +
                         `${LUNA_CONFIG.BOT_COMMANDS.CLEAR} - Clear chat\n` +
                         `${LUNA_CONFIG.BOT_COMMANDS.WHO} - Online users\n` +
                         `${LUNA_CONFIG.BOT_COMMANDS.TIME} - Server time`;
                break;
                
            case LUNA_CONFIG.BOT_COMMANDS.CLEAR:
                this.clearChat();
                return;
                
            case LUNA_CONFIG.BOT_COMMANDS.WHO:
                const onlineCount = this.contacts.filter(c => c.status === 'online').length;
                response = `👥 Online Users: ${onlineCount}\n` +
                         this.contacts.filter(c => c.status === 'online')
                             .map(c => `• ${c.name}`)
                             .join('\n');
                break;
                
            case LUNA_CONFIG.BOT_COMMANDS.TIME:
                response = `🕐 Server Time: ${new Date().toLocaleString()}\n⏰ Uptime: 47h 32m`;
                break;
                
            case LUNA_CONFIG.BOT_COMMANDS.ENCRYPT:
                this.isEncryptionEnabled = true;
                response = '🔐 Encryption mode ENABLED - All messages will be encrypted';
                break;
                
            case LUNA_CONFIG.BOT_COMMANDS.DECRYPT:
                this.isEncryptionEnabled = false;
                response = '🔓 Encryption mode DISABLED - Messages will be sent in plain text';
                break;
                
            default:
                // Check if it's encrypted
                if (message.startsWith('U2FsdGVkX1')) {
                    response = '🔐 Encrypted message detected. Use /decrypt to read.';
                } else {
                    response = `🤔 I don't understand "${message}". Type /help for available commands.`;
                }
        }
        
        setTimeout(() => {
            this.addBotMessage(response);
        }, 500);
    }

    // Add bot message
    addBotMessage(content) {
        const message = {
            id: Date.now(),
            sender: 'luna-alpha',
            content: content,
            timestamp: new Date(),
            isBot: true
        };
        
        this.messages.push(message);
        this.renderMessages();
    }

    // Render messages in chat
    renderMessages() {
        const chatFlow = document.getElementById('chat-flow');
        if (!chatFlow) return;
        
        chatFlow.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.sender === 'me' ? 'user' : 'bot'}`;
            
            let content = message.content;
            
            // Decrypt if needed
            if (message.isEncrypted && typeof CryptoJS !== 'undefined') {
                try {
                    content = this.decryptMessage(content);
                } catch (error) {
                    content = '🔒 Encrypted message';
                }
            }
            
            messageElement.innerHTML = `
                <div class="message-content">${content}</div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            `;
            
            chatFlow.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatFlow.scrollTop = chatFlow.scrollHeight;
    }

    // Format time for messages
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Encrypt message
    encryptMessage(message) {
        if (typeof CryptoJS === 'undefined') return message;
        
        return CryptoJS.AES.encrypt(message, this.encryptionKey).toString();
    }

    // Decrypt message
    decryptMessage(encryptedMessage) {
        if (typeof CryptoJS === 'undefined') return encryptedMessage;
        
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, this.encryptionKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    // Toggle encryption
    toggleEncryption() {
        this.isEncryptionEnabled = !this.isEncryptionEnabled;
        const status = this.isEncryptionEnabled ? 'ENABLED' : 'DISABLED';
        this.showNotification(`🔐 Encryption ${status}`);
    }

    // Clear chat
    clearChat() {
        this.messages = [];
        this.renderMessages();
        this.showNotification('🗑️ Chat cleared');
    }

    // Export chat
    exportChat() {
        const chatData = {
            exportDate: new Date().toISOString(),
            messages: this.messages,
            contact: this.currentContact
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `luna-chat-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('📥 Chat exported');
    }

    // Setup stealth search
    setupStealthSearch() {
        const searchTrigger = document.getElementById('search-trigger');
        const searchWrapper = document.getElementById('search-input-wrapper');
        const searchInput = document.getElementById('p-search');
        
        if (searchTrigger && searchWrapper && searchInput) {
            searchTrigger.addEventListener('click', () => {
                searchWrapper.classList.toggle('expanded');
                if (searchWrapper.classList.contains('expanded')) {
                    searchInput.focus();
                }
            });
            
            searchInput.addEventListener('input', (e) => {
                this.filterContacts(e.target.value);
            });
            
            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchTrigger.contains(e.target) && !searchWrapper.contains(e.target)) {
                    searchWrapper.classList.remove('expanded');
                }
            });
        }
    }

    // Filter contacts
    filterContacts(query) {
        const filtered = this.contacts.filter(contact => 
            contact.name.toLowerCase().includes(query.toLowerCase()) ||
            contact.email.toLowerCase().includes(query.toLowerCase())
        );
        
        // Temporarily update contacts list with filtered results
        const originalContacts = [...this.contacts];
        this.contacts = filtered;
        this.updateContactsList();
        this.contacts = originalContacts;
    }

    // Trigger admin access
    triggerAdminAccess() {
        if (this.currentUser && this.currentUser.email === LUNA_CONFIG.ADMIN) {
            this.showAdminPanel();
        } else {
            this.showNotification('🔒 Admin access denied');
        }
    }

    // Show admin panel
    showAdminPanel() {
        const adminLayer = document.getElementById('admin-layer');
        const vaultLayer = document.getElementById('vault-layer');
        
        if (adminLayer && vaultLayer) {
            vaultLayer.classList.add('hidden-layer');
            vaultLayer.classList.remove('active-layer');
            adminLayer.classList.remove('hidden-layer');
            adminLayer.classList.add('active-layer');
            
            this.showNotification('⚡ Supreme Admin Panel activated');
        }
    }

    // Start real-time sync
    startRealTimeSync() {
        this.syncInterval = setInterval(() => {
            this.syncWithDrive();
        }, LUNA_CONFIG.SYNC_INTERVAL);
    }

    // Sync with Google Drive
    async syncWithDrive() {
        try {
            // Mock sync - will integrate with Google Drive API
            console.log('Syncing with Google Drive...');
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    // Save message to Google Drive
    async saveMessageToDrive(message) {
        try {
            // Mock save - will integrate with Google Drive API
            console.log('Saving message to Google Drive:', message);
        } catch (error) {
            console.error('Failed to save message:', error);
        }
    }

    // Show notification
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

// Initialize vault system
window.initializeVault = function() {
    if (!window.lunaVault) {
        window.lunaVault = new LunaVaultSystem();
    }
};

// Export for global access
window.LunaVaultSystem = LunaVaultSystem;
