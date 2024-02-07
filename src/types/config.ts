import type { Cluster, Keypair } from "@solana/web3.js";

export type ClusterWithLocalnet = Cluster | "localnet";

/**
 * Supported configuration file names
 */
export type ConfigFileName = "config.json" | "trees.json";

/**
 * Master configuration for the CLI (aka `config.json`)
 */
export type MasterConfig = {
  /** the currently selected cluster */
  selectedCluster: ClusterWithLocalnet;
  /** rpc urls for each of the supported clusters */
  rpcUrl: {
    [name in ClusterWithLocalnet]: string;
  };
  /** the default local wallet for the cli to use  */
  wallet: string;
  walletKeypair?: Keypair;
};

/**
 * Configuration for the `trees.json`
 */
export type TreeConfig = {
  trees: TreeMetadata[];
};

/**
 * Configuration details and metadata for a single tree
 */
export type TreeMetadata = {
  /** base58 encoded publicKey of the merkle tree */
  address: string;
  /** signature of the transaction that created the tree */
  creationSignature: string;
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
};
