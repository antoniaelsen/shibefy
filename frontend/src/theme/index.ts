import { createTheme } from "@mui/material/styles";

const GREEN_SPOTIFY = "#1ED760";


const palette: any = {
  mode: 'dark',
  primary: {
    main: GREEN_SPOTIFY,
  },
  success: {
    main: GREEN_SPOTIFY,
  },
};

const typography = {
  fontFamily: "'Rubik', sans-serif",
  body1: {
    fontSize: "14px",
    fontWeight: 400,
  },
  button: {
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "2px",
  },
  h1: {
    fontSize: "72px",
    fontWeight: 700,
    letterSpacing: "-0.04em"
  },
  h2: {
    fontSize: "12px",
    fontWeight: 700,
  }
};

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: "500px",
        border: "1px solid transparent",
        padding: "16px 48px 18px",
      },
    },
  },
};


export const theme = createTheme({
  components,
  palette,
  typography,
});