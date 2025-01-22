import { Container, Graphics } from 'pixi.js';

export class BaseScreen extends Container {
    constructor() {
        super();
        this.visible = false;
        this.setupBackground();
        this.interactive = true;  // Make all screens interactive by default
    }

    setupBackground() {
        this.background = new Graphics();
        this.addChild(this.background);
        this.redrawBackground();
    }

    redrawBackground(alpha = 0.7) {
        this.background.clear()
            .beginFill(0x000000, alpha)
            .drawRect(0, 0, window.innerWidth, window.innerHeight)
            .endFill();
    }

    show() {
        this.visible = true;
        this.redrawBackground();
    }

    hide() {
        this.visible = false;
    }

    resize(width = window.innerWidth, height = window.innerHeight) {
        this.redrawBackground();
        this.onResize(width, height);
    }

    // Override this method in child classes
    onResize(width, height) {}

    destroy() {
        this.background.destroy();
        super.destroy({ children: true });
    }
}