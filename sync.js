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
}

// Initialize sync manager
window.driveSync = new DriveSync();

// Export for global access
window.DriveSync = DriveSync;
