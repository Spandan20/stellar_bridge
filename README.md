# 🌉 Cross-Chain Bridge on Stellar (Soroban)

## 📄 Project Description
<img width="1359" height="629" alt="image" src="https://github.com/user-attachments/assets/cf3744b3-7816-40fc-9d85-b64597d0e602" />


This project is a **Cross-Chain Bridge Smart Contract** built using **Soroban** on the **Stellar Testnet**.

It enables users to transfer assets between Stellar and other blockchain networks using a **lock-and-release mechanism**, forming the foundation of interoperability between decentralized ecosystems.

The contract is deployed and can be explored via **StellarExpert**, which allows developers to inspect contract data, storage, and interactions. ([Stellar Docs][1])

---

## ⚙️ What It Does

This smart contract simulates a **cross-chain bridge workflow**:

1. 🔐 **Lock Funds on Stellar**
   Users lock their assets in the contract before transferring to another chain.

2. 📡 **Emit Transfer Intent**
   The contract stores transaction data (amount, destination chain, recipient).

3. 🔁 **Cross-Chain Verification (Off-chain)**
   A relayer/oracle verifies the transaction on the destination chain.

4. 💸 **Release / Mint Funds**
   Funds are released (or minted) after proof verification.

👉 This enables **asset movement across blockchains** without centralized custody.

---

## ✨ Features

* 🔐 **Secure Asset Locking**
* 🔁 **Cross-Chain Transfer Simulation**
* 🧾 **Proof-Based Fund Release**
* 👤 **User Address Mapping**
* ⚡ **Low-cost execution on Stellar**
* 🔌 **Extensible for relayers/oracles/ZK proofs**

---

## 🚀 Deployed Smart Contract

* 🔗 **Contract ID:**
  `CANY2ITMUMXKIFESERJMMBCBLUBUDZMPSM2ZZ3BADFNXFGW6GIUM5JGT`

* 🌐 **Explorer Link:**
  [https://stellar.expert/explorer/testnet/contract/CANY2ITMUMXKIFESERJMMBCBLUBUDZMPSM2ZZ3BADFNXFGW6GIUM5JGT](https://stellar.expert/explorer/testnet/contract/CANY2ITMUMXKIFESERJMMBCBLUBUDZMPSM2ZZ3BADFNXFGW6GIUM5JGT)

👉 You can:

* View contract state
* Inspect storage
* Invoke functions directly via explorer UI ([Stellar Docs][1])

---

## 🛠️ How It Works (Technical Flow)

### 1. Lock Function

```rust
lock_funds(user, amount, target_chain, target_address)
```

* Stores deposit details in contract storage

### 2. Release Function

```rust
release_funds(user, amount, proof_hash)
```

* Releases funds after verification

### 3. Storage Mapping

* `LOCK → (amount, chain, address)`
* `RELEASE → (amount, proof)`

---

## 🧪 How to Test

### Using Stellar CLI

```bash
stellar network use testnet
stellar keys generate alice
stellar keys fund alice

stellar contract invoke \
  --id <CONTRACT_ID> \
  -- lock_funds \
  --user <ADDRESS> \
  --amount 1000
```

Smart contracts on Stellar are deployed as WASM binaries and interacted with via CLI or explorer tools. ([Stellar Docs][2])

---

## ⚠️ Disclaimer

This is a **prototype / educational implementation**.

❌ Not production-ready
❌ No real cryptographic proof verification
❌ No relayer security guarantees

### Missing for Production:

* Merkle proof verification
* Signature validation
* Replay attack protection
* Decentralized relayer network

---

## 🔮 Future Improvements

* ✅ Add oracle/relayer system
* ✅ Integrate Ethereum ↔ Stellar bridge
* ✅ Implement ZK-proof verification
* ✅ Add frontend UI (React + Wallet)
* ✅ Token standard integration

---

## 🧠 Inspiration

Cross-chain interoperability is a major challenge in Web3. This project explores how **Soroban smart contracts** can act as a lightweight bridge layer for future multi-chain ecosystems.

---
