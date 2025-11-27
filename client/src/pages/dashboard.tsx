import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTrades, stats } from "@/lib/mockData";
import { format } from "date-fns";
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
  // Calculate cumulative PnL for the chart
  let runningTotal = 100000;
  const chartData = [...mockTrades].reverse().map(trade => {
    runningTotal += trade.pnl;
    return {
      date: format(new Date(trade.entryDate), "MMM dd"),
      equity: runningTotal,
    };
  });

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your trading performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${stats.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalPnl >= 0 ? 'All time profit' : 'All time loss'}
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
                {stats.winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {stats.tradesCount} trades
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
                {stats.profitFactor.toFixed(2)}
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

        {/* Recent Trades Preview */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTrades.slice(0, 5).map((trade) => (
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
