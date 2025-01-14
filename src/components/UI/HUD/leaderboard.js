import { Container, Graphics, Text } from 'pixi.js';
import { eventManager } from '../../../managers/eventManager.js';
import { GameEvents } from '../../../config/eventTypes.js';

export class Leaderboard {
    constructor(gameDb) {
        this.container = new Container();
        this.gameDb = gameDb;
        this.scores = [];
        this.lastUpdateTime = 0;
        this.setupLeaderboard();
        
        eventManager.subscribe(GameEvents.LEADERBOARD_UPDATED, () => {
            // Prevent multiple updates within 1 second
            const now = Date.now();
            if (now - this.lastUpdateTime > 1000) {
                this.lastUpdateTime = now;
                this.refreshScores();
            }
        });
    }

    setupLeaderboard() {
        this.background = new Graphics()
            .rect(0, 0, 200, 180)
            .fill({ color: 0x000000, alpha: 0.7 });
        
        this.title = new Text('Top Scores', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'center'
        });
        this.title.position.set(10, 10);

        this.scoresContainer = new Container();
        this.scoresContainer.position.set(10, 40);

        this.container.addChild(this.background);
        this.container.addChild(this.title);
        this.container.addChild(this.scoresContainer);

        this.refreshScores();
    }

    formatPlayerID(playerId) {
        if (!playerId) return 'Unknown';
        if (playerId.startsWith('player_')) {
            const timestamp = playerId.split('_')[1];
            const date = new Date(parseInt(timestamp));
            return `Player ${date.getMinutes()}:${date.getSeconds()}`;
        }
        return playerId.slice(0, 8);
    }

    async refreshScores() {
        try {
            console.log('Refreshing leaderboard scores');
            const response = await this.gameDb.getTopScores(5);
            
            if (response.success && Array.isArray(response.scores)) {
                // Filter out duplicate entries and sort by score
                const uniqueScores = Array.from(new Map(
                    response.scores.map(score => [score.PlayerID, score])
                ).values());
                
                this.scores = uniqueScores.sort((a, b) => b.Score - a.Score);
                this.updateScoreDisplay();
            }
        } catch (error) {
            console.error('Error fetching leaderboard scores:', error);
        }
    }

    updateScoreDisplay() {
        this.scoresContainer.removeChildren();

        this.scores.slice(0, 5).forEach((score, index) => {
            const formattedId = this.formatPlayerID(score.PlayerID);
            const entry = new Text(
                `#${index + 1} ${formattedId}: ${score.Score}`,
                {
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fill: 0xffffff,
                    stroke: 0x000000,
                    strokeThickness: 3
                }
            );
            entry.position.set(0, index * 25);
            this.scoresContainer.addChild(entry);
        });
    }

    setPosition(x, y) {
        this.container.position.set(x, y);
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}