import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { TableCellProps } from "@mui/material/TableCell";

export interface Column {
  label: any;
  align?: TableCellProps["align"];
  collapse?: boolean;
  sx?: any;
}

export const columns: { [key: string]: Column } = {
  index: { label: '#', align: "center", sx: { width: 24 } },
  title: { label: 'TITLE' },
  album: { label: 'ALBUM' },
  dateAdded: {
    label: 'DATE ADDED',
    collapse: true,
  },
  duration: {
    label: "",
    align: "right"
  },
};

export const useCollapse = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
};