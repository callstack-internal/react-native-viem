import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import {MetaMaskSDK, SDKProvider} from '@metamask/sdk';
import {createWalletClient, custom, WalletClient} from 'viem';
import {mainnet} from 'viem/chains';
import {Linking} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

type WalletClientContextType = {
  provider: SDKProvider;
  walletClient: WalletClient;
};

const MMSDK = new MetaMaskSDK({
  openDeeplink: link => {
    void Linking.openURL(link);
  },
  timer: BackgroundTimer,
  dappMetadata: {
    name: 'Callstack',
    url: 'https://callstack.com',
  },
});

const WalletClientContext = createContext({} as WalletClientContextType);

export default function WalletClientContextProvider({
  children,
}: PropsWithChildren) {
  const [state, setState] = useState<WalletClientContextType>();

  useEffect(() => {
    const init = async () => {
      await MMSDK.init();
      const provider = MMSDK.getProvider();
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(provider),
      });

      setState({
        provider,
        walletClient,
      });
    };

    void init();
  }, []);

  if (!state?.walletClient) {
    return null;
  }

  return (
    <WalletClientContext.Provider value={state}>
      {children}
    </WalletClientContext.Provider>
  );
}

export const useWalletClient = () => useContext(WalletClientContext);
