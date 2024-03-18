const PlayerList = ({ connectedPlayerNames }) => {
  return (
    <div class="connectedPlayer">
      <b> Connected players</b>
      <table className="playerList">
        <tr>
          <th id="thPlayername">Player name</th>
          <th id="thLobby">Lobby</th>
        </tr>
        {connectedPlayerNames.map((player) => {
          return (
            <>
              <tr>
                <td>{player[0]}</td>
                <td>{player[1]}</td>
              </tr>
            </>
          );
        })}
      </table>
    </div>
  );
};

export default PlayerList;
