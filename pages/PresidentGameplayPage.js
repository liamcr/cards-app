import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";
import LoadingOverlay from "../components/LoadingOverlay";

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
    return <Text>President!</Text>;
  }
};

const styles = StyleSheet.create({
  gameplayContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "100%",
  },
});

export default PresidentGameplayPage;
