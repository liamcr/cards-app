import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import pondTemplate from "../utils/pondTemplate.json";
import AsyncStorage from "@react-native-community/async-storage";
import MaxPlayers from "./gameMaxPlayers.json";
import { shuffle } from "./helperFunctions";

/* 
  Saves game locally, so that the app can remember that the user
  is a part of this game. This prevents users from joining a game
  twice from the same phone.
*/
export async function setLocalData(gameId, name) {
  await AsyncStorage.getItem("cardGamesActive", (err, result) => {
    if (err) {
      console.error(err.message);
    } else {
      let data;

      if (result === null) {
        data = {};
        data[gameId] = name;
      } else {
        data = JSON.parse(result);
        data[gameId] = name;
      }

      AsyncStorage.setItem("cardGamesActive", JSON.stringify(data))
        .then(() => {
          console.log("Game added locally");
        })
        .catch(error => {
          console.error(error.message);
        });
    }
  });
}

/* 
  Returns a Promise<Boolean> that checks to see if the user
  has already joined the specified game.
*/
export async function isInGame(gameId) {
  let inGame = false;
  await AsyncStorage.getItem("cardGamesActive", (err, result) => {
    if (err) {
      console.error(err.message);
    } else {
      const data = result === null ? {} : JSON.parse(result);
      if (gameId in data) {
        inGame = true;
      }
    }
  }).catch(reason => {
    console.error(reason);
  });

  return inGame;
}

/*
  Removes games from local storage that have been removed from firebase
*/
export async function cleanLocalStorage() {
  let cleanedStorageString = await AsyncStorage.getItem(
    "cardGamesActive"
  ).catch(error => {
    cleanedStorageString = null;
  });

  let jsonStorage =
    cleanedStorageString !== null ? JSON.parse(cleanedStorageString) : {};
  let newStorage = {};

  if (Object.keys(jsonStorage).length > 0) {
    await firestore()
      .collection("liveGames")
      .where(
        firebase.firestore.FieldPath.documentId(),
        "in",
        Object.keys(jsonStorage).slice(0, 10)
      )
      .get()
      .then(data => {
        data.forEach((val, ind) => {
          newStorage[val.id] = jsonStorage[val.id];
        });
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  console.log("Cleaned local storage");
  AsyncStorage.setItem("cardGamesActive", JSON.stringify(newStorage));
}

/* Removes a game from local storage object */
export async function removeGameLocally(gameId) {
  let localGames = await AsyncStorage.getItem("cardGamesActive");

  let localGamesJSON = localGames ? JSON.parse(localGames) : {};

  if (gameId in localGamesJSON) {
    delete localGamesJSON[gameId];
  } else {
    throw new Error("Game already removed");
  }

  await AsyncStorage.setItem("cardGamesActive", JSON.stringify(localGamesJSON));
}

/* Cancel game (i.e. Remove the game from Firebase) */
export async function cancelGame(gameId) {
  await firestore()
    .collection("liveGames")
    .doc(gameId)
    .delete();
}

export async function resetGame(gameId) {
  const document = firestore()
    .collection("liveGames")
    .doc(gameId);

  await document.get().then(doc => {
    const data = doc.data();

    const resetPlayers = data.players.map(player => {
      return { name: player.name, hand: [], numPairs: 0, pairedCards: [] };
    });

    document.update({
      finished: false,
      started: false,
      players: resetPlayers,
      pond: pondTemplate,
      gameUpdate: "Game Starting...",
      turn: 0
    });
  });
}

/* Remove the user from the players array in Firebase */
export async function leaveGame(name, gameId) {
  let document = firestore()
    .collection("liveGames")
    .doc(gameId);

  document.get().then(data => {
    if (data.exists) {
      let players = data.data().players;
      let newPlayers = [];

      players.forEach(player => {
        if (player.name !== name) {
          newPlayers.push(player);
        }
      });

      document.update({ players: newPlayers });
    }
  });
}

/* Takes card from opponent if possible. Returns a boolean representing
   whether or not the opponent had the card the user was asking for */
export async function takeCard(gameId, playerOneName, playerTwoName, rank) {
  const document = firestore()
    .collection("liveGames")
    .doc(gameId);

  let opponentHasCard;

  await document.get().then(async doc => {
    if (doc.exists) {
      let data = doc.data();
      let updatedPlayers = data.players;
      let playerOneIndex, playerTwoIndex;
      let playerTwoCardIndex = -1;

      // Finds the position of both the user and the opponent
      // in the game's players array
      for (let i = 0; i < data.players.length; i++) {
        let playerName = data.players[i].name;
        if (playerName === playerOneName) {
          playerOneIndex = i;
        } else if (playerName === playerTwoName) {
          playerTwoIndex = i;
        }
      }

      // Finds the index of the card in question in player 2's hand.
      // If the requested card is not in player 2's hand, playerTwoCardIndex
      // remains at -1
      for (let i = 0; i < data.players[playerTwoIndex].hand.length; i++) {
        let cardRank = data.players[playerTwoIndex].hand[i].rank;

        if (cardRank === rank) {
          playerTwoCardIndex = i;
          break;
        }
      }

      if (playerTwoCardIndex !== -1) {
        updatedPlayers[playerOneIndex].hand.push(
          updatedPlayers[playerTwoIndex].hand[playerTwoCardIndex]
        );
        updatedPlayers[playerTwoIndex].hand.splice(playerTwoCardIndex, 1);

        await document.update({
          players: updatedPlayers,
          gameUpdate: `${playerOneName} took a ${rank} from ${playerTwoName}!`
        });

        opponentHasCard = true;
      } else {
        await document.update({
          gameUpdate: `${playerOneName} asked ${playerTwoName} for a ${rank}`,
          turnState: "fishing"
        });

        opponentHasCard = false;
      }
    }
  });

  return opponentHasCard;
}

/* Logic for taking a card from the pond. It takes whatever card is at the bottom
   of the deck, but because the deck is shuffled, it's essentially a random
   card */
export async function takeFromPond(gameId, name) {
  const document = firestore()
    .collection("liveGames")
    .doc(gameId);

  let cardDrawn;

  await document.get().then(async doc => {
    if (doc.exists) {
      let data = doc.data();
      let updatedGame = data;
      let playerOneIndex;

      // Finds the position of the user in the game's players array
      for (let i = 0; i < data.players.length; i++) {
        let playerName = data.players[i].name;
        if (playerName === name) {
          playerOneIndex = i;
          break;
        }
      }

      cardDrawn = updatedGame.pond.pop();

      updatedGame.players[playerOneIndex].hand.push(cardDrawn);

      await document.update({
        players: updatedGame.players,
        pond: updatedGame.pond
      });
    }
  });

  return cardDrawn;
}

export async function setTurnState(gameId, turnState) {
  await firestore()
    .collection("liveGames")
    .doc(gameId)
    .update({
      turnState: turnState
    });
}

export async function finishTurn(gameId, gameState) {
  const nextTurn = (gameState.turn + 1) % gameState.players.length;

  let nextTurnStartingState =
    gameState.players[nextTurn].hand.length === 0
      ? "fishingToStart"
      : "choosingCard";

  await firestore()
    .collection("liveGames")
    .doc(gameId)
    .update({
      turn: nextTurn,
      gameUpdate: `It's ${gameState.players[nextTurn].name}'s turn`,
      turnState: nextTurnStartingState
    });
}

export async function pairUpHand(gameId, playerName) {
  const document = firestore()
    .collection("liveGames")
    .doc(gameId);

  let pairsFound = 0;

  await document.get().then(async doc => {
    if (doc.exists) {
      let data = doc.data();

      let playerIndex = data.players.findIndex(
        player => player.name === playerName
      );

      let pairedCardsArr = data.players[playerIndex].pairedCards;
      let numPairs = 0;
      let arr = data.players[playerIndex].hand;
      let sortedArr = [...arr];

      sortedArr.sort((a, b) => {
        return a.rank.localeCompare(b.rank);
      });

      for (let i = 1; i < sortedArr.length; i++) {
        if (sortedArr[i].rank === sortedArr[i - 1].rank) {
          numPairs++;
          pairedCardsArr.push(sortedArr[i - 1], sortedArr[i]);

          arr.splice(arr.indexOf(sortedArr[i]), 1);
          arr.splice(arr.indexOf(sortedArr[i - 1]), 1);

          i++;
        }
      }

      data.players[playerIndex].numPairs += numPairs;
      pairsFound = numPairs;

      if (numPairs > 0) {
        await document.update({ players: data.players });
      }
    }
  });

  return pairsFound;
}

/* Makes a room code that is unique across the whole database.
  After 10 failed attempts to make a unique code, it times out and
  throws an error.
*/
export async function generateRoomCode() {
  let numTries = 0;
  let exists = true;
  let gameId;
  const collection = firestore().collection("liveGames");

  while (numTries < 10 && exists) {
    gameId = Math.floor(Math.random() * 10000).toString();

    await collection
      .doc(gameId)
      .get()
      .then(doc => {
        if (doc.exists) {
          exists = true;
        } else {
          exists = false;
        }
      });

    numTries++;
  }

  if (numTries === 10) {
    throw new Error("Too many games ongoing. Try again later.");
  } else {
    return gameId.padStart(4, "0");
  }
}

/*
  Creates game object in Firebase
*/
export async function createGame(creatorName, gameType) {
  // Define create game logic here

  console.log("Creating game...");

  let gameObject;

  let gameId;

  await generateRoomCode()
    .then(id => {
      gameId = id;
    })
    .catch(error => {
      throw error;
    });

  // TODO: Change initial turn state to "choosingCard" after
  // shuffling deck is implemented
  gameObject = {
    game: gameType,
    turn: 0,
    started: false,
    finished: false,
    players: [
      {
        name: creatorName,
        numPairs: 0,
        hand: [],
        pairedCards: []
      }
    ],
    pond: pondTemplate,
    gameUpdate: "Game Starting...",
    turnState: "choosingCard"
  };

  await firestore()
    .collection("liveGames")
    .doc(gameId)
    .set(gameObject)
    .then(() => {
      console.log("Game created!");

      setLocalData(gameId, creatorName).catch(error => {
        throw new Error(error);
      });
    })
    .catch(error => {
      throw new Error(error);
    });

  return gameId;
}

/*
  Adds a player to a game. Throws error when:
  1. User is already in the game
  2. The game has already started
  3. The game doesn't yet exist
*/
export async function joinGame(name, gameId) {
  // Define join game logic here
  console.log("Joining game...");

  const document = firestore()
    .collection("liveGames")
    .doc(gameId);

  await document
    .get()
    .then(async doc => {
      let userInGame = false;
      if (doc.exists) {
        let data = doc.data();

        if (
          !data.started &&
          data.players.length < MaxPlayers[data.game] &&
          data.players.filter(player => player.name === name).length === 0
        ) {
          await isInGame(gameId).then(inGame => {
            if (!inGame) {
              let currentPlayers = data.players;

              currentPlayers.push({
                name: name,
                numPairs: 0,
                hand: [],
                pairedCards: []
              });

              document
                .update({ players: currentPlayers })
                .then(() => {
                  console.log("Player added!");
                  setLocalData(gameId, name).catch(error => {
                    throw new Error(error);
                  });
                })
                .catch(error => {
                  throw new Error(error);
                })

                .catch(error => {
                  console.error("Unforseen error", error);
                });
            } else {
              userInGame = true;
            }
          });

          if (userInGame) {
            throw new Error("You're already in this game!");
          }
        } else {
          if (data.started) {
            throw new Error("Game in progress");
          } else if (data.players.length >= MaxPlayers[data.game]) {
            throw new Error("This game is full");
          } else if (
            data.players.filter(player => player.name === name).length >= 0
          ) {
            throw new Error(`There is already someone named ${name}`);
          }
        }
      } else {
        throw new Error("Game does not exist");
      }
    })
    .catch(error => {
      throw error;
    });
}

export async function startGame(gameId) {
  const document = firestore()
    .collection("liveGames")
    .doc(gameId);

  await document.get().then(doc => {
    const data = doc.data();

    // Shuffle deck
    let shuffledPond = shuffle([...data.pond]);

    let players = [...data.players];

    const numCardsToDeal = players.length <= 3 ? 7 : 5;

    for (let i = 0; i < players.length; i++) {
      players[i].hand = shuffledPond.splice(0, numCardsToDeal);
    }

    document
      .update({
        pond: shuffledPond,
        players: players,
        started: true,
        gameUpdate: `It's ${players[0].name}'s turn`
      })
      .then(() => {
        console.log("started");
      });
  });
}

export async function endGame(gameId) {
  await firestore()
    .collection("liveGames")
    .doc(gameId)
    .update({ finished: true });
}

/* 
   Returns game data based on a given game ID.
   gameId: string - The 4-digit game code
   Returns: A promise - promise will contain game
   data once Firebase returns it. Promise will
   contain null if the given gameId is not found.
*/
export async function getGame(gameId) {
  let gameData;

  const document = firestore()
    .collection("liveGames")
    .doc(gameId);

  await document
    .get()
    .then(doc => {
      if (doc.exists) {
        gameData = doc.data();
      } else {
        console.warn("Document does not exist!");
        gameData = null;
      }
    })
    .catch(error => {
      console.error("Error:", error);
      throw new Error(error);
    });

  return gameData;
}
