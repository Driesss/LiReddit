import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { UpdootSection } from '../components/UpdootSection';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 15,
        cursor: null as string | null,
    });
    const [{ data, fetching }] = usePostsQuery({ variables });

    if (!fetching && !data) {
        return <div> you get no posts for some reason</div>;
    }

    return (
        <Layout>
            <Flex align="center">
                <Heading>LiReddit</Heading>
                <NextLink href="/create-post">
                    <Link ml="auto">create post</Link>
                </NextLink>
            </Flex>
            <br />
            {!data && fetching ? (
                <div>loading...</div>
            ) : (
                <Stack spacing={8}>
                    {data!.posts.posts.map((p) => (
                        <Flex p={5} key={p.id} shadow="md" borderWidth="1px">
                            <UpdootSection post={p} />
                            <Box>
                                <Heading fontSize="xl">{p.title}</Heading>{' '}
                                <Text>posted by {p.creator.username}</Text>
                                <Text mt={4}>{p.textSnippet}</Text>
                            </Box>
                        </Flex>
                    ))}
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
