import { Command } from "commander";
import picocolors from "picocolors";
import { getAppInfo } from "../lib/getAppInfo.js";
// prettier-ignore
import { intro } from "@clack/prompts";
// prettier-ignore
import { cliOutputConfig } from "../lib/cli.js";

export default function cliProgram() {
  // Get app info from package.json
  const app = getAppInfo();

  intro(picocolors.bgMagenta(` ${app.name} - v${app.version} `));

  // initialize the cli commands and options parsing
  const program = new Command()
    .name(app.name)
    .version(app.version, "--version", "Output the version number")
    .description("Your one stop shop for working with NFTs")
    .configureOutput(cliOutputConfig);

  return program;
}
