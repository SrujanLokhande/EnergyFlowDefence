import { Container, Graphics, Text } from 'pixi.js';
import { BlurFilter } from '@pixi/filter-blur';
import { Rectangle } from 'pixi.js';
import { TowerTypes, TowerConfigs } from '../config/towerConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class TowerUI {
    constructor(towerSystem) {
        this.towerSystem = towerSystem;
        this.container = new Container();
        this.selectedType = TowerTypes.BASIC;
        this.buttons = new Map(); // Store references to tower buttons
        
        this.setupTowerSelection();
        this.setupEventListeners();
    }

    setupTowerSelection() {
        this.selectionContainer = new Container();
        this.selectionContainer.position.set(20, window.innerHeight - 120);
        
        // Make the selection container interactive and stop propagation
        this.selectionContainer.eventMode = 'static';
        this.selectionContainer.on('pointertap', (event) => {
            event.stopPropagation();
        });

        // Create selection buttons for each tower type
        Object.entries(TowerConfigs).forEach(([type, config], index) => {
            const button = this.createTowerButton(type, config, index);
            this.buttons.set(type, button);
            this.selectionContainer.addChild(button);
        });

        this.container.addChild(this.selectionContainer);
        
        // Initially highlight the selected tower
        this.updateTowerSelection(this.selectedType);
    }

    createTowerButton(type, config, index) {
        const button = new Container();
        const buttonSize = 80;
        const margin = 20;
        
        // Create main button container with padding for glow effect
        const padding = 10;
        button.hitArea = {
            x: -padding,
            y: -padding,
            width: buttonSize + 2*padding,
            height: buttonSize + 2*padding,
            contains: (x, y) => {
                return x >= -padding && 
                       x <= buttonSize + padding && 
                       y >= -padding && 
                       y <= buttonSize + padding;
            }
        };

        // Glowing border (initially invisible)
        const glowBorder = new Graphics()
            .rect(-2, -2, buttonSize + 4, buttonSize + 4)
            .fill({ color: 0x4a9eff });
        glowBorder.visible = false;
        button.addChild(glowBorder);

        // Background with gradient
        const background = new Graphics();
        background
            .rect(0, 0, buttonSize, buttonSize)
            .fill({ color: 0x2a2a2a });
        
        // Add subtle inner shadow
        const innerShadow = new Graphics()
            .rect(2, 2, buttonSize - 4, buttonSize - 4)
            .fill({ color: 0x222222 });

        // Tower icon with the tower's color
        const icon = new Graphics()
            .rect(10, 10, buttonSize - 20, buttonSize - 20)
            .fill({ color: config.color });

        // Cost container with background
        const costContainer = new Container();
        const costBg = new Graphics()
            .rect(0, 0, 40, 20)
            .fill({ color: 0x000000, alpha: 0.6 });
        const costText = new Text(`${config.cost}`, {
            fontFamily: 'Arial',
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0xffd700,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 1
        });
        costText.position.set(5, 2);
        costContainer.addChild(costBg, costText);
        costContainer.position.set(5, buttonSize - 25);

        // Key hint with background
        const keyContainer = new Container();
        const keyBg = new Graphics()
            .rect(0, 0, 20, 20)
            .fill({ color: 0x000000, alpha: 0.6 });
        const keyText = new Text(`${index + 1}`, {
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'bold',
            fill: 0xffffff
        });
        keyText.position.set(6, 4);
        keyContainer.addChild(keyBg, keyText);
        keyContainer.position.set(buttonSize - 25, 5);

        // Stats preview (initially invisible)
        const stats = this.createStatsPreview(config);
        stats.visible = false;

        // Add all elements
        button.addChild(background, innerShadow, icon, costContainer, keyContainer, stats);
        button.position.set(index * (buttonSize + margin), 0);
        
        // Blur filter for unselected state
        const blurFilter = new BlurFilter();
        blurFilter.blur = 0;
        button.filters = [blurFilter];

        // Make interactive
        button.eventMode = 'static';
        button.cursor = 'pointer';
        button.interactive = true;
        
        // Hover effects
        button.on('pointerover', () => {
            glowBorder.visible = true;
            stats.visible = true;
            this.tweenScale(button, 1.05);
        });
        
        button.on('pointerout', () => {
            if (this.selectedType !== type) {
                glowBorder.visible = false;
            }
            stats.visible = false;
            this.tweenScale(button, 1);
        });
        
        button.on('pointertap', (event) => {
            // Stop event from propagating to prevent tower placement
            event.stopPropagation();
            this.selectTowerType(type);
        });

        return button;
    }

    createStatsPreview(config) {
        const container = new Container();
        container.position.set(0, -80);

        // Background
        const bg = new Graphics()
            .rect(0, 0, 100, 70)
            .fill({ color: 0x000000, alpha: 0.8 });
        
        // Stats text
        const statsText = new Text(
            `DMG: ${config.damage}\nRNG: ${config.range}\nSPD: ${config.attackSpeed}`, {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff,
            lineHeight: 16
        });
        statsText.position.set(5, 5);

        container.addChild(bg, statsText);
        return container;
    }

    tweenScale(object, targetScale) {
        const speed = 0.2;
        const animate = () => {
            const delta = (targetScale - object.scale.x) * speed;
            if (Math.abs(delta) > 0.001) {
                object.scale.set(object.scale.x + delta);
                requestAnimationFrame(animate);
            } else {
                object.scale.set(targetScale);
            }
        };
        animate();
    }

    updateTowerSelection(type) {
        this.buttons.forEach((button, buttonType) => {
            const blurFilter = button.filters[0];
            const glowBorder = button.getChildAt(0);
            
            if (buttonType === type) {
                // Selected tower
                this.tweenBlur(blurFilter, 0);
                glowBorder.visible = true;
                button.alpha = 1;
            } else {
                // Unselected towers
                this.tweenBlur(blurFilter, 2);
                glowBorder.visible = false;
                button.alpha = 0.7;
            }
        });
    }

    tweenBlur(filter, targetBlur) {
        const speed = 0.2;
        const animate = () => {
            const delta = (targetBlur - filter.blur) * speed;
            if (Math.abs(delta) > 0.01) {
                filter.blur += delta;
                requestAnimationFrame(animate);
            } else {
                filter.blur = targetBlur;
            }
        };
        animate();
    }

    selectTowerType(type) {
        this.selectedType = type;
        this.updateTowerSelection(type);
        eventManager.emit(GameEvents.TOWER_TYPE_SELECTED, { type });
    }

    showPlacementError(data) {
        const errorText = new Text(
            data.reason === 'insufficient_resources' 
                ? `Need ${data.required} resources!`
                : 'Invalid placement!',
            {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xff0000,
                stroke: 0x000000,
                strokeThickness: 4
            }
        );

        errorText.position.set(
            window.innerWidth / 2 - errorText.width / 2,
            window.innerHeight / 2 - 50
        );

        this.container.addChild(errorText);
        
        setTimeout(() => {
            errorText.destroy();
        }, 1500);
    }

    setupEventListeners() {
        // Listen for placement errors
        eventManager.subscribe(GameEvents.TOWER_PLACEMENT_FAILED, (data) => {
            this.showPlacementError(data);
        });

        // Listen for keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 4) {
                const types = Object.values(TowerTypes);
                if (types[num - 1]) {
                    this.selectTowerType(types[num - 1]);
                }
            }
        });
    }

    resize(width, height) {
        this.selectionContainer.position.set(20, height - 120);
    }
}