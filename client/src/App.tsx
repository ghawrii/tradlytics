import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Overview from "@/pages/overview";
import Dashboard from "@/pages/dashboard";
import Journal from "@/pages/journal";
import Settings from "@/pages/settings";
import PropFirms from "@/pages/prop-firms";
import Playbook from "@/pages/playbook";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/live-accounts" component={Dashboard} />
      <Route path="/journal" component={Journal} />
      <Route path="/playbook" component={Playbook} />
      <Route path="/prop-firms" component={PropFirms} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
