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

const ContinueGame = () => {
  const [localGames, setLocalGames] = useState(null);

  return (
    <View style={styles.pageContainer}>
      <Text style={styles.title}>Continue Game</Text>
      <View style={styles.gameListContainer}>
        {localGames === null ? (
          <ActivityIndicator color={theme.PRIMARY_COLOUR} />
        ) : (
          <FlatList
            data={localGames}
            renderItem={({ item }) => <ContinueGameRow gameId={item} />}
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
