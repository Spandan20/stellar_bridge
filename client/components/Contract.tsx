"use client";

import { useState, useCallback } from "react";
import {
  lockFunds,
  releaseFunds,
  getLocked,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ChainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Chain Options ─────────────────────────────────────────────

const CHAIN_OPTIONS = [
  { value: "ETH", label: "Ethereum" },
  { value: "SOL", label: "Solana" },
  { value: "BTC", label: "Bitcoin" },
  { value: "AVAX", label: "Avalanche" },
  { value: "POL", label: "Polygon" },
];

// ── Main Component ───────────────────────────────────────────

type Tab = "lock" | "release" | "check";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("lock");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Lock form state
  const [lockAmount, setLockAmount] = useState("");
  const [lockChain, setLockChain] = useState("ETH");
  const [lockAddress, setLockAddress] = useState("");
  const [isLocking, setIsLocking] = useState(false);

  // Release form state
  const [releaseAmount, setReleaseAmount] = useState("");
  const [releaseAddress, setReleaseAddress] = useState("");
  const [releaseProof, setReleaseProof] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);

  // Check form state
  const [checkAddress, setCheckAddress] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [lockedData, setLockedData] = useState<{amount: bigint; targetChain: string; targetAddress: string} | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleLockFunds = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!lockAmount.trim() || !lockAddress.trim()) return setError("Fill in all fields");
    if (lockAddress.length !== 42 && lockAddress.length !== 64) return setError("Invalid target address format");
    setError(null);
    setIsLocking(true);
    setTxStatus("Awaiting signature...");
    try {
      await lockFunds(
        walletAddress,
        BigInt(lockAmount.trim()),
        lockChain,
        lockAddress.trim()
      );
      setTxStatus("Funds locked on-chain!");
      setLockAmount("");
      setLockAddress("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsLocking(false);
    }
  }, [walletAddress, lockAmount, lockChain, lockAddress]);

  const handleReleaseFunds = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!releaseAmount.trim() || !releaseAddress.trim() || !releaseProof.trim()) return setError("Fill in all fields");
    setError(null);
    setIsReleasing(true);
    setTxStatus("Awaiting signature...");
    try {
      await releaseFunds(
        walletAddress,
        BigInt(releaseAmount.trim()),
        releaseProof.trim()
      );
      setTxStatus("Funds released on-chain!");
      setReleaseAmount("");
      setReleaseAddress("");
      setReleaseProof("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsReleasing(false);
    }
  }, [walletAddress, releaseAmount, releaseAddress, releaseProof]);

  const handleCheckLocked = useCallback(async () => {
    if (!checkAddress.trim()) return setError("Enter an address to check");
    setError(null);
    setIsChecking(true);
    setLockedData(null);
    try {
      const result = await getLocked(checkAddress.trim());
      if (result) {
        setLockedData(result);
      } else {
        setError("No locked funds found for this address");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsChecking(false);
    }
  }, [checkAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "lock", label: "Lock", icon: <LockIcon />, color: "#7c6cf0" },
    { key: "release", label: "Release", icon: <UnlockIcon />, color: "#34d399" },
    { key: "check", label: "Check", icon: <SearchIcon />, color: "#4fc3f7" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <ChainIcon />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Cross Chain Bridge</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setLockedData(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Lock */}
            {activeTab === "lock" && (
              <div className="space-y-5">
                <MethodSignature name="lock_funds" params="(user, amount, target_chain, target_address)" color="#7c6cf0" />
                <Input 
                  label="Amount (XLM)" 
                  type="number" 
                  value={lockAmount} 
                  onChange={(e) => setLockAmount(e.target.value)} 
                  placeholder="e.g. 100" 
                />
                
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">Target Chain</label>
                  <div className="flex gap-2 flex-wrap">
                    {CHAIN_OPTIONS.map((chain) => (
                      <button
                        key={chain.value}
                        onClick={() => setLockChain(chain.value)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-xs font-medium transition-all active:scale-95",
                          lockChain === chain.value
                            ? "border-[#7c6cf0]/50 bg-[#7c6cf0]/10 text-[#7c6cf0]"
                            : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white/55 hover:border-white/[0.1]"
                        )}
                      >
                        {chain.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input 
                  label="Target Address" 
                  value={lockAddress} 
                  onChange={(e) => setLockAddress(e.target.value)} 
                  placeholder="Ethereum address (0x...) or Solana address" 
                />

                {walletAddress ? (
                  <ShimmerButton onClick={handleLockFunds} disabled={isLocking} shimmerColor="#7c6cf0" className="w-full">
                    {isLocking ? <><SpinnerIcon /> Locking...</> : <><LockIcon /> Lock Funds</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to lock funds
                  </button>
                )}
              </div>
            )}

            {/* Release */}
            {activeTab === "release" && (
              <div className="space-y-5">
                <MethodSignature name="release_funds" params="(user, amount, proof_hash)" color="#34d399" />
                <Input 
                  label="Amount (XLM)" 
                  type="number" 
                  value={releaseAmount} 
                  onChange={(e) => setReleaseAmount(e.target.value)} 
                  placeholder="e.g. 100" 
                />
                <Input 
                  label="User Address" 
                  value={releaseAddress} 
                  onChange={(e) => setReleaseAddress(e.target.value)} 
                  placeholder="G... address" 
                />
                <Input 
                  label="Proof Hash" 
                  value={releaseProof} 
                  onChange={(e) => setReleaseProof(e.target.value)} 
                  placeholder="Transaction proof hash" 
                />

                {walletAddress ? (
                  <ShimmerButton onClick={handleReleaseFunds} disabled={isReleasing} shimmerColor="#34d399" className="w-full">
                    {isReleasing ? <><SpinnerIcon /> Releasing...</> : <><UnlockIcon /> Release Funds</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to release funds
                  </button>
                )}
              </div>
            )}

            {/* Check */}
            {activeTab === "check" && (
              <div className="space-y-5">
                <MethodSignature name="get_locked" params="(user: Address)" returns="-> (i128, Symbol, BytesN<32>)" color="#4fc3f7" />
                <Input 
                  label="User Address" 
                  value={checkAddress} 
                  onChange={(e) => setCheckAddress(e.target.value)} 
                  placeholder="G... address to check" 
                />
                <ShimmerButton onClick={handleCheckLocked} disabled={isChecking} shimmerColor="#4fc3f7" className="w-full">
                  {isChecking ? <><SpinnerIcon /> Checking...</> : <><SearchIcon /> Check Locked Funds</>}
                </ShimmerButton>

                {lockedData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Locked Funds</span>
                      <Badge variant="warning">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24]" />
                        Locked
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Amount</span>
                        <span className="font-mono text-sm text-white/80">{lockedData.amount.toString()} XLM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Target Chain</span>
                        <span className="font-mono text-sm text-white/80">{lockedData.targetChain}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Target Address</span>
                        <span className="font-mono text-xs text-white/80">{lockedData.targetAddress.slice(0, 12)}...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Cross Chain Bridge &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["Lock", "Verify", "Release"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 2 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
