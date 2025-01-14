import { Container, Text } from 'pixi.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';
import { GameStates } from '../managers/gameStateManager.js';

export class UIManager {
    constructor(app, stateManager) {
        this.app = app;
        this.stateManager = stateManager;
        
        // Create main UI containers with different layers
        this.container = new Container();
        this.hudLayer = new Container();
        this.notificationLayer = new Container();
        this.modalLayer = new Container();

        // Add layers in order
        this.container.addChild(this.hudLayer);
        this.container.addChild(this.notificationLayer);
        this.container.addChild(this.modalLayer);

        // Initialize UI components
        this.gameHUD = new GameHUD(this.stateManager);
        this.hudLayer.addChild(this.gameHUD.container);

        this.setupEventListeners();
        this.resize();
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
    }

    handleStateChange(newState) {
        switch(newState) {
            case GameStates.PLAYING:
                this.gameHUD.show();
                break;
            case GameStates.PAUSED:
                this.showPauseMenu();
                break;
            case GameStates.GAME_OVER:
                this.showGameOver();
                break;
            default:
                break;
        }
    }

    resize() {
        if (this.gameHUD) {
            this.gameHUD.resize(window.innerWidth, window.innerHeight);
        }
    }

    showPauseMenu() {
        // Implement pause menu
    }

    showGameOver() {
        // Implement game over screen
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}

class GameHUD {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.container = new Container();

        this.setupHUDElements();
    }

    setupHUDElements() {
        // Resources display
        this.resourcesText = new Text('Resources: 500', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'left'
        });
        this.resourcesText.position.set(20, 20);

        // Wave counter
        this.waveText = new Text('Wave: 1', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'center'
        });
        this.waveText.position.set(20, 50);

        // Score display
        this.scoreText = new Text('Score: 0', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'right'
        });
        this.scoreText.position.set(20, 80);

        // Add all elements to container
        this.container.addChild(this.resourcesText);
        this.container.addChild(this.waveText);
        this.container.addChild(this.scoreText);
    }

    updateResources(amount) {
        this.resourcesText.text = `Resources: ${amount}`;
    }

    updateWaveInfo(wave) {
        this.waveText.text = `Wave: ${wave}`;
    }

    updateScore(score) {
        this.scoreText.text = `Score: ${score}`;
    }

    showWaveComplete(wave) {
        const completionText = new Text(`Wave ${wave} Complete!`, {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xffdd00,
            stroke: 0x000000,
            strokeThickness: 6,
            align: 'center'
        });
        
        completionText.position.set(
            window.innerWidth / 2 - completionText.width / 2,
            window.innerHeight / 2 - completionText.height / 2
        );
        
        this.container.addChild(completionText);
        
        // Remove after animation
        setTimeout(() => {
            completionText.destroy();
        }, 2000);
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }

    resize(width, height) {
        // Update positions based on new screen size
        this.scoreText.position.set(width - this.scoreText.width - 20, 20);
        this.waveText.position.set(width / 2 - this.waveText.width / 2, 20);
    }
}