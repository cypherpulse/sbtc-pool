import { useState, useEffect, useCallback } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConnectWallet } from '@/components/ConnectWallet';
import { RaffleInfo } from '@/components/RaffleInfo';
import { BuyTicketsForm } from '@/components/BuyTicketsForm';
import { OwnerControls } from '@/components/OwnerControls';
import { WinnerClaim } from '@/components/WinnerClaim';
import { BitcoinSymbol } from '@/components/icons/BitcoinIcon';
import { getWalletState, getTicketPrice, formatMicroUnits, type WalletState } from '@/lib/stacks';
import { Sparkles, ExternalLink, Zap } from 'lucide-react';

function App() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [ticketPrice, setTicketPrice] = useState(0.01);

  // Check initial wallet state
  useEffect(() => {
    const state = getWalletState();
    setWalletState(state);
  }, []);

  // Fetch ticket price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getTicketPrice();
        setTicketPrice(parseFloat(formatMicroUnits(price, 8)));
      } catch (error) {
        console.error('Error fetching ticket price:', error);
      }
    };
    fetchPrice();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen hero-gradient">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <BitcoinSymbol className="text-4xl sm:text-5xl text-primary animate-float" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-foreground">
                    sBTC Lucky Raffle
                  </h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    Powered by Stacks L2
                  </p>
                </div>
              </div>
              <ConnectWallet walletState={walletState} onWalletChange={setWalletState} />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm text-primary font-medium">
                  Stacks Builder Challenge #3
                </span>
                <BitcoinSymbol className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                Win the{' '}
                <span className="text-glow-orange jackpot-counter">
                  sBTC Jackpot
                </span>
                {' '}<BitcoinSymbol className="inline text-primary w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              </h2>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Buy tickets with sBTC, increase your odds, and win the entire pot!
                Fully decentralized on Bitcoin L2.
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="space-y-6 sm:space-y-8">
              {/* Winner Claim - Shows when user is winner */}
              <WinnerClaim
                walletState={walletState}
                onClaim={handleRefresh}
                refreshTrigger={refreshTrigger}
              />

              {/* Raffle Stats */}
              <RaffleInfo walletState={walletState} refreshTrigger={refreshTrigger} />

              {/* Action Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <BuyTicketsForm
                  walletState={walletState}
                  ticketPrice={ticketPrice}
                  onPurchase={handleRefresh}
                />
                
                <div className="space-y-4 sm:space-y-6">
                  <OwnerControls walletState={walletState} onAction={handleRefresh} />
                  
                  {/* How It Works */}
                  <div className="p-4 sm:p-6 rounded-xl card-gradient border-glow">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      How It Works
                    </h3>
                    <ol className="space-y-2 sm:space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
                        <span className="text-sm sm:text-base">Connect your Stacks wallet (Leather/Xverse)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
                        <span className="text-sm sm:text-base">Buy raffle tickets with sBTC (testnet)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
                        <span className="text-sm sm:text-base">When the raffle ends, a random winner is drawn</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">4</span>
                        <span className="text-sm sm:text-base">Winner claims the entire sBTC pot!</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BitcoinSymbol className="text-primary" />
                <span>sBTC Lucky Raffle - Stacks Testnet</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://explorer.hiro.so/address/STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-lucky-raffle?chain=testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  View Contract
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://cloud.reown.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  WalletConnect
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
