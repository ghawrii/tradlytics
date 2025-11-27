import { useState } from "react";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Trophy, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Wallet,
  CreditCard,
  ChevronRight,
  History,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock Data for Prop Firms
const initialAccounts = [
  { 
    id: 1, 
    firm: "FTMO", 
    type: "2 Step", 
    size: 100000, 
    cost: 540, 
    status: "PASSED", 
    stage: "Funded",
    payouts: 12500,
    startDate: "2024-10-15",
    accountNumber: "FTMO-882910",
    equity: 104200
  },
  { 
    id: 2, 
    firm: "Apex", 
    type: "1 Step", 
    size: 50000, 
    cost: 167, 
    status: "ACTIVE", 
    stage: "Evaluation",
    payouts: 0,
    startDate: "2025-01-10",
    accountNumber: "APEX-22910",
    equity: 51200
  },
  { 
    id: 3, 
    firm: "TopStep", 
    type: "2 Step", 
    size: 150000, 
    cost: 350, 
    status: "FAILED", 
    stage: "Phase 1",
    payouts: 0,
    startDate: "2024-11-01",
    accountNumber: "TS-99281",
    equity: 142000
  },
  { 
    id: 4, 
    firm: "MyForexFunds", 
    type: "Instant", 
    size: 20000, 
    cost: 200, 
    status: "PASSED", 
    stage: "Funded",
    payouts: 4200,
    startDate: "2024-08-20",
    accountNumber: "MFF-11029",
    equity: 20800
  }
];

export default function PropFirms() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editData, setEditData] = useState({ equity: 0, payouts: 0 });

  // Stats Calculation
  const totalSpent = accounts.reduce((acc, curr) => acc + curr.cost, 0);
  const totalPayouts = accounts.reduce((acc, curr) => acc + curr.payouts, 0);
  const roi = totalSpent > 0 ? ((totalPayouts - totalSpent) / totalSpent) * 100 : 0;
  const activeCapital = accounts
    .filter(a => a.status === "PASSED" || a.status === "ACTIVE")
    .reduce((acc, curr) => acc + curr.size, 0);

  const passedCount = accounts.filter(a => a.status === "PASSED").length;
  const failedCount = accounts.filter(a => a.status === "FAILED").length;
  const activeCount = accounts.filter(a => a.status === "ACTIVE").length;

  const openDetails = (account) => {
    setSelectedAccount(account);
    setEditData({ equity: account.equity, payouts: account.payouts });
  };

  const saveDetails = () => {
    setAccounts(accounts.map(acc => 
      acc.id === selectedAccount.id 
        ? { ...acc, equity: parseInt(editData.equity), payouts: parseInt(editData.payouts) }
        : acc
    ));
    setSelectedAccount(null);
  };

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Prop Firm Manager</h1>
            <p className="text-muted-foreground">Track your funded accounts, evaluations, and payout performance.</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Prop Firm Account</DialogTitle>
                <DialogDescription>
                  Enter the details of your new evaluation or instant funding account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Firm Name</Label>
                      <Input placeholder="e.g. FTMO" />
                   </div>
                   <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant Funding</SelectItem>
                          <SelectItem value="1step">1 Step Evaluation</SelectItem>
                          <SelectItem value="2step">2 Step Evaluation</SelectItem>
                          <SelectItem value="3step">3 Step Evaluation</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Account Size ($)</Label>
                      <Input type="number" placeholder="100000" />
                   </div>
                   <div className="space-y-2">
                      <Label>Cost ($)</Label>
                      <Input type="number" placeholder="500" />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label>Purchase Date</Label>
                   <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddOpen(false)}>Save Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Performance Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Capital</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                ${activeCapital.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total funding power
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payouts</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
               <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold font-mono text-success">
                    +${totalPayouts.toLocaleString()}
                  </div>
               </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gross profit withdrawn
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Amount Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                ${totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total evaluation costs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investment ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                {roi.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Return on evaluations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {Math.round((passedCount / (passedCount + failedCount + activeCount)) * 100)}%
              </div>
              <div className="flex gap-2 mt-2">
                 <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-success text-success bg-success/10">{passedCount} Passed</Badge>
                 <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-destructive text-destructive bg-destructive/10">{failedCount} Failed</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
           <TabsList>
              <TabsTrigger value="active">Active Accounts</TabsTrigger>
              <TabsTrigger value="history">History & Failed</TabsTrigger>
              <TabsTrigger value="payouts">Payouts Log</TabsTrigger>
           </TabsList>

           <TabsContent value="active" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {accounts.filter(a => a.status !== "FAILED").map(account => (
                    <Card key={account.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer group">
                       <div className={`h-1 w-full ${account.status === 'PASSED' ? 'bg-success' : 'bg-primary'}`} />
                       <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                             <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                  {account.firm}
                                  <Badge variant="outline" className="font-normal text-xs">
                                     {account.type}
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="font-mono text-xs mt-1">
                                   #{account.accountNumber}
                                </CardDescription>
                             </div>
                             <Badge className={`${account.status === 'PASSED' ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}`}>
                                {account.stage}
                             </Badge>
                          </div>
                       </CardHeader>
                       <CardContent className="pb-3">
                          <div className="space-y-4">
                             <div className="flex justify-between items-end">
                                <span className="text-sm text-muted-foreground">Balance</span>
                                <span className="text-xl font-mono font-bold">${account.equity.toLocaleString()}</span>
                             </div>
                             <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                   <span className="text-muted-foreground">Initial Balance</span>
                                   <span className="font-mono">${account.size.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                   <span className="text-muted-foreground">Gain/Loss</span>
                                   <span className={`font-mono ${(account.equity - account.size) >= 0 ? 'text-success' : 'text-destructive'}`}>
                                      {(account.equity - account.size) >= 0 ? '+' : ''}${(account.equity - account.size).toLocaleString()}
                                   </span>
                                </div>
                             </div>
                             
                             {/* Progress Bar towards next goal or drawdown limit */}
                             <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>Current PnL</span>
                                  <span>Target: +10%</span>
                                </div>
                                <Progress value={((account.equity - account.size) / (account.size * 0.1)) * 100} className="h-1.5" />
                             </div>
                          </div>
                       </CardContent>
                       <CardFooter className="bg-muted/20 pt-3 pb-3 flex justify-between">
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground px-0" onClick={() => openDetails(account)}>
                             View Details
                          </Button>
                          {account.status === 'PASSED' && (
                             <Button size="sm" className="h-8 text-xs gap-1 bg-success hover:bg-success/80 text-success-foreground">
                                <DollarSign className="h-3 w-3" />
                                Request Payout
                             </Button>
                          )}
                       </CardFooter>
                    </Card>
                 ))}
              </div>
           </TabsContent>
           
           <TabsContent value="history" className="space-y-4">
              <div className="rounded-md border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Firm</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.filter(a => a.status === "FAILED").map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.firm}</TableCell>
                        <TableCell className="font-mono text-muted-foreground text-xs">#{account.accountNumber}</TableCell>
                        <TableCell className="font-mono">${(account.size / 1000)}k</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-muted-foreground">{account.startDate}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Failed</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">${account.cost}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
           </TabsContent>

           <TabsContent value="payouts" className="space-y-4">
               <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-lg bg-card/30">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                     <History className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg">Payout History</h3>
                  <p className="text-muted-foreground text-sm max-w-md text-center mt-1">
                    You have received a total of <span className="text-success font-bold">${totalPayouts.toLocaleString()}</span> in payouts. detailed log coming soon.
                  </p>
               </div>
           </TabsContent>
        </Tabs>

        {/* Account Details Sheet */}
        <Sheet open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl">{selectedAccount?.firm}</SheetTitle>
                <Badge className={`${selectedAccount?.status === 'PASSED' ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {selectedAccount?.stage}
                </Badge>
              </div>
              <SheetDescription>
                Account #{selectedAccount?.accountNumber}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Read-only info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-medium">{selectedAccount?.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cost</p>
                  <p className="font-mono">${selectedAccount?.cost}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Initial Balance</p>
                  <p className="font-mono">${selectedAccount?.size.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                  <p className="font-mono text-sm">{selectedAccount?.startDate}</p>
                </div>
              </div>

              {/* Editable fields */}
              <div className="space-y-4 border-t border-border pt-6">
                <div className="space-y-2">
                  <Label htmlFor="equity">Current Balance ($)</Label>
                  <Input 
                    id="equity"
                    type="number" 
                    value={editData.equity}
                    onChange={(e) => setEditData({...editData, equity: e.target.value})}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payouts">Total Payouts Received ($)</Label>
                  <Input 
                    id="payouts"
                    type="number" 
                    value={editData.payouts}
                    onChange={(e) => setEditData({...editData, payouts: e.target.value})}
                    className="font-mono"
                  />
                </div>

                {/* Display calculated values */}
                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gain/Loss:</span>
                    <span className={`font-mono font-bold ${(parseInt(editData.equity) - selectedAccount?.size) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {(parseInt(editData.equity) - selectedAccount?.size) >= 0 ? '+' : ''}${(parseInt(editData.equity) - selectedAccount?.size).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Net P&L:</span>
                    <span className={`font-mono font-bold ${(parseInt(editData.equity) - selectedAccount?.size + parseInt(editData.payouts) - selectedAccount?.cost) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {(parseInt(editData.equity) - selectedAccount?.size + parseInt(editData.payouts) - selectedAccount?.cost) >= 0 ? '+' : ''}${(parseInt(editData.equity) - selectedAccount?.size + parseInt(editData.payouts) - selectedAccount?.cost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedAccount(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={saveDetails} className="flex-1">
                Save Changes
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}
