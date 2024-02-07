import { Command } from "commander";
import picocolors from "picocolors";
// prettier-ignore
import { isCancel, log, note, spinner, confirm, text } from "@clack/prompts";
// prettier-ignore
import { cancelOutro, cliOutputConfig, errorOutro, successOutro } from "@/lib/cli.js";
// prettier-ignore
import { Connection } from "@solana/web3.js";
// prettier-ignore
import { getConcurrentMerkleTreeAccountSize } from "@solana/spl-account-compression";
// prettier-ignore
import { getTreeBufferSizesForDepth, getTreeDepthForCapacity, getTreeSafeMaxCanopyDepth } from "@/lib/trees.js";
import { MasterConfig, TreeConfig } from "@/types/config.js";
import { getLocalConfig, saveLocalConfig } from "@/lib/config.js";
import { saveLocalKeypair, getLocalKeypair } from "@/lib/keys.js";
import { formatLamportToSol } from "@/lib/helpers.js";
import { createMerkleTree } from "@/lib/transactions/compression";
import { getExplorerLink } from "@solana-developers/helpers";

/**
 * the `tree` command used to used to create and manage merkle trees
 */
export default function treeCommand() {
  // set the default action: `help` (without an error)
  if (process.argv.length === 3) {
    process.argv.push("--help");
  }

  return new Command("tree")
    .configureOutput(cliOutputConfig)
    .description("Create and manage merkle trees for cNFTs")
    .addCommand(treeCreateCommand);
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

    const config: MasterConfig = getLocalConfig("config.json");

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

    const maxDepth = getTreeDepthForCapacity(options.quantity);

    const availableBufferSizes = getTreeBufferSizesForDepth(maxDepth);

    // todo: have the user select a desired max buffer size
    const maxBufferSize = availableBufferSizes[0];

    // create the connection to the desired solana cluster
    const connection = new Connection(config.rpcUrl[config.selectedCluster]);

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
      /** lamport balance for the user's payer wallet */
      payerBalance: 0,
    };

    const spin = spinner();
    spin.start("Crunching some numbers for cost");

    try {
      config.walletKeypair = getLocalKeypair(config.wallet);
      treeInfo.payerBalance = await connection.getBalance(
        config.walletKeypair.publicKey,
      );
    } catch (err) {
      console.log(err);
      throw Error(
        `Unable to get your wallet's current balance\n${err.message}`,
      );
    }

    try {
      // calculate the rent cost for the tree
      treeInfo.cost = await connection.getMinimumBalanceForRentExemption(
        treeInfo.space,
      );
      if (!treeInfo.cost) throw Error("Unknown tree cost");
    } catch (err) {
      errorOutro("Unable to get tree cost");
    }

    spin.stop("Cost calculations complete");

    // note(
    //   `Creating a new tree with the following settings:` +
    //     `\n  depth:     ${picocolors.underline(treeConfig.depth)}` +
    //     `\n  maxBuffer: ${picocolors.underline(treeConfig.maxBuffer)}` +
    //     `\n  depth:     ${picocolors.underline(treeConfig.canopy)}`,
    //   // `\n  depth: ${picocolors.underline(treeConfig.depth)}`,
    // );

    note(
      `Tree capacity: ${new Intl.NumberFormat().format(treeInfo.maxCapacity)} cNFTs\n` +
        `Tree cost:     ${formatLamportToSol(treeInfo.cost)}\n` +
        `Network:       ${config.selectedCluster}`,
      "Creating a new tree with the following settings:",
    );

    // get the payer's starting balance
    // const initBalance = await connection.getBalance(SOLANA_KEYPAIR.publicKey);
    // console.log(
    //   "Starting account balance:",
    //   formatLamportToSol(initBalance),
    //   "SOL\n",
    // );

    // todo: support a "accept all defaults" type option to avoid seeing this question

    // ask the user to create the tree based
    const confirmCreate = await confirm({
      message: "Do you want to continue?",
    });

    if (isCancel(confirmCreate) || !confirmCreate) {
      cancelOutro();
    }

    // enable the user to easily top up their local wallet
    if (treeInfo.cost >= treeInfo.payerBalance) {
      note(
        `Add at least ` +
          picocolors.underline(
            formatLamportToSol(treeInfo.cost - treeInfo.payerBalance, false),
          ) +
          ` SOL to your wallet\n` +
          config.wallet,
        picocolors.inverse(" Solana wallet balance too low "),
      );

      errorOutro(
        `Add SOL to your wallet on ${config.selectedCluster} and try again`,
      );

      // todo: show a solana pay transfer request qr code, and maybe a simple qr code?

      // spin.start("Waiting for wallet balance changes");

      /**
       * todo: better UX
       * I think after the first account change is recognized,
       * this callback will auto remove itself. so we should might
       * need to recursively reinitialize itself
       */
      // let subscription = connection.onAccountChange(
      //   config.walletKeypair.publicKey,
      //   (accountInfo) => {
      //     spin.message("Balance changed! Processing");

      //     if (accountInfo.lamports > treeInfo.cost) {
      //       treeInfo.payerBalance = accountInfo.lamports;
      //       spin.stop("Your local wallet has enough SOL now 🎉");
      //     }

      //     errorOutro("Still not enough SOL...");
      //   },
      //   "confirmed",
      // );

      // errorOutro("wallet balance too low");
    }

    spin.start("Creating tree");

    try {
      const newTreeData = await createMerkleTree({
        rpcUrl: config.rpcUrl[config.selectedCluster],
        keypair: config.walletKeypair,
        // @ts-ignore - we have already ensured these values are typed
        depthSizePair: {
          maxDepth,
          maxBufferSize,
        },
      });

      try {
        const treeConfig = getLocalConfig("trees.json") as TreeConfig;

        treeConfig.trees.push({
          address: newTreeData.treeKeypair.publicKey.toBase58(),
          creationSignature: newTreeData.signature,
          maxDepth,
          maxBufferSize,
          canopyDepth,
          maxCapacity: treeInfo.maxCapacity,
        });

        saveLocalKeypair(newTreeData.treeKeypair);

        saveLocalConfig("trees.json", treeConfig);
      } catch (err) {
        note(
          // `Unable to update your local tree config file.\n` +
          `Your tree was created on chain, and your wallet balance has changed.\n` +
            `But, we were unable to update the local configuration file for this\n` +
            `tool to access needed data. Therefore, this tool cannot use this \ntree right now.`,
          picocolors.bgYellow("Unable to store tree configuration"),
        );
      }

      spin.stop("Tree created successfully");

      log.message(
        getExplorerLink(
          "transaction",
          newTreeData.signature,
          config.selectedCluster,
        ),
      );

      successOutro("Tree created!");
    } catch (err) {
      console.log(err);
      errorOutro("Unable to create tree");
    }

    // try {
    //   const signature = await connection.sendTransaction(createTreeTx);

    //   const res = await connection.confirmTransaction(
    //     {
    //       signature,
    //       ...(await connection.getLatestBlockhash()),
    //     },
    //     "confirmed",
    //   );

    //   if (!!res.value.err) {
    //     errorOutro("Unable to confirm transaction");
    //   }

    //   successOutro("Tree created!");
    // } catch (err) {
    //   errorOutro("Transaction failed :/");
    // }

    errorOutro("not implemented");
  });
