import { SplitPane, Pane } from "react-split-pane";
import type { ReactNode } from "react";

interface SplitAreaProps {
  left: ReactNode;
  right: ReactNode;
}

const SplitArea = ({ left, right }: SplitAreaProps) => {
  return (
    <SplitPane direction="horizontal">
      {/* 左パネル: 固定幅ベースで制限をかける */}
      <Pane maxSize="50%" minSize="200px" defaultSize="300px">
        {left}
      </Pane>

      {/* 右パネル: defaultSizeを指定せず、残りの空間を自動で埋めさせる */}
      <Pane minSize="50%">{right || <div>Loading...</div>}</Pane>
    </SplitPane>
  );
};

export default SplitArea;
