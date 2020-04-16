import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ToastAndroid,
} from "react-native";
import LoadingOverlay from "../components/LoadingOverlay";
import firestore from "@react-native-firebase/firestore";
import Deck from "../components/Deck";
import UserHand from "../components/UserHand";
import AnimatedCard from "../components/AnimatedCard";
import UserPrompt from "../components/UserPrompt";
import Card from "../components/Card";
import {
  playCardCE,
  takeFromPond,
  finishTurnCE,
  endGame,
  takeCardFromHandCE,
  pickUpCE,
} from "../utils/firebaseFunctions";
import theme from "../styles/theme.style";
import OpponentStateContainer from "../components/OpponentStateContainer";

const CrazyEightsGameplayPage = ({ route, navigation }) => {
  const { gameId, name } = route.params;
  const [gameState, setGameState] = useState(null);
  const [enableDeck, setEnableDeck] = useState(false);
  const [drawCardModalVisible, setDrawCardModalVisible] = useState(false);
  const [chooseSuitModalVisible, setChooseSuitModalVisible] = useState(false);
  const [pickUpModalVisible, setPickUpModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const newGameState = doc.data();
          setGameState(newGameState);

          if (newGameState.finished) {
            navigation.replace("GameEnd Crazy Eights", {
              gameId: gameId,
              name: name,
            });
          } else {
            if (
              newGameState.players.filter((player) => player.hand.length > 0)
                .length === 1 &&
              (newGameState.cardsPlayed.length === 0 ||
                newGameState.cardsPlayed[newGameState.cardsPlayed.length - 1]
                  .rank !== "8")
            ) {
              endGame(gameId);
            } else if (newGameState.players[newGameState.turn].name === name) {
              if (newGameState.players[newGameState.turn].hand.length === 0) {
                finishTurnCE(gameId, newGameState);
              } else if (newGameState.toPickUp === 5) {
                setPickUpModalVisible(true);
              } else if (
                newGameState.toPickUp > 0 &&
                newGameState.players[newGameState.turn].hand.findIndex(
                  (card) => card.rank === "2"
                ) === -1
              ) {
                setPickUpModalVisible(true);
              } else if (
                newGameState.currentCard !== null &&
                newGameState.players[newGameState.turn].hand.filter(
                  (card) =>
                    newGameState.currentCard.rank === card.rank ||
                    newGameState.currentCard.suit === card.suit ||
                    card.rank === "8"
                ).length === 0 &&
                !newGameState.choosingSuit
              ) {
                setEnableDeck(true);
                setDrawCardModalVisible(true);
              }
            }
          }
        }
      });

    return () => unsubscribe();
  }, []);

  const onChooseSuit = (suit) => {
    setChooseSuitModalVisible(false);
    playCardCE(gameId, name, "8", suit);
  };

  const onPickUp = (toPickUp) => {
    setPickUpModalVisible(false);
    pickUpCE(gameId, name, toPickUp);
  };

  const onPressCard = (rank, suit) => {
    if (gameState.players[gameState.turn].name === name) {
      if (
        gameState.currentCard !== null &&
        gameState.toPickUp > 0 &&
        gameState.currentCard.rank === "2"
      ) {
        if (rank === "2") {
          playCardCE(gameId, name, rank, suit);
        } else {
          ToastAndroid.show("You have to play your 2", ToastAndroid.SHORT);
        }
      } else {
        if (
          (gameState.currentCard === null ||
            gameState.currentCard.rank === rank ||
            gameState.currentCard.suit === suit) &&
          rank !== "8"
        ) {
          playCardCE(gameId, name, rank, suit);
        } else if (rank === "8") {
          setChooseSuitModalVisible(true);
          takeCardFromHandCE(gameId, name, rank, suit);
        } else {
          ToastAndroid.show("You can't play that card!", ToastAndroid.SHORT);
        }
      }
    }
  };

  if (gameState === null) {
    return (
      <View style={styles.gameplayContainer}>
        <LoadingOverlay isLoading />
      </View>
    );
  } else {
    return (
      <View style={styles.gameplayContainer}>
        <View style={styles.opponentContainer}>
          <View style={styles.cardsContainer}>
            <Deck
              deck={gameState.pond}
              enabled={enableDeck}
              gameId={gameId}
              name={name}
              numPlayers={gameState.players.length}
              onPress={() => {
                setEnableDeck(false);
                takeFromPond(gameId, name).then((cardDrawn) => {
                  if (
                    gameState.currentCard !== null &&
                    gameState.currentCard.rank !== cardDrawn.rank &&
                    gameState.currentCard.suit !== cardDrawn.suit &&
                    cardDrawn.rank !== "8"
                  ) {
                    finishTurnCE(gameId, gameState);
                  }
                });
              }}
              showCount={false}
            />
            <View>
              <View style={styles.noCard}>
                <Text style={styles.noCardText}>No Card Played</Text>
              </View>
              {gameState.currentCard !== null && (
                <View style={styles.playedCard}>
                  <Card
                    rank={gameState.currentCard.rank}
                    suit={gameState.currentCard.suit}
                  />
                </View>
              )}
            </View>
          </View>

          <OpponentStateContainer
            userIndex={gameState.players.findIndex(
              (player) => player.name === name
            )}
            playerArr={gameState.players}
            gameState={gameState}
          />
        </View>
        <View style={styles.userContainer}>
          <UserPrompt gameState={gameState} name={name} />
          <UserHand
            player={gameState.players.find((player) => player.name === name)}
            renderCard={({ item }) => (
              <TouchableOpacity
                onPress={() => onPressCard(item.rank, item.suit)}
              >
                <AnimatedCard card={item} />
              </TouchableOpacity>
            )}
            navigation={navigation}
            showPairs={false}
          />
        </View>
        <Modal
          visible={drawCardModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Uh Oh</Text>
              <Text style={styles.modalBody}>
                Looks like you don't have a card to play! Pick one up from the
                deck!
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setDrawCardModalVisible(false);
                }}
              >
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={pickUpModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Yikes</Text>
              <Text style={styles.modalBody}>{`Looks like you have to pick up ${
                gameState.toPickUp
              } cards 😢`}</Text>
              <TouchableOpacity
                onPress={() => {
                  onPickUp(gameState.toPickUp);
                }}
              >
                <Text style={styles.modalClose}>Pick up cards</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={chooseSuitModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Choose a suit:</Text>
              <View style={styles.suitsContainer}>
                <TouchableOpacity onPress={() => onChooseSuit("diamonds")}>
                  <Text style={styles.modalSuit}>♦</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("hearts")}>
                  <Text style={styles.modalSuit}>♥</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("spades")}>
                  <Text style={styles.modalSuit}>♠</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("clubs")}>
                  <Text style={styles.modalSuit}>♣</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  gameplayContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "100%",
  },
  opponentContainer: {
    height: "50%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
  },
  userContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  noCard: {
    backgroundColor: "white",
    height: 128,
    width: 92,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#BABABA",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  noCardText: {
    color: "#BABABA",
    textAlign: "center",
  },
  playedCard: {
    position: "absolute",
    marginTop: -8,
    marginLeft: -8,
  },
  modalContainer: {
    alignItems: "center",
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: "white",
    maxWidth: "50%",
    padding: 10,
    borderRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  modalBody: {
    fontSize: 16,
  },
  modalSuit: {
    fontSize: 16,
  },
  modalClose: {
    fontSize: 16,
    marginTop: 8,
    color: theme.PRIMARY_COLOUR,
    textAlign: "center",
  },
  suitsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default CrazyEightsGameplayPage;
