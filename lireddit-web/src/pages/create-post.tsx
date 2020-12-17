import { Box, Button, Flex } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';

const createPost: React.FC<{}> = ({}) => {
    const router = useRouter();
    useIsAuth();
    const [createPost] = useCreatePostMutation();
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: '', text: '' }}
                onSubmit={async (values) => {
                    const { errors } = await createPost({
                        variables: { input: values },
                        update: (cache) => {
                            cache.evict({ fieldName: 'posts:{}' });
                        },
                    });
                    if (!errors) {
                        router.push('/');
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
                                create post
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

export default withApollo({ ssr: false })(createPost);
