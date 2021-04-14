import { SHA256 as SHA } from "crypto-js";

import { Block } from "./Block";
/*
 * Calculate the block hash with SHA256
 * Using the previous hash to hash a block is not the best,
 * if a block needs to be modified, all future hashes must be changed.
 */
const calcHash = (
  index: number,
  prevHash: string,
  data: string,
  timestamp: number
): string => {
  return SHA(index + prevHash + data + timestamp).toString();
};

/*
 * Create the genesis block
 * This is hard coded since it is the first block
 * and therefore has no previous hash
 */
const genesisBlock: Block = new Block(
  0,
  "a5f9fd2086ab40c32b85b1b6e5b49b7ccccc9ae09b76c8433ce4878eabcc045a",
  "",
  "Typescript Rules!",
  new Date().getTime() / 1000
);

/*
 * Store the blocks in an in-memory
 * blockchain - TODO: persist
 */
let blockchain: Block[] = [genesisBlock];

const getLatest = (): Block => blockchain[blockchain.length - 1];

/*
 * Get data from previous block
 * Create a new block and hash with that data
 */
const generateNext = (data: string) => {
  const prevBlock: Block = getLatest();
  const nextIdx: number = prevBlock.index + 1;
  const nextTimestamp: number = new Date().getTime() / 1000;
  const nextHash: string = calcHash(
    nextIdx,
    prevBlock.hash,
    data,
    nextTimestamp
  );
  const newBlock: Block = new Block(
    nextIdx,
    nextHash,
    prevBlock.hash,
    data,
    nextTimestamp
  );
  addBlock(newBlock);
  //   broadcastNew()
  return newBlock;
};

const addBlock = (newBlock: Block) => {
  if (isValid(newBlock, getLatest())) {
    blockchain.push(newBlock);
  }
};

const calcBlockHash = (block: Block): string =>
  calcHash(block.index, block.prevHash, block.data, block.timestamp);

/*
 * Validate block integrity
 * The index must be in order
 * The previous hash must match the previous block's hash
 * The current hash must be a valid hash
 */
const isValid = (newBlock: Block, prevBlock: Block): boolean => {
  if (!isValidStructure(newBlock)) return false;
  if (prevBlock.index + 1 !== newBlock.index) return false;
  else if (prevBlock.hash !== newBlock.prevHash) return false;
  else if (calcBlockHash(newBlock) !== newBlock.hash) return false;
  return true;
};

/*
 * Validate block structure
 */
const isValidStructure = (block: Block): boolean => {
  return (
    typeof block.index === "number" &&
    typeof block.hash === "string" &&
    typeof block.prevHash === "string" &&
    typeof block.timestamp === "number" &&
    typeof block.data === "string"
  );
};

const addBlockToChain = (newBlock: Block) => {
  if (isValid(newBlock, getLatest())) {
    blockchain.push(newBlock);
    return true;
  }
  return false;
};

/**
 * Validate blockchain
 * First, check if genesis block is valid
 * If valid, validate every block after that
 */
const isValidChain = (blockchain: Block[]): boolean => {
  const isValidGenesis = (block: Block): boolean =>
    JSON.stringify(block) === JSON.stringify(genesisBlock);

  if (!isValidGenesis(blockchain[0])) return false;

  for (let i = 0; i < blockchain.length; i++) {
    if (!isValid(blockchain[i], blockchain[i - 1])) return false;
  }

  return true;
};

const getChain = (): Block[] => blockchain;

/**
 * If there is a conflict with two chains
 * set the longer chain as the valid one
 */
const replaceChain = (newBlocks: Block[]) => {
  if (isValidChain(newBlocks) && newBlocks.length > getChain().length) {
    blockchain = newBlocks;
    // broadcastNew()
  }
};

export {
  getChain,
  getLatest,
  generateNext,
  isValidStructure,
  replaceChain,
  addBlockToChain,
};
