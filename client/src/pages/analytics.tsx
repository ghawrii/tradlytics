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
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function Analytics() {
  
  // Data Preparation
  
  // 1. Win Rate by Setup
  const setupStats = mockTrades.reduce((acc, trade) => {
    if (!acc[trade.setup]) {
      acc[trade.setup] = { name: trade.setup, wins: 0, total: 0, pnl: 0 };
    }
    acc[trade.setup].total += 1;
    acc[trade.setup].pnl += trade.pnl;
    if (trade.pnl > 0) acc[trade.setup].wins += 1;
    return acc;
  }, {} as Record<string, { name: string; wins: number; total: number; pnl: number }>);

  const setupData = Object.values(setupStats).map(s => ({
    ...s,
    winRate: Math.round((s.wins / s.total) * 100)
  })).sort((a, b) => b.pnl - a.pnl);

  // 2. PnL by Day of Week
  const dayStats = mockTrades.reduce((acc, trade) => {
    const day = format(new Date(trade.entryDate), "EEEE");
    if (!acc[day]) {
      acc[day] = { name: day, pnl: 0, count: 0 };
    }
    acc[day].pnl += trade.pnl;
    acc[day].count += 1;
    return acc;
  }, {} as Record<string, { name: string; pnl: number; count: number }>);

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayData = dayOrder.map(day => dayStats[day] || { name: day, pnl: 0, count: 0 });

  // 3. Long vs Short Performance
  const typeStats = [
    { name: 'Long', value: mockTrades.filter(t => t.type === 'LONG').length, pnl: mockTrades.filter(t => t.type === 'LONG').reduce((acc, t) => acc + t.pnl, 0) },
    { name: 'Short', value: mockTrades.filter(t => t.type === 'SHORT').length, pnl: mockTrades.filter(t => t.type === 'SHORT').reduce((acc, t) => acc + t.pnl, 0) },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded shadow-xl">
          <p className="text-muted-foreground text-xs mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-mono font-bold" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && (entry.dataKey === 'pnl' || entry.name === 'PNL') 
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

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your trading performance metrics.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setups">Setups</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card/50 border-border/50 backdrop-blur-sm">
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

                <Card className="col-span-3 bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Trade Distribution</CardTitle>
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
          </TabsContent>

          <TabsContent value="setups" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {setupData.map((setup) => (
                <Card key={setup.name} className="bg-card/50 border-border/50 backdrop-blur-sm">
                   <CardHeader className="pb-2">
                     <CardTitle className="text-lg font-medium">{setup.name}</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-muted-foreground text-sm">Total PnL</span>
                          <span className={`text-xl font-mono font-bold ${setup.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                             {setup.pnl >= 0 ? '+' : ''}${setup.pnl.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-muted-foreground text-sm">Win Rate</span>
                          <span className="text-xl font-mono font-bold">{setup.winRate}%</span>
                        </div>
                         <div className="flex justify-between items-end">
                          <span className="text-muted-foreground text-sm">Trades</span>
                          <span className="text-xl font-mono font-bold">{setup.total}</span>
                        </div>
                         {/* Mini Bar for Win Rate visual */}
                         <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-primary" style={{ width: `${setup.winRate}%` }} />
                         </div>
                      </div>
                   </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="timing" className="space-y-4">
             <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Performance by Day of Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
