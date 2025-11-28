import { useState, useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { DollarSign, Activity, Target, TrendingUp, TrendingDown, Zap, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockTrades } from "@/lib/mockData";
import { format, subDays } from "date-fns";
import Layout from "@/components/Layout";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded shadow-xl">
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-mono font-bold text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const today = new Date();
  
  const [startDate, setStartDate] = useState("2000-01-01");
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  // Filter trades by date range
  const filteredTrades = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return mockTrades.filter(trade => {
      const tradeDate = new Date(trade.entryDate);
      return tradeDate >= start && tradeDate <= end;
    });
  }, [startDate, endDate]);

  // Separate trades by account type
  const liveTrades = filteredTrades.filter(t => t.accountType === "LIVE");
  const propTrades = filteredTrades.filter(t => t.accountType === "PROP_FIRM");
  
  // Calculate metrics for each account type
  const calculateMetrics = (trades: typeof mockTrades) => {
    const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
    const wins = trades.filter(t => t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl < 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    const totalProfit = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const totalLoss = trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0);
    const profitFactor = totalLoss !== 0 ? totalProfit / Math.abs(totalLoss) : totalProfit > 0 ? Infinity : 0;
    
    return { totalPnl, wins, losses, winRate, totalProfit, totalLoss, profitFactor, count: trades.length };
  };

  const liveMetrics = calculateMetrics(liveTrades);
  const propMetrics = calculateMetrics(propTrades);
  const combinedMetrics = calculateMetrics(filteredTrades);

  // Comparison data
  const comparisonData = [
    { name: "Live Accounts", pnl: liveMetrics.totalPnl, trades: liveMetrics.count },
    { name: "Prop Firms", pnl: propMetrics.totalPnl, trades: propMetrics.count }
  ];

  // Account type performance pie
  const typeDistribution = [
    { name: "Live Accounts", value: liveMetrics.count, pnl: liveMetrics.totalPnl },
    { name: "Prop Firms", value: propMetrics.count, pnl: propMetrics.totalPnl }
  ];

  // Monthly comparison
  const monthlyByType = filteredTrades.reduce((acc, trade) => {
    const month = format(new Date(trade.entryDate), "MMM");
    if (!acc[month]) acc[month] = { name: month, live: 0, prop: 0 };
    if (trade.accountType === "LIVE") {
      acc[month].live += trade.pnl;
    } else {
      acc[month].prop += trade.pnl;
    }
    return acc;
  }, {} as Record<string, any>);

  const monthlyData = Object.values(monthlyByType);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  const MetricCard = ({ label, value, icon: Icon, color = "text-primary", subtext }: any) => (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Trading Dashboard</h1>
            <p className="text-muted-foreground">Combined performance overview of Live Accounts and Prop Firms.</p>
          </div>

          {/* Date Range Filter */}
          <div className="bg-card/50 border border-border/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Date Range:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center flex-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">From</label>
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40 bg-background border-border"
                  />
                </div>
                <div className="text-muted-foreground">to</div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">To</label>
                  <Input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40 bg-background border-border"
                  />
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setStartDate(format(subDays(today, 7), "yyyy-MM-dd"));
                      setEndDate(format(today, "yyyy-MM-dd"));
                    }}
                    className="text-xs"
                  >
                    Last 7D
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setStartDate(format(subDays(today, 30), "yyyy-MM-dd"));
                      setEndDate(format(today, "yyyy-MM-dd"));
                    }}
                    className="text-xs"
                  >
                    Last 30D
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setStartDate(format(subDays(today, 90), "yyyy-MM-dd"));
                      setEndDate(format(today, "yyyy-MM-dd"));
                    }}
                    className="text-xs"
                  >
                    Last 90D
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setStartDate("");
                      setEndDate(format(today, "yyyy-MM-dd"));
                    }}
                    className="text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Showing {filteredTrades.length} trades from {format(new Date(startDate), "MMM dd, yyyy")} to {format(new Date(endDate), "MMM dd, yyyy")}
            </div>
          </div>
        </div>

        {/* Overall Performance Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            label="Total P&L"
            value={`${combinedMetrics.totalPnl >= 0 ? '+' : ''}$${combinedMetrics.totalPnl.toLocaleString()}`}
            icon={DollarSign}
            color={combinedMetrics.totalPnl >= 0 ? "text-success" : "text-destructive"}
            subtext="All accounts combined"
          />
          <MetricCard
            label="Overall Win Rate"
            value={`${combinedMetrics.winRate.toFixed(1)}%`}
            icon={Target}
            color={combinedMetrics.winRate >= 50 ? "text-success" : "text-muted-foreground"}
            subtext={`${combinedMetrics.wins} wins, ${combinedMetrics.losses} losses`}
          />
          <MetricCard
            label="Profit Factor"
            value={combinedMetrics.profitFactor === Infinity ? "∞" : combinedMetrics.profitFactor.toFixed(2)}
            icon={TrendingUp}
            color={combinedMetrics.profitFactor > 1.5 ? "text-success" : combinedMetrics.profitFactor > 1 ? "text-primary" : "text-destructive"}
            subtext="Gross Profit / Gross Loss"
          />
          <MetricCard
            label="Live Accounts"
            value={`$${liveMetrics.totalPnl >= 0 ? '+' : ''}${liveMetrics.totalPnl.toLocaleString()}`}
            icon={Activity}
            color={liveMetrics.totalPnl >= 0 ? "text-success" : "text-destructive"}
            subtext={`${liveMetrics.count} trades`}
          />
          <MetricCard
            label="Prop Firms"
            value={`$${propMetrics.totalPnl >= 0 ? '+' : ''}${propMetrics.totalPnl.toLocaleString()}`}
            icon={Zap}
            color={propMetrics.totalPnl >= 0 ? "text-success" : "text-destructive"}
            subtext={`${propMetrics.count} trades`}
          />
        </div>

        {/* Comparison Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* P&L Comparison */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>P&L Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                    <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Account Type Distribution */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Trade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
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

        {/* Monthly Performance Comparison */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Monthly Performance by Account Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.2)'}} />
                  <Legend />
                  <Bar dataKey="live" name="Live Accounts" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-1))" />
                  <Bar dataKey="prop" name="Prop Firms" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Live Accounts Details */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Live Accounts
                <Badge variant="outline">Personal</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Total P&L</span>
                <span className={`font-mono font-bold ${liveMetrics.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {liveMetrics.totalPnl >= 0 ? '+' : ''}${liveMetrics.totalPnl.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Win Rate</span>
                <span className="font-mono font-bold">{liveMetrics.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Total Trades</span>
                <span className="font-mono font-bold">{liveMetrics.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Profit Factor</span>
                <span className="font-mono font-bold">{liveMetrics.profitFactor.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Prop Firms Details */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Prop Firms
                <Badge variant="secondary">Funded</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Total P&L</span>
                <span className={`font-mono font-bold ${propMetrics.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {propMetrics.totalPnl >= 0 ? '+' : ''}${propMetrics.totalPnl.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Win Rate</span>
                <span className="font-mono font-bold">{propMetrics.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Total Trades</span>
                <span className="font-mono font-bold">{propMetrics.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Profit Factor</span>
                <span className="font-mono font-bold">{propMetrics.profitFactor.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
