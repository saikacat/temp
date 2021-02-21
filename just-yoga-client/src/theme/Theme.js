import { createMuiTheme } from "@material-ui/core";

export const theme = createMuiTheme({
  typography: {
    fontFamily: ["Source Serif Pro"].join(","),
  },
  "& .h6": {
    fontFamily: ["Roboto"],
  },
  palette: {
    primary: {
      main: "#491a29",
    },
  },
});

export default theme;
