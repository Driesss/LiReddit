import { Updoot } from '../entities/Updoot';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { isAuth } from '../middleware/isAuth';
import { Mycontext } from '../types';

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class Postresolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: Mycontext
    ) {
        const { userId } = req.session;
        const updoot = await Updoot.findOne({ where: { postId, userId } });
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;

        // the user has voted on the post before
        // and they are changing their vote
        if (updoot && updoot.value !== realValue) {
            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `
                    UPDATE updoot
                    SET value = $1
                    WHERE "postId" = $2 and "userId" = $3`,
                    [value, postId, userId]
                );
                await tm.query(
                    `
                    UPDATE post
                    SET points = points + $1
                    WHERE id = $2;`,
                    [2 * realValue, postId]
                );
            });
        } else if (!updoot) {
            // has never voted before

            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `
                    INSERT INTO updoot("userId", "postId", value)
                    VALUES ($1,$2,$3);`,
                    [userId, postId, value]
                );

                await tm.query(
                    `
                    UPDATE post
                    SET points = points + $1
                    WHERE id = $2;`,
                    [value, postId]
                );
            });
        }
        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        @Ctx() { req }: Mycontext
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const replacements: any[] = [realLimitPlusOne];

        if (req.session.userId) replacements.push(req.session.userId);

        let cursorIdx = 3;
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
            cursorIdx = replacements.length;
        }
        const posts = await getConnection().query(
            `
        SELECT p.*,
        u.username,
        json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'createdAt', u."createdAt",
            'updatedAt', u."updatedAt"
            ) creator,
        ${
            req.session.userId
                ? `(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"`
                : `null as "voteStatus"`
        }
        FROM post p
        INNER JOIN public.user u on u.id = p."creatorId"
        ${cursor ? `WHERE p."createdAt" < $${cursorIdx}` : ''}
        ORDER BY p."createdAt" DESC
        LIMIT $1
        `,
            replacements
        );

        console.log(posts[0]);

        // const qb = getConnection()
        //     .getRepository(Post)
        //     .createQueryBuilder('p')
        //     .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
        //     .orderBy('p."createdAt"', 'DESC')
        //     .take(realLimitPlusOne);

        // if (cursor) {
        //     qb.where('p."createdAt" < :cursor', {
        //         cursor: new Date(parseInt(cursor)),
        //     });
        // }
        // const posts = await qb.getMany();

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id, { relations: ['creator'] });
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: Mycontext
    ): Promise<Post> {
        return Post.create({ ...input, creatorId: req.session.userId }).save();
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        let post = await Post.findOne(id);
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            await Post.update({ id }, { title });
        }
        return post;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: Mycontext
    ): Promise<Boolean> {
        // const post = await Post.findOne(id);
        // if (!post) return false;
        // if (post.creatorId !== req.session.userId) {
        //     throw new Error('not authorized');
        // }
        // await Updoot.delete({ postId: id });
        await Post.delete({ id, creatorId: req.session.userId });
        return true;
    }
}
