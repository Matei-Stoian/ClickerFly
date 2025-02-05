import React, { useRef } from "react";
import { PanResponder, View, StyleSheet } from "react-native";

type TouchPadProps = {
  onMove: (x: number, y: number) => void;
};

const TouchPad: React.FC<TouchPadProps> = ({ onMove }) => {
  // Using refs for mutable values without re-renders
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const initialPositionRef = useRef({ x: 0, y: 0 });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Set the starting point for the gesture
      initialPositionRef.current = lastPositionRef.current;
    },
    onPanResponderMove: (event, gestureState) => {
      const newPosition = {
        x: initialPositionRef.current.x + gestureState.dx,
        y: initialPositionRef.current.y + gestureState.dy,
      };
      lastPositionRef.current = newPosition;
      onMove(newPosition.x, newPosition.y);
    },
    onPanResponderRelease: () => {
      // Example: reset position on release (optional)
      const resetPosition = { x: 0, y: 0 };
      lastPositionRef.current = resetPosition;
      onMove(resetPosition.x, resetPosition.y);
    },
  });

  return <View style={styles.touchpad} {...panResponder.panHandlers} />;
};

const styles = StyleSheet.create({
  touchpad: {
    width: "100%",
    height: 600,
    backgroundColor: "#eee",
    borderColor: "#333",
    borderWidth: 1,
  },
});

export default TouchPad;
