import type { Cluster, Keypair } from "@solana/web3.js";

export type ClusterWithLocalnet = Cluster | "localnet";

/**
 * Supported configuration file names
 */
export type ConfigFileName = "config.json" | "trees.json";

/**
 * Master configuration for the CLI
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
