import { client } from "./entities/Client";
import bigDecimal from 'js-big-decimal';

require("dotenv").config();

const TICKER = "PEPEUSDT";

if (
  !process.env.INTERVAL_BETWEEN_ORDERS_IN_SECONDS ||
  !process.env.DURATION_IN_SECONDS ||
  !process.env.QTY_TO_BUY ||
  !process.env.BYBIT_ACCESS_KEY ||
  !process.env.BYBIT_SECRET_KEY
) {
  throw new Error("Environment variables not set");
}

const roundToTick = (number: bigDecimal, tickSize: bigDecimal) => {
  return number.divide(tickSize).round().multiply(tickSize);
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
  const minPrice = roundToTick(new bigDecimal(min), new bigDecimal(priceFilter.tickSize));
  const maxPrice = roundToTick(new bigDecimal(max), new bigDecimal(priceFilter.tickSize));
  const interval = maxPrice.subtract(minPrice).divide(new bigDecimal(100))

  const orders = [minPrice];
  let tmp = minPrice;

  for (let i = 0; i < 97; i++) {
    tmp = tmp.add(interval);
    orders.push(roundToTick(tmp, new bigDecimal(priceFilter.tickSize)));
  }

  orders.push(maxPrice);

  for (let i = 0; i < orders.length; i++) {
    const resp = await client.submitOrder({
      category: "spot",
      symbol: TICKER,
      side: "Buy",
      orderType: "Limit",
      qty: `${roundToTick(
        (new bigDecimal(amount)).divide(new bigDecimal(100)).divide(orders[i]),
        new bigDecimal(lotSizeFilter.basePrecision)
      ).getValue()}`,
      price: `${orders[i].getValue()}`,
    });
    console.log(resp.retMsg);
  }
};

void main();
