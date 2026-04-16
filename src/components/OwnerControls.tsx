import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { drawWinner, CONTRACT_OWNER, type WalletState } from '@/lib/stacks';
import { Crown, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OwnerControlsProps {
  walletState: WalletState;
  onAction: () => void;
}

export const OwnerControls = ({ walletState, onAction }: OwnerControlsProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  // Only show if connected wallet is the contract owner
  const isOwner = walletState.isConnected && walletState.address === CONTRACT_OWNER;

  if (!isOwner) {
    return null;
  }

  const handleDrawWinner = async () => {
    setIsDrawing(true);
    try {
      const txId = await drawWinner();
      toast({
        title: "Draw Winner Initiated! 🎲",
        description: `Transaction submitted: ${txId.slice(0, 10)}...`,
      });
      onAction();
    } catch (error) {
      console.error('Draw winner error:', error);
      toast({
        title: "Draw Failed",
        description: error instanceof Error ? error.message : "Unable to draw winner.",
        variant: "destructive",
      });
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400 text-lg sm:text-xl">
          <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
          Owner Controls
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Administrative functions for the raffle contract owner
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleDrawWinner}
          disabled={isDrawing}
          className="w-full h-12 sm:h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base"
        >
          {isDrawing ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              Drawing Winner...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Draw Random Winner
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
