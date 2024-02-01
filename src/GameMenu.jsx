import { useEffect, useRef, useState } from "react";

const GameMenu = ({
  socket,
  nbUsers,
  playerUUID,
  lobbiesStatus,
  currentTime,
}) => {
  const [updatePlayerName, setUpdatePlayerName] = useState("");

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

  const joinLobby = (id) => {
    console.log("koin lobby");
    socket.send("/joinLobby " + id);
  };

  return (
    <>
      <h1 className="appTitle">Captain.io</h1>
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
    </>
  );
};

export default GameMenu;
