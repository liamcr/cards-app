import React from "react";
import { View, Text } from "react-native";

const ContinueGameRow = ({ gameId }) => {
  return (
    <View>
      <Text>{gameId}</Text>
    </View>
  );
};

export default ContinueGameRow;
