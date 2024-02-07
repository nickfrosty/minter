import { Command } from "commander";
// prettier-ignore
import { log } from "@clack/prompts";
// prettier-ignore
import { cliOutputConfig } from "@/lib/cli.js";
// prettier-ignore
import type { MasterConfig } from "@/types/config.js";
// prettier-ignore
import { getLocalConfig, printConfigSettings } from "@/lib/config.js";

/**
 * Command: `config`
 *
 * Manage configuration settings loaded by this CLI tool
 */
export default function configCommand() {
  // set the default action: `help` (without an error)
  if (process.argv.length === 3) {
    process.argv.push("--help");
  }

  return new Command("config")
    .configureOutput(cliOutputConfig)
    .description("Manage your configuration settings")
    .addCommand(configGetCommand());
}

/**
 * Command: `config get`
 *
 * Get the current configuration settings from the local config file
 */
export function configGetCommand() {
  return (
    new Command("get")
      .configureOutput(cliOutputConfig)
      // .alias("trees")
      .description("Get your current configuration settings")
      .action(() => {
        log.message(`Current configuration settings`);

        const config: MasterConfig = getLocalConfig("config.json");

        printConfigSettings(config);
      })
  );
}
