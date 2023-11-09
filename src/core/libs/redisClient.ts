import Redis from 'ioredis';

interface ConnectionConfig {
  port: number;
  host: string;
  password?: string;
}

class RedisConnection {
  private static instance: Redis;

  public static connect(config: ConnectionConfig): Redis {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new Redis({
        port: Number(config.port),
        host: config.host as string,
        [config.password ? 'password' : null]: config.password
          ? config.password
          : undefined,
      });
    }
    return RedisConnection.instance;
  }
}

const redisClient = RedisConnection.connect({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST,
});

export { redisClient };
