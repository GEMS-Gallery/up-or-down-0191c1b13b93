import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : string } |
  { 'err' : string };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE {
  'getBalance' : ActorMethod<[], Result_1>,
  'getCurrentPrice' : ActorMethod<[], number>,
  'getLastUpdateTime' : ActorMethod<[], bigint>,
  'initializeWallet' : ActorMethod<[], Result_1>,
  'placeBet' : ActorMethod<[bigint, boolean], Result>,
  'updatePrice' : ActorMethod<[number], Array<[Principal, boolean, bigint]>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
