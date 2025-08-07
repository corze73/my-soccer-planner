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
  const [pitchType, setPitchType] = useState<'full' | 'half' | 'blank'>('full');
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
    { id: 'animation', icon: Move, label: 'Animation' },
    { id: 'line', icon: Pen, label: 'Line' },
    { id: 'curve', icon: Pen, label: 'Curve' },
    { id: 'arrow', icon: Pen, label: 'Arrow' },
    { id: 'dashed-line', icon: Pen, label: 'Dashed Line' },
    { id: 'wavy-line', icon: Pen, label: 'Wavy Line' },
    { id: 'double-arrow', icon: Pen, label: 'Double Arrow' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'diamond', icon: Square, label: 'Diamond' },
    { id: 'ball', icon: Target, label: 'Ball' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'notes', icon: Type, label: 'Notes' },
    { id: 'effects', icon: Target, label: 'Effects' },
  ];

  const ballTypes = [
    { id: 'soccer-ball', label: 'Soccer Ball', color: '#000000' },
    { id: 'blue-ball', label: 'Blue Ball', color: '#3B82F6' },
    { id: 'red-ball', label: 'Red Ball', color: '#EF4444' },
  ];

  const equipmentItems = [
    { id: 'cone', label: 'Cone', color: '#F59E0B' },
    { id: 'pole', label: 'Pole', color: '#DC2626' },
    { id: 'flag', label: 'Flag', color: '#DC2626' },
    { id: 'blue-disc', label: 'Blue Disc', color: '#3B82F6' },
    { id: 'red-disc', label: 'Red Disc', color: '#EF4444' },
    { id: 'yellow-disc', label: 'Yellow Disc', color: '#EAB308' },
    { id: 'blue-hoop', label: 'Blue Hoop', color: '#3B82F6' },
    { id: 'red-hoop', label: 'Red Hoop', color: '#EF4444' },
    { id: 'yellow-hoop', label: 'Yellow Hoop', color: '#EAB308' },
    { id: 'small-goal', label: 'Small Goal', color: '#DC2626' },
    { id: 'mini-goal', label: 'Mini Goal', color: '#DC2626' },
    { id: 'player', label: 'Player', color: '#EAB308' },
  ];

  const goalTypes = [
    { id: 'full-goal', label: 'Full Goal', color: '#FFFFFF' },
    { id: 'goal-front', label: 'Goal Front View', color: '#FFFFFF' },
    { id: 'goal-3d', label: '3D Goal', color: '#FFFFFF' },
    { id: 'goal-side-left', label: 'Goal Side Left', color: '#FFFFFF' },
    { id: 'goal-side-right', label: 'Goal Side Right', color: '#FFFFFF' },
    { id: 'goal-back', label: 'Goal Back View', color: '#FFFFFF' },
  ];

  const pitchTypes = [
    { id: 'full', label: 'Full Pitch', description: 'Complete soccer field with grass texture' },
    { id: 'half', label: 'Half Pitch', description: 'Half field from center line to goal' },
    { id: 'blank', label: 'Blank Field', description: 'Plain grass field with texture' },
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
    e.preventDefault();
    e.stopPropagation();
    
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
      color: getItemColor(selectedTool),
    };

    if (selectedTool === 'rectangle' || selectedTool === 'diamond') {
      newItem.width = 8;
      newItem.height = 6;
    } else if (selectedTool === 'circle' || selectedTool.includes('hoop')) {
      newItem.width = 4;
    } else if (selectedTool === 'text') {
      newItem.text = 'Text';
    } else if (selectedTool === 'notes') {
      newItem.text = 'Notes';
    }

    const newItems = [...items, newItem];
    setItems(newItems);
    addToHistory(newItems);
  };

  const getItemColor = (toolType: string): string => {
    const colorMap: { [key: string]: string } = {
      'player': '#EAB308',
      'cone': '#F59E0B',
      'pole': '#DC2626',
      'flag': '#DC2626',
      'ball': '#000000',
      'blue-ball': '#3B82F6',
      'red-ball': '#EF4444',
      'blue-disc': '#3B82F6',
      'red-disc': '#EF4444',
      'yellow-disc': '#EAB308',
      'blue-hoop': '#3B82F6',
      'red-hoop': '#EF4444',
      'yellow-hoop': '#EAB308',
      'small-goal': '#DC2626',
      'mini-goal': '#DC2626',
      'full-goal': '#FFFFFF',
      'goal-front': '#FFFFFF',
      'goal-3d': '#FFFFFF',
      'line': '#000000',
      'arrow': '#000000',
      'curve': '#000000',
      'rectangle': '#3B82F6',
      'diamond': '#EAB308',
      'text': '#000000',
      'notes': '#6B7280',
    };
    return colorMap[toolType] || '#10B981';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    e.preventDefault();
    e.stopPropagation();
    
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

  const renderPitchMarkings = () => {
    switch (pitchType) {
      case 'full':
        return (
          <>
            {/* Grass texture stripes */}
            <div className="absolute inset-0 w-full h-full">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`absolute w-full h-[5%] ${
                    i % 2 === 0 ? 'bg-green-400' : 'bg-green-500'
                  }`}
                  style={{ top: `${i * 5}%` }}
                />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Field outline */}
              <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" strokeWidth="0.4" />
              {/* Center line */}
              <line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="0.3" />
              {/* Center circle */}
              <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3" />
              <circle cx="50" cy="50" r="0.5" fill="white" />
              {/* Penalty areas */}
              <rect x="2" y="25" width="18" height="50" fill="none" stroke="white" strokeWidth="0.3" />
              <rect x="80" y="25" width="18" height="50" fill="none" stroke="white" strokeWidth="0.3" />
              {/* Goal areas */}
              <rect x="2" y="40" width="8" height="20" fill="none" stroke="white" strokeWidth="0.3" />
              <rect x="90" y="40" width="8" height="20" fill="none" stroke="white" strokeWidth="0.3" />
              {/* Penalty spots */}
              <circle cx="12" cy="50" r="0.5" fill="white" />
              <circle cx="88" cy="50" r="0.5" fill="white" />
              {/* Penalty arcs */}
              <path d="M 15,40 A 8,8 0 0,1 15,60" fill="none" stroke="white" strokeWidth="0.3" />
              <path d="M 85,40 A 8,8 0 0,0 85,60" fill="none" stroke="white" strokeWidth="0.3" />
              {/* Goals with nets */}
              <rect x="0" y="45" width="2" height="10" fill="none" stroke="white" strokeWidth="0.3" />
              <rect x="98" y="45" width="2" height="10" fill="none" stroke="white" strokeWidth="0.3" />
              {/* Goal nets */}
              <defs>
                <pattern id="goalNet" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse">
                  <path d="M 0,0 L 1,1 M 1,0 L 0,1" stroke="white" strokeWidth="0.05" opacity="0.6"/>
                </pattern>
              </defs>
              <rect x="0" y="45" width="2" height="10" fill="url(#goalNet)" opacity="0.3" />
              <rect x="98" y="45" width="2" height="10" fill="url(#goalNet)" opacity="0.3" />
              {/* Corner arcs */}
              <path d="M 2,2 A 2,2 0 0,1 4,4" fill="none" stroke="white" strokeWidth="0.3" />
              <path d="M 98,2 A 2,2 0 0,0 96,4" fill="none" stroke="white" strokeWidth="0.3" />
              <path d="M 2,98 A 2,2 0 0,0 4,96" fill="none" stroke="white" strokeWidth="0.3" />
              <path d="M 98,98 A 2,2 0 0,1 96,96" fill="none" stroke="white" strokeWidth="0.3" />
            </svg>
          </>
        );
      
      case 'half':
        return (
          <>
            {/* Grass texture stripes */}
            <div className="absolute inset-0 w-full h-full">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`absolute w-full h-[5%] ${
                    i % 2 === 0 ? 'bg-green-400' : 'bg-green-500'
                  }`}
                  style={{ top: `${i * 5}%` }}
                />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Field outline - half pitch */}
              <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" strokeWidth="0.4" />
              {/* Center line (now at edge) */}
              <line x1="2" y1="2" x2="2" y2="98" stroke="white" strokeWidth="0.4" />
              {/* Center circle (half) */}
              <path d="M 2,42 A 8,8 0 0,1 2,58" fill="none" stroke="white" strokeWidth="0.3" />
              <circle cx="2" cy="50" r="0.5" fill="white" />
              {/* Penalty area */}
              <rect x="80" y="25" width="18" height="50" fill="none" stroke="white" strokeWidth="0.3" />
              {/* Goal area */}
              <rect x="90" y="40" width="8" height="20" fill="none" stroke="white" strokeWidth="0.3" />
              {/* Penalty spot */}
              <circle cx="88" cy="50" r="0.5" fill="white" />
              {/* Penalty arc */}
              <path d="M 85,40 A 8,8 0 0,0 85,60" fill="none" stroke="white" strokeWidth="0.3" />
              {/* Goal with net */}
              <rect x="98" y="45" width="2" height="10" fill="none" stroke="white" strokeWidth="0.3" />
              <rect x="98" y="45" width="2" height="10" fill="url(#goalNet)" opacity="0.3" />
              {/* Corner arcs */}
              <path d="M 98,2 A 2,2 0 0,0 96,4" fill="none" stroke="white" strokeWidth="0.3" />
              <path d="M 98,98 A 2,2 0 0,1 96,96" fill="none" stroke="white" strokeWidth="0.3" />
            </svg>
          </>
        );
      
      case 'blank':
        return (
          <div className="absolute inset-0 w-full h-full">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={`absolute w-full h-[5%] ${
                  i % 2 === 0 ? 'bg-green-400' : 'bg-green-500'
                }`}
                style={{ top: `${i * 5}%` }}
              />
            ))}
          </div>
        );
      
      default:
        return null;
    }
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
      case 'soccer-ball':
      case 'blue-ball':
      case 'red-ball':
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
              className="w-4 h-4 rounded-full border-2"
              style={{ 
                backgroundColor: item.type === 'soccer-ball' ? '#FFFFFF' : item.color,
                borderColor: item.type === 'soccer-ball' ? '#000000' : item.color
              }}
            />
          </div>
        );
      
      case 'pole':
        return (
          <div key={item.id} style={style}>
            <div className="flex flex-col items-center">
              <div className="w-1 h-8 bg-gray-600"></div>
              <div className="w-3 h-1 bg-gray-800"></div>
            </div>
          </div>
        );

      case 'blue-disc':
      case 'red-disc':
      case 'yellow-disc':
        return (
          <div key={item.id} style={style}>
            <div 
              className="w-5 h-2 rounded-full"
              style={{ 
                backgroundColor: item.color,
                transform: 'perspective(20px) rotateX(60deg)'
              }}
            />
          </div>
        );

      case 'blue-hoop':
      case 'red-hoop':
      case 'yellow-hoop':
        return (
          <div key={item.id} style={style}>
            <div 
              className="w-6 h-6 rounded-full border-2"
              style={{ 
                borderColor: item.color,
                backgroundColor: 'transparent'
              }}
            />
          </div>
        );

      case 'full-goal':
        return (
          <div key={item.id} style={style}>
            <div className="relative">
              <div className="w-16 h-8 border-2 border-white bg-transparent">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-10"></div>
                {/* Goal net pattern */}
                <svg className="w-full h-full" viewBox="0 0 16 8">
                  <defs>
                    <pattern id="net" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
                      <path d="M 0,0 L 2,2 M 2,0 L 0,2" stroke="white" strokeWidth="0.1" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="16" height="8" fill="url(#net)"/>
                </svg>
              </div>
            </div>
          </div>
        );

      case 'small-goal':
      case 'mini-goal':
        return (
          <div key={item.id} style={style}>
            <div className="flex flex-col items-center">
              <div 
                className="w-8 h-4 border-2 border-red-500"
                style={{ 
                  borderBottom: 'none'
                }}
              />
              <div className="w-8 h-0.5 bg-red-500"></div>
            </div>
          </div>
        );

      case 'goal-side-left':
      case 'goal-side-right':
        return (
          <div key={item.id} style={style}>
            <div className="relative">
              <div 
                className={`w-8 h-8 border-2 border-white bg-transparent ${
                  item.type === 'goal-side-left' ? 'transform -skew-y-12' : 'transform skew-y-12'
                }`}
              >
                <svg className="w-full h-full" viewBox="0 0 8 8">
                  <defs>
                    <pattern id="sideNet" x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse">
                      <path d="M 0,0 L 1,1 M 1,0 L 0,1" stroke="white" strokeWidth="0.05" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="8" height="8" fill="url(#sideNet)"/>
                </svg>
              </div>
            </div>
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

      case 'diamond':
        return (
          <div 
            key={item.id} 
            style={{
              ...style,
              width: `${item.width}%`,
              height: `${item.height}%`,
              backgroundColor: item.color,
              opacity: 0.7,
              transform: 'translate(-50%, -50%) rotate(45deg)'
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
              className="text-xs font-bold"
              style={{ color: item.color }}
            >
              {item.text}
            </span>
          </div>
        );
      
      case 'notes':
        return (
          <div key={item.id} style={style}>
            <div className="bg-yellow-100 border border-yellow-300 rounded p-2 shadow-sm max-w-32">
              <span 
                className="text-xs"
                style={{ color: item.color }}
              >
                {item.text}
              </span>
            </div>
          </div>
        );

      case 'goal-front':
      case 'goal-3d':
      case 'goal-back':
        return (
          <div key={item.id} style={style}>
            <div className="w-6 h-3 border-2 border-white bg-gray-100" />
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

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Pitch Type</h4>
                <div className="space-y-2">
                  {pitchTypes.map((pitch) => (
                    <button
                      key={pitch.id}
                      onClick={() => setPitchType(pitch.id as any)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                        pitchType === pitch.id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{pitch.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{pitch.description}</div>
                    </button>
                  ))}
                </div>
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

              {/* Balls */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Balls</h4>
                <div className="grid grid-cols-3 gap-2">
                  {ballTypes.map((ball) => (
                    <button
                      key={ball.id}
                      onClick={() => setSelectedTool(ball.id)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedTool === ball.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={ball.label}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border-2 mx-auto"
                        style={{ 
                          backgroundColor: ball.id === 'soccer-ball' ? '#FFFFFF' : ball.color,
                          borderColor: ball.id === 'soccer-ball' ? '#000000' : ball.color
                        }}
                      />
                      <span className="text-xs mt-1 block">{ball.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Equipment</h4>
                <div className="grid grid-cols-3 gap-2">
                  {equipmentItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedTool(item.id)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedTool === item.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={item.label}
                    >
                      {item.id === 'cone' && (
                        <div 
                          className="w-4 h-5 mx-auto"
                          style={{ 
                            backgroundColor: item.color,
                            clipPath: 'polygon(50% 0%, 20% 100%, 80% 100%)'
                          }}
                        />
                      )}
                      {item.id === 'flag' && (
                        <div className="flex items-center justify-center">
                          <div className="w-0.5 h-4 bg-gray-600"></div>
                          <div 
                            className="w-3 h-2 ml-0.5"
                            style={{ backgroundColor: item.color }}
                          ></div>
                        </div>
                      )}
                      {item.id === 'pole' && (
                        <div className="flex flex-col items-center">
                          <div className="w-1 h-5 bg-gray-600"></div>
                          <div className="w-2 h-0.5 bg-gray-800"></div>
                        </div>
                      )}
                      {item.id.includes('disc') && (
                        <div 
                          className="w-4 h-1.5 rounded-full mx-auto"
                          style={{ 
                            backgroundColor: item.color,
                            transform: 'perspective(10px) rotateX(60deg)'
                          }}
                        />
                      )}
                      {item.id.includes('hoop') && (
                        <div 
                          className="w-5 h-5 rounded-full border-2 mx-auto"
                          style={{ 
                            borderColor: item.color,
                            backgroundColor: 'transparent'
                          }}
                        />
                      )}
                      {item.id.includes('goal') && !item.id.includes('full') && (
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-6 h-3 border-2 border-red-500"
                            style={{ borderBottom: 'none' }}
                          />
                          <div className="w-6 h-0.5 bg-red-500"></div>
                        </div>
                      )}
                      {item.id === 'player' && (
                        <div 
                          className="w-5 h-6 mx-auto rounded-t-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="text-xs mt-1 block">{item.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Goals</h4>
                <div className="grid grid-cols-2 gap-2">
                  {goalTypes.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedTool(goal.id)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedTool === goal.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={goal.label}
                    >
                      {goal.id === 'full-goal' && (
                        <div className="w-8 h-4 border-2 border-white bg-gray-100 mx-auto relative">
                          <div className="absolute inset-0 opacity-30">
                            <div className="w-full h-full grid grid-cols-4 grid-rows-2 gap-px">
                              {Array.from({length: 8}).map((_, i) => (
                                <div key={i} className="border border-white"></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {goal.id.includes('side') && (
                        <div 
                          className={`w-4 h-4 border-2 border-white bg-gray-100 mx-auto ${
                            goal.id.includes('left') ? 'transform -skew-y-12' : 'transform skew-y-12'
                          }`}
                        />
                      )}
                      {(goal.id === 'goal-front' || goal.id === 'goal-3d' || goal.id === 'goal-back') && (
                        <div className="w-6 h-3 border-2 border-white bg-gray-100 mx-auto" />
                      )}
                      <span className="text-xs mt-1 block text-center">{goal.label.replace('Goal ', '').replace(' View', '')}</span>
                    </button>
                  ))}
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
            <div className="h-full rounded-lg relative overflow-hidden border-2 border-gray-300">
              {/* Dynamic field markings based on pitch type */}
              {renderPitchMarkings()}

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
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">
                <strong>Current Pitch:</strong> {pitchTypes.find(p => p.id === pitchType)?.label}
              </p>
              <p>Select a tool and click on the field to place items. Use the select tool to move items around.</p>
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