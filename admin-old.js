// LUNA STEALTH CHAT v3.0 (ULTRA-PRO) - Supreme Admin Forbidden Dashboard

class LunaAdminSystem {
    constructor() {
        this.isAdmin = false;
        this.currentUser = null;
        this.systemStats = {
            totalUsers: 0,
            activeUsers: 0,
            totalMessages: 0,
            systemStatus: 'online',
            vaultSize: '5TB',
            uptime: 0
        };
        this.users = [];
        this.auditLog = [];
        this.analytics = {};
        
        this.initializeAdmin();
    }

    // Initialize admin system
    initializeAdmin() {
        this.checkAdminAccess();
        this.bindEvents();
        this.loadSystemData();
        this.startRealTimeMonitoring();
    }

    // Check if current user is admin
    checkAdminAccess() {
        // In real implementation, this would check authenticated user
        // For demo, we'll simulate admin access
        this.currentUser = {
            email: LUNA_CONFIG.ADMIN,
            displayName: 'Supreme Admin',
            role: 'admin'
        };
        
        this.isAdmin = this.currentUser.email === LUNA_CONFIG.ADMIN;
        
        if (this.isAdmin) {
            this.showNotification('⚡ Supreme Admin Access Granted');
            this.unlockSupremePowers();
        }
    }

    // Unlock supreme admin powers
    unlockSupremePowers() {
        if (!this.isAdmin) return;
        
        // Enable all admin features
        this.showNotification('🔓 All 5TB protocols unlocked');
        this.showNotification('👑 Supreme Admin Powers Activated');
        
        // Log admin access
        this.addAuditLog('ADMIN_ACCESS', 'Supreme Admin login detected');
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
            refreshBtn.addEventListener('click', () => this.refreshAllData());
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToVault());
        }

        // User management
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.addNewUser());
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

        // Analytics
        const exportAnalyticsBtn = document.getElementById('export-analytics-btn');
        if (exportAnalyticsBtn) {
            exportAnalyticsBtn.addEventListener('click', () => this.exportAnalytics());
        }
    }

    // Switch admin section
    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const activeSection = document.getElementById(`${sectionName}-section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // Load section data
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'vault':
                this.loadVaultData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'system':
                this.loadSystemSettings();
                break;
        }
    }

    // Load system data
    loadSystemData() {
        // Mock system stats
        this.systemStats = {
            totalUsers: 1247,
            activeUsers: 89,
            totalMessages: 45678,
            systemStatus: 'online',
            vaultSize: '5TB',
            uptime: Math.floor(performance.now() / 1000)
        };

        // Mock users
        this.users = [
            { id: 1, email: 'alice@example.com', name: 'Alice Chen', status: 'active', lastSeen: new Date(), role: 'user' },
            { id: 2, email: 'bob@example.com', name: 'Bob Smith', status: 'active', lastSeen: new Date(), role: 'user' },
            { id: 3, email: 'carol@example.com', name: 'Carol Davis', status: 'inactive', lastSeen: new Date(Date.now() - 86400000), role: 'user' },
            { id: 4, email: 'dave@example.com', name: 'Dave Wilson', status: 'pending', lastSeen: null, role: 'pending' }
        ];

        // Mock audit log
        this.auditLog = [
            { action: 'LOGIN', user: 'Alice Chen', timestamp: new Date(), details: 'Successful login' },
            { action: 'MESSAGE_SENT', user: 'Bob Smith', timestamp: new Date(Date.now() - 300000), details: 'Sent encrypted message' },
            { action: 'ADMIN_ACCESS', user: 'Supreme Admin', timestamp: new Date(Date.now() - 600000), details: 'Admin panel accessed' },
            { action: 'USER_ADDED', user: 'Supreme Admin', timestamp: new Date(Date.now() - 1800000), details: 'Added new user: Dave Wilson' }
        ];

        this.updateDashboardStats();
    }

    // Update dashboard statistics
    updateDashboardStats() {
        const elements = {
            'total-users': this.systemStats.totalUsers,
            'active-users': this.systemStats.activeUsers,
            'total-messages': this.systemStats.totalMessages,
            'system-status': this.systemStats.systemStatus === 'online' ? '🟢' : '🔴'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    // Load dashboard data
    loadDashboardData() {
        this.updateDashboardStats();
        this.showNotification('📊 Dashboard refreshed');
    }

    // Load users data
    loadUsersData() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        usersList.innerHTML = '';

        this.users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            userEl.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: var(--glass-medium);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                margin-bottom: 12px;
            `;

            const statusColor = {
                active: 'var(--success-neon)',
                inactive: 'var(--warning-neon)',
                pending: 'var(--primary-neon)'
            }[user.status] || 'var(--glass-border)';

            userEl.innerHTML = `
                <div class="user-info">
                    <div style="font-weight: 600; color: white; margin-bottom: 4px;">${user.name}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${user.email}</div>
                    <div style="font-size: 11px; color: ${statusColor}; margin-top: 4px;">
                        ${user.status.toUpperCase()} • Last seen: ${user.lastSeen ? this.formatTime(user.lastSeen) : 'Never'}
                    </div>
                </div>
                <div class="user-actions">
                    <button class="glass-btn" onclick="adminSystem.toggleUserStatus(${user.id})" style="padding: 8px 16px; font-size: 12px;">
                        ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    ${this.isAdmin ? `<button class="danger-btn" onclick="adminSystem.removeUser(${user.id})" style="padding: 8px 16px; font-size: 12px; margin-left: 8px;">Remove</button>` : ''}
                </div>
            `;

            usersList.appendChild(userEl);
        });
    }

    // Load vault data
    loadVaultData() {
        this.showNotification('🔐 Vault data loaded');
    }

    // Load analytics data
    loadAnalyticsData() {
        const analyticsContent = document.querySelector('.analytics-content');
        if (!analyticsContent) return;

        analyticsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-value">${this.systemStats.totalMessages}</div>
                    <div class="stat-label">Total Messages</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Math.floor(this.systemStats.totalMessages / 30)}</div>
                    <div class="stat-label">Daily Average</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.systemStats.vaultSize}</div>
                    <div class="stat-label">Vault Size</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.formatUptime(this.systemStats.uptime)}</div>
                    <div class="stat-label">System Uptime</div>
                </div>
            </div>
            <div style="background: var(--glass-medium); border: 1px solid var(--glass-border); border-radius: 12px; padding: 20px; text-align: center; color: rgba(255,255,255,0.5);">
                📊 Advanced analytics charts coming soon
            </div>
        `;

        this.showNotification('📈 Analytics data loaded');
    }

    // Load system settings
    loadSystemSettings() {
        const systemSettings = document.querySelector('.system-settings');
        if (!systemSettings) return;

        systemSettings.innerHTML = `
            <div class="settings-group">
                <h4 style="color: var(--primary-neon); margin-bottom: 16px;">Security Settings</h4>
                <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-medium); border-radius: 8px; margin-bottom: 8px;">
                    <span>Two-Factor Authentication</span>
                    <div class="toggle-switch active" onclick="adminSystem.toggleSetting(this)"></div>
                </div>
                <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-medium); border-radius: 8px; margin-bottom: 8px;">
                    <span>Auto-Backup</span>
                    <div class="toggle-switch active" onclick="adminSystem.toggleSetting(this)"></div>
                </div>
                <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-medium); border-radius: 8px; margin-bottom: 8px;">
                    <span>Maintenance Mode</span>
                    <div class="toggle-switch" onclick="adminSystem.toggleSetting(this)"></div>
                </div>
            </div>
            <div class="settings-group">
                <h4 style="color: var(--primary-neon); margin-bottom: 16px; margin-top: 24px;">System Configuration</h4>
                <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-medium); border-radius: 8px; margin-bottom: 8px;">
                    <span>Max Users</span>
                    <input type="number" value="5000" style="background: var(--glass-heavy); border: 1px solid var(--glass-border); color: white; padding: 4px 8px; border-radius: 4px; width: 80px;">
                </div>
                <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--glass-medium); border-radius: 8px; margin-bottom: 8px;">
                    <span>Session Timeout (min)</span>
                    <input type="number" value="30" style="background: var(--glass-heavy); border: 1px solid var(--glass-border); color: white; padding: 4px 8px; border-radius: 4px; width: 80px;">
                </div>
            </div>
        `;

        this.showNotification('⚙️ System settings loaded');
    }

    // Add new user
    addNewUser() {
        const email = prompt('Enter user email:');
        if (!email || !email.includes('@')) {
            this.showNotification('❌ Invalid email address');
            return;
        }

        const name = prompt('Enter user name:');
        if (!name) {
            this.showNotification('❌ Name is required');
            return;
        }

        const newUser = {
            id: this.users.length + 1,
            email: email,
            name: name,
            status: 'pending',
            lastSeen: null,
            role: 'pending'
        };

        this.users.push(newUser);
        this.addAuditLog('USER_ADDED', `Added new user: ${name} (${email})`);
        this.loadUsersData();
        this.showNotification(`✅ User ${name} added successfully`);
    }

    // Toggle user status
    toggleUserStatus(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.status = user.status === 'active' ? 'inactive' : 'active';
        user.lastSeen = new Date();
        
        this.addAuditLog('USER_STATUS_CHANGE', `Changed ${user.name} status to ${user.status}`);
        this.loadUsersData();
        this.showNotification(`👤 User ${user.name} status changed to ${user.status}`);
    }

    // Remove user
    removeUser(userId) {
        if (!this.isAdmin) {
            this.showNotification('❌ Admin access required');
            return;
        }

        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (confirm(`Are you sure you want to remove ${user.name}? This action cannot be undone.`)) {
            this.users = this.users.filter(u => u.id !== userId);
            this.addAuditLog('USER_REMOVED', `Removed user: ${user.name} (${user.email})`);
            this.loadUsersData();
            this.showNotification(`🗑️ User ${user.name} removed`);
        }
    }

    // Wipe vault (Supreme Admin only)
    wipeVault() {
        if (!this.isAdmin) {
            this.showNotification('❌ Supreme Admin access required');
            return;
        }

        const confirmation = prompt('⚠️ DANGER: This will wipe the entire 5TB vault!\n\nType "WIPE-VAULT-CONFIRM" to proceed:');
        if (confirmation === 'WIPE-VAULT-CONFIRM') {
            this.addAuditLog('VAULT_WIPE', 'Supreme Admin wiped entire vault');
            this.showNotification('🗑️ 5TB Vault wiped successfully');
            this.showNotification('⚠️ All data has been permanently deleted');
        } else if (confirmation) {
            this.showNotification('❌ Confirmation failed');
        }
    }

    // Backup vault
    backupVault() {
        this.showNotification('💾 Creating vault backup...');
        
        setTimeout(() => {
            this.addAuditLog('VAULT_BACKUP', 'Created vault backup');
            this.showNotification('✅ Vault backup completed');
            this.showNotification('📁 Backup saved to secure location');
        }, 2000);
    }

    // Restore vault
    restoreVault() {
        if (!this.isAdmin) {
            this.showNotification('❌ Supreme Admin access required');
            return;
        }

        if (confirm('⚠️ This will restore the vault from the last backup. Continue?')) {
            this.showNotification('📥 Restoring vault from backup...');
            
            setTimeout(() => {
                this.addAuditLog('VAULT_RESTORE', 'Restored vault from backup');
                this.showNotification('✅ Vault restored successfully');
                this.refreshAllData();
            }, 3000);
        }
    }

    // Export analytics
    exportAnalytics() {
        const analyticsData = {
            systemStats: this.systemStats,
            users: this.users,
            auditLog: this.auditLog,
            exportTime: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `luna-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.addAuditLog('ANALYTICS_EXPORT', 'Exported analytics data');
        this.showNotification('📥 Analytics exported successfully');
    }

    // Toggle setting
    toggleSetting(element) {
        element.classList.toggle('active');
        const isActive = element.classList.contains('active');
        const settingName = element.previousElementSibling.textContent;
        
        this.addAuditLog('SETTING_CHANGE', `Changed ${settingName} to ${isActive ? 'ON' : 'OFF'}`);
        this.showNotification(`⚙️ ${settingName}: ${isActive ? 'ENABLED' : 'DISABLED'}`);
    }

    // Refresh all data
    refreshAllData() {
        this.loadSystemData();
        this.switchSection('dashboard');
        this.showNotification('🔄 All data refreshed');
    }

    // Back to vault
    backToVault() {
        const adminLayer = document.getElementById('admin-layer');
        const vaultLayer = document.getElementById('vault-layer');
        
        if (adminLayer && vaultLayer) {
            adminLayer.classList.add('hidden-layer');
            adminLayer.classList.remove('active-layer');
            vaultLayer.classList.remove('hidden-layer');
            vaultLayer.classList.add('active-layer');
        }
        
        this.showNotification('🔙 Returned to vault');
    }

    // Add audit log entry
    addAuditLog(action, details) {
        this.auditLog.unshift({
            action: action,
            user: this.currentUser.displayName,
            timestamp: new Date(),
            details: details
        });

        // Keep only last 100 entries
        if (this.auditLog.length > 100) {
            this.auditLog = this.auditLog.slice(0, 100);
        }
    }

    // Start real-time monitoring
    startRealTimeMonitoring() {
        setInterval(() => {
            this.systemStats.uptime++;
            this.systemStats.activeUsers = Math.max(80, Math.min(100, this.systemStats.activeUsers + Math.floor(Math.random() * 5) - 2));
            
            if (document.getElementById('dashboard-section').classList.contains('active')) {
                this.updateDashboardStats();
            }
        }, 5000);
    }

    // Format time
    formatTime(date) {
        return new Date(date).toLocaleString();
    }

    // Format uptime
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    // Show notification
    showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            background: linear-gradient(135deg, var(--secondary-neon), var(--primary-neon));
            color: var(--deep-charcoal);
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 8px;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize admin when called from vault
window.initializeAdmin = () => {
    if (!window.adminSystem) {
        window.adminSystem = new LunaAdminSystem();
    }
};

// Add toggle switch styles
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .toggle-switch {
        position: relative;
        width: 48px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .toggle-switch.active {
        background: var(--primary-neon);
    }
    
    .toggle-switch::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: transform 0.3s ease;
    }
    
    .toggle-switch.active::after {
        transform: translateX(24px);
    }
    
    .user-item:hover {
        background: var(--glass-light) !important;
        transform: translateY(-2px);
    }
    
    .setting-item:hover {
        background: var(--glass-light) !important;
    }
`;
document.head.appendChild(adminStyles);