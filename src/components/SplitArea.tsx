import { SplitPane, Pane, type DividerProps } from "react-split-pane";
import { GripVertical } from "lucide-react"; // アイコンライブラリ
import type { ReactNode } from "react";

// カスタムDivider: アイコンなど dividerClassName では不可能な表現
const CustomDivider = ({
  isDragging,
  ...domProps
}: DividerProps) => (
  <div
    {...domProps}
    className={`w-3 h-full cursor-col-resize flex items-center justify-center
      ${isDragging ? "bg-blue-400" : "bg-gray-100 hover:bg-gray-200"}`}
  >
    <GripVertical
      size={12}
      className={isDragging ? "text-white" : "text-gray-400"}
    />
  </div>
);

interface SplitArea {
  left: ReactNode;
  right: ReactNode;
}

const SplitArea = (props: SplitArea) => {
  const {left, right} = props;

  return(
    <SplitPane direction="horizontal" divider={CustomDivider}>
      <Pane minSize="200px" defaultSize={"300px"}>
        {left}
      </Pane>
      <Pane minSize="50%">
        {right}
      </Pane>
    </SplitPane>
  )
}

export default SplitArea;