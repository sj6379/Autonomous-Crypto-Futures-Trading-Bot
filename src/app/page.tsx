"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { TrendingUp, TrendingDown, Activity, Settings as SettingsIcon, Shield, Zap } from "lucide-react";
import { binance } from "@/lib/binance";
import { runBotIteration } from "@/lib/bot";
import { insforge } from "@/lib/insforge";


export default function Dashboard() {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const candles = await binance.getCandles("BTCUSDT", 20);
      setMarketData(candles);
      setIsLoading(false);

      // Real-time WebSocket Integration
      await insforge.realtime.connect();
      await insforge.realtime.subscribe("ticker");
      
      insforge.realtime.on("price_update", (payload: any) => {

        // Update price in real-time
        setAnalysis((prev: any) => {
          if (!prev) return prev;
          return { ...prev, currentPrice: payload.price };
        });
        
        // Optionally update chart data simulation or current ticker state
        console.log("Real-time Price:", payload.price);
      });
    }
    init();

    return () => {
      insforge.realtime.disconnect();
    };
  }, []);

  const triggerAnalysis = async () => {
    setIsLoading(true);
    try {
      // Mock unique ID for demo
      const result = await runBotIteration("BTCUSDT", "demo-user-id");
      setAnalysis(result.analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Futures Bot</h1>
          <p className="text-zinc-400">Autonomous Day Trading & Leverage Management</p>
        </div>

        <div className="flex gap-4">
          <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium glass-hover">
            <Shield className="w-4 h-4 text-emerald-400" />
            Active
          </button>
          <button className="glass p-2 rounded-xl glass-hover">
            <SettingsIcon className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <GlassCard className="lg:col-span-2 h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-zinc-100 italic font-mono">BTC / USDT</h2>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-bold tracking-tighter uppercase">Perpetual</span>

              {analysis?.currentPrice ? (
                <span className="text-2xl font-mono text-white">
                  ${analysis.currentPrice.toLocaleString()}
                </span>
              ) : null}
              <span className="text-emerald-400 flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4" />
                +2.4%
              </span>
            </div>
            <div className="flex gap-2">
              {['1H', '4H', '1D', '1W'].map(t => (
                <button key={t} className="text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-1 pb-4">
            {marketData.map((d, i) => (
              <div 
                key={i} 
                className="flex-1 bg-white/10 rounded-t-sm hover:bg-brand-primary/40 transition-all cursor-pointer group relative"
                style={{ height: `${(d.close / 60000) * 100}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  ${d.close.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Analysis Sidebar */}
        <div className="space-y-8">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-brand-primary" />
              <h3 className="font-semibold">AI Signal</h3>
            </div>
            
            {analysis ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <SignalBadge signal={analysis.signal} className="text-sm px-4 py-2" />
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Sentiment</p>
                    <p className="font-mono text-emerald-400">{(analysis.sentimentScore * 100).toFixed(0)}%</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Technical</h4>
                    <p className="text-sm leading-relaxed text-zinc-300">{analysis.technicalSummary}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Fundamental</h4>
                    <p className="text-sm leading-relaxed text-zinc-300">{analysis.fundamentalSummary}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <Activity className="w-12 h-12 text-zinc-700 mx-auto animate-pulse" />
                <p className="text-sm text-zinc-500">No active analysis. Trigger bot to analyze.</p>
                <button 
                  onClick={triggerAnalysis}
                  disabled={isLoading}
                  className="bg-brand-primary text-black font-bold px-6 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-50"
                >
                  {isLoading ? "Running Brain..." : "Trigger Analysis"}
                </button>
              </div>
            )}
          </GlassCard>

          <GlassCard className="h-full">
            <h3 className="font-semibold mb-4">Hot Pairs</h3>
            <div className="space-y-4">
              {[
                { name: 'ETH/USDT', price: '2,840.2', change: '+1.2%', up: true },
                { name: 'SOL/USDT', price: '142.15', change: '-3.4%', up: false },
                { name: 'BNB/USDT', price: '592.4', change: '+0.8%', up: true },
              ].map(p => (
                <div key={p.name} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-zinc-500">${p.price}</p>
                  </div>
                  <span className={p.up ? "text-emerald-400 text-xs" : "text-rose-400 text-xs"}>
                    {p.change}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
