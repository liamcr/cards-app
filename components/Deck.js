import React, { useState } from "react";
import {
  Animated,
  View,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  Easing,
  useWindowDimensions
} from "react-native";

const Deck = ({ onPress, enabled, deck, showCount }) => {
  const [yOffset] = useState(new Animated.Value(-2));
  const [animating, setAnimating] = useState(false);
  const offsetMax = useWindowDimensions().height * 0.8;

  return (
    <View style={styles.deckContainer}>
      <View style={{ ...styles.cardBackLarge, elevation: 5 }}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (enabled && !animating) {
              setAnimating(true);
              onPress();
              Animated.timing(yOffset, {
                toValue: offsetMax,
                duration: 300,
                useNativeDriver: true
              }).start(() => {
                yOffset.setValue(-2);
                setAnimating(false);
              });
            }
          }}
          disabled={deck.length === 0}
        >
          <Animated.View
            style={{
              ...styles.cardBackLarge,
              transform: [
                {
                  translateY: yOffset
                }
              ],
              marginLeft: -2
            }}
          />
        </TouchableWithoutFeedback>
      </View>

      {showCount && <Text style={styles.deckCount}>{deck.length}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    display: "flex",
    alignItems: "center"
  },
  cardBackLarge: {
    height: 128,
    width: 80,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: "red",
    borderColor: "white"
  },
  deckCount: {
    fontSize: 32,
    marginTop: 8
  }
});

export default Deck;
