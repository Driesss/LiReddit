import { Box, Heading } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const Post: React.FC<{}> = ({}) => {
    const router = useRouter();
    const intId =
        typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    const [{ data, fetching }] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId,
        },
    });

    console.log('fetching:', fetching);
    console.log(data);

    if (fetching)
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );

    if (!data?.post)
        return (
            <Layout>
                <Box>post not fount</Box>
            </Layout>
        );

    return (
        <Layout>
            <Heading mb={4}>{data.post.title}</Heading> {data?.post?.text}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
