import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { TextField, Typography, CircularProgress, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import BitcoinPrice from './BitcoinPrice';

function App() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [canBet, setCanBet] = useState(true);
  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    setLoading(true);
    try {
      const result = await backend.initializeWallet();
      if ('ok' in result) {
        setBalance(Number(result.ok));
      }
    } catch (error) {
      console.error('Error initializing wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async () => {
    setLoading(true);
    try {
      const result = await backend.getBalance();
      if ('ok' in result) {
        setBalance(Number(result.ok));
      }
    } catch (error) {
      console.error('Error getting balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async (data: { amount: number }, choice: boolean) => {
    if (!canBet) {
      setGameResult("Betting is closed for this round");
      return;
    }
    setLoading(true);
    setGameResult(null);
    try {
      const result = await backend.placeBet(BigInt(data.amount), choice);
      if ('ok' in result) {
        setGameResult("Bet placed successfully. Waiting for next price update.");
        updateBalance();
      } else {
        setGameResult('Error: ' + result.err);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      setGameResult('Error placing bet');
    } finally {
      setLoading(false);
      reset();
    }
  };

  const handleBetResult = (won: boolean, newBalance: number) => {
    setBalance(newBalance);
    setGameResult(won ? "You won! Your balance has been doubled." : "You lost. Better luck next time!");
  };

  return (
    <Box className="game-container">
      <div className="balance-display">
        Balance: {balance !== null ? `${balance} $BET` : 'Loading...'}
      </div>
      <div className="game-panel">
        <Typography variant="h4" className="text-center mb-6">Up or Down Game</Typography>
        
        <form onSubmit={handleSubmit((data) => {})}>
          <Controller
            name="amount"
            control={control}
            defaultValue=""
            rules={{ required: 'Amount is required', min: 1 }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Bet Amount"
                type="number"
                fullWidth
                error={!!error}
                helperText={error?.message}
                className="mb-4"
              />
            )}
          />
        </form>

        {loading && <CircularProgress className="mx-auto block" />}

        {gameResult && (
          <Typography variant="h6" className={`text-center mt-4 bet-result ${gameResult.includes("won") ? "win" : "lose"}`}>
            {gameResult}
          </Typography>
        )}

        <div className="card-container">
          <div className="card card-up" onClick={handleSubmit((data) => placeBet(data, true))}>
            <ArrowUpward fontSize="large" />
            <span>Up</span>
          </div>
          <div className="card card-down" onClick={handleSubmit((data) => placeBet(data, false))}>
            <ArrowDownward fontSize="large" />
            <span>Down</span>
          </div>
        </div>
      </div>

      <div className="casino-table">
        <BitcoinPrice setCanBet={setCanBet} onBetResult={handleBetResult} />
      </div>
    </Box>
  );
}

export default App;
