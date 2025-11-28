import { useState, useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, Target, TrendingUp, ChevronLeft, ChevronRight, Plus, Flag, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTrades } from "@/lib/mockData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from "date-fns";
import Layout from "@/components/Layout";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
  const [liveGoal, setLiveGoal] = useState<number | null>(2500);
  const [goalInput, setGoalInput] = useState("");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

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

  const goalProgress = liveGoal ? Math.min((monthlyPnl / liveGoal) * 100, 100) : 0;
  const goalAchieved = liveGoal && monthlyPnl >= liveGoal;

  // Analytics Data for LIVE accounts only
  const liveWinTrades = liveTrades.filter(t => t.pnl > 0);
  const liveLossTrades = liveTrades.filter(t => t.pnl < 0);
  const liveAvgWin = liveWinTrades.length > 0 ? liveWinTrades.reduce((acc, t) => acc + t.pnl, 0) / liveWinTrades.length : 0;
  const liveAvgLoss = liveLossTrades.length > 0 ? liveLossTrades.reduce((acc, t) => acc + t.pnl, 0) / liveLossTrades.length : 0;

  // Setup stats
  const setupStats = liveTrades.reduce((acc: any, trade) => {
    if (!acc[trade.setup]) {
      acc[trade.setup] = { name: trade.setup, wins: 0, total: 0, pnl: 0 };
    }
    acc[trade.setup].total += 1;
    acc[trade.setup].pnl += trade.pnl;
    if (trade.pnl > 0) acc[trade.setup].wins += 1;
    return acc;
  }, {});

  const setupData = Object.values(setupStats).map((s: any) => ({
    ...s,
    winRate: Math.round((s.wins / s.total) * 100)
  })).sort((a: any, b: any) => b.pnl - a.pnl);

  // Symbol stats
  const symbolStats = liveTrades.reduce((acc: any, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = { name: trade.symbol, pnl: 0, count: 0, wins: 0 };
    }
    acc[trade.symbol].pnl += trade.pnl;
    acc[trade.symbol].count += 1;
    if (trade.pnl > 0) acc[trade.symbol].wins += 1;
    return acc;
  }, {});

  const symbolData = Object.values(symbolStats).map((s: any) => ({ 
    ...s, 
    winRate: Math.round((s.wins / s.count) * 100) 
  })).sort((a: any, b: any) => b.pnl - a.pnl);

  // Cumulative PnL
  const cumulativeLiveData = liveTrades
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .reduce((acc: any[], trade, index) => {
      const cumulative = (acc[index - 1]?.cumPnl || 0) + trade.pnl;
      acc.push({
        date: format(new Date(trade.entryDate), "MMM dd"),
        cumPnl: cumulative,
        tradeNum: index + 1
      });
      return acc;
    }, []);

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Accounts</h1>
            <p className="text-muted-foreground">Overview of your personal trading performance.</p>
          </div>
          
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Live Account</DialogTitle>
                <DialogDescription>
                  Add a new personal trading account to track.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input placeholder="e.g., Primary Account" />
                </div>
                <div className="space-y-2">
                  <Label>Broker</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select broker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interactive">Interactive Brokers</SelectItem>
                      <SelectItem value="thinkorswim">thinkorswim</SelectItem>
                      <SelectItem value="tradovate">Tradovate</SelectItem>
                      <SelectItem value="lightspeed">Lightspeed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Initial Capital ($)</Label>
                    <Input type="number" placeholder="100000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stocks">Stocks</SelectItem>
                        <SelectItem value="futures">Futures</SelectItem>
                        <SelectItem value="forex">Forex</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="options">Options</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Start Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddAccountOpen(false)}>Add Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">

        {/* Monthly Goal Section */}
        {liveGoal && (
          <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                <CardTitle>Monthly Goal Progress</CardTitle>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Monthly P&L Goal</DialogTitle>
                    <DialogDescription>Update your monthly profit target for live accounts</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Monthly P&L Target ($)</Label>
                      <Input type="number" placeholder="2500" value={goalInput || liveGoal} onChange={(e) => setGoalInput(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setGoalInput("")}>Cancel</Button>
                    <Button onClick={() => {
                      if (goalInput) setLiveGoal(Number(goalInput));
                      setGoalInput("");
                    }}>Save Goal</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Progress</p>
                  <p className="text-2xl font-bold font-mono">${monthlyPnl.toLocaleString()} / ${liveGoal.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${goalAchieved ? 'text-success' : 'text-foreground'}`}>
                    {goalProgress.toFixed(0)}%
                  </p>
                  {goalAchieved && <p className="text-xs text-success font-medium">Goal Achieved! 🎯</p>}
                </div>
              </div>
              <Progress value={goalProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                  <p className={`text-2xl font-bold font-mono ${liveWinRate >= 50 ? 'text-success' : 'text-muted-foreground'}`}>{liveWinRate.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Profit Factor</p>
                  <p className={`text-2xl font-bold font-mono`}>{liveProfitFactor.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Avg Win</p>
                  <p className="text-2xl font-bold font-mono text-success">${liveAvgWin.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Avg Loss</p>
                  <p className="text-2xl font-bold font-mono text-destructive">${liveAvgLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>PnL by Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={setupData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={75} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                        <Bar dataKey="pnl" name="PNL" radius={[0, 4, 4, 0]}>
                          {setupData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Cumulative P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cumulativeLiveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="date" tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
                        <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip />
                        <Line type="monotone" dataKey="cumPnl" name="Cumulative P&L" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Symbol Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {symbolData.slice(0, 5).map((symbol: any) => (
                    <div key={symbol.name} className="flex items-center justify-between p-3 bg-muted/20 rounded">
                      <div className="flex-1">
                        <p className="font-semibold">{symbol.name}</p>
                        <p className="text-xs text-muted-foreground">{symbol.count} trades • {symbol.winRate}% win rate</p>
                      </div>
                      <p className={`font-mono font-bold ${symbol.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {symbol.pnl >= 0 ? '+' : ''}${symbol.pnl.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
