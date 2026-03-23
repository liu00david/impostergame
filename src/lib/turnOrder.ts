/**
 * Returns total number of turns in a round.
 * Everyone says one word, then starting player says one more.
 * That's playerCount + 1 turns total.
 */
export function getTotalTurns(playerCount: number): number {
  return playerCount + 1
}

/**
 * Returns the player index for a given turn index.
 * Turn 0..playerCount-1: goes around in order starting from startingPlayerIndex.
 * Turn playerCount: back to startingPlayerIndex.
 */
export function getPlayerForTurn(
  turnIndex: number,
  startingPlayerIndex: number,
  playerCount: number
): number {
  return (startingPlayerIndex + turnIndex) % playerCount
}

/**
 * Loop is complete when all players have gone once (turnIndex === playerCount).
 * After that, the starting player takes their final turn.
 */
export function isLoopComplete(turnIndex: number, playerCount: number): boolean {
  return turnIndex >= playerCount
}
