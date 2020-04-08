import React from "react";
import { View, Text, StyleSheet } from "react-native";

const OpponentState = ({ opponent, index }) => {
  return (
    <View style={styles[`opponentContainer${index + 1}`]}>
      <Text style={styles.opponentName}>{opponent.name}</Text>
      <View style={styles.cardCountContainer}>
        <View style={styles.cardBack} />
        <Text style={styles.cardCount}>{opponent.hand.length}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  opponentContainer1: {
    alignSelf: "flex-start",
    position: "absolute",
    left: "40%",
    top: 0,
  },
  opponentContainer2: {
    alignSelf: "flex-start",
    position: "absolute",
    left: "5%",
    top: 48,
  },
  opponentContainer3: {
    alignSelf: "flex-start",
    position: "absolute",
    right: "5%",
    top: 48,
  },
  opponentContainer4: {
    alignSelf: "flex-start",
    position: "absolute",
    left: "5%",
    top: 152,
  },
  opponentContainer5: {
    alignSelf: "flex-start",
    position: "absolute",
    right: "5%",
    top: 152,
  },
  opponentName: {
    fontSize: 20,
  },
  cardCountContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  cardBack: {
    height: 32,
    width: 20,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 4,
    elevation: 5,
  },
  cardCount: {
    fontSize: 20,
    marginLeft: 8,
  },
});

export default OpponentState;
