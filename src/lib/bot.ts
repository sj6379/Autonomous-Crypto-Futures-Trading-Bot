import { binance } from './binance';
import { analyzeMarket } from './ai';
import { insforge } from './insforge';

export async function runBotIteration(symbol: string, userId: string) {
  try {
    // 1. Fetch Market Data
    const [candles, news] = await Promise.all([
      binance.getCandles(symbol),
      binance.getLatestNews(symbol)
    ]);

    // 2. AI Analysis
    const analysis = await analyzeMarket({ symbol, candles, news });
    
    // 3. Log Analysis
    await insforge.database.from('analysis_logs').insert([{
      symbol,
      signal: analysis.signal,
      sentiment_score: analysis.sentimentScore,
      fundamental_summary: analysis.fundamentalSummary,
      technical_summary: analysis.technicalSummary
    }]);

    // 4. Decision & Execution
    // Get bot settings
    const { data: settings } = await insforge.database
      .from('bot_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settings?.is_active && analysis.signal !== 'HOLD') {
      const amount = settings.risk_per_trade;
      const leverage = settings.leverage || 10; // Default to 10x if not set
      
      const order = await binance.executeTrade({
        symbol,
        side: analysis.signal === 'BUY' ? 'BUY' : 'SELL',
        amount,
        leverage
      });


      // 5. Log Trade
      await insforge.database.from('trades').insert([{
        user_id: userId,
        symbol,
        side: analysis.signal === 'BUY' ? 'BUY' : 'SELL',
        amount,
        price: candles[candles.length - 1].close,
        status: 'COMPLETED'
      }]);

      return { status: 'TRADE_EXECUTED', order, analysis };
    }

    return { status: 'ANALYSIS_COMPLETED', analysis };
  } catch (error) {
    console.error('Bot iteration failed:', error);
    throw error;
  }
}
