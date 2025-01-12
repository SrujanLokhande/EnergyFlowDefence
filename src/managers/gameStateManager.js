import { eventManager } from './eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

// Define all possible game states
export const GameStates = {
    MENU: 'MENU',
    LOADING: 'LOADING',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    WAVE_COMPLETE: 'WAVE_COMPLETE',
    GAME_OVER: 'GAME_OVER'
};

export class GameStateManager {
    constructor() {
        this.currentState = GameStates.MENU;
        this.previousState = null;
        this.stateData = {
            score: 0,
            wave: 0,
            resources: 100,
            isPaused: false
        };

        // State-specific handlers
        this.stateHandlers = {
            [GameStates.MENU]: {
                enter: () => this.handleMenuEnter(),
                exit: () => this.handleMenuExit()
            },
            [GameStates.LOADING]: {
                enter: () => this.handleLoadingEnter(),
                exit: () => this.handleLoadingExit()
            },
            [GameStates.PLAYING]: {
                enter: () => this.handlePlayingEnter(),
                exit: () => this.handlePlayingExit()
            },
            [GameStates.PAUSED]: {
                enter: () => this.handlePausedEnter(),
                exit: () => this.handlePausedExit()
            },
            [GameStates.WAVE_COMPLETE]: {
                enter: () => this.handleWaveCompleteEnter(),
                exit: () => this.handleWaveCompleteExit()
            },
            [GameStates.GAME_OVER]: {
                enter: () => this.handleGameOverEnter(),
                exit: () => this.handleGameOverExit()
            }
        };
    }

    // Transition to a new state
    setState(newState, data = {}) {
        // Convert state to uppercase to match GameStates enum
        const stateKey = newState.toUpperCase();
        if (!Object.values(GameStates).includes(stateKey)) {
            console.error(`Invalid game state: ${newState}`);
            return;
        }

        console.log(`Transitioning from ${this.currentState} to ${stateKey}`);

        // Exit current state
        if (this.stateHandlers[this.currentState]?.exit) {
            this.stateHandlers[this.currentState].exit();
        }

        // Update state tracking
        this.previousState = this.currentState;
        this.currentState = stateKey;

        // Enter new state
        if (this.stateHandlers[stateKey]?.enter) {
            this.stateHandlers[stateKey].enter(data);
        }

        // Emit state change event
        eventManager.emit(GameEvents.STATE_CHANGED, {
            previousState: this.previousState,
            currentState: this.currentState,
            data: data
        });
    }

    // State handlers
    handleMenuEnter() {
        console.log('Entering Menu State');
        eventManager.emit(GameEvents.MENU_ENTERED);
    }

    handleMenuExit() {
        console.log('Exiting Menu State');
    }

    handleLoadingEnter() {
        console.log('Entering Loading State');
        // Initialize game resources
        this.stateData.resources = 100;
        this.stateData.score = 0;
        this.stateData.wave = 1;
    }

    handleLoadingExit() {
        console.log('Exiting Loading State');
    }

    handlePlayingEnter() {
        console.log('Entering Playing State');
        eventManager.emit(GameEvents.GAME_STARTED, {
            resources: this.stateData.resources,
            wave: this.stateData.wave
        });
    }

    handlePlayingExit() {
        console.log('Exiting Playing State');
    }

    handlePausedEnter() {
        console.log('Entering Paused State');
        this.stateData.isPaused = true;
        eventManager.emit(GameEvents.GAME_PAUSED);
    }

    handlePausedExit() {
        console.log('Exiting Paused State');
        this.stateData.isPaused = false;
        eventManager.emit(GameEvents.GAME_RESUMED);
    }

    handleWaveCompleteEnter(data) {
        console.log('Wave Complete');
        this.stateData.wave++;
        eventManager.emit(GameEvents.WAVE_COMPLETED, {
            wave: this.stateData.wave - 1,
            nextWave: this.stateData.wave,
            score: this.stateData.score
        });
    }

    handleWaveCompleteExit() {
        eventManager.emit(GameEvents.WAVE_STARTED, {
            wave: this.stateData.wave
        });
    }

    handleGameOverEnter(data) {
        console.log('Game Over');
        eventManager.emit(GameEvents.GAME_OVER, {
            score: this.stateData.score,
            wave: this.stateData.wave,
            ...data
        });
    }

    handleGameOverExit() {
        // Reset game state for new game
        this.stateData.score = 0;
        this.stateData.wave = 1;
        this.stateData.resources = 100;
    }

    // Utility methods
    getCurrentState() {
        return this.currentState;
    }

    getPreviousState() {
        return this.previousState;
    }

    isPlaying() {
        return this.currentState === GameStates.PLAYING;
    }

    isPaused() {
        return this.currentState === GameStates.PAUSED;
    }

    getStateData() {
        return { ...this.stateData };
    }

    updateScore(amount) {
        this.stateData.score += amount;
        eventManager.emit(GameEvents.SCORE_UPDATED, {
            score: this.stateData.score,
            change: amount
        });
    }

    updateResources(amount) {
        this.stateData.resources += amount;
        eventManager.emit(GameEvents.RESOURCES_CHANGED, {
            resources: this.stateData.resources,
            change: amount
        });
    }
}