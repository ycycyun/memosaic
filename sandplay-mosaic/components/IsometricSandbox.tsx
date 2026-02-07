import React, { useEffect, useRef, useState } from 'react';
import { ISO_MATH, ISO_COLS, ISO_ROWS, ISO_GRID_SIZE } from '../constants';
import { AssetTheme, SandboxObject } from '../types';

interface IsometricSandboxProps {
  objects: SandboxObject[];
  onDrop: (x: number, y: number) => void;
  onUpdateObject?: (id: string, x: number, y: number) => void;
  onDeleteObject?: (id: string) => void;
  activeThemeColor: string;
  activeThemeName: AssetTheme;
  activeThemeBaseColor: string;
}

const IsometricSandbox: React.FC<IsometricSandboxProps> = ({
  objects,
  onDrop,
  onUpdateObject,
  onDeleteObject,
  activeThemeColor,
  activeThemeName,
  activeThemeBaseColor
}) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const boardViewportRef = useRef<HTMLDivElement>(null);
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });
  
  // Zoom and pan state - 使用 Pointer Events
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activePanPointerId, setActivePanPointerId] = useState<number | null>(null);
  // Tap-to-place: only start pan after movement threshold; otherwise treat as click to add object
  const [canvasPointerDownPos, setCanvasPointerDownPos] = useState<{ x: number; y: number } | null>(null);
  const [canvasPointerId, setCanvasPointerId] = useState<number | null>(null);
  
  // Object dragging state - 严格的 press-and-drag
  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null);
  const [activeObjectPointerId, setActiveObjectPointerId] = useState<number | null>(null);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  
  // Click and selection state
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<{ [key: string]: number }>({});
  const [deleteMenuPos, setDeleteMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  // Smooth entrance: track newly placed object ids for drop-in animation
  const prevObjectIdsRef = useRef<Set<string>>(new Set());
  const [recentlyPlacedIds, setRecentlyPlacedIds] = useState<Set<string>>(new Set());
  const ENTRANCE_MS = 420;

  useEffect(() => {
    const currentIds = new Set(objects.map(o => o.id));
    const prevIds = prevObjectIdsRef.current;
    const newIds = [...currentIds].filter(id => !prevIds.has(id));
    if (newIds.length > 0) {
      setRecentlyPlacedIds(prev => new Set([...prev, ...newIds]));
      const t = setTimeout(() => {
        setRecentlyPlacedIds(prev => {
          const next = new Set(prev);
          newIds.forEach(id => next.delete(id));
          return next;
        });
      }, ENTRANCE_MS);
      prevObjectIdsRef.current = currentIds;
      return () => clearTimeout(t);
    }
    prevObjectIdsRef.current = currentIds;
  }, [objects]);

  useEffect(() => {
    if (!surfaceRef.current) return;
    const el = surfaceRef.current;

    const updateSize = () => {
      setSurfaceSize({ width: el.clientWidth, height: el.clientHeight });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Prevent page scroll when mouse is over the sandbox
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelCapture = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY * -0.003;
      setZoom(prevZoom => Math.min(Math.max(0.5, prevZoom + delta), 2.5));
    };

    container.addEventListener('wheel', handleWheelCapture, { passive: false, capture: true });
    
    return () => {
      container.removeEventListener('wheel', handleWheelCapture, { capture: true });
    };
  }, []);

  // Close delete menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedObject(null);
      setDeleteMenuPos(null);
    };
    
    if (selectedObject) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [selectedObject]);

  const baseGridSize = ISO_GRID_SIZE;
  const rawA = baseGridSize / 1.5;
  const rawB = baseGridSize / 3;
  const rawGridWidth = (ISO_COLS - 1 + ISO_ROWS - 1) * rawA;
  const rawGridHeight = (ISO_COLS - 1 + ISO_ROWS - 1) * rawB;
  const hasSurface = surfaceSize.width > 0 && surfaceSize.height > 0;
  const padding = 0;
  const baseScaleX = hasSurface
    ? (surfaceSize.width - padding * 2) / rawGridWidth
    : 1;
  const baseScaleY = hasSurface
    ? (surfaceSize.height - padding * 2) / rawGridHeight
    : 1;
  const scaleX = baseScaleX * 1.21275;
  const scaleY = baseScaleY * 1.21275;
  const gridSizeX = baseGridSize * scaleX;
  const gridSizeY = baseGridSize * scaleY;
  const gridWidth = rawGridWidth * scaleX;
  const gridHeight = rawGridHeight * scaleY;
  const centerX = hasSurface ? surfaceSize.width / 2 : 0;
  const centerY = hasSurface ? surfaceSize.height / 2 : 0;
  const minX = -(ISO_ROWS - 1) * rawA * scaleX;
  const minY = 0;
  const originX = centerX - gridWidth / 2 - minX - centerX * 0.1;
  const originY = centerY - gridHeight / 2 - minY - centerY * 0.15;
  const hitSizeX = gridSizeX * 1.2;
  const hitSizeY = gridSizeY * 1.2;
  const hitOffsetX = (hitSizeX - gridSizeX) / 2;
  const hitOffsetY = (hitSizeY - gridSizeY) / 2;

  // ========== 画布平移 - 严格的 Press-and-Drag；点击空白格为放置对象 ==========
  const PAN_THRESHOLD_PX = 5;

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (target.closest('[data-sandbox-ui]')) return;
    if (target.closest('.sandbox-object')) return;
    if (draggingObjectId) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setCanvasPointerId(e.pointerId);
    setCanvasPointerDownPos({ x: e.clientX, y: e.clientY });
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    setActivePanPointerId(e.pointerId);
    // 不立即 isPanning，等 move 超过阈值再开始平移，否则视为点击放置
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (activePanPointerId !== e.pointerId) return;
    if (e.buttons !== 1) {
      handleCanvasPointerUp(e);
      return;
    }

    // 尚未开始平移：检查是否超过阈值，超过则开始平移
    if (!isPanning && canvasPointerDownPos) {
      const dx = e.clientX - canvasPointerDownPos.x;
      const dy = e.clientY - canvasPointerDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > PAN_THRESHOLD_PX) {
        setIsPanning(true);
        setCanvasPointerDownPos(null);
        setCanvasPointerId(null);
      }
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (activePanPointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    // 未发生平移 → 视为在画布上点击，按"点击放置"逻辑调用 onDrop
    if (!isPanning && canvasPointerDownPos) {
      const gridPos = getGridPositionFromMouse(e.clientX, e.clientY);
      if (gridPos) onDrop(gridPos.x, gridPos.y);
    }

    setIsPanning(false);
    setActivePanPointerId(null);
    setCanvasPointerDownPos(null);
    setCanvasPointerId(null);
  };

  const handleCanvasPointerCancel = (e: React.PointerEvent) => {
    if (activePanPointerId === e.pointerId || canvasPointerId === e.pointerId) {
      setIsPanning(false);
      setActivePanPointerId(null);
      setCanvasPointerDownPos(null);
      setCanvasPointerId(null);
    }
  };

  // Calculate grid position from mouse coordinates
  const getGridPositionFromMouse = (clientX: number, clientY: number) => {
    if (!containerRef.current || !surfaceRef.current) return null;
    
    const rect = boardViewportRef.current
      ? boardViewportRef.current.getBoundingClientRect()
      : containerRef.current.getBoundingClientRect();
    
    // Mouse in viewport coordinates
    const viewportCenterX = rect.left + rect.width / 2;
    const viewportCenterY = rect.top + rect.height / 2;
    
    // Account for zoom and pan - work in the transformed space
    const transformedX = (clientX - viewportCenterX - panOffset.x) / zoom;
    const transformedY = (clientY - viewportCenterY - panOffset.y) / zoom;
    
    // The grid is positioned with originX and originY offsets
    // Convert to grid-local coordinates
    // Add compensation for visual offset: objects render with translate(0, -20*scaleY)
    // Also adjust for slight leftward/upward bias
    const offsetCompensationX = -10; // Shift right to compensate for leftward bias
    const offsetCompensationY = 30 * scaleY; // Shift down to compensate for upward bias (includes the -20 offset)
    
    const gridLocalX = transformedX - (originX - centerX) + offsetCompensationX;
    const gridLocalY = transformedY - (originY - centerY) + offsetCompensationY;
    
    // Apply inverse isometric transformation
    const a = rawA * scaleX;
    const b = rawB * scaleY;
    
    const gridX = (gridLocalX / a + gridLocalY / b) / 2;
    const gridY = (gridLocalY / b - gridLocalX / a) / 2;
    
    const roundedX = Math.round(gridX);
    const roundedY = Math.round(gridY);
    
    // Expand boundary slightly in the front (where x and y are larger)
    // Allow up to 0.3 units beyond the normal boundary in front direction
    const minXBound = 1.52;
    const maxXBound = ISO_COLS - 1 + 1.852;
    const minYBound = 0.4;
    const maxYBound = ISO_ROWS - 1 + 0.6;
    
    const clampedX = Math.max(minXBound, Math.min(maxXBound, roundedX));
    const clampedY = Math.max(minYBound, Math.min(maxYBound, roundedY));
    
    return { x: clampedX, y: clampedY };
  };

  // ========== 对象拖拽 - 严格的 Press-and-Drag ==========
  const handleObjectPointerDown = (e: React.PointerEvent, objId: string) => {
    e.stopPropagation();
    
    // 只允许主按钮（左键/主触摸）
    if (e.button !== 0) return;
    
    // 捕获指针 - 确保即使光标离开对象也能继续拖拽
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // 记录拖拽起始状态
    setDraggingObjectId(objId);
    setActiveObjectPointerId(e.pointerId);
    setDragStartTime(Date.now());
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasMoved(false);
    
    // 清除选择菜单
    setSelectedObject(null);
    setDeleteMenuPos(null);
  };

  const handleObjectPointerMove = (e: React.PointerEvent) => {
    // 关键：只在有活动拖拽且是正确指针时响应
    if (!draggingObjectId || activeObjectPointerId !== e.pointerId) {
      return;
    }
    
    // 验证按钮仍然按住
    if (e.buttons !== 1) {
      // 按钮已释放但我们错过了 up 事件 - 停止拖拽
      handleObjectPointerUp(e);
      return;
    }
    
    // 检测是否真的移动了（避免误触）
    if (!hasMoved && dragStartPos) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 3) { // 3px 阈值
        setHasMoved(true);
      }
    }
    
    // 只有真的移动时才更新位置
    if (hasMoved && onUpdateObject) {
      const newPos = getGridPositionFromMouse(e.clientX, e.clientY);
      if (newPos) {
        onUpdateObject(draggingObjectId, newPos.x, newPos.y);
      }
    }
  };

  const handleObjectPointerUp = (e: React.PointerEvent) => {
    // 只处理活动拖拽指针
    if (activeObjectPointerId !== e.pointerId) {
      return;
    }
    
    const objId = draggingObjectId;
    const moved = hasMoved;
    const startTime = dragStartTime;
    
    // 释放指针捕获
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // 指针可能已被释放
    }
    
    // 如果用户拖动了，固定最终位置
    if (moved && objId && onUpdateObject) {
      const finalPos = getGridPositionFromMouse(e.clientX, e.clientY);
      if (finalPos) {
        onUpdateObject(objId, finalPos.x, finalPos.y);
      }
    } 
    // 如果用户只是点击（没有拖动），处理点击/双击
    else if (!moved && objId) {
      const now = Date.now();
      const clickDuration = now - startTime;
      
      // 只有快速点击（< 300ms）才算点击
      if (clickDuration < 300) {
        e.stopPropagation();
        
        const lastClick = lastClickTime[objId] || 0;
        const timeSinceLastClick = now - lastClick;
        
        if (timeSinceLastClick < 300 && onDeleteObject) {
          // 检测到双击 - 删除对象
          onDeleteObject(objId);
          setLastClickTime({});
        } else {
          // 单击 - 显示删除按钮
          setLastClickTime({ ...lastClickTime, [objId]: now });
          
          const obj = objects.find(o => o.id === objId);
          if (obj && containerRef.current) {
            const pos = ISO_MATH.toIso(obj.x, obj.y);
            const rect = boardViewportRef.current
              ? boardViewportRef.current.getBoundingClientRect()
              : containerRef.current.getBoundingClientRect();
            const px = pos.x * scaleX;
            const py = pos.y * scaleY;
            
            setSelectedObject(objId);
            setDeleteMenuPos({
              x: rect.left + rect.width / 2 + (originX + px) * zoom + panOffset.x,
              y: rect.top + rect.height / 2 + (originY + py - 40) * zoom + panOffset.y
            });
          }
        }
      }
    }
    
    // 清除所有拖拽状态
    setDraggingObjectId(null);
    setActiveObjectPointerId(null);
    setHasMoved(false);
    setDragStartPos(null);
    setDragStartTime(0);
  };

  const handleObjectPointerCancel = (e: React.PointerEvent) => {
    // 指针被取消 - 清理拖拽状态
    if (activeObjectPointerId === e.pointerId) {
      setDraggingObjectId(null);
      setActiveObjectPointerId(null);
      setHasMoved(false);
      setDragStartPos(null);
      setDragStartTime(0);
    }
  };

  const handleDeleteObject = (e: React.MouseEvent, objId: string) => {
    e.stopPropagation();
    if (onDeleteObject) {
      onDeleteObject(objId);
    }
    setSelectedObject(null);
    setDeleteMenuPos(null);
  };

  const renderGrid = () => {
    const cells = [];
    const isSandTheme = activeThemeName === 'Desert';
    for (let x = 0; x < ISO_COLS; x++) {
      for (let y = 0; y < ISO_ROWS; y++) {
        const pos = ISO_MATH.toIso(x, y);
        const px = pos.x * scaleX;
        const py = pos.y * scaleY;
        cells.push(
          <div
            key={`${x}-${y}`}
            className="absolute cursor-pointer group"
            style={{
              left: `${originX + px - hitOffsetX}px`,
              top: `${originY + py - hitOffsetY}px`,
              width: `${hitSizeX}px`,
              height: `${hitSizeY}px`,
              zIndex: x + y
            }}
          >
            {/* Grid Tile */}
            <div 
              className={`w-full h-full transition-colors ${isSandTheme ? '' : 'border border-slate-200/30 group-hover:bg-white/30'}`}
              style={{
                transform: 'rotateX(60deg) rotateZ(45deg)',
                backgroundColor: isSandTheme ? 'transparent' : activeThemeColor + '14',
                width: `${gridSizeX}px`,
                height: `${gridSizeY}px`,
                marginLeft: `${hitOffsetX}px`,
                marginTop: `${hitOffsetY}px`
              }}
            />
          </div>
        );
      }
    }
    return cells;
  };

  const trayStyles: Record<AssetTheme, { frame: string; surface: string; border: string; noiseOpacity: number }> = {
    Desert: {
      frame: '#5D4037',
      surface: '#E6C288',
      border: '#8D6E63',
      noiseOpacity: 0.15
    },
    Forest: {
      frame: '#2b3a2f',
      surface: activeThemeBaseColor,
      border: '#6b7f5f',
      noiseOpacity: 0.08
    },
    Sea: {
      frame: '#0f3b4a',
      surface: activeThemeBaseColor,
      border: '#2b6f8f',
      noiseOpacity: 0.08
    },
    Urban: {
      frame: '#3f3f46',
      surface: activeThemeBaseColor,
      border: '#a1a1aa',
      noiseOpacity: 0.06
    }
  };

  const tray = trayStyles[activeThemeName];
  const hoverRingColors: Record<AssetTheme, string> = {
    Desert: '#2DD4BF',
    Forest: '#FF3D8A',
    Sea: '#FFD60A',
    Urban: '#38BDF8'
  };
  const hoverRingColor = hoverRingColors[activeThemeName];
  const noiseLayer = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${tray.noiseOpacity}'/%3E%3C/svg%3E")`;
  const surfaceGradient = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.12), transparent 55%)`;

  return (
    <>
      <style>{`
        @keyframes sandbox-object-place {
          from { opacity: 0; transform: scale(0.4); }
          to { opacity: 1; transform: scale(1); }
        }
        .sandbox-object-place-in {
          animation: sandbox-object-place 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] flex items-center justify-center select-none"
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onPointerCancel={handleCanvasPointerCancel}
      style={{ 
        cursor: isPanning ? 'grabbing' : 'grab',
        touchAction: 'none' // 防止默认触摸行为
      }}
    >
      {/* Zoom controls */}
      <div
        className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg"
        data-sandbox-ui
      >
        <button
          onClick={() => setZoom(Math.min(2.5, zoom + 0.2))}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-700 font-bold"
          title="Zoom In"
        >
          +
        </button>
        <div className="text-center text-xs text-slate-600 font-medium">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-700 font-bold"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-700 text-xs"
          title="Reset View"
        >
          ⟲
        </button>
      </div>

      {/* Instructions */}
      <div
        className="absolute bottom-20 left-4 z-50 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg text-xs text-slate-600"
        data-sandbox-ui
      >
        <div className="font-medium mb-1">Controls:</div>
        <div>• Scroll to zoom in/out</div>
        <div>• Press & drag canvas to pan</div>
        <div>• Press & drag objects to move</div>
        <div>• Double-click to delete</div>
      </div>

      {/* Board Viewport - Rounded mask/window with perspective for depth */}
      <div 
        ref={boardViewportRef}
        className="board-viewport absolute"
        style={{
          width: '55rem',
          height: '34rem',
          top: '-1.1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          pointerEvents: 'auto',
          // Perspective creates depth: near objects appear larger, far objects smaller
          perspective: '1400px',
          perspectiveOrigin: '50% 42%'
        }}
      >
        <div
          className="absolute transition-all duration-700 ease-out preserve-3d isometric-container"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotateX(55deg) rotateZ(-45deg) scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformStyle: 'preserve-3d',
            width: '34rem',
            height: '34rem',
            pointerEvents: 'auto'
          }}
        >
          {/* Frame */}
          <div
            className="absolute -inset-4 rounded-lg transform translate-z-[-10px] shadow-2xl border-b-[8px] border-r-[8px] border-black/40"
            style={{ backgroundColor: tray.frame }}
          />

          {/* Surface with grid */}
          <div
            ref={surfaceRef}
            className="w-full h-full rounded-md border-4 relative overflow-hidden"
            style={{
              backgroundColor: tray.surface,
              borderColor: tray.border,
              backgroundImage: `${surfaceGradient}, ${noiseLayer}`,
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)'
            }}
          >
            <div
              className="relative w-full h-full"
              style={{ transform: 'rotateZ(45deg)', transformOrigin: '50% 50%' }}
            >
              {renderGrid()}
            </div>
          </div>

          {/* Objects layer - same level as surface but rendered separately to avoid perspective */}
          <div
            className="absolute top-0 left-0 w-full h-full rounded-md overflow-visible pointer-events-auto"
          >
            <div
              className="relative w-full h-full"
              style={{ transform: 'rotateZ(45deg)', transformOrigin: '50% 50%' }}
            >
              {objects.map((obj) => {
                const pos = ISO_MATH.toIso(obj.x, obj.y);
                const px = pos.x * scaleX;
                const py = pos.y * scaleY;
                const objectSize = Math.min(gridSizeX, gridSizeY) * 4.2;
                const hitboxSize = objectSize * 2;
                const isBeingDragged = draggingObjectId === obj.id && hasMoved;
                const isRecentlyPlaced = recentlyPlacedIds.has(obj.id);
                
                return (
                  <div
                    key={obj.id}
                    className={`sandbox-object absolute cursor-grab active:cursor-grabbing select-none ${
                      isBeingDragged
                        ? 'duration-0'
                        : 'transition-[left,top] duration-[280ms] ease-out'
                    }`}
                    onPointerDown={(e) => handleObjectPointerDown(e, obj.id)}
                    onPointerMove={handleObjectPointerMove}
                    onPointerUp={handleObjectPointerUp}
                    onPointerCancel={handleObjectPointerCancel}
                    onPointerEnter={() => setHoveredObjectId(obj.id)}
                    onPointerLeave={() => setHoveredObjectId(prev => (prev === obj.id ? null : prev))}
                    style={{
                      left: `${originX + px}px`,
                      top: `${originY + py}px`,
                      width: `${hitboxSize}px`,
                      height: `${hitboxSize}px`,
                      zIndex: isBeingDragged ? 9999 : obj.x + obj.y + 10,
                      transform: `translate(-50%, -50%) translate(0, -${20 * scaleY}px)`,
                      pointerEvents: 'auto',
                      opacity: 1,
                      touchAction: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                  >
                    <div
                      className={`absolute left-1/2 top-1/2 flex flex-col items-center justify-end origin-bottom ${
                        isRecentlyPlaced ? 'sandbox-object-place-in' : ''
                      }`}
                      style={{
                        width: `${objectSize}px`,
                        height: `${objectSize}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {obj.imageUrl ? (
                        <img 
                          src={obj.imageUrl} 
                          alt={obj.name} 
                          className="w-full h-auto object-contain drop-shadow-lg pointer-events-none"
                          draggable={false}
                          style={{ transform: 'scaleY(1.55)', transformOrigin: 'bottom center' }}
                        />
                      ) : (
                        <div className="text-slate-700 bg-white/80 p-2 rounded-lg shadow-lg border border-slate-100 flex items-center justify-center pointer-events-none">
                          {React.isValidElement(obj.icon) ? obj.icon : <span>{obj.name}</span>}
                        </div>
                      )}
                      <div className="w-8 h-2 bg-black/10 blur-sm rounded-full -mb-1" />
                      <div
                        className="absolute rounded-full pointer-events-none transition-all duration-200"
                        style={{
                          width: '18px',
                          height: '18px',
                          left: '50%',
                          bottom: '6px',
                          transform: 'translateX(-50%)',
                          backgroundColor: hoverRingColor,
                          opacity: hoveredObjectId === obj.id ? 0.65 : 0,
                          boxShadow: `0 0 10px ${hoverRingColor}`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* End of board-viewport wrapper */}

      {/* Delete button popup */}
      {selectedObject && deleteMenuPos && (
        <div
          className="fixed z-[60] animate-in fade-in zoom-in duration-200"
          data-sandbox-ui
          style={{
            left: `${deleteMenuPos.x}px`,
            top: `${deleteMenuPos.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => handleDeleteObject(e, selectedObject)}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 border-2 border-white"
            title="Delete"
          >
            <span className="text-xl font-bold leading-none">×</span>
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default IsometricSandbox;