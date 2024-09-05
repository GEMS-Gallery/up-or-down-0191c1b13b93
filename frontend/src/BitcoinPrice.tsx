import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { backend } from 'declarations/backend';

interface BitcoinPriceProps {
  setCanBet: (canBet: boolean) => void;
}

const BitcoinPrice: React.FC<BitcoinPriceProps> = ({ setCanBet }) => {
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(60);

  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      const data = await response.json();
      const newPrice = parseFloat(data.data.rates.USD);
      setPrice(newPrice.toFixed(2));
      setLoading(false);
      setTimer(60);
      await backend.updatePrice(newPrice);
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
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          return 60;
        }
        if (prevTimer === 31) {
          setCanBet(false);
        }
        if (prevTimer === 60) {
          setCanBet(true);
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [setCanBet]);

  return (
    <>
      <Typography variant="h2" className="bitcoin-price">
        {loading ? 'Loading...' : `$${price}`}
      </Typography>
      <Typography variant="h6" className="timer">
        Next update in: {timer}s
      </Typography>
      <Typography variant="body1" className="betting-message">
        {timer > 30 ? "You can place bets for the next " + (timer - 30) + " seconds" : "Betting is closed for this round"}
      </Typography>
    </>
  );
};

export default BitcoinPrice;
