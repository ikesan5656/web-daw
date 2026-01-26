import { useEffect, useRef, useState } from "react";

type Size = {
  width: number;
  height: number;
};

export const useContainerSize = (initialHeight: number = 0) => {
  // フック内で ref を生成して返すパターン
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: initialHeight });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let animationFrameId: number;

    const observer = new ResizeObserver((entries) => {
      // 既存の予定があればキャンセル（無駄な連打を防ぐ）
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      // 次の描画フレームでStateを更新する
      animationFrameId = requestAnimationFrame(() => {
        for (const entry of entries) {
          // 小数点以下のピクセルズレを防ぐため Math.floor
          const width = Math.floor(entry.contentRect.width);
          const height = Math.floor(entry.contentRect.height);

          setSize((prev) => {
            // 値が変わっていない場合は更新しない（再レンダリング防止）
            if (prev.width === width && prev.height === height) return prev;
            return { width, height };
          });
        }
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ref と size を返す
  return { ref, size };
};
