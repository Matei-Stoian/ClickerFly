/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  useColorScheme,
  View,
} from 'react-native';
import Zeroconf from 'react-native-zeroconf'
import { Service } from 'react-native-zeroconf';
const zeroconf = new Zeroconf();

function App(): React.JSX.Element {

  const [services,setServices] = useState<Service[]>([])

  useEffect(()=>{
    zeroconf.on('start', () => {
      ToastAndroid.show("Scanning has started",ToastAndroid.SHORT)
    })
    zeroconf.on('stop',()=>{
      ToastAndroid.show("Scanning has stoped",ToastAndroid.SHORT)
    })
    zeroconf.on('resolved', (service) => {
      console.log('Service found:', service);
      setServices((prevServices) => [...prevServices, service]);
    });
    zeroconf.scan('_http._tcp', 'local.');
    return () => {
      zeroconf.stop()
    };
  },[])

  return(
    <View style={styles.container}>
    <Text style={styles.title}>Discovered Services</Text>
    <FlatList
      data={services}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <View style={styles.serviceItem}>
          <Text>{item.name}</Text>
          <Text>{item.addresses.join(', ')}</Text>
        </View>
      )}
    />
  </View>
  )
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  serviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default App;
