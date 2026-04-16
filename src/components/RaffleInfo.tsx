import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BitcoinSymbol } from './icons/BitcoinIcon';
import {
  formatMicroUnits,
  shortenAddress,
  getJackpotBalance,
  getTotalTickets,
  getTicketPrice,
  getRaffleActive,
  getWinner,
  getMyTickets,
  type WalletState,
} from '@/lib/stacks';
import { Ticket, Trophy, Users, Clock, Coins } from 'lucide-react';

interface RaffleInfoProps {
  walletState: WalletState;
  refreshTrigger: number;
}

interface RaffleData {
  jackpot: bigint;
  totalTickets: bigint;
  ticketPrice: bigint;
  isActive: boolean;
  winner: string | null;
  myTickets: bigint;
}

export const RaffleInfo = ({ walletState, refreshTrigger }: RaffleInfoProps) => {
  const [data, setData] = useState<RaffleData>({
    jackpot: BigInt(0),
    totalTickets: BigInt(0),
    ticketPrice: BigInt(0),
    isActive: true,
    winner: null,
    myTickets: BigInt(0),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jackpot, totalTickets, ticketPrice, isActive, winner] = await Promise.all([
          getJackpotBalance(),
          getTotalTickets(),
          getTicketPrice(),
          getRaffleActive(),
          getWinner(),
        ]);

        let myTickets = BigInt(0);
        if (walletState.isConnected && walletState.address) {
          myTickets = await getMyTickets(walletState.address);
        }

        setData({
          jackpot,
          totalTickets,
          ticketPrice,
          isActive,
          winner,
          myTickets,
        });
      } catch (error) {
        console.error('Error fetching raffle data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [walletState, refreshTrigger]);

  const jackpotDisplay = formatMicroUnits(data.jackpot, 8);
  const ticketPriceDisplay = formatMicroUnits(data.ticketPrice, 8);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {/* Jackpot Card - Full width on mobile, spans 2 cols on larger */}
      <Card className="md:col-span-2 lg:col-span-1 card-gradient border-glow overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative pb-2">
          <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm uppercase tracking-wide">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Current Jackpot
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold jackpot-counter animate-text-glow">
              {isLoading ? '...' : jackpotDisplay}
            </span>
            <span className="text-lg sm:text-xl text-primary font-semibold">sBTC</span>
            <BitcoinSymbol className="text-xl sm:text-2xl text-primary animate-bounce-subtle" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Total pot accumulated from ticket sales
          </p>
        </CardContent>
      </Card>

      {/* Total Tickets */}
      <Card className="card-gradient border-glow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm uppercase tracking-wide">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Total Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
              {isLoading ? '...' : data.totalTickets.toString()}
            </span>
            <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Tickets sold this round
          </p>
        </CardContent>
      </Card>

      {/* Ticket Price */}
      <Card className="card-gradient border-glow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm uppercase tracking-wide">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Ticket Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
              {isLoading ? '...' : ticketPriceDisplay}
            </span>
            <span className="text-base sm:text-lg text-primary font-semibold">sBTC</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Cost per raffle entry
          </p>
        </CardContent>
      </Card>

      {/* Your Tickets */}
      {walletState.isConnected && (
        <Card className="card-gradient border-glow border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm uppercase tracking-wide">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Your Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-primary">
                {isLoading ? '...' : data.myTickets.toString()}
              </span>
              <span className="text-base sm:text-lg text-muted-foreground">tickets</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Your entries in current round
            </p>
          </CardContent>
        </Card>
      )}

      {/* Raffle Status */}
      <Card className="card-gradient border-glow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm uppercase tracking-wide">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant={data.isActive ? 'default' : 'secondary'}
            className={`text-base sm:text-lg px-3 sm:px-4 py-1 ${
              data.isActive
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
            }`}
          >
            {isLoading ? '...' : data.isActive ? '🎰 ACTIVE' : '⏳ DRAWING'}
          </Badge>
          {data.winner && (
            <div className="mt-3">
              <p className="text-xs sm:text-sm text-muted-foreground">Winner:</p>
              <p className="text-xs sm:text-sm font-mono text-primary break-all">
                {shortenAddress(data.winner)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
