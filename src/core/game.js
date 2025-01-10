import { Application, Container } from 'pixi.js';
import { GridSystem } from '../systems/gridSystem.js';
import { TowerSystem } from '../systems/towerSystem.js';
import { EnemySystem } from '../systems/enemySystem.js';
import { EnergyCore } from '../components/energyCore.js';
import { Player } from '../components/player.js';
import { GRID_CONFIG } from '../config/gameConfig.js';

export class Game {
    constructor() {
        this.initGame();
    }

    async initGame() {
        // Create a new application
        this.app = new Application();

        // Initialize the application
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

        // Center the view initially
        this.centerView();

        // Setup game loop
        this.app.ticker.add(this.update.bind(this));

        // Setup interaction
        this.setupInteraction();
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    centerView() {
        const bounds = this.gridSystem.getBounds();
        
        // Calculate position to center the grid
        const x = (window.innerWidth - bounds.width) / 2;
        const y = (window.innerHeight - bounds.height) / 2;
        
        this.gameContainer.position.set(x, y);
    }

    handleResize() {
        this.centerView();
    }

    update(deltaTime) {
        const time = this.app.ticker.lastTime / 1000;
        this.energyCore.update(deltaTime, time);
        this.player.update();
        this.enemySystem.update();
        this.towerSystem.update(time, this.enemySystem.getEnemies());
        this.updateCamera();
    }

    updateCamera() {
        const playerPos = this.player.getPosition();
        const bounds = this.gridSystem.getBounds();
        
        // Calculate the target camera position (centered on player)
        const targetX = (window.innerWidth / 2) - playerPos.x;
        const targetY = (window.innerHeight / 2) - playerPos.y;

        // Add bounds to camera movement
        const minX = window.innerWidth - bounds.width;
        const maxX = 0;
        const minY = window.innerHeight - bounds.height;
        const maxY = 0;

        // Update container position with bounds
        this.gameContainer.position.x = Math.max(minX, Math.min(maxX, targetX));
        this.gameContainer.position.y = Math.max(minY, Math.min(maxY, targetY));
    }

    setupInteraction() {
        this.app.stage.eventMode = 'static';
        
        // Add debug key for spawning enemies
        window.addEventListener('keydown', (e) => {
            if (e.key === 'e') {
                this.enemySystem.debugSpawnEnemy();
            }
        });
        let hoveredTower = null;
        
        // Handle mouse move for tower range preview
        this.app.stage.on('pointermove', (event) => {
            const worldPos = {
                x: event.global.x - this.gameContainer.position.x,
                y: event.global.y - this.gameContainer.position.y
            };
            const gridPos = this.gridSystem.pixelToGrid(worldPos.x, worldPos.y);
            
            // Hide previous tower range if exists
            if (hoveredTower) {
                hoveredTower.showRange(false);
                hoveredTower = null;
            }

            // Check if we're hovering over a tower
            const towerKey = `${gridPos.x},${gridPos.y}`;
            const tower = this.towerSystem.towers.get(towerKey);
            if (tower) {
                tower.showRange(true);
                hoveredTower = tower;
            }

            // Show placement preview if valid position
            this.towerSystem.showPlacementPreview(
                gridPos.x,
                gridPos.y,
                this.towerSystem.canPlaceTower(gridPos.x, gridPos.y)
            );
        });

        // Handle click for tower placement
        this.app.stage.on('pointertap', (event) => {
            const worldPos = {
                x: event.global.x - this.gameContainer.position.x,
                y: event.global.y - this.gameContainer.position.y
            };
            const gridPos = this.gridSystem.pixelToGrid(worldPos.x, worldPos.y);
            
            // Attempt to place tower
            const tower = this.towerSystem.placeTower(gridPos.x, gridPos.y);
            if (tower) {
                console.log(`Tower placed at grid position: ${gridPos.x}, ${gridPos.y}`);
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
}