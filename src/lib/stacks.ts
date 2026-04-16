import { request, connect, disconnect, getLocalStorage } from '@stacks/connect';
import { Cl, cvToValue, serializeCV, callReadOnlyFunction } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import type { ClarityValue } from '@stacks/transactions';

type ContractId = `${string}.${string}`;

// Helper to convert Uint8Array to hex string
const toHex = (bytes: Uint8Array): string => {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Contract addresses
export const RAFFLE_CONTRACT_ADDRESS = 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y';
export const RAFFLE_CONTRACT_NAME = 'sbtc-lucky-raffle';
export const SBTC_TOKEN_ADDRESS = 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y';
export const SBTC_TOKEN_NAME = 'sbtc-token';

// Contract owner for admin detection
export const CONTRACT_OWNER = 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y';

// WalletConnect Project ID - Replace with your own from cloud.reown.com
export const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

// Network configuration
export const NETWORK = 'testnet';
export const NETWORK_OBJ = new StacksTestnet();

export interface WalletState {
  isConnected: boolean;
  address: string | null;
}

export const getWalletState = (): WalletState => {
  try {
    const localStorage = getLocalStorage();
    if (localStorage?.addresses?.stx) {
      const addresses = localStorage.addresses.stx;
      const testnetAddress = addresses.find((addr) => addr.address.startsWith('ST'));
      if (testnetAddress) {
        return {
          isConnected: true,
          address: testnetAddress.address,
        };
      }
    }
  } catch (error) {
    console.error('Error getting wallet state:', error);
  }
  return { isConnected: false, address: null };
};

export const connectWallet = async (): Promise<WalletState> => {
  try {
    const response = await connect({
      walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
      network: NETWORK,
    });
    
    if (response && response.addresses) {
      const testnetAddress = response.addresses.find(
        (addr) => addr.address.startsWith('ST')
      );
      if (testnetAddress) {
        return {
          isConnected: true,
          address: testnetAddress.address,
        };
      }
    }
    
    return { isConnected: false, address: null };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

export const disconnectWallet = async (): Promise<void> => {
  try {
    disconnect();
  } catch (error) {
    console.error('Wallet disconnect error:', error);
  }
};

// Helper to make read-only API calls via Stacks API
export const callReadOnly = async <T>(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[] = [],
  senderAddress?: string
): Promise<T> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      network: NETWORK_OBJ,
      senderAddress: senderAddress || contractAddress,
    });
    return cvToValue(result) as T;
  } catch (error) {
    console.error('Read-only call error:', error);
    throw error;
  }
};

// Get ticket price
export const getTicketPrice = async (): Promise<bigint> => {
  try {
    const result = await callReadOnly<bigint>(
      RAFFLE_CONTRACT_ADDRESS,
      RAFFLE_CONTRACT_NAME,
      'get-ticket-price'
    );
    return result;
  } catch (error) {
    console.error('Error getting ticket price:', error);
    return BigInt(100000000); // 0.01 sBTC default
  }
};

// Get total tickets sold
export const getTotalTickets = async (): Promise<bigint> => {
  try {
    const result = await callReadOnly<bigint>(
      RAFFLE_CONTRACT_ADDRESS,
      RAFFLE_CONTRACT_NAME,
      'get-total-tickets'
    );
    return result;
  } catch (error) {
    console.error('Error getting total tickets:', error);
    return BigInt(0);
  }
};

// Get user's tickets
export const getMyTickets = async (userAddress: string): Promise<bigint> => {
  try {
    const result = await callReadOnly<bigint>(
      RAFFLE_CONTRACT_ADDRESS,
      RAFFLE_CONTRACT_NAME,
      'get-my-tickets',
      [],
      userAddress
    );
    return result;
  } catch (error) {
    console.error('Error getting my tickets:', error);
    return BigInt(0);
  }
};

// Get raffle active status
export const getRaffleActive = async (): Promise<boolean> => {
  return await callReadOnly<boolean>(
    RAFFLE_CONTRACT_ADDRESS,
    RAFFLE_CONTRACT_NAME,
    'get-raffle-active'
  );
};

// Get winner
export const getWinner = async (): Promise<string | null> => {
  try {
    const result = await callReadOnly<string | null>(
      RAFFLE_CONTRACT_ADDRESS,
      RAFFLE_CONTRACT_NAME,
      'get-winner'
    );
    return result;
  } catch (error) {
    console.error('Error getting winner:', error);
    return null;
  }
};

// Get sBTC balance of contract (jackpot)
export const getJackpotBalance = async (): Promise<bigint> => {
  try {
    const contractPrincipal = `${RAFFLE_CONTRACT_ADDRESS}.${RAFFLE_CONTRACT_NAME}`;
    const result = await callReadOnly<bigint>(
      SBTC_TOKEN_ADDRESS,
      SBTC_TOKEN_NAME,
      'get-balance',
      [Cl.principal(contractPrincipal)]
    );
    return result;
  } catch (error) {
    console.error('Error getting jackpot balance:', error);
    return BigInt(0);
  }
};

// Get user's sBTC balance
export const getUserBalance = async (userAddress: string): Promise<bigint> => {
  try {
    const result = await callReadOnly<bigint>(
      SBTC_TOKEN_ADDRESS,
      SBTC_TOKEN_NAME,
      'get-balance',
      [Cl.principal(userAddress)]
    );
    return result;
  } catch (error) {
    console.error('Error getting user balance:', error);
    return BigInt(0);
  }
};

// Buy tickets
export const buyTickets = async (numTickets: number): Promise<string> => {
  const contract: ContractId = `${RAFFLE_CONTRACT_ADDRESS}.${RAFFLE_CONTRACT_NAME}`;
  
  const response = await request(
    { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
    'stx_callContract',
    {
      contract,
      functionName: 'buy-tickets',
      functionArgs: [toHex(Cl.serialize(Cl.uint(numTickets)))],
      network: 'testnet',
    }
  );
  
  return response.txid || '';
};

// Draw winner (owner only)
export const drawWinner = async (): Promise<string> => {
  const contract: ContractId = `${RAFFLE_CONTRACT_ADDRESS}.${RAFFLE_CONTRACT_NAME}`;
  
  const response = await request(
    { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
    'stx_callContract',
    {
      contract,
      functionName: 'draw-winner',
      functionArgs: [],
      network: 'testnet',
    }
  );
  
  return response.txid || '';
};

// Claim prize (winner only)
export const claimPrize = async (): Promise<string> => {
  const contract: ContractId = `${RAFFLE_CONTRACT_ADDRESS}.${RAFFLE_CONTRACT_NAME}`;
  
  const response = await request(
    { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
    'stx_callContract',
    {
      contract,
      functionName: 'claim-prize',
      functionArgs: [],
      network: 'testnet',
    }
  );
  
  return response.txid || '';
};

// Helper to split contract address
export function splitContractAddress(address: string): [string, string] {
  const [contractAddress, contractName] = address.split('.');
  return [contractAddress, contractName];
}

// Format address for display (shortened)
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Convert micro-units to display units
export function formatMicroUnits(microUnits: number | bigint, decimals: number = 6): string {
  const value = Number(microUnits) / Math.pow(10, decimals);
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: decimals 
  });
}

// Convert STX to sBTC equivalent (approximate rate for display)
export function stxToSbtc(stxMicroUnits: number | bigint): string {
  // Approximate conversion rate (1 STX ≈ 0.00001 BTC for demo)
  const btcValue = Number(stxMicroUnits) / 1_000_000 * 0.00001;
  return btcValue.toFixed(8);
}
