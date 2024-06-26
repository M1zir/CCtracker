import React, { createContext, useContext, useEffect, useState } from 'react';
import { CryptoData, subscribeToCryptoData } from '../Api/cryptoApi';


interface CryptoContextType {
  cryptoData: CryptoData[];
  coinData: unknown;
  getCoinData: (coinId: string) => void;
  getCoinHistory: (coinId: string, days: number, vs_currency: string) => void;
  loading: boolean;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [coinData, setCoinData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCryptoData(
      (newData) => {
        setCryptoData(prevData => {
          const index = prevData.findIndex(item => item.symbol === newData.symbol);
          if (index > -1) {
            const updatedData = [...prevData];
            updatedData[index] = newData;
            return updatedData;
          } else {
            return [...prevData, newData];
          }
        });
        setLoading(false);
      },
      () => setLoading(true)
    );

    return () => unsubscribe();
  }, []);

  const getCoinData = async (coinId: string) => {
    try {
      const detailedData = await setCoinData(coinId);
      setCoinData(detailedData);
    } catch (error) {
      console.error('Failed to fetch detailed coin data:', error);
    }
  };

  const getCoinHistory = async (coinId: string, days: number = 30, vs_currency: string = 'usd') => {
    try {
      const history = await getCoinHistory(coinId, days, vs_currency);
      setCoinData(history);
    } catch (error) {
      console.error('Failed to fetch coin history:', error);
    }
  };

  

  return (
    <CryptoContext.Provider value={{
      cryptoData,
      coinData,
      getCoinData,
      getCoinHistory,
      loading,
    }}>
      {children}
    </CryptoContext.Provider>
  );
};
console.log(CryptoContext.Provider)
export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};