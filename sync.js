// Sync Module - 5TB Google Drive File Operations

class DriveSync {
    constructor() {
        this.folderId = LUNA_CONFIG.FOLDER_ID;
        this.apiKey = LUNA_CONFIG.API_KEY;
        this.clientId = LUNA_CONFIG.CLIENT_ID;
        this.baseUrl = 'https://www.googleapis.com/drive/v3';
        this.uploadUrl = 'https://www.googleapis.com/upload/drive/v3';
        
        this.chatFileId = null;
        this.permissionsFileId = null;
    }
    
    // Initialize and find existing files
    async initialize() {
        try {
            const accessToken = window.authManager?.getAccessToken();
            if (!accessToken) {
                console.warn('No access token available');
                return false;
            }
            
            // Find or create chat.json
            this.chatFileId = await this.findOrCreateFile('chat.json', 'application/json', '{}');
            
            // Find or create permissions.json
            this.permissionsFileId = await this.findOrCreateFile('permissions.json', 'application/json', '{"users": [], "whitelist": []}');
            
            console.log('Drive sync initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Drive sync:', error);
            return false;
        }
    }
    
    // Find file by name in the configured folder
    async findFile(name) {
        const accessToken = window.authManager?.getAccessToken();
        if (!accessToken) return null;
        
        try {
            const response = await fetch(
                `${this.baseUrl}/files?q=name='${name}' and '${this.folderId}' in parents and trashed=false&key=${this.apiKey}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Failed to search files');
            
            const data = await response.json();
            return data.files?.[0]?.id || null;
        } catch (error) {
            console.error('Error finding file:', error);
            return null;
        }
    }
    
    // Find or create a file
    async findOrCreateFile(name, mimeType, initialContent) {
        let fileId = await this.findFile(name);
        
        if (!fileId) {
            fileId = await this.createFile(name, mimeType, initialContent);
        }
        
        return fileId;
    }
    
    // Create a new file
    async createFile(name, mimeType, content) {
        const accessToken = window.authManager?.getAccessToken();
        if (!accessToken) throw new Error('Not authenticated');
        
        const metadata = {
            name: name,
            mimeType: mimeType,
            parents: [this.folderId]
        };
        
        try {
            // Create file with metadata only first
            const response = await fetch(`${this.baseUrl}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });
            
            if (!response.ok) throw new Error('Failed to create file');
            
            const file = await response.json();
            
            // Update with content if provided
            if (content) {
                await this.updateFile(file.id, content);
            }
            
            return file.id;
        } catch (error) {
            console.error('Error creating file:', error);
            throw error;
        }
    }
    
    // Read file content
    async readFile(fileId) {
        const accessToken = window.authManager?.getAccessToken();
        if (!accessToken) throw new Error('Not authenticated');
        
        try {
            const response = await fetch(
                `${this.baseUrl}/files/${fileId}?alt=media`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Failed to read file');
            
            const content = await response.text();
            return JSON.parse(content);
        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    }
    
    // Update file content
    async updateFile(fileId, content) {
        const accessToken = window.authManager?.getAccessToken();
        if (!accessToken) throw new Error('Not authenticated');
        
        try {
            const response = await fetch(
                `${this.uploadUrl}/files/${fileId}?uploadType=media`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: typeof content === 'string' ? content : JSON.stringify(content)
                }
            );
            
            if (!response.ok) throw new Error('Failed to update file');
            
            return await response.json();
        } catch (error) {
            console.error('Error updating file:', error);
            throw error;
        }
    }
    
    // Chat operations
    async loadChat() {
        if (!this.chatFileId) await this.initialize();
        return await this.readFile(this.chatFileId);
    }
    
    async saveChat(chatData) {
        if (!this.chatFileId) await this.initialize();
        return await this.updateFile(this.chatFileId, chatData);
    }
    
    // Permissions operations
    async loadPermissions() {
        if (!this.permissionsFileId) await this.initialize();
        return await this.readFile(this.permissionsFileId);
    }
    
    async savePermissions(permissions) {
        if (!this.permissionsFileId) await this.initialize();
        return await this.updateFile(this.permissionsFileId, permissions);
    }
    
    // Add message to chat
    async addMessage(message) {
        try {
            const chat = await this.loadChat() || { messages: [] };
            chat.messages.push({
                ...message,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 1000 messages
            if (chat.messages.length > 1000) {
                chat.messages = chat.messages.slice(-1000);
            }
            
            await this.saveChat(chat);
            return true;
        } catch (error) {
            console.error('Failed to add message:', error);
            return false;
        }
    }
    
    // Add user to whitelist
    async addToWhitelist(email, name) {
        try {
            const permissions = await this.loadPermissions() || { users: [], whitelist: [] };
            
            if (!permissions.whitelist.includes(email)) {
                permissions.whitelist.push(email);
                permissions.users.push({
                    email,
                    name,
                    added: new Date().toISOString()
                });
                
                await this.savePermissions(permissions);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add to whitelist:', error);
            return false;
        }
    }
    
    // Check if user is whitelisted
    async isWhitelisted(email) {
        try {
            const permissions = await this.loadPermissions();
            return permissions?.whitelist?.includes(email) || false;
        } catch (error) {
            console.error('Failed to check whitelist:', error);
            return false;
        }
    }
    
    // REAL-TIME CHAT OPERATIONS
    
    // Send message with conflict handling (pull latest, append, overwrite)
    async sendMessage(messageData) {
        try {
            // 1. Pull latest chat.json
            const chat = await this.loadChat() || { messages: [] };
            
            // 2. Create message with full metadata
            const message = {
                id: this.generateMessageId(),
                senderEmail: messageData.senderEmail,
                senderName: messageData.senderName,
                senderPicture: messageData.senderPicture,
                text: messageData.text,
                mediaId: messageData.mediaId || null,
                mediaType: messageData.mediaType || null,
                timestamp: new Date().toISOString(),
                edited: false
            };
            
            // 3. Append new message
            chat.messages.push(message);
            
            // 4. Keep only last 1000 messages
            if (chat.messages.length > 1000) {
                chat.messages = chat.messages.slice(-1000);
            }
            
            // 5. Overwrite chat.json
            await this.saveChat(chat);
            
            return message;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }
    
    // Get messages since specific timestamp (for polling)
    async getMessagesSince(sinceTimestamp) {
        try {
            const chat = await this.loadChat() || { messages: [] };
            const since = new Date(sinceTimestamp);
            
            return chat.messages.filter(msg => new Date(msg.timestamp) > since);
        } catch (error) {
            console.error('Failed to get messages:', error);
            return [];
        }
    }
    
    // Get latest timestamp from messages
    getLatestTimestamp(messages) {
        if (!messages || messages.length === 0) return null;
        return messages[messages.length - 1].timestamp;
    }
    
    // MEDIA UPLOAD OPERATIONS
    
    // Upload media file to Drive Media subfolder
    async uploadMedia(file, fileName) {
        try {
            // First, find or create Media folder
            const mediaFolderId = await this.findOrCreateFolder('Media');
            
            const accessToken = window.authManager?.getAccessToken() || 
                               window.sessionManager?.getAccessToken();
            if (!accessToken) throw new Error('Not authenticated');
            
            // Create file metadata
            const metadata = {
                name: fileName,
                mimeType: file.type,
                parents: [mediaFolderId]
            };
            
            // Create multipart form data
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', file);
            
            // Upload to Drive
            const response = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData
                }
            );
            
            if (!response.ok) throw new Error('Failed to upload media');
            
            const result = await response.json();
            return result.id; // Return file ID for storage in chat.json
        } catch (error) {
            console.error('Failed to upload media:', error);
            throw error;
        }
    }
    
    // Get media file URL
    async getMediaUrl(fileId) {
        const accessToken = window.authManager?.getAccessToken() || 
                           window.sessionManager?.getAccessToken();
        if (!accessToken) return null;
        
        // Return direct download URL with auth token
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
    }
    
    // Find or create folder
    async findOrCreateFolder(name) {
        const accessToken = window.authManager?.getAccessToken() || 
                           window.sessionManager?.getAccessToken();
        if (!accessToken) throw new Error('Not authenticated');
        
        try {
            // Search for existing folder
            const response = await fetch(
                `${this.baseUrl}/files?q=name='${name}' and mimeType='application/vnd.google-apps.folder' and '${this.folderId}' in parents and trashed=false&key=${this.apiKey}`,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }
            );
            
            if (!response.ok) throw new Error('Failed to search folder');
            
            const data = await response.json();
            if (data.files && data.files.length > 0) {
                return data.files[0].id;
            }
            
            // Create new folder
            const createResponse = await fetch(`${this.baseUrl}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [this.folderId]
                })
            });
            
            if (!createResponse.ok) throw new Error('Failed to create folder');
            
            const folder = await createResponse.json();
            return folder.id;
        } catch (error) {
            console.error('Error with folder:', error);
            throw error;
        }
    }
    
    // USER DISCOVERY & ONLINE STATUS
    
    // Get all users from permissions.json
    async getAllUsers() {
        try {
            const permissions = await this.loadPermissions() || { users: [], whitelist: [] };
            return permissions.users || [];
        } catch (error) {
            console.error('Failed to get users:', error);
            return [];
        }
    }
    
    // Update user's lastSeen timestamp
    async updateLastSeen(email) {
        try {
            const permissions = await this.loadPermissions() || { users: [], whitelist: [] };
            
            const userIndex = permissions.users.findIndex(u => u.email === email);
            if (userIndex >= 0) {
                permissions.users[userIndex].lastSeen = new Date().toISOString();
            } else {
                // Add user if not exists
                permissions.users.push({
                    email: email,
                    lastSeen: new Date().toISOString(),
                    added: new Date().toISOString()
                });
            }
            
            await this.savePermissions(permissions);
            return true;
        } catch (error) {
            console.error('Failed to update lastSeen:', error);
            return false;
        }
    }
    
    // Check if user is online (lastSeen < 2 minutes ago)
    async isUserOnline(email) {
        try {
            const permissions = await this.loadPermissions();
            if (!permissions?.users) return false;
            
            const user = permissions.users.find(u => u.email === email);
            if (!user || !user.lastSeen) return false;
            
            const lastSeen = new Date(user.lastSeen);
            const now = new Date();
            const diffMinutes = (now - lastSeen) / (1000 * 60);
            
            return diffMinutes < 2;
        } catch (error) {
            return false;
        }
    }
    
    // Get all online users
    async getOnlineUsers() {
        try {
            const users = await this.getAllUsers();
            const now = new Date();
            
            return users.filter(user => {
                if (!user.lastSeen) return false;
                const lastSeen = new Date(user.lastSeen);
                const diffMinutes = (now - lastSeen) / (1000 * 60);
                return diffMinutes < 2;
            });
        } catch (error) {
            console.error('Failed to get online users:', error);
            return [];
        }
    }
    
    // Update user profile in permissions
    async updateUserProfile(email, profile) {
        try {
            const permissions = await this.loadPermissions() || { users: [], whitelist: [] };
            
            const userIndex = permissions.users.findIndex(u => u.email === email);
            if (userIndex >= 0) {
                permissions.users[userIndex] = {
                    ...permissions.users[userIndex],
                    ...profile,
                    updatedAt: new Date().toISOString()
                };
            } else {
                permissions.users.push({
                    email: email,
                    ...profile,
                    added: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                
                if (!permissions.whitelist.includes(email)) {
                    permissions.whitelist.push(email);
                }
            }
            
            await this.savePermissions(permissions);
            return true;
        } catch (error) {
            console.error('Failed to update profile:', error);
            return false;
        }
    }
    
    // Helper: Generate unique message ID
    generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize sync manager
window.driveSync = new DriveSync();

// Export for global access
window.DriveSync = DriveSync;
