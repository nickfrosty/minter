import { LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Format lamports to SOL
 */
export function formatLamportToSol(
  lamports: number,
  currency: boolean = true,
): string {
  const amount = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 6,
    minimumSignificantDigits: 1,
    minimumFractionDigits: 3,
  }).format(lamports / LAMPORTS_PER_SOL);

  return `${!!amount ? amount : "0"}${currency ? ` SOL` : ""}`;
}
