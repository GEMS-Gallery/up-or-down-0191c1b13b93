import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress } from '@mui/material';

const BitcoinPrice: React.FC = () => {
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      const data = await response.json();
      setPrice(data.data.rates.USD);
      setLoading(false);
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

  return (
    <div className="mb-4 text-center">
      <Typography variant="h6">Bitcoin Price (USD)</Typography>
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <Typography variant="body1">${price}</Typography>
      )}
    </div>
  );
};

export default BitcoinPrice;
