const Arena = require('bull-arena');
const  { Queue, FlowProducer } = require('bullmq');

const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
};

Arena({
  BullMQ: Queue,
  FlowBullMQ: FlowProducer,
  queues: (process.env.APP_QUEUE || '').split(';').map(name => ({
      name,
      redis,
      type: 'bullmq',
      hostId: "worker",
  })),
  flows: (process.env.APP_FLOW || '').split(';').map(name => ({
      name,
      redis,
      type: 'bullmq',
      hostId: "worker",
  })),
});
