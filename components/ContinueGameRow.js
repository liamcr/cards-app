import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import ProfileIcon from "../assets/profileIcon.png";
import { getGame } from "../utils/firebaseFunctions";
import GoIcon from "../assets/go.png";

const ContinueGameRow = ({ gameId, playerName, navigation }) => {
  const [gameData, setGameData] = useState(null);

  const gameTypeMapping = {
    goFish: "Go Fish"
  };

  const getGameStatus = () => {
    if (gameData.started) {
      return "Playing";
    } else if (gameData.finished) {
      return "Finished";
    } else {
      return "Waiting";
    }
  };

  const goToGame = () => {
    if (gameData !== null) {
      if (!gameData.started) {
        navigation.navigate("Waiting Room", {
          gameId: gameId,
          name: playerName,
          isCreator: gameData.players[0].name === playerName
        });
      } else if (!gameData.finished) {
        navigation.navigate("Gameplay", {
          gameId: gameId,
          name: playerName
        });
      } else {
        navigation.navigate("GameEnd", {
          gameId: gameId,
          name: playerName
        });
      }
    }
  };

  if (gameData === null) {
    getGame(gameId).then(data => {
      setGameData(data);
    });
  }

  return (
    <TouchableOpacity style={styles.rowContainer} onPress={goToGame}>
      <View>
        <View style={styles.idAndNameContainer}>
          <Text style={styles.gameId}>{gameId}</Text>
          <Text style={styles.playerName}>{playerName}</Text>
        </View>
        <View style={styles.gameAndStatusContainer}>
          {gameData === null ? (
            <View style={styles.gameStatusPlaceholder} />
          ) : (
            <Text>{`${
              gameTypeMapping[gameData.game]
            } • ${getGameStatus()}`}</Text>
          )}
        </View>
        <View style={styles.numPlayersContainer}>
          <Image source={ProfileIcon} style={{ height: 16, width: 16 }} />
          {gameData === null ? (
            <View style={styles.numPlayersPlaceholder} />
          ) : (
            <Text style={styles.numPlayersText}>{`${
              gameData.players.length
            } / 6`}</Text>
          )}
        </View>
      </View>
      <Image source={GoIcon} style={{ height: 32, width: 32 }} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    margin: 4,
    elevation: 5,
    borderColor: "#BABABA"
  },
  idAndNameContainer: {
    display: "flex",
    flexDirection: "row"
  },
  gameId: {
    fontSize: 16
  },
  playerName: {
    fontSize: 16,
    color: "#888888",
    marginLeft: 8
  },
  gameAndStatusContainer: {
    marginTop: 4
  },
  numPlayersContainer: {
    marginTop: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  gameStatusPlaceholder: {
    height: 16,
    width: 96,
    backgroundColor: "#DDDDDD"
  },
  numPlayersPlaceholder: {
    height: 16,
    width: 32,
    backgroundColor: "#DDDDDD",
    marginLeft: 4
  },
  numPlayersText: {
    marginLeft: 4
  }
});

export default ContinueGameRow;
