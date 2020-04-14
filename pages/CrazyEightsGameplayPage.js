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
import OpponentState from "../components/OpponentState";
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
} from "../utils/firebaseFunctions";
import theme from "../styles/theme.style";

const CrazyEightsGameplayPage = ({ route, navigation }) => {
  const { gameId, name } = route.params;
  const [gameState, setGameState] = useState(null);
  const [enableDeck, setEnableDeck] = useState(false);
  const [drawCardModalVisible, setDrawCardModalVisible] = useState(false);
  const [chooseSuitModalVisible, setChooseSuitModalVisible] = useState(false);

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
              } else if (
                newGameState.currentCard !== null &&
                newGameState.players[newGameState.turn].hand.filter(
                  (card) =>
                    newGameState.currentCard.rank === card.rank ||
                    newGameState.currentCard.suit === card.suit ||
                    card.rank === "8"
                ).length === 0 &&
                (newGameState.cardsPlayed.length === 0 ||
                  newGameState.cardsPlayed[newGameState.cardsPlayed.length - 1]
                    .rank !== "8")
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

  const onPressCard = (rank, suit) => {
    if (gameState.players[gameState.turn].name === name) {
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
              onPress={() => {
                setEnableDeck(false);
                takeFromPond(gameId, name).then((cardDrawn) => {
                  if (
                    gameState.currentCard !== null &&
                    gameState.currentCard.rank !== cardDrawn.rank &&
                    gameState.currentCard.suit !== cardDrawn.suit &&
                    cardDrawn.rank !== "8"
                  ) {
                    finishTurnCE(gameId, gameState).then(() => {
                      console.log("Turn finished");
                    });
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

          {gameState.players
            .filter((player) => player.name !== name)
            .map((player, index) => (
              <OpponentState opponent={player} index={index} key={index} />
            ))}
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
          visible={chooseSuitModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Choose a suit:</Text>
              <View style={styles.suitsContainer}>
                <TouchableOpacity onPress={() => onChooseSuit("diamonds")}>
                  <Text style={styles.modalBody}>♦</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("hearts")}>
                  <Text style={styles.modalBody}>♥</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("spades")}>
                  <Text style={styles.modalBody}>♠</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("clubs")}>
                  <Text style={styles.modalBody}>♣</Text>
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
  modalClose: {
    fontSize: 16,
    marginTop: 4,
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
