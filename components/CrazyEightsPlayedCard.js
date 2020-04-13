import React from "react";
import { View, StyleSheet, Text } from "react-native";

const CrazyEightsPlayedCard = ({ card }) => {
  return (
    <View style={styles.noCard}>
      <Text style={styles.noCardText}>No Card Played</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  noCard: {
    backgroundColor: "white",
    height: 128,
    width: 80,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#BABABA",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  noCardText: {
    color: "#BABABA",
    textAlign: "center"
  }
});

export default CrazyEightsPlayedCard;
