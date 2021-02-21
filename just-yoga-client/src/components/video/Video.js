import React from "react";
import VideoCall from "../../helpers/simple-peer";
import io from "socket.io-client";
import { Typography, Button } from "@material-ui/core";
import styles from "./Video.module.css";
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js%22%3E</script>
<script>

class Video extends React.Component {
  constructor() {
    super();
    this.state = {
      localName: "",
      remoteName: "",
      localStream: {},
      remoteStreamUrl: "",
      streamUrl: "",
      initiator: false,
      full: false,
      connecting: false,
      waiting: true,
      camState: true,
      imageNumber: 0,
      countdown: 10,
      roundStart: false,
      localScore: -1,
      remoteScore: -1,
      localWins: 0,
      remoteWins: 0,
    };
  }
  videoCall = new VideoCall();

  componentDidMount() {
    this.setState({
      localName: new URLSearchParams(this.props.location).get("name"),
    });

    const socket = io(process.env.REACT_APP_SIGNALING_SERVER);
    const component = this;
    this.setState({ socket });
    const { roomId } = this.props.roomId;
    this.getUserMedia().then(() => {
      console.log("join");
      socket.emit("join", { roomId: roomId });
    });

    socket.on("init", () => {
      console.log("init");
      component.setState({ initiator: true });
    });
    socket.on("ready", () => {
      console.log("enter");
      component.enter(roomId);
    });
    socket.on("desc", (signal) => {
      console.log("signal");
      console.log(signal);
      if (signal.type === "offer" && component.state.initiator) return;
      if (signal.type === "answer" && !component.state.initiator) return;
      component.call(signal);
    });
    socket.on("remoteName", (name) => {
      console.log("remoteName");
      this.setState({ remoteName: name });
    });
    socket.on("remoteScore", (score) => {
      console.log("remoteScore");
      this.setState({ remoteScore: score });
      this.receivedScore();
    });
    socket.on("roundStarted", () => {
      console.log("roundStarted");
      this.setState({ roundStart: true });
      this.startTimer();
    });
    socket.on("disconnected", () => {
      component.setState({ initiator: true });
    });
    socket.on("full", () => {
      component.setState({ full: true });
    });
  }

  getUserMedia(cb) {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      const op = {
        video: {
          width: { min: 160, ideal: 1280, max: 1280 },
          height: { min: 120, ideal: 720, max: 720 },
        },
        audio: false,
      };
      navigator.getUserMedia(
        op,
        (stream) => {
          this.setState({ streamUrl: stream, localStream: stream });
          this.localVideo.srcObject = stream;
          resolve();
        },
        () => {}
      );
    });
  }

  setVideoLocal() {
    if (this.state.localStream.getVideoTracks().length > 0) {
      this.state.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    this.setState({
      camState: !this.state.camState,
    });
  }

  enter = (roomId) => {
    this.setState({ connecting: true });
    const peer = this.videoCall.init(
      this.state.localStream,
      this.state.initiator
    );
    this.setState({ peer });

    peer.on("signal", (data) => {
      const signal = {
        room: roomId,
        desc: data,
      };
      this.state.socket.emit("signal", signal);
      this.state.socket.emit("name", this.state.localName);
    });

    peer.on("stream", (stream) => {
      console.log("stream");
      this.remoteVideo.srcObject = stream;
      this.setState({ connecting: false, waiting: false });
    });

    peer.on("error", function (err) {
      console.log(err);
    });
  };

  call = (otherId) => {
    this.videoCall.connect(otherId);
  };

  startRound = () => {
    if (!this.state.waiting && !this.state.connecting && this.state.socket) {
      const { roomId } = this.props.roomId;
      this.state.socket.emit("startRound");
    }
  };

  startTimer = () => {
    this.setState({ countdown: 10 });

    if (this.state.countdown > 0) {
      let timer = setInterval(async () => {
        this.setState({ countdown: this.state.countdown - 1 });
        if (this.state.countdown <= 0) {
          // next pose
          this.props.poses.shift();
          this.props.setPoses(this.props.poses);

          clearInterval(timer);
          const dataURL = this.capture();
          let score = await this.scoreImage(dataURL);
          this.setState({ localScore: score });
          this.state.socket.emit("score", this.state.localScore);
          this.receivedScore();
        }
      }, 1000);
    }
  };

  scoreImage = async (dataUrl) => {
    //fetch here
  var form_data = new FormData(dataUrl);

    $.ajax({
      type: 'POST',
      url: 'localhost:5000/predict',
      data: form_data,
      contentType: false,
      cache: false,
      processData: false,
      async: true,
      success: function (data) {
          // Get and display the result
          $('.loader').hide();
          $('#result').fadeIn(600);
          $('#result').text(' Result:  ' + data);
          console.log('Success!');
    },
    }).then(resp => {
        if(resp.ok)
            resp.json().then(data =>{
                console.log("okok");
                show(data);
            });
    });
    
    return Math.random();
  };

  receivedScore = () => {
    // a received score will be greater than 0, if it is less than we wait for api to finish
    if (this.state.localScore >= 0 && this.state.remoteScore >= 0) {
      if (this.state.localScore > this.state.remoteScore) {
        this.setState({ localWins: this.state.localWins + 1 });
      } else {
        this.setState({ remoteWins: this.state.remoteWins + 1 });
      }

      this.setState({
        localScore: -1,
        remoteScore: -1,
        imageNumber: this.state.imageNumber + 1,
        countdown: 10,
      });

      if (this.state.imageNumber >= 4) {
        // round over
        this.setState({ roundStart: false, imageNumber: 0 });
      } else {
        this.startTimer();
      }
    }
  };

  capture = () => {
    const canvas = document.createElement("canvas");

    canvas.width = this.localVideo.videoWidth;
    canvas.height = this.localVideo.videoHeight;
    // draw the video at that frame
    canvas
      .getContext("2d")
      .drawImage(this.localVideo, 0, 0, canvas.width, canvas.height);
    // convert it to a usable data URL
    const dataURL = canvas.toDataURL();

    // TODO: send this to backend
    return dataURL;
  };

  showState = () => {
    if (this.state.connecting) {
      return (
        <div className={styles.status}>
          <p>Establishing connection...</p>
        </div>
      );
    } else if (this.state.waiting) {
      return (
        <div className={styles.status}>
          <p>Waiting for someone...</p>
        </div>
      );
    } else if (this.state.full) {
      return (
        <div className={styles.status}>
          <p>Room is full</p>
        </div>
      );
    } else {
      return <div></div>;
    }
  };

  render() {
    return (
      <div style={{ width: "92vh", alignItems: "center", display: "flex" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div className={styles.counterContainer}>
            <Typography
              style={{ fontWeight: 700, fontSize: "6.7em", color: "#A49EA6" }}
            >
              {this.state.countdown}
            </Typography>

            {!this.state.roundStart && this.state.initiator && (
              <Button
                color="primary"
                variant="contained"
                disabled={this.state.connecting || this.state.waiting}
                onClick={this.startRound}
              >
                Start Round
              </Button>
            )}
          </div>
          <div className={styles.relative}>
            <div className={styles.userInfo}>
              <div>
                <Typography>
                  <b>{this.state.localName}</b>
                </Typography>
              </div>
              <div>score: {this.state.localWins}</div>
            </div>
            {!this.state.connecting && !this.state.waiting ? (
              <div className={styles.relative}>
                <div className={styles.guestInfo}>
                  <div>
                    <Typography>
                      <b>{this.state.remoteName}</b>
                    </Typography>
                  </div>
                  <div>score: {this.state.remoteWins}</div>
                </div>
              </div>
            ) : null}
          </div>
          <video
            autoPlay
            id="localVideo"
            muted
            ref={(video) => (this.localVideo = video)}
            style={{ width: "100%", maxHeight: "100%" }}
          />
          <video
            autoPlay
            className={`${
              this.state.connecting || this.state.waiting ? "hide" : ""
            } ${styles.guestVideo}`}
            id="remoteVideo"
            ref={(video) => (this.remoteVideo = video)}
            style={{ width: "100%", maxHeight: "100%" }}
          />
          <this.showState></this.showState>
        </div>
      </div>
    );
  }
}
</script>
export default Video;
