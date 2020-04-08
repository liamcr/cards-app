import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";

class Card extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.card}>
        <Text style={styles.cardText}>{`${this.props.rank} ${
          this.props.symbol
        }`}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    borderColor: "black",
    height: 128,
    width: 92,
    borderWidth: 2,
    borderRadius: 4,
    margin: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 20,
  },
});

export default Card;
