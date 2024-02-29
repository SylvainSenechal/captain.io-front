import { useEffect, useRef, useState } from "react";

const ScoreBoard = ({ scoreBoard }) => {
  return (
    <table className="scoreBoard">
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Positions</th>
        <th>Troops</th>
      </tr>
      {scoreBoard
        .sort((a, b) => (a.total_troops < b.total_troops ? 1 : -1)) // todo : deal with troop1==troop2
        .map((score, rank) => {
          return (
            <tr>
              <td>{rank + 1}</td>
              <td style={{ background: score.color }}>
                {score.player_name.substring(0, 4)}
              </td>
              <td>{score.total_positions}</td>
              <td>{score.total_troops}</td>
            </tr>
          );
        })}
    </table>
  );
};

export default ScoreBoard;
