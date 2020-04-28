import React, { useState } from "react";
import {
  FlatList,
  ToastAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";
import { playCardPres, swapCards } from "../utils/firebaseFunctions";
import { isValidPlay } from "../utils/helperFunctions";
import Card from "./Card";
import CardOverlay from "./CardOverlay";

const PresidentHand = ({
  gameId,
  playerObj,
  gameState,
  setWaitingForFirebase,
}) => {
  const [selected, setSelected] = useState(playerObj.hand.map(() => false));
  const [sentCards, setSentCards] = useState(false);

  const onSwipeUp = () => {
    if (gameState.presPassedCards && gameState.vicePassedCards) {
      let errorMessage = isValidPlay(
        playerObj.hand.filter((card, index) => selected[index]),
        gameState.currentCard
      );
      if (errorMessage !== null) {
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      } else {
        setWaitingForFirebase(true);

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
        playCardPres(
          gameId,
          playerObj.name,
          playerObj.hand.filter((card, index) => selected[index])
        )
          .then(() => {
            setWaitingForFirebase(false);
          })
          .catch((error) => {
            console.error(error.message);
          });
      }
    } else if (
      !gameState.presPassedCards &&
      playerObj.rank === "president" &&
      !sentCards
    ) {
      setSentCards(true);

      if (
        selected.reduce((total, current) => total + (current ? 1 : 0)) !== 2
      ) {
        ToastAndroid.show("You have to pass two cards", ToastAndroid.SHORT);
        setSentCards(false);
      } else {
        setWaitingForFirebase(true);
        setSelected((oldSelected) =>
          oldSelected.slice(0, oldSelected.length).map(() => false)
        );

        //Swap card logic
        swapCards(
          gameId,
          playerObj.name,
          playerObj.hand.filter((card, index) => selected[index])
        ).then(() => {
          setWaitingForFirebase(false);
          setSentCards(false);
        });
      }
    } else if (
      !gameState.vicePassedCards &&
      playerObj.rank === "vice-president" &&
      !sentCards
    ) {
      if (
        selected.reduce((total, current) => total + (current ? 1 : 0)) !== 1
      ) {
        ToastAndroid.show("You have to pass one card", ToastAndroid.SHORT);
        setSentCards(false);
      } else {
        setWaitingForFirebase(true);
        setSelected((oldSelected) =>
          oldSelected.slice(0, oldSelected.length).map(() => false)
        );

        //Swap card logic
        swapCards(
          gameId,
          playerObj.name,
          playerObj.hand.filter((card, index) => selected[index])
        ).then(() => {
          setWaitingForFirebase(false);
          setSentCards(false);
        });
      }
    }
  };

  const onPress = (index) => {
    if (gameState.presPassedCards && gameState.vicePassedCards) {
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
    } else {
      if (playerObj.rank === "president") {
        if (
          selected[index] ||
          selected.reduce((total, current) => total + (current ? 1 : 0)) < 2
        ) {
          let selectedCopy = [...selected];

          selectedCopy[index] = !selectedCopy[index];

          setSelected(selectedCopy);
        } else {
          ToastAndroid.show(
            "You can only select two cards to send over",
            ToastAndroid.SHORT
          );
        }
      }
      if (playerObj.rank === "vice-president") {
        if (
          selected[index] ||
          selected.reduce((total, current) => total + (current ? 1 : 0)) < 1
        ) {
          let selectedCopy = [...selected];

          selectedCopy[index] = !selectedCopy[index];

          setSelected(selectedCopy);
        } else {
          ToastAndroid.show(
            "You can only select one card to send over",
            ToastAndroid.SHORT
          );
        }
      }
    }
  };

  return (
    <GestureRecognizer onSwipeUp={onSwipeUp}>
      <Text style={styles.headerText}>Your hand:</Text>
      <View style={styles.userHandContainer}>
        <FlatList
          horizontal
          data={playerObj.hand}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              disabled={
                !gameState.presPassedCards || !gameState.vicePassedCards
                  ? (gameState.presPassedCards ||
                      playerObj.rank !== "president") &&
                    (gameState.vicePassedCards ||
                      playerObj.rank !== "vice-president")
                  : gameState.players[gameState.turn].name !== playerObj.name ||
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
      </View>
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  headerText: { fontSize: 20, marginLeft: 8 },
  userHandContainer: {
    height: 144,
  },
});

export default PresidentHand;
