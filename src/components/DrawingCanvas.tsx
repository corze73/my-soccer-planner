import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pen, Square, Circle, ArrowRight, Trash2, Undo, Redo, Move, Type } from 'lucide-react';

interface DrawingElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'player' | 'ball';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  size?: number;
}

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onSave?: (elements: DrawingElement[]) => void;
  initialElements?: DrawingElement[];
  pitchType?: 'full' | 'half' | 'unmarked';
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 800,
  height = 600,
  onSave,
  initialElements = [],
  pitchType = 'full'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DrawingElement[]>(initialElements);
  const [history, setHistory] = useState<DrawingElement[][]>([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentTool, setCurrentTool] = useState<'pen' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'player' | 'ball' | 'move'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [playerSize, setPlayerSize] = useState(15);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  const addToHistory = useCallback((newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const drawField = useCallback((ctx: CanvasRenderingContext2D) => {
    if (pitchType === 'unmarked') {
      // Just green background
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    if (pitchType === 'full' || pitchType === 'half') {
      // Field background
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 0, width, height);

      // Field markings
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;

      if (pitchType === 'full') {
        // Full pitch markings
        // Outer boundary
        ctx.strokeRect(20, 20, width - 40, height - 40);

        // Center line
        ctx.beginPath();
        ctx.moveTo(width / 2, 20);
        ctx.lineTo(width / 2, height - 20);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 60, 0, 2 * Math.PI);
        ctx.stroke();

        // Penalty areas
        const penaltyWidth = 120;
        const penaltyHeight = 200;
        const penaltyY = (height - penaltyHeight) / 2;

        // Left penalty area
        ctx.strokeRect(20, penaltyY, penaltyWidth, penaltyHeight);
        // Right penalty area
        ctx.strokeRect(width - 20 - penaltyWidth, penaltyY, penaltyWidth, penaltyHeight);

        // Goal areas
        const goalWidth = 60;
        const goalHeight = 120;
        const goalY = (height - goalHeight) / 2;

        // Left goal area
        ctx.strokeRect(20, goalY, goalWidth, goalHeight);
        // Right goal area
        ctx.strokeRect(width - 20 - goalWidth, goalY, goalWidth, goalHeight);

        // Goals
        ctx.strokeRect(0, goalY + 30, 20, 60);
        ctx.strokeRect(width - 20, goalY + 30, 20, 60);
      } else if (pitchType === 'half') {
        // Half pitch markings
        // Outer boundary (half field)
        ctx.strokeRect(20, 20, width - 40, height - 40);

        // Goal line (left side)
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(20, height - 20);
        ctx.stroke();

        // Center line (right side)
        ctx.beginPath();
        ctx.moveTo(width - 20, 20);
        ctx.lineTo(width - 20, height - 20);
        ctx.stroke();

        // Penalty area
        const penaltyWidth = 120;
        const penaltyHeight = 200;
        const penaltyY = (height - penaltyHeight) / 2;
        ctx.strokeRect(20, penaltyY, penaltyWidth, penaltyHeight);

        // Goal area
        const goalWidth = 60;
        const goalHeight = 120;
        const goalY = (height - goalHeight) / 2;
        ctx.strokeRect(20, goalY, goalWidth, goalHeight);

        // Goal
        ctx.strokeRect(0, goalY + 30, 20, 60);

        // Center circle (partial)
        ctx.beginPath();
        ctx.arc(width - 20, height / 2, 60, Math.PI / 2, 3 * Math.PI / 2);
        ctx.stroke();
      }
    }
  }, [pitchType, width, height]);

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = element.strokeWidth;

    switch (element.type) {
      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY);
        ctx.lineTo(element.endX!, element.endY!);
        ctx.stroke();
        break;

      case 'rectangle':
        ctx.strokeRect(element.startX, element.startY, element.width!, element.height!);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(element.startX, element.startY, element.radius!, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'arrow':
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY);
        ctx.lineTo(element.endX!, element.endY!);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(element.endY! - element.startY, element.endX! - element.startX);
        const headLength = 15;
        ctx.beginPath();
        ctx.moveTo(element.endX!, element.endY!);
        ctx.lineTo(
          element.endX! - headLength * Math.cos(angle - Math.PI / 6),
          element.endY! - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(element.endX!, element.endY!);
        ctx.lineTo(
          element.endX! - headLength * Math.cos(angle + Math.PI / 6),
          element.endY! - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;

      case 'player':
        const size = element.size || 15;
        // Draw player as a circle with number
        ctx.beginPath();
        ctx.arc(element.startX, element.startY, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw number
        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(10, size * 0.8)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(element.text || '1', element.startX, element.startY + 4);
        break;

      case 'ball':
        // Draw football
        const ballSize = 8;
        ctx.beginPath();
        ctx.arc(element.startX, element.startY, ballSize, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw football pattern
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY - ballSize + 2);
        ctx.lineTo(element.startX, element.startY + ballSize - 2);
        ctx.stroke();
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(element.startX - ballSize + 2, element.startY);
        ctx.lineTo(element.startX + ballSize - 2, element.startY);
        ctx.stroke();
        break;

      case 'text':
        ctx.fillStyle = element.color;
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(element.text || '', element.startX, element.startY);
        break;
    }

    // Draw selection indicator
    if (selectedElement === element.id) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      const bounds = getElementBounds(element);
      ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
      ctx.setLineDash([]);
    }
  }, [selectedElement]);

  const getElementBounds = (element: DrawingElement) => {
    switch (element.type) {
      case 'line':
      case 'arrow':
        return {
          x: Math.min(element.startX, element.endX!),
          y: Math.min(element.startY, element.endY!),
          width: Math.abs(element.endX! - element.startX),
          height: Math.abs(element.endY! - element.startY)
        };
      case 'rectangle':
        return {
          x: element.startX,
          y: element.startY,
          width: element.width!,
          height: element.height!
        };
      case 'circle':
        return {
          x: element.startX - element.radius!,
          y: element.startY - element.radius!,
          width: element.radius! * 2,
          height: element.radius! * 2
        };
      case 'player':
        return {
          x: element.startX - (element.size || 15),
          y: element.startY - (element.size || 15),
          width: (element.size || 15) * 2,
          height: (element.size || 15) * 2
        };
      case 'ball':
        return {
          x: element.startX - 8,
          y: element.startY - 8,
          width: 16,
          height: 16
        };
      case 'text':
        return {
          x: element.startX,
          y: element.startY - 16,
          width: 100, // Approximate
          height: 20
        };
      default:
        return { x: 0, y: 0, width: 0, height: 0 };
    }
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    drawField(ctx);
    elements.forEach(element => drawElement(ctx, element));
  }, [elements, drawField, drawElement, width, height]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'text',
          startX: pos.x,
          startY: pos.y,
          text,
          color: currentColor,
          strokeWidth
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        addToHistory(newElements);
      }
      setIsDrawing(false);
    } else if (currentTool === 'player') {
      let playerNumber = 1;
      // Find the highest existing player number and increment
      const existingPlayers = elements.filter(el => el.type === 'player');
      if (existingPlayers.length > 0) {
        const maxNumber = Math.max(...existingPlayers.map(p => parseInt(p.text || '1')));
        playerNumber = maxNumber + 1;
      }
      
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'player',
        startX: pos.x,
        startY: pos.y,
        text: playerNumber.toString(),
        color: currentColor,
        strokeWidth,
        size: playerSize
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setIsDrawing(false);
    } else if (currentTool === 'ball') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'ball',
        startX: pos.x,
        startY: pos.y,
        color: currentColor,
        strokeWidth
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw everything
    redraw();

    // Draw preview
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = strokeWidth;

    switch (currentTool) {
      case 'pen':
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;

      case 'rectangle':
        const width = pos.x - startPos.x;
        const height = pos.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
        break;

      case 'circle':
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'arrow':
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(pos.y - startPos.y, pos.x - startPos.x);
        const headLength = 15;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(
          pos.x - headLength * Math.cos(angle - Math.PI / 6),
          pos.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(
          pos.x - headLength * Math.cos(angle + Math.PI / 6),
          pos.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    let newElement: DrawingElement | null = null;

    switch (currentTool) {
      case 'pen':
        newElement = {
          id: Date.now().toString(),
          type: 'line',
          startX: startPos.x,
          startY: startPos.y,
          endX: pos.x,
          endY: pos.y,
          color: currentColor,
          strokeWidth
        };
        break;

      case 'rectangle':
        newElement = {
          id: Date.now().toString(),
          type: 'rectangle',
          startX: startPos.x,
          startY: startPos.y,
          width: pos.x - startPos.x,
          height: pos.y - startPos.y,
          color: currentColor,
          strokeWidth
        };
        break;

      case 'circle':
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        newElement = {
          id: Date.now().toString(),
          type: 'circle',
          startX: startPos.x,
          startY: startPos.y,
          radius,
          color: currentColor,
          strokeWidth
        };
        break;

      case 'arrow':
        newElement = {
          id: Date.now().toString(),
          type: 'arrow',
          startX: startPos.x,
          startY: startPos.y,
          endX: pos.x,
          endY: pos.y,
          color: currentColor,
          strokeWidth
        };
        break;
    }

    if (newElement) {
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
    }

    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setElements([]);
    addToHistory([]);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  const handleSave = () => {
    onSave?.(elements);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-700 mr-2">Tools:</span>
            <button
              onClick={() => setCurrentTool('pen')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'pen' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
              title="Pen Tool"
            >
              <Pen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('rectangle')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'rectangle' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
              title="Rectangle Tool"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('circle')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'circle' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
              title="Circle Tool"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('arrow')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'arrow' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
              title="Arrow Tool"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('player')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'player' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
              title="Player Tool"
            >
              <div className="w-4 h-4 rounded-full bg-current"></div>
            </button>
            <button
              onClick={() => setCurrentTool('text')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'text' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
              title="Text Tool"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('ball')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'ball' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
              title="Football Tool"
            >
              <div className="w-4 h-4 rounded-full bg-white border border-current flex items-center justify-center">
                <div className="w-1 h-3 bg-current"></div>
                <div className="w-3 h-1 bg-current absolute"></div>
              </div>
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center space-x-1 border-l border-gray-300 pl-4">
            <span className="text-sm font-medium text-gray-700 mr-2">Colors:</span>
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  currentColor === color ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <span className="text-sm text-gray-600">Width:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{strokeWidth}px</span>
          </div>

          {/* Player Size Control */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <span className="text-sm text-gray-600">Player Size:</span>
            <input
              type="range"
              min="8"
              max="25"
              value={playerSize}
              onChange={(e) => setPlayerSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{playerSize}px</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 border-l border-gray-300 pl-4">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 transition-colors"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 transition-colors"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {onSave && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Save Diagram
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="border-2 border-gray-300 rounded-lg cursor-crosshair shadow-inner"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;