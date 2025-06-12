// sanitizer.js - Handles data sanitization and input validation

class Sanitizer {
    // HTML sanitization
    static sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // URL sanitization
    static sanitizeURL(url) {
        try {
            const parsed = new URL(url);
            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                throw new Error('Invalid protocol');
            }
            return parsed.toString();
        } catch (error) {
            console.error('[Sanitizer] Invalid URL:', error);
            return '';
        }
    }

    // Text content sanitization
    static sanitizeText(input, maxLength = 50000) {
        if (typeof input !== 'string') return '';
        
        // Trim and limit length
        let sanitized = input.trim().slice(0, maxLength);
        
        // Remove potentially dangerous characters
        sanitized = sanitized.replace(/[<>]/g, '');
        
        return sanitized;
    }

    // JSON sanitization
    static sanitizeJSON(input) {
        try {
            if (typeof input === 'string') {
                input = JSON.parse(input);
            }
            return JSON.stringify(input);
        } catch (error) {
            console.error('[Sanitizer] Invalid JSON:', error);
            return '{}';
        }
    }

    // Input validation
    static validateInput(input, rules = {}) {
        const errors = [];

        if (rules.required && !input) {
            errors.push('Input is required');
        }

        if (rules.minLength && input.length < rules.minLength) {
            errors.push(`Input must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && input.length > rules.maxLength) {
            errors.push(`Input must not exceed ${rules.maxLength} characters`);
        }

        if (rules.pattern && !rules.pattern.test(input)) {
            errors.push('Input format is invalid');
        }

        if (rules.type) {
            switch (rules.type) {
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
                        errors.push('Invalid email format');
                    }
                    break;
                case 'url':
                    try {
                        new URL(input);
                    } catch {
                        errors.push('Invalid URL format');
                    }
                    break;
                case 'number':
                    if (isNaN(Number(input))) {
                        errors.push('Must be a number');
                    }
                    break;
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // File content validation
    static validateFileContent(content, options = {}) {
        const {
            maxSize = 5 * 1024 * 1024, // 5MB default
            allowedTypes = ['text/plain', 'text/html'],
            maxLines = 10000
        } = options;

        const errors = [];

        // Check file size
        const size = new Blob([content]).size;
        if (size > maxSize) {
            errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
        }

        // Check content type
        const type = this.getContentType(content);
        if (!allowedTypes.includes(type)) {
            errors.push('Invalid file type');
        }

        // Check number of lines
        const lines = content.split('\n').length;
        if (lines > maxLines) {
            errors.push(`Number of lines exceeds maximum allowed (${maxLines})`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            size,
            type,
            lines
        };
    }

    // Helper method to detect content type
    static getContentType(content) {
        if (/<\/?[a-z][\s\S]*>/i.test(content)) {
            return 'text/html';
        }
        return 'text/plain';
    }

    // Sanitize and validate privacy policy content
    static sanitizePrivacyPolicy(content) {
        // Remove any script tags and their content
        content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Remove style tags
        content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        
        // Remove HTML comments
        content = content.replace(/<!--[\s\S]*?-->/g, '');
        
        // Remove excessive whitespace
        content = content.replace(/\s+/g, ' ').trim();
        
        // Validate the sanitized content
        const validation = this.validateFileContent(content, {
            maxSize: 1024 * 1024, // 1MB
            allowedTypes: ['text/plain', 'text/html'],
            maxLines: 5000
        });

        return {
            content: validation.isValid ? content : '',
            ...validation
        };
    }
}

// Export for use in other files
export { Sanitizer }; 