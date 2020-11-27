import { Flex, IconButton } from '@chakra-ui/core';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<
        'updoot-loading' | 'downdoot-loading' | 'not-loading'
    >('not-loading');
    const [, vote] = useVoteMutation();
    return (
        <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            mr={4}
        >
            <IconButton
                icon="chevron-up"
                isLoading={loadingState === 'updoot-loading'}
                aria-label="Updoot post"
                onClick={async () => {
                    setLoadingState('updoot-loading');
                    await vote({ postId: post.id, value: 1 });
                    setLoadingState('not-loading');
                }}
            />
            {post.points}
            <IconButton
                icon="chevron-down"
                aria-label="Downdoot post"
                isLoading={loadingState === 'downdoot-loading'}
                onClick={async () => {
                    setLoadingState('downdoot-loading');
                    await vote({ postId: post.id, value: -1 });
                    setLoadingState('not-loading');
                }}
            />
        </Flex>
    );
};
