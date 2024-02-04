/**
 * Assorted helper functions and wrappers for working in the CLI
 */

import { log, outro } from "@clack/prompts";
import { OutputConfiguration } from "commander";
import picocolors from "picocolors";

/**
 * Print a plain message using clack's `outro`
 * (including a process exit code)
 */
export function cancelOutro(msg: string = "Operation canceled") {
  outro(picocolors.inverse(` ${msg} `));
  process.exit(0);
}

/**
 * Print a blue notice message using clack's `outro`
 * (including a process exit code)
 */
export function noticeOutro(msg: string) {
  outro(picocolors.bgBlue(` ${msg} `));
  process.exit(0);
}

/**
 * Print a green success message using clack's `outro`
 * (including a process exit code)
 */
export function successOutro(msg: string) {
  outro(picocolors.bgGreen(` ${msg} `));
  process.exit(0);
}

/**
 * Print a red error message using clack's `outro`
 * (including a process exit code)
 */
export function errorOutro(msg: string) {
  outro(picocolors.bgRed(` ${msg} `));
  process.exit(1);
}

/**
 * Default Commander output configuration to be passed into `configureOutput()`
 */
export const cliOutputConfig: OutputConfiguration = {
  writeErr(str: string) {
    log.error(str.trim() + "\n");
    console.log();
  },
  writeOut(str: string) {
    log.info(str.trim() + "\n");
    console.log();
  },
};
