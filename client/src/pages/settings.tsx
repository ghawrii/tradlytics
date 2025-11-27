import { useState } from "react";
import Layout from "@/components/Layout";
import { 
  User, 
  CreditCard, 
  Settings as SettingsIcon, 
  Tags, 
  Shield, 
  Bell,
  UploadCloud,
  Plus,
  Trash2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function Settings() {
  // Mock state for setups management
  const [setups, setSetups] = useState([
    { id: 1, name: "Break & Retest", color: "bg-blue-500" },
    { id: 2, name: "Supply Zone", color: "bg-red-500" },
    { id: 3, name: "Demand Zone", color: "bg-green-500" },
    { id: 4, name: "Trendline Bounce", color: "bg-yellow-500" },
  ]);

  const [newSetup, setNewSetup] = useState("");

  const addSetup = () => {
    if (newSetup.trim()) {
      setSetups([...setups, { id: Date.now(), name: newSetup, color: "bg-gray-500" }]);
      setNewSetup("");
    }
  };

  const removeSetup = (id: number) => {
    setSetups(setups.filter(s => s.id !== id));
  };

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <TabsList className="flex-col h-auto items-stretch w-full md:w-64 space-y-1 bg-transparent p-0">
              <TabsTrigger 
                value="general" 
                className="justify-start px-4 py-2 data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all"
              >
                <User className="h-4 w-4 mr-3" />
                General
              </TabsTrigger>
              <TabsTrigger 
                value="trading" 
                className="justify-start px-4 py-2 data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all"
              >
                <SettingsIcon className="h-4 w-4 mr-3" />
                Trading Preferences
              </TabsTrigger>
               <TabsTrigger 
                value="setups" 
                className="justify-start px-4 py-2 data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all"
              >
                <Tags className="h-4 w-4 mr-3" />
                Setups & Tags
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="justify-start px-4 py-2 data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all"
              >
                <Shield className="h-4 w-4 mr-3" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="justify-start px-4 py-2 data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all"
              >
                <CreditCard className="h-4 w-4 mr-3" />
                Billing
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 space-y-6">
              {/* General Tab */}
              <TabsContent value="general" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account's profile information and email address.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 border-2 border-border">
                         <AvatarImage src="" />
                         <AvatarFallback className="text-lg font-bold bg-muted">JD</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">Change Avatar</Button>
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>
                    
                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.doe@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" placeholder="Tell us a little about yourself" className="resize-none" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border bg-muted/20 px-6 py-4">
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card>
                   <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Enable dark mode for the dashboard.</p>
                        </div>
                        <Switch defaultChecked />
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trading Preferences Tab */}
              <TabsContent value="trading" className="space-y-6 m-0">
                 <Card>
                  <CardHeader>
                    <CardTitle>General Trading Settings</CardTitle>
                    <CardDescription>Configure your default trading parameters.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Account Currency</Label>
                        <Select defaultValue="usd">
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD ($)</SelectItem>
                            <SelectItem value="eur">EUR (€)</SelectItem>
                            <SelectItem value="gbp">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Time Zone</Label>
                         <Select defaultValue="est">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="est">Eastern Time (US & Canada)</SelectItem>
                            <SelectItem value="cst">Central Time (US & Canada)</SelectItem>
                            <SelectItem value="pst">Pacific Time (US & Canada)</SelectItem>
                            <SelectItem value="utc">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <Label>Default Commission (Round Turn)</Label>
                       <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input className="pl-7" placeholder="0.00" defaultValue="5.00" />
                       </div>
                       <p className="text-xs text-muted-foreground">This value will be automatically applied to new trades.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border bg-muted/20 px-6 py-4">
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>

                <Card>
                   <CardHeader>
                    <CardTitle>Goal Setting</CardTitle>
                    <CardDescription>Set your monthly profit targets.</CardDescription>
                   </CardHeader>
                   <CardContent>
                      <div className="space-y-2">
                         <Label>Monthly Profit Target</Label>
                         <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input className="pl-7" placeholder="0.00" defaultValue="10000.00" />
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </TabsContent>

              {/* Setups Tab */}
              <TabsContent value="setups" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Setups</CardTitle>
                    <CardDescription>Create and manage your trading strategies/setups.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-2">
                       <Input 
                          placeholder="Add new setup name..." 
                          value={newSetup}
                          onChange={(e) => setNewSetup(e.target.value)}
                       />
                       <Button onClick={addSetup}>
                         <Plus className="h-4 w-4 mr-2" />
                         Add
                       </Button>
                    </div>

                    <div className="space-y-2">
                      {setups.map((setup) => (
                        <div key={setup.id} className="flex items-center justify-between p-3 border border-border rounded-md bg-card hover:bg-accent/50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className={`h-3 w-3 rounded-full ${setup.color}`} />
                              <span className="font-medium">{setup.name}</span>
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => removeSetup(setup.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
               {/* Security Tab */}
              <TabsContent value="security" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password to keep your account secure.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current">Current Password</Label>
                      <Input id="current" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <Input id="new" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm Password</Label>
                      <Input id="confirm" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border bg-muted/20 px-6 py-4">
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>You are currently on the <span className="font-bold text-primary">Pro Plan</span>.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded-lg">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                             <Shield className="h-5 w-5" />
                          </div>
                          <div>
                             <h3 className="font-bold text-lg">Pro Plan</h3>
                             <p className="text-sm text-muted-foreground">$29.00 / month</p>
                          </div>
                       </div>
                       <Badge className="bg-primary text-primary-foreground">Active</Badge>
                    </div>
                    
                    <div className="space-y-1">
                       <p className="text-sm font-medium">Billing Cycle</p>
                       <p className="text-sm text-muted-foreground">Next payment due on <span className="font-medium text-foreground">December 27, 2025</span></p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border bg-muted/20 px-6 py-4 flex gap-4">
                    <Button variant="outline">Cancel Subscription</Button>
                    <Button>Upgrade Plan</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
