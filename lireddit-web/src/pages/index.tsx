import {
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Link,
    Stack,
    Text,
} from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { UpdootSection } from '../components/UpdootSection';
import {
    useDeletePostMutation,
    useMeQuery,
    usePostsQuery,
} from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 15,
        cursor: null as string | null,
    });

    const [{ data: meData }] = useMeQuery();
    const [{ data, fetching }] = usePostsQuery({ variables });

    const [, deletePost] = useDeletePostMutation();

    if (!fetching && !data) {
        return <div> you get no posts for some reason</div>;
    }

    return (
        <Layout>
            {!data && fetching ? (
                <div>loading...</div>
            ) : (
                <Stack spacing={8}>
                    {data!.posts.posts.map((p) =>
                        !p ? null : (
                            <Flex
                                p={5}
                                key={p.id}
                                shadow="md"
                                borderWidth="1px"
                            >
                                <UpdootSection post={p} />
                                <Box flex={1}>
                                    <NextLink
                                        href={'/post/[id]'}
                                        as={`/post/${p.id}`}
                                    >
                                        <Link>
                                            <Heading fontSize="xl">
                                                {p.title}
                                            </Heading>{' '}
                                        </Link>
                                    </NextLink>
                                    <Text>posted by {p.creator.username}</Text>
                                    <Flex align="center">
                                        <Text flex={1} mt={4}>
                                            {p.textSnippet}
                                        </Text>
                                        {meData?.me?.id !==
                                        p.creator.id ? null : (
                                            <Box ml="auto">
                                                <NextLink
                                                    href={'/post/edit/[id]'}
                                                    as={`/post/edit/${p.id}`}
                                                >
                                                    <IconButton
                                                        mr={2}
                                                        icon="edit"
                                                        aria-label="Edit Post"
                                                        as={Link}
                                                    />
                                                </NextLink>
                                                <IconButton
                                                    icon="delete"
                                                    aria-label="Delete Post"
                                                    onClick={() => {
                                                        deletePost({
                                                            id: p.id,
                                                        });
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Flex>
                                </Box>
                            </Flex>
                        )
                    )}
                </Stack>
            )}
            {data && data.posts.hasMore ? (
                <Flex>
                    <Button
                        onClick={() => {
                            setVariables({
                                limit: variables.limit,
                                cursor:
                                    data.posts.posts[
                                        data.posts.posts.length - 1
                                    ].createdAt,
                            });
                        }}
                        isLoading={fetching}
                        m="auto"
                        my={8}
                    >
                        load more
                    </Button>
                </Flex>
            ) : null}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
