import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../styles/theme.style";
import { TouchableOpacity } from "react-native-gesture-handler";
import { passTurn } from "../utils/firebaseFunctions";

const PresidentPrompt = ({ gameState, name, gameId }) => {
  const [passPressed, setPassPressed] = useState(false);

  const onPressPass = () => {
    setPassPressed(true);
    passTurn(gameId).then(() => {
      setPassPressed(false);
    });
  };

  if (
    gameState.players.findIndex((player) => player.name === name) !==
    gameState.turn
  ) {
    return (
      <View style={styles.promptContainer}>
        <Text style={styles.gameUpdateText}>{gameState.gameUpdate}</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.promptContainer}>
        <Text style={styles.gameUpdateText}>
          It's your turn! Choose some cards to play!
        </Text>
        <TouchableOpacity onPress={onPressPass} disabled={passPressed}>
          <View style={styles.passButton}>
            <Text style={styles.passButtonText}>Pass</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  gameUpdateText: {
    textAlign: "center",
    fontSize: 16,
    width: "60%",
  },
  promptContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
  },
  passButton: {
    backgroundColor: theme.PRIMARY_COLOUR,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 100,
  },
  passButtonText: {
    color: "white",
    fontSize: 20,
  },
});

export default PresidentPrompt;
