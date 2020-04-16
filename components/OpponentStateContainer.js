import React from "react";
import OpponentState from "./OpponentState";

const OpponentStateContainer = ({ userIndex, playerArr }) => {
  const numOpponents = playerArr.length - 1;
  let opponentStates = {};
  let opponentsAdded = 0;
  let i = (userIndex + 1) % playerArr.length;

  while (i !== userIndex) {
    if (numOpponents === 1) {
      opponentStates[i.toString()] = "opponentContainerC";
    } else if (numOpponents === 2) {
      if (opponentsAdded === 0) {
        opponentStates[i.toString()] = "opponentContainerNW";
        opponentsAdded++;
      } else if (opponentsAdded === 1) {
        opponentStates[i.toString()] = "opponentContainerNE";
        opponentsAdded++;
      }
    } else if (numOpponents === 3) {
      if (opponentsAdded === 0) {
        opponentStates[i.toString()] = "opponentContainerW";
        opponentsAdded++;
      } else if (opponentsAdded === 1) {
        opponentStates[i.toString()] = "opponentContainerC";
        opponentsAdded++;
      } else if (opponentsAdded === 2) {
        opponentStates[i.toString()] = "opponentContainerE";
        opponentsAdded++;
      }
    } else if (numOpponents === 4) {
      if (opponentsAdded === 0) {
        opponentStates[i.toString()] = "opponentContainerW";
        opponentsAdded++;
      } else if (opponentsAdded === 1) {
        opponentStates[i.toString()] = "opponentContainerNW";
        opponentsAdded++;
      } else if (opponentsAdded === 2) {
        opponentStates[i.toString()] = "opponentContainerNE";
        opponentsAdded++;
      } else if (opponentsAdded === 3) {
        opponentStates[i.toString()] = "opponentContainerE";
        opponentsAdded++;
      }
    } else if (numOpponents === 5) {
      if (opponentsAdded === 0) {
        opponentStates[i.toString()] = "opponentContainerW";
        opponentsAdded++;
      } else if (opponentsAdded === 1) {
        opponentStates[i.toString()] = "opponentContainerNW";
        opponentsAdded++;
      } else if (opponentsAdded === 2) {
        opponentStates[i.toString()] = "opponentContainerC";
        opponentsAdded++;
      } else if (opponentsAdded === 3) {
        opponentStates[i.toString()] = "opponentContainerNE";
        opponentsAdded++;
      } else if (opponentsAdded === 4) {
        opponentStates[i.toString()] = "opponentContainerE";
        opponentsAdded++;
      }
    }

    i = (i + 1) % playerArr.length;
  }

  return (
    <>
      {Object.keys(opponentStates).map((index) => (
        <OpponentState
          opponent={playerArr[parseInt(index)]}
          styleName={opponentStates[index]}
          key={index}
        />
      ))}
    </>
  );
};

export default OpponentStateContainer;
