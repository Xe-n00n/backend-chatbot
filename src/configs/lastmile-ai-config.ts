import { LastMile } from "lastmileai";

const lastMile = new LastMile({apiKey: process.env.LASTMILEAI_API_KEY ?? ""});

export { lastMile };

