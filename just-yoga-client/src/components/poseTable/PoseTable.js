import { Typography } from "@material-ui/core";
import NextPose from "../nextPose/NextPose";
import { ReactComponent as MainPose } from "./pose1.svg";
import { useStyles } from "./PoseTable.styles";

const PoseTable = (poses) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Typography className={styles.title}>Just Yoga!</Typography>
      <div className={styles.container}>
        <Typography style={{ fontWeight: 700, fontSize: "2.5em" }}>
          Downward-Facing Dog
        </Typography>
        <div className={styles.posesContainer}>
          <div className={styles.mainPoseContainer}>
            <MainPose style={{ width: "100%", height: "auto" }} />
          </div>
          <Typography style={{ fontWeight: 700, fontSize: "1em" }}>
            Up Next:
          </Typography>
          <div className={styles.nextPoses}>
            {/* {poses &&
              Object.entries(poses).map(([key, pose]) => {
                <NextPose pose={pose} />;
              })} */}
            <NextPose />
            <NextPose />
            <NextPose />
          </div>
        </div>
        <div className={styles.container}></div>
      </div>
    </div>
  );
};

export default PoseTable;
