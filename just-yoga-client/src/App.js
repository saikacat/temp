// import "./App.css";
import { ThemeProvider } from "@material-ui/core";
import PoseTable from "./components/poseTable/PoseTable";
import theme from "./theme/Theme";
import useStyles from "./App.styles";
import { Webcam } from "./components/webcam/Webcam";

import React, { Component } from "react";
import Video from "./components/video/Video";
import "./App.css";
import { BrowserRouter, Route } from "react-router-dom";
import { GoToRoomInput } from "./components/goToRoomInput/GoToRoomInput";
import { YogaPage } from "./pages/YogaPage";
class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <React.Fragment>
            <Route path="/" exact component={GoToRoomInput} />
            <Route path="/:roomId" exact component={YogaPage} />
          </React.Fragment>
        </BrowserRouter>
      </ThemeProvider>
    );
  }
}
export default App;
