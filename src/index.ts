import { client } from "./entities/Client";

require("dotenv").config();

if (
  !process.env.INTERVAL_BETWEEN_ORDERS_IN_SECONDS ||
  !process.env.DURATION_IN_SECONDS ||
  !process.env.QTY_TO_BUY ||
  !process.env.BYBIT_ACCESS_KEY ||
  !process.env.BYBIT_SECRET_KEY ||
  !process.env.TICKER
) {
  throw new Error("Environment variables not set");
}

const TICKER = process.env.TICKER;
const INTERVAL = +process.env.INTERVAL_BETWEEN_ORDERS_IN_SECONDS;
const DURATION = +process.env.DURATION_IN_SECONDS;

// CHANGE
const TOTAL_AMOUNT_TO_BUY = +process.env.QTY_TO_BUY;
const AMOUNT_PER_ORDER = TOTAL_AMOUNT_TO_BUY / (DURATION / INTERVAL);

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const loop = async () => {
  for (let i = 0; i < DURATION / INTERVAL; i++) {
    console.log(`Submitting order: ${i}`);
    const resp = await client.submitOrder({
      category: "spot",
      symbol: TICKER,
      side: "Buy",
      orderType: "Market",
      qty: `${AMOUNT_PER_ORDER}`,
    });
    console.log(resp.retMsg);
    await timer(INTERVAL * 1000);
  }
};

void loop();
