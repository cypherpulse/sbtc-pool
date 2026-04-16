import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BitcoinSymbol } from './icons/BitcoinIcon';
import { connectWallet, disconnectWallet, shortenAddress, type WalletState } from '@/lib/stacks';
import { Wallet, LogOut, Loader2, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectWalletProps {
  walletState: WalletState;
  onWalletChange: (state: WalletState) => void;
}

export const ConnectWallet = ({ walletState, onWalletChange }: ConnectWalletProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const state = await connectWallet();
      onWalletChange(state);
      if (state.isConnected) {
        toast({
          title: "Wallet Connected! ₿",
          description: `Connected to ${shortenAddress(state.address || '')}`,
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    onWalletChange({ isConnected: false, address: null });
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border">
          <BitcoinSymbol className="text-primary text-lg" />
          <span className="text-sm font-medium text-foreground">
            {shortenAddress(walletState.address)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="border-border hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      size="lg"
      className="relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 glow-orange animate-pulse-glow"
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5 mr-2" />
          Connect Wallet
          <Smartphone className="w-4 h-4 ml-2 opacity-70" />
        </>
      )}
    </Button>
  );
};
