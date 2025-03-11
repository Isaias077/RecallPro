import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { forwardRef } from 'react';

export interface ButtonProps extends MuiButtonProps {
  // Add any additional props specific to our application
}

/**
 * Primary UI button component that wraps Material UI Button with custom styling.
 * This is an atomic component that serves as a building block for other components.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, ...rest } = props;
  
  return (
    <MuiButton
      ref={ref}
      {...rest}
    >
      {children}
    </MuiButton>
  );
});

Button.displayName = 'Button';

export default Button;