import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useRef } from "react";

/* =========================
 * props
 * ========================= */

interface VirtualHorizontalScrollbarProps {
  viewportWidth: number; // 表示領域幅
  contentWidth: number; // Pixiコンテナの論理幅
  scrollX: number; // 現在のスクロール量
  onScrollXChange: (x: number) => void;
  height?: number; // スクロールバー高さ
  minThumbWidth?: number; // つまみ最小幅
}

/* =========================
 * styled components
 * ========================= */

const ScrollbarRoot = styled("div")<{
  height: number;
}>(({ height }) => ({
  position: "relative",
  width: "100%",
  height,
  backgroundColor: "#2a2a2a",
  userSelect: "none",
}));

const Thumb = styled("div")<{
  width: number;
  x: number;
}>(({ width, x }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width,
  transform: `translateX(${x}px)`,
  backgroundColor: "#b0b0b0",
  borderRadius: 6,
  cursor: "grab",
  "&:active": {
    cursor: "grabbing",
  },
}));

/* =========================
 * component
 * ========================= */

export const VirtualHorizontalScrollbar = ({
  viewportWidth,
  contentWidth,
  scrollX,
  onScrollXChange,
  height = 12,
  minThumbWidth = 30,
}: VirtualHorizontalScrollbarProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  /* ===== drag state ===== */

  const dragging = useRef(false);
  const startX = useRef(0);
  const startThumbX = useRef(0);

  /* ===== scroll metrics ===== */

  const maxScrollX = Math.max(0, contentWidth - viewportWidth);

  const thumbWidth = useMemo(() => {
    if (contentWidth <= 0) return viewportWidth;

    return Math.max((viewportWidth / contentWidth) * viewportWidth, minThumbWidth);
  }, [viewportWidth, contentWidth, minThumbWidth]);

  const maxThumbX = Math.max(0, viewportWidth - thumbWidth);

  const scrollXToThumbX = (x: number) => (maxScrollX === 0 ? 0 : (x / maxScrollX) * maxThumbX);

  const thumbXToScrollX = useCallback(
    (x: number) => (maxThumbX === 0 ? 0 : (x / maxThumbX) * maxScrollX),
    [maxThumbX, maxScrollX]
  );

  /* =========================
   * drag handlers (useRef)
   * ========================= */

  const onPointerMoveRef = useRef<(e: PointerEvent) => void>();
  const stopDragRef = useRef<() => void>();

  useEffect(() => {
    onPointerMoveRef.current = (e: PointerEvent) => {
      if (!dragging.current) return;

      const dx = e.clientX - startX.current;
      const nextThumbX = Math.min(maxThumbX, Math.max(0, startThumbX.current + dx));

      onScrollXChange(thumbXToScrollX(nextThumbX));
    };

    stopDragRef.current = () => {
      dragging.current = false;
      window.removeEventListener("pointermove", onPointerMoveRef.current!);
      window.removeEventListener("pointerup", stopDragRef.current!);
    };
  }, [maxThumbX, onScrollXChange, thumbXToScrollX]);

  const onThumbPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startThumbX.current = scrollXToThumbX(scrollX);

    window.addEventListener("pointermove", onPointerMoveRef.current!);
    window.addEventListener("pointerup", stopDragRef.current!);
  };

  /* =========================
   * bar background click
   * ========================= */

  const onBarMouseDown = (e: React.MouseEvent) => {
    if (!rootRef.current) return;
    if ((e.target as HTMLElement).dataset.thumb) return;

    const rect = rootRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - thumbWidth / 2;

    const nextThumbX = Math.min(maxThumbX, Math.max(0, clickX));

    onScrollXChange(thumbXToScrollX(nextThumbX));
  };

  /* =========================
   * clamp when content changes
   * ========================= */

  useEffect(() => {
    if (scrollX > maxScrollX) {
      onScrollXChange(maxScrollX);
    }
  }, [scrollX, maxScrollX, onScrollXChange]);

  /* =========================
   * render
   * ========================= */

  return (
    <ScrollbarRoot ref={rootRef} height={height} onMouseDown={onBarMouseDown}>
      <Thumb
        data-thumb
        width={thumbWidth}
        x={scrollXToThumbX(scrollX)}
        onPointerDown={onThumbPointerDown}
      />
    </ScrollbarRoot>
  );
};
