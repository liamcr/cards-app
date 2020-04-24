import React, { useState } from "react";
import {
  FlatList,
  ToastAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";
import { PlayCardPres } from "../utils/firebaseFunctions";
import { isValidPlay } from "../utils/helperFunctions";
import Card from "./Card";
import CardOverlay from "./CardOverlay";

const PresidentHand = ({ gameId, playerObj, gameState }) => {
  const [selected, setSelected] = useState(playerObj.hand.map(() => false));

  const onSwipeUp = () => {
    let errorMessage = isValidPlay(
      playerObj.hand.filter((card, index) => selected[index]),
      gameState.currentCard
    );
    if (errorMessage !== null) {
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    } else {
      setSelected((oldSelected) =>
        oldSelected
          .slice(
            0,
            oldSelected.length -
              oldSelected.filter((isSelected) => isSelected).length
          )
          .map(() => false)
      );

      // Submit cards to firebase
      PlayCardPres(
        gameId,
        playerObj.name,
        playerObj.hand.filter((card, index) => selected[index])
      ).catch((error) => {
        console.error(error.message);
      });
    }
  };

  const onPress = (index) => {
    const indOfFirstSelected = selected.findIndex((isSelected) => isSelected);

    if (
      indOfFirstSelected === -1 ||
      playerObj.hand[index].rank === playerObj.hand[indOfFirstSelected].rank
    ) {
      let selectedCopy = [...selected];

      selectedCopy[index] = !selectedCopy[index];

      setSelected(selectedCopy);
    } else {
      ToastAndroid.show(
        "You can only select multiple cards of the same rank",
        ToastAndroid.SHORT
      );
    }
  };

  return (
    <GestureRecognizer onSwipeUp={onSwipeUp}>
      <Text style={styles.headerText}>Your hand:</Text>
      <FlatList
        horizontal
        data={playerObj.hand}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            disabled={
              gameState.players[gameState.turn].name !== playerObj.name ||
              gameState.burning
            }
            onPress={() => onPress(index)}
          >
            <Card rank={item.rank} suit={item.suit} />
            <CardOverlay selected={selected[index]} />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  headerText: { fontSize: 20, marginLeft: 8 },
});

export default PresidentHand;
