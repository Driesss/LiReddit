import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Textarea,
    Input,
} from '@chakra-ui/core';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    textarea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
    label,
    textarea,
    size: _,
    ...props
}) => {
    let InputOrTextarea = textarea ? Textarea : Input;
    const [field, { error }] = useField(props);
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <InputOrTextarea
                {...field}
                {...props}
                id={field.name}
                placeholder={props.placeholder}
            />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};

export default InputField;
