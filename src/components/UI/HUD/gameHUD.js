import { Container, Text } from 'pixi.js';
import { GameDatabase } from '../../../services/dynamoDB.js';
import { Leaderboard } from '../HUD/leaderboard.js';

export class GameHUD {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.container = new Container();
        this.gameDb = new GameDatabase();
        
        this.setupHUDElements();
    }

    setupHUDElements() {
        // Resources display
        this.resourcesText = new Text('Resources: 500', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'left'
        });
        this.resourcesText.position.set(20, 20);

        // Wave counter
        this.waveText = new Text('Wave: 1', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'center'
        });
        this.waveText.position.set(20, 50);

        // Score display
        this.scoreText = new Text('Score: 0', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'right'
        });
        this.scoreText.position.set(20, 80);

        // Create leaderboard
        this.leaderboard = new Leaderboard(this.gameDb);
        
        // Add all elements to container
        this.container.addChild(this.resourcesText);
        this.container.addChild(this.waveText);
        this.container.addChild(this.scoreText);
        this.container.addChild(this.leaderboard.container);

        // Initial positioning
        this.resize(window.innerWidth, window.innerHeight);
    }
    
    updateResources(amount) {
        this.resourcesText.text = `Resources: ${amount}`;
    }

    updateWaveInfo(wave) {
        this.waveText.text = `Wave: ${wave}`;
    }

    updateScore(score) {
        this.scoreText.text = `Score: ${score}`;
        // Update DynamoDB when score changes
        //this.updatePlayerScore(score);
    }

    showWaveComplete(wave) {
        const completionText = new Text(`Wave ${wave} Complete!`, {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xffdd00,
            stroke: 0x000000,
            strokeThickness: 6,
            align: 'center'
        });
        
        completionText.position.set(
            window.innerWidth / 2 - completionText.width / 2,
            window.innerHeight / 2 - completionText.height / 2
        );
        
        this.container.addChild(completionText);
        
        setTimeout(() => {
            completionText.destroy();
        }, 2000);
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }

    resize(width, height) {
        // Update text positions
        this.scoreText.position.set(width - this.scoreText.width - 20, 20);
        this.waveText.position.set(width / 2 - this.waveText.width / 2, 20);
        
        // Position leaderboard in top-right corner
        this.leaderboard.setPosition(
            width - 220,  // 200px width + 20px margin
            60           // Below score text
        );
    }

    destroy() {
        if (this.leaderboard) {
            this.leaderboard.destroy();
        }
        this.container.destroy({ children: true });
    }
}