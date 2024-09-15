import { useState } from "react";
import { PanResponder, View, StyleSheet } from "react-native";



type TouchPadProps = {
    onMove: (x: number, y: number) => void;
};


const TouchPad: React.FC<TouchPadProps> = ({ onMove }) => {

    const [lastPosition, setLastPositon] = useState({ x: 0, y: 0 })


    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
            const { dx, dy } = gestureState;
            const newPosition = {
                x: lastPosition.x + dx,
                y: lastPosition.y + dy,
            };
            setLastPositon(newPosition);
            onMove(newPosition.x, newPosition.y);
        },
        onPanResponderRelease: () => {
            setLastPositon({ x: 0, y: 0 });
            onMove(lastPosition.x, lastPosition.y);
        }
    })

    return (
            <View style={styles.touchpad} {...panResponder.panHandlers}>
            </View>
    

    )
};
const styles = StyleSheet.create({
    touchpad: {
        width: '100%',
        height: 600,
        backgroundColor: '#eee',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 0,
    }
    });

export default TouchPad;