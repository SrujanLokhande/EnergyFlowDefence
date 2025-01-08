import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
    DynamoDBDocumentClient, 
    PutCommand,
    QueryCommand,
    ScanCommand 
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export class GameDatabase {
    constructor() {
        this.tableName = "Leaderboard";
    }

    // Save or update player score
    async updateScore(playerId, score) {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                PlayerID: playerId,
                Score: score,
                UpdatedAt: new Date().toISOString()
            }
        });

        try {
            await docClient.send(command);
            console.log("Score updated successfully");
            return true;
        } catch (error) {
            console.error("Error updating score:", error);
            return false;
        }
    }

    // Get player's latest score using Query instead of Get
    async getPlayerScore(playerId) {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "PlayerID = :pid",
            ExpressionAttributeValues: {
                ":pid": playerId
            },
            Limit: 1,
            ScanIndexForward: false // Get the highest score first
        });

        try {
            const response = await docClient.send(command);
            return response.Items?.[0]?.Score || 0;
        } catch (error) {
            console.error("Error getting player score:", error);
            return 0;
        }
    }

    // Get top scores (leaderboard)
    async getTopScores(limit = 10) {
        const command = new ScanCommand({
            TableName: this.tableName,
            Limit: limit
        });

        try {
            const response = await docClient.send(command);
            // Sort by score in descending order
            const sortedItems = (response.Items || [])
                .sort((a, b) => b.Score - a.Score)
                .slice(0, limit);
            return sortedItems;
        } catch (error) {
            console.error("Error getting leaderboard:", error);
            return [];
        }
    }

    // Get player's all scores
    async getPlayerScores(playerId) {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "PlayerID = :pid",
            ExpressionAttributeValues: {
                ":pid": playerId
            },
            ScanIndexForward: false // Get scores in descending order
        });

        try {
            const response = await docClient.send(command);
            return response.Items || [];
        } catch (error) {
            console.error("Error getting player scores:", error);
            return [];
        }
    }
}