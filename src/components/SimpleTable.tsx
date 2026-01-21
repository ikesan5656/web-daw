import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import type { JSX } from "react";

interface BasicTableProps {
  headers: string[];
  renderRowItem: JSX.Element;
}

export default function BasicTable(props: BasicTableProps) {
  const {headers, renderRowItem} = props;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
            {/*<TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell>*/}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Ensure renderRowItem is directly rendered as a JSX element */}
          {renderRowItem}
        </TableBody>
      </Table>
    </TableContainer>
  );
}