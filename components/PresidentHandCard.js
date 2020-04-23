import React from "react";
import { TouchableOpacity } from "react-native";
import Card from "./Card";
import CardOverlay from "./CardOverlay";

const PresidentHandCard = ({ rank, suit, selected, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card rank={rank} suit={suit} />
      <CardOverlay selected={selected} />
    </TouchableOpacity>
  );
};

export default PresidentHandCard;
