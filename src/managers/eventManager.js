export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.debug = false;
        this.warningsSent = new Set(); // Track which warnings we've already shown
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

        if (this.debug) {
            console.log(`Subscribing to event: ${eventName}`);
        }

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

        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event ${eventName} handler:`, error);
                }
            });
        } else {
            // Only show warning once per event type
            if (this.debug && !this.warningsSent.has(eventName)) {
                console.warn(`No listeners for event: ${eventName}`);
                this.warningsSent.add(eventName);
            }
        }
    }
    handleStateChange(data) {      
        switch(data.currentState) {
            case GameStates.PREPARING:
                console.log('Entering PREPARING state');
                // Reset any necessary game state here
                break;
                    
            case GameStates.PLAYING:
                console.log('Entering PLAYING state');
                this.resumeGameSystems();
                break;
                    
            case GameStates.PAUSED:
                this.pauseGameSystems();
                break;
                    
            case GameStates.WAVE_COMPLETE:
                console.log('Entering WAVE_COMPLETE state');
                break;           
                
            default:
                break;
        }
    
        if (DEBUG_CONFIG.enabled) {
            DebugUtils.log(
                DEBUG_CATEGORIES.SYSTEMS, 
                `State changed from ${data.previousState} to ${data.currentState}`,
                data
            );
        }
    }
    
    // Helper methods for state changes
    resumeGameSystems() {
        this.app.ticker.start();
        if (DEBUG_CONFIG.enabled) {
            DebugUtils.log(DEBUG_CATEGORIES.SYSTEMS, 'Game systems resumed');
        }
    }
    
    pauseGameSystems() {
        this.app.ticker.stop();
        if (DEBUG_CONFIG.enabled) {
            DebugUtils.log(DEBUG_CATEGORIES.SYSTEMS, 'Game systems paused');
        }
    }
    clear() {
        this.listeners.clear();
    }

    getListenerCount(eventName) {
        return this.listeners.get(eventName)?.size || 0;
    }

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