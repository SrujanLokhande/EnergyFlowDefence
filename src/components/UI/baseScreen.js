// components/ui/screens/BaseScreen.js
import { Container, Graphics } from 'pixi.js';

export class BaseScreen extends Container {
    constructor() {
        super();
        this.visible = false;
        this.setupBackground();
    }

    setupBackground() {
        this.background = new Graphics();
        this.addChild(this.background);
        this.redrawBackground();
    }

    redrawBackground(alpha = 0.7) {
        this.background.clear();
        this.background.beginFill(0x000000, alpha);
        this.background.drawRect(0, 0, window.innerWidth, window.innerHeight);
        this.background.endFill();
    }

    show() {
        this.visible = true;
        this.redrawBackground();
    }

    hide() {
        this.visible = false;
    }

    resize() {
        this.redrawBackground();
    }

    destroy() {
        super.destroy({ children: true });
    }
}