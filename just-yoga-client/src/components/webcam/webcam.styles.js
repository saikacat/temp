import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  videoWrapper: { display: "flex", flexDirection: "column", height: "100%" },
  video: {
    flex: 1,
    backgroundColor: "lightblue",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
