export class GameDatabase {
    constructor() {
        this.apiUrl = 'https://ghodigkevg.execute-api.ap-south-1.amazonaws.com/prod/leaderboard';
    }

    async makeRequest(data) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                mode: 'cors'
            });
    
            // Log the raw response body for debugging:
            const text = await response.text();
            console.log('Raw response:', text);
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            }
    
            // If it's JSON, parse it:
            const responseData = JSON.parse(text);
            return responseData;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    async updateScore(playerId, score) {
        if (!playerId || typeof playerId !== 'string') {
            throw new Error('Invalid player ID');
        }

        if (typeof score !== 'number' || isNaN(score)) {
            throw new Error('Invalid score value');
        }

        try {
            const response = await this.makeRequest({
                action: 'updateScore',
                playerId: playerId, // This will be mapped to PlayerID in Lambda
                score: score      // This will be mapped to Score in Lambda
            });
            
            return {
                success: true,
                data: {
                    PlayerID: response.PlayerID,
                    Score: response.Score
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTopScores(limit = 10) {
        try {
            const response = await this.makeRequest({
                action: 'getTopScores',
                limit
            });
            
            // Convert the response to match the table schema casing
            return {
                success: true,
                scores: response.map(score => ({
                    PlayerID: score.PlayerID,
                    Score: score.Score,
                    UpdatedAt: score.UpdatedAt
                }))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                scores: []
            };
        }
    }
}