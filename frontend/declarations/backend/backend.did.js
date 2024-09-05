export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'getBalance' : IDL.Func([], [Result_1], ['query']),
    'getCurrentPrice' : IDL.Func([], [IDL.Float64], ['query']),
    'getLastUpdateTime' : IDL.Func([], [IDL.Int], ['query']),
    'initializeWallet' : IDL.Func([], [Result_1], []),
    'placeBet' : IDL.Func([IDL.Nat, IDL.Bool], [Result], []),
    'updatePrice' : IDL.Func([IDL.Float64], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
