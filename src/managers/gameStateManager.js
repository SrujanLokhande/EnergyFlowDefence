import { eventManager } from './eventManager.js';
import { GameEvents } from '../config/eventTypes.js';
import { GameDatabase } from '../services/dynamoDB.js';

// Define all possible game states
export const GameStates = {
    MENU: 'MENU',
    LOADING: 'LOADING',
    PREPARING: 'PREPARING',  
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
            wave: 1,
            // Start with 500 for testing:
            resources: 500,
            isPaused: false
        };

        // Add tower event handling
        this.setupTowerEventListeners();        

        // Each state can have "enter" and "exit" methods
        this.stateHandlers = {
            [GameStates.MENU]: {
                enter: () => this.handleMenuEnter(),
                exit: () => this.handleMenuExit()
            },
            [GameStates.LOADING]: {
                enter: () => this.handleLoadingEnter(),
                exit: () => this.handleLoadingExit()
            },
            [GameStates.PREPARING]: {
                enter: () => this.handlePreparingEnter(),
                exit: () => this.handlePreparingExit()
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
                enter: (data) => this.handleGameOver(data),
                exit: () => this.handleGameOverExit()
            }
        };

        this.gameDb = new GameDatabase();        
    }

    async getTopScores() {
        try {
            return await this.gameDb.getTopScores(5);
        } catch (error) {
            console.error('Error fetching top scores:', error);
            return [];
        }
    }

    setupTowerEventListeners() {
        eventManager.subscribe(GameEvents.TOWER_PLACED, (data) => {            
            const success = this.updateResources(-data.cost);
            if (success) {
                console.log(`Resources updated. New total: ${this.stateData.resources}`);
            } else {
                console.warn('Insufficient resources for tower placement!');
            }
        });
    }

    // New handlers for preparation state
    handlePreparingEnter() {
        console.log('Entering Preparation State');
        eventManager.emit(GameEvents.GAME_PREPARATION_STARTED);
        this.stateData.isPaused = false;
    }

    handlePreparingExit() {
        console.log('Exiting Preparation State');
    }


    // Transition to a new state
    setState(newState, data = {}) {
        // Convert to uppercase to match the enum
        const stateKey = newState.toUpperCase();
        if (!Object.values(GameStates).includes(stateKey)) {
            console.error(`Invalid game state: ${newState}`);
            return;
        }

        // checks if we are transistioning to the same state twice
        if (this.currentState === stateKey) {
            console.warn(`Attempted to transition to the same state: ${stateKey}`);
            return;
        }
        console.log(`Transitioning from ${this.currentState} to ${stateKey}`);

        // Exit old state
        if (this.stateHandlers[this.currentState]?.exit) {
            this.stateHandlers[this.currentState].exit();
        }

        // Update state
        this.previousState = this.currentState;
        this.currentState = stateKey;

        // Enter new state
        if (this.stateHandlers[stateKey]?.enter) {
            this.stateHandlers[stateKey].enter(data);
        }

        // Emit a valid event from eventTypes.js
        eventManager.emit(GameEvents.STATE_CHANGED, {
            previousState: this.previousState,
            currentState: this.currentState,
            data: data
        });
    }

    isPreparing() {
        return this.currentState === GameStates.PREPARING;
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
        // You can reset or set resources here if desired
        // this.stateData.resources = 500; 
        this.stateData.score = 0;
        this.stateData.wave = 1;
    }
    handleLoadingExit() {
        console.log('Exiting Loading State');
    }

    handlePlayingEnter() {
        console.log('Entering Playing State');
        // Optionally emit GAME_STARTED
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

    handleWaveCompleteEnter() {
        console.log('Entering Wave Complete State');
        const waveBonus = Math.floor(this.stateData.wave * 50);
        this.updateScore(waveBonus);
        this.updateResources(waveBonus);
        
        console.log(`Wave ${this.stateData.wave} bonus awarded: ${waveBonus}`);
    }

    handleWaveCompleteExit() {
        console.log('Exiting Wave Complete State');        
        console.log(`Prepared for wave ${this.stateData.wave}`);
    }

    isWaveComplete() {
        return this.currentState === GameStates.WAVE_COMPLETE;
    }

    handleGameOver(data) {
        const finalScore = this.stateData.score;
        const finalWave = this.stateData.wave;
        
        console.log('Game Over - Final Score:', finalScore, 'Wave:', finalWave); // Debug log        

        //Then save score to DynamoDB
        // const playerId = 'player_' + Date.now();
        // if (finalScore > 0) { // Only save if score is greater than 0
        //     this.gameDb.updateScore(playerId, finalScore)
        //         .then(response => {
        //             console.log('Score saved successfully:', response);
        //             eventManager.emit(GameEvents.LEADERBOARD_UPDATED);
        //         })
        //         .catch(error => {
        //             console.error('Failed to save score:', error);
        //         });
        // }
    }

    handleGameOverExit() {        
        // Reset core state data
        this.stateData = {
            score: 0,
            wave: 1,
            resources: 500,
            isPaused: false
        };

        // Emit events to update UI
        eventManager.emit(GameEvents.SCORE_UPDATED, { score: 0 });
        eventManager.emit(GameEvents.RESOURCES_CHANGED, { resources: 500 });
        eventManager.emit(GameEvents.WAVE_NUMBER_UPDATED, { wave: 1 });
        
        console.log('Game over state exited, state data reset');
        
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

    updateWave(waveNumber) {
        this.stateData.wave = waveNumber;
        eventManager.emit(GameEvents.WAVE_NUMBER_UPDATED, {
            wave: waveNumber
        });
    }
    
    updateResources(amount) {    
        
        const newAmount = this.stateData.resources + amount;
        if (newAmount < 0) {
            console.warn('[GameStateManager] Attempted to set negative resources:', newAmount);
            return false;
        }        
        this.stateData.resources = newAmount;
        
        eventManager.emit(GameEvents.RESOURCES_CHANGED, {
            resources: this.stateData.resources,
            change: amount
        });
        
        return true;
    }

}