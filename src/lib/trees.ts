// prettier-ignore
import { ALL_DEPTH_SIZE_PAIRS } from "@solana/spl-account-compression";

/**
 * Compute the lowest `maxDepth` for a tree for the provided `capacity` of leaves
 */
export function getTreeDepthForCapacity(capacity: number): number {
  let maxDepth = ALL_DEPTH_SIZE_PAIRS[0].maxDepth;

  for (let i = 0; i <= ALL_DEPTH_SIZE_PAIRS.length; i++) {
    if (Math.pow(2, ALL_DEPTH_SIZE_PAIRS[i].maxDepth) >= capacity) {
      maxDepth = ALL_DEPTH_SIZE_PAIRS[i].maxDepth;
      break;
    }
  }

  if (Math.pow(2, maxDepth) <= capacity) {
    throw Error("Tree max depth calculation error");
  }

  return maxDepth;
}

/**
 * Get the list of available `maxBufferSize` for a given `maxDepth`
 */
export function getTreeBufferSizesForDepth(maxDepth: number): number[] {
  return ALL_DEPTH_SIZE_PAIRS.filter((pair) => pair.maxDepth == maxDepth).map(
    (pair) => pair.maxBufferSize,
  );
}
/**
 * Get the safe max canopy size allowed by the compression program
 * (due to Solana 10kb account size limit)
 */
export function getTreeSafeMaxCanopyDepth(canopySize: number) {
  //  note: this is not expected to change any time soon
  const ABSOLUTE_MAX_CANOPY = 17;

  if (canopySize < ABSOLUTE_MAX_CANOPY) {
    return canopySize;
  } else {
    return ABSOLUTE_MAX_CANOPY;
  }
}
