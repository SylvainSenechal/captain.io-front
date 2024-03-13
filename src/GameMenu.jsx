import { useEffect, useRef, useState } from "react";
import { get, put, post } from "./utils/Requests";

// todo : add button to clear cache and recreate an account ?

const GameMenu = ({
  socket,
  nbPlayers,
  playerInfos,
  setPlayerInfos,
  lobbiesStatus,
  currentTime,
}) => {
  const [updatePlayerName, setUpdatePlayerName] = useState("");
  const [canEditName, setCanEditName] = useState({
    is_valid: false,
    reason: "",
  });

  const updateName = async (event) => {
    event.preventDefault();
    try {
      await put(`/players/${playerInfos.uuid}`, undefined, {
        name: updatePlayerName,
      });
      const newPlayer = { ...playerInfos, name: updatePlayerName };
      socket.close(3333, "updating player name");
      setPlayerInfos(newPlayer);
      setUpdatePlayerName("");
      window.localStorage.setItem("playerInfos", JSON.stringify(newPlayer));
    } catch (error) {
      console.log("updateName error : " + error);
    }
  };

  const requestRandomName = async (event) => {
    event.preventDefault();
    try {
      let newName = await get(`/players/name/random`);
      checkValidPlayerName(newName);
    } catch (error) {
      console.log("requestRandomName error : " + error);
    }
  };

  const checkValidPlayerName = async (newName) => {
    setUpdatePlayerName(newName);
    try {
      setCanEditName(
        await post(`/players/name/is_valid`, null, {
          name: newName,
        })
      );
    } catch (error) {
      console.log("checkValidPlayerName error : " + error);
    }
  };

  const joinLobby = (id) => {
    socket.send("/joinLobby " + id);
  };

  return (
    <div className="main">
      <div> Connected players {nbPlayers}</div>
      <div> playerName {playerInfos.name}</div>
      <form onSubmit={updateName}>
        <label htmlFor="playername"> pick playername </label>
        {canEditName.is_valid || updatePlayerName === "" ? (
          <>
            <input
              id="canEditPlayername"
              type="text"
              name="playername"
              value={updatePlayerName}
              onChange={(e) => checkValidPlayerName(e.target.value)}
              required
            />
            <input type="submit" value="Set" />
            <button
              id="requestRandomName"
              onClick={(e) => requestRandomName(e)}
            >
              random
            </button>
          </>
        ) : (
          <>
            <input
              id="cantEditPlayername"
              type="text"
              name="playername"
              value={updatePlayerName}
              onChange={(e) => checkValidPlayerName(e.target.value)}
              required
            />
            <input disabled type="submit" value="Set" />
            <button
              id="requestRandomName"
              onClick={(e) => requestRandomName(e)}
            >
              random
            </button>
            <div> You can't use this player name : {canEditName.reason} </div>
          </>
        )}
      </form>
      <div className="lobbiesMenu">
        {lobbiesStatus.map((lobby, id) => {
          let startsIn = Math.floor(
            (new Date(lobby.next_starting_time * 1000).getTime() -
              Math.floor(currentTime)) /
              1000
          );
          return (
            <div className="lobbyPresentation">
              {lobby.status !== "AwaitingPlayers" ? (
                <>
                  <div>
                    <span>
                      {startsIn > 0 ? (
                        <>Starting in {startsIn} sec </>
                      ) : (
                        <>In game for {Math.abs(startsIn)} sec </>
                      )}
                    </span>
                    <span>
                      [{lobby.nb_connected} / {lobby.player_capacity}]{" "}
                    </span>
                  </div>

                  <button
                    className="buttonForbidden"
                    onClick={() => joinLobby(id)}
                  >
                    Join Lobby
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <span> {lobby.status} </span>
                    <span>
                      [{lobby.nb_connected} / {lobby.player_capacity}]
                    </span>
                  </div>
                  <button
                    className="buttonJoinLobby"
                    onClick={() => joinLobby(id)}
                  >
                    Join Lobby
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameMenu;
