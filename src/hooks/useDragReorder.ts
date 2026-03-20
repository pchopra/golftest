import { useState, useRef, useCallback } from 'react';

interface DragState {
  dragIndex: number;
  overIndex: number;
  offsetY: number;
  startY: number;
}

export function useDragReorder<T>(items: T[], onReorder: (items: T[]) => void) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback((index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  const getIndexFromY = useCallback((clientY: number): number => {
    const rects = itemRefs.current.map(el => el?.getBoundingClientRect());
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect) {
        const midY = rect.top + rect.height / 2;
        if (clientY < midY) return i;
      }
    }
    return items.length - 1;
  }, [items.length]);

  const handleDragStart = useCallback((index: number, clientY: number) => {
    const el = itemRefs.current[index];
    const rect = el?.getBoundingClientRect();
    setDragState({
      dragIndex: index,
      overIndex: index,
      startY: clientY,
      offsetY: rect ? clientY - rect.top : 0,
    });
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragState) return;
    const overIndex = getIndexFromY(clientY);
    setDragState(prev => prev ? { ...prev, overIndex } : null);
  }, [dragState, getIndexFromY]);

  const handleDragEnd = useCallback(() => {
    if (!dragState) return;
    const { dragIndex, overIndex } = dragState;
    if (dragIndex !== overIndex) {
      const newItems = [...items];
      const [moved] = newItems.splice(dragIndex, 1);
      newItems.splice(overIndex, 0, moved);
      onReorder(newItems);
    }
    setDragState(null);
  }, [dragState, items, onReorder]);

  // Touch handlers for drag handle
  const handleTouchStart = useCallback((index: number) => (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragStart(index, e.touches[0].clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse handlers for drag handle
  const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(index, e.clientY);

    const onMouseMove = (ev: MouseEvent) => {
      handleDragMove(ev.clientY);
    };
    const onMouseUp = () => {
      handleDragEnd();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  // Compute display order
  const getDisplayItems = useCallback((): { item: T; originalIndex: number }[] => {
    const indexed = items.map((item, i) => ({ item, originalIndex: i }));
    if (!dragState) return indexed;

    const { dragIndex, overIndex } = dragState;
    const result = [...indexed];
    const [moved] = result.splice(dragIndex, 1);
    result.splice(overIndex, 0, moved);
    return result;
  }, [items, dragState]);

  return {
    containerRef,
    setItemRef,
    dragState,
    getDisplayItems,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
  };
}
