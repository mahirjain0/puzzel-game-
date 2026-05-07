// Instagram-Style Real-Time Chat System
// Handles: Real-time sync, media sharing, profile setup, user discovery

class StealthChat {
    constructor() {
        this.messages = [];
        this.currentUser = null;
        this.lastSyncTimestamp = null;
        this.pollingInterval = null;
        this.lastSeenInterval = null;
        this.onlineUsers = [];
        this.isInitialized = false;
        this.mediaUploadQueue = [];
        
        // Instagram-style elements
        this.elements = {
            messageContainer: null,
            inputField: null,
            sendButton: null,
            attachmentBtn: null,
            userList: null,
            currentUserAvatar: null,
            currentUserName: null
        };
    }
    
    // Initialize chat after successful login
    async initialize() {
        // Get current user from session
        this.currentUser = window.sessionManager?.getCurrentUser();
        if (!this.currentUser) {
            console.error('No user session found');
            return false;
        }
        
        // Cache DOM elements
        this.cacheElements();
        
        // Setup event listeners
        this.bindEvents();
        
        // Initialize Drive sync
        if (window.driveSync) {
            await window.driveSync.initialize();
        }
        
        // Check if profile is complete
        const hasProfile = window.sessionManager?.hasCompleteProfile();
        if (!hasProfile) {
            this.showProfileSetupModal();
        } else {
            this.currentUser.profile = window.sessionManager?.loadProfile();
        }
        
        // Start real-time polling
        this.startRealtimeSync();
        
        // Start updating lastSeen
        this.startLastSeenUpdates();
        
        // Load initial messages
        await this.loadInitialMessages();
        
        // Load user list
        await this.loadUserList();
        
        this.isInitialized = true;
        return true;
    }
    
    cacheElements() {
        this.elements.messageContainer = document.getElementById('chat-messages');
        this.elements.inputField = document.getElementById('chat-input');
        this.elements.sendButton = document.getElementById('chat-send');
        this.elements.attachmentBtn = document.getElementById('chat-attachment');
        this.elements.userList = document.getElementById('contact-list');
        this.elements.currentUserAvatar = document.getElementById('current-user-avatar');
        this.elements.currentUserName = document.getElementById('current-user-name');
    }
    
    bindEvents() {
        // Send message
        this.elements.sendButton?.addEventListener('click', () => this.sendMessage());
        this.elements.inputField?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Media attachment
        this.elements.attachmentBtn?.addEventListener('click', () => this.handleMediaUpload());
        
        // Hidden settings (long press on header)
        const header = document.querySelector('.chat-header');
        if (header) {
            let pressTimer;
            header.addEventListener('mousedown', () => {
                pressTimer = setTimeout(() => this.showSettingsMenu(), 1000);
            });
            header.addEventListener('mouseup', () => clearTimeout(pressTimer));
            header.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        }
    }
    
    // REAL-TIME SYNC (5-second polling)
    startRealtimeSync() {
        // Initial sync
        this.syncMessages();
        
        // Poll every 5 seconds
        this.pollingInterval = setInterval(() => {
            this.syncMessages();
        }, 5000);
        
        // Also sync user list every 10 seconds
        setInterval(() => {
            this.loadUserList();
        }, 10000);
    }
    
    stopRealtimeSync() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    
    // Sync messages from Drive
    async syncMessages() {
        try {
            const since = this.lastSyncTimestamp || new Date(Date.now() - 60000).toISOString();
            const newMessages = await window.driveSync?.getMessagesSince(since);
            
            if (newMessages && newMessages.length > 0) {
                // Add new messages to local array
                newMessages.forEach(msg => {
                    if (!this.messages.find(m => m.id === msg.id)) {
                        this.messages.push(msg);
                        this.renderMessage(msg);
                    }
                });
                
                // Update last sync timestamp
                this.lastSyncTimestamp = window.driveSync?.getLatestTimestamp(this.messages) || new Date().toISOString();
                
                // Scroll to bottom
                this.scrollToBottom();
            }
        } catch (error) {
            // Silent fail - will retry on next poll
        }
    }
    
    // Load initial messages
    async loadInitialMessages() {
        try {
            const chat = await window.driveSync?.loadChat();
            if (chat?.messages) {
                this.messages = chat.messages;
                this.lastSyncTimestamp = window.driveSync?.getLatestTimestamp(this.messages);
                
                // Render last 50 messages
                const recent = this.messages.slice(-50);
                recent.forEach(msg => this.renderMessage(msg));
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }
    
    // Send message
    async sendMessage() {
        const text = this.elements.inputField?.value?.trim();
        if (!text) return;
        
        // Clear input
        this.elements.inputField.value = '';
        
        const messageData = {
            senderEmail: this.currentUser.email,
            senderName: this.currentUser.profile?.displayName || this.currentUser.name,
            senderPicture: this.currentUser.picture,
            text: text,
            mediaId: null,
            mediaType: null
        };
        
        try {
            // Send to Drive (with conflict handling)
            const sentMessage = await window.driveSync?.sendMessage(messageData);
            
            if (sentMessage) {
                // Add to local messages
                this.messages.push(sentMessage);
                this.renderMessage(sentMessage);
                this.scrollToBottom();
                
                // Update last sync timestamp
                this.lastSyncTimestamp = sentMessage.timestamp;
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            this.showNotification('Failed to send message. Retrying...');
        }
    }
    
    // Render single message (Instagram-style)
    renderMessage(message) {
        if (!this.elements.messageContainer) return;
        
        const isMe = message.senderEmail === this.currentUser?.email;
        const messageEl = document.createElement('div');
        messageEl.className = `message ${isMe ? 'message-sent' : 'message-received'}`;
        messageEl.dataset.messageId = message.id;
        
        // Format timestamp
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Build message HTML
        let html = '';
        
        if (!isMe) {
            // Show avatar for received messages
            const avatar = message.senderPicture || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName)}&background=random`;
            html += `<img src="${avatar}" class="message-avatar" alt="${message.senderName}">`;
        }
        
        html += `<div class="message-content">`;
        
        if (!isMe) {
            html += `<div class="message-sender">${this.escapeHtml(message.senderName)}</div>`;
        }
        
        // Media attachment
        if (message.mediaId) {
            html += `<div class="message-media" data-media-id="${message.mediaId}">`;
            html += `<img src="${this.escapeHtml(message.mediaUrl || '')}" class="media-preview" alt="Shared media">`;
            html += `</div>`;
        }
        
        // Text content
        if (message.text) {
            html += `<div class="message-text">${this.escapeHtml(message.text)}</div>`;
        }
        
        html += `<div class="message-time">${time}</div>`;
        html += `</div>`;
        
        messageEl.innerHTML = html;
        this.elements.messageContainer.appendChild(messageEl);
        
        // Load media if present
        if (message.mediaId && !message.mediaUrl) {
            this.loadMediaUrl(message.mediaId, messageEl);
        }
    }
    
    // Load media URL from Drive
    async loadMediaUrl(mediaId, messageEl) {
        try {
            const url = await window.driveSync?.getMediaUrl(mediaId);
            if (url) {
                const img = messageEl.querySelector('.media-preview');
                if (img) img.src = url;
            }
        } catch (error) {
            console.error('Failed to load media:', error);
        }
    }
    
    // Handle media upload
    async handleMediaUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show upload preview
            this.showNotification(`Uploading ${file.name}...`);
            
            try {
                // Upload to Drive Media folder
                const fileName = `${Date.now()}_${file.name}`;
                const mediaId = await window.driveSync?.uploadMedia(file, fileName);
                
                if (mediaId) {
                    // Send message with media
                    const messageData = {
                        senderEmail: this.currentUser.email,
                        senderName: this.currentUser.profile?.displayName || this.currentUser.name,
                        senderPicture: this.currentUser.picture,
                        text: this.elements.inputField?.value?.trim() || '',
                        mediaId: mediaId,
                        mediaType: file.type.startsWith('video') ? 'video' : 'image'
                    };
                    
                    const sentMessage = await window.driveSync?.sendMessage(messageData);
                    if (sentMessage) {
                        this.messages.push(sentMessage);
                        this.renderMessage(sentMessage);
                        this.scrollToBottom();
                        this.showNotification('Media shared successfully');
                    }
                }
            } catch (error) {
                console.error('Failed to upload media:', error);
                this.showNotification('Failed to upload media');
            }
        };
        input.click();
    }
    
    // Load user list from permissions.json
    async loadUserList() {
        try {
            const users = await window.driveSync?.getAllUsers();
            if (!users) return;
            
            // Filter out current user
            const otherUsers = users.filter(u => u.email !== this.currentUser?.email);
            
            // Update online status for each user
            for (const user of otherUsers) {
                user.isOnline = await window.driveSync?.isUserOnline(user.email);
            }
            
            this.renderUserList(otherUsers);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }
    
    // Render user list (Instagram-style stories sidebar)
    renderUserList(users) {
        if (!this.elements.userList) return;
        
        this.elements.userList.innerHTML = users.map(user => {
            const avatar = user.profilePicture || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=random`;
            const isOnline = user.isOnline;
            
            return `
                <div class="story-item ${isOnline ? 'online' : ''}" data-email="${user.email}">
                    <div class="story-ring ${isOnline ? 'online-ring' : ''}">
                        <img src="${avatar}" class="story-avatar" alt="${user.displayName || user.email}">
                    </div>
                    <div class="story-name">${this.escapeHtml(user.displayName || user.email.split('@')[0])}</div>
                    ${isOnline ? '<div class="online-indicator"></div>' : ''}
                </div>
            `;
        }).join('');
    }
    
    // Update lastSeen every 60 seconds
    startLastSeenUpdates() {
        // Update immediately
        this.updateLastSeen();
        
        // Then every 60 seconds
        this.lastSeenInterval = setInterval(() => {
            this.updateLastSeen();
        }, 60000);
    }
    
    async updateLastSeen() {
        if (this.currentUser?.email) {
            await window.driveSync?.updateLastSeen(this.currentUser.email);
        }
    }
    
    // PROFILE SETUP MODAL
    showProfileSetupModal() {
        const modal = document.createElement('div');
        modal.id = 'profile-setup-modal';
        modal.className = 'glass-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Welcome to Stealth Vault</h2>
                <p>Set up your profile to continue</p>
                
                <div class="profile-form">
                    <div class="avatar-upload">
                        <div class="avatar-preview" id="avatar-preview">
                            <span>👤</span>
                        </div>
                        <input type="file" id="avatar-input" accept="image/*" hidden>
                        <button class="glass-btn" onclick="document.getElementById('avatar-input').click()">
                            Add Photo
                        </button>
                    </div>
                    
                    <input type="text" 
                           id="display-name-input" 
                           class="glass-input" 
                           placeholder="Display Name (required)" 
                           maxlength="30">
                    
                    <input type="text" 
                           id="username-input" 
                           class="glass-input" 
                           placeholder="Username (optional)" 
                           maxlength="20">
                    
                    <textarea id="bio-input" 
                              class="glass-input" 
                              placeholder="Bio (optional)" 
                              maxlength="150" 
                              rows="2"></textarea>
                    
                    <button id="save-profile-btn" class="glass-btn primary">
                        Complete Setup
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle avatar upload
        const avatarInput = document.getElementById('avatar-input');
        const avatarPreview = document.getElementById('avatar-preview');
        let avatarFile = null;
        
        avatarInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                avatarFile = file;
                const reader = new FileReader();
                reader.onload = (event) => {
                    avatarPreview.innerHTML = `<img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Handle save
        document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
            const displayName = document.getElementById('display-name-input')?.value?.trim();
            
            if (!displayName || displayName.length < 2) {
                alert('Please enter a display name (at least 2 characters)');
                return;
            }
            
            const profile = {
                displayName: displayName,
                username: document.getElementById('username-input')?.value?.trim() || displayName.toLowerCase().replace(/\s+/g, '_'),
                bio: document.getElementById('bio-input')?.value?.trim() || ''
            };
            
            // Upload avatar if selected
            if (avatarFile) {
                try {
                    const avatarId = await window.driveSync?.uploadMedia(avatarFile, `avatar_${Date.now()}.jpg`);
                    profile.profilePicture = await window.driveSync?.getMediaUrl(avatarId);
                } catch (error) {
                    console.error('Failed to upload avatar:', error);
                }
            }
            
            // Save to localStorage
            window.sessionManager?.saveProfile(profile);
            this.currentUser.profile = profile;
            
            // Save to Drive permissions
            await window.driveSync?.updateUserProfile(this.currentUser.email, profile);
            
            // Close modal
            modal.remove();
            
            // Update UI
            this.updateCurrentUserUI();
        });
    }
    
    updateCurrentUserUI() {
        if (this.elements.currentUserName) {
            this.elements.currentUserName.textContent = this.currentUser?.profile?.displayName || this.currentUser?.name;
        }
        if (this.elements.currentUserAvatar && this.currentUser?.profile?.profilePicture) {
            this.elements.currentUserAvatar.src = this.currentUser.profile.profilePicture;
        }
    }
    
    // SETTINGS MENU (Hidden logout)
    showSettingsMenu() {
        const menu = document.createElement('div');
        menu.className = 'settings-menu glass-panel';
        menu.innerHTML = `
            <div class="settings-item" id="settings-profile">👤 Edit Profile</div>
            <div class="settings-item" id="settings-users">👥 View All Users</div>
            <div class="settings-item danger" id="settings-logout">🚪 Logout</div>
            <div class="settings-item" id="settings-close">✕ Close</div>
        `;
        
        document.body.appendChild(menu);
        
        // Position near header
        const header = document.querySelector('.chat-header');
        if (header) {
            const rect = header.getBoundingClientRect();
            menu.style.position = 'absolute';
            menu.style.top = `${rect.bottom + 10}px`;
            menu.style.right = '20px';
            menu.style.zIndex = '1000';
        }
        
        // Event listeners
        document.getElementById('settings-profile')?.addEventListener('click', () => {
            menu.remove();
            this.showProfileSetupModal();
        });
        
        document.getElementById('settings-users')?.addEventListener('click', () => {
            menu.remove();
            this.showAllUsersModal();
        });
        
        document.getElementById('settings-logout')?.addEventListener('click', () => {
            menu.remove();
            this.logout();
        });
        
        document.getElementById('settings-close')?.addEventListener('click', () => {
            menu.remove();
        });
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }
    
    showAllUsersModal() {
        // Implementation for viewing all authorized users
        // This would be an admin feature
    }
    
    // LOGOUT
    logout() {
        // Stop all intervals
        this.stopRealtimeSync();
        if (this.lastSeenInterval) {
            clearInterval(this.lastSeenInterval);
        }
        
        // Clear session
        window.sessionManager?.clearSession();
        
        // Reload page (returns to game screen)
        window.location.reload();
    }
    
    // UTILITY FUNCTIONS
    scrollToBottom() {
        if (this.elements.messageContainer) {
            this.elements.messageContainer.scrollTop = this.elements.messageContainer.scrollHeight;
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

// Initialize stealth chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.stealthChat = new StealthChat();
});

// Legacy support
window.StealthChat = StealthChat;