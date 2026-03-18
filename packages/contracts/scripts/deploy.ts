import { 
  StellarWallet,
  Contract,
  SorobanRpc,
  Networks,
  xdr
} from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

const networkConfig = {
  standalone: {
    network: Networks.STANDALONE,
    rpc: new SorobanRpc.Server('http://localhost:8000/soroban/rpc'),
    friendbot: 'https://friendbot.stellar.org'
  },
  testnet: {
    network: Networks.TESTNET,
    rpc: new SorobanRpc.Server('https://soroban-testnet.stellar.org'),
    friendbot: 'https://friendbot.stellar.org'
  },
  mainnet: {
    network: Networks.PUBLIC,
    rpc: new SorobanRpc.Server('https://soroban.stellar.org'),
    friendbot: null
  }
};

async function deployContract(network: 'standalone' | 'testnet' | 'mainnet') {
  console.log(`Deploying Muse contracts to ${network}...`);

  const config = networkConfig[network];
  
  // Read the compiled WASM file
  const wasmPath = path.join(__dirname, '../target/wasm32-unknown-unknown/release/muse_contracts.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  
  // Get deployer account
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY environment variable is required');
  }

  const deployerKeypair = StellarWallet.fromSecret(deployerKey);
  const deployerPublicKey = deployerKeypair.publicKey();

  // Fund account if using friendbot
  if (config.friendbot && network !== 'mainnet') {
    console.log('Funding account with friendbot...');
    await fetch(`${config.friendbot}?addr=${deployerPublicKey}`);
  }

  // Get account sequence
  const account = await config.rpc.getAccount(deployerPublicKey);
  
  // Deploy contract
  const contract = new Contract({
    wasm: wasmBuffer,
    source: deployerPublicKey
  });

  // Build transaction
  const transaction = new xdr.TransactionBuilder({
    fee: 100,
    sourceAccount: account,
    networkPassphrase: config.network,
    operations: [
      contract.deploy({
        address: deployerPublicKey
      })
    ]
  }).build();

  // Sign transaction
  transaction.sign(deployerKeypair);

  // Submit transaction
  const result = await config.rpc.sendTransaction(transaction);
  
  if (result.status !== 'SUCCESS') {
    throw new Error(`Transaction failed: ${result.status}`);
  }

  const contractId = result.results[0].contractId;
  console.log(`Contract deployed successfully!`);
  console.log(`Contract ID: ${contractId}`);
  console.log(`Deployer: ${deployerPublicKey}`);

  // Save deployment info
  const deploymentInfo = {
    network,
    contractId,
    deployer: deployerPublicKey,
    deployedAt: new Date().toISOString(),
    transactionHash: result.hash
  };

  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deployizationsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${network}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`Deployment info saved to deployments/${network}.json`);

  // Initialize the contract
  console.log('Initializing contract...');
  await initializeContract(config.rpc, contractId, deployerKeypair, config.network);

  return contractId;
}

async function initializeContract(
  rpc: SorobanRpc.Server,
  contractId: string,
  signerKeypair: StellarWallet,
  networkPassphrase: string
) {
  const contract = new Contract({ contractId });
  
  // Get account
  const account = await rpc.getAccount(signerKeypair.publicKey());
  
  // Build initialize transaction
  const transaction = new xdr.TransactionBuilder({
    fee: 100,
    sourceAccount: account,
    networkPassphrase,
    operations: [
      contract.call('initialize', {
        auth: []
      })
    ]
  }).build();

  // Sign and submit
  transaction.sign(signerKeypair);
  const result = await rpc.sendTransaction(transaction);

  if (result.status !== 'SUCCESS') {
    throw new Error(`Contract initialization failed: ${result.status}`);
  }

  console.log('Contract initialized successfully!');
}

// CLI interface
async function main() {
  const network = process.argv[2] as 'standalone' | 'testnet' | 'mainnet';
  
  if (!network || !['standalone', 'testnet', 'mainnet'].includes(network)) {
    console.error('Usage: npm run deploy:<network>');
    console.error('Available networks: standalone, testnet, mainnet');
    process.exit(1);
  }

  try {
    await deployContract(network);
    console.log('\nDeployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { deployContract, initializeContract };
