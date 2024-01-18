import { client } from "./entities/Client";

const TICKER = "ARBUSDT";

const INTERVAL = 5;
const DURATION = 86400 * 2;

// CHANGE
const TOTAL_AMOUNT_TO_BUY = 100;
const AMOUNT_PER_ORDER = TOTAL_AMOUNT_TO_BUY / (DURATION / INTERVAL);

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const loop = async () => {
  for (let i = 0; i < DURATION / INTERVAL; i++) {
    console.log(`Submitting order: ${i}`);
    await client.submitOrder({
      category: "spot",
      symbol: TICKER,
      side: "Buy",
      orderType: "Market",
      qty: `${AMOUNT_PER_ORDER}`,
    });
    await timer(INTERVAL * 1000);
  }
};

void loop();
