import { Container, Graphics, Text } from 'pixi.js';

export class UIButton extends Container {
    constructor(label, options = {}) {
        super();
        this.options = {
            width: options.width || 100,
            height: options.height || 40,
            fontSize: options.fontSize || 16,
            backgroundColor: options.backgroundColor || 0x4a4a4a,
            backgroundColorHover: options.backgroundColorHover || 0x6a6a6a,
            textColor: options.textColor || 0xFFFFFF,
            cornerRadius: options.cornerRadius || 8
        };

        this.setup(label);
    }

    setup(label) {
        this.eventMode = 'static';
        this.cursor = 'pointer';

        // Create button background
        this.background = new Graphics();
        this.drawBackground(this.options.backgroundColor);

        // Create button text
        this.label = new Text(label, {
            fontFamily: 'Arial',
            fontSize: this.options.fontSize,
            fill: this.options.textColor,
            align: 'center'
        });
        this.label.anchor.set(0.5);
        this.label.position.set(this.options.width / 2, this.options.height / 2);

        // Add elements to container
        this.addChild(this.background);
        this.addChild(this.label);

        // Setup event listeners
        this.setupInteractivity();
    }

    setupInteractivity() {
        this.on('pointerover', () => this.drawBackground(this.options.backgroundColorHover));
        this.on('pointerout', () => this.drawBackground(this.options.backgroundColor));
        this.on('pointerdown', () => this.drawBackground(this.options.backgroundColor));
    }

    drawBackground(color) {
        this.background.clear();
        this.background.beginFill(color);
        this.background.drawRoundedRect(0, 0, this.options.width, this.options.height, this.options.cornerRadius);
        this.background.endFill();
    }
}