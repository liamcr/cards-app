import React, { useState, useEffect } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import PresidentHand from "../components/PresidentHand";
import firestore from "@react-native-firebase/firestore";
import LoadingOverlay from "../components/LoadingOverlay";
import PresidentPlayedCard from "../components/PresidentPlayedCard";
import OpponentStateContainer from "../components/OpponentStateContainer";
import PresidentPrompt from "../components/PresidentPrompt";
import { endGamePres } from "../utils/firebaseFunctions";
import theme from "../styles/theme.style";

const PresidentGameplayPage = ({ route, navigation }) => {
  const { gameId, name } = route.params;

  const [gameState, setGameState] = useState(null);
  const [finishedGameModalVisible, setFinishedGameModalVisible] = useState(
    false
  );

  const rankingToEmoji = {
    "1st": "🥇",
    "2nd": "🥈",
    "3rd": "🥉",
    "4th": "",
    "5th": "",
  };

  // Converts the user's index in the rankings array to a readable string.
  // For example, if the user is at index 1 of the rankings array, the function
  // returns '2nd'
  const getPlacementText = () => {
    const ranking = gameState.playerRankings.findIndex(
      (player) => player === name
    );

    const rankingText = ["1st", "2nd", "3rd", "4th", "5th"];

    if (ranking === -1) {
      return "";
    } else {
      return rankingText[ranking];
    }
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const newGameState = doc.data();

          setGameState(newGameState);

          if (newGameState.finished) {
            // Navigate to game end screen
            navigation.replace("GameEnd President", {
              gameId: gameId,
              name: name,
            });
          } else if (
            newGameState.players.filter((player) => player.hand.length > 0)
              .length === 1 &&
            !newGameState.burning
          ) {
            endGamePres(gameId);
          } else if (
            newGameState.mostRecentMove.length > 0 &&
            newGameState.mostRecentMove[0] === name &&
            newGameState.mostRecentMove[1] === "playCard" &&
            newGameState.players.find((player) => player.name === name).hand
              .length === 0 &&
            newGameState.playerRankings.length <=
              newGameState.players.length - 2
          ) {
            setFinishedGameModalVisible(true);
          }
        }
      });

    return () => unsubscribe();
  }, []);

  if (gameState === null) {
    return (
      <View style={styles.gameplayContainer}>
        <LoadingOverlay isLoading />
      </View>
    );
  } else {
    return (
      <View style={styles.gameplayContainer}>
        <View style={styles.opponentContainer}>
          <PresidentPlayedCard
            playedCard={gameState.currentCard}
            mostRecentMove={gameState.mostRecentMove}
            players={gameState.players}
            name={name}
            gameId={gameId}
          />
          <OpponentStateContainer
            userIndex={gameState.players.findIndex(
              (player) => player.name === name
            )}
            playerArr={gameState.players}
            gameState={gameState}
          />
        </View>
        <View style={styles.userContainer}>
          <PresidentPrompt gameState={gameState} name={name} gameId={gameId} />
          <PresidentHand
            gameId={gameId}
            playerObj={gameState.players.find((player) => player.name === name)}
            gameState={gameState}
          />
        </View>
        <Modal
          visible={finishedGameModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{`Congrats! ${
                rankingToEmoji[getPlacementText()]
              }`}</Text>
              <Text
                style={styles.modalBody}
              >{`You finished ${getPlacementText()}! Sit tight and wait for the others to finish up!`}</Text>
              <TouchableOpacity
                onPress={() => {
                  setFinishedGameModalVisible(false);
                }}
              >
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  gameplayContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "100%",
  },
  userContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  opponentContainer: {
    height: "50%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    alignItems: "center",
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: "white",
    maxWidth: "60%",
    padding: 10,
    borderRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  modalBody: {
    fontSize: 16,
  },
  modalClose: {
    fontSize: 24,
    marginTop: 8,
    color: theme.PRIMARY_COLOUR,
    textAlign: "center",
  },
});

export default PresidentGameplayPage;
