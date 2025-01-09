import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../config/gameConfig.js';

export class GridSystem {
    constructor() {
        this.container = new Container();
        this.width = GRID_CONFIG.CELL_SIZE * GRID_CONFIG.WIDTH;
        this.height = GRID_CONFIG.CELL_SIZE * GRID_CONFIG.HEIGHT;
        this.createGrid();
    }

    createGrid() {
        this.drawBackground();
        this.drawGridLines();
        this.addGrassEffect();
    }

    drawBackground() {
        const background = new Graphics()
            .rect(0, 0, this.width, this.height)
            .fill({ color: GRID_CONFIG.BACKGROUND_COLOR });
        this.container.addChild(background);
    }

    drawGridLines() {
        const gridLines = new Graphics();
        
        gridLines.setStrokeStyle({
            width: GRID_CONFIG.LINE_WIDTH,
            color: GRID_CONFIG.LINE_COLOR,
            alpha: GRID_CONFIG.LINE_ALPHA
        });

        // Draw vertical lines
        for (let x = 0; x <= this.width; x += GRID_CONFIG.CELL_SIZE) {
            gridLines
                .moveTo(x, 0)
                .lineTo(x, this.height)
                .stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.height; y += GRID_CONFIG.CELL_SIZE) {
            gridLines
                .moveTo(0, y)
                .lineTo(this.width, y)
                .stroke();
        }

        this.container.addChild(gridLines);
    }

    addGrassEffect() {
        const grassPatches = new Graphics();

        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = 3 + Math.random() * 4;
            
            grassPatches
                .rect(x, y, size, size)
                .fill({ color: 0x367f2f, alpha: 0.3 });
        }
        this.container.addChild(grassPatches);
    }

    gridToPixel(gridX, gridY) {
        return {
            x: gridX * GRID_CONFIG.CELL_SIZE,
            y: gridY * GRID_CONFIG.CELL_SIZE
        };
    }

    pixelToGrid(x, y) {
        return {
            x: Math.floor(x / GRID_CONFIG.CELL_SIZE),
            y: Math.floor(y / GRID_CONFIG.CELL_SIZE)
        };
    }

    // Get grid bounds for limiting pan
    getBounds() {
        return {
            width: this.width,
            height: this.height
        };
    }
}