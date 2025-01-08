// write me a main.js script to use the functions defined in dynaoDB.js to write and fetch values from the Leaderboard table
import { saveScore, fetchLeaderboard } from "./dynamoDB.js";

const main = async () => {
  await saveScore("player1", 100);
  await saveScore("player2", 200);
  const leaderboard = await fetchLeaderboard();
  console.log(leaderboard);
};

main();