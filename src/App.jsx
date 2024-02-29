import { useEffect, useRef, useState } from "react";
import { get, put } from "./utils/Requests";
import Game from "./Game";
import GameMenu from "./GameMenu";
import Ping from "./Ping";
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
  const [playerInfos, setPlayerInfos] = useState({
    name: "",
    uuid: "",
  });

  const [inGame, setInGame] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [playingInLobbyID, setPlayingInLobbyID] = useState(-1);
  const [nbPlayers, setNbPlayers] = useState(0);
  const [lobbiesStatus, setLobbiesStatus] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const [socket, setSocket] = useState();
  const [globalChat, setGlobalChat] = useState([]);
  const [lobbyChat, setLobbyChat] = useState([]);

  const [eventData, setEventData] = useState("");
  const [nbEventData, setNbEventData] = useState(0); // if 2 events are the same ("/pong"), they wont be trigger useEffect

  // todo : group all api "route" under a file

  useEffect(() => {
    const restoreSession = async () => {
      const strPlayerData = window.localStorage.getItem("playerInfos");
      const playerData = JSON.parse(strPlayerData);
      if (playerData === null) {
        try {
          const newPlayer = await get(`/players/new`);
          setPlayerInfos(newPlayer);
          console.log(newPlayer);
          window.localStorage.setItem("playerInfos", JSON.stringify(newPlayer));
        } catch (error) {
          console.log("requestNewPlayer error : " + error);
        }
      } else {
        console.log(JSON.parse(strPlayerData));
        setPlayerInfos(JSON.parse(strPlayerData));
      }
    };

    restoreSession();
  }, []);

  document.onclick = () => console.log(playerInfos);

  useEffect(() => {
    if (playerInfos.name != "" && playerInfos.uuid != "") {
      console.log("OPENING new connection");
      const s = new WebSocket(`${envData.websocketURL}${playerInfos.uuid}`);
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
  }, [playerInfos]);

  const onmessage = (event) => {
    console.log("event", event);
    setEventData(event.data);
    setNbEventData((val) => val + 1);
    if (event.data.startsWith("/gameStarted")) {
      setInGame(true);
    } else if (event.data.startsWith("/lobbiesGeneralUpdate")) {
      setLobbiesStatus(JSON.parse(event.data.split(" ")[1]).lobbies);
      setNbPlayers(
        JSON.parse(event.data.split(" ")[1]).total_players_connected
      );
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

  return inGame ? (
    <div className="frontPage">
      <h1 className="appTitle">Captain.io</h1>
      <Ping
        socket={socket}
        isConnected={isConnected}
        eventData={eventData}
        nbEventData={nbEventData}
      />
      <Game socket={socket} eventData={eventData} nbEventData={nbEventData} />
      <Chats
        socket={socket}
        playingInLobbyID={playingInLobbyID}
        globalChat={globalChat}
        lobbyChat={lobbyChat}
      />
    </div>
  ) : (
    <div className="frontPage">
      <h1 className="appTitle">Captain.io</h1>
      <Ping
        socket={socket}
        isConnected={isConnected}
        eventData={eventData}
        nbEventData={nbEventData}
      />
      <GameMenu
        socket={socket}
        nbPlayers={nbPlayers}
        playerInfos={playerInfos}
        setPlayerInfos={setPlayerInfos}
        lobbiesStatus={lobbiesStatus}
        currentTime={currentTime}
      />
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
