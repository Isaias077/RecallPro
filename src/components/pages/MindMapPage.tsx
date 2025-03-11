import React from 'react';
import { Box } from '@mui/material';
import MindMapManager from '../mindmap/MindMapManager';
import PageLayout from '../templates/PageLayout';
import Typography from '../atoms/Typography';

/**
 * MindMapPage component
 * 
 * A page component that provides an interface for creating and managing mind maps.
 * This page uses the MindMapManager organism and is mapped to the /mindmap route.
 */
const MindMapPage: React.FC = () => {
  return (
    <PageLayout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mind Maps
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Create visual representations of concepts and ideas to enhance your learning.
        </Typography>
        <MindMapManager />
      </Box>
    </PageLayout>
  );
};

export default MindMapPage;