import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-community/picker";
import theme from "../styles/theme.style";

const UserPrompt = ({ gameState, name, toAsk, onValChange, onAsk }) => {
  if (
    gameState.players.findIndex((player) => player.name === name) !==
    gameState.turn
  ) {
    return (
      <View style={styles.askForCardContainer}>
        <View style={styles.askForCardSubcontainer}>
          <Text style={styles.gameUpdateText}>{gameState.gameUpdate}</Text>
        </View>
      </View>
    );
  } else if (gameState.turnState === "fishing") {
    return (
      <View style={styles.askForCardContainer}>
        <View style={styles.askForCardSubcontainer}>
          <Text style={styles.gameUpdateText}>{`${
            gameState.players.filter((player) => player.name !== name)[toAsk]
              .name
          } didn't have that card!`}</Text>
          <Text style={styles.gameUpdateText}>
            Take a card from the pond above
          </Text>
        </View>
      </View>
    );
  } else if (gameState.turnState === "fishingToStart") {
    return (
      <View style={styles.askForCardContainer}>
        <View style={styles.askForCardSubcontainer}>
          <Text style={styles.gameUpdateText}>It's your turn!</Text>
          <Text style={styles.gameUpdateText}>
            Take a card from the pond above
          </Text>
        </View>
      </View>
    );
  } else if (gameState.turnState === "choosingCard") {
    return (
      <View style={styles.askForCardContainer}>
        <View style={styles.askForCardSubcontainer}>
          <Text style={styles.gameUpdateText}>Ask someone for a card:</Text>
          <Picker
            selectedValue={
              gameState.players.filter((player) => player.name !== name)[toAsk]
                .name
            }
            onValueChange={onValChange}
            mode="dropdown"
            style={{ width: "70%" }}
          >
            {gameState.players
              .filter((player) => player.name !== name)
              .map((player, index) => (
                <Picker.Item
                  key={index}
                  label={player.name}
                  value={player.name}
                />
              ))}
          </Picker>
          <View style={styles.askButtonContainer}>
            <Button color={theme.PRIMARY_COLOUR} title="Ask!" onPress={onAsk} />
          </View>
        </View>
      </View>
    );
  } else {
    return null;
  }
};

const styles = StyleSheet.create({
  gameUpdateText: {
    textAlign: "center",
    fontSize: 16,
  },
  askForCardContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  askForCardSubcontainer: {
    width: "60%",
    display: "flex",
    alignItems: "center",
  },
  askButtonContainer: {
    width: "50%",
  },
});

export default UserPrompt;
