import { Box, Button, Flex } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import {
    usePostQuery,
    useUpdatePostMutation,
} from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';

const EditPost: React.FC<{}> = ({}) => {
    const intId = useGetIntId();
    const [{ data, fetching }] = usePostQuery({
        pause: intId === -1,
        variables: { id: intId },
    });
    const [, updatePost] = useUpdatePostMutation();
    const router = useRouter();

    if (fetching) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        );
    }

    return (
        <Layout variant="small">
            <Formik
                initialValues={{
                    title: data.post.title,
                    text: data.post.text,
                }}
                onSubmit={async (values) => {
                    const { error } = await updatePost({
                        id: intId,
                        ...values,
                    });
                    if (!error) {
                        router.back();
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="title"
                            placeholder="title"
                            label="Title"
                        />
                        <Box mt={4}>
                            <InputField
                                name="text"
                                placeholder="text..."
                                label="Body"
                                textarea
                            />
                        </Box>
                        <Flex mt={4} justifyContent="space-between">
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                variantColor="teal"
                            >
                                update post
                            </Button>
                            <Button
                                type="button"
                                variantColor="red"
                                onClick={() => {
                                    router.back();
                                }}
                            >
                                cancel
                            </Button>
                        </Flex>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(EditPost);
