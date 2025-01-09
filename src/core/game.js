import { Application, Container } from 'pixi.js';
import { GridSystem } from '../systems/gridSystem.js';
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

        // Add components to container in correct order
        this.gameContainer.addChild(this.gridSystem.container);
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

        // Update camera to follow player
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
        
        // Keep click handling for future tower placement
        this.app.stage.on('pointertap', (event) => {
            const worldPos = {
                x: event.global.x - this.gameContainer.position.x,
                y: event.global.y - this.gameContainer.position.y
            };
            const gridPos = this.gridSystem.pixelToGrid(worldPos.x, worldPos.y);
            console.log(`Grid coordinates: ${gridPos.x}, ${gridPos.y}`);
        });
    }
}