#!/usr/bin/env node

import cliProgram from "./commands/index.js";

async function main() {
  // display a spacer at the top
  console.log();

  const program = cliProgram();

  await program.parseAsync();

  // display a spacer at the bottom
  console.log();
}

main();
