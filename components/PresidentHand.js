import React, { useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  StyleSheet,
  Text,
} from "react-native";
import Card from "./Card";
import CardOverlay from "./CardOverlay";
import GestureRecognizer from "react-native-swipe-gestures";

const PresidentHand = ({ gameId, playerObj }) => {
  const [selected, setSelected] = useState(playerObj.hand.map(() => false));

  const onSwipeUp = () => {
    // Submit cards to firebase
  };

  const onHoldDown = (index) => {
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

  const renderCard = ({ item, index }) => (
    <TouchableOpacity onLongPress={() => onHoldDown(index)}>
      <Card rank={item.rank} suit={item.suit} />
      <CardOverlay selected={selected[index]} />
    </TouchableOpacity>
  );

  return (
    <GestureRecognizer onSwipeUp={onSwipeUp}>
      <Text style={styles.headerText}>Your hand:</Text>
      <FlatList
        horizontal
        data={playerObj.hand}
        renderItem={renderCard}
        keyExtractor={(item, index) => index.toString()}
      />
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  headerText: { fontSize: 20, marginLeft: 8 },
});

export default PresidentHand;
