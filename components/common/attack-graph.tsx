"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import type { ScanReport } from "@/lib/mock-data"

interface AttackGraphProps {
  data?: ScanReport["attackStory"]
  compact?: boolean
}

const defaultData = {
  nodes: [
    { id: "1", label: "/auth/login", type: "endpoint" },
    { id: "2", label: "SQL Injection", type: "vulnerability" },
    { id: "3", label: "Database", type: "asset" },
    { id: "4", label: "User Data", type: "data" },
    { id: "5", label: "API Keys", type: "secret" },
  ],
  edges: [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "3", to: "5" },
  ],
}

const nodePositions: Record<string, { x: number; y: number }> = {
  "1": { x: 50, y: 50 },
  "2": { x: 200, y: 50 },
  "3": { x: 350, y: 50 },
  "4": { x: 450, y: 20 },
  "5": { x: 450, y: 80 },
}

const nodeColors: Record<string, { main: string; glow: string; gradient: string }> = {
  endpoint: { 
    main: "#06b6d4", 
    glow: "rgba(6, 182, 212, 0.4)",
    gradient: "from-cyan-500 to-blue-500"
  },
  vulnerability: { 
    main: "#ef4444", 
    glow: "rgba(239, 68, 68, 0.4)",
    gradient: "from-red-500 to-rose-500"
  },
  asset: { 
    main: "#f59e0b", 
    glow: "rgba(245, 158, 11, 0.4)",
    gradient: "from-orange-500 to-yellow-500"
  },
  data: { 
    main: "#10b981", 
    glow: "rgba(16, 185, 129, 0.4)",
    gradient: "from-emerald-500 to-green-500"
  },
  secret: { 
    main: "#8b5cf6", 
    glow: "rgba(139, 92, 246, 0.4)",
    gradient: "from-purple-500 to-pink-500"
  },
}

export function AttackGraph({ data = defaultData, compact = false }: AttackGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const height = compact ? 120 : 150

  return (
    <motion.div 
      className="glass-card rounded-2xl overflow-hidden p-6 relative group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px"
          }}
        />
      </div>

      {/* Title */}
      <motion.div 
        className="mb-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-mono text-muted-foreground flex items-center gap-2">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          Attack Path Analysis
        </h3>
        <span className="text-xs text-muted-foreground/50">{data.nodes.length} nodes</span>
      </motion.div>

      {/* SVG Graph */}
      <svg width="100%" height={height} viewBox="0 0 500 100" className="w-full relative z-10">
        <defs>
          {/* Arrow marker with glow */}
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
          </marker>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pulse filter */}
          <filter id="pulse">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
            <feBlend in="SourceGraphic" in2="glow" />
          </filter>
        </defs>

        {/* Edges with animated drawing */}
        {data.edges.map((edge, index) => {
          const fromPos = nodePositions[edge.from] || { x: 0, y: 0 }
          const toPos = nodePositions[edge.to] || { x: 0, y: 0 }
          const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to

          return (
            <g key={`edge-${index}`}>
              {/* Glow line background */}
              <motion.line
                x1={fromPos.x + 40}
                y1={fromPos.y}
                x2={toPos.x - 10}
                y2={toPos.y}
                stroke={isHighlighted ? "#10b981" : "#3f3f46"}
                strokeWidth={isHighlighted ? "3" : "2"}
                strokeOpacity={isHighlighted ? 0.6 : 0.3}
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isHighlighted ? 0.6 : 0.3 }}
                transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
              />
              
              {/* Main line */}
              <motion.line
                x1={fromPos.x + 40}
                y1={fromPos.y}
                x2={toPos.x - 10}
                y2={toPos.y}
                stroke={isHighlighted ? "#10b981" : "#52525b"}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
              />

              {/* Animated flow particle */}
              {isHighlighted && (
                <motion.circle
                  r="2"
                  fill="#10b981"
                  filter="url(#pulse)"
                  animate={{
                    cx: [fromPos.x + 40, toPos.x - 10],
                    cy: [fromPos.y, toPos.y],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {data.nodes.map((node, index) => {
          const pos = nodePositions[node.id] || { x: 0, y: 0 }
          const colors = nodeColors[node.type] || nodeColors.data
          const isHovered = hoveredNode === node.id

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.1 + 0.3, 
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
              whileHover={{ scale: 1.1 }}
            >
              {/* Outer glow ring */}
              <motion.circle 
                cx={pos.x} 
                cy={pos.y} 
                r="15" 
                fill={colors.main}
                opacity="0.1"
                animate={isHovered ? { 
                  r: [15, 18, 15],
                  opacity: [0.1, 0.2, 0.1]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {/* Middle glow */}
              <circle 
                cx={pos.x} 
                cy={pos.y} 
                r="10" 
                fill={colors.main}
                opacity="0.15" 
                filter="url(#glow)"
              />
              
              {/* Core node */}
              <motion.circle 
                cx={pos.x} 
                cy={pos.y} 
                r="5" 
                fill={colors.main}
                filter={isHovered ? "url(#pulse)" : undefined}
                animate={isHovered ? {
                  r: [5, 6, 5],
                } : {}}
                transition={{ duration: 0.5 }}
              />

              {/* Label */}
              <text 
                x={pos.x} 
                y={pos.y + 22} 
                textAnchor="middle" 
                fill={isHovered ? colors.main : "#a1a1aa"}
                fontSize="8" 
                fontFamily="system-ui"
                fontWeight={isHovered ? "600" : "400"}
                className="transition-all duration-300"
              >
                {node.label}
              </text>

              {/* Hover tooltip background */}
              {isHovered && (
                <motion.rect
                  x={pos.x - 30}
                  y={pos.y - 35}
                  width="60"
                  height="18"
                  rx="4"
                  fill="rgba(10, 10, 12, 0.9)"
                  stroke={colors.main}
                  strokeWidth="1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                />
              )}
              
              {/* Hover tooltip text */}
              {isHovered && (
                <motion.text
                  x={pos.x}
                  y={pos.y - 24}
                  textAnchor="middle"
                  fill={colors.main}
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {node.type}
                </motion.text>
              )}
            </motion.g>
          )
        })}
      </svg>

      {/* Legend */}
      <motion.div 
        className="mt-4 flex flex-wrap gap-3 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        {Object.entries(nodeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5 group cursor-default">
            <motion.div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: colors.main }}
              whileHover={{ scale: 1.3 }}
            />
            <span className="text-muted-foreground capitalize group-hover:text-foreground transition-colors">
              {type}
            </span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}