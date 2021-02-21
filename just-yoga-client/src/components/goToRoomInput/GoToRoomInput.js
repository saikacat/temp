import React, { useState } from "react";
import shortId from "shortid";

const goToRoom = (history, roomId, name) => {
  history.push(`/${roomId}?name=${name}`);
};

export function GoToRoomInput({ history }) {
  let [name, setName] = useState("");
  let [roomId, setRoomId] = useState(shortId.generate());

  return (
    <div className="enter-room-container">
      <form>
      <input
          type="text"
          value={name}
          placeholder="name"
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <input
          type="text"
          value={roomId}
          placeholder="Room id"
          onChange={(event) => {
            setRoomId(event.target.value);
          }}
        />
        <button
          onClick={() => {
            goToRoom(history, roomId, name);
          }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}
