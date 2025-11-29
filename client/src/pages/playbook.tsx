import { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, TrendingUp, Target, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockTrades } from "@/lib/mockData";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";

interface Playbook {
  id: string;
  name: string;
  description: string;
  rules: string;
  color: string;
  createdDate: string;
}

const PLAYBOOK_COLORS = ["bg-blue-500/20", "bg-purple-500/20", "bg-green-500/20", "bg-orange-500/20", "bg-red-500/20", "bg-pink-500/20"];

const initialPlaybooks: Playbook[] = [
  {
    id: "pb-1",
    name: "Break & Retest",
    description: "Price breaks above resistance and retests for entry. High probability reversals at key S/R.",
    rules: "• Entry: Price breaks above key level with volume\n• Confirmation: Retest of broken level\n• Stop: Below recent support\n• Target: 2:1 RR minimum\n• Timeframe: 15m - 4h",
    color: PLAYBOOK_COLORS[0],
    createdDate: "2024-10-15"
  },
  {
    id: "pb-2",
    name: "Supply Zone",
    description: "Trade reversals at identified supply zones. Combining price action with volume analysis.",
    rules: "• Entry: Price approaches supply zone from below\n• Confirmation: Rejection candlestick + volume spike\n• Stop: Above supply zone\n• Target: Support level below\n• Timeframe: 1h - 4h",
    color: PLAYBOOK_COLORS[1],
    createdDate: "2024-09-20"
  },
  {
    id: "pb-3",
    name: "Demand Zone",
    description: "Trade bounces off identified demand zones. Strong support with high retesting probability.",
    rules: "• Entry: Price touches demand zone from above\n• Confirmation: Bullish reversal pattern\n• Stop: Below demand zone\n• Target: Resistance level above\n• Timeframe: 15m - 1h",
    color: PLAYBOOK_COLORS[2],
    createdDate: "2024-08-10"
  },
  {
    id: "pb-4",
    name: "Trendline Bounce",
    description: "Trade bounces off trendline in trending markets. Use with moving average confluence.",
    rules: "• Entry: Price touches trendline\n• Confirmation: Bounce + MA confirmation\n• Stop: Below trendline\n• Target: Previous swing high\n• Timeframe: 4h - Daily",
    color: PLAYBOOK_COLORS[3],
    createdDate: "2024-07-05"
  }
];

export default function Playbook() {
  const [playbooks, setPlaybooks] = useState(initialPlaybooks);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", rules: "" });

  const getPlaybookStats = (playbookName: string) => {
    const playbookTrades = mockTrades.filter(t => t.setup === playbookName);
    const wins = playbookTrades.filter(t => t.pnl > 0).length;
    const losses = playbookTrades.filter(t => t.pnl < 0).length;
    const totalPnl = playbookTrades.reduce((acc, t) => acc + t.pnl, 0);
    const winRate = playbookTrades.length > 0 ? (wins / playbookTrades.length) * 100 : 0;
    const avgWin = wins > 0 ? playbookTrades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0) / wins : 0;
    const avgLoss = losses > 0 ? Math.abs(playbookTrades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0) / losses) : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0;

    return {
      count: playbookTrades.length,
      wins,
      losses,
      winRate: winRate.toFixed(1),
      totalPnl,
      profitFactor: profitFactor.toFixed(2),
      avgTrade: playbookTrades.length > 0 ? (totalPnl / playbookTrades.length).toFixed(0) : 0
    };
  };

  const handleAdd = () => {
    if (formData.name.trim()) {
      const newPlaybook: Playbook = {
        id: `pb-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        rules: formData.rules,
        color: PLAYBOOK_COLORS[playbooks.length % PLAYBOOK_COLORS.length],
        createdDate: new Date().toISOString().split('T')[0]
      };
      setPlaybooks([...playbooks, newPlaybook]);
      setFormData({ name: "", description: "", rules: "" });
      setIsAddOpen(false);
    }
  };

  const handleEdit = () => {
    if (selectedPlaybook && formData.name.trim()) {
      setPlaybooks(playbooks.map(pb => 
        pb.id === selectedPlaybook.id 
          ? { ...pb, name: formData.name, description: formData.description, rules: formData.rules }
          : pb
      ));
      setFormData({ name: "", description: "", rules: "" });
      setSelectedPlaybook(null);
      setIsEditOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    setPlaybooks(playbooks.filter(pb => pb.id !== id));
  };

  const openEdit = (pb: Playbook) => {
    setSelectedPlaybook(pb);
    setFormData({ name: pb.name, description: pb.description, rules: pb.rules });
    setIsEditOpen(true);
  };

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Playbook</h1>
            <p className="text-muted-foreground">Define and track your trading setups. Measure performance and optimize your strategies.</p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Playbook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Playbook</DialogTitle>
                <DialogDescription>
                  Define your trading setup with entry/exit rules and conditions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Playbook Name</Label>
                  <Input 
                    placeholder="e.g., Supply Zone Rejection" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the strategy, market conditions, and edge..." 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rules & Conditions</Label>
                  <Textarea 
                    placeholder="• Entry rules&#10;• Confirmation signals&#10;• Stop loss placement&#10;• Profit target&#10;• Timeframe&#10;• Risk management" 
                    rows={6}
                    value={formData.rules}
                    onChange={(e) => setFormData({...formData, rules: e.target.value})}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Create Playbook</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((pb) => {
            const stats = getPlaybookStats(pb.name);
            return (
              <Card key={pb.id} className={`border-border/50 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow ${pb.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{pb.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEdit(pb)}
                        data-testid={`edit-playbook-${pb.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(pb.id)}
                        data-testid={`delete-playbook-${pb.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Created {pb.createdDate}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{pb.description}</p>
                  </div>

                  <div className="space-y-2 bg-muted/30 p-3 rounded border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Setup Rules</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                      {pb.rules}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div data-testid={`stat-trades-${pb.id}`}>
                      <p className="text-xs text-muted-foreground">Trades</p>
                      <p className="text-lg font-bold font-mono">{stats.count}</p>
                    </div>
                    <div data-testid={`stat-winrate-${pb.id}`}>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className={`text-lg font-bold font-mono ${parseFloat(stats.winRate) >= 50 ? 'text-success' : 'text-muted-foreground'}`}>
                        {stats.winRate}%
                      </p>
                    </div>
                    <div data-testid={`stat-pnl-${pb.id}`}>
                      <p className="text-xs text-muted-foreground">Total P&L</p>
                      <p className={`text-lg font-bold font-mono ${stats.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${stats.totalPnl.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div data-testid={`metric-pf-${pb.id}`}>
                      <p className="text-muted-foreground">Profit Factor</p>
                      <p className="font-mono font-bold">{stats.profitFactor}</p>
                    </div>
                    <div data-testid={`metric-avg-${pb.id}`}>
                      <p className="text-muted-foreground">Avg Trade</p>
                      <p className="font-mono font-bold">${stats.avgTrade}</p>
                    </div>
                    <div data-testid={`metric-ratio-${pb.id}`}>
                      <p className="text-muted-foreground">W/L</p>
                      <p className="font-mono font-bold">{stats.wins}:{stats.losses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {playbooks.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No playbooks yet. Create one to start tracking your setups.</p>
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Playbook</DialogTitle>
              <DialogDescription>
                Update your trading setup rules and conditions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Playbook Name</Label>
                <Input 
                  placeholder="e.g., Supply Zone Rejection" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe the strategy, market conditions, and edge..." 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Rules & Conditions</Label>
                <Textarea 
                  placeholder="• Entry rules&#10;• Confirmation signals&#10;• Stop loss placement&#10;• Profit target" 
                  rows={6}
                  value={formData.rules}
                  onChange={(e) => setFormData({...formData, rules: e.target.value})}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
