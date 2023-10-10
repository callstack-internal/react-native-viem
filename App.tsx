import './polyfills';
import React, {useEffect, useState} from 'react';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View} from 'react-native';
import {createPublicClient, formatEther, http} from 'viem';
import {mainnet} from 'viem/chains';

type Data = {
  blockNumber: bigint;
  gasPrice: bigint;
};

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export default function App() {
  const [publicData, setPublicData] = useState<Data>({
    blockNumber: BigInt(0),
    gasPrice: BigInt(0),
  });

  useEffect(() => {
    const getPublicData = async () => {
      const [blockNumber, gasPrice] = await Promise.all([
        publicClient.getBlockNumber(),
        publicClient.getGasPrice(),
      ]);

      setPublicData({blockNumber, gasPrice});
    };

    void getPublicData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text>Block number: {String(publicData.blockNumber)}</Text>
      <Text>Gas price: {formatEther(publicData.gasPrice)} ETH</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
