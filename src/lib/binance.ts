import Binance from 'binance-api-node';

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET_KEY,
});

export interface TradeParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: number;
  leverage?: number;
}

export interface BinanceOrder {
  orderId: string | number;
  symbol: string;
  status: string;
  transactTime: number;
}

export class BinanceService {
  /**
   * Fetch Futures Candlestick data (USD-M)
   */
  async getCandles(symbol: string, limit: number = 100): Promise<any[]> {
    const candles = await client.futuresCandles({ symbol, interval: '1m', limit });
    return candles.map(c => ({
      time: c.openTime,
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume)
    }));
  }

  /**
   * Set Leverage for a specific symbol
   */
  async setLeverage(symbol: string, leverage: number) {
    return await client.futuresLeverage({
      symbol,
      leverage,
    });
  }

  /**
   * Execute Futures Trade (USD-M Market Order)
   */
  async executeTrade(params: TradeParams): Promise<BinanceOrder> {
    // 1. Set leverage if provided
    if (params.leverage) {
      await this.setLeverage(params.symbol, params.leverage);
    }

    // 2. Place Market Order
    const order: any = await client.futuresOrder({
      symbol: params.symbol,
      side: params.side as any,
      type: 'MARKET' as any,
      quantity: params.amount.toString(),
    });

    return {
      orderId: order.orderId,
      symbol: order.symbol,
      status: order.status,
      transactTime: order.updateTime
    };

  }

  async getLatestNews(symbol: string): Promise<string[]> {
    return [
      `${symbol} futures liquidations spiking in last 24h.`,
      `Open interest for ${symbol} reaches new monthly high.`,
      `Whale activity detected in ${symbol} perpetual swaps.`
    ];
  }
}

export const binance = new BinanceService();
export { client as binanceClient };
