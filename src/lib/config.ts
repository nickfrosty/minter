/**
 *
 */

import fs from "fs";
import path from "path";
import os from "os";
import picocolors from "picocolors";
// prettier-ignore
import { log } from "@clack/prompts";
// prettier-ignore
import type { ConfigFileName, MasterConfig, TreeConfig } from "@/types/config.js";
// prettier-ignore
import { createLocalKeypair } from "@/lib/keys.js";

/**
 * Get the default config file's path
 */
export function getLocalConfigDirPath() {
  let configFilePath = "";

  if (os.platform() == "win32") {
    configFilePath = path.resolve(
      process.env.APPDATA || path.join(os.homedir(), "/AppData/Roaming"),
    );
  } else if (os.platform() == "darwin") {
    configFilePath = path.resolve("~/Library/Application/Support");
  } else if (os.platform() == "linux") {
    configFilePath = path.resolve("~/.local/share");
  }

  configFilePath = path.join(configFilePath, "site.drop.minter.cli");

  if (!configFilePath) {
    throw Error("Unable to get config file path");
  }

  return configFilePath;
}

/**
 * Load and return the default config file
 */
export function getLocalConfig(configFile: ConfigFileName = "config.json") {
  const configDir = getLocalConfigDirPath();

  let configContents = "";

  // attempt to open the desired config file
  try {
    configContents = fs.readFileSync(path.join(configDir, configFile), {
      encoding: "utf-8",
    });

    return JSON.parse(configContents);
  } catch (err) {
    // file did not exist
  }

  if (!!configContents)
    throw Error(`Unable to process config file: ${configFile}`);

  // read or create the config dir
  try {
    fs.readdirSync(configDir);
  } catch (err) {
    fs.mkdirSync(configDir, {
      recursive: true,
    });
  }

  // since we could not open the file, we will create the default file
  try {
    const defaultConfig = getDefaultConfigContents(configFile);

    fs.writeFileSync(
      path.join(configDir, configFile),
      JSON.stringify(defaultConfig),
      {
        encoding: "utf-8",
      },
    );

    return defaultConfig;
  } catch (err) {
    throw Error(`Unable to create config file: ${configFile}`);
  }
}

/**
 * Get the default configuration settings for each config file type
 */
export function getDefaultConfigContents(configFile: ConfigFileName) {
  if (configFile == "config.json") {
    const config: MasterConfig = {
      selectedCluster: "devnet",
      rpcUrl: {
        "mainnet-beta": "https://api.mainnet-beta.solana.com",
        devnet: "https://api.devnet.solana.com",
        testnet: "https://api.testnet.solana.com",
        localnet: "http://127.0.0.1:8899",
      },
      wallet: createLocalKeypair().toBase58(),

      // @ts-ignore
      "// note": "This is your drop-minter master config file",
      "// docs": "Learn more on https://drop.site",
    };

    return config;
  } else if (configFile == "trees.json") {
    const config: TreeConfig = {
      trees: [],
      // @ts-ignore
      "// note": "This is your drop-minter tree config file",
      "// docs": "Learn more on https://drop.site",
    };
    return config;
  }

  throw Error("Unknown config file name");
}

/**
 * Print out
 */
export function printConfigSettings(config: object) {
  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      const data = config[key];

      // ignore comment based json children
      if (key.startsWith("//")) continue;

      if (
        typeof data == "string" ||
        typeof data == "number" ||
        typeof data == "boolean"
      ) {
        log.step(`${picocolors.bold(key)}: ${data}`);
      } else if (Array.isArray(data)) {
        let output = [`${picocolors.bold(key)}:`];

        for (const key in data) {
          output.push(`  - ${data[key]}`);
        }

        log.step(output.join("\n"));
      } else if (typeof data == "object") {
        let output = [`${picocolors.bold(key)}:`];

        for (const key in data) {
          output.push(`  - ${picocolors.bold(key)}: ${data[key]}`);
        }

        log.step(output.join("\n"));
      } else {
        log.info(`Unknown config setting: ${key}`);
        console.log(data);
      }
    }
  }
}
