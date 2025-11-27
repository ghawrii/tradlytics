import { useState } from "react";
import Layout from "@/components/Layout";
import { mockTrades } from "@/lib/mockData";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  getDay,
  addMonths,
  subMonths
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Calculate empty days for grid alignment (start of week)
  const startDay = getDay(startOfMonth(currentMonth));
  const emptyDays = Array(startDay).fill(null);

  const getDayStats = (date: Date) => {
    const dayTrades = mockTrades.filter(t => isSameDay(new Date(t.entryDate), date));
    const dayPnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
    const winCount = dayTrades.filter(t => t.pnl > 0).length;
    const lossCount = dayTrades.filter(t => t.pnl < 0).length;
    
    return { dayPnl, tradeCount: dayTrades.length, winCount, lossCount };
  };

  return (
    <Layout>
       <div className="p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between">
           <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
            <p className="text-muted-foreground">Daily P&L performance view.</p>
           </div>
           <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-bold text-lg min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-7 gap-4 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center font-medium text-muted-foreground text-sm uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4 flex-1 auto-rows-fr">
           {emptyDays.map((_, i) => (
             <div key={`empty-${i}`} className="bg-transparent" />
           ))}
           
           {daysInMonth.map(date => {
             const { dayPnl, tradeCount, winCount, lossCount } = getDayStats(date);
             const hasTrades = tradeCount > 0;
             
             return (
               <Card key={date.toISOString()} className={`min-h-[120px] flex flex-col overflow-hidden transition-all hover:ring-1 hover:ring-primary ${hasTrades ? (dayPnl >= 0 ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20') : 'bg-card/30 border-border/50'}`}>
                 <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
                   <span className={`text-sm font-medium ${!isSameMonth(date, currentMonth) ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}>
                     {format(date, "d")}
                   </span>
                   {hasTrades && (
                     <span className="text-[10px] font-mono text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">
                       {tradeCount}T
                     </span>
                   )}
                 </CardHeader>
                 <CardContent className="p-3 flex-1 flex flex-col justify-center items-center">
                   {hasTrades ? (
                     <>
                       <div className={`text-lg font-bold font-mono tracking-tight ${dayPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                         {dayPnl >= 0 ? '+' : ''}${dayPnl}
                       </div>
                       <div className="flex gap-1 mt-1">
                          {winCount > 0 && <div className="h-1.5 w-1.5 rounded-full bg-success" />}
                          {lossCount > 0 && <div className="h-1.5 w-1.5 rounded-full bg-destructive" />}
                       </div>
                     </>
                   ) : (
                     <span className="text-muted-foreground/20 text-xs">-</span>
                   )}
                 </CardContent>
               </Card>
             );
           })}
        </div>
       </div>
    </Layout>
  );
}
