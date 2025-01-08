// generate me a script for this dynamoDB to connect, add, fetch to the table having name Leaderboard, with the following columns: Partition key - PlayerID(String), Sort Key - Score (Number)
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const saveScore = async (playerId, score) => {
  const command = new PutItemCommand({
    TableName: "Leaderboard",
    Item: {
      PlayerID: { S: playerId },
      Score: { N: score.toString() }
    }
  });

  await client.send(command);
};

export const fetchLeaderboard = async () => {
  const command = new ScanCommand({
    TableName: "Leaderboard",
    ProjectionExpression: "PlayerID, Score"
  });

  const response = await client.send(command);
  return response.Items.map(item => ({
    playerId: item.PlayerID.S,
    score: parseInt(item.Score.N)
  }));
};


