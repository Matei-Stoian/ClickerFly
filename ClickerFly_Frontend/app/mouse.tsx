import { View, Text, StyleSheet, ToastAndroid, Button, Pressable } from "react-native";
import TouchPad from "../components/TouchPad";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { clickType, MouseEventType } from "../types/MouseEvent";
import AntDesign from '@expo/vector-icons/AntDesign';
const MouseScreen: React.FC = () => {

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();
    const { ipAddr } = useLocalSearchParams();
    const address = `ws://${ipAddr}:8080/ws`;

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    console.log(address);

    useFocusEffect(useCallback(() => {

        const ws = new WebSocket(address);

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            ToastAndroid.show("WebSocket connection opened", ToastAndroid.SHORT);
        };
        ws.onerror = e => {
            console.log(e.message);
        }
        ws.onclose = (e) => {
            // connection closed
            console.log(e.code, e.reason);
            console.log('WebSocket cloesed');
            ToastAndroid.show('WebSocket cloesed', ToastAndroid.SHORT)
        };
        setSocket(ws);
        return () => {
            router.replace('/')
            ws.close()
        }

    }, []));


    const handleOnMove = (x: number, y: number) => {




        const data: MouseEventType = { dx: x, dy: y };
        const dataJson = JSON.stringify(data);
        socket?.send(dataJson);
        console.log("Sent mouse move:", dataJson);


    }

    const handleLeftClick = () => {
        const data: MouseEventType = { dx: 0, dy: 0, clickType: clickType.LEFT };
        const dataJson = JSON.stringify(data);
        console.log(dataJson)
        socket?.send(dataJson);
    }
    const handleMiddleClick = () => {
        const data: MouseEventType = { dx: 0, dy: 0, clickType: clickType.MIDDLE };
        const dataJson = JSON.stringify(data);
        console.log(dataJson)
        socket?.send(dataJson);
    }
    const handleRightClick = () => {
        const data: MouseEventType = { dx: 0, dy: 0, clickType: clickType.RIGHT };
        const dataJson = JSON.stringify(data);
        console.log(dataJson)
        socket?.send(dataJson);
    }


    const handleHomeMenu = () => {
        router.push('/')
    }

    return (<View style={styles.container}>
        <View style={styles.goback_cointer}>
            <Pressable style={styles.goback} onPress={handleHomeMenu}>
                <AntDesign name="arrowleft" size={24} color="black" />
                <Text style={{
                    marginLeft: 8, // Adds some space between the icon and the text
                    fontSize: 16,
                    color: 'black',
                }}> Go back</Text>
            </Pressable>
        </View>
        <Text>{ipAddr}</Text>
        <View style={styles.clickWarper}>
            <Pressable style={styles.leftClick} onPress={handleLeftClick} />
            <Pressable style={styles.middleClick} onPress={handleMiddleClick} />
            <Pressable style={styles.leftClick} onPress={handleRightClick} />
        </View>
        <View style={styles.touchpadWrapper}>
            <TouchPad onMove={handleOnMove} />
        </View>
    </View>)
};
const styles = StyleSheet.create({
    container: {
        flex: 1,                // Take up full screen height
        justifyContent: 'flex-end',  // Push the touchpad to the bottom
        paddingBottom: 20,      // Optional: Add space at the bottom
    },
    text: {
        textAlign: 'center',
        marginVertical: 20,
    },
    touchpadWrapper: {

        width: '100%',
        height: 400,             // Define touchpad height
        backgroundColor: '#eee',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 0,
    },
    leftClick: {


        width: 150,
        height: 100,
        backgroundColor: '#eee',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 0,
    },
    middleClick: {


        width: 60,
        height: 100,
        backgroundColor: '#eee',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 0,
    },
    clickWarper: {

        flexDirection: 'row',        // Horizontal layout
        justifyContent: 'space-between',  // Adjust spacing between buttons
        alignItems: 'center',
        marginBottom: 10,
    },
    goback: {
        flexDirection: 'row', // Aligns icon and text horizontally
        alignItems: 'center', // Vertically center both icon and text
        padding: 10,

    },
    goback_cointer: {
        position: 'absolute', // Makes the container position absolute
        top: 20, // Position it 20 units from the top
        left: 20, // Position it 20 units from the left
        zIndex: 1, // Ensures it appears above other elements

    }
});
export default MouseScreen;