import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';
import { forwardRef } from 'react';

export interface CardProps extends MuiCardProps {
  // Add any additional props specific to our application
}

/**
 * Card component that wraps Material UI Card with custom styling.
 * This is an atomic component that serves as a building block for card-based elements.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { children, ...rest } = props;
  
  return (
    <MuiCard
      ref={ref}
      {...rest}
    >
      {children}
    </MuiCard>
  );
});

Card.displayName = 'Card';

export default Card;