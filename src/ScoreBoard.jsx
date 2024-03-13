import { useEffect, useRef, useState } from "react";

const ScoreBoard = ({ scoreBoard }) => {
  scoreBoard.sort((p1, p2) => {
    if (p1.total_positions < p2.total_positions) {
      return 1;
    } else if (p1.total_positions > p2.total_positions) {
      return -1;
    }

    if (p1.total_troops < p2.total_troops) {
      return 1;
    } else if (p1.total_troops > p2.total_troops) {
      return -1;
    }

    if (p1.player_name < p2.player_name) {
      return -1;
    } else if (p1.player_name > p2.player_name) {
      return 1;
    }
    return 0;
  });
  return (
    <table className="scoreBoard">
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Positions</th>
        <th>Troops</th>
      </tr>
      {scoreBoard.map((score, rank) => {
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
