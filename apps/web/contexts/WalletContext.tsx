'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';

interface WalletContextValue {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Restore previously connected account on mount
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts[0]) setAddress(accounts[0]);
    }).catch(() => {});

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] ?? null);
    };
    eth.on('accountsChanged', handleAccountsChanged);
    return () => eth.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      toast.error('未检测到 MetaMask，请先安装钱包插件');
      return;
    }
    setConnecting(true);
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts[0]) {
        setAddress(accounts[0]);
        toast.success('钱包已连接');
      }
    } catch (err: any) {
      if (err.code === 4001) {
        toast.error('用户取消了连接');
      } else {
        toast.error('连接钱包失败');
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    toast('已断开钱包连接', { icon: '🔌' });
  }, []);

  return (
    <WalletContext.Provider value={{ address, connecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
