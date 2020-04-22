import React, { useEffect, useState } from "react";
import { StyleSheet, Animated } from "react-native";
import themeStyle from "../styles/theme.style";
import Checkmark from "../assets/checkmark.png";

const CardOverlay = ({ selected }) => {
  const [opacity] = useState(new Animated.Value(0.0));
  const [circleScale] = useState(new Animated.Value(0));
  const [imageScale] = useState(new Animated.Value(0));

  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1.0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 1.0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(imageScale, {
          toValue: 1.0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        opacity.setValue(1.0);
        circleScale.setValue(1.0);
        imageScale.setValue(1.0);
      });
    } else {
      Animated.sequence([
        Animated.spring(imageScale, {
          toValue: 0.0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(circleScale, {
          toValue: 0.0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          opacity.setValue(0.0);
          circleScale.setValue(0.0);
          imageScale.setValue(0.0);
        }),
      ]);
    }
  }, [selected]);

  return (
    <Animated.View style={{ ...styles.cardSelectedOverlay, opacity: opacity }}>
      <Animated.View
        style={{
          ...styles.checkMarkContainer,
          transform: [{ scaleX: circleScale }, { scaleY: circleScale }],
        }}
      >
        <Animated.Image
          source={Checkmark}
          style={{
            height: 24,
            width: 24,
            transform: [{ scaleX: imageScale }, { scaleY: imageScale }],
          }}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardSelectedOverlay: {
    backgroundColor: "hsla(0, 0%, 0%, 0.5)",
    height: 128,
    width: 92,
    borderRadius: 4,
    position: "absolute",
    margin: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  checkMarkContainer: {
    height: 48,
    width: 48,
    backgroundColor: themeStyle.PRIMARY_COLOUR,
    borderRadius: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CardOverlay;
