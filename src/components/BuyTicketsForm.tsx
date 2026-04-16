import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BitcoinSymbol } from './icons/BitcoinIcon';
import { buyTickets, getUserBalance, formatMicroUnits, type WalletState } from '@/lib/stacks';
import { Ticket, Loader2, Plus, Minus, Sparkles, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BuyTicketsFormProps {
  walletState: WalletState;
  ticketPrice: number;
  onPurchase: () => void;
}

export const BuyTicketsForm = ({ walletState, ticketPrice, onPurchase }: BuyTicketsFormProps) => {
  const [numTickets, setNumTickets] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState<bigint>(BigInt(0));
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { toast } = useToast();

  const totalCost = (numTickets * ticketPrice).toFixed(8);
  const hasEnoughBalance = userBalance >= BigInt(Math.floor(parseFloat(totalCost) * 100000000));

  useEffect(() => {
    const fetchBalance = async () => {
      if (walletState.isConnected && walletState.address) {
        setIsLoadingBalance(true);
        try {
          const balance = await getUserBalance(walletState.address);
          setUserBalance(balance);
        } catch (error) {
          console.error('Error fetching balance:', error);
          toast({
            title: "Error",
            description: "Failed to fetch your sBTC balance.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingBalance(false);
        }
      }
    };

    fetchBalance();
  }, [walletState.isConnected, walletState.address, toast]);

  const handleBuy = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${totalCost} sBTC but only have ${formatMicroUnits(userBalance, 8)} sBTC.`,
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const txId = await buyTickets(numTickets);
      toast({
        title: "Tickets Purchased! ₿",
        description: `Transaction submitted: ${txId.slice(0, 10)}...`,
      });
      onPurchase();
      setNumTickets(1);
      // Refresh balance after purchase
      if (walletState.address) {
        const newBalance = await getUserBalance(walletState.address);
        setUserBalance(newBalance);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Unable to purchase tickets.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const incrementTickets = () => setNumTickets(prev => Math.min(prev + 1, 1000));
  const decrementTickets = () => setNumTickets(prev => Math.max(prev - 1, 1));

  const quickBuyOptions = [1, 5, 10, 25, 50, 100];

  if (!walletState.isConnected) {
    return (
      <Card className="card-gradient border-glow opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Buy Tickets
          </CardTitle>
          <CardDescription>Connect your wallet to purchase tickets</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="card-gradient border-glow relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Ticket className="w-6 h-6 text-primary" />
          Buy Raffle Tickets
          <BitcoinSymbol className="text-primary" />
        </CardTitle>
        <CardDescription>
          Each ticket increases your chance to win the jackpot
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Quick Buy Buttons */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Quick Buy</Label>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
            {quickBuyOptions.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setNumTickets(amount)}
                className={`${
                  numTickets === amount 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-border hover:border-primary hover:text-primary'
                }`}
              >
                {amount} {amount === 1 ? 'Ticket' : 'Tickets'}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <Label htmlFor="tickets" className="text-sm text-muted-foreground">
            Custom Amount
          </Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementTickets}
              disabled={numTickets <= 1}
              className="border-border hover:border-primary hover:text-primary"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              id="tickets"
              type="number"
              min={1}
              max={1000}
              value={numTickets}
              onChange={(e) => setNumTickets(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="text-center text-xl font-bold w-24 bg-secondary border-border"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={incrementTickets}
              disabled={numTickets >= 1000}
              className="border-border hover:border-primary hover:text-primary"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Total Cost */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Cost:</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold text-foreground">
                {totalCost}
              </span>
              <span className="text-lg text-primary font-semibold">sBTC</span>
              <BitcoinSymbol className="text-xl text-primary" />
            </div>
          </div>
        </div>

        {/* User Balance */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Your Balance:</span>
            <div className="flex items-center gap-2">
              {isLoadingBalance ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <span className={`text-xl font-display font-bold ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
                    {formatMicroUnits(userBalance, 8)}
                  </span>
                  <span className="text-lg text-primary font-semibold">sBTC</span>
                  <BitcoinSymbol className="text-xl text-primary" />
                  {!hasEnoughBalance && <AlertTriangle className="w-5 h-5 text-red-400" />}
                </>
              )}
            </div>
          </div>
          {!hasEnoughBalance && (
            <p className="text-sm text-red-400 mt-2">
              Insufficient balance to purchase {numTickets} ticket{numTickets > 1 ? 's' : ''}.
            </p>
          )}
        </div>

        {/* Buy Button */}
        <Button
          onClick={handleBuy}
          disabled={isPurchasing || numTickets < 1 || !hasEnoughBalance}
          className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground glow-orange-intense animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPurchasing ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 mr-2" />
              Buy {numTickets} {numTickets === 1 ? 'Ticket' : 'Tickets'} with sBTC
              <BitcoinSymbol className="ml-2" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Transactions are processed on Stacks Testnet
        </p>
      </CardContent>
    </Card>
  );
};
