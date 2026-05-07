// LUNA OMNI-VAULT - Supreme Admin Dashboard System

class LunaAdminSystem {
    constructor() {
        this.currentUser = null;
        this.systemStats = {
            totalUsers: 0,
            activeUsers: 0,
            totalMessages: 0,
            systemStatus: '🟢',
            vaultSize: '4.8TB',
            lastBackup: new Date().toISOString()
        };
        this.users = [];
        this.auditLog = [];
        this.currentSection = 'dashboard';
        
        this.initializeAdmin();
    }

    // Initialize admin system
    initializeAdmin() {
        this.bindEvents();
        this.loadSystemData();
        this.startRealTimeMonitoring();
    }

    // Bind admin events
    bindEvents() {
        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Admin controls
        const refreshBtn = document.getElementById('refresh-admin');
        const backBtn = document.getElementById('back-to-vault');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToVault());
        }

        // User management
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.addUser());
        }

        // Vault operations
        const wipeVaultBtn = document.getElementById('wipe-vault-btn');
        const backupVaultBtn = document.getElementById('backup-vault-btn');
        const restoreVaultBtn = document.getElementById('restore-vault-btn');
        
        if (wipeVaultBtn) {
            wipeVaultBtn.addEventListener('click', () => this.wipeVault());
        }
        
        if (backupVaultBtn) {
            backupVaultBtn.addEventListener('click', () => this.backupVault());
        }
        
        if (restoreVaultBtn) {
            restoreVaultBtn.addEventListener('click', () => this.restoreVault());
        }

        // Analytics export
        const exportAnalyticsBtn = document.getElementById('export-analytics-btn');
        if (exportAnalyticsBtn) {
            exportAnalyticsBtn.addEventListener('click', () => this.exportAnalytics());
        }
    }

    // Switch admin section
    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;
        this.loadSectionData(section);
    }

    // Load section data
    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'vault':
                this.loadVaultInfo();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'system':
                this.loadSystemSettings();
                break;
        }
    }

    // Update dashboard
    updateDashboard() {
        document.getElementById('total-users').textContent = this.systemStats.totalUsers;
        document.getElementById('active-users').textContent = this.systemStats.activeUsers;
        document.getElementById('total-messages').textContent = this.systemStats.totalMessages;
        document.getElementById('system-status').textContent = this.systemStats.systemStatus;
    }

    // Load users
    loadUsers() {
        // Mock users - will integrate with Google Drive
        const mockUsers = [
            {
                id: 'user1',
                name: 'Alice Chen',
                email: 'alice@secure.com',
                status: 'active',
                lastLogin: new Date(Date.now() - 3600000),
                messages: 245,
                isWhitelisted: true
            },
            {
                id: 'user2',
                name: 'Bob Smith',
                email: 'bob@secure.com',
                status: 'inactive',
                lastLogin: new Date(Date.now() - 86400000),
                messages: 89,
                isWhitelisted: true
            },
            {
                id: 'user3',
                name: 'Carol Davis',
                email: 'carol@secure.com',
                status: 'pending',
                lastLogin: new Date(Date.now() - 172800000),
                messages: 12,
                isWhitelisted: false
            }
        ];

        this.users = mockUsers;
        this.renderUsers();
    }

    // Render users list
    renderUsers() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;
        
        usersList.innerHTML = '';
        
        this.users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-status status-${user.status}">${user.status}</div>
                </div>
                <div class="user-stats">
                    <div>Messages: ${user.messages}</div>
                    <div>Last: ${this.formatRelativeTime(user.lastLogin)}</div>
                </div>
                <div class="user-actions">
                    <button class="toggle-btn ${user.isWhitelisted ? 'active' : ''}" 
                            onclick="window.lunaAdmin.toggleUserStatus('${user.id}')">
                        ${user.isWhitelisted ? '✓' : '○'}
                    </button>
                    <button class="remove-btn" onclick="window.lunaAdmin.removeUser('${user.id}')">
                        ✕
                    </button>
                </div>
            `;
            
            usersList.appendChild(userElement);
        });
    }

    // Add new user
    addUser() {
        const name = prompt('Enter user name:');
        const email = prompt('Enter user email:');
        
        if (name && email) {
            const newUser = {
                id: 'user' + Date.now(),
                name: name,
                email: email,
                status: 'pending',
                lastLogin: new Date(),
                messages: 0,
                isWhitelisted: false
            };
            
            this.users.push(newUser);
            this.renderUsers();
            this.logAudit('USER_ADDED', `Added user: ${name} (${email})`);
            this.showNotification(`✅ User ${name} added successfully`);
        }
    }

    // Toggle user status
    toggleUserStatus(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.isWhitelisted = !user.isWhitelisted;
            user.status = user.isWhitelisted ? 'active' : 'inactive';
            this.renderUsers();
            this.logAudit('USER_TOGGLED', `Toggled ${user.email}: ${user.isWhitelisted}`);
            this.showNotification(`User ${user.name} ${user.isWhitelisted ? 'activated' : 'deactivated'}`);
        }
    }

    // Remove user
    removeUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user && confirm(`Remove user ${user.name}? This action cannot be undone.`)) {
            this.users = this.users.filter(u => u.id !== userId);
            this.renderUsers();
            this.logAudit('USER_REMOVED', `Removed user: ${user.name} (${user.email})`);
            this.showNotification(`User ${user.name} removed`);
        }
    }

    // Load vault information
    loadVaultInfo() {
        const vaultInfo = document.querySelector('#vault-section .section-header');
        if (vaultInfo) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'vault-info';
            infoDiv.innerHTML = `
                <div class="vault-stats">
                    <div class="vault-stat">
                        <span class="stat-label">Total Size:</span>
                        <span class="stat-value">5TB</span>
                    </div>
                    <div class="vault-stat">
                        <span class="stat-label">Used:</span>
                        <span class="stat-value">${this.systemStats.vaultSize}</span>
                    </div>
                    <div class="vault-stat">
                        <span class="stat-label">Available:</span>
                        <span class="stat-value">200GB</span>
                    </div>
                    <div class="vault-stat">
                        <span class="stat-label">Last Backup:</span>
                        <span class="stat-value">${this.formatRelativeTime(new Date(this.systemStats.lastBackup))}</span>
                    </div>
                </div>
            `;
            vaultInfo.appendChild(infoDiv);
        }
    }

    // Wipe vault
    wipeVault() {
        const confirmation = prompt('This will permanently delete all vault data. Type "WIPE" to confirm:');
        if (confirmation === 'WIPE') {
            this.logAudit('VAULT_WIPED', '5TB vault wiped by admin');
            this.showNotification('🗑️ Vault wiped successfully');
            this.systemStats.vaultSize = '0TB';
            this.updateDashboard();
        } else if (confirmation !== null) {
            this.showNotification('❌ Wipe cancelled');
        }
    }

    // Backup vault
    backupVault() {
        this.showNotification('💾 Creating backup...');
        
        setTimeout(() => {
            this.systemStats.lastBackup = new Date().toISOString();
            this.logAudit('VAULT_BACKUP', 'Vault backup created');
            this.showNotification('✅ Backup completed successfully');
        }, 2000);
    }

    // Restore vault
    restoreVault() {
        this.showNotification('📥 Restoring from backup...');
        
        setTimeout(() => {
            this.systemStats.vaultSize = '4.8TB';
            this.logAudit('VAULT_RESTORE', 'Vault restored from backup');
            this.showNotification('✅ Restore completed successfully');
            this.updateDashboard();
        }, 3000);
    }

    // Load analytics
    loadAnalytics() {
        const analyticsContent = document.querySelector('#analytics-section .analytics-content');
        if (!analyticsContent) return;
        
        analyticsContent.innerHTML = `
            <div class="analytics-charts">
                <div class="chart-container">
                    <h4>User Activity (Last 7 Days)</h4>
                    <div class="chart-placeholder">
                        📊 Chart: Active users trend
                    </div>
                </div>
                <div class="chart-container">
                    <h4>Message Volume</h4>
                    <div class="chart-placeholder">
                        📈 Chart: Messages per day
                    </div>
                </div>
                <div class="chart-container">
                    <h4>Storage Usage</h4>
                    <div class="chart-placeholder">
                        💾 Chart: Storage breakdown
                    </div>
                </div>
            </div>
            <div class="analytics-summary">
                <h4>Summary Statistics</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Avg. Daily Users:</span>
                        <span class="summary-value">127</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Avg. Daily Messages:</span>
                        <span class="summary-value">1,847</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Peak Usage:</span>
                        <span class="summary-value">3:00 PM</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Growth Rate:</span>
                        <span class="summary-value">+12.3%</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Export analytics
    exportAnalytics() {
        const analyticsData = {
            exportDate: new Date().toISOString(),
            systemStats: this.systemStats,
            users: this.users,
            auditLog: this.auditLog.slice(-50) // Last 50 entries
        };
        
        const blob = new Blob([JSON.stringify(analyticsData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `luna-analytics-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.logAudit('ANALYTICS_EXPORTED', 'Analytics data exported');
        this.showNotification('📥 Analytics exported successfully');
    }

    // Load system settings
    loadSystemSettings() {
        const settingsContent = document.querySelector('#system-section .system-settings');
        if (!settingsContent) return;
        
        settingsContent.innerHTML = `
            <div class="settings-group">
                <h4>Security Settings</h4>
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                        <span>Two-Factor Authentication</span>
                    </label>
                </div>
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                        <span>End-to-End Encryption</span>
                    </label>
                </div>
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                        <span>Session Timeout</span>
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h4>Performance Settings</h4>
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                        <span>Real-time Sync</span>
                    </label>
                </div>
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                        <span>Compression</span>
                    </label>
                </div>
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                        <span>Auto-Backup</span>
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h4>Notification Settings</h4>
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                        <span>Email Notifications</span>
                    </label>
                </div>
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                        <span>Push Notifications</span>
                    </label>
                </div>
            </div>
        `;
    }

    // Load system data
    loadSystemData() {
        // Mock system data
        this.systemStats = {
            totalUsers: 342,
            activeUsers: 127,
            totalMessages: 45678,
            systemStatus: '🟢',
            vaultSize: '4.8TB',
            lastBackup: new Date(Date.now() - 3600000).toISOString()
        };
        
        this.updateDashboard();
    }

    // Start real-time monitoring
    startRealTimeMonitoring() {
        setInterval(() => {
            // Update active users randomly
            this.systemStats.activeUsers = Math.floor(Math.random() * 50) + 100;
            
            // Update system status
            const statuses = ['🟢', '🟡', '🔴'];
            this.systemStats.systemStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Update dashboard if visible
            if (this.currentSection === 'dashboard') {
                this.updateDashboard();
            }
        }, 5000);
    }

    // Refresh data
    refreshData() {
        this.loadSystemData();
        this.loadSectionData(this.currentSection);
        this.showNotification('🔄 Data refreshed');
    }

    // Back to vault
    backToVault() {
        const vaultLayer = document.getElementById('vault-layer');
        const adminLayer = document.getElementById('admin-layer');
        
        if (vaultLayer && adminLayer) {
            adminLayer.classList.add('hidden-layer');
            adminLayer.classList.remove('active-layer');
            vaultLayer.classList.remove('hidden-layer');
            vaultLayer.classList.add('active-layer');
        }
    }

    // Log audit event
    logAudit(action, details) {
        const auditEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            details: details,
            user: this.currentUser?.email || 'admin'
        };
        
        this.auditLog.push(auditEntry);
        
        // Keep only last 1000 entries
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-1000);
        }
    }

    // Format relative time
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
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

// Initialize admin system
window.lunaAdmin = new LunaAdminSystem();

// Export for global access
window.LunaAdminSystem = LunaAdminSystem;
