import * as StellarSdk from 'stellar-sdk'
import { Networks } from 'stellar-sdk'

export interface StellarConfig {
  network: 'testnet' | 'mainnet' | 'standalone'
  rpcUrl: string
  contractId?: string
}

export class StellarService {
  private server: StellarSdk.SorobanRpc.Server
  private network: 'testnet' | 'mainnet' | 'standalone'
  private contractId?: string

  constructor(config: StellarConfig) {
    this.network = config.network
    this.server = new StellarSdk.SorobanRpc.Server(config.rpcUrl)
    this.contractId = config.contractId
  }

  getNetworkPassphrase(): string {
    switch (this.network) {
      case 'testnet':
        return Networks.TESTNET
      case 'mainnet':
        return Networks.PUBLIC
      case 'standalone':
        return 'Standalone Network ; February 2017'
      default:
        throw new Error(`Unsupported network: ${this.network}`)
    }
  }

  async getAccount(publicKey: string): Promise<StellarSdk.Account> {
    try {
      return await this.server.getAccount(publicKey)
    } catch (error) {
      throw new Error(`Failed to get account ${publicKey}: ${error}`)
    }
  }

  async getAccountBalance(publicKey: string): Promise<string> {
    try {
      const account = await this.getAccount(publicKey)
      const balance = account.balances.find(
        (b: any) => b.asset_type === 'native'
      )?.balance || '0'
      return balance
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error}`)
    }
  }

  async submitTransaction(transaction: StellarSdk.Transaction): Promise<{
    hash: string
    status: 'success' | 'pending' | 'error'
    error?: string
  }> {
    try {
      const result = await this.server.sendTransaction(transaction)

      if (result.status === 'PENDING') {
        // Wait for transaction confirmation
        const txResult = await this.server.getTransaction(result.hash)
        return {
          hash: result.hash,
          status: 'success',
        }
      } else {
        return {
          hash: result.hash,
          status: 'error',
          error: result.status,
        }
      }
    } catch (error) {
      throw new Error(`Failed to submit transaction: ${error}`)
    }
  }

  createContractCall(
    contractId: string,
    method: string,
    params: any[] = [],
    publicKey: string
  ): StellarSdk.Transaction {
    const contract = new StellarSdk.Contract(contractId)
    const account = new StellarSdk.Account(publicKey, '-1') // Will be updated when submitting

    const operation = contract.call(method, ...params)

    return new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.getNetworkPassphrase(),
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()
  }

  async callContractMethod(
    contractId: string,
    method: string,
    params: any[] = [],
    publicKey: string
  ): Promise<any> {
    try {
      const transaction = this.createContractCall(contractId, method, params, publicKey)
      
      // Simulate the transaction to get the result
      const result = await this.server.simulateTransaction(transaction)
      
      if (result.results && result.results.length > 0) {
        const callResult = result.results[0]
        if (callResult.xdr) {
          // Parse the result XDR
          const scVal = StellarSdk.xdr.ScVal.fromXDR(callResult.xdr, 'base64')
          return this.parseScVal(scVal)
        }
      }
      
      throw new Error('No result returned from contract call')
    } catch (error) {
      throw new Error(`Failed to call contract method ${method}: ${error}`)
    }
  }

  private parseScVal(scVal: StellarSdk.xdr.ScVal): any {
    switch (scVal.switch()) {
      case StellarSdk.xdr.ScValType.scvVoid:
        return null
      case StellarSdk.xdr.ScValType.scvBool:
        return scVal.bool()
      case StellarSdk.xdr.ScValType.scvI32:
        return scVal.i32()
      case StellarSdk.xdr.ScValType.scvI64:
        return scVal.i64().toString()
      case StellarSdk.xdr.ScValType.scvU32:
        return scVal.u32()
      case StellarSdk.xdr.ScValType.scvU64:
        return scVal.u64().toString()
      case StellarSdk.xdr.ScValType.scvString:
        return scVal.str().toString()
      case StellarSdk.xdr.ScValType.scvSymbol:
        return scVal.sym().toString()
      case StellarSdk.xdr.ScValType.scvAddress:
        return scVal.address().toString()
      case StellarSdk.xdr.ScValType.scvMap:
        const map = new Map()
        scVal.map().forEach((entry) => {
          map.set(this.parseScVal(entry.key), this.parseScVal(entry.val))
        })
        return map
      case StellarSdk.xdr.ScValType.scvVec:
        return scVal.vec().map((val) => this.parseScVal(val))
      default:
        return scVal
    }
  }

  async getArtworks(contractId: string): Promise<any[]> {
    try {
      const result = await this.callContractMethod(contractId, 'get_active_listings', [])
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('Failed to get artworks:', error)
      return []
    }
  }

  async getArtwork(contractId: string, artworkId: number): Promise<any> {
    try {
      return await this.callContractMethod(contractId, 'get_artwork', [artworkId])
    } catch (error) {
      throw new Error(`Failed to get artwork ${artworkId}: ${error}`)
    }
  }

  async getUserArtworks(contractId: string, publicKey: string): Promise<any[]> {
    try {
      const result = await this.callContractMethod(contractId, 'get_user_artworks', [publicKey])
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('Failed to get user artworks:', error)
      return []
    }
  }

  async createArtwork(
    contractId: string,
    creator: string,
    title: string,
    description: string,
    imageUrl: string,
    prompt: string,
    aiModel: string,
    price: string,
    royaltyBps: number
  ): Promise<string> {
    try {
      const transaction = this.createContractCall(
        contractId,
        'create_artwork',
        [creator, title, description, imageUrl, prompt, aiModel, price, royaltyBps],
        creator
      )

      const result = await this.submitTransaction(transaction)
      return result.hash
    } catch (error) {
      throw new Error(`Failed to create artwork: ${error}`)
    }
  }

  async listArtwork(
    contractId: string,
    seller: string,
    artworkId: number,
    price: string,
    duration: number
  ): Promise<string> {
    try {
      const transaction = this.createContractCall(
        contractId,
        'list_artwork',
        [seller, artworkId, price, duration],
        seller
      )

      const result = await this.submitTransaction(transaction)
      return result.hash
    } catch (error) {
      throw new Error(`Failed to list artwork: ${error}`)
    }
  }

  async buyArtwork(
    contractId: string,
    buyer: string,
    listingId: number,
    amount: string
  ): Promise<string> {
    try {
      const transaction = this.createContractCall(
        contractId,
        'buy_artwork',
        [buyer, listingId, amount],
        buyer
      )

      const result = await this.submitTransaction(transaction)
      return result.hash
    } catch (error) {
      throw new Error(`Failed to buy artwork: ${error}`)
    }
  }

  async makeOffer(
    contractId: string,
    offeror: string,
    listingId: number,
    amount: string,
    duration: number
  ): Promise<string> {
    try {
      const transaction = this.createContractCall(
        contractId,
        'make_offer',
        [offeror, listingId, amount, duration],
        offeror
      )

      const result = await this.submitTransaction(transaction)
      return result.hash
    } catch (error) {
      throw new Error(`Failed to make offer: ${error}`)
    }
  }

  async acceptOffer(
    contractId: string,
    seller: string,
    listingId: number,
    offerIndex: number
  ): Promise<string> {
    try {
      const transaction = this.createContractCall(
        contractId,
        'accept_offer',
        [seller, listingId, offerIndex],
        seller
      )

      const result = await this.submitTransaction(transaction)
      return result.hash
    } catch (error) {
      throw new Error(`Failed to accept offer: ${error}`)
    }
  }
}

// Create singleton instance
let stellarService: StellarService

export function getStellarService(): StellarService {
  if (!stellarService) {
    const config: StellarConfig = {
      network: process.env.STELLAR_NETWORK as 'testnet' | 'mainnet' || 'testnet',
      rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
      contractId: process.env.STELLAR_CONTRACT_ID,
    }
    stellarService = new StellarService(config)
  }
  return stellarService
}
