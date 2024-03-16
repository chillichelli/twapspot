import { client } from "./entities/Client";

require("dotenv").config();

const TICKER = "ONDOUSDT";

if (
  !process.env.INTERVAL_BETWEEN_ORDERS_IN_SECONDS ||
  !process.env.DURATION_IN_SECONDS ||
  !process.env.QTY_TO_BUY ||
  !process.env.BYBIT_ACCESS_KEY ||
  !process.env.BYBIT_SECRET_KEY
) {
  throw new Error("Environment variables not set");
}

const roundToTick = (number: number, tickSize: string) => {
  const tickSizeValue = parseFloat(tickSize);
  if (isNaN(tickSizeValue) || tickSizeValue <= 0) {
    throw new Error("Invalid tickSize value");
  }

  const roundedNumber = Math.round(number / tickSizeValue) * tickSizeValue;
  return parseFloat(roundedNumber.toFixed(tickSize.split(".")[1].length));
};

const parseArgs = (args: string[]) => {
  const parsedArgs: Record<string, string> = {};

  args.forEach((arg) => {
    const parts = arg.split("=");

    parsedArgs[parts[0].replace("--", "")] = parts[1];
  });

  return parsedArgs;
};

const main = async () => {
  const { min, max, amount } = parseArgs(process.argv);
  const info = await client.getInstrumentsInfo({
    category: "spot",
    symbol: TICKER,
  });

  if (info.retCode !== 0) {
    throw new Error("Error fetching instrument info");
  }

  const { priceFilter, lotSizeFilter } = info.result.list[0];
  const minPrice = roundToTick(+min, priceFilter.tickSize);
  const maxPrice = roundToTick(+max, priceFilter.tickSize);
  const interval = (maxPrice - minPrice) / 100;

  const orders = [minPrice];
  let tmp = minPrice;

  for (let i = 0; i < 97; i++) {
    tmp += interval;
    orders.push(roundToTick(tmp, priceFilter.tickSize));
  }

  orders.push(maxPrice);

  for (let i = 0; i < orders.length; i++) {
    const resp = await client.submitOrder({
      category: "spot",
      symbol: TICKER,
      side: "Sell",
      orderType: "Limit",
      qty: `${roundToTick(
        +amount / 100 / orders[i],
        lotSizeFilter.basePrecision
      )}`,
      price: `${orders[i]}`,
    });
    console.log(resp.retMsg);
  }
};

void main();
