import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import DataLoader from 'dataloader';
import { User } from './entities/User';
import { Updoot } from './entities/Updoot';

export type Mycontext = {
    req: Request;
    res: Response;
    redis: Redis;
    userLoader: DataLoader<number, User>;
    updootLoader: DataLoader<{ userId: number; postId: number }, Updoot | null>;
};
