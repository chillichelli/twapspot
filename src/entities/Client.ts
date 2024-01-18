import { RestClientV5 } from "bybit-api";

require("dotenv").config();

export const client = new RestClientV5({
  key: process.env.BYBIT_ACCESS_KEY,
  secret: process.env.BYBIT_SECRET_KEY,
  enable_time_sync: true,
});
