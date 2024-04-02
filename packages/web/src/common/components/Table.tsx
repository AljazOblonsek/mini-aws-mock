import {
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  useTheme,
} from '@suid/material';
import { tableCellClasses } from '@suid/material/TableCell';
import { JSX } from 'solid-js';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    borderRight: `1px solid ${theme.palette.grey[300]}`,
    '&:last-child': {
      borderRight: 'none',
    },
  },
  [`&.${tableCellClasses.body}`]: {
    borderRight: `1px solid ${theme.palette.grey[300]}`,
    '&:last-child': {
      borderRight: 'none',
    },
  },
}));

type TableProps = {
  children: JSX.Element;
};

const Table = (props: TableProps) => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      sx={{
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: `${theme.shape.borderRadius}px`,
      }}
    >
      <MuiTable sx={{ minWidth: 650 }}>{props.children}</MuiTable>
    </TableContainer>
  );
};

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = StyledTableCell;

export { Table };
