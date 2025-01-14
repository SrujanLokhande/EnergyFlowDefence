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

        this.setupEventListeners();
    }

    setupEventListeners() {
        eventManager.subscribe(GameEvents.ENEMY_DIED, (data) => {
            this.handleEnemyDeath(data);
        });

        eventManager.subscribe(GameEvents.WAVE_START_REQUESTED, (data) => {
            if (this.canStartWave()) {
                this.startWave(data.wave);
            }
        });

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

    checkWaveCompletion() {
        if (!this.state.isWaveInProgress) return;

        if (
            this.state.remainingEnemies <= 0 &&
            this.state.spawnedEnemies >= this.state.totalEnemies
        ) {
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

        console.log(`[WaveManager] Wave composition:`, composition);

        eventManager.emit(GameEvents.WAVE_STARTED, {
            wave: waveNumber,
            composition: composition,
        });

        await this.spawnWaveEnemies(composition);
    }

    handleEnemyDeath(data) {
        if (!this.state.isWaveInProgress) return;

        this.state.remainingEnemies--;
        console.log(`[WaveManager] Enemy died. Remaining enemies: ${this.state.remainingEnemies}`);

        if (this.state.remainingEnemies <= 0) {
            setTimeout(() => this.checkWaveCompletion(), 250);
        }
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
}