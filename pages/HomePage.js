import React from "react";
import { Image, View, StyleSheet, Button, Alert } from "react-native";
import theme from "../styles/theme.style";
import { cleanLocalStorage } from "../utils/firebaseFunctions";
import Logo from "../assets/logo.png";

const HomePage = ({ navigation }) => {
  cleanLocalStorage();

  const onCreateGame = () => {
    // Create game logic goes here!

    navigation.navigate("Join Game", { isCreator: true });
  };

  const onJoinGame = () => {
    // Join game logic goes here!

    navigation.navigate("Join Game", { isCreator: false });
  };

  return (
    <View style={styles.homePageContainer}>
      {/* TODO: Replace the image URI to our real logo */}
      <Image style={styles.logo} source={Logo} resizeMode="contain" />
      <View style={styles.buttonContainer}>
        <Button
          title="Create Game"
          color={theme.PRIMARY_COLOUR}
          onPress={onCreateGame}
        />
        <Button
          title="Join Game"
          color={theme.PRIMARY_COLOUR}
          onPress={onJoinGame}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  homePageContainer: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
  logo: {
    height: "20%",
    width: "70%",
  },
  buttonContainer: {
    width: "33%",
    display: "flex",
    justifyContent: "space-between",
    height: "15%",
  },
});

export default HomePage;
