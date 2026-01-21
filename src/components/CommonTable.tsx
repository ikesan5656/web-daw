import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  Typography
} from "@mui/material";
import React from "react";

// ■ カラム定義の型
// T: データの型
export interface TableColumn<T> {
  id: string;              // カラムを一意に識別するID
  label: string;           // ヘッダーに表示する文字
  minWidth?: number;       // 列の最小幅
  align?: 'left' | 'right' | 'center'; // 文字寄せ
  
  // ★重要: セルの中身をどう描画するかを決める関数
  // 値をそのまま出すだけでなく、計算したり、ボタンを置いたりできるようにする
  render: (row: T) => React.ReactNode; 
}

// ■ Propsの定義
interface CommonTableProps<T> {
  rows: T[];                    // データ配列
  columns: TableColumn<T>[];    // カラム設定
  
  // 各行のユニークキーを取得する関数 (例: (row) => row.id)
  getRowKey: (row: T) => string | number; 
  
  // データがない時のメッセージ (任意)
  emptyMessage?: string;
}

// ■ コンポーネント本体
export const CommonTable = <T,>({ 
  rows, 
  columns, 
  getRowKey,
  emptyMessage = "データがありません"
}: CommonTableProps<T>) => {
  
  return (
    <TableContainer component={Paper} sx={{ width: '100%', overflow: 'hidden', maxHeight: "100%" }}>
      <Table stickyHeader aria-label="common table">
        
        {/* ヘッダー部分 */}
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || 'left'}
                style={{ minWidth: col.minWidth }}
                sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }} // 少し装飾
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* ボディ部分 */}
        <TableBody>
          {rows.length === 0 ? (
            // データが0件の場合
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Box py={3}>
                  <Typography variant="body2" color="textSecondary">
                    {emptyMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            // データがある場合
            rows.map((row) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={getRowKey(row)}>
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'}>
                    {/* ここで render 関数を実行して表示内容を決める */}
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};