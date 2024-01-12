import { useState, useEffect, useRef } from 'react'
import './App.css'
import { get, put } from "./utils/requests.js";

const envData = {
  apiURL:
    process.env.NODE_ENV === "production" ? "https://api.lemgo.io" : "http://localhost:8080",
};
export { envData };

function App() {
  const [playerUUID, setPlayerUUID] = useState("")
  const [nbUsers, setNbUsers] = useState(0)
  const [lobbiesStatus, setLobbiesStatus] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [latency, setLatency] = useState(0)
  const [latencyCheckStart, setLatencyCheckStart] = useState(0)
  const latencyRef = useRef(latencyCheckStart);
  const [socket, setSocket] = useState()


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
    console.log("NEW WEBSOCKET")
    const s = new WebSocket("ws://127.0.0.1:8080/ws/" + playerUUID)
    s.addEventListener("open", (event) => {
      setSocket(s)
      setIsConnected(true)
      console.log("Connection established, ", s)
    })
    s.onmessage = onmessage

    s.addEventListener("close", (event) => {
      setIsConnected(false)
      console.log("connection closed ", event.data, isConnected)
    })
    s.addEventListener("error", (event) => {
      console.log("connection error ", event.data)
    })
  }
  }, [playerUUID])

  const onmessage = event => {
    console.log("event", event)
    if (event.data.startsWith("/pong")) {
      setLatency(Date.now() - latencyRef.current)
    } else if (event.data.startsWith("/nbUsersConnected")) {
      setNbUsers(event.data.split(" ")[1])
    } else if (event.data.startsWith("/lobbiesUpdate")) {
      setLobbiesStatus(JSON.parse(event.data.split(" ")[1]).lobbies)
    }
  }

  useEffect(() => {
    if (socket && isConnected) {
      const interval = setInterval(() => {
        ping()
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected, socket]);


  const ping = () => {
    latencyRef.current = Date.now()
    socket.send("/ping ")
  }
  const move = () => socket.send("/move aMove")
  const joinLobby = id => socket.send("/joinlobby " + id)
  
  document.onclick = async () => {
    try {
      await put(`/players/${playerUUID}`, undefined, {
        username: "sylvain"
      });
    } catch (error) {
      console.log("set username error : " + error);
    }
  }

  return (
    <>
      <div className="card">
        <div> nb users {nbUsers}</div>
        <button onClick={() => ping()}>
           ping
        </button>
        <button onClick={() => move()}>
           move
        </button>
        <div>latency {latency}</div>
        <div>player {playerUUID}</div>
        <div>
          {lobbiesStatus.map((lobby, id) => 
          <div>
            <div> {lobby.status}, {lobby.nb_users}</div>
            <button onClick={() => joinLobby(id)}>
              join lobby
            </button>
         </div>
          )}
        </div>
        {/* TODO :Connection status : connected/reconnecting */}
      </div>
    </>
  )
}

export default App
