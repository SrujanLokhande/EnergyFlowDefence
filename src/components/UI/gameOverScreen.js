import { Container, Text } from 'pixi.js';
import { BaseScreen } from './baseScreen.js';
import { UIButton } from './elements/uiButton.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class GameOverScreen extends BaseScreen {
    constructor() {
        super();
        this.setupElements();
    }

    setupElements() {
        // Game Over title
        this.title = new Text('GAME OVER', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            fill: 0xFF0000,
            stroke: 0x000000,
            strokeThickness: 6,
            align: 'center'
        });
        this.title.anchor.set(0.5);

        // Stats container
        this.statsContainer = new Container();
        
        // Stats text elements
        this.scoreText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 4
        });

        this.waveText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 4
        });

        // Buttons
        this.restartButton = new UIButton('PLAY AGAIN', {
            width: 200,
            height: 50,
            fontSize: 24,
            backgroundColor: 0x2ecc71,
            backgroundColorHover: 0x27ae60
        });

        this.menuButton = new UIButton('MAIN MENU', {
            width: 200,
            height: 50,
            fontSize: 24,
            backgroundColor: 0x3498db,
            backgroundColorHover: 0x2980b9
        });

        // Setup button events
        this.restartButton.on('pointerup', () => {
            this.hide();
            eventManager.emit(GameEvents.GAME_RESTART_REQUESTED);
        });

        this.menuButton.on('pointerup', () => {
            this.hide();
            eventManager.emit(GameEvents.RETURN_TO_MENU_REQUESTED);
        });

        // Add hover effects
        [this.restartButton, this.menuButton].forEach(button => {
            button.on('pointerover', () => button.scale.set(1.05));
            button.on('pointerout', () => button.scale.set(1.0));
        });

        // Add elements to containers
        this.statsContainer.addChild(this.scoreText, this.waveText);
        this.addChild(this.title, this.statsContainer, this.restartButton, this.menuButton);

        this.onResize(window.innerWidth, window.innerHeight);
    }

    updateStats(stats) {
        this.scoreText.text = `Final Score: ${stats.score}`;
        this.waveText.text = `Waves Survived: ${stats.wave}`;
        this.onResize(window.innerWidth, window.innerHeight);
    }

    onResize(width, height) {
        // Position title
        this.title.position.set(
            width / 2,
            height * 0.2
        );

        // Position stats
        this.scoreText.position.set(0, 0);
        this.waveText.position.set(0, this.scoreText.height + 10);
        
        this.statsContainer.position.set(
            width / 2 - this.statsContainer.width / 2,
            height * 0.4
        );

        // Position buttons
        this.restartButton.position.set(
            width / 2 - this.restartButton.width / 2,
            height * 0.6
        );

        this.menuButton.position.set(
            width / 2 - this.menuButton.width / 2,
            height * 0.7
        );
    }
}