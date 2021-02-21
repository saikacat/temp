import React, { useState, useEffect } from "react";
import PoseTable from "../components/poseTable/PoseTable";
import { useStyles } from "./YogaPage.styles";
import Video from "../components/video/Video";

export const YogaPage = (props) => {
  const styles = useStyles();
  const [poses, setPoses] = useState([]);

  // initial get poses
  useEffect(async () => {}, []);

  return (
    <div className={styles.root}>
      <PoseTable poses={poses} />
      <Video
        setPoses={setPoses}
        poses={poses}
        roomId={props.match.params}
        location={props.location.search}
      ></Video>
    </div>
  );
};
