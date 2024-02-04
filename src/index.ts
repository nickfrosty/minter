#!/usr/bin/env node

import { errorMessage } from "./lib/cli.js";
import cliProgram from "./commands/index.js";
import treeCommand from "./commands/tree.js";

async function main() {
  try {
    // display a spacer at the top
    console.log();

    const program = cliProgram();

    program.addCommand(treeCommand());

    await program.parseAsync();

    // display a spacer at the bottom
    console.log();
  } catch (err) {
    errorMessage(err);
  }
}

main();
