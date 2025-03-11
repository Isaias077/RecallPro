import { ReactNode } from 'react';
import { Box, FormHelperText } from '@mui/material';
import TextField, { TextFieldProps } from '../atoms/TextField';
import Typography from '../atoms/Typography';

export interface FormFieldProps extends Omit<TextFieldProps, 'error' | 'helperText'> {
  label?: string;
  error?: string | null;
  helperText?: string;
  children?: ReactNode;
}

/**
 * FormField component that combines a TextField with error handling and helper text.
 * This is a molecular component composed of TextField and Typography atoms.
 */
export const FormField = (props: FormFieldProps) => {
  const { label, error, helperText, children, ...rest } = props;
  
  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="subtitle1" component="label" htmlFor={rest.id} sx={{ mb: 1, display: 'block' }}>
          {label}
        </Typography>
      )}
      
      {children || (
        <TextField
          error={!!error}
          {...rest}
        />
      )}
      
      {(error || helperText) && (
        <FormHelperText error={!!error}>
          {error || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default FormField;