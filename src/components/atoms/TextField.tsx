import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'error'> {
  // Add any additional props specific to our application
  error?: boolean;
}

/**
 * Text input component that wraps Material UI TextField with custom styling.
 * This is an atomic component that serves as a building block for form fields.
 */
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => {
  const { ...rest } = props;
  
  return (
    <MuiTextField
      ref={ref}
      fullWidth
      margin="normal"
      {...rest}
    />
  );
});

TextField.displayName = 'TextField';

export default TextField;