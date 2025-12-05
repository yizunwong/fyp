import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import type { Traceability } from '../../../blockchain/typechain-types';
import * as fs from 'fs';
import * as path from 'path';
import { formatError, toError } from 'src/common/helpers/error';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  private provider?: ethers.JsonRpcProvider;
  private wallet?: ethers.Wallet;

  // Strongly type the contract to avoid unsafe access
  private contract?: Traceability;

  private get rpcUrl(): string {
    return process.env.RPC_URL || 'http://127.0.0.1:8545';
  }

  private get privateKey(): string {
    const key = process.env.PRIVATE_KEY;
    if (!key) {
      throw new Error('Missing PRIVATE_KEY in environment.');
    }
    return key.trim();
  }

  private get contractAddress(): string {
    const addr = process.env.TRACEABILITY_ADDRESS;
    if (!addr) {
      throw new Error('Missing TRACEABILITY_ADDRESS in environment.');
    }
    return addr.trim();
  }

  private getAbi(): ethers.InterfaceAbi {
    // Resolve artifact path dynamically from project root
    const projectRoot = process.cwd(); // e.g., C:\Users\yizun\Documents\own-project\fyp
    const artifactPath = path.resolve(
      projectRoot,
      'artifacts/contracts/Traceability.sol/Traceability.json',
    );

    if (!fs.existsSync(artifactPath)) {
      throw new Error(
        `Contract artifact not found at ${artifactPath}. Please run 'npx hardhat compile' first.`,
      );
    }

    const artifactRaw = fs.readFileSync(artifactPath, 'utf-8');
    const artifact = JSON.parse(artifactRaw) as { abi?: ethers.InterfaceAbi };
    if (!artifact.abi) {
      throw new Error('ABI not found in compiled artifact JSON.');
    }
    return artifact.abi;
  }

  private ensureInitialized() {
    if (!this.provider) {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    }
    if (!this.wallet) {
      this.wallet = new ethers.Wallet(this.privateKey, this.provider);
    }
    if (!this.contract) {
      const abi = this.getAbi();
      this.contract = new ethers.Contract(
        this.contractAddress,
        abi,
        this.wallet,
      ) as unknown as Traceability;
    }
  }

  private getContract(): Traceability {
    this.ensureInitialized();
    if (!this.contract) {
      // Defensive, should not happen
      throw new Error('Contract not initialized');
    }
    return this.contract;
  }

  async recordProduce(
    batchId: string,
    produceHash: string,
    qrHash: string,
  ): Promise<string> {
    try {
      const contract = this.getContract();
      const tx = await contract.recordProduce(batchId, produceHash, qrHash);
      this.logger.log(`recordProduce tx: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt?.status !== 1) {
        throw new Error('Transaction failed');
      }
      return tx.hash;
    } catch (e: unknown) {
      this.logger.error(`recordProduce error: ${formatError(e)}`);
      throw toError(e);
    }
  }

  async getProduceHash(batchId: string): Promise<string> {
    try {
      const contract = this.getContract();
      const produce = await contract.getProduce(batchId);
      return produce.produceHash;
    } catch (e: unknown) {
      this.logger.error(`getProduceHash error: ${formatError(e)}`);
      throw toError(e);
    }
  }

  async verifyProduce(batchId: string, hashToCheck: string): Promise<boolean> {
    try {
      const contract = this.getContract();
      const result = await contract.verifyProduce(batchId, hashToCheck);
      return result;
    } catch (e: unknown) {
      this.logger.error(`verifyProduce error: ${formatError(e)}`);
      throw toError(e);
    }
  }

  async confirmOnChain(txHash: string): Promise<boolean> {
    try {
      this.ensureInitialized();
      const receipt = await this.provider!.getTransactionReceipt(txHash);
      if (!receipt) return false;
      return receipt.status === 1;
    } catch (e: unknown) {
      this.logger.error(`confirmOnChain error: ${formatError(e)}`);
      throw toError(e);
    }
  }
}
