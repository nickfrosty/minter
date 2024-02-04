import { Command } from "commander";
import picocolors from "picocolors";
// prettier-ignore
import { isCancel, log, note, spinner, confirm, text } from "@clack/prompts";
// prettier-ignore
import { cancelOutro, cliOutputConfig, errorOutro, successOutro } from "../lib/cli.js";
// prettier-ignore
import { Cluster, Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
// prettier-ignore
import { getConcurrentMerkleTreeAccountSize } from "@solana/spl-account-compression";
// prettier-ignore
import { getTreeBufferSizesForDepth, getTreeDepthForCapacity, getTreeSafeMaxCanopyDepth} from "../lib/trees.js";

/**
 * the `tree` command used to used to create and manage merkle trees
 */
export default function treeCommand() {
  return (
    new Command("tree")
      .configureOutput(cliOutputConfig)
      // .alias("trees")
      .description("Create and manage merkle trees for cNFTs")
      .addCommand(treeCreateCommand)
  );
}

type TreeCreateOptions = {
  quantity: any;
  depth: any;
  verbose: any;
  accept: any;
};

/**
 * Command: `tree create`
 *
 * Create a new concurrent merkle tree for use with compressed NFTs
 */
const treeCreateCommand = new Command("create")
  .configureOutput(cliOutputConfig)
  .description("Create a new merkle tree to store compressed NFTs")
  .option("-q, --quantity", "number of compressed NFTs to store in this tree")
  .option("-d, --depth", "max depth of the tree")
  .option("-v, --verbose", "verbose output", false)
  .option("--accept", "verbose output", false)
  .action(async (options: TreeCreateOptions) => {
    log.message("Create a new merkle tree to store compressed NFTs");

    // read in the desired quantity from the user, when not already set
    if (!options.quantity) {
      const inputCapacity = await text({
        message: "Enter the quantity of cNFTs you want to store?",
        // placeholder: "10,000",
        // validate: (input) => {
        //   try {
        //     parseInt(input);
        //   } catch (err) {
        //     return "A number is required";
        //   }
        // },
      });

      if (isCancel(inputCapacity)) cancelOutro();

      options.quantity = parseInt(inputCapacity as string);
    }

    const maxDepth: number = getTreeDepthForCapacity(options.quantity);

    const availableBufferSizes: number[] = getTreeBufferSizesForDepth(maxDepth);

    // todo: have the user select a desired max buffer size
    const maxBufferSize: number = availableBufferSizes[0];

    const cluster: Cluster = "devnet";

    // create the connection to the desired solana cluster
    const connection = new Connection(clusterApiUrl(cluster));

    // todo: allow the user to select the canopy size

    // define the canopy depth value
    let canopyDepth = getTreeSafeMaxCanopyDepth(maxDepth);

    // todo: warn the user of the canopy differing from their selected

    // const maxCanopyDepth = maxDepth >= 20 ? 17 : maxDepth;

    // note: not sure if this is the ideal action, but there is a limit at depth of ABSOLUTE_MAX_DEPTH
    // set the absolute maxDepth allowed
    // if (canopyDepth > ABSOLUTE_MAX_DEPTH) canopyDepth = ABSOLUTE_MAX_DEPTH;

    // store some configuration details about the tree
    const treeInfo = {
      /** total number of cNFTs the tree can store */
      maxCapacity: Math.pow(2, maxDepth),
      /** total byte space needed for the tree */
      space: getConcurrentMerkleTreeAccountSize(
        maxDepth,
        maxBufferSize,
        canopyDepth,
      ),
      /** total lamport cost to allocate the tree */
      cost: null as number,
    };

    try {
      // calculate the rent cost for the tree
      treeInfo.cost = await connection.getMinimumBalanceForRentExemption(
        treeInfo.space,
      );
      if (!treeInfo.cost) throw Error("Unknown tree cost");
    } catch (err) {
      errorOutro("Unable to get tree cost");
    }

    // note(
    //   `Creating a new tree with the following settings:` +
    //     `\n  depth:     ${picocolors.underline(treeConfig.depth)}` +
    //     `\n  maxBuffer: ${picocolors.underline(treeConfig.maxBuffer)}` +
    //     `\n  depth:     ${picocolors.underline(treeConfig.canopy)}`,
    //   // `\n  depth: ${picocolors.underline(treeConfig.depth)}`,
    // );

    note(
      `Tree capacity: ${new Intl.NumberFormat(undefined, {}).format(treeInfo.maxCapacity)} cNFTs\n` +
        `Tree cost:     ${new Intl.NumberFormat(undefined, {}).format(treeInfo.cost / LAMPORTS_PER_SOL)} SOL\n` +
        `Network:       ${cluster}`,
      "Creating a new tree with the following settings:",
    );

    // get the payer's starting balance
    // const initBalance = await connection.getBalance(SOLANA_KEYPAIR.publicKey);
    // console.log(
    //   "Starting account balance:",
    //   initBalance / LAMPORTS_PER_SOL,
    //   "SOL\n",
    // );

    // todo: support a "accept all defaults" type option to avoid seeing this question

    // ask the user to create the tree based
    const confirmCreate = await confirm({
      message: "Do to want to create this tree?",
    });

    if (isCancel(confirmCreate) || !confirmCreate) {
      cancelOutro();
    }

    // const spin = spinner();
    // spin.start("Creating tree on-chain");
    // spin.stop("Complete!", 1);

    errorOutro("not implemented");

    // successOutro("Tree created!");
  });
