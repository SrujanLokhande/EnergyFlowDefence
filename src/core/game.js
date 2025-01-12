import { Application, Container } from 'pixi.js';
import { GridSystem } from '../systems/gridSystem.js';
import { TowerSystem } from '../systems/towerSystem.js';
import { EnemySystem } from '../systems/enemySystem.js';
import { EnergyCore } from '../components/energyCore.js';
import { Player } from '../components/player.js';
import { GRID_CONFIG, TOWER_CONFIG } from '../config/gameConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameStateManager, GameStates } from '../managers/gameStateManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class Game {
    constructor() {
        this.stateManager = new GameStateManager();
        this.initGame();
    }

    async initGame() {
        // Set initial loading state
        this.stateManager.setState('LOADING');

        // Create a new application
        this.app = new Application();
        await this.app.init({ 
            background: GRID_CONFIG.BACKGROUND_COLOR,
            resizeTo: window,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        // Add canvas to document body
        document.body.appendChild(this.app.canvas);

        // Create main container
        this.gameContainer = new Container();
        this.app.stage.addChild(this.gameContainer);

        // Initialize systems and components
        this.setupSystems();
        this.setupEventListeners();
        
        // Center the view initially
        this.centerView();

        // Setup game loop and interactions
        this.app.ticker.add(this.update.bind(this));
        this.setupInteraction();
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));

        // Move to menu state after initialization
        this.stateManager.setState('MENU');
    }

    setupSystems() {
        this.gridSystem = new GridSystem();
        this.energyCore = new EnergyCore();
        this.player = new Player();
        this.towerSystem = new TowerSystem(this.gridSystem, this.energyCore);
        this.enemySystem = new EnemySystem(this.gridSystem, this.energyCore);

        // Add components to container in correct order
        this.gameContainer.addChild(this.gridSystem.container);
        this.gameContainer.addChild(this.towerSystem.container);
        this.gameContainer.addChild(this.enemySystem.container);
        this.gameContainer.addChild(this.energyCore.container);
        this.gameContainer.addChild(this.player.container);
    }

    setupEventListeners() {
        // Core events
        eventManager.subscribe(GameEvents.CORE_DESTROYED, () => {
            this.stateManager.setState(GameStates.GAME_OVER, {
                reason: 'core_destroyed'
            });
        });

        // Enemy events
        eventManager.subscribe(GameEvents.ENEMY_DIED, (data) => {
            this.handleEnemyDeath(data);
        });

        // Tower events
        eventManager.subscribe(GameEvents.TOWER_PLACED, (data) => {
            this.handleTowerPlaced(data);
        });

        // State change events
        eventManager.subscribe(GameEvents.STATE_CHANGED, (data) => {
            this.handleStateChange(data);
        });
    }

    handleStateChange(data) {
        console.log(`Game state changed from ${data.previousState} to ${data.currentState}`);
        
        // Handle specific state transitions
        switch(data.currentState) {
            case GameStates.PLAYING:
                this.resumeGameSystems();
                break;
            case GameStates.PAUSED:
                this.pauseGameSystems();
                break;
            case GameStates.GAME_OVER:
                this.handleGameOver();
                break;
        }
    }

    handleEnemyDeath(data) {
        this.stateManager.updateScore(data.value);
        this.stateManager.updateResources(data.value);
    }

    handleTowerPlaced(data) {
        this.stateManager.updateResources(-data.cost);
    }

    startGame() {
        this.stateManager.setState(GameStates.PLAYING);
    }

    pauseGame() {
        if (this.stateManager.isPlaying()) {
            this.stateManager.setState(GameStates.PAUSED);
        }
    }

    resumeGame() {
        if (this.stateManager.isPaused()) {
            this.stateManager.setState(GameStates.PLAYING);
        }
    }

    pauseGameSystems() {
        // Pause any animations, timers, or systems that need to stop
        this.app.ticker.stop();
    }

    resumeGameSystems() {
        // Resume any animations, timers, or systems
        this.app.ticker.start();
    }

    handleGameOver() {
        // Clean up or reset systems as needed
        this.enemySystem.clearAllEnemies();
        // Could add game over screen or other cleanup here
    }

    update(deltaTime) {
        if (!this.stateManager.isPlaying()) return;

        const time = this.app.ticker.lastTime / 1000;
        
        // Update all systems
        this.energyCore.update(deltaTime, time);
        this.player.update();
        this.enemySystem.update();
        this.towerSystem.update(time, this.enemySystem.getEnemies());
        this.updateCamera();

        // Check for wave completion
        if (this.checkWaveComplete()) {
            this.stateManager.setState(GameStates.WAVE_COMPLETE);
        }
    }

    checkWaveComplete() {
        // Add wave completion logic here
        return false;
    }

    updateCamera() {
        if (!this.player) return;
        
        const playerPos = this.player.getPosition();
        const bounds = this.gridSystem.getBounds();
        
        const targetX = (window.innerWidth / 2) - playerPos.x;
        const targetY = (window.innerHeight / 2) - playerPos.y;

        const minX = window.innerWidth - bounds.width;
        const maxX = 0;
        const minY = window.innerHeight - bounds.height;
        const maxY = 0;

        this.gameContainer.position.x = Math.max(minX, Math.min(maxX, targetX));
        this.gameContainer.position.y = Math.max(minY, Math.min(maxY, targetY));
    }

     setupInteraction() {
        this.app.stage.eventMode = 'static';
        let hoveredTower = null;
        
        // Debug keys for game controls
        window.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case ' ': // Space key
                    if (this.stateManager.getCurrentState() === 'MENU') {
                        console.log('Starting game from menu');
                        this.stateManager.setState('PLAYING');
                    }
                    break;

                case 'e':
                    if (this.stateManager.isPlaying()) {
                        console.log('Spawning enemy');
                        this.enemySystem.debugSpawnEnemy();
                    }
                    break;

                case 'p':
                    if (this.stateManager.isPaused()) {
                        this.resumeGame();
                    } else if (this.stateManager.isPlaying()) {
                        this.pauseGame();
                    }
                    break;
            }
        });

        // Handle mouse move for tower range preview
        this.app.stage.on('pointermove', (event) => {
            if (!this.stateManager.isPlaying()) return;

            const worldPos = {
                x: event.global.x - this.gameContainer.position.x,
                y: event.global.y - this.gameContainer.position.y
            };
            const gridPos = this.gridSystem.pixelToGrid(worldPos.x, worldPos.y);
            
            if (!gridPos) {
                this.towerSystem.hidePlacementPreview();
                return;
            }

            if (hoveredTower) {
                hoveredTower.showRange(false);
                hoveredTower = null;
            }

            const towerKey = `${gridPos.x},${gridPos.y}`;
            const tower = this.towerSystem.towers.get(towerKey);
            if (tower) {
                tower.showRange(true);
                hoveredTower = tower;
            }

            const stateData = this.stateManager.getStateData();
            const canPlace = this.towerSystem.canPlaceTower(gridPos.x, gridPos.y);
            this.towerSystem.showPlacementPreview(
                gridPos.x,
                gridPos.y,
                canPlace && stateData.resources >= TOWER_CONFIG.COST
            );
        });

        // Handle click for tower placement
        this.app.stage.on('pointertap', (event) => {
            if (!this.stateManager.isPlaying()) return;

            const worldPos = {
                x: event.global.x - this.gameContainer.position.x,
                y: event.global.y - this.gameContainer.position.y
            };
            const gridPos = this.gridSystem.pixelToGrid(worldPos.x, worldPos.y);
            
            const stateData = this.stateManager.getStateData();
            if (stateData.resources >= TOWER_CONFIG.COST) {
                this.towerSystem.placeTower(gridPos.x, gridPos.y);
            } else {
                eventManager.emit(GameEvents.TOWER_PLACEMENT_FAILED, {
                    reason: 'insufficient_resources',
                    required: TOWER_CONFIG.COST,
                    current: stateData.resources
                });
            }
        });

        // Handle pointer leaving the stage
        this.app.stage.on('pointerleave', () => {
            if (hoveredTower) {
                hoveredTower.showRange(false);
                hoveredTower = null;
            }
            this.towerSystem.hidePlacementPreview();
        });
    }

    centerView() {
        const bounds = this.gridSystem.getBounds();
        const x = (window.innerWidth - bounds.width) / 2;
        const y = (window.innerHeight - bounds.height) / 2;
        this.gameContainer.position.set(x, y);
    }

    handleResize() {
        this.centerView();
    }

    cleanup() {
        this.towerSystem.destroy();
        this.enemySystem.clearAllEnemies();
        this.gameContainer.destroy();
        this.app.destroy();
    }
}