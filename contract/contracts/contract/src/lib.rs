#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Address, BytesN};

#[contract]
pub struct CrossChainBridge;

#[contractimpl]
impl CrossChainBridge {

    // Store a deposit event (lock funds on Stellar side)
    pub fn lock_funds(
        env: Env,
        user: Address,
        amount: i128,
        target_chain: Symbol,
        target_address: BytesN<32>,
    ) {
        let key = (symbol_short!("LOCK"), &user);
        env.storage().instance().set(&key, &(amount, target_chain, target_address));
    }

    // Mint or release funds when proof is verified
    pub fn release_funds(
        env: Env,
        user: Address,
        amount: i128,
        proof_hash: BytesN<32>,
    ) {
        let key = (symbol_short!("RELEASE"), &user);
        env.storage().instance().set(&key, &(amount, proof_hash));
    }

    // Read locked funds
    pub fn get_locked(env: Env, user: Address) -> (i128, Symbol, BytesN<32>) {
        let key = (symbol_short!("LOCK"), &user);
        env.storage().instance().get(&key).unwrap()
    }
}