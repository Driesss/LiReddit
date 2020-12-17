import { Box, Heading } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import React from 'react';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';

const Post: React.FC<{}> = ({}) => {
    const router = useRouter();
    const intId =
        typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    const { data, loading } = usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId,
        },
    });

    if (loading)
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
            <Heading mb={4}>{data.post.title}</Heading>
            <Box mb={4}>{data?.post?.text}</Box>
            <EditDeletePostButtons
                id={data.post.id}
                creatorId={data.post.creator.id}
            />
        </Layout>
    );
};

export default withApollo({ ssr: true })(Post);
