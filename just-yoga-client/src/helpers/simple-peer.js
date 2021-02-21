import Peer from "simple-peer";

export default class VideoCall {
  peer = null;
  init = (stream, initiator) => {
    this.peer = new Peer({
      initiator: initiator,
      stream: stream,
      trickle: false,
      reconnectTimer: 1000,
      iceTransportPolicy: "relay",
      config: {
        iceServers: [
          {
            urls: "stun:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683"
        },
        {
            urls: "turn:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683"
        }
        ],
      },
    });
    return this.peer;
  };
  connect = (otherId) => {
    console.log("NEW ID");
    this.peer.signal(otherId);
  };
}
