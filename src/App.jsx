import { useEffect, useRef, useState } from "react";
import "./App.css";
import "./Chats.css";
import { get, put } from "./utils/Requests";
import Game from "./Game";
import GameMenu from "./GameMenu";
import Chats from "./Chats";

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
  const [inGame, setInGame] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [playerUUID, setPlayerUUID] = useState("");
  const [updatePlayerName, setUpdatePlayerName] = useState("");
  const [playingInLobbyID, setPlayingInLobbyID] = useState(-1);
  const [nbUsers, setNbUsers] = useState(0);
  const [lobbiesStatus, setLobbiesStatus] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [latencyCheckStart, setLatencyCheckStart] = useState(0);
  const latencyRef = useRef(latencyCheckStart);
  const [socket, setSocket] = useState();
  const [globalChat, setGlobalChat] = useState([]);
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
    } else if (event.data.startsWith("/gameStarted")) {
      setInGame(true);
    } else if (event.data.startsWith("/lobbiesGeneralUpdate")) {
      setLobbiesStatus(JSON.parse(event.data.split(" ")[1]).lobbies);
      setNbUsers(JSON.parse(event.data.split(" ")[1]).total_users_connected);
    } else if (event.data.startsWith("/lobbyJoined")) {
      setPlayingInLobbyID(event.data.split(" ")[1]);
    } else if (event.data.startsWith("/globalChatSync")) {
      setGlobalChat(JSON.parse(event.data.substring(16)));
      scrollGlobalBottom("globalMessages");
    } else if (event.data.startsWith("/globalChatNewMessage")) {
      setGlobalChat((previousChat) => [
        ...previousChat,
        JSON.parse(event.data.substring(22)),
      ]);
      scrollGlobalBottom("globalMessages");
    } else if (event.data.startsWith("/lobbyChatSync")) {
      setLobbyChat(JSON.parse(event.data.substring(15)));
      scrollGlobalBottom("lobbyMessages");
    } else if (event.data.startsWith("/lobbyChatNewMessage")) {
      setLobbyChat((previousChat) => [
        ...previousChat,
        JSON.parse(event.data.substring(21)),
      ]);
      scrollGlobalBottom("lobbyMessages");
    }
  };
  const scrollGlobalBottom = (idMessagesList) => {
    // Scroll to the bottom of the messages list
    // todo : not scrolling completely at the bottom..
    // todo : not working when loading messages list for the first time
    const messageDiv = document.getElementById(idMessagesList);
    const messagesDivViewHeight = messageDiv.clientHeight; // The height that we can view
    const messagesDivHeight = messageDiv.scrollHeight; // The height if we could view the whole div with a big monitor
    messageDiv.scroll(0, messagesDivHeight - messagesDivViewHeight);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      const interval = setInterval(() => {
        ping();
        // todo : detect when pong is not sent back = disconnected, otherwise it just doesnt show
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isConnected, socket]);

  const ping = () => {
    latencyRef.current = Date.now();
    socket.send("/ping ");
  };
  const joinLobby = (id) => socket.send("/joinLobby " + id);

  const updateUsername = async (event) => {
    event.preventDefault();
    try {
      await put(`/players/${playerUUID}`, undefined, {
        username: updatePlayerName,
      });
      setUpdatePlayerName("");
      // todo : get response new username if ok
    } catch (error) {
      console.log("set username error : " + error);
    }
  };

  return inGame ? (
    <>
      <Game />
      <Chats
        socket={socket}
        playingInLobbyID={playingInLobbyID}
        globalChat={globalChat}
        lobbyChat={lobbyChat}
      />
    </>
  ) : (
    <div className="frontPage">
      <h1 className="appTitle">Captain.io</h1>
      <div className="ping">
        <button onClick={() => ping()}>ping</button>
        <div>latency {latency}</div>
      </div>
      <div className="main">
        <div> nb users {nbUsers}</div>
        <div>player {playerUUID}</div>
        <form onSubmit={updateUsername}>
          <label htmlFor="username"> pick username </label>
          <input
            type="text"
            name="username"
            value={updatePlayerName}
            onChange={(e) => setUpdatePlayerName(e.target.value)}
            required
          />
          <input type="submit" value="Send" />
        </form>
        {lobbiesStatus.map((lobby, id) => {
          return (
            <div className="lobbyPresentation">
              {lobby.status !== "AwaitingUsers" ? (
                <div>
                  {lobby.status}, {lobby.nb_connected} / {lobby.player_capacity}
                  {Math.floor(
                    (new Date(lobby.next_starting_time * 1000).getTime() -
                      Math.floor(currentTime)) /
                      1000
                  )}
                  <button
                    className="buttonForbidden"
                    onClick={() => joinLobby(id)}
                  >
                    join lobby
                  </button>
                </div>
              ) : (
                <div>
                  {lobby.status}, {lobby.nb_connected} / {lobby.player_capacity}
                  <button
                    className="buttonJoinLobby"
                    onClick={() => joinLobby(id)}
                  >
                    join lobby
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Chats
        socket={socket}
        playingInLobbyID={playingInLobbyID}
        globalChat={globalChat}
        lobbyChat={lobbyChat}
      />
    </div>
  );
}

export default App;
