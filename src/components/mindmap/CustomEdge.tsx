import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

export interface CustomEdgeData {
  label?: string;
  color?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  strokeWidth?: number;
  labelStyle?: React.CSSProperties;
}

const CustomEdge = ({ //@ts-ignore
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps) => {
  // Default values for edge properties
  const {
    label,
    color = '#888',
    animated = false,
    strokeWidth = 1.5,
    labelStyle,
  } = (data || {}) as CustomEdgeData;

  // Calculate the path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Combine styles
  const edgeStyle = {
    stroke: color,
    strokeWidth,
    ...style,
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...edgeStyle, // @ts-ignore
          animationDashoffset: animated ? 1 : 0,
          animationDasharray: animated ? '5 5' : 'none',
          animation: animated ? 'dashdraw 0.5s linear infinite' : 'none'
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'white',
              padding: '2px 4px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              pointerEvents: 'all',
              ...labelStyle,
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;