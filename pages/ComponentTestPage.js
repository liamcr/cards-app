import React from "react";
import PresidentHand from "../components/PresidentHand";

const ComponentTestPage = () => {
  const player = {
    name: "Liam",
    hand: [
      {
        rank: "2",
        suit: "hearts",
      },
      {
        rank: "4",
        suit: "spades",
      },
      {
        rank: "6",
        suit: "diamonds",
      },
      {
        rank: "4",
        suit: "diamonds",
      },
      {
        rank: "A",
        suit: "spades",
      },
    ],
  };

  const gameId = "6969";

  return <PresidentHand gameId={gameId} playerObj={player} />;
};

export default ComponentTestPage;
