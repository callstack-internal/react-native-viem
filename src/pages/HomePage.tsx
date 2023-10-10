import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {formatEther} from 'viem';
import {goerli, mainnet} from 'viem/chains';
import {publicClient} from '../clients/public';
import {useWalletClient} from '../contexts/WalletClientContext';

type NetworkData = {
  blockNumber: bigint;
  gasPrice: bigint;
};

type WalletData = {
  address: `0x${string}`;
  balance: bigint;
  chainId: number;
};

export const CHAINS: {[key: number]: string} = {
  1: 'Mainnet',
  5: 'Goerli',
} as const;

export default function HomePage() {
  const {provider, walletClient} = useWalletClient();
  const [networkData, setNetworkData] = useState<NetworkData>({
    blockNumber: BigInt(0),
    gasPrice: BigInt(0),
  });
  const [walletData, setWalletData] = useState<WalletData>();

  useEffect(() => {
    const getNetworkData = async () => {
      const [blockNumber, gasPrice] = await Promise.all([
        publicClient.getBlockNumber(),
        publicClient.getGasPrice(),
      ]);

      setNetworkData({blockNumber, gasPrice});
    };

    void getNetworkData();
  }, []);

  const onConnect = async () => {
    const [address] = await walletClient.requestAddresses();
    const balance = await publicClient.getBalance({address});
    const chainId = await walletClient.getChainId();

    setWalletData({address, balance, chainId});
  };

  const onDisconnect = () => {
    provider.handleDisconnect({terminate: true});
    setWalletData(undefined);
  };

  const onSwitchChain = async (chainId: number) => {
    await walletClient.switchChain({id: chainId});
    const newChainId = await walletClient.getChainId();

    if (walletData) {
      setWalletData({...walletData, chainId: newChainId});
    }
  };

  return (
    <View style={styles.container}>
      <Text numberOfLines={1}>
        Block number: {String(networkData.blockNumber)}
      </Text>
      <Text numberOfLines={1}>
        Gas price: {formatEther(networkData.gasPrice)} ETH
      </Text>

      {walletData && (
        <View style={styles.block}>
          <Text numberOfLines={1}>Address: {walletData.address}</Text>
          <Text numberOfLines={1}>Chain: {CHAINS[walletData.chainId]}</Text>
          <Text numberOfLines={1}>
            Balance: {formatEther(walletData.balance)} ETH
          </Text>
        </View>
      )}

      <View style={styles.block}>
        <Button title="Connect" onPress={onConnect} />
        <Button
          title="Switch to Ethereum"
          onPress={() => onSwitchChain(mainnet.id)}
        />
        <Button
          title="Switch to Goerli"
          onPress={() => onSwitchChain(goerli.id)}
        />
        <Button title="Disconnect" onPress={onDisconnect} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: {
    marginTop: 32,
  },
});
