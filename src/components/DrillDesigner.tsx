import React, { useState, useRef, useEffect } from 'react';
import { X, Pen, Square, Circle, Triangle, Type, Users, Target, Flag, Move, Copy, Trash2, RotateCcw, Redo2, Undo2 } from 'lucide-react';

export interface DrillItem {
  id: string;
  type: 'player' | 'cone' | 'flag' | 'ball' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'triangle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  text?: string;
  points?: { x: number; y: number }[];
  selected?: boolean;
}

export interface DrillDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (drillData: { name: string; description: string; items: DrillItem[] }) => void;
  drill?: { name: string; description: string; items: DrillItem[] };
}

const DrillDesigner: React.FC<DrillDesignerProps> = ({ isOpen, onClose, onSave, drill }) => {
  const [drillName, setDrillName] = useState(drill?.name || '');
  const [drillDescription, setDrillDescription] = useState(drill?.description || '');
  const [items, setItems] = useState<DrillItem[]>(drill?.items || []);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<DrillItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add to history when items change
  const addToHistory = (newItems: DrillItem[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newItems]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setItems([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setItems([...history[historyIndex + 1]]);
    }
  };

  const tools = [
    { id: 'select', icon: Move, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Draw' },
    { id: 'player', icon: Users, label: 'Player' },
    { id: 'cone', icon: Triangle, label: 'Cone' },
    { id: 'flag', icon: Flag, label: 'Flag' },
    { id: 'ball', icon: Target, label: 'Ball' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  const getCanvasCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const isPointInItem = (point: { x: number; y: number }, item: DrillItem): boolean => {
    const tolerance = 3;
    
    switch (item.type) {
      case 'player':
      case 'cone':
      case 'flag':
      case 'ball':
        const distance = Math.sqrt(Math.pow(point.x - item.x, 2) + Math.pow(point.y - item.y, 2));
        return distance <= tolerance;
      
      case 'rectangle':
        const width = item.width || 8;
        const height = item.height || 6;
        return point.x >= item.x - width/2 && point.x <= item.x + width/2 &&
               point.y >= item.y - height/2 && point.y <= item.y + height/2;
      
      case 'circle':
        const radius = item.width || 4;
        const circleDistance = Math.sqrt(Math.pow(point.x - item.x, 2) + Math.pow(point.y - item.y, 2));
        return circleDistance <= radius;
      
      case 'text':
        return point.x >= item.x - 5 && point.x <= item.x + 10 &&
               point.y >= item.y - 2 && point.y <= item.y + 2;
      
      case 'line':
      case 'arrow':
        if (!item.points || item.points.length < 2) return false;
        // Check if point is near any line segment
        for (let i = 0; i < item.points.length - 1; i++) {
          const p1 = item.points[i];
          const p2 = item.points[i + 1];
          const distToLine = distanceToLineSegment(point, p1, p2);
          if (distToLine <= tolerance) return true;
        }
        return false;
      
      default:
        return false;
    }
  };

  const distanceToLineSegment = (point: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    const A = point.x - p1.x;
    const B = point.y - p1.y;
    const C = p2.x - p1.x;
    const D = p2.y - p1.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = p1.x;
      yy = p1.y;
    } else if (param > 1) {
      xx = p2.x;
      yy = p2.y;
    } else {
      xx = p1.x + param * C;
      yy = p1.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e);
    
    if (selectedTool === 'select') {
      // Find clicked item
      const clickedItem = items.find(item => isPointInItem(coords, item));
      
      if (clickedItem) {
        setSelectedItem(clickedItem.id);
        setItems(prev => prev.map(item => ({
          ...item,
          selected: item.id === clickedItem.id
        })));
      } else {
        setSelectedItem(null);
        setItems(prev => prev.map(item => ({ ...item, selected: false })));
      }
      return;
    }

    // Create new item
    const newItem: DrillItem = {
      id: Date.now().toString(),
      type: selectedTool as DrillItem['type'],
      x: coords.x,
      y: coords.y,
      color: selectedTool === 'player' ? '#3B82F6' : selectedTool === 'cone' ? '#F59E0B' : '#10B981',
    };

    if (selectedTool === 'rectangle') {
      newItem.width = 8;
      newItem.height = 6;
    } else if (selectedTool === 'circle') {
      newItem.width = 4;
    } else if (selectedTool === 'text') {
      newItem.text = 'Text';
    }

    const newItems = [...items, newItem];
    setItems(newItems);
    addToHistory(newItems);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool !== 'select') return;
    
    const coords = getCanvasCoordinates(e);
    const clickedItem = items.find(item => isPointInItem(coords, item));
    
    if (clickedItem) {
      setIsDragging(true);
      setSelectedItem(clickedItem.id);
      setDragOffset({
        x: coords.x - clickedItem.x,
        y: coords.y - clickedItem.y
      });
      
      setItems(prev => prev.map(item => ({
        ...item,
        selected: item.id === clickedItem.id
      })));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedItem) return;
    
    const coords = getCanvasCoordinates(e);
    const newX = Math.max(2, Math.min(98, coords.x - dragOffset.x));
    const newY = Math.max(2, Math.min(98, coords.y - dragOffset.y));
    
    setItems(prev => prev.map(item => 
      item.id === selectedItem 
        ? { ...item, x: newX, y: newY }
        : item
    ));
  };

  const handleMouseUp = () => {
    if (isDragging) {
      addToHistory(items);
      setIsDragging(false);
    }
  };

  const deleteSelected = () => {
    if (selectedItem) {
      const newItems = items.filter(item => item.id !== selectedItem);
      setItems(newItems);
      addToHistory(newItems);
      setSelectedItem(null);
    }
  };

  const duplicateSelected = () => {
    if (selectedItem) {
      const itemToDuplicate = items.find(item => item.id === selectedItem);
      if (itemToDuplicate) {
        const newItem = {
          ...itemToDuplicate,
          id: Date.now().toString(),
          x: Math.min(95, itemToDuplicate.x + 5),
          y: Math.min(95, itemToDuplicate.y + 5),
          selected: false
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        addToHistory(newItems);
      }
    }
  };

  const clearCanvas = () => {
    setItems([]);
    addToHistory([]);
    setSelectedItem(null);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        name: drillName,
        description: drillDescription,
        items: items.map(item => ({ ...item, selected: false }))
      });
    }
    onClose();
  };

  const renderItem = (item: DrillItem) => {
    const style = {
      position: 'absolute' as const,
      left: `${item.x}%`,
      top: `${item.y}%`,
      transform: 'translate(-50%, -50%)',
      cursor: selectedTool === 'select' ? 'pointer' : 'default',
      border: item.selected ? '2px dashed #EF4444' : 'none',
      borderRadius: '4px',
      padding: '2px'
    };

    switch (item.type) {
      case 'player':
        return (
          <div key={item.id} style={style}>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: item.color }}
            >
              P
            </div>
          </div>
        );
      
      case 'cone':
        return (
          <div key={item.id} style={style}>
            <div 
              className="w-4 h-4 flex items-center justify-center"
              style={{ 
                backgroundColor: item.color,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}
            />
          </div>
        );
      
      case 'flag':
        return (
          <div key={item.id} style={style}>
            <div className="flex items-center">
              <div className="w-0.5 h-6 bg-gray-600"></div>
              <div 
                className="w-4 h-3 ml-0.5"
                style={{ backgroundColor: item.color }}
              ></div>
            </div>
          </div>
        );
      
      case 'ball':
        return (
          <div key={item.id} style={style}>
            <div 
              className="w-3 h-3 rounded-full border-2 border-black"
              style={{ backgroundColor: item.color || '#FFFFFF' }}
            />
          </div>
        );
      
      case 'rectangle':
        return (
          <div 
            key={item.id} 
            style={{
              ...style,
              width: `${item.width}%`,
              height: `${item.height}%`,
              backgroundColor: item.color,
              opacity: 0.7
            }}
          />
        );
      
      case 'circle':
        return (
          <div 
            key={item.id} 
            style={{
              ...style,
              width: `${item.width * 2}%`,
              height: `${item.width * 2}%`,
              backgroundColor: item.color,
              borderRadius: '50%',
              opacity: 0.7
            }}
          />
        );
      
      case 'text':
        return (
          <div key={item.id} style={style}>
            <span 
              className="text-sm font-medium px-1 py-0.5 bg-white rounded shadow"
              style={{ color: item.color }}
            >
              {item.text}
            </span>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Drill Designer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Drill Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drill Name
                </label>
                <input
                  type="text"
                  value={drillName}
                  onChange={(e) => setDrillName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter drill name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={drillDescription}
                  onChange={(e) => setDrillDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the drill..."
                />
              </div>

              {/* Tools */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tools</h4>
                <div className="grid grid-cols-3 gap-2">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedTool === tool.id
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                        title={tool.label}
                      >
                        <Icon className="w-5 h-5 mx-auto" />
                        <span className="text-xs mt-1 block">{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span>Undo</span>
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Redo2 className="w-4 h-4" />
                      <span>Redo</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={duplicateSelected}
                    disabled={!selectedItem}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  
                  <button
                    onClick={deleteSelected}
                    disabled={!selectedItem}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                  
                  <button
                    onClick={clearCanvas}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-6">
            <div className="h-full bg-green-400 rounded-lg relative overflow-hidden">
              {/* Field markings */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" strokeWidth="0.3" />
                <line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="0.2" />
                <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.2" />
                <rect x="2" y="25" width="18" height="50" fill="none" stroke="white" strokeWidth="0.2" />
                <rect x="80" y="25" width="18" height="50" fill="none" stroke="white" strokeWidth="0.2" />
                <rect x="2" y="40" width="8" height="20" fill="none" stroke="white" strokeWidth="0.2" />
                <rect x="90" y="40" width="8" height="20" fill="none" stroke="white" strokeWidth="0.2" />
              </svg>

              {/* Canvas interaction area */}
              <div
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ cursor: selectedTool === 'select' ? 'default' : 'crosshair' }}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {items.map(renderItem)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Drill
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrillDesigner;