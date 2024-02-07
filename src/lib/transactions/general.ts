/**
 * Helper functions for Solana transactions
 */

// prettier-ignore
import { Connection, PublicKey, Signer, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

type BuildTransactionProps = {
  connection: Connection;
  payerKey: PublicKey;
  instructions: Array<TransactionInstruction>;
  signers?: Array<Signer>;
  getBlockhash?: boolean;
  useVersioned?: boolean;
};

/**
 * Solana transaction builder, including auto fetching the latest blockhash
 */
export async function buildTransaction({
  connection,
  payerKey,
  instructions,
  signers,
  getBlockhash = false,
}: BuildTransactionProps) {
  // when `signers` are passed, we must get the blockhash since
  // the signers must sign the full transaction
  if (signers && !!signers.length) getBlockhash = true;

  const transaction = new VersionedTransaction(
    new TransactionMessage({
      instructions,
      payerKey,
      // optionally get the recent blockhash
      recentBlockhash: getBlockhash
        ? (await connection.getLatestBlockhash()).blockhash
        : undefined,
    }).compileToV0Message(),
  );

  // auto sign the transaction with all provided `signers`
  signers?.forEach((s) => transaction.sign([s]));

  return transaction;
}
