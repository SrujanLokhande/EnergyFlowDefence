import { Container, Text } from 'pixi.js';
import { BaseScreen } from './baseScreen.js';
import { UIButton } from '../UI/elements/uiButton.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class GameOverScreen extends BaseScreen {
    constructor() {
        super();
        this.setupElements();
        this.setupEventListeners();
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
            backgroundColor: 0x2ecc71,  // Green color
            backgroundColorHover: 0x27ae60  // Darker green
        });

        this.menuButton = new UIButton('MAIN MENU', {
            width: 200,
            height: 50,
            fontSize: 24,
            backgroundColor: 0x3498db,  // Blue color
            backgroundColorHover: 0x2980b9  // Darker blue
        });

        // Add elements to containers
        this.statsContainer.addChild(this.scoreText);
        this.statsContainer.addChild(this.waveText);

        this.addChild(this.title);
        this.addChild(this.statsContainer);
        this.addChild(this.restartButton);
        this.addChild(this.menuButton);

        this.resize();
    }

    setupEventListeners() {
        // Make sure buttons are interactive
        this.restartButton.eventMode = 'static';
        this.menuButton.eventMode = 'static';

        this.restartButton.on('pointerup', () => {
            console.log('Restart button clicked');
            this.hide();
            eventManager.emit(GameEvents.GAME_RESTART_REQUESTED);
        });

        this.menuButton.on('pointerup', () => {
            console.log('Menu button clicked');
            this.hide();
            eventManager.emit(GameEvents.RETURN_TO_MENU_REQUESTED);
        });

        // Add hover effects
        this.restartButton.on('pointerover', () => {
            this.restartButton.scale.set(1.05);
        });
        this.restartButton.on('pointerout', () => {
            this.restartButton.scale.set(1.0);
        });

        this.menuButton.on('pointerover', () => {
            this.menuButton.scale.set(1.05);
        });
        this.menuButton.on('pointerout', () => {
            this.menuButton.scale.set(1.0);
        });
    }

    updateStats(stats) {
        this.scoreText.text = `Final Score: ${stats.score}`;
        this.waveText.text = `Waves Survived: ${stats.wave}`;
        this.resize();
    }

    resize() {
        super.resize();

        if (this.title && this.statsContainer && this.restartButton && this.menuButton) {
            // Position title
            this.title.position.set(
                window.innerWidth / 2,
                window.innerHeight * 0.2
            );

            // Position stats
            this.scoreText.position.set(0, 0);
            this.waveText.position.set(0, this.scoreText.height + 10);
            
            this.statsContainer.position.set(
                window.innerWidth / 2 - this.statsContainer.width / 2,
                window.innerHeight * 0.4
            );

            // Position buttons
            this.restartButton.position.set(
                window.innerWidth / 2 - this.restartButton.width / 2,
                window.innerHeight * 0.6
            );

            this.menuButton.position.set(
                window.innerWidth / 2 - this.menuButton.width / 2,
                window.innerHeight * 0.7
            );
        }
    }

    show() {
        super.show();
        this.resize();
    }
}