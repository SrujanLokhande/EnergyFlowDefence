import { Container, Text } from 'pixi.js';
import { BaseScreen } from './baseScreen.js';
import { UIButton } from '../UI/elements/uiButton.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class MainMenuScreen extends BaseScreen {
    constructor() {
        super();
        this.setupElements();
        this.setupEventListeners();
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
            fontSize: 24
        });

        this.howToPlayButton = new UIButton('HOW TO PLAY', {
            width: 200,
            height: 50,
            fontSize: 24
        });

        this.addChild(this.title);
        this.addChild(this.startButton);
        this.addChild(this.howToPlayButton);

        this.resize();
    }

    setupEventListeners() {
        // Modified to trigger preparation phase instead of direct game start
        this.startButton.on('pointerup', () => {
            console.log('Start button clicked - initiating preparation phase');
            eventManager.emit(GameEvents.GAME_PREPARATION_STARTED);
            this.hide();
        });

        this.howToPlayButton.on('pointerup', () => {
            eventManager.emit(GameEvents.TUTORIAL_REQUESTED);
        });
    }

    resize() {
        super.resize();

        // Center title
        this.title.position.set(
            window.innerWidth / 2,
            window.innerHeight * 0.2
        );

        // Position buttons
        this.startButton.position.set(
            window.innerWidth / 2 - this.startButton.width / 2,
            window.innerHeight * 0.5
        );

        this.howToPlayButton.position.set(
            window.innerWidth / 2 - this.howToPlayButton.width / 2,
            window.innerHeight * 0.6
        );
    }
}