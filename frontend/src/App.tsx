import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Button, TextField, Typography, CircularProgress, Box, Paper } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

function App() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
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
    setLoading(true);
    setGameResult(null);
    try {
      const result = await backend.placeBet(BigInt(data.amount), choice);
      if ('ok' in result) {
        setGameResult(result.ok ? 'You won!' : 'You lost!');
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

  return (
    <Box className="min-h-screen flex items-center justify-center p-4">
      <Paper elevation={3} className="p-8 max-w-md w-full bg-white bg-opacity-90">
        <Typography variant="h4" className="text-center mb-6">Up or Down Game</Typography>
        
        {balance !== null && (
          <Typography variant="h6" className="text-center mb-4">
            Your Balance: {balance} $BET
          </Typography>
        )}

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

          <Box className="flex justify-between mb-4">
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowUpward />}
              onClick={handleSubmit((data) => placeBet(data, true))}
              disabled={loading}
            >
              Up
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ArrowDownward />}
              onClick={handleSubmit((data) => placeBet(data, false))}
              disabled={loading}
            >
              Down
            </Button>
          </Box>
        </form>

        {loading && <CircularProgress className="mx-auto block" />}

        {gameResult && (
          <Typography variant="h6" className="text-center mt-4">
            {gameResult}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default App;
