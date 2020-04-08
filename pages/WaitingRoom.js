import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import theme from "../styles/theme.style";
import { FlatList } from "react-native-gesture-handler";
import {
  cancelGame,
  leaveGame,
  removeGameLocally,
  startGame,
} from "../utils/firebaseFunctions";
import firestore from "@react-native-firebase/firestore";

const WaitingRoom = ({ route, navigation }) => {
  const { isCreator, gameId, name } = route.params;

  const [players, setPlayers] = useState([]);

  // Boolean that is checked when a user presses "Leave Game"
  // This removes "state update on unmounted component" warning
  let playerLeft = false;

  const onStart = () => {
    // Implement start game functionality here

    console.log("Game Starting");
    startGame(gameId);
  };

  const onCancel = () => {
    // Implement cancel game functionality here

    console.log("Cancelling game");
    Alert.alert(
      "Are You Sure?",
      "You are about to cancel this game for everyone.",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Didn't cancel game!");
          },
        },
        {
          text: "OK",
          onPress: () => {
            cancelGame(gameId);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const onLeave = () => {
    // Implement leave game functionality here

    console.log("Leaving game");
    Alert.alert(
      "Are You Sure?",
      "You are about to remove yourself from this game.",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Didn't leave game!");
          },
        },
        {
          text: "OK",
          onPress: () => {
            playerLeft = true;

            // Leave the game on Firebase, remove the hame locally,
            // then take the user back to home page
            leaveGame(name, gameId).then(() => {
              removeGameLocally(gameId)
                .then(() => {
                  navigation.goBack();
                })
                .catch((error) => {
                  console.log(error.message);
                });
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          let updatedData = doc.data();
          let newDocPlayers = updatedData.players;

          if (!playerLeft) {
            setPlayers(newDocPlayers);
          }

          if (updatedData.started) {
            navigation.replace("Gameplay", { gameId: gameId, name: name });
          }
        } else {
          navigation.navigate("Home");
        }
      });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.waitingRoomContainer}>
      <View style={styles.codeContainer}>
        <Text style={styles.codeText}>Your Code</Text>
        <Text style={styles.codeText}>{gameId}</Text>
      </View>
      <View style={styles.listContainer}>
        {players.length === 0 ? (
          <ActivityIndicator color={theme.PRIMARY_COLOUR} />
        ) : (
          <FlatList
            data={players}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    ...styles.listElement,
                    borderColor:
                      item.name === name ? theme.PRIMARY_COLOUR : "#BABABA",
                  }}
                >
                  <Text style={styles.playerName}>{item.name}</Text>
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        {isCreator && (
          <Button
            color={theme.PRIMARY_COLOUR}
            title={"Start Game"}
            disabled={players.length < 2}
            onPress={onStart}
          />
        )}
        {isCreator && (
          <Button
            color={theme.PRIMARY_COLOUR}
            title={"Cancel Game"}
            onPress={onCancel}
          />
        )}
        {!isCreator && (
          <Button
            color={theme.PRIMARY_COLOUR}
            title={"Leave Game"}
            onPress={onLeave}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  waitingRoomContainer: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
  codeContainer: {
    width: "60%",
  },
  codeText: {
    fontSize: 32,
    textAlign: "center",
  },
  listContainer: {
    height: "30%",
    width: "60%",
  },
  listElement: {
    backgroundColor: "white",
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    margin: 4,
    elevation: 5,
  },
  playerName: {
    fontSize: 20,
  },
  buttonContainer: {
    height: "15%",
    display: "flex",
    justifyContent: "space-between",
  },
});

export default WaitingRoom;
