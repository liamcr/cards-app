export function shuffle(arr) {
  let currentIndex = arr.length;
  let tempVal, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    tempVal = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = tempVal;
  }

  return arr;
}

export function getNextPlayerCE(gameState, skipTurn) {
  let playerIndex = (gameState.turn + 1) % gameState.players.length,
    playersSkipped = 0;

  while (
    gameState.players[playerIndex].hand.length === 0 ||
    (skipTurn ? playersSkipped !== 1 : playersSkipped !== 0)
  ) {
    if (gameState.players[playerIndex].hand.length > 0) {
      playersSkipped++;
    }

    playerIndex = (playerIndex + 1) % gameState.players.length;
  }

  return playerIndex;
}
