import React from "react";
import { View, FlatList, Text, StyleSheet, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import PairIcon from "../assets/pairIcon.png";

const UserHand = ({ player, renderCard, navigation }) => {
  return (
    <View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{`${player.numPairs} pair${
          player.numPairs !== 1 ? "s" : ""
        }`}</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("PairedCards", { cards: player.pairedCards });
          }}
        >
          <Image source={PairIcon} style={{ width: 50, height: 50 }} />
        </TouchableOpacity>
      </View>
      <View style={styles.userHandContainer}>
        <FlatList
          horizontal
          data={player.hand}
          renderItem={renderCard}
          keyExtractor={(item) => item.strID}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userHandContainer: {
    height: 144,
    backgroundColor: "#F2F2F2",
    marginTop: 8,
  },
  scoreContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingEnd: 16,
    paddingStart: 16,
  },
  scoreText: {
    fontSize: 20,
  },
});

export default UserHand;
