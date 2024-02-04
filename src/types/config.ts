import type { Cluster } from "@solana/web3.js";

/**
 * Supported configuration file names
 */
export type ConfigFileName = "config.json" | "trees.json";

/**
 * Master configuration for the CLI
 */
export type MasterConfig = {
  /** the currently selected cluster */
  selectedCluster: Cluster;
  /** rpc urls for each of the supported clusters */
  rpcUrl: {
    [name in Cluster]: string;
  };
};
