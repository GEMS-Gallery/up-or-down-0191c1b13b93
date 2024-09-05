import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

import Principal "mo:base/Principal";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Time "mo:base/Time";

actor UpOrDown {
  type UserId = Principal;
  type Bet = {
    amount: Nat;
    direction: Bool; // true for Up, false for Down
    timestamp: Int;
  };

  stable var userWallets : [(UserId, Nat)] = [];
  var walletEntries = HashMap.HashMap<UserId, Nat>(10, Principal.equal, Principal.hash);
  var activeBets = HashMap.HashMap<UserId, Bet>(10, Principal.equal, Principal.hash);
  var currentPrice : Float = 0;
  var lastUpdateTime : Int = 0;

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

  public shared(msg) func placeBet(amount: Nat, direction: Bool) : async Result.Result<Text, Text> {
    let userId = msg.caller;
    let currentTime = Time.now();
    if (currentTime > (lastUpdateTime + 30_000_000_000)) {
      return #err("Betting is closed for this round");
    };
    switch (walletEntries.get(userId)) {
      case (?balance) {
        if (balance < amount) {
          return #err("Insufficient balance");
        };
        let newBalance = balance - amount;
        walletEntries.put(userId, newBalance);
        activeBets.put(userId, { amount = amount; direction = direction; timestamp = currentTime });
        #ok("Bet placed successfully")
      };
      case null {
        #err("Wallet not initialized")
      };
    }
  };

  public shared func updatePrice(newPrice: Float) : async () {
    let oldPrice = currentPrice;
    currentPrice := newPrice;
    lastUpdateTime := Time.now();

    for ((userId, bet) in activeBets.entries()) {
      let won = (bet.direction and newPrice > oldPrice) or (not bet.direction and newPrice < oldPrice);
      switch (walletEntries.get(userId)) {
        case (?balance) {
          let newBalance = if (won) balance + bet.amount * 2 else balance;
          walletEntries.put(userId, newBalance);
        };
        case null {}
      };
    };
    activeBets := HashMap.HashMap<UserId, Bet>(10, Principal.equal, Principal.hash);
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

  public query func getCurrentPrice() : async Float {
    currentPrice
  };

  public query func getLastUpdateTime() : async Int {
    lastUpdateTime
  };

  system func preupgrade() {
    userWallets := Iter.toArray(walletEntries.entries());
  };

  system func postupgrade() {
    walletEntries := HashMap.fromIter<UserId, Nat>(userWallets.vals(), 10, Principal.equal, Principal.hash);
  };
}
