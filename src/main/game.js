import { Application, Container } from 'pixi.js';
import { GridSystem } from '../systems/gridSystem.js';
import { TowerSystem } from '../systems/towerSystem.js';
import { EnemySystem } from '../systems/enemySystem.js';
import { EnergyCore } from '../components/core/energyCore.js';
import { Player } from '../components/player.js';
import { TowerUI } from '../components/towerUI.js';
import { WaveManager } from '../managers/waveManager.js'; 
import { GRID_CONFIG } from '../config/gameConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { UIManager } from '../managers/uiManager.js';
import { GameStateManager, GameStates } from '../managers/gameStateManager.js';
import { GameEvents } from '../config/eventTypes.js';
import { TowerTypes } from '../config/towerConfig.js';
import { DEBUG_CONFIG } from '../config/debugConfig.js';
import { ENEMY_TYPES } from '../config/enemyConfig.js';



export class Game {
    constructor() {
        this.stateManager = new GameStateManager();         
        this.debug = DEBUG_CONFIG;         
        this.initGame();        
        this.setupEventListeners();
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

    setupUI() {
        this.uiManager = new UIManager(this.stateManager);
    }

    setupSystems() {
        this.gridSystem = new GridSystem();
        this.energyCore = new EnergyCore();
        this.player = new Player();
        this.towerSystem = new TowerSystem(this.gridSystem, this.energyCore);
        this.enemySystem = new EnemySystem(this.gridSystem, this.energyCore);
        this.uiManager = new UIManager(this.app, this.stateManager);
        this.towerUI = new TowerUI(this.towerSystem);     


        // Initialize WaveManager with configuration
        this.waveManager = new WaveManager(
            this.enemySystem,
            this.stateManager,
            {
                baseEnemiesPerWave: 5,
                enemiesPerWaveGrowth: 2,
                spawnIntervalMs: 1500,
                batchSize: 2,
                waveCountdownMs: 5000,
                bossWaveInterval: 5,
                difficultyScaling: 1.2  // New parameter for progressive difficulty
            }
        );

        // Add components to container in correct order
        this.gameContainer.addChild(this.gridSystem.container);
        this.gameContainer.addChild(this.towerSystem.container);
        this.gameContainer.addChild(this.enemySystem.container);
        this.gameContainer.addChild(this.energyCore.container);
        this.gameContainer.addChild(this.player.container);
        this.app.stage.addChild(this.uiManager.container);
        this.uiManager.hudLayer.addChild(this.towerUI.container);
        
    }

    setupEventListeners() {       

        if (!this.towerPlacedCallback) {
            this.towerPlacedCallback = (data) => {
                console.log(`[Game] Tower placed event handled.`);                
            };
            eventManager.subscribe(GameEvents.TOWER_PLACED, this.towerPlacedCallback);
        }

        // Core events
        eventManager.subscribe(GameEvents.CORE_DESTROYED, () => {            
            this.stateManager.setState(GameStates.GAME_OVER, {
                reason: 'core_destroyed'
            });
        });

        eventManager.subscribe(GameEvents.GAME_RESTART_REQUESTED, () => {
            console.log('Game restart requested');
            this.resetGame();
        });

        eventManager.subscribe(GameEvents.RETURN_TO_MENU_REQUESTED, () => {
            console.log('Return to menu requested');
            this.returnToMainMenu();
        });
    
        // Enemy events
        eventManager.subscribe(GameEvents.ENEMY_DIED, (data) => {
            this.handleEnemyDeath(data);
        });
    
        // Game state events
        eventManager.subscribe(GameEvents.STATE_CHANGED, (data) => {
            if (data.currentState === GameStates.PLAYING) {
                if (this.stateManager.getStateData().wave === 1) {
                    console.log('Starting first wave');
                    eventManager.emit(GameEvents.WAVE_START_REQUESTED, { wave: 1 });
                }
            }
            this.handleStateChange(data);
        });
    
        // Wave events
        eventManager.subscribe(GameEvents.WAVE_STARTED, (data) => {
            console.log(`Wave ${data.wave} started!`, data.composition);
            
            // Update state data
            const stateData = this.stateManager.getStateData();
            stateData.currentWave = data.wave;
            
            // Ensure we're in PLAYING state when wave starts
            if (this.stateManager.getCurrentState() !== GameStates.PLAYING) {
                this.stateManager.setState(GameStates.PLAYING);
            }
        });
    
        eventManager.subscribe(GameEvents.WAVE_COMPLETED, (data) => {
            console.log(`Wave ${data.wave} completed! Next wave: ${data.nextWave}`);
        
            // Automatically transition to the next wave
            if (this.stateManager.getCurrentState() === GameStates.WAVE_COMPLETE) {
                eventManager.emit(GameEvents.WAVE_START_REQUESTED, { wave: data.nextWave });
            }
        });   

        // New preparation events
        eventManager.subscribe(GameEvents.GAME_PREPARATION_STARTED, () => {
            this.stateManager.setState(GameStates.PREPARING);
        });

        eventManager.subscribe(GameEvents.GAME_START_REQUESTED, () => {
            this.startGame();
        });

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
                // Additional wave complete logic if needed
                break;           
            
        }
    }
    handleEnemyDeath(data) {
        this.stateManager.updateScore(data.value);
        this.stateManager.updateResources(data.value);        
    }

    startGame() {
        console.log('Starting game...');
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


    update(deltaTime) {
        if (!this.stateManager.isPlaying()) return;
    
        const time = this.app.ticker.lastTime / 1000;
        
        // Only log debug info every LOG_FREQUENCY frames
        if (this.debug.ENEMY_DEBUG || this.debug.TOWER_DEBUG) {
            this.debug.FRAME_COUNT = (this.debug.FRAME_COUNT + 1) % this.debug.LOG_FREQUENCY;
            
            if (this.debug.FRAME_COUNT === 0) {  // Only log on frame 0
                if (this.debug.ENEMY_DEBUG) {
                    console.log(`Enemies: ${this.enemySystem.getEnemies().length}, Wave: ${this.stateManager.getStateData().currentWave || 'None'}`);
                }
            }
        }
    
        this.energyCore.update(deltaTime, time);
        this.player.update();
        this.enemySystem.update();
        this.towerSystem.update(time, this.enemySystem.getEnemies());
        this.updateCamera();
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
        let selectedTowerType = TowerTypes.BASIC;

         // Add debug test commands
    if (this.debug.ENEMY_DEBUG || this.debug.TOWER_DEBUG) {
        window.addEventListener('keydown', (e) => {
            if (!this.stateManager.isPlaying()) return;

            switch(e.key.toLowerCase()) {
                case 't':  // Test spawn all enemy types
                    console.log('Testing enemy spawns...');
                    Object.values(ENEMY_TYPES).forEach(type => {
                        this.enemySystem.debugSpawnEnemy(type);
                    });
                    break;
                    
                case 'l':  // Test wave manager
                    console.log('Starting test wave...');
                    eventManager.emit(GameEvents.WAVE_START_REQUESTED, { wave: 1 });
                    break;
                    
                case 'k':  // Kill all enemies (for testing wave completion)
                    console.log('Killing all enemies...');
                    this.enemySystem.getEnemies().forEach(enemy => {
                        enemy.takeDamage(9999);
                    });
                    break;
                    
                case 'r':  // Reset game state
                    console.log('Resetting game state...');
                    this.stateManager.setState(GameStates.MENU);
                    this.enemySystem.clearAllEnemies();
                    this.towerSystem.clearAllTowers();
                    break;

                case 'p':  // Damage Energy Core
                console.log('Killing the energy core');
                this.energyCore.takeDamage(9999);                
                break;
            }
        });
    }

        // Global key listener - outside of any state check
        window.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.key);
            console.log('Current game state:', this.stateManager.getCurrentState());

            // Handle space bar for state changes
            if (e.key === ' ') {                
                const currentState = this.stateManager.getCurrentState();              
                
                if (currentState === 'MENU') {
                    console.log('Attempting to start game from menu');
                    this.stateManager.setState('PLAYING');
                }
            }

            // Only process other game controls if in PLAYING state
            if (this.stateManager.isPlaying()) {
                switch(e.key.toLowerCase()) {
                    case 'e':
                        console.log('Spawning enemy');
                        this.enemySystem.debugSpawnEnemy();
                        break;
                    case 'p':
                        if (this.stateManager.isPaused()) {
                            this.resumeGame();
                        } else {
                            this.pauseGame();
                        }
                        break;
                    case '1':
                        selectedTowerType = TowerTypes.BASIC;
                        console.log('Selected Basic Tower');
                        break;
                    case '2':
                        selectedTowerType = TowerTypes.RAPID;
                        console.log('Selected Rapid Tower');
                        break;
                    case '3':
                        selectedTowerType = TowerTypes.SNIPER;
                        console.log('Selected Sniper Tower');
                        break;
                    case '4':
                        selectedTowerType = TowerTypes.AOE;
                        console.log('Selected AOE Tower');
                        break;
                    case 'u':
                        if (hoveredTower) {
                            eventManager.emit(GameEvents.TOWER_UPGRADE_REQUESTED, {
                                tower: hoveredTower,
                                gridX: hoveredTower.gridPosition.x,
                                gridY: hoveredTower.gridPosition.y
                            });
                        }
                        break;
                }
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

            const tower = this.towerSystem.getTowerAt(gridPos.x, gridPos.y);
            if (tower) {
                tower.showRange(true);
                hoveredTower = tower;
            }

            const stateData = this.stateManager.getStateData();
            const canPlace = this.towerSystem.canPlaceTower(gridPos.x, gridPos.y);
            const towerCost = this.towerSystem.getTowerCost(selectedTowerType);
            
            this.towerSystem.showPlacementPreview(
                gridPos.x,
                gridPos.y,
                canPlace && stateData.resources >= towerCost
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
        
        // Get the currently selected tower type from TowerUI
        const selectedTowerType = this.towerUI.selectedType;
        const towerCost = this.towerSystem.getTowerCost(selectedTowerType);       

        if (stateData.resources >= towerCost) {
            eventManager.emit(GameEvents.TOWER_CREATION_REQUESTED, {
                type: selectedTowerType,
                gridX: gridPos.x,
                gridY: gridPos.y
            });
        } else {
            eventManager.emit(GameEvents.TOWER_PLACEMENT_FAILED, {
                reason: 'insufficient_resources',
                required: towerCost,
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

    resetGame() {
        console.log('Resetting game state...');
        
        // Clear existing game components
        this.clearGameState();
        
        // Let state manager reset the core state data
        this.stateManager.setState('GAME_OVER');  // This triggers handleGameOverExit
        
        // Then transition to preparing state
        this.stateManager.setState('PREPARING');
        
        // Reset game components
        this.setupSystems();
    }

    clearGameState() {
        console.log('Clearing game state...');
        
        // Clear all enemies
        this.enemySystem.clearAllEnemies();
        
        // Clear all towers
        this.towerSystem.destroy();
        
        // Remove all containers
        this.gameContainer.removeChildren();
        
        // Recreate the energy core
        this.energyCore = new EnergyCore();
    }

    returnToMainMenu() {
        console.log('Returning to main menu...');
        
        // Clear game components
        this.clearGameState();
        
        // Let state manager reset the core state data
        this.stateManager.setState('GAME_OVER');  // This triggers handleGameOverExit
        
        // Then transition to menu state
        this.stateManager.setState('MENU');
        
        // Reset game components
        this.setupSystems();
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