import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import {
    COOKIE_NAME,
    COOKIE_SECRET,
    PG_HOST,
    PG_PASSWORD,
    PG_USERNAME,
    REDIS_HOST,
    REDIS_PASSWORD,
    __port__,
    __prod__,
} from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { Postresolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { Mycontext } from './types';

const main = async () => {
    await createConnection({
        type: 'postgres',
        database: 'lireddit',
        username: PG_USERNAME,
        password: PG_PASSWORD,
        host: PG_HOST,
        logging: true,
        synchronize: true,
        entities: [Post, User],
    });
    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis({
        host: REDIS_HOST,
        password: REDIS_PASSWORD,
    });

    app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

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
        context: ({ req, res }): Mycontext => ({ req, res, redis }),
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
