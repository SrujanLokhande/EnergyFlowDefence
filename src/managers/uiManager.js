import { Container } from 'pixi.js';
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
        
        this.container = new Container();
        this.hudLayer = new Container();
        this.notificationLayer = new Container();
        this.modalLayer = new Container();
        this.screenLayer = new Container();

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
        this.gameHUD = new GameHUD(this.stateManager);
        this.hudLayer.addChild(this.gameHUD.container);

        this.mainMenu = new MainMenuScreen();
        this.gameOver = new GameOverScreen();
        this.preparationScreen = new PreparationScreen();
        
        this.screenLayer.addChild(this.mainMenu);
        this.screenLayer.addChild(this.gameOver);
        this.screenLayer.addChild(this.preparationScreen);

        this.hideAllScreens();
    }

    setupEventListeners() {
        eventManager.subscribe(GameEvents.STATE_CHANGED, (data) => {
            this.handleStateChange(data.currentState);
        });

        eventManager.subscribe(GameEvents.RESOURCES_CHANGED, (data) => {
            this.gameHUD.updateResources(data.resources);
        });

        eventManager.subscribe(GameEvents.WAVE_STARTED, (data) => {
            this.gameHUD.updateWaveInfo(data.wave);
        });

        eventManager.subscribe(GameEvents.WAVE_COMPLETED, (data) => {
            this.gameHUD.showWaveComplete(data.wave);
        });

        eventManager.subscribe(GameEvents.SCORE_UPDATED, (data) => {
            this.gameHUD.updateScore(data.score);
        });

        eventManager.subscribe(GameEvents.MENU_ENTERED, () => {
            this.showMainMenu();
        });

        // Add event listener for preparation phase
        eventManager.subscribe(GameEvents.GAME_PREPARATION_STARTED, () => {
            this.hideAllScreens();
            this.preparationScreen.show();
        });
    }

    handleStateChange(newState) {
        this.hideAllScreens();
        
        switch(newState) {
            case GameStates.MENU:
                this.mainMenu.show();
                break;
            case GameStates.PREPARING:
                this.preparationScreen.show();
                this.gameHUD.show(); // Show HUD during preparation
                break;
            case GameStates.PLAYING:
                this.gameHUD.show();
                break;
            case GameStates.PAUSED:
                this.showPauseMenu();
                break;
            case GameStates.GAME_OVER:
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
        // Implement pause menu if needed
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
        window.removeEventListener('resize', this.handleResize);

        // Destroy all screens
        this.mainMenu?.destroy();
        this.gameOver?.destroy();
        this.gameHUD?.destroy();
        this.preparationScreen?.destroy();
        
        // Destroy all containers
        this.container.destroy({ children: true });
    }
}