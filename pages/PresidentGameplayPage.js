import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import PresidentHand from "../components/PresidentHand";
import firestore from "@react-native-firebase/firestore";
import LoadingOverlay from "../components/LoadingOverlay";
import PresidentPlayedCard from "../components/PresidentPlayedCard";
import OpponentStateContainer from "../components/OpponentStateContainer";

const PresidentGameplayPage = ({ route, navigation }) => {
  const { gameId, name } = route.params;

  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const newGameState = doc.data();
          setGameState(newGameState);
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
          <PresidentHand
            gameId={gameId}
            playerObj={gameState.players.find((player) => player.name === name)}
            gameState={gameState}
          />
        </View>
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
});

export default PresidentGameplayPage;
