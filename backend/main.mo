import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

import Principal "mo:base/Principal";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Random "mo:base/Random";

actor UpOrDown {
  type UserId = Principal;
  type Bet = Nat;
  type GameResult = Bool;

  stable var userWallets : [(UserId, Nat)] = [];
  var walletEntries = HashMap.HashMap<UserId, Nat>(10, Principal.equal, Principal.hash);

  public shared(msg) func initializeWallet() : async Result.Result<Nat, Text> {
    let userId = msg.caller;
    switch (walletEntries.get(userId)) {
      case (?balance) {
        #err("Wallet already initialized")
      };
      case null {
        walletEntries.put(userId, 10);
        #ok(10)
      };
    }
  };

  public shared(msg) func placeBet(amount: Nat, choice: Bool) : async Result.Result<Bool, Text> {
    let userId = msg.caller;
    switch (walletEntries.get(userId)) {
      case (?balance) {
        if (balance < amount) {
          return #err("Insufficient balance");
        };
        let newBalance = balance - amount;
        walletEntries.put(userId, newBalance);
        
        let seed = await Random.blob();
        let randomBool = Random.coinFrom(seed);
        
        if (randomBool == choice) {
          let winnings = amount * 2;
          walletEntries.put(userId, newBalance + winnings);
          #ok(true)
        } else {
          #ok(false)
        }
      };
      case null {
        #err("Wallet not initialized")
      };
    }
  };

  public query(msg) func getBalance() : async Result.Result<Nat, Text> {
    let userId = msg.caller;
    switch (walletEntries.get(userId)) {
      case (?balance) {
        #ok(balance)
      };
      case null {
        #err("Wallet not initialized")
      };
    }
  };

  system func preupgrade() {
    userWallets := Iter.toArray(walletEntries.entries());
  };

  system func postupgrade() {
    walletEntries := HashMap.fromIter<UserId, Nat>(userWallets.vals(), 10, Principal.equal, Principal.hash);
  };
}
