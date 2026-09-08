import React, { useState, useRef, useEffect } from 'react';
import { ScenarioTrajectory } from '../../types/agentCrucible.types';
import { TraceEngine, DAGLayout, LayoutNode } from '../../engine/TraceEngine';
import { NodeCard } from './NodeCard';
import { ZoomIn, ZoomOut, Maximize2, Move, Eye } from 'lucide-react';

interface DAGCanvasProps {
  scenario: ScenarioTrajectory;
  selectedNode: LayoutNode | null;
  onSelectNode: (node: LayoutNode | null) => void;
  onBranchNode: (node: LayoutNode) => void;
}

export const DAGCanvas: React.FC<DAGCanvasProps> = ({
  scenario,
  selectedNode,
  onSelectNode,
  onBranchNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMinimap, setShowMinimap] = useState(true);

  const layout: DAGLayout = TraceEngine.computeLayout(scenario);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.cursor-pointer')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * zoomFactor, 2.0));
    } else {
      setZoom(z => Math.max(z / zoomFactor, 0.35));
    }
  };

  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 40, y: 40 });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative flex-1 h-full w-full bg-[#07080B] overflow-hidden select-none bg-grid-pattern cursor-grab active:cursor-grabbing"
    >
      {/* Canvas Viewport Transformer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          position: 'absolute'
        }}
      >
        {/* SVG Edge Connectors */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${layout.width}px`,
            height: `${layout.height}px`,
            pointerEvents: 'none'
          }}
        >
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2A3245" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="branch-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3D4761" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {layout.edges.map((edge, idx) => {
            const fromNode = layout.nodes.find(n => n.id === edge.fromId);
            const toNode = layout.nodes.find(n => n.id === edge.toId);
            if (!fromNode || !toNode) return null;

            const startX = fromNode.x + 260; // right of fromNode
            const startY = fromNode.y + 50;  // vertical center
            const endX = toNode.x;           // left of toNode
            const endY = toNode.y + 50;

            const midX = (startX + endX) / 2;
            const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={edge.isBranchEdge ? 'url(#branch-gradient)' : 'url(#edge-gradient)'}
                  strokeWidth={edge.isBranchEdge ? 2.5 : 2}
                  strokeDasharray={edge.isBranchEdge ? '4 3' : undefined}
                />
                <circle cx={endX} cy={endY} r={3} fill={edge.isBranchEdge ? '#A855F7' : '#06B6D4'} />
              </g>
            );
          })}
        </svg>

        {/* Node Cards */}
        {layout.nodes.map((node, index) => (
          <NodeCard
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onSelect={n => onSelectNode(n)}
            onBranch={onBranchNode}
            stepNumber={index + 1}
          />
        ))}
      </div>

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 bg-[#0B0D13]/90 backdrop-blur-md border border-[#2A3245] p-1.5 rounded-lg shadow-xl z-10">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.15, 2.0))}
          title="Zoom In"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C212E] rounded transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z / 1.15, 0.35))}
          title="Zoom Out"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C212E] rounded transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[#1E2330]" />
        <button
          onClick={resetView}
          title="Reset View"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C212E] rounded transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowMinimap(!showMinimap)}
          title="Toggle Minimap"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            showMinimap ? 'text-amber-400 bg-[#1C212E]' : 'text-gray-400 hover:text-white hover:bg-[#1C212E]'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono text-gray-400 px-1.5">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Minimap Overlay */}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-[#0B0D13]/85 backdrop-blur-md border border-[#2A3245] rounded-lg p-2 shadow-2xl z-10 select-none pointer-events-none">
          <div className="text-[9px] font-mono text-gray-400 mb-1 flex items-center justify-between">
            <span>TRAJECTORY MAP</span>
            <span className="text-gray-400">{layout.nodes.length} nodes</span>
          </div>
          <div className="relative w-full h-24 bg-[#07080B] rounded border border-[#1E2330] overflow-hidden">
            {layout.nodes.map(n => {
              const miniX = (n.x / Math.max(layout.width, 1000)) * 170;
              const miniY = (n.y / Math.max(layout.height, 600)) * 80;
              return (
                <div
                  key={`mini-${n.id}`}
                  style={{
                    position: 'absolute',
                    left: `${miniX + 5}px`,
                    top: `${miniY + 5}px`,
                    width: '8px',
                    height: '4px'
                  }}
                  className={`rounded-xs ${
                    n.isChaosPerturbation
                      ? 'bg-pink-500'
                      : n.branchName
                      ? 'bg-purple-500'
                      : n.status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-cyan-500/80'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
