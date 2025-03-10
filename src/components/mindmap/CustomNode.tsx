import React, { useState, useEffect, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography } from '@mui/material';

// Node shape types
export type NodeShape = 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'hexagon';

// Node data interface
export interface CustomNodeData {
  label: string;
  color?: string;
  textColor?: string;
  fontSize?: number;
  shape?: NodeShape;
  width?: number;
  height?: number;
  icon?: string;
}

const getShapeStyles = (shape: NodeShape, width: number, height: number) => {
  switch (shape) {
    case 'circle':
      return {
        borderRadius: '50%',
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
    case 'diamond':
      return {
        width: `${width}px`,
        height: `${height}px`,
        transform: 'rotate(45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& > *': {
          transform: 'rotate(-45deg)',
        },
      };
    case 'hexagon':
      return {
        width: `${width}px`,
        height: `${height}px`,
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
    case 'rounded':
      return {
        borderRadius: '12px',
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
    case 'rectangle':
    default:
      return {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
  }
};

const CustomNode = ({ data, isConnectable, selected }: NodeProps) => {
  // Default values for node properties
  const {
    label,
    color = '#2196f3',
    textColor = '#ffffff',
    fontSize = 14,
    shape = 'rounded',
    width = 150,
    height = 50,
    icon,
  } = data as CustomNodeData;

  // Get shape-specific styles
  const shapeStyles = getShapeStyles(shape, width, height);

  return (
    <>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />

      {/* Node content */}
      <Box
        sx={{
          ...shapeStyles,
          backgroundColor: color,
          border: selected ? '2px solid #000' : '1px solid #ddd',
          boxShadow: selected ? '0 0 8px 2px rgba(0, 0, 0, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.1)',
          padding: '8px',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {icon && (
            <Box component="span" sx={{ mb: 1 }}>
              {icon}
            </Box>
          )}
          <Typography
            variant="body2"
            sx={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontWeight: 'medium',
              textAlign: 'center',
              wordBreak: 'break-word',
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
    </>
  );
};

export default memo(CustomNode);