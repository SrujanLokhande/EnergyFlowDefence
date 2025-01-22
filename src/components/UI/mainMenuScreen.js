import { Text } from 'pixi.js';
import { BaseScreen } from './baseScreen.js';
import { UIButton } from './elements/uiButton.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class MainMenuScreen extends BaseScreen {
    constructor() {
        super();
        this.setupElements();
    }

    setupElements() {
        // Create title
        this.title = new Text('TOWER DEFENSE', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 6,
            align: 'center'
        });
        this.title.anchor.set(0.5);

        // Create buttons
        this.startButton = new UIButton('START GAME', {
            width: 200,
            height: 50,
            fontSize: 24,
            backgroundColor: 0x2ecc71,
            backgroundColorHover: 0x27ae60
        });

        this.howToPlayButton = new UIButton('HOW TO PLAY', {
            width: 200,
            height: 50,
            fontSize: 24,
            backgroundColor: 0x3498db,
            backgroundColorHover: 0x2980b9
        });

        // Setup button events
        this.startButton.on('pointerup', () => {
            console.log('Start button clicked - initiating preparation phase');
            eventManager.emit(GameEvents.GAME_PREPARATION_STARTED);
            this.hide();
        });

        this.howToPlayButton.on('pointerup', () => {
            eventManager.emit(GameEvents.TUTORIAL_REQUESTED);
        });

        // Add elements to container
        this.addChild(this.title);
        this.addChild(this.startButton);
        this.addChild(this.howToPlayButton);

        this.onResize(window.innerWidth, window.innerHeight);
    }

    onResize(width, height) {
        // Position title
        this.title.position.set(
            width / 2,
            height * 0.2
        );

        // Position buttons
        this.startButton.position.set(
            width / 2 - this.startButton.width / 2,
            height * 0.5
        );

        this.howToPlayButton.position.set(
            width / 2 - this.howToPlayButton.width / 2,
            height * 0.6
        );
    }
}