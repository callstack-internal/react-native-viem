import './polyfills';
import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, View} from 'react-native';
import HomePage from './src/pages/HomePage';
import WalletClientContextProvider from './src/contexts/WalletClientContext';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <WalletClientContextProvider>
        <HomePage />
      </WalletClientContextProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
});
