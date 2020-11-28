import 'dotenv-safe/config';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import path from 'path';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import {
    COOKIE_NAME,
    COOKIE_SECRET,
    CORS_ORIGIN,
    PG_DBNAME,
    PG_HOST,
    PG_PASSWORD,
    PG_USERNAME,
    REDIS_HOST,
    REDIS_PASSWORD,
    __port__,
    __prod__,
} from './constants';
import { Post } from './entities/Post';
import { Updoot } from './entities/Updoot';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { Postresolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { Mycontext } from './types';
import { createUpdootLoader } from './utils/createUpdootLoader';
import { createUserLoader } from './utils/createUserLoader';

const main = async () => {
    console.log(PG_HOST, REDIS_HOST);
    const conn = await createConnection({
        type: 'postgres',
        database: PG_DBNAME,
        username: PG_USERNAME,
        password: PG_PASSWORD,
        host: PG_HOST,
        // logging: true,
        // synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User, Updoot],
    });

    await conn.runMigrations();

    // await Post.delete({});

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis({
        host: REDIS_HOST,
        password: REDIS_PASSWORD,
    });

    app.set('trust proxy', 1);
    app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax',
                secure: __prod__, //cookie only works in https
                domain: __prod__ ? '.driesstelten.dev' : undefined,
            },
            saveUninitialized: false,
            secret: COOKIE_SECRET,
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, Postresolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): Mycontext => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader(),
        }),
    });

    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.listen(__port__, () => {
        console.log(`server listening on port ${__port__}`);
    });
};

main().catch((err) => console.log(err));
