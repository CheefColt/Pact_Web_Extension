// resource-optimizer.js - Handles resource loading and optimization

import { PerformanceMonitor } from './performance-monitor.js';

class ResourceOptimizer {
    static resourceQueue = new Map();
    static loadedResources = new Set();
    static observers = new Map();

    // Initialize optimization based on device capabilities
    static init() {
        this.optimizationLevel = PerformanceMonitor.getOptimizationLevel();
        this.setupIntersectionObserver();
        this.setupResourceObserver();
    }

    // Setup intersection observer for lazy loading
    static setupIntersectionObserver() {
        this.observers.set('intersection', new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const resourceId = element.dataset.resourceId;
                        if (resourceId && !this.loadedResources.has(resourceId)) {
                            this.loadResource(resourceId, element);
                        }
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        ));
    }

    // Setup resource loading observer
    static setupResourceObserver() {
        this.observers.set('resource', new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                PerformanceMonitor.trackResource(entry.name, entry.initiatorType);
            });
        }));

        this.observers.get('resource').observe({ entryTypes: ['resource'] });
    }

    // Register a resource for lazy loading
    static registerResource(id, loadCallback, priority = 'medium') {
        this.resourceQueue.set(id, {
            callback: loadCallback,
            priority,
            registered: Date.now()
        });
    }

    // Load a resource
    static async loadResource(id, element) {
        const resource = this.resourceQueue.get(id);
        if (!resource || this.loadedResources.has(id)) return;

        try {
            PerformanceMonitor.startMark(`load_resource_${id}`);
            await resource.callback(element);
            this.loadedResources.add(id);
            this.resourceQueue.delete(id);
            PerformanceMonitor.endMark(`load_resource_${id}`, 'resources');
        } catch (error) {
            console.error(`Failed to load resource ${id}:`, error);
        }
    }

    // Observe an element for lazy loading
    static observe(element, resourceId) {
        if (!element || !resourceId) return;
        
        element.dataset.resourceId = resourceId;
        this.observers.get('intersection').observe(element);
    }

    // Unobserve an element
    static unobserve(element) {
        if (!element) return;
        this.observers.get('intersection').unobserve(element);
    }

    // Preload critical resources
    static async preloadCriticalResources() {
        const criticalResources = Array.from(this.resourceQueue.entries())
            .filter(([, resource]) => resource.priority === 'high');

        await Promise.all(
            criticalResources.map(async ([id]) => {
                const element = document.querySelector(`[data-resource-id="${id}"]`);
                if (element) {
                    await this.loadResource(id, element);
                }
            })
        );
    }

    // Cleanup unused resources
    static cleanup() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes

        for (const [id, resource] of this.resourceQueue) {
            if (now - resource.registered > maxAge) {
                this.resourceQueue.delete(id);
            }
        }
    }

    // Get optimization stats
    static getStats() {
        return {
            queueSize: this.resourceQueue.size,
            loadedCount: this.loadedResources.size,
            optimizationLevel: this.optimizationLevel
        };
    }

    // Optimize image loading
    static optimizeImage(url, options = {}) {
        const {
            maxWidth = 800,
            maxHeight = 600,
            quality = 0.8,
            format = 'webp'
        } = options;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight / height) * width;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => resolve(URL.createObjectURL(blob)),
                    `image/${format}`,
                    quality
                );
            };

            img.onerror = reject;
            img.src = url;
        });
    }

    // Optimize script loading
    static optimizeScript(url, options = {}) {
        const {
            async = true,
            defer = true,
            module = false
        } = options;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = async;
            script.defer = defer;
            if (module) script.type = 'module';

            script.onload = resolve;
            script.onerror = reject;

            document.head.appendChild(script);
        });
    }

    // Optimize stylesheet loading
    static optimizeStylesheet(url, options = {}) {
        const {
            media = 'all',
            preload = true
        } = options;

        return new Promise((resolve, reject) => {
            if (preload) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'style';
                link.href = url;
                document.head.appendChild(link);
            }

            const stylesheet = document.createElement('link');
            stylesheet.rel = 'stylesheet';
            stylesheet.href = url;
            stylesheet.media = media;

            stylesheet.onload = resolve;
            stylesheet.onerror = reject;

            document.head.appendChild(stylesheet);
        });
    }
}

export { ResourceOptimizer }; 