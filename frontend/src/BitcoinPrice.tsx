import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const BitcoinPrice: React.FC = () => {
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(60);

  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      const data = await response.json();
      setPrice(data.data.rates.USD);
      setLoading(false);
      setTimer(60);
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();
    const interval = setInterval(fetchBitcoinPrice, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 60));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  return (
    <>
      <Typography variant="h2" className="bitcoin-price">
        {loading ? 'Loading...' : `$${parseFloat(price || '0').toFixed(2)}`}
      </Typography>
      <Typography variant="h6" className="timer">
        Next update in: {timer}s
      </Typography>
    </>
  );
};

export default BitcoinPrice;
