// storage-manager.js - Handles secure storage operations

class StorageManager {
    static STORAGE_KEYS = {
        SETTINGS: 'privacy_analyzer_settings',
        ANALYSIS_CACHE: 'privacy_analyzer_cache',
        USER_PREFERENCES: 'privacy_analyzer_preferences'
    };

    static async getItem(key) {
        try {
            const result = await chrome.storage.local.get(key);
            return result[key];
        } catch (error) {
            console.error('[Storage] Error getting item:', error);
            return null;
        }
    }

    static async setItem(key, value) {
        try {
            await chrome.storage.local.set({ [key]: value });
            return true;
        } catch (error) {
            console.error('[Storage] Error setting item:', error);
            return false;
        }
    }

    static async removeItem(key) {
        try {
            await chrome.storage.local.remove(key);
            return true;
        } catch (error) {
            console.error('[Storage] Error removing item:', error);
            return false;
        }
    }

    static async clearAll() {
        try {
            await chrome.storage.local.clear();
            return true;
        } catch (error) {
            console.error('[Storage] Error clearing storage:', error);
            return false;
        }
    }

    // Settings management
    static async getSettings() {
        const settings = await this.getItem(this.STORAGE_KEYS.SETTINGS);
        return settings || {
            analysisLevel: 'default',
            autoAnalyze: false,
            notificationsEnabled: true
        };
    }

    static async updateSettings(newSettings) {
        const currentSettings = await this.getSettings();
        return this.setItem(this.STORAGE_KEYS.SETTINGS, {
            ...currentSettings,
            ...newSettings
        });
    }

    // Analysis cache management
    static async cacheAnalysis(url, analysis) {
        const cache = await this.getItem(this.STORAGE_KEYS.ANALYSIS_CACHE) || {};
        const timestamp = Date.now();
        
        // Remove old entries if cache is too large (keep last 50 analyses)
        const entries = Object.entries(cache);
        if (entries.length >= 50) {
            const oldestEntries = entries
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)
                .slice(0, entries.length - 49);
            
            oldestEntries.forEach(([key]) => delete cache[key]);
        }

        cache[url] = {
            data: analysis,
            timestamp
        };

        return this.setItem(this.STORAGE_KEYS.ANALYSIS_CACHE, cache);
    }

    static async getCachedAnalysis(url) {
        const cache = await this.getItem(this.STORAGE_KEYS.ANALYSIS_CACHE) || {};
        const entry = cache[url];
        
        if (!entry) return null;

        // Check if cache is older than 24 hours
        const now = Date.now();
        const age = now - entry.timestamp;
        if (age > 24 * 60 * 60 * 1000) {
            delete cache[url];
            await this.setItem(this.STORAGE_KEYS.ANALYSIS_CACHE, cache);
            return null;
        }

        return entry.data;
    }

    // User preferences management
    static async getUserPreferences() {
        const preferences = await this.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
        return preferences || {
            theme: 'light',
            fontSize: 'medium',
            language: 'en'
        };
    }

    static async updateUserPreferences(newPreferences) {
        const currentPreferences = await this.getUserPreferences();
        return this.setItem(this.STORAGE_KEYS.USER_PREFERENCES, {
            ...currentPreferences,
            ...newPreferences
        });
    }

    // Storage quota management
    static async getStorageUsage() {
        try {
            const bytesInUse = await new Promise((resolve) => {
                chrome.storage.local.getBytesInUse(null, resolve);
            });

            const quota = await new Promise((resolve) => {
                chrome.storage.local.get(null, (items) => {
                    const totalBytes = new Blob([JSON.stringify(items)]).size;
                    resolve(totalBytes);
                });
            });

            return {
                used: bytesInUse,
                total: quota,
                percentage: (bytesInUse / quota) * 100
            };
        } catch (error) {
            console.error('[Storage] Error getting storage usage:', error);
            return null;
        }
    }

    // Storage cleanup
    static async cleanupOldData() {
        try {
            const cache = await this.getItem(this.STORAGE_KEYS.ANALYSIS_CACHE) || {};
            const now = Date.now();
            let cleaned = 0;

            // Remove entries older than 24 hours
            Object.entries(cache).forEach(([key, value]) => {
                if (now - value.timestamp > 24 * 60 * 60 * 1000) {
                    delete cache[key];
                    cleaned++;
                }
            });

            if (cleaned > 0) {
                await this.setItem(this.STORAGE_KEYS.ANALYSIS_CACHE, cache);
                console.log(`[Storage] Cleaned up ${cleaned} old entries`);
            }

            return cleaned;
        } catch (error) {
            console.error('[Storage] Error during cleanup:', error);
            return 0;
        }
    }
}

// Export for use in other files
export { StorageManager }; 