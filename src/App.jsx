import { useEffect, useRef, useState } from "react";
import "./App.css";
import { get, put } from "./utils/Requests";

const envData = {
  apiURL:
    process.env.NODE_ENV === "production"
      ? "https://api.lemgo.io"
      : "http://localhost:8080",
  websocketURL:
    process.env.NODE_ENV === "production"
      ? "wss://api.lemgo.io/ws/"
      : "ws://127.0.0.1:8080/ws/",
};
export { envData };

function App() {
  const [playerUUID, setPlayerUUID] = useState("");
  const [playingInLobbyID, setPlayingInLobbyID] = useState(-1);
  const [nbUsers, setNbUsers] = useState(0);
  const [lobbiesStatus, setLobbiesStatus] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [latencyCheckStart, setLatencyCheckStart] = useState(0);
  const latencyRef = useRef(latencyCheckStart);
  const [socket, setSocket] = useState();
  const [newGlobalMessage, setNewGlobalMessage] = useState("");
  const [globalChat, setGlobalChat] = useState([]);
  const [newLobbyMessage, setNewLobbyMessage] = useState("");
  const [lobbyChat, setLobbyChat] = useState([]);

  useEffect(() => {
    const requestPlayerUUID = async () => {
      try {
        setPlayerUUID(await get(`/players/uuid`));
      } catch (error) {
        console.log("getPlayerUUID error : " + error);
      }
    };
    requestPlayerUUID();
  }, []);

  useEffect(() => {
    if (playerUUID != "") {
      console.log("NEW WEBSOCKET");
      console.log("NEW WEBSOCKET");
      console.log("NEW WEBSOCKET");

      const s = new WebSocket(`${envData.websocketURL}${playerUUID}`);
      s.addEventListener("open", (event) => {
        setSocket(s);
        setIsConnected(true);
        console.log("Connection established, ", s);
      });
      s.onmessage = onmessage;

      s.addEventListener("close", (event) => {
        setIsConnected(false);
        console.log("connection closed ", event.data, isConnected);
      });
      s.addEventListener("error", (event) => {
        console.log("connection error ", event.data);
      });
    }
  }, [playerUUID]);

  const onmessage = (event) => {
    console.log("event", event);
    if (event.data.startsWith("/pong")) {
      setLatency(Date.now() - latencyRef.current);
    } else if (event.data.startsWith("/lobbiesUpdate")) {
      setLobbiesStatus(JSON.parse(event.data.split(" ")[1]).lobbies);
      setNbUsers(JSON.parse(event.data.split(" ")[1]).total_users_connected);
      console.log(JSON.parse(event.data.split(" ")[1]).lobbies);
    } else if (event.data.startsWith("/lobbyJoined")) {
      setPlayingInLobbyID(event.data.split(" ")[1]);
    } else if (event.data.startsWith("/globalChatSync")) {
      console.log("ok 1");
      setGlobalChat(JSON.parse(event.data.substring(16)));
    } else if (event.data.startsWith("/globalChatNewMessage")) {
      setGlobalChat((previousChat) => [
        ...previousChat,
        JSON.parse(event.data.substring(22)),
      ]);
    } else if (event.data.startsWith("/lobbyChatSync")) {
      console.log(JSON.parse(event.data.substring(15)));
      setLobbyChat(JSON.parse(event.data.substring(15)));
    } else if (event.data.startsWith("/lobbyChatNewMessage")) {
      console.log(JSON.parse(event.data.substring(21)));
      setLobbyChat((previousChat) => [
        ...previousChat,
        JSON.parse(event.data.substring(21)),
      ]);
    }
  };

  useEffect(() => {
    if (socket && isConnected) {
      const interval = setInterval(() => {
        ping();
        // todo : detect when pong is not sent back = disconnected, otherwise it just doesnt show
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected, socket]);

  const ping = () => {
    latencyRef.current = Date.now();
    socket.send("/ping ");
  };
  const joinLobby = (id) => socket.send("/joinlobby " + id);
  const sendNewLobbyMessage = () => {
    if (playingInLobbyID != -1) {
      socket.send(
        "/sendLobbyMessage " + playingInLobbyID + " " + newLobbyMessage
      );
      setNewLobbyMessage("");
    }
  };
  const sendNewGlobalMessage = () => {
    socket.send("/sendGlobalMessage " + newGlobalMessage);
    setNewGlobalMessage("");
  };

  document.onclick = async () => {
    console.log(lobbyChat);
    try {
      await put(`/players/${playerUUID}`, undefined, {
        username: "sylvain",
      });
    } catch (error) {
      console.log("set username error : " + error);
    }
  };

  return (
    <div className="frontPage">
      <h1 className="appTitle">Captain.io</h1>
      <div className="ping">
        <button onClick={() => ping()}>ping</button>
        <div>latency {latency}</div>
      </div>
      <div className="main">
        <div> nb users {nbUsers}</div>
        <div>player {playerUUID}</div>
        {lobbiesStatus.map((lobby, id) => {
          return (
            <div className="lobbyPresentation">
              <div>
                {lobby.status}, {lobby.nb_users}
              </div>
              <button onClick={() => joinLobby(id)}>join lobby</button>
            </div>
          );
        })}
        {/* TODO :Connection status : connected/reconnecting */}
      </div>
      <div className="globalChat">
        <label>
          New message:
          <input
            type="text"
            value={newGlobalMessage}
            onChange={(e) => setNewGlobalMessage(e.target.value)}
          />
          <button onClick={() => sendNewGlobalMessage()}>send</button>
        </label>
        {globalChat.map((message, idMessage) => (
          <div> message: {message.message} </div>
        ))}
      </div>
      <div className="lobbyChat">
        {playingInLobbyID !== -1 ? (
          <div>
            <label>
              New lobby message:
              <input
                type="text"
                value={newLobbyMessage}
                onChange={(e) => setNewLobbyMessage(e.target.value)}
              />
              <button onClick={() => sendNewLobbyMessage()}>send</button>
            </label>
            {lobbyChat.map((message, idMessage) => (
              <div> message: {message.message} </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
  ``;
}

export default App;
