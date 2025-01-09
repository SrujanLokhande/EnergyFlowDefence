import { Application, Container } from 'pixi.js';
import { GridSystem } from '../systems/gridSystem.js';
import { EnergyCore } from '../components/energyCore.js';
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

        // Initialize systems
        this.gridSystem = new GridSystem();
        this.gameContainer.addChild(this.gridSystem.container);

        // Initialize components
        this.energyCore = new EnergyCore();
        this.gameContainer.addChild(this.energyCore.container);

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
    }

    setupInteraction() {
        this.app.stage.eventMode = 'static';
        
        let isDragging = false;
        let lastPosition = null;

        this.app.stage.on('pointerdown', (event) => {
            isDragging = true;
            lastPosition = event.global.clone();
        });

        this.app.stage.on('pointermove', (event) => {
            if (isDragging && lastPosition) {
                const newPosition = event.global;
                const dx = newPosition.x - lastPosition.x;
                const dy = newPosition.y - lastPosition.y;

                // Calculate new position
                const newX = this.gameContainer.position.x + dx;
                const newY = this.gameContainer.position.y + dy;

                // Get grid bounds
                const bounds = this.gridSystem.getBounds();
                
                // Limit panning to keep grid visible
                const minX = -(bounds.width - window.innerWidth + 100);
                const maxX = 100;
                const minY = -(bounds.height - window.innerHeight + 100);
                const maxY = 100;

                // Apply bounded position
                this.gameContainer.position.x = Math.min(maxX, Math.max(minX, newX));
                this.gameContainer.position.y = Math.min(maxY, Math.max(minY, newY));

                lastPosition = newPosition.clone();
            }
        });

        this.app.stage.on('pointerup', () => {
            isDragging = false;
            lastPosition = null;
        });

        this.app.stage.on('pointertap', (event) => {
            if (!isDragging) {
                const worldPos = {
                    x: event.global.x - this.gameContainer.position.x,
                    y: event.global.y - this.gameContainer.position.y
                };
                const gridPos = this.gridSystem.pixelToGrid(worldPos.x, worldPos.y);
                console.log(`Grid coordinates: ${gridPos.x}, ${gridPos.y}`);
            }
        });
    }
}