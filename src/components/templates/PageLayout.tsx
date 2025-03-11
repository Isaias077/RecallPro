import { ReactNode } from 'react';
import { Container, Box } from '@mui/material';
import Navigation from './Navigation';

export interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

/**
 * PageLayout template component that provides a consistent layout structure for all pages.
 * This component includes the Navigation component and a container for the page content.
 */
export default function PageLayout({ children, maxWidth = 'md' }: PageLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Container 
        maxWidth={maxWidth} 
        sx={{ 
          flexGrow: 1, 
          py: 4,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>
    </Box>
  );
}