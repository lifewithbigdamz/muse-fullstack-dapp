import { useState, useEffect, useCallback } from 'react'
import * as StellarSdk from '@stellar/stellar-sdk'
import { freighterApi } from '@stellar/freighter-api'

export interface StellarAccount {
  publicKey: string
  isConnected: boolean
  balance?: string
}

export interface StellarTransaction {
  hash: string
  status: 'pending' | 'success' | 'error'
  error?: string
}

export function useStellar() {
  const [account, setAccount] = useState<StellarAccount>({
    publicKey: '',
    isConnected: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet')

  const server = new StellarSdk.SorobanRpc.Server(
    network === 'testnet' 
      ? 'https://soroban-testnet.stellar.org'
      : 'https://soroban.stellar.org'
  )

  const connectWallet = useCallback(async () => {
    setIsLoading(true)
    try {
      const { publicKey } = await freighterApi.getPublicKey()
      
      if (publicKey) {
        setAccount({
          publicKey,
          isConnected: true,
        })

        // Get account balance
        try {
          const accountObj = await server.getAccount(publicKey)
          const balance = accountObj.balances.find(
            (b: any) => b.asset_type === 'native'
          )?.balance || '0'
          
          setAccount(prev => ({
            ...prev,
            balance,
          }))
        } catch (balanceError) {
          console.error('Failed to fetch balance:', balanceError)
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [server])

  const disconnectWallet = useCallback(() => {
    setAccount({
      publicKey: '',
      isConnected: false,
    })
  }, [])

  const signTransaction = useCallback(async (
    xdr: string,
    networkPassphrase: string
  ): Promise<string> => {
    try {
      const result = await freighterApi.signTransaction(xdr, networkPassphrase)
      return result
    } catch (error) {
      console.error('Failed to sign transaction:', error)
      throw error
    }
  }, [])

  const sendTransaction = useCallback(async (
    transaction: StellarSdk.Transaction
  ): Promise<StellarTransaction> => {
    try {
      const networkPassphrase = network === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC

      // Sign the transaction
      const signedXdr = await signTransaction(
        transaction.toXDR(),
        networkPassphrase
      )

      // Submit the transaction
      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        networkPassphrase
      )

      const result = await server.sendTransaction(signedTransaction)

      if (result.status === 'PENDING') {
        // Wait for transaction confirmation
        const txResult = await server.getTransaction(result.hash)
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
      console.error('Failed to send transaction:', error)
      return {
        hash: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }, [network, server, signTransaction])

  const createContractCall = useCallback((
    contractId: string,
    method: string,
    params: any[] = []
  ) => {
    const contract = new StellarSdk.Contract(contractId)
    return contract.call(method, ...params)
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!account.isConnected || !account.publicKey) return

    try {
      const accountObj = await server.getAccount(account.publicKey)
      const balance = accountObj.balances.find(
        (b: any) => b.asset_type === 'native'
      )?.balance || '0'
      
      setAccount(prev => ({
        ...prev,
        balance,
      }))
    } catch (error) {
      console.error('Failed to refresh balance:', error)
    }
  }, [account.isConnected, account.publicKey, server])

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        const { publicKey } = await freighterApi.getPublicKey()
        if (publicKey) {
          setAccount({
            publicKey,
            isConnected: true,
          })
          refreshBalance()
        }
      } catch (error) {
        // Wallet not connected
      }
    }

    checkConnection()
  }, [refreshBalance])

  return {
    account,
    isLoading,
    network,
    server,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    createContractCall,
    refreshBalance,
    setNetwork,
  }
}
