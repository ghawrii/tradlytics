import Layout from "@/components/Layout";
import { mockTrades } from "@/lib/mockData";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { TrendingUp, TrendingDown, Target, BarChart3, Zap } from "lucide-react";

export default function Analytics() {
  
  // Filter for LIVE accounts only
  const liveTrades = mockTrades.filter(t => t.accountType === "LIVE");
  
  // ============ CORE METRICS ============
  const totalTrades = liveTrades.length;
  const winTrades = liveTrades.filter(t => t.pnl > 0);
  const lossTrades = liveTrades.filter(t => t.pnl < 0);
  const breakEvenTrades = liveTrades.filter(t => t.pnl === 0);
  
  const winRate = (winTrades.length / totalTrades) * 100;
  const totalGrossProfit = winTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalGrossLoss = lossTrades.reduce((acc, t) => acc + t.pnl, 0);
  const netProfit = totalGrossProfit + totalGrossLoss;
  const profitFactor = totalGrossLoss !== 0 ? totalGrossProfit / Math.abs(totalGrossLoss) : totalGrossProfit > 0 ? Infinity : 0;
  
  const avgWin = winTrades.length > 0 ? totalGrossProfit / winTrades.length : 0;
  const avgLoss = lossTrades.length > 0 ? totalGrossLoss / lossTrades.length : 0;
  const avgTrade = netProfit / totalTrades;
  
  const largestWin = winTrades.length > 0 ? Math.max(...winTrades.map(t => t.pnl)) : 0;
  const largestLoss = lossTrades.length > 0 ? Math.min(...lossTrades.map(t => t.pnl)) : 0;
  
  const riskRewardRatio = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : avgWin > 0 ? Infinity : 0;

  // ============ SETUP STATISTICS ============
  const setupStats = liveTrades.reduce((acc, trade) => {
    if (!acc[trade.setup]) {
      acc[trade.setup] = { name: trade.setup, wins: 0, total: 0, pnl: 0, trades: [] };
    }
    acc[trade.setup].total += 1;
    acc[trade.setup].pnl += trade.pnl;
    acc[trade.setup].trades.push(trade);
    if (trade.pnl > 0) acc[trade.setup].wins += 1;
    return acc;
  }, {} as Record<string, { name: string; wins: number; total: number; pnl: number; trades: any[] }>);

  const setupData = Object.values(setupStats).map(s => ({
    ...s,
    winRate: Math.round((s.wins / s.total) * 100),
    avgPnl: s.pnl / s.total
  })).sort((a, b) => b.pnl - a.pnl);

  // ============ TIME-BASED STATISTICS ============
  const dayStats = liveTrades.reduce((acc, trade) => {
    const day = format(new Date(trade.entryDate), "EEEE");
    if (!acc[day]) {
      acc[day] = { name: day, pnl: 0, count: 0, wins: 0 };
    }
    acc[day].pnl += trade.pnl;
    acc[day].count += 1;
    if (trade.pnl > 0) acc[day].wins += 1;
    return acc;
  }, {} as Record<string, { name: string; pnl: number; count: number; wins: number }>);

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayData = dayOrder.map(day => dayStats[day] || { name: day, pnl: 0, count: 0, wins: 0 });

  // ============ MONTHLY PERFORMANCE ============
  const monthlyStats = liveTrades.reduce((acc, trade) => {
    const month = format(new Date(trade.entryDate), "MMM yyyy");
    if (!acc[month]) {
      acc[month] = { name: month, pnl: 0, count: 0, wins: 0 };
    }
    acc[month].pnl += trade.pnl;
    acc[month].count += 1;
    if (trade.pnl > 0) acc[month].wins += 1;
    return acc;
  }, {} as Record<string, { name: string; pnl: number; count: number; wins: number }>);

  const monthlyData = Object.values(monthlyStats).sort((a, b) => 
    new Date(a.name).getTime() - new Date(b.name).getTime()
  );

  // ============ CUMULATIVE P&L ============
  const cumulativePnlData = liveTrades
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


  // ============ SYMBOL PERFORMANCE ============
  const symbolStats = liveTrades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = { name: trade.symbol, pnl: 0, count: 0, wins: 0 };
    }
    acc[trade.symbol].pnl += trade.pnl;
    acc[trade.symbol].count += 1;
    if (trade.pnl > 0) acc[trade.symbol].wins += 1;
    return acc;
  }, {} as Record<string, any>);

  const symbolData = Object.values(symbolStats)
    .map((s: any) => ({ ...s, winRate: Math.round((s.wins / s.count) * 100) }))
    .sort((a, b) => b.pnl - a.pnl);

  // ============ CONSECUTIVE WINS/LOSSES ============
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  for (const trade of liveTrades) {
    if (trade.pnl > 0) {
      currentWinStreak++;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
      currentLossStreak = 0;
    } else if (trade.pnl < 0) {
      currentLossStreak++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      currentWinStreak = 0;
    }
  }

  // ============ TYPE DISTRIBUTION ============
  const typeStats = [
    { name: 'Long', value: liveTrades.filter(t => t.type === 'LONG').length, pnl: liveTrades.filter(t => t.type === 'LONG').reduce((acc, t) => acc + t.pnl, 0) },
    { name: 'Short', value: liveTrades.filter(t => t.type === 'SHORT').length, pnl: liveTrades.filter(t => t.type === 'SHORT').reduce((acc, t) => acc + t.pnl, 0) },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded shadow-xl">
          <p className="text-muted-foreground text-xs mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-mono font-bold" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && (entry.dataKey === 'pnl' || entry.name === 'PNL' || entry.dataKey === 'cumPnl') 
                ? `$${entry.value.toLocaleString()}` 
                : entry.value}
              {entry.dataKey === 'winRate' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const MetricCard = ({ label, value, icon: Icon, color = "text-primary", trend }: any) => (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
          </div>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        {trend && <p className="text-xs text-muted-foreground mt-2">{trend}</p>}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Accounts Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your Live trading performance metrics. <span className="text-success font-semibold">{liveTrades.length} trades</span></p>
        </div>

        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="symbols">Symbols</TabsTrigger>
          </TabsList>

          {/* ============ KEY METRICS TAB ============ */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard 
                label="Win Rate" 
                value={`${winRate.toFixed(1)}%`}
                icon={Target}
                color={winRate >= 50 ? "text-success" : "text-muted-foreground"}
              />
              <MetricCard 
                label="Profit Factor" 
                value={profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
                icon={TrendingUp}
                color={profitFactor > 1.5 ? "text-success" : profitFactor > 1 ? "text-primary" : "text-destructive"}
              />
              <MetricCard 
                label="Risk/Reward" 
                value={riskRewardRatio === Infinity ? "∞" : riskRewardRatio.toFixed(2)}
                icon={Zap}
                color="text-primary"
              />
              <MetricCard 
                label="Consecutive Wins" 
                value={maxConsecutiveWins}
                icon={TrendingUp}
                color="text-success"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                  <p className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Avg Win</p>
                  <p className="text-2xl font-bold font-mono text-success">${avgWin.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Avg Loss</p>
                  <p className="text-2xl font-bold font-mono text-destructive">${avgLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Avg Trade</p>
                  <p className={`text-2xl font-bold font-mono ${avgTrade >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${avgTrade.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
                  <p className="text-2xl font-bold font-mono">{totalTrades}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-2">Win / Loss / BE</p>
                  <p className="text-2xl font-bold font-mono">{winTrades.length} / {lossTrades.length} / {breakEvenTrades.length}</p>
                  <div className="flex gap-2 mt-3 h-2">
                    <div className="flex-1 bg-success rounded" style={{flex: winTrades.length}}></div>
                    <div className="flex-1 bg-destructive rounded" style={{flex: lossTrades.length}}></div>
                    {breakEvenTrades.length > 0 && <div className="flex-1 bg-muted rounded" style={{flex: breakEvenTrades.length}}></div>}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-2">Largest Win / Loss</p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold font-mono text-success">${largestWin.toLocaleString()}</p>
                    <p className="text-lg font-bold font-mono text-destructive">${largestLoss.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-2">Max Consecutive</p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold font-mono text-success">Wins: {maxConsecutiveWins}</p>
                    <p className="text-lg font-bold font-mono text-destructive">Losses: {maxConsecutiveLosses}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ OVERVIEW TAB ============ */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>PnL Distribution by Setup</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={setupData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                        <Bar dataKey="pnl" name="PNL" radius={[0, 4, 4, 0]}>
                          {setupData.map((entry, index) => (
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
                  <CardTitle>Trade Distribution (Long vs Short)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {typeStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Setup Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {setupData.map((setup) => (
                    <div key={setup.name} className="border border-border/50 rounded-lg p-4">
                      <p className="font-semibold mb-3">{setup.name}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total PnL</span>
                          <span className={`font-mono font-bold ${setup.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {setup.pnl >= 0 ? '+' : ''}${setup.pnl.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Win Rate</span>
                          <span className="font-mono font-bold">{setup.winRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trades</span>
                          <span className="font-mono font-bold">{setup.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg PnL</span>
                          <span className="font-mono font-bold">${setup.avgPnl.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                          <div className="h-full bg-primary" style={{ width: `${setup.winRate}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ PERFORMANCE TAB ============ */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Cumulative P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumulativePnlData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="tradeNum" tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                      <Area type="monotone" dataKey="cumPnl" name="Cumulative P&L" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCum)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Performance by Day of Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                      <Bar dataKey="pnl" name="PNL" radius={[4, 4, 0, 0]}>
                        {dayData.map((entry, index) => (
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
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                      <Bar dataKey="pnl" name="PNL" radius={[4, 4, 0, 0]}>
                        {monthlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ ACCOUNTS TAB ============ */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {accountTypeData.map((acc) => (
                <Card key={acc.name} className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>{acc.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total PnL</p>
                        <p className={`text-xl font-bold font-mono ${acc.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {acc.pnl >= 0 ? '+' : ''}${acc.pnl.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                        <p className="text-xl font-bold font-mono">{acc.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Trades</p>
                        <p className="text-xl font-bold font-mono">{acc.count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Avg Trade</p>
                        <p className="text-xl font-bold font-mono">${acc.avgPnl}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ============ SYMBOLS TAB ============ */}
          <TabsContent value="symbols" className="space-y-4">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Symbol Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={symbolData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={60} tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                      <Bar dataKey="pnl" name="PNL" radius={[0, 4, 4, 0]}>
                        {symbolData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {symbolData.map((symbol) => (
                <Card key={symbol.name} className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-3">{symbol.name}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PnL</span>
                        <span className={`font-mono font-bold ${symbol.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {symbol.pnl >= 0 ? '+' : ''}${symbol.pnl.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="font-mono font-bold">{symbol.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trades</span>
                        <span className="font-mono font-bold">{symbol.count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
