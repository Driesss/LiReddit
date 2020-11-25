import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type Mycontext = {
    req: Request;
    res: Response;
    redis: Redis;
};
