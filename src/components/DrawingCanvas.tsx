import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Stage, Layer, Circle, Arrow, Group } from 'react-konva';

type Kind = 'player' | 'cone' | 'ball' | 'arrow';
type ItemBase = { id: string; kind: Exclude<Kind, 'arrow'>; x: number; y: number };
type ArrowItem = { id: string; kind: 'arrow'; x: number; y: number; x2: number; y2: number };
type Item = ItemBase | ArrowItem;

export type DrawingCanvasHandle = {
  addItem: (kind: Exclude<Kind, 'arrow'>) => void;
  startArrowMode: () => void;
  undo: () => void;
  clear: () => void;
};

// Inline FA pitch SVG (105 x 68 viewBox)
function PitchSVG({ className }: { className?: string }) {
  const line = '#ffffff';
  const grass = '#2e7d32';
  return (
    <svg
      viewBox="0 0 105 68"
      preserveAspectRatio="xMidYMid meet"
      className={className ?? 'w-full h-full'}
      role="img"
      aria-label="Football pitch"
    >
      <rect x="0" y="0" width="105" height="68" fill={grass} />
      <rect x="1" y="1" width="103" height="66" fill="none" stroke={line} strokeWidth="0.6" />
      <line x1="52.5" y1="1" x2="52.5" y2="67" stroke={line} strokeWidth="0.4" />
      <circle cx="52.5" cy="34" r="9.15" fill="none" stroke={line} strokeWidth="0.4" />
      <circle cx="52.5" cy="34" r="0.35" fill={line} />
      <rect x="1" y={34 - 20.16/2} width="16.5" height="20.16" fill="none" stroke={line} strokeWidth="0.4" />
      <rect x={105 - 1 - 16.5} y={34 - 20.16/2} width="16.5" height="20.16" fill="none" stroke={line} strokeWidth="0.4" />
      <rect x="1" y={34 - 7.32/2} width="5.5" height="7.32" fill="none" stroke={line} strokeWidth="0.4" />
      <rect x={105 - 1 - 5.5} y={34 - 7.32/2} width="5.5" height="7.32" fill="none" stroke={line} strokeWidth="0.4" />
      <circle cx={1 + 11} cy="34" r="0.35" fill={line} />
      <circle cx={105 - 1 - 11} cy="34" r="0.35" fill={line} />
      <path d={`M ${1+11+9.15} ${34-9.15} A 9.15 9.15 0 0 0 ${1+11+9.15} ${34+9.15}`} fill="none" stroke={line} strokeWidth="0.4" />
      <path d={`M ${105-1-11-9.15} ${34-9.15} A 9.15 9.15 0 0 1 ${105-1-11-9.15} ${34+9.15}`} fill="none" stroke={line} strokeWidth="0.4" />
      <circle cx="1" cy="1" r="1" fill="none" stroke={line} strokeWidth="0.3" />
      <circle cx="104" cy="1" r="1" fill="none" stroke={line} strokeWidth="0.3" />
      <circle cx="1" cy="67" r="1" fill="none" stroke={line} strokeWidth="0.3" />
      <circle cx="104" cy="67" r="1" fill="none" stroke={line} strokeWidth="0.3" />
    </svg>
  );
}

function randId() {
  return (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle>(function DrawingCanvas(_props, ref) {
  // Responsive sizing based on wrapper width with 105:68 aspect
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 960, h: Math.round(960 * (68 / 105)) });

  useLayoutEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = e.contentRect.width;
        setSize({ w, h: Math.round(w * (68 / 105)) });
      }
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // Items + history + arrow mode
  const [items, setItems] = useState<Item[]>([]);
  const [history, setHistory] = useState<Item[][]>([]);
  const [arrowMode, setArrowMode] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);

  const pushHistory = (next: Item[]) => {
    setHistory(h => [...h, items]);
    setItems(next);
  };

  useImperativeHandle(ref, () => ({
    addItem: (kind) => {
      const next: Item = { id: randId(), kind, x: size.w / 2, y: size.h / 2 };
      pushHistory([...items, next]);
    },
    startArrowMode: () => {
      setArrowMode(true);
      setArrowStart(null);
    },
    undo: () => {
      setHistory(h => {
        if (!h.length) return h;
        const prev = h[h.length - 1];
        setItems(prev);
        return h.slice(0, -1);
      });
    },
    clear: () => pushHistory([]),
  }), [items, size.w, size.h]);

  // Place arrow with two clicks
  const handleStageClick = (e: any) => {
    if (!arrowMode) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (!arrowStart) {
      setArrowStart({ x: pos.x, y: pos.y });
    } else {
      const arrow: ArrowItem = { id: randId(), kind: 'arrow', x: arrowStart.x, y: arrowStart.y, x2: pos.x, y2: pos.y };
      pushHistory([...items, arrow]);
      setArrowMode(false);
      setArrowStart(null);
    }
  };

  const moveItem = (id: string, x: number, y: number) => {
    setItems(prev => prev.map(it => (it.id === id && it.kind !== 'arrow') ? { ...it, x, y } : it));
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-5xl mx-auto">
      {/* Pitch as the background */}
      <div className="relative rounded-lg overflow-hidden shadow" style={{ width: '100%', aspectRatio: '105 / 68' }}>
        <PitchSVG className="absolute inset-0 w-full h-full" />

        {/* Konva layer on top */}
        <Stage
          width={size.w}
          height={size.h}
          className="absolute inset-0"
          onMouseDown={handleStageClick}
        >
          <Layer>
            {items.map((it) =>
              it.kind === 'arrow' ? (
                <Arrow
                  key={it.id}
                  points={[(it as ArrowItem).x, (it as ArrowItem).y, (it as ArrowItem).x2, (it as ArrowItem).y2]}
                  pointerLength={10}
                  pointerWidth={10}
                  stroke="white"
                  fill="white"
                  strokeWidth={2}
                />
              ) : (
                <Group
                  key={it.id}
                  draggable
                  x={(it as ItemBase).x}
                  y={(it as ItemBase).y}
                  onDragMove={(e) => moveItem(it.id, e.target.x(), e.target.y())}
                >
                  {it.kind === 'player' && <Circle radius={12} fill="#1e88e5" />}
                  {it.kind === 'cone' && <Circle radius={8} fill="#ef6c00" />}
                  {it.kind === 'ball' && <Circle radius={6} fill="#ffeb3b" stroke="black" strokeWidth={1} />}
                </Group>
              )
            )}

            {/* Optional live arrow preview after first click (dashed) */}
            {arrowMode && arrowStart && (
              <Arrow
                points={[arrowStart.x, arrowStart.y, size.w * 0.75, size.h * 0.5]}
                pointerLength={10}
                pointerWidth={10}
                stroke="white"
                fill="white"
                strokeWidth={2}
                dash={[6, 6]}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
});

export default DrawingCanvas;
