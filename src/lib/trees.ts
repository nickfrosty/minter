// prettier-ignore
import { ALL_DEPTH_SIZE_PAIRS, ValidDepthSizePair } from "@solana/spl-account-compression";

/**
 * Compute the lowest `maxDepth` for a tree for the provided `capacity` of leaves
 */
export function getTreeDepthForCapacity(
  capacity: number,
): ValidDepthSizePair["maxDepth"] {
  const sortedAllPairs = ALL_DEPTH_SIZE_PAIRS.sort(
    (a, b) => a.maxDepth - b.maxDepth,
  );

  if (
    capacity > Math.pow(2, sortedAllPairs[sortedAllPairs.length - 1].maxDepth)
  ) {
    throw Error("Tree capacity is too high");
  }

  for (let i = 0; i <= sortedAllPairs.length; i++) {
    if (Math.pow(2, sortedAllPairs[i].maxDepth) >= capacity) {
      return sortedAllPairs[i].maxDepth;
    }
  }

  throw Error("Unable to calculate tree depth for a capacity");
}

/**
 * Get the list of available `maxBufferSize` for a given `maxDepth`
 */
export function getTreeBufferSizesForDepth(
  maxDepth: number,
): ValidDepthSizePair["maxBufferSize"][] {
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
