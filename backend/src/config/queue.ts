import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export const ORDER_QUEUE_NAME = "orders";

export const orderQueue = new Queue(ORDER_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

console.log(`📦 BullMQ queue "${ORDER_QUEUE_NAME}" initialized`);
