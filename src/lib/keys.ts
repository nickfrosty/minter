import path from "path";
// prettier-ignore
import { mkdirSync, writeFileSync, readFileSync } from "fs";
// prettier-ignore
import { Keypair, PublicKey } from "@solana/web3.js";
// prettier-ignore
import { getLocalConfigDirPath } from "./config.js";

/**
 * Config subdirectory used to store all the keypairs
 */
const CONFIG_SUBDIR_FOR_KEYS = "keys";

/**
 * Default file path for the Solana CLI's default keypair
 */
export const SOLANA_CLI_DEFAULT_FILEPATH = "~/.config/solana/id.json";

/**
 * Load a keypair from the local file system
 *
 * note: this was taken from the `@solana-developers/helpers` packaged
 */
export function getKeypairFromFile(filepath?: string) {
  // Work out correct file name
  //   if (!filepath) {
  //     filepath = SOLANA_CLI_DEFAULT_FILEPATH;
  //   }

  if (filepath[0] === "~") {
    const home = process.env.HOME || null;
    if (home) {
      filepath = path.join(home, filepath.slice(1));
    }
  }

  // Get contents of file
  let fileContents: string;
  try {
    const fileContentsBuffer = readFileSync(filepath);
    fileContents = fileContentsBuffer.toString();
  } catch (error) {
    throw new Error(`Could not read keypair from file at '${filepath}'`);
  }

  // Parse contents of file
  let parsedFileContents: Uint8Array;
  try {
    parsedFileContents = Uint8Array.from(JSON.parse(fileContents));
  } catch (thrownObject) {
    const error = thrownObject as Error;
    if (!error.message.includes("Unexpected token")) {
      throw error;
    }
    throw new Error(`Invalid secret key file at '${filepath}'!`);
  }

  return Keypair.fromSecretKey(parsedFileContents);
}

/**
 * Load a specific keypair from the config directory
 */
export function getLocalKeypair(publicKey: PublicKey) {
  return getKeypairFromFile(
    path.join(
      getLocalConfigDirPath(),
      CONFIG_SUBDIR_FOR_KEYS,
      `${publicKey.toBase58()}.json`,
    ),
  );
}

/**
 * Create a new local keypair (or use the one provided),
 * saving it to the correct local config dir
 */
export function createLocalKeypair(keypair: Keypair = Keypair.generate()) {
  const dirPath = path.join(getLocalConfigDirPath(), CONFIG_SUBDIR_FOR_KEYS);

  try {
    mkdirSync(dirPath, {
      recursive: true,
    });

    writeFileSync(
      path.join(dirPath, `${keypair.publicKey.toBase58()}.json`),
      JSON.stringify(keypair),
      "utf-8",
    );

    return keypair.publicKey;
  } catch (err) {
    throw Error("Unable to write keypair to local file");
  }
}
