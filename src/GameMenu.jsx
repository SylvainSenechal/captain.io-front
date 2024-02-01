const GameMenu = () => {
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
    </div>
  );
};

export default GameMenu;
