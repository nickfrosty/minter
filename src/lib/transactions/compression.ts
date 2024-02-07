/**
 * Helper functions for working with compression related things
 * (e.g. spl merkle trees, etc)
 */

import { Keypair } from "@solana/web3.js";
import { ValidDepthSizePair } from "@solana/spl-account-compression";
import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";

type CreateMerkleTreeProps = {
  rpcUrl: string;
  depthSizePair: ValidDepthSizePair;
  keypair: Keypair;
  treeKeypair?: Keypair;
  canopyDepth?: number;
};

/**
 * Create a Merkle tree that is owned by the Metaplex Bubblegum program
 */
export async function createMerkleTree({
  rpcUrl,
  keypair,
  depthSizePair,
  treeKeypair = Keypair.generate(),
  canopyDepth = 0,
}: CreateMerkleTreeProps): Promise<{
  signature: string;
  treeKeypair: Keypair;
}> {
  const umi = createUmi(rpcUrl).use(mplToolbox());

  umi.use(
    signerIdentity(
      createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(keypair.secretKey),
      ),
    ),
  );

  const merkleTree = createSignerFromKeypair(
    umi,
    umi.eddsa.createKeypairFromSecretKey(treeKeypair.secretKey),
  );

  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: depthSizePair.maxDepth,
    maxBufferSize: depthSizePair.maxBufferSize,
    canopyDepth,
    public: false,
  });

  const res = await builder.sendAndConfirm(umi);

  if (!!res.result.value.err) {
    throw Error(`Tree creation error: ${res.result.value.err.toString()}`);
  }

  const [signature] = base58.deserialize(res.signature);

  return {
    treeKeypair,
    signature,
  };
}
