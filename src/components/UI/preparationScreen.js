import { Container, Text } from 'pixi.js';
import { BaseScreen } from './baseScreen.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class PreparationScreen extends BaseScreen {
    constructor() {
        super();
        this.setupElements();
        this.countdownDuration = 5000; // 5 seconds countdown
        this.countdownTimer = null;
    }

    setupElements() {
        // Title text
        this.title = new Text('Prepare Your Defenses!', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 6,
            align: 'center'
        });
        this.title.anchor.set(0.5);

        // Countdown text
        this.countdownText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'center'
        });
        this.countdownText.anchor.set(0.5);

        // Instructions text
        this.instructionsText = new Text('Build towers and prepare your strategy!', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 3,
            align: 'center'
        });
        this.instructionsText.anchor.set(0.5);

        // Add elements to container
        this.addChild(this.title);
        this.addChild(this.countdownText);
        this.addChild(this.instructionsText);

        this.resize();
    }

    startCountdown() {
        const startTime = Date.now();
        
        const updateCountdown = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.ceil((this.countdownDuration - elapsed) / 1000);
            
            if (remaining <= 0) {
                // Countdown finished
                this.hide();
                eventManager.emit(GameEvents.GAME_START_REQUESTED);
                return;
            }

            this.countdownText.text = `Wave 1 starting in ${remaining} seconds...`;
            this.countdownTimer = requestAnimationFrame(updateCountdown);
        };

        updateCountdown();
    }

    show() {
        super.show();
        this.startCountdown();
    }

    hide() {
        if (this.countdownTimer) {
            cancelAnimationFrame(this.countdownTimer);
            this.countdownTimer = null;
        }
        super.hide();
    }

    resize() {
        super.resize();

        if (this.title && this.countdownText && this.instructionsText) {
            // Position title
            this.title.position.set(
                window.innerWidth / 2,
                window.innerHeight / 2 - 100
            );

            // Position countdown text
            this.countdownText.position.set(
                window.innerWidth / 2,
                window.innerHeight / 2
            );

            // Position instructions text
            this.instructionsText.position.set(
                window.innerWidth / 2,
                window.innerHeight / 2 + 100
            );
        }
    }

    destroy() {
        if (this.countdownTimer) {
            cancelAnimationFrame(this.countdownTimer);
        }
        super.destroy();
    }
}