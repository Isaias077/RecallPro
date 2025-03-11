import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material';
import { forwardRef } from 'react';

export interface TypographyProps extends MuiTypographyProps {
  // Add any additional props specific to our application
  htmlFor?: string;
}

/**
 * Typography component that wraps Material UI Typography with custom styling.
 * This is an atomic component that serves as a building block for text elements.
 */
export const Typography = forwardRef<HTMLSpanElement, TypographyProps>((props, ref) => {
  const { children, ...rest } = props;
  
  return (
    <MuiTypography
      ref={ref}
      {...rest}
    >
      {children}
    </MuiTypography>
  );
});

Typography.displayName = 'Typography';

export default Typography;