// performance-monitor.js - Handles performance monitoring and optimization

class PerformanceMonitor {
    static metrics = {
        initialization: {},
        operations: {},
        resources: {}
    };

    static marks = new Set();

    // Start timing for a specific operation
    static startMark(name) {
        const markName = `${name}_start`;
        if (!this.marks.has(markName)) {
            performance.mark(markName);
            this.marks.add(markName);
        }
    }

    // End timing and record metric
    static endMark(name, category = 'operations') {
        const startMark = `${name}_start`;
        const endMark = `${name}_end`;
        
        if (this.marks.has(startMark)) {
            performance.mark(endMark);
            performance.measure(name, startMark, endMark);
            
            const measure = performance.getEntriesByName(name).pop();
            if (measure) {
                if (!this.metrics[category][name]) {
                    this.metrics[category][name] = [];
                }
                this.metrics[category][name].push(measure.duration);
            }

            // Cleanup
            performance.clearMarks(startMark);
            performance.clearMarks(endMark);
            performance.clearMeasures(name);
            this.marks.delete(startMark);
        }
    }

    // Track resource loading
    static trackResource(url, type) {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!this.metrics.resources[type]) {
                    this.metrics.resources[type] = [];
                }
                this.metrics.resources[type].push({
                    url,
                    duration: entry.duration,
                    size: entry.transferSize || 0
                });
            });
        });

        observer.observe({ entryTypes: ['resource'] });
    }

    // Monitor long tasks
    static monitorLongTasks() {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                console.warn('Long task detected:', {
                    duration: entry.duration,
                    name: entry.name,
                    startTime: entry.startTime
                });
            });
        });

        observer.observe({ entryTypes: ['longtask'] });
    }

    // Get performance report
    static getReport() {
        const report = {
            metrics: this.metrics,
            summary: {
                averages: {},
                totalResourceSize: 0,
                longTasks: 0
            }
        };

        // Calculate averages
        for (const category in this.metrics) {
            report.summary.averages[category] = {};
            for (const metric in this.metrics[category]) {
                const values = this.metrics[category][metric];
                if (Array.isArray(values)) {
                    report.summary.averages[category][metric] = 
                        values.reduce((a, b) => a + b, 0) / values.length;
                }
            }
        }

        // Calculate total resource size
        if (this.metrics.resources) {
            for (const type in this.metrics.resources) {
                report.summary.totalResourceSize += this.metrics.resources[type]
                    .reduce((total, resource) => total + resource.size, 0);
            }
        }

        return report;
    }

    // Clear all metrics
    static clear() {
        this.metrics = {
            initialization: {},
            operations: {},
            resources: {}
        };
        this.marks.clear();
        performance.clearMarks();
        performance.clearMeasures();
    }

    // Monitor memory usage
    static async monitorMemory() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    // Check if browser is throttling
    static isThrottled() {
        if ('hardwareConcurrency' in navigator) {
            return navigator.hardwareConcurrency < 4;
        }
        return false;
    }

    // Optimize based on device capabilities
    static getOptimizationLevel() {
        const memory = performance.memory;
        const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
        
        if (isMobile || this.isThrottled() || (memory && memory.jsHeapSizeLimit < 2048 * 1024 * 1024)) {
            return 'low';
        } else if (memory && memory.jsHeapSizeLimit > 4096 * 1024 * 1024) {
            return 'high';
        }
        return 'medium';
    }

    // Get optimization suggestions
    static getOptimizationSuggestions() {
        const suggestions = [];
        const report = this.getReport();

        // Check operation times
        for (const category in report.summary.averages) {
            for (const metric in report.summary.averages[category]) {
                const avgTime = report.summary.averages[category][metric];
                if (avgTime > 100) {
                    suggestions.push({
                        type: 'performance',
                        severity: avgTime > 500 ? 'high' : 'medium',
                        message: `${metric} is taking too long (${avgTime.toFixed(2)}ms)`,
                        recommendation: 'Consider optimizing or deferring this operation'
                    });
                }
            }
        }

        // Check resource size
        if (report.summary.totalResourceSize > 5 * 1024 * 1024) {
            suggestions.push({
                type: 'resources',
                severity: 'high',
                message: 'Total resource size is too large',
                recommendation: 'Consider implementing lazy loading or reducing resource size'
            });
        }

        // Check memory usage
        const memory = performance.memory;
        if (memory && (memory.usedJSHeapSize / memory.jsHeapSizeLimit) > 0.8) {
            suggestions.push({
                type: 'memory',
                severity: 'high',
                message: 'High memory usage detected',
                recommendation: 'Implement cleanup of unused objects and reduce DOM size'
            });
        }

        return suggestions;
    }
}

export { PerformanceMonitor }; 