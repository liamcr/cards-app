import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList
} from "react-native";
import theme from "../styles/theme.style";
import ContinueGameRow from "../components/ContinueGameRow";
import { getLocalData } from "../utils/firebaseFunctions";

const ContinueGame = ({ navigation }) => {
  const [localGames, setLocalGames] = useState(null);

  if (localGames === null) {
    getLocalData().then(data => {
      setLocalGames(data);
    });
  }

  return (
    <View style={styles.pageContainer}>
      <Text style={styles.title}>Continue Game</Text>
      <View style={styles.gameListContainer}>
        {localGames === null ? (
          <ActivityIndicator color={theme.PRIMARY_COLOUR} />
        ) : (
          <FlatList
            data={Object.keys(localGames)}
            renderItem={({ item }) => (
              <ContinueGameRow
                gameId={item}
                playerName={localGames[item]}
                navigation={navigation}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    height: "100%"
  },
  title: {
    fontSize: 32
  },
  gameListContainer: {
    height: "50%",
    width: "70%",
    display: "flex",
    justifyContent: "center"
  }
});

export default ContinueGame;
