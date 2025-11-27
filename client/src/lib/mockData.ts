import { addDays, subDays, format } from "date-fns";
import chart1 from '@assets/stock_images/stock_market_candles_7188c8c1.jpg';
import chart2 from '@assets/stock_images/stock_market_candles_8c5c45c1.jpg';
import chart3 from '@assets/stock_images/stock_market_candles_f7281fef.jpg';

export interface Trade {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  status: "WIN" | "LOSS" | "BE";
  setup: string;
  notes: string;
  screenshots: string[];
  accountType: "LIVE" | "PROP_FIRM";
  accountId?: number;
  accountFirm?: string;
}

const setups = ["Break & Retest", "Supply Zone", "Demand Zone", "Trendline Bounce", "Gap Fill"];
const symbols = ["ES", "NQ", "AAPL", "TSLA", "AMD", "EURUSD", "BTCUSD"];
const charts = [chart1, chart2, chart3];

function generateMockTrades(count: number): Trade[] {
  const trades: Trade[] = [];

  for (let i = 0; i < count; i++) {
    const isWin = Math.random() > 0.45; // 55% win rate
    const type = Math.random() > 0.5 ? "LONG" : "SHORT";
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const setup = setups[Math.floor(Math.random() * setups.length)];
    
    const entryPrice = Math.floor(Math.random() * 1000) + 100;
    const quantity = Math.floor(Math.random() * 10) + 1;
    
    let exitPrice;
    let pnl;

    if (type === "LONG") {
      exitPrice = isWin ? entryPrice * 1.02 : entryPrice * 0.99;
      pnl = (exitPrice - entryPrice) * quantity * 50; // Multiplier for futures
    } else {
      exitPrice = isWin ? entryPrice * 0.98 : entryPrice * 1.01;
      pnl = (entryPrice - exitPrice) * quantity * 50;
    }

    // Add some randomness to pnl
    pnl = Math.floor(pnl);

    // Randomly assign screenshots
    const tradeScreenshots = Math.random() > 0.7 ? [charts[Math.floor(Math.random() * charts.length)]] : [];
    if (Math.random() > 0.9) tradeScreenshots.push(charts[Math.floor(Math.random() * charts.length)]);

    const propFirms = ["FTMO", "Apex", "TopStep", "MyForexFunds"];
    const isLive = Math.random() > 0.4; // 60% live, 40% prop firm
    const firm = propFirms[Math.floor(Math.random() * propFirms.length)];

    trades.push({
      id: `TRD-${1000 + i}`,
      symbol,
      type,
      entryDate: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(), // Random date in last 30 days
      exitDate: subDays(new Date(), count - i).toISOString(),
      entryPrice: parseFloat(entryPrice.toFixed(2)),
      exitPrice: parseFloat(exitPrice.toFixed(2)),
      quantity,
      pnl,
      status: pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BE",
      setup,
      notes: "Entry based on 15m candle close above VWAP. Strong volume confirmation. \n\nManaged risk by moving stop to breakeven after 1R.",
      screenshots: tradeScreenshots,
      accountType: isLive ? "LIVE" : "PROP_FIRM",
      accountId: isLive ? undefined : Math.floor(Math.random() * 4) + 1,
      accountFirm: isLive ? undefined : firm
    });
  }
  return trades.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
}

export const mockTrades = generateMockTrades(100);

export const stats = {
  totalPnl: mockTrades.reduce((acc, t) => acc + t.pnl, 0),
  winRate: (mockTrades.filter(t => t.pnl > 0).length / mockTrades.length) * 100,
  avgWin: mockTrades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0) / mockTrades.filter(t => t.pnl > 0).length,
  avgLoss: mockTrades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0) / mockTrades.filter(t => t.pnl < 0).length,
  profitFactor: Math.abs(mockTrades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0) / mockTrades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0)),
  tradesCount: mockTrades.length
};
