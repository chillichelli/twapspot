import { RestClientV5 } from "bybit-api";

export const client = new RestClientV5({
  key: "",
  secret: "",
  enable_time_sync: true,
});
