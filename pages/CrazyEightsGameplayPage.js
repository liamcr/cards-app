import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LoadingOverlay from "../components/LoadingOverlay";
import firestore from "@react-native-firebase/firestore";
import Deck from "../components/Deck";
import OpponentState from "../components/OpponentState";
import UserHand from "../components/UserHand";
import AnimatedCard from "../components/AnimatedCard";

const CrazyEightsGameplayPage = ({ route, navigation }) => {
  const { gameId, name } = route.params;
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot(doc => {
        if (doc.exists) {
          setGameState(doc.data());
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
          <Deck
            deck={gameState.pond}
            enabled={false}
            onPress={() => {
              console.log("pressed");
            }}
            showCount={false}
          />
          {gameState.players
            .filter(player => player.name !== name)
            .map((player, index) => (
              <OpponentState opponent={player} index={index} key={index} />
            ))}
        </View>
        <UserHand
          player={gameState.players.find(player => player.name === name)}
          renderCard={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                console.log(":)");
              }}
            >
              <AnimatedCard card={item} />
            </TouchableOpacity>
          )}
          navigation={navigation}
          showPairs={false}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  gameplayContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "100%"
  },
  opponentContainer: {
    height: "50%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  }
});

export default CrazyEightsGameplayPage;
