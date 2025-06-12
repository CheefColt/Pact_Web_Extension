// progress.js - Handles progress indicators and loading states

class ProgressManager {
    constructor() {
        this.progressContainer = null;
        this.progressBar = null;
        this.progressText = null;
        this.currentProgress = 0;
        this.initializeUI();
    }

    initializeUI() {
        // Create progress container
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'progress-container';
        this.progressContainer.style.display = 'none';

        // Create progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';
        
        // Create progress text
        this.progressText = document.createElement('div');
        this.progressText.className = 'progress-text';

        // Assemble components
        this.progressContainer.appendChild(this.progressBar);
        this.progressContainer.appendChild(this.progressText);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .progress-container {
                margin: 16px 0;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
            }

            .progress-bar {
                height: 4px;
                background: #e2e8f0;
                border-radius: 2px;
                overflow: hidden;
                position: relative;
            }

            .progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: #3b82f6;
                transition: width 0.3s ease;
            }

            .progress-text {
                margin-top: 8px;
                font-size: 12px;
                color: #64748b;
                text-align: center;
            }

            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }

            .progress-indeterminate .progress-bar::after {
                width: 40% !important;
                animation: progress-indeterminate 1.5s infinite ease-in-out;
            }

            @keyframes progress-indeterminate {
                0% { left: -40%; }
                100% { left: 100%; }
            }
        `;
        document.head.appendChild(style);
    }

    show() {
        if (!document.body.contains(this.progressContainer)) {
            document.body.appendChild(this.progressContainer);
        }
        this.progressContainer.style.display = 'block';
    }

    hide() {
        this.progressContainer.style.display = 'none';
    }

    setProgress(percent, text = '') {
        this.currentProgress = Math.min(100, Math.max(0, percent));
        this.progressBar.style.setProperty('--progress', `${this.currentProgress}%`);
        this.progressBar.style.width = `${this.currentProgress}%`;
        
        if (text) {
            this.progressText.textContent = text;
        } else {
            this.progressText.textContent = `${Math.round(this.currentProgress)}%`;
        }
    }

    setIndeterminate(text = 'Loading...') {
        this.progressContainer.classList.add('progress-indeterminate');
        this.progressText.textContent = text;
    }

    clearIndeterminate() {
        this.progressContainer.classList.remove('progress-indeterminate');
    }

    // Utility method for step-based progress
    static calculateStepProgress(currentStep, totalSteps) {
        return (currentStep / totalSteps) * 100;
    }
}

// Export for use in other files
export { ProgressManager }; 