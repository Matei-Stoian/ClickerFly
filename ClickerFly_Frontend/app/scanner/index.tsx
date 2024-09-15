import { SafeAreaView } from "react-native-safe-area-context"
import { Dimensions, Platform, Pressable, StyleSheet, Text } from "react-native"
import { Stack, useRouter } from "expo-router"
import { CameraView } from "expo-camera"
import { useState } from "react"
import { BarCodeScanningResult } from "expo-camera/build/legacy/Camera.types"
import { Overlay } from "./Overlay"
import { StatusBar } from "expo-status-bar"

const { width, height } = Dimensions.get('window');

const Home: React.FC = () => {
    const router = useRouter();

    const [hasScanned, setHasScanned] = useState(false);

    const handleBarCodeScanned = (result: BarCodeScanningResult) => {
        if (hasScanned) return;

        setHasScanned(true);
        const { data } = result;

        setTimeout(async () => {
            console.log(data)
            await router.push({
                pathname: '/mouse',
                params: { ipAddr: data }
            })
        }, 500);
    }


    return (
        <SafeAreaView style={StyleSheet.absoluteFillObject}>
            <Stack.Screen options={{ title: 'Scanner', headerShown: false }} />
            {Platform.OS === 'android' ? <StatusBar hidden /> : null}
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"]
                }}
                onBarcodeScanned={hasScanned ? undefined : handleBarCodeScanned}
            />
            
            <Overlay />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    
})
export default Home;