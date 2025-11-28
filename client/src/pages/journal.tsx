import { useState } from "react";
import Layout from "@/components/Layout";
import { mockTrades, Trade } from "@/lib/mockData";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Plus, ChevronRight, ImageIcon, Trash2 } from "lucide-react";
import { propFirms } from "@/lib/propFirmsData";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Journal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [accountType, setAccountType] = useState("LIVE");
  const [selectedPropFirm, setSelectedPropFirm] = useState("");

  const filteredTrades = mockTrades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trade.setup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || trade.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate setup win rate
  const getSetupStats = (setup: string) => {
    const setupTrades = mockTrades.filter(t => t.setup === setup);
    const wins = setupTrades.filter(t => t.pnl > 0).length;
    const winRate = Math.round((wins / setupTrades.length) * 100);
    const totalPnl = setupTrades.reduce((acc, t) => acc + t.pnl, 0);
    return { count: setupTrades.length, winRate, totalPnl };
  };

  return (
    <Layout>
      <div className="p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Trade Journal</h1>
            <p className="text-muted-foreground">Comprehensive log of all trades with detailed analysis, like Tradezella.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
             </Button>
             <Sheet>
               <SheetTrigger asChild>
                 <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Log Trade
                 </Button>
               </SheetTrigger>
               <SheetContent className="min-w-[550px] overflow-y-auto">
                 <SheetHeader>
                   <SheetTitle>Log New Trade</SheetTitle>
                   <SheetDescription>
                     Document your trade with all relevant details for analysis.
                   </SheetDescription>
                 </SheetHeader>
                 <div className="grid gap-4 py-4">
                   <Tabs defaultValue="basic" className="w-full">
                     <TabsList className="grid w-full grid-cols-3">
                       <TabsTrigger value="basic">Basic</TabsTrigger>
                       <TabsTrigger value="execution">Execution</TabsTrigger>
                       <TabsTrigger value="analysis">Analysis</TabsTrigger>
                     </TabsList>

                     {/* Basic Tab */}
                     <TabsContent value="basic" className="space-y-4 mt-4">
                       <div className="space-y-2">
                         <Label>Account Type</Label>
                         <Select value={accountType} onValueChange={setAccountType}>
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="LIVE">Live Account</SelectItem>
                             <SelectItem value="PROP_FIRM">Prop Firm Account</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       {accountType === "PROP_FIRM" && (
                         <div className="space-y-2">
                           <Label>Select Prop Firm Account</Label>
                           <Select value={selectedPropFirm} onValueChange={setSelectedPropFirm}>
                             <SelectTrigger>
                               <SelectValue placeholder="Select account" />
                             </SelectTrigger>
                             <SelectContent>
                               {propFirms.map(firm => (
                                 <SelectItem key={firm.id} value={firm.id.toString()}>
                                   {firm.firm} - {firm.type} - #{firm.accountNumber}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                       )}
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label>Symbol</Label>
                           <Input placeholder="e.g. ES, AAPL" />
                         </div>
                         <div className="space-y-2">
                           <Label>Type</Label>
                           <Select defaultValue="LONG">
                             <SelectTrigger>
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="LONG">Long</SelectItem>
                               <SelectItem value="SHORT">Short</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label>Entry Date</Label>
                           <Input type="date" />
                         </div>
                         <div className="space-y-2">
                           <Label>Entry Time</Label>
                           <Input type="time" />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <Label>Setup / Strategy</Label>
                         <Select>
                           <SelectTrigger>
                             <SelectValue placeholder="Select setup" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="Break & Retest">Break & Retest</SelectItem>
                             <SelectItem value="Supply Zone">Supply Zone</SelectItem>
                             <SelectItem value="Demand Zone">Demand Zone</SelectItem>
                             <SelectItem value="Trendline Bounce">Trendline Bounce</SelectItem>
                             <SelectItem value="Gap Fill">Gap Fill</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </TabsContent>

                     {/* Execution Tab */}
                     <TabsContent value="execution" className="space-y-4 mt-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label>Entry Price</Label>
                           <Input type="number" placeholder="0.00" step="0.01" />
                         </div>
                         <div className="space-y-2">
                           <Label>Position Size</Label>
                           <Input type="number" placeholder="1" />
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label>Stop Loss</Label>
                           <Input type="number" placeholder="0.00" step="0.01" />
                         </div>
                         <div className="space-y-2">
                           <Label>Take Profit</Label>
                           <Input type="number" placeholder="0.00" step="0.01" />
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label>Exit Date</Label>
                           <Input type="date" />
                         </div>
                         <div className="space-y-2">
                           <Label>Exit Time</Label>
                           <Input type="time" />
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label>Exit Price</Label>
                           <Input type="number" placeholder="0.00" step="0.01" />
                         </div>
                         <div className="space-y-2">
                           <Label>Commission/Fees</Label>
                           <Input type="number" placeholder="0.00" step="0.01" />
                         </div>
                       </div>
                     </TabsContent>

                     {/* Analysis Tab */}
                     <TabsContent value="analysis" className="space-y-4 mt-4">
                       <div className="space-y-2">
                         <Label>Pre-Trade Plan</Label>
                         <Textarea placeholder="What was your plan? What conditions led to this trade?" className="min-h-[80px]" />
                       </div>
                       <div className="space-y-2">
                         <Label>Execution Notes</Label>
                         <Textarea placeholder="How did execution go? Did you stick to your plan? Emotions?" className="min-h-[80px]" />
                       </div>
                       <div className="space-y-2">
                         <Label>Post-Trade Analysis</Label>
                         <Textarea placeholder="What went well? What could improve? Key learnings?" className="min-h-[80px]" />
                       </div>
                     </TabsContent>
                   </Tabs>

                   <Button className="w-full mt-4">Save Trade</Button>
                 </div>
               </SheetContent>
             </Sheet>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search symbol or setup..." 
              className="pl-9 bg-background border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-background border-border">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Trades</SelectItem>
              <SelectItem value="WIN">Wins Only</SelectItem>
              <SelectItem value="LOSS">Losses Only</SelectItem>
              <SelectItem value="BE">Break Even</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Setup</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">SL/TP</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Risk:Reward</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => {
                // Calculate risk and reward
                const risk = Math.abs(trade.entryPrice - (trade.type === "LONG" ? trade.entryPrice * 0.98 : trade.entryPrice * 1.02));
                const reward = Math.abs(trade.exitPrice - trade.entryPrice);
                const rr = (reward / risk).toFixed(2);
                
                return (
                  <TableRow 
                    key={trade.id} 
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTrade(trade)}
                  >
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {format(new Date(trade.entryDate), "MMM dd")}
                    </TableCell>
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-2">
                        {trade.symbol}
                        {trade.screenshots.length > 0 && (
                          <ImageIcon className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={trade.type === "LONG" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"}>
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{trade.setup}</TableCell>
                    <TableCell className="text-right font-mono text-sm">${trade.entryPrice}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">SL/TP</TableCell>
                    <TableCell className="text-right font-mono text-sm">${trade.exitPrice}</TableCell>
                    <TableCell className={`text-right font-mono font-bold text-sm ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">1:{rr}</TableCell>
                    <TableCell className="text-center">
                       <Badge variant={trade.status === "WIN" ? "default" : trade.status === "LOSS" ? "destructive" : "secondary"} 
                              className={`${trade.status === "WIN" ? "bg-success hover:bg-success/80 text-success-foreground" : ""}`}>
                         {trade.status}
                       </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Trade Detail Sheet */}
      <Sheet open={!!selectedTrade} onOpenChange={(open) => !open && setSelectedTrade(null)}>
        <SheetContent className="min-w-[650px] overflow-y-auto sm:max-w-[900px] w-full">
          <SheetHeader className="mb-6">
             <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                  {selectedTrade?.symbol}
                  {selectedTrade?.type && (
                    <Badge variant="outline" className="ml-2 text-sm font-normal">
                      {selectedTrade.type}
                    </Badge>
                  )}
                </SheetTitle>
                <Badge 
                  variant="outline" 
                  className={`text-lg px-3 py-1 ${selectedTrade?.pnl && selectedTrade.pnl >= 0 ? 'text-success border-success' : 'text-destructive border-destructive'}`}
                >
                   {selectedTrade?.pnl && selectedTrade.pnl >= 0 ? '+' : ''}${selectedTrade?.pnl}
                </Badge>
             </div>
             <SheetDescription>
               {selectedTrade && format(new Date(selectedTrade.entryDate), "MMMM dd, yyyy")}
             </SheetDescription>
          </SheetHeader>

          {selectedTrade && (
            <div className="space-y-6">
              {/* Trade Summary Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                 <div>
                    <div className="text-xs text-muted-foreground mb-1">Entry</div>
                    <div className="font-mono font-bold text-sm">${selectedTrade.entryPrice}</div>
                    <div className="text-xs text-muted-foreground mt-1">{format(new Date(selectedTrade.entryDate), "HH:mm")}</div>
                 </div>
                 <div>
                    <div className="text-xs text-muted-foreground mb-1">Exit</div>
                    <div className="font-mono font-bold text-sm">${selectedTrade.exitPrice}</div>
                    <div className="text-xs text-muted-foreground mt-1">{format(new Date(selectedTrade.exitDate), "HH:mm")}</div>
                 </div>
                 <div>
                    <div className="text-xs text-muted-foreground mb-1">Size</div>
                    <div className="font-mono font-bold text-sm">{selectedTrade.quantity} contracts</div>
                    <div className="text-xs text-muted-foreground mt-1">Risk</div>
                 </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Setup Performance</p>
                    {selectedTrade && (() => {
                      const stats = getSetupStats(selectedTrade.setup);
                      return (
                        <div className="space-y-2">
                          <p className="font-mono font-bold text-sm">{selectedTrade.setup}</p>
                          <p className="text-xs text-muted-foreground">{stats.winRate}% Win Rate ({stats.count} trades)</p>
                          <p className={`text-xs font-mono ${stats.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            Total: {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Account</p>
                    <Badge variant={selectedTrade.accountType === "LIVE" ? "outline" : "secondary"} className="mb-2">
                      {selectedTrade.accountType === "LIVE" ? "Live Account" : `${selectedTrade.accountFirm}`}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">{selectedTrade.accountType === "LIVE" ? "Personal Capital" : "Prop Firm Account"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Trade Analysis */}
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notes">Notes & Plan</TabsTrigger>
                  <TabsTrigger value="execution">Execution</TabsTrigger>
                  <TabsTrigger value="images">Screenshots</TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Trade Notes</h3>
                    <div className="p-4 bg-card rounded-lg border border-border text-sm leading-relaxed text-muted-foreground whitespace-pre-line max-h-[200px] overflow-y-auto">
                      {selectedTrade.notes}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="execution" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">Execution Quality</p>
                      <div className="flex gap-2">
                        {["Perfect", "Good", "Average", "Poor"].map((quality) => (
                          <Button key={quality} variant="outline" size="sm" className="text-xs">
                            {quality}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">Emotional State</p>
                      <div className="flex gap-2">
                        {["Calm", "Confident", "Uncertain", "Frustrated"].map((emotion) => (
                          <Button key={emotion} variant="outline" size="sm" className="text-xs">
                            {emotion}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">Key Takeaway</p>
                      <p className="text-sm p-3 bg-card rounded border border-border text-muted-foreground">
                        {selectedTrade.notes.split('\n')[0] || "Document your key learning from this trade"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Trade Screenshots ({selectedTrade.screenshots.length})</h3>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-3 w-3" />
                        Add Image
                      </Button>
                    </div>
                    
                    {selectedTrade.screenshots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {selectedTrade.screenshots.map((screenshot, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={screenshot} 
                              alt={`Trade screenshot ${idx + 1}`}
                              className="w-full h-auto rounded-lg border border-border object-cover max-h-[300px]"
                            />
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-border rounded-lg">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">No screenshots yet. Add entry/exit charts for better analysis.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Trade Metrics Summary */}
              <div className="bg-muted/20 rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-sm mb-3">Trade Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Win/Loss</p>
                    <p className={`font-mono font-bold ${selectedTrade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {selectedTrade.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-mono font-bold">
                      {Math.floor((new Date(selectedTrade.exitDate).getTime() - new Date(selectedTrade.entryDate).getTime()) / (1000 * 60 * 60))}h
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Risk:Reward</p>
                    <p className="font-mono font-bold">
                      1:{((Math.abs(selectedTrade.exitPrice - selectedTrade.entryPrice) / Math.abs(selectedTrade.entryPrice - (selectedTrade.type === "LONG" ? selectedTrade.entryPrice * 0.98 : selectedTrade.entryPrice * 1.02))) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profit %</p>
                    <p className={`font-mono font-bold ${selectedTrade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {((selectedTrade.pnl / (selectedTrade.entryPrice * selectedTrade.quantity)) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
