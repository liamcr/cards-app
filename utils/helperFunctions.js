/**
 * Shuffles an array's values and returns the modified array
 *
 * @param {Array} arr The array to shuffle
 * @returns {Array} The shuffled array
 */
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

/**
 * Returns the index of the player who should play next
 * in crazy eights. Takes into account players no longer in the game
 * and skipping turns with Jacks.
 *
 * @param {object} gameState The state of the game in Firebase
 * @param {boolean} skipTurn True if a turn should be skipped (i.e. A jack is played in Crazy Eights)
 * @returns {number} The index of the next player that should play
 */
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

/**
 * Returns the index of the player who should play next
 * in go fish. Takes into account players no longer in the game
 *
 * @param {object} gameState The state of the game in Firebase
 */
export function getNextPlayerGoFish(gameState) {
  let playerIndex = (gameState.turn + 1) % gameState.players.length;

  while (
    gameState.players[playerIndex].hand.length === 0 &&
    gameState.pond.length === 0
  ) {
    playerIndex = (playerIndex + 1) % gameState.players.length;
  }

  return playerIndex;
}
