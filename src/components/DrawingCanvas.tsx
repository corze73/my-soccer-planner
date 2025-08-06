import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Pen, Square, Circle, ArrowRight, Trash2, Undo, Redo, Move, Type, 
  MousePointer, Zap, Minus, MoreHorizontal, Triangle, Diamond,
  Layers, Eye, EyeOff, RotateCcw, Copy, Scissors, Clipboard,
  ZoomIn, ZoomOut, Grid, Lock, Unlock, Palette
} from 'lucide-react';

interface DrawingElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'player' | 'ball' | 'cone' | 'freehand' | 'curve' | 'zigzag' | 'dashed-line' | 'dotted-line' | 'triangle' | 'diamond' | 'goal' | 'flag';
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
  points?: { x: number; y: number }[];
  dashArray?: number[];
  locked?: boolean;
  visible?: boolean;
  opacity?: number;
  rotation?: number;
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
  const [currentTool, setCurrentTool] = useState<string>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [playerSize, setPlayerSize] = useState(15);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [clipboard, setClipboard] = useState<DrawingElement | null>(null);

  // Professional color palette
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#800000',
    '#000080', '#808080', '#C0C0C0', '#FFB6C1'
  ];

  // Line styles
  const lineStyles = [
    { name: 'solid', dashArray: [] },
    { name: 'dashed', dashArray: [10, 5] },
    { name: 'dotted', dashArray: [2, 3] },
    { name: 'dash-dot', dashArray: [10, 5, 2, 5] }
  ];

  const addToHistory = useCallback((newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const drawField = useCallback((ctx: CanvasRenderingContext2D) => {
    // Save context
    ctx.save();
    
    // Apply zoom
    ctx.scale(zoom, zoom);
    
    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 0.5;
      const gridSize = 20;
      
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    if (pitchType === 'unmarked') {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
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

        ctx.strokeRect(20, penaltyY, penaltyWidth, penaltyHeight);
        ctx.strokeRect(width - 20 - penaltyWidth, penaltyY, penaltyWidth, penaltyHeight);

        // Goal areas
        const goalWidth = 60;
        const goalHeight = 120;
        const goalY = (height - goalHeight) / 2;

        ctx.strokeRect(20, goalY, goalWidth, goalHeight);
        ctx.strokeRect(width - 20 - goalWidth, goalY, goalWidth, goalHeight);

        // Goals
        ctx.strokeRect(0, goalY + 30, 20, 60);
        ctx.strokeRect(width - 20, goalY + 30, 20, 60);
      } else if (pitchType === 'half') {
        // Half pitch implementation
        ctx.strokeRect(20, 20, width - 40, height - 40);
        
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(20, height - 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width - 20, 20);
        ctx.lineTo(width - 20, height - 20);
        ctx.stroke();

        const penaltyWidth = 120;
        const penaltyHeight = 200;
        const penaltyY = (height - penaltyHeight) / 2;
        ctx.strokeRect(20, penaltyY, penaltyWidth, penaltyHeight);

        const goalWidth = 60;
        const goalHeight = 120;
        const goalY = (height - goalHeight) / 2;
        ctx.strokeRect(20, goalY, goalWidth, goalHeight);

        ctx.strokeRect(0, goalY + 30, 20, 60);

        ctx.beginPath();
        ctx.arc(width - 20, height / 2, 60, Math.PI / 2, 3 * Math.PI / 2);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }, [pitchType, width, height, showGrid, zoom]);

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    if (!element.visible) return;
    
    ctx.save();
    ctx.globalAlpha = element.opacity || 1;
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = element.strokeWidth;

    // Apply dash pattern if specified
    if (element.dashArray && element.dashArray.length > 0) {
      ctx.setLineDash(element.dashArray);
    }

    switch (element.type) {
      case 'freehand':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY);
        ctx.lineTo(element.endX!, element.endY!);
        ctx.stroke();
        break;

      case 'dashed-line':
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY);
        ctx.lineTo(element.endX!, element.endY!);
        ctx.stroke();
        ctx.setLineDash([]);
        break;

      case 'dotted-line':
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY);
        ctx.lineTo(element.endX!, element.endY!);
        ctx.stroke();
        ctx.setLineDash([]);
        break;

      case 'curve':
        if (element.points && element.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length - 1; i++) {
            const cp1x = element.points[i].x;
            const cp1y = element.points[i].y;
            const cp2x = element.points[i + 1].x;
            const cp2y = element.points[i + 1].y;
            ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y);
          }
          ctx.stroke();
        }
        break;

      case 'zigzag':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'rectangle':
        ctx.strokeRect(element.startX, element.startY, element.width!, element.height!);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(element.startX, element.startY, element.radius!, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'triangle':
        const size = element.size || 30;
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY - size);
        ctx.lineTo(element.startX - size, element.startY + size);
        ctx.lineTo(element.startX + size, element.startY + size);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'diamond':
        const diamondSize = element.size || 20;
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY - diamondSize);
        ctx.lineTo(element.startX + diamondSize, element.startY);
        ctx.lineTo(element.startX, element.startY + diamondSize);
        ctx.lineTo(element.startX - diamondSize, element.startY);
        ctx.closePath();
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
        const playerSize = element.size || 15;
        ctx.beginPath();
        ctx.arc(element.startX, element.startY, playerSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(10, playerSize * 0.8)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(element.text || '1', element.startX, element.startY + 4);
        break;

      case 'ball':
        const ballSize = 8;
        ctx.beginPath();
        ctx.arc(element.startX, element.startY, ballSize, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY - ballSize + 2);
        ctx.lineTo(element.startX, element.startY + ballSize - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(element.startX - ballSize + 2, element.startY);
        ctx.lineTo(element.startX + ballSize - 2, element.startY);
        ctx.stroke();
        break;

      case 'cone':
        const coneSize = element.size || 12;
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY - coneSize);
        ctx.lineTo(element.startX - coneSize/2, element.startY + coneSize/2);
        ctx.lineTo(element.startX + coneSize/2, element.startY + coneSize/2);
        ctx.closePath();
        ctx.fillStyle = '#FFA500';
        ctx.fill();
        ctx.strokeStyle = '#FF4500';
        ctx.stroke();
        break;

      case 'goal':
        const goalWidth = element.width || 60;
        const goalHeight = element.height || 20;
        ctx.strokeRect(element.startX, element.startY, goalWidth, goalHeight);
        // Goal net pattern
        ctx.strokeStyle = element.color;
        ctx.lineWidth = 1;
        for (let i = 10; i < goalWidth; i += 10) {
          ctx.beginPath();
          ctx.moveTo(element.startX + i, element.startY);
          ctx.lineTo(element.startX + i, element.startY + goalHeight);
          ctx.stroke();
        }
        break;

      case 'flag':
        const flagHeight = element.size || 30;
        // Flag pole
        ctx.beginPath();
        ctx.moveTo(element.startX, element.startY);
        ctx.lineTo(element.startX, element.startY - flagHeight);
        ctx.stroke();
        // Flag
        ctx.fillStyle = element.color;
        ctx.fillRect(element.startX, element.startY - flagHeight, 20, 12);
        break;

      case 'text':
        ctx.fillStyle = element.color;
        ctx.font = `${element.size || 16}px Arial`;
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

    ctx.restore();
  }, [selectedElement]);

  const getElementBounds = (element: DrawingElement) => {
    switch (element.type) {
      case 'line':
      case 'arrow':
      case 'dashed-line':
      case 'dotted-line':
        return {
          x: Math.min(element.startX, element.endX!),
          y: Math.min(element.startY, element.endY!),
          width: Math.abs(element.endX! - element.startX),
          height: Math.abs(element.endY! - element.startY)
        };
      case 'rectangle':
      case 'goal':
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
      case 'cone':
      case 'triangle':
      case 'diamond':
      case 'flag':
        const size = element.size || 15;
        return {
          x: element.startX - size,
          y: element.startY - size,
          width: size * 2,
          height: size * 2
        };
      case 'ball':
        return {
          x: element.startX - 8,
          y: element.startY - 8,
          width: 16,
          height: 16
        };
      case 'freehand':
      case 'curve':
      case 'zigzag':
        if (element.points && element.points.length > 0) {
          const xs = element.points.map(p => p.x);
          const ys = element.points.map(p => p.y);
          return {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
          };
        }
        return { x: 0, y: 0, width: 0, height: 0 };
      case 'text':
        return {
          x: element.startX,
          y: element.startY - (element.size || 16),
          width: 100,
          height: element.size || 16
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
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (currentTool === 'freehand') {
      setCurrentPath([pos]);
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'text',
          startX: pos.x,
          startY: pos.y,
          text,
          color: currentColor,
          strokeWidth,
          size: strokeWidth * 8,
          visible: true,
          opacity
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        addToHistory(newElements);
      }
      setIsDrawing(false);
    } else if (['player', 'ball', 'cone', 'triangle', 'diamond', 'flag'].includes(currentTool)) {
      let elementText = '1';
      if (currentTool === 'player') {
        const existingPlayers = elements.filter(el => el.type === 'player');
        if (existingPlayers.length > 0) {
          const maxNumber = Math.max(...existingPlayers.map(p => parseInt(p.text || '1')));
          elementText = (maxNumber + 1).toString();
        }
      }
      
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: currentTool as any,
        startX: pos.x,
        startY: pos.y,
        text: currentTool === 'player' ? elementText : undefined,
        color: currentColor,
        strokeWidth,
        size: currentTool === 'player' ? playerSize : undefined,
        visible: true,
        opacity
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

    if (currentTool === 'freehand') {
      setCurrentPath(prev => [...prev, pos]);
      
      // Draw preview
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      redraw();
      
      // Draw current path
      if (currentPath.length > 1) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redraw();

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = strokeWidth;

    switch (currentTool) {
      case 'pen':
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;

      case 'dashed-line':
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.setLineDash([]);
        break;

      case 'dotted-line':
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.setLineDash([]);
        break;

      case 'rectangle':
        const rectWidth = pos.x - startPos.x;
        const rectHeight = pos.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, rectWidth, rectHeight);
        break;

      case 'circle':
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'arrow':
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

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

    if (currentTool === 'freehand') {
      if (currentPath.length > 1) {
        newElement = {
          id: Date.now().toString(),
          type: 'freehand',
          startX: currentPath[0].x,
          startY: currentPath[0].y,
          points: [...currentPath, pos],
          color: currentColor,
          strokeWidth,
          visible: true,
          opacity
        };
      }
      setCurrentPath([]);
    } else {
      switch (currentTool) {
        case 'pen':
        case 'line':
          newElement = {
            id: Date.now().toString(),
            type: 'line',
            startX: startPos.x,
            startY: startPos.y,
            endX: pos.x,
            endY: pos.y,
            color: currentColor,
            strokeWidth,
            visible: true,
            opacity
          };
          break;

        case 'dashed-line':
          newElement = {
            id: Date.now().toString(),
            type: 'dashed-line',
            startX: startPos.x,
            startY: startPos.y,
            endX: pos.x,
            endY: pos.y,
            color: currentColor,
            strokeWidth,
            dashArray: [10, 5],
            visible: true,
            opacity
          };
          break;

        case 'dotted-line':
          newElement = {
            id: Date.now().toString(),
            type: 'dotted-line',
            startX: startPos.x,
            startY: startPos.y,
            endX: pos.x,
            endY: pos.y,
            color: currentColor,
            strokeWidth,
            dashArray: [2, 3],
            visible: true,
            opacity
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
            strokeWidth,
            visible: true,
            opacity
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
            strokeWidth,
            visible: true,
            opacity
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
            strokeWidth,
            visible: true,
            opacity
          };
          break;
      }
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

  const copyElement = () => {
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        setClipboard(element);
      }
    }
  };

  const pasteElement = () => {
    if (clipboard) {
      const newElement = {
        ...clipboard,
        id: Date.now().toString(),
        startX: clipboard.startX + 20,
        startY: clipboard.startY + 20
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
    }
  };

  const deleteSelected = () => {
    if (selectedElement) {
      const newElements = elements.filter(el => el.id !== selectedElement);
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    onSave?.(elements);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));

  return (
    <div className="space-y-4">
      {/* Professional Toolbar */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentTool('select')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'select' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Select Tool"
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('freehand')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'freehand' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Freehand Drawing"
            >
              <Pen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('pen')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'pen' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Line Tool"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Line Styles */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentTool('line')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'line' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Solid Line"
            >
              <div className="w-4 h-0.5 bg-current"></div>
            </button>
            <button
              onClick={() => setCurrentTool('dashed-line')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'dashed-line' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Dashed Line"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('dotted-line')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'dotted-line' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Dotted Line"
            >
              <div className="flex space-x-0.5">
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
              </div>
            </button>
          </div>

          {/* Arrows */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentTool('arrow')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'arrow' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Arrow"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Shapes */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentTool('rectangle')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'rectangle' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('circle')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'circle' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('triangle')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'triangle' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Triangle"
            >
              <Triangle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTool('diamond')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'diamond' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Diamond"
            >
              <Diamond className="w-4 h-4" />
            </button>
          </div>

          {/* Sports Objects */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentTool('player')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'player' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Player"
            >
              <div className="w-4 h-4 rounded-full bg-current"></div>
            </button>
            <button
              onClick={() => setCurrentTool('ball')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'ball' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Football"
            >
              <div className="w-4 h-4 rounded-full bg-white border border-current flex items-center justify-center">
                <div className="w-1 h-3 bg-current"></div>
                <div className="w-3 h-1 bg-current absolute"></div>
              </div>
            </button>
            <button
              onClick={() => setCurrentTool('cone')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'cone' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Cone"
            >
              <Triangle className="w-4 h-4 text-orange-400" />
            </button>
            <button
              onClick={() => setCurrentTool('flag')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'flag' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Flag"
            >
              <div className="w-4 h-4 relative">
                <div className="w-0.5 h-4 bg-current absolute left-0"></div>
                <div className="w-3 h-2 bg-current absolute left-0.5 top-0"></div>
              </div>
            </button>
          </div>

          {/* Text */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentTool('text')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'text' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Text"
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={copyElement}
              disabled={!selectedElement}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={pasteElement}
              disabled={!clipboard}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Paste"
            >
              <Clipboard className="w-4 h-4" />
            </button>
            <button
              onClick={deleteSelected}
              disabled={!selectedElement}
              className="p-2 rounded-lg text-gray-300 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
              }`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-gray-300 text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={zoomIn}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onSave && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Save Diagram
            </button>
          )}
        </div>

        {/* Secondary Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-600">
          {/* Color Palette */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Color:</span>
            <div className="flex space-x-1">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    currentColor === color ? 'border-white scale-110 shadow-md' : 'border-gray-500 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Width:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-gray-300 text-sm w-8">{strokeWidth}px</span>
          </div>

          {/* Player Size */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Player Size:</span>
            <input
              type="range"
              min="8"
              max="30"
              value={playerSize}
              onChange={(e) => setPlayerSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-gray-300 text-sm w-8">{playerSize}px</span>
          </div>

          {/* Opacity */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-gray-300 text-sm w-8">{Math.round(opacity * 100)}%</span>
          </div>
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