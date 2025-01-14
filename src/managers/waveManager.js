import { ENEMY_TYPES, ENEMY_CONFIG } from '../config/enemyConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';
import { GameStates } from '../managers/gameStateManager.js';

export class WaveManager {
    constructor(enemySystem, gameStateManager, config = {}) {
        this.enemySystem = enemySystem;
        this.gameStateManager = gameStateManager;

        this.config = {
            baseEnemiesPerWave: config.baseEnemiesPerWave || 5,
            enemiesPerWaveGrowth: config.enemiesPerWaveGrowth || 2,
            spawnIntervalMs: config.spawnIntervalMs || 1500,
            batchSize: config.batchSize || 2,
            waveCountdownMs: config.waveCountdownMs || 5000,
            bossWaveInterval: config.bossWaveInterval || 5,
            difficultyScaling: config.difficultyScaling || 1.2,
        };

        this.state = {
            currentWave: 0,
            isWaveInProgress: false,
            remainingEnemies: 0,
            spawnedEnemies: 0,
            totalEnemies: 0,
            isCountdownActive: false,
            lastSpawnTime: 0,
        };

        this.timers = {
            spawn: null,
            wave: null,
            countdown: null,
        };

        // Bind methods to ensure proper context
        this.startWave = this.startWave.bind(this);
        this.canStartWave = this.canStartWave.bind(this);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle wave start requests
        eventManager.subscribe(GameEvents.WAVE_START_REQUESTED, (data) => {
            if (this.canStartWave()) {
                this.startWave(data.wave);
            }
        });
    
        // Handle enemy deaths
        eventManager.subscribe(GameEvents.ENEMY_DIED, (data) => {
            this.handleEnemyDeath();
        });
    
        // Handle game state changes
        eventManager.subscribe(GameEvents.STATE_CHANGED, (data) => {
            if (data.currentState === GameStates.GAME_OVER) {
                this.cleanup();
            } else if (data.currentState === GameStates.PLAYING && !this.state.isWaveInProgress) {
                if (!this.state.currentWave) {
                    this.startWave(1);
                }
            }
        });
    }

    canStartWave() {
        return (
            !this.state.isWaveInProgress &&
            !this.state.isCountdownActive &&
            this.gameStateManager.isPlaying()
        );
    }

    async startWave(waveNumber) {
        if (!this.canStartWave()) {
            console.warn(`[WaveManager] Cannot start wave ${waveNumber}: Invalid state.`);
            return;
        }

        console.log(`[WaveManager] Starting wave ${waveNumber}.`);

        this.state = {
            ...this.state,
            currentWave: waveNumber,
            isWaveInProgress: true,
            spawnedEnemies: 0,
            isCountdownActive: false,
            lastSpawnTime: Date.now(),
        };

        const composition = this.calculateWaveComposition(waveNumber);
        this.state.remainingEnemies = composition.totalEnemies;
        this.state.totalEnemies = composition.totalEnemies;

        console.log(`[WaveManager] Wave ${waveNumber} total enemies:`, composition.totalEnemies);

        console.log(`[WaveManager] Wave composition:`, composition);

        eventManager.emit(GameEvents.WAVE_STARTED, {
            wave: waveNumber,
            composition: composition,
        });

        await this.spawnWaveEnemies(composition);
    }

    calculateWaveComposition(waveNumber) {
        const isBossWave = waveNumber % this.config.bossWaveInterval === 0;
        const difficultyMultiplier = Math.pow(this.config.difficultyScaling, waveNumber - 1);

        const baseEnemies = Math.floor(
            (this.config.baseEnemiesPerWave +
                (waveNumber - 1) * this.config.enemiesPerWaveGrowth) *
                difficultyMultiplier
        );

        const composition = {
            totalEnemies: baseEnemies,
            types: {},
        };

        if (isBossWave) {
            composition.types = {
                [ENEMY_TYPES.BOSS]: 1,
                [ENEMY_TYPES.GRUNT]: Math.floor(baseEnemies * 0.4),
                [ENEMY_TYPES.SPEEDER]: Math.floor(baseEnemies * 0.3),
                [ENEMY_TYPES.TANK]: Math.floor(baseEnemies * 0.3),
            };
        } else {
            const tankPercentage = Math.min(0.3, 0.1 + waveNumber * 0.02);
            const speederPercentage = Math.min(0.3, 0.1 + waveNumber * 0.02);
            const gruntPercentage = 1 - tankPercentage - speederPercentage;

            composition.types = {
                [ENEMY_TYPES.GRUNT]: Math.floor(baseEnemies * gruntPercentage),
                [ENEMY_TYPES.SPEEDER]: Math.floor(baseEnemies * speederPercentage),
                [ENEMY_TYPES.TANK]: Math.floor(baseEnemies * tankPercentage),
            };
        }

        composition.totalEnemies = Object.values(composition.types).reduce(
            (sum, count) => sum + count,
            0
        );

        return composition;
    }

    async spawnWaveEnemies(composition) {
        const queue = this.createSpawnQueue(composition);

        console.log(`[WaveManager] Spawn queue created:`, queue);

        while (queue.length > 0 && this.state.isWaveInProgress) {
            const batch = queue.splice(0, this.config.batchSize);

            for (const type of batch) {
                if (!this.state.isWaveInProgress) break;

                this.enemySystem.spawnEnemy(type);
            }

            await new Promise((resolve) =>
                (this.timers.spawn = setTimeout(resolve, this.config.spawnIntervalMs))
            );
        }
    }

    handleEnemyDeath(data) {
        if (!this.state.isWaveInProgress) return;

        this.state.remainingEnemies--;
        console.log(`[WaveManager] Enemy died. Remaining enemies: ${this.state.remainingEnemies}`);
        
        if (this.state.remainingEnemies <= 0) {
            this.checkWaveCompletion()
        }
    }

    checkWaveCompletion() {
        if (!this.state.isWaveInProgress) return;        
    
        if (this.state.remainingEnemies <= 0 ) {
            
            console.log(`[WaveManager] Wave ${this.state.currentWave} completed.`);
    
            this.state.isWaveInProgress = false;
            const completedWave = this.state.currentWave;
            const nextWave = completedWave + 1;
    
            eventManager.emit(GameEvents.WAVE_COMPLETED, {
                wave: completedWave,
                nextWave: nextWave,
            });
    
            this.startWaveCountdown(nextWave);
        }
    }

    startWaveCountdown(nextWaveNumber) {
        if (this.state.isCountdownActive) {
            console.log(`[WaveManager] Countdown already in progress.`);
            return;
        }
    
        this.state.isCountdownActive = true;
    
        console.log(`[WaveManager] Starting countdown for wave ${nextWaveNumber}.`);
    
        eventManager.emit(GameEvents.WAVE_COUNTDOWN_STARTED, {
            timeMs: this.config.waveCountdownMs,
            nextWave: nextWaveNumber,
        });
    
        this.timers.countdown = setTimeout(() => {
            this.state.isCountdownActive = false;
            if (this.gameStateManager.isPlaying()) {
                console.log(`[WaveManager] Countdown finished. Starting wave ${nextWaveNumber}.`);
                eventManager.emit(GameEvents.WAVE_START_REQUESTED, {
                    wave: nextWaveNumber,
                });
            }
        }, this.config.waveCountdownMs);
    }

    createSpawnQueue(composition) {
        const queue = [];
        Object.entries(composition.types).forEach(([type, count]) => {
            for (let i = 0; i < count; i++) {
                queue.push(type);
            }
        });

        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        return queue;
    }

    cleanup() {
        Object.values(this.timers).forEach((timer) => {
            if (timer) clearTimeout(timer);
        });

        this.state = {
            currentWave: 0,
            isWaveInProgress: false,
            remainingEnemies: 0,
            spawnedEnemies: 0,
            totalEnemies: 0,
            isCountdownActive: false,
            lastSpawnTime: 0,
        };
    }
}