import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface MarketData {
  symbol: string;
  candles: any[];
  news: string[];
}

export interface AnalysisResult {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  sentimentScore: number;
  fundamentalSummary: string;
  technicalSummary: string;
}

export async function analyzeMarket(data: MarketData): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following market data for ${data.symbol}:
    
    TECHNICAL DATA (Candlesticks):
    ${JSON.stringify(data.candles.slice(-10))}
    
    FUNDAMENTAL DATA (News Headlines):
    ${data.news.join('\n')}
    
    Conduct a technical, fundamental, and sentimental analysis.
    Provide a final trading signal (BUY, SELL, or HOLD), a sentiment score (0 to 1), and brief summaries for technical and fundamental findings.
    
    Return the result in JSON format:
    {
      "signal": "BUY" | "SELL" | "HOLD",
      "sentimentScore": 0.85,
      "technicalSummary": "...",
      "fundamentalSummary": "..."
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  const jsonMatch = content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const analysis = JSON.parse(jsonMatch[0]);

  return {
    symbol: data.symbol,
    ...analysis
  };
}
