import { useState, useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, Target, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockTrades } from "@/lib/mockData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from "date-fns";
import Layout from "@/components/Layout";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded shadow-xl">
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        <p className="text-primary font-bold font-mono">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filter to LIVE trades only
  const liveTrades = mockTrades.filter(t => t.accountType === "LIVE");

  // Calculate cumulative PnL for the chart (LIVE only)
  let runningTotal = 100000;
  const chartData = [...liveTrades].reverse().map(trade => {
    runningTotal += trade.pnl;
    return {
      date: format(new Date(trade.entryDate), "MMM dd"),
      equity: runningTotal,
    };
  });

  // Calculate LIVE account metrics
  const liveTotalPnl = liveTrades.reduce((acc, t) => acc + t.pnl, 0);
  const liveWins = liveTrades.filter(t => t.status === "WIN").length;
  const liveWinRate = liveTrades.length > 0 ? (liveWins / liveTrades.length) * 100 : 0;
  const liveTotalProfit = liveTrades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const liveTotalLoss = Math.abs(liveTrades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
  const liveProfitFactor = liveTotalLoss > 0 ? liveTotalProfit / liveTotalLoss : liveTotalProfit > 0 ? 999 : 0;

  // Calendar logic
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth));
  const emptyDays = Array(startDay).fill(null);

  const getDayStats = (date: Date) => {
    const dayTrades = liveTrades.filter(t => isSameDay(new Date(t.entryDate), date));
    const dayPnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
    
    return { dayPnl, tradeCount: dayTrades.length };
  };

  const monthlyPnl = useMemo(() => {
     const start = startOfMonth(currentMonth);
     const end = endOfMonth(currentMonth);
     
     return liveTrades
       .filter(t => {
          const tradeDate = new Date(t.entryDate);
          return tradeDate >= start && tradeDate <= end;
       })
       .reduce((acc, t) => acc + t.pnl, 0);
  }, [currentMonth, liveTrades]);

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your trading performance.</p>
        </div>

        {/* Stats Grid - LIVE ACCOUNT ONLY */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${liveTotalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {liveTotalPnl >= 0 ? '+' : ''}${liveTotalPnl.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Live account • All time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {liveWinRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {liveTrades.length} trades
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profit Factor</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {liveProfitFactor.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gross Profit / Gross Loss
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg R:R</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                1.85
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average Risk/Reward
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Equity Curve */}
        <Card className="col-span-4 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }} />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Heatmap - LIVE ACCOUNT ONLY */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Daily Performance Calendar</h2>
              <p className="text-sm text-muted-foreground mt-1">Live account trading activity</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly P&L</span>
                <span className={`text-xl font-mono font-bold ${monthlyPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {monthlyPnl >= 0 ? '+' : ''}${monthlyPnl.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-semibold min-w-[120px] text-center text-sm">
                  {format(currentMonth, "MMM yyyy")}
                </div>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-xs font-medium text-muted-foreground uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="bg-transparent" />
            ))}
            
            {daysInMonth.map(date => {
              const { dayPnl, tradeCount } = getDayStats(date);
              const hasTrades = tradeCount > 0;
              
              return (
                <Card key={date.toISOString()} className={`min-h-[100px] flex flex-col overflow-hidden transition-all hover:ring-1 hover:ring-primary ${hasTrades ? (dayPnl >= 0 ? 'bg-success/8 border-success/20' : 'bg-destructive/8 border-destructive/20') : 'bg-card/30 border-border/50'}`}>
                  <CardHeader className="p-2 pb-0 flex flex-row justify-between items-start">
                    <span className={`text-xs font-medium ${!isSameMonth(date, currentMonth) ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}>
                      {format(date, "d")}
                    </span>
                    {hasTrades && (
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {tradeCount}T
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="p-2 flex-1 flex flex-col justify-center items-center">
                    {hasTrades ? (
                      <div className="w-full text-center">
                        <div className={`text-sm font-bold font-mono ${dayPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {dayPnl >= 0 ? '+' : ''}${dayPnl}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/20 text-xs">-</span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Trades Preview - LIVE ONLY */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Live Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {liveTrades.slice(0, 5).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/30 hover:bg-card/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-md ${trade.pnl >= 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                      {trade.pnl >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-bold">{trade.symbol}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(trade.entryDate), "MMM dd, HH:mm")} • {trade.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                    </div>
                    <div className="text-xs text-muted-foreground">{trade.setup}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
