import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {Address, Chain, formatEther, hexToNumber} from 'viem';
import {mainnet, sepolia} from 'viem/chains';
import {publicClient} from '../clients/public';
import {useWalletClient} from '../contexts/WalletClientContext';

export const CHAINS = [mainnet, sepolia];

export default function HomePage() {
  const {provider, walletClient} = useWalletClient();
  const [blockNumber, setBlockNumber] = useState(BigInt(0));
  const [gasPrice, setGasPrice] = useState(BigInt(0));
  const [isConnected, setIsConnected] = useState(false);
  const [chain, setChain] = useState<Chain>(CHAINS[0]);
  const [address, setAddress] = useState<Address>('0x0000');
  const [balance, setBalance] = useState(BigInt(0));
  const filteredChains = CHAINS.filter(item => item.id !== chain.id);

  useEffect(() => {
    const getNetworkData = async () => {
      const [blockNumber, gasPrice] = await Promise.all([
        publicClient.getBlockNumber(),
        publicClient.getGasPrice(),
      ]);

      setBlockNumber(blockNumber);
      setGasPrice(gasPrice);
    };

    void getNetworkData();
  }, []);

  useEffect(() => {
    const onChainChangedEvent = (arg: unknown) => {
      const data = arg as `0x${string}`;
      const chainId = hexToNumber(data);
      const chain = CHAINS.find(chain => chain.id === chainId) ?? CHAINS[0];
      setChain(chain);
    };

    const onConnectEvent = async (arg: unknown) => {
      const data = arg as {chainId: `0x${string}`};
      onChainChangedEvent(data.chainId);

      const [address] = await walletClient.getAddresses();
      const balance = await publicClient.getBalance({address});

      setAddress(address);
      setBalance(balance);
      setIsConnected(true);
    };

    const onDisconnectEvent = () => {
      setIsConnected(false);
    };

    provider.on('chainChanged', onChainChangedEvent);
    provider.on('connect', onConnectEvent);
    provider.on('disconnect', onDisconnectEvent);

    return () => {
      provider.removeListener('chainChanged', onChainChangedEvent);
      provider.removeListener('connect', onConnectEvent);
      provider.removeListener('disconnect', onDisconnectEvent);
    };
  }, [provider, walletClient]);

  return (
    <View style={styles.container}>
      <Text numberOfLines={1}>Block number: {String(blockNumber)}</Text>
      <Text numberOfLines={1}>Gas price: {formatEther(gasPrice)} ETH</Text>

      {isConnected && (
        <View style={styles.block}>
          <Text numberOfLines={1}>Address: {address}</Text>
          <Text numberOfLines={1}>Balance: {formatEther(balance)} ETH</Text>
        </View>
      )}

      <View style={styles.block}>
        {isConnected ? (
          <>
            <Text style={styles.chainText}>Connected to: {chain.name}</Text>
            {filteredChains.map(chain => (
              <Button
                key={chain.id}
                title={`Switch to ${chain.name}`}
                onPress={() => walletClient.switchChain({id: chain.id})}
              />
            ))}
            <Button
              title="Disconnect"
              onPress={() => provider.handleDisconnect({terminate: true})}
              color="red"
            />
          </>
        ) : (
          <Button
            title="Connect"
            onPress={() => walletClient.requestAddresses()}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  block: {
    marginTop: 32,
  },
  chainText: {
    textAlign: 'center',
  },
});
