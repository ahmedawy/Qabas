import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
} from '@xyflow/react';
import type { Node, Edge, NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { api } from '../../api/client';

interface NarratorNodeData extends Record<string, unknown> {
  id: string;
  ID: number;
  Name: string;
  AbbName: string;
  Kunia: string;
  Laqab: string;
  Nasab: string;
  Tabaqa: string;
  DeathYear: string;
  MartabaIbnHajar: string;
  onSelect: (id: number) => void;
  index?: number;
}

const NarratorCustomNode = ({ data }: NodeProps<Node<NarratorNodeData>>) => {
  const isUnknown = data.Name.includes('غير معرف');
  
  return (
    <div 
      dir="rtl"
      className="w-[280px] bg-slate-900/95 border border-slate-800 rounded-2xl px-4 py-2.5 hover:bg-slate-850 hover:border-emerald-500/80 transition-all duration-300 shadow-md hover:shadow-emerald-500/5 text-right cursor-pointer"
      onClick={() => data.onSelect(data.ID)}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: '#10b981', width: 8, height: 8 }} 
      />
      
      <div className="flex flex-row items-center gap-3">
        <div 
          className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner ${
            isUnknown 
              ? 'bg-gradient-to-b from-slate-500 to-slate-700 shadow-slate-500/10' 
              : 'bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-emerald-500/10'
          }`}
        >
          {data.ID}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-100 truncate">
            {data.Name}
          </div>
          {data.Tabaqa && (
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              الطبقة: {data.Tabaqa}
            </div>
          )}
          {data.DeathYear && (
            <div className="text-[9px] text-amber-500/80 mt-0.5">
              وفاته: {data.DeathYear} هـ
            </div>
          )}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: '#10b981', width: 8, height: 8 }} 
      />
    </div>
  );
};

const nodeTypes = {
  narratorNode: NarratorCustomNode,
};

const getLayoutedElements = (
  nodes: Node<NarratorNodeData>[],
  edges: Edge[],
  direction = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 40, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 280, height: 75 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - 140,
        y: nodeWithPosition.y - 37.5,
      },
    };
  });

  return { 
    nodes: layoutedNodes, 
    edges, 
    width: dagreGraph.graph().width || 0,
    height: dagreGraph.graph().height || 0
  };
};

interface CombinedTakhreejChainGraphProps {
  hadithIds: number[];
  onSelectNarrator: (id: number) => void;
}

export const CombinedTakhreejChainGraph: React.FC<CombinedTakhreejChainGraphProps> = ({
  hadithIds,
  onSelectNarrator,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NarratorNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [graphSize, setGraphSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchTakhreejGraph = useCallback(async () => {
    if (hadithIds.length === 0) {
      setNodes([]);
      setEdges([]);
      setGraphSize({ width: 0, height: 0 });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.getCombinedTakhreejChain(hadithIds);
      
      const formattedNodes: Node<NarratorNodeData>[] = res.nodes.map((n) => ({
        id: n.id,
        type: 'narratorNode',
        data: {
          ...n,
          onSelect: onSelectNarrator,
        },
        position: { x: 0, y: 0 },
      }));

      const formattedEdges: Edge[] = res.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      }));

      const layouted = getLayoutedElements(formattedNodes, formattedEdges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setGraphSize({ width: layouted.width, height: layouted.height });
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل شجرة الإسناد المجمعة للتخريج');
    } finally {
      setLoading(false);
    }
  }, [hadithIds, onSelectNarrator, setNodes, setEdges]);

  useEffect(() => {
    fetchTakhreejGraph();
  }, [fetchTakhreejGraph]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (hadithIds.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
        الرجاء تحديد كتب/أحاديث من القائمة للرسم المجمع.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <span className="text-xs text-slate-400">جاري رسم شجرة الإسناد المجمعة...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400 text-sm text-center">
        فشل رسم شجرة الإسناد: {error}
      </div>
    );
  }

  const flowContainerStyle: React.CSSProperties = isFullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#0f172a',
      }
    : {
        width: '100%',
        height: '500px',
        borderRadius: '16px',
        border: '1px solid #1e293b',
        overflow: 'hidden',
        position: 'relative',
      };

  return (
    <div className="space-y-4" dir="ltr">
      <div className="flex justify-between items-center" dir="rtl">
        <div className="text-xs text-slate-400">
          مخطط مجمع لـ {hadithIds.length} أحاديث • {nodes.length} رواة
        </div>
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1.5 text-xs bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-slate-200 transition duration-200 flex items-center gap-1.5"
        >
          {isFullscreen ? (
            <>
              <span>إغلاق ملء الشاشة ✕</span>
            </>
          ) : (
            <>
              <span>ملء الشاشة ⛶</span>
            </>
          )}
        </button>
      </div>

      <div style={flowContainerStyle}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          translateExtent={[
            [-500, -500],
            [graphSize.width + 500, graphSize.height + 500]
          ]}
          nodeExtent={[
            [-500, -500],
            [graphSize.width + 500, graphSize.height + 500]
          ]}
        >
          <Background color="#334155" gap={16} size={1} />
          <Controls position="bottom-right" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.data?.Name?.toString().includes('غير معرف')) return '#64748b';
              return '#10b981';
            }}
            maskColor="rgba(15, 23, 42, 0.7)"
            style={{ backgroundColor: '#1e293b' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
