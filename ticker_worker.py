import os
import time
import json
import asyncio
import requests
from binance import AsyncClient, BinanceSocketManager
from dotenv import load_dotenv

load_dotenv()

# InsForge Configuration
INSFORGE_BASE_URL = os.getenv("NEXT_PUBLIC_INSFORGE_BASE_URL")
INSFORGE_ANON_KEY = os.getenv("NEXT_PUBLIC_INSFORGE_ANON_KEY")

async def main():
    print("🚀 Starting Binance FUTURES Ticker Worker...")
    
    client = await AsyncClient.create()
    bm = BinanceSocketManager(client)
    
    # Use Futures Ticker Socket
    ts = bm.futures_symbol_ticker_socket('BTCUSDT')

    async with ts as tscm:
        while True:
            try:
                msg = await tscm.recv()
                if msg:
                    # Extract relevant data from Futures message
                    price = float(msg['c'])
                    symbol = msg['s']
                    change = float(msg['p'])
                    percent = float(msg['P'])

                    payload = {
                        "symbol": symbol,
                        "price": price,
                        "change": change,
                        "percent": percent,
                        "timestamp": int(time.time() * 1000),
                        "is_futures": True
                    }

                    # Publish to InsForge Realtime via RPC
                    response = requests.post(
                        f"{INSFORGE_BASE_URL}/rest/v1/rpc/realtime_publish",
                        headers={
                            "apikey": INSFORGE_ANON_KEY,
                            "Authorization": f"Bearer {INSFORGE_ANON_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "channel_name": "ticker",
                            "event_name": "price_update",
                            "payload": payload
                        }
                    )
                    
                    if response.status_code != 200:
                        print(f"❌ Failed to publish: {response.text}")
                    else:
                        print(f"📉 [FUTURES] {symbol}: ${price}")

            except Exception as e:
                print(f"⚠️ Worker Error: {e}")
                await asyncio.sleep(5)

    await client.close_connection()

if __name__ == "__main__":
    asyncio.run(main())
