declare namespace NodeJS {
  export interface ProcessEnv {
    PG_USERNAME: string;
    PG_PASSWORD: string;
    PG_HOST: string;
    PG_DBNAME: string;
    REDIS_PASSWORD: string;
    REDIS_HOST: string;
    COOKIE_SECRET: string;
    CORS_ORIGIN: string;
  }
}
