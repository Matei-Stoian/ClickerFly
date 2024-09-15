import { useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Pressable } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const HomePage = () => {
    const [ipAddr, setIpAddr] = useState("");
    const router = useRouter();

    const [permmision, requestPermision] = useCameraPermissions();
    const isPermmisionGranted = Boolean(permmision?.granted);


    useFocusEffect(useCallback(() => {
        if (!isPermmisionGranted) {
            requestPermision();
        }
    }, []));

    const handleInputChane = (text: string) => {
        setIpAddr(text);
    }

    const handleClick = () => {
        router.push({
            pathname: '/mouse',
            params: { ipAddr }
        })
    }

    return (<View style={styles.container}>
        <View style={styles.warper1}>
            <TextInput
                style={styles.input}
                value={ipAddr}
                onChangeText={handleInputChane}
                placeholder="Enter machines IP Address"
                keyboardType="numeric"
            />
            <Pressable onPress={() => { router.push('/scanner') }}>
                <MaterialCommunityIcons name="qrcode-scan" size={24} color="black" />
            </Pressable>
        </View>
        <Pressable style={styles.button} onPress={handleClick}>
            <Text style={styles.text}> Connect </Text>
        </Pressable>

    </View>)
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 20,
        fontSize: 16,
        marginRight: 30,

    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warper1: {
        flexDirection: 'row',        // Horizontal layout
        justifyContent: 'space-between',  // Adjust spacing between buttons
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    button: {
        marginTop: 20,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 25,
    }
});
export default HomePage;