import { TableCellProps } from "@mui/material/TableCell";

export interface Column {
  label: any;
  align?: TableCellProps["align"];
  collapse?: string;
  sx?: any;
}

export const columns: { [key: string]: Column } = {
  index: { label: '#', align: "center", sx: { width: { "xs": "16px", "sm": "24px" } } },
  title: { label: 'TITLE' },
  album: { label: 'ALBUM' },
  dateAdded: {
    label: 'DATE ADDED',
    collapse: "md",
  },
  duration: {
    label: "",
    align: "right",
    collapse: "sm",
  },
};

const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
export const collapseStyling = (target, display) => ({
  display: {
    ...breakpoints.reduce((acc, breakpoint, i) => {
      return {
        ...acc, 
        [breakpoint]: breakpoints.indexOf(target) < i ? display : "none"
      };
    }, {})
  }
});