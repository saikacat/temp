import { Typography } from "@material-ui/core";
import { ReactComponent as Pose } from "../poseTable/pose1.svg";
import { useStyles } from "./NextPose.styles";

const NextPose = () => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Pose style={{ height: "auto", width: "100%" }} />
      <p className={styles.name}>Pose Name</p>
    </div>
  );
};

export default NextPose;
