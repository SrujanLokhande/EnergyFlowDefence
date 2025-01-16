import { Container, Text } from 'pixi.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';
import { GameHUD } from '../components/UI/HUD/gameHUD.js';
import { GameStates } from '../managers/gameStateManager.js';
import { MainMenuScreen } from '../components/UI/mainMenuScreen.js';
import { GameOverScreen } from '../components/UI/gameOverScreen.js';
import { PreparationScreen } from '../components/UI/preparationScreen.js';

export class UIManager {
    constructor(app, stateManager) {
        this.app = app;
        this.stateManager = stateManager;
        
        // Create main UI containers with different layers
        this.container = new Container();
        this.hudLayer = new Container();
        this.notificationLayer = new Container();
        this.modalLayer = new Container();
        this.screenLayer = new Container();

        // Add layers in order
        this.container.addChild(this.hudLayer);
        this.container.addChild(this.notificationLayer);
        this.container.addChild(this.modalLayer);
        this.container.addChild(this.screenLayer);

        this.setupScreens();
        this.setupEventListeners();
        this.resize();

        this.handleResize = this.resize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    setupScreens() {
        // Initialize game HUD (keeping existing implementation)
        this.gameHUD = new GameHUD(this.stateManager);
        this.hudLayer.addChild(this.gameHUD.container);

        // Initialize new screen components
        this.mainMenu = new MainMenuScreen();
        this.gameOver = new GameOverScreen();
        this.preparationScreen = new PreparationScreen();
        
        // Add screens to the screen layer
        this.screenLayer.addChild(this.mainMenu);
        this.screenLayer.addChild(this.gameOver);
        this.screenLayer.addChild(this.preparationScreen);

        // Hide all screens initially
        this.hideAllScreens();
    }

    setupEventListeners() {
        // Game state events
        eventManager.subscribe(GameEvents.STATE_CHANGED, (data) => {
            this.handleStateChange(data.currentState);
        });

        // Resource events
        eventManager.subscribe(GameEvents.RESOURCES_CHANGED, (data) => {
            this.gameHUD.updateResources(data.resources);
        });

        // Wave events
        eventManager.subscribe(GameEvents.WAVE_STARTED, (data) => {
            this.gameHUD.updateWaveInfo(data.wave);
        });

        eventManager.subscribe(GameEvents.WAVE_COMPLETED, (data) => {
            this.gameHUD.showWaveComplete(data.wave);
        });

        // Score events
        eventManager.subscribe(GameEvents.SCORE_UPDATED, (data) => {
            this.gameHUD.updateScore(data.score);
        });

        // Menu navigation events
        eventManager.subscribe(GameEvents.MENU_ENTERED, () => {
            this.showMainMenu();
        });
    }

    handleStateChange(newState) {
        switch(newState) {
            case GameStates.MENU:
                this.mainMenu.show();
                break;
            case GameStates.PLAYING:
                this.gameHUD.show();
                break;
            case GameStates.PAUSED:
                this.showPauseMenu();
                break;
            case GameStates.GAME_OVER:
            // Get the current state data before hiding screens
            const stats = this.stateManager.getStateData();       
            this.gameOver.updateStats(stats);
            this.gameOver.show();
                break;
            default:
                break;
        }
    }

    hideAllScreens() {
        this.mainMenu.hide();
        this.gameOver.hide();
        this.gameHUD.hide();
        this.preparationScreen.hide();
    }

    showMainMenu() {
        this.hideAllScreens();
        this.mainMenu.show();
    }

    showPauseMenu() {
        console.log('Showing pause menu');
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Resize all screens
        this.mainMenu?.resize(width, height);
        this.gameOver?.resize(width, height);
        this.gameHUD?.resize(width, height);
        this.preparationScreen?.resize(width, height);
    }

    destroy() {
        // Clean up event listeners
        window.removeEventListener('resize', this.resize);

        // Destroy all screens
        this.mainMenu?.destroy();
        this.gameOver?.destroy();
        this.gameHUD?.destroy();
        this.preparationScreen?.destroy();
        
        // Destroy all containers
        this.container.destroy({ children: true });
    }
}

