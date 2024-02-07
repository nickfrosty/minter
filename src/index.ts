#!/usr/bin/env node

import { errorMessage } from "./lib/cli.js";
import cliProgram from "./commands/index.js";
import configCommand from "./commands/config.js";
import treeCommand from "./commands/tree.js";

async function main() {
  try {
    // display a spacer at the top
    console.log();

    const program = cliProgram();

    program.addCommand(treeCommand()).addCommand(configCommand());

    // set the default action: `help` (without an error)
    if (process.argv.length === 2) {
      process.argv.push("--help");
    }

    await program.parseAsync();

    // display a spacer at the bottom
    console.log();
  } catch (err) {
    errorMessage(err);
  }
}

main();
