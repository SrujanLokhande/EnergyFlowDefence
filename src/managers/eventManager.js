export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.debug = false; // Add debug flag
    }

    subscribe(eventName, callback) {
        if (!eventName) {
            console.error('Attempted to subscribe to undefined event');
            return () => {};
        }

        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(eventName);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(eventName);
                }
            }
        };
    }

    emit(eventName, data) {
        if (!eventName) {
            console.error('Attempted to emit undefined event');
            return;
        }

        if (this.debug) {
            console.log(`Emitting event: ${eventName}`, data);
        }

        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event ${eventName} handler:`, error);
                }
            });
        } else if (this.debug) {
            console.log(`No listeners for event: ${eventName}`);
        }
    }

    clear() {
        this.listeners.clear();
    }

    getListenerCount(eventName) {
        return this.listeners.get(eventName)?.size || 0;
    }

    // Enable/disable debug logging
    setDebug(enabled) {
        this.debug = enabled;
    }
}

// Create a global event manager instance
export const eventManager = new EventManager();

// Enable debug mode in development
if (process.env.NODE_ENV !== 'production') {
    eventManager.setDebug(true);
}