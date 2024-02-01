import { useEffect, useRef, useState } from "react";

const Chats = ({ socket, playingInLobbyID, globalChat, lobbyChat }) => {
  const [newGlobalMessage, setNewGlobalMessage] = useState("");
  const [newLobbyMessage, setNewLobbyMessage] = useState("");

  const sendNewGlobalMessage = (event) => {
    event.preventDefault();
    socket.send("/sendGlobalMessage " + newGlobalMessage);
    setNewGlobalMessage("");
  };
  const sendNewLobbyMessage = (event) => {
    event.preventDefault();
    if (playingInLobbyID != -1) {
      socket.send(
        "/sendLobbyMessage " + playingInLobbyID + " " + newLobbyMessage
      );
      setNewLobbyMessage("");
    }
  };

  return (
    <>
      <div className="globalChat">
        <div className="messagesList" id="globalMessages">
          {globalChat.map((message, idMessage) => (
            <div> message: {message.message} </div>
          ))}
        </div>
        <form className="formPostMessage" onSubmit={sendNewGlobalMessage}>
          <input
            className="chatText"
            type="text"
            placeholder="new message"
            value={newGlobalMessage}
            onChange={(e) => setNewGlobalMessage(e.target.value)}
            required
          />
          <input className="postMessageBtn" type="submit" value="Send" />
        </form>
      </div>
      <div className="lobbyChat">
        {playingInLobbyID !== -1 ? (
          <>
            <div className="messagesList" id="lobbyMessages">
              {lobbyChat.map((message, idMessage) => (
                <div> message: {message.message} </div>
              ))}
            </div>
            <form className="formPostMessage" onSubmit={sendNewLobbyMessage}>
              <input
                className="chatText"
                type="text"
                placeholder="new message"
                value={newLobbyMessage}
                onChange={(e) => setNewLobbyMessage(e.target.value)}
                required
              />
              <input className="postMessageBtn" type="submit" value="Send" />
            </form>
          </>
        ) : null}
      </div>
    </>
  );
};

export default Chats;
