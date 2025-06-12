// dom-optimizer.js - Handles DOM optimization and virtual scrolling

import { PerformanceMonitor } from './performance-monitor.js';

class DOMOptimizer {
    static virtualLists = new Map();
    static mutationObserver = null;
    static resizeObserver = null;
    static updateScheduled = false;

    // Initialize DOM optimization
    static init() {
        this.setupMutationObserver();
        this.setupResizeObserver();
        this.setupEventDelegation();
        this.optimizationLevel = PerformanceMonitor.getOptimizationLevel();
    }

    // Setup mutation observer
    static setupMutationObserver() {
        this.mutationObserver = new MutationObserver((mutations) => {
            if (!this.updateScheduled) {
                requestAnimationFrame(() => {
                    this.handleDOMMutations(mutations);
                    this.updateScheduled = false;
                });
                this.updateScheduled = true;
            }
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
    }

    // Setup resize observer
    static setupResizeObserver() {
        this.resizeObserver = new ResizeObserver((entries) => {
            entries.forEach(entry => {
                const listId = entry.target.dataset.virtualListId;
                if (listId && this.virtualLists.has(listId)) {
                    this.updateVirtualList(listId);
                }
            });
        });
    }

    // Setup event delegation
    static setupEventDelegation() {
        document.body.addEventListener('click', this.handleDelegatedEvent);
        document.body.addEventListener('input', this.handleDelegatedEvent);
        document.body.addEventListener('change', this.handleDelegatedEvent);
    }

    // Handle delegated events
    static handleDelegatedEvent(event) {
        const target = event.target;
        const delegatedTo = target.closest('[data-delegate]');
        
        if (delegatedTo) {
            const handler = delegatedTo.dataset.delegate;
            if (typeof window[handler] === 'function') {
                window[handler](event, target);
            }
        }
    }

    // Create a virtual list
    static createVirtualList(container, options = {}) {
        const {
            itemHeight = 50,
            overscan = 3,
            renderItem,
            getItemCount,
            itemKey
        } = options;

        const listId = `virtual-list-${Date.now()}`;
        container.dataset.virtualListId = listId;

        this.virtualLists.set(listId, {
            container,
            itemHeight,
            overscan,
            renderItem,
            getItemCount,
            itemKey,
            scrollTop: 0,
            visibleItems: new Set()
        });

        // Setup container
        container.style.position = 'relative';
        container.style.overflow = 'auto';
        
        // Create content wrapper
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.width = '100%';
        wrapper.style.top = '0';
        container.appendChild(wrapper);

        // Setup observers
        this.resizeObserver.observe(container);
        container.addEventListener('scroll', () => this.handleScroll(listId));

        // Initial render
        this.updateVirtualList(listId);

        return listId;
    }

    // Update virtual list
    static updateVirtualList(listId) {
        const list = this.virtualLists.get(listId);
        if (!list) return;

        const {
            container,
            itemHeight,
            overscan,
            renderItem,
            getItemCount,
            itemKey
        } = list;

        const totalItems = getItemCount();
        const containerHeight = container.clientHeight;
        const scrollTop = container.scrollTop;

        // Calculate visible range
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(
            totalItems - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        );

        // Update wrapper height
        const wrapper = container.firstElementChild;
        wrapper.style.height = `${totalItems * itemHeight}px`;

        // Get currently visible items
        const newVisibleItems = new Set();
        for (let i = startIndex; i <= endIndex; i++) {
            newVisibleItems.add(i);
        }

        // Remove items that are no longer visible
        Array.from(list.visibleItems)
            .filter(i => !newVisibleItems.has(i))
            .forEach(i => {
                const itemElement = container.querySelector(`[data-item-index="${i}"]`);
                if (itemElement) itemElement.remove();
            });

        // Add new visible items
        newVisibleItems.forEach(i => {
            if (!list.visibleItems.has(i)) {
                const itemElement = document.createElement('div');
                itemElement.style.position = 'absolute';
                itemElement.style.top = `${i * itemHeight}px`;
                itemElement.style.width = '100%';
                itemElement.style.height = `${itemHeight}px`;
                itemElement.dataset.itemIndex = i;
                
                const key = itemKey ? itemKey(i) : i;
                itemElement.dataset.itemKey = key;

                renderItem(itemElement, i);
                wrapper.appendChild(itemElement);
            }
        });

        list.visibleItems = newVisibleItems;
        this.virtualLists.set(listId, list);
    }

    // Handle scroll events for virtual lists
    static handleScroll(listId) {
        if (!this.updateScheduled) {
            requestAnimationFrame(() => {
                this.updateVirtualList(listId);
                this.updateScheduled = false;
            });
            this.updateScheduled = true;
        }
    }

    // Batch DOM updates
    static batchUpdate(callback) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                callback(fragment);
                document.body.appendChild(fragment);
                resolve();
            });
        });
    }

    // Optimize element creation
    static createElement(tag, props = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    }

    // Handle DOM mutations
    static handleDOMMutations(mutations) {
        PerformanceMonitor.startMark('dom_mutation');
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.optimizeElement(node);
                    }
                });
            }
        });

        PerformanceMonitor.endMark('dom_mutation');
    }

    // Optimize individual elements
    static optimizeElement(element) {
        // Optimize images
        element.querySelectorAll('img').forEach(img => {
            if (!img.loading) img.loading = 'lazy';
            if (!img.decoding) img.decoding = 'async';
        });

        // Optimize scripts
        element.querySelectorAll('script').forEach(script => {
            if (!script.async && !script.defer) script.defer = true;
        });

        // Optimize event listeners
        const listeners = element.dataset.listeners;
        if (listeners) {
            try {
                const parsed = JSON.parse(listeners);
                Object.entries(parsed).forEach(([event, handler]) => {
                    element.dataset.delegate = handler;
                });
            } catch (error) {
                console.error('Failed to parse listeners:', error);
            }
        }
    }

    // Cleanup
    static cleanup() {
        this.mutationObserver?.disconnect();
        this.resizeObserver?.disconnect();
        this.virtualLists.clear();
        document.body.removeEventListener('click', this.handleDelegatedEvent);
        document.body.removeEventListener('input', this.handleDelegatedEvent);
        document.body.removeEventListener('change', this.handleDelegatedEvent);
    }
}

export { DOMOptimizer }; 