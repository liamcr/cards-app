import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomePage from "./pages/HomePage";
import JoinGame from "./pages/JoinGame.js";
import WaitingRoom from "./pages/WaitingRoom";
import GameplayPage from "./pages/GameplayPage";
import PairedCards from "./pages/PairedCards";
import GameEnd from "./pages/GameEnd";
import GoFishRules from "./pages/GoFishRules";
import ContinueGame from "./pages/ContinueGame";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Join Game" component={JoinGame} />
        <Stack.Screen name="Continue Game" component={ContinueGame} />
        <Stack.Screen name="Waiting Room" component={WaitingRoom} />
        <Stack.Screen name="Gameplay" component={GameplayPage} />
        <Stack.Screen name="PairedCards" component={PairedCards} />
        <Stack.Screen name="GoFishRules" component={GoFishRules} />
        <Stack.Screen name="GameEnd" component={GameEnd} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
