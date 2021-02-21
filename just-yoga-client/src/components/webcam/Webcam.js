import { Typography } from "@material-ui/core";
import { useStyles } from "./webcam.styles";

export const Webcam = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.videoWrapper}>
        <div className={styles.video}>No Video</div>
        <div className={styles.video}>No Video</div>
      </div>
    </div>
  );
};
