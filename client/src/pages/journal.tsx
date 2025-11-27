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
import { Search, Filter, Download, Plus, ChevronRight, ImageIcon } from "lucide-react";
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

  return (
    <Layout>
      <div className="p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Trade Journal</h1>
            <p className="text-muted-foreground">Detailed log of all trading activity.</p>
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
               <SheetContent className="min-w-[500px]">
                 <SheetHeader>
                   <SheetTitle>Log New Trade</SheetTitle>
                   <SheetDescription>
                     Add a new trade to your journal.
                   </SheetDescription>
                 </SheetHeader>
                 <div className="grid gap-4 py-4">
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
                        <Input placeholder="e.g. AAPL" />
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
                        <Label>Entry Price</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Exit Price</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Setup</Label>
                       <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select setup" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="break_retest">Break & Retest</SelectItem>
                            <SelectItem value="supply_demand">Supply/Demand</SelectItem>
                            <SelectItem value="trend">Trend Following</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Why did you take this trade?" className="min-h-[100px]" />
                    </div>
                    <Button className="w-full">Save Trade</Button>
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
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
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
                  <TableCell className="text-muted-foreground">{trade.setup}</TableCell>
                  <TableCell>
                    <Badge variant={trade.accountType === "LIVE" ? "outline" : "secondary"} className="text-xs">
                      {trade.accountType === "LIVE" ? "Live" : trade.accountFirm}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{trade.entryPrice}</TableCell>
                  <TableCell className="text-right font-mono">{trade.exitPrice}</TableCell>
                  <TableCell className={`text-right font-mono font-bold ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Trade Detail Sheet */}
      <Sheet open={!!selectedTrade} onOpenChange={(open) => !open && setSelectedTrade(null)}>
        <SheetContent className="min-w-[600px] overflow-y-auto sm:max-w-[800px] w-full">
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
               {selectedTrade && format(new Date(selectedTrade.entryDate), "MMMM dd, yyyy • HH:mm")}
             </SheetDescription>
          </SheetHeader>

          {selectedTrade && (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                 <div>
                    <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
                    <div className="font-mono font-medium">{selectedTrade.entryPrice}</div>
                 </div>
                 <div>
                    <div className="text-xs text-muted-foreground mb-1">Exit Price</div>
                    <div className="font-mono font-medium">{selectedTrade.exitPrice}</div>
                 </div>
                 <div>
                    <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                    <div className="font-mono font-medium">{selectedTrade.quantity}</div>
                 </div>
                 <div className="col-span-3 pt-2 mt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Setup Strategy</div>
                    <div className="font-medium">{selectedTrade.setup}</div>
                 </div>
                 <div className="col-span-3 pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Trading Account</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedTrade.accountType === "LIVE" ? "outline" : "secondary"}>
                        {selectedTrade.accountType === "LIVE" ? "Live Account" : `${selectedTrade.accountFirm} (Prop Firm)`}
                      </Badge>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Analysis & Notes
                </h3>
                <div className="p-4 bg-card rounded-lg border border-border text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {selectedTrade.notes}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Screenshots ({selectedTrade.screenshots.length})</h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-3 w-3" />
                    Add Image
                  </Button>
                </div>
                
                {selectedTrade.screenshots.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {selectedTrade.screenshots.map((src, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden border border-border group relative">
                        <img src={src} alt={`Trade screenshot ${idx + 1}`} className="w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground border-dashed">
                    <div className="text-center space-y-2">
                      <div className="mx-auto h-12 w-12 rounded-full bg-background/50 flex items-center justify-center">
                         <ImageIcon className="h-6 w-6 opacity-50" />
                      </div>
                      <p className="text-sm">No screenshots added</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
