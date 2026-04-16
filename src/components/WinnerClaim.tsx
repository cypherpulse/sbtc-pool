import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BitcoinSymbol } from './icons/BitcoinIcon';
import { claimPrize, getWinner, getJackpotBalance, formatMicroUnits, type WalletState } from '@/lib/stacks';
import { PartyPopper, Loader2, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface WinnerClaimProps {
  walletState: WalletState;
  onClaim: () => void;
  refreshTrigger: number;
}

export const WinnerClaim = ({ walletState, onClaim, refreshTrigger }: WinnerClaimProps) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [jackpot, setJackpot] = useState(BigInt(0));
  const { toast } = useToast();

  useEffect(() => {
    const checkWinner = async () => {
      try {
        const winner = await getWinner();
        const balance = await getJackpotBalance();
        setJackpot(balance);
        
        if (walletState.isConnected && walletState.address && winner) {
          setIsWinner(winner === walletState.address);
        } else {
          setIsWinner(false);
        }
      } catch (error) {
        console.error('Error checking winner:', error);
      }
    };

    checkWinner();
  }, [walletState, refreshTrigger]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF5C00', '#FFD700', '#FF8C00'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF5C00', '#FFD700', '#FF8C00'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const txId = await claimPrize();
      triggerConfetti();
      toast({
        title: "Prize Claimed! 🎉₿",
        description: `Congratulations! Transaction: ${txId.slice(0, 10)}...`,
      });
      onClaim();
    } catch (error) {
      console.error('Claim error:', error);
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "Unable to claim prize.",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isWinner) {
    return null;
  }

  return (
    <Card className="border-2 border-primary bg-primary/10 glow-orange-intense animate-pulse-glow">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <PartyPopper className="w-12 h-12 sm:w-16 sm:h-16 text-primary animate-bounce-subtle" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-display text-primary animate-text-glow">
          🎉 YOU WON! 🎉
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-foreground">
          Congratulations! You are the lucky winner!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="text-center p-4 sm:p-6 rounded-lg bg-secondary/50 border border-primary/30">
          <p className="text-sm text-muted-foreground mb-2">Your Prize:</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-display font-bold jackpot-counter">
              {formatMicroUnits(jackpot, 8)}
            </span>
            <span className="text-xl sm:text-2xl text-primary font-semibold">sBTC</span>
            <BitcoinSymbol className="text-2xl sm:text-3xl text-primary animate-bounce-subtle" />
          </div>
        </div>

        <Button
          onClick={handleClaim}
          disabled={isClaiming}
          className="w-full h-12 sm:h-16 text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-yellow-500 to-primary hover:from-primary/90 hover:via-yellow-400 hover:to-primary/90 text-white glow-orange-intense"
        >
          {isClaiming ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 animate-spin" />
              Claiming Your sBTC...
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
              Claim Your sBTC Prize
              <BitcoinSymbol className="ml-2 sm:ml-3 text-xl sm:text-2xl" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
