import IORedis from "ioredis";

const redisOptions: any = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
};

if (process.env.REDIS_PASSWORD) {
  redisOptions.password = process.env.REDIS_PASSWORD;
}

export const redisConnection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis(redisOptions);

redisConnection.on("connect", () => console.log("✅ Redis connected"));
redisConnection.on("error", (err) => console.error("❌ Redis error:", err));
