import { GameDatabase } from './services/dynamoDB.js';

async function testDatabase() {
    const gameDB = new GameDatabase();

    // Test 1: Update scores for testing
    console.log("Testing score updates...");
    await gameDB.updateScore("testPlayer1", 1000);
    await gameDB.updateScore("testPlayer2", 1500);
    await gameDB.updateScore("testPlayer1", 2000); // Update player1's score

    // Test 2: Get player's latest score
    console.log("\nTesting get player score...");
    const playerScore = await gameDB.getPlayerScore("testPlayer1");
    console.log("Player's latest score:", playerScore);

    // Test 3: Get all scores for a player
    console.log("\nTesting get player scores...");
    const playerScores = await gameDB.getPlayerScores("testPlayer1");
    console.log("All scores for player:", playerScores);

    // Test 4: Get leaderboard
    console.log("\nTesting leaderboard...");
    const leaderboard = await gameDB.getTopScores(5);
    console.log("Top 5 scores:", leaderboard);
}

testDatabase().catch(console.error);
