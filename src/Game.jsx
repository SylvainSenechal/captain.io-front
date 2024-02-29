import { useEffect, useRef, useState } from "react";
import ScoreBoard from "./ScoreBoard";

const Game = ({ socket, eventData, nbEventData }) => {
  const [game, setGame] = useState({
    board_game: [[]],
  });
  const [scoreBoard, setScoreBoard] = useState([]);

  // const [canvas, setCanvas] = useState(document.getElementById("gameCanvas"));
  // const [ctx, setCtx] = useState(canvas.getContext("2d"));

  useEffect(() => {
    if (eventData.startsWith("/gameUpdate")) {
      console.log(eventData);
      setGame(JSON.parse(eventData.substring(12)));
      const canvas = document.getElementById("myCanvas");
      const ctx = canvas.getContext("2d");
      ctx.font = "30px Arial";
      const GRID_SIZE = 50;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let newScoreBoard = [];
      if (game.score_board != undefined) {
        for (const [key, value] of Object.entries(game.score_board)) {
          newScoreBoard.push({
            player_name: key,
            total_troops: value.total_troops,
            total_positions: value.total_positions,
            color: value.color,
          });
        }
      }
      console.log("newwww ", newScoreBoard);
      setScoreBoard(newScoreBoard);

      for (let i = 0; i < game.board_game.length; i++) {
        for (let j = 0; j < game.board_game[i].length; j++) {
          if (game.board_game[i][j].status === "Empty") {
            ctx.strokeRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);
          } else if (game.board_game[i][j].status === "Occupied") {
            ctx.fillRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.strokeStyle = "black";
            if (game.board_game[i][j].tile_type === "Kingdom") {
              ctx.beginPath();
              ctx.arc(
                i * GRID_SIZE + GRID_SIZE / 2,
                j * GRID_SIZE + GRID_SIZE / 2,
                GRID_SIZE / 1,
                0,
                2 * Math.PI
              );
              ctx.stroke();
            }
            ctx.fillStyle =
              game.score_board[game.board_game[i][j].player_name].color;

            ctx.fillText(
              game.board_game[i][j].nb_troops,
              i * GRID_SIZE + 15,
              j * GRID_SIZE + 35
            );
            ctx.fillStyle = "black";
          }
        }
      }
    }
  }, [eventData, nbEventData]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
          socket.send("/move up");
          break;
        case "ArrowDown":
          socket.send("/move down");
          break;
        case "ArrowLeft":
          socket.send("/move left");
          break;
        case "ArrowRight":
          socket.send("/move right");
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // todo : may need to bind to socket, if socket is disconnected and reconnected
  }, []);

  // const canvas = document.getElementById("gameCanvas");
  // const ctx = canvas.getContext("2d");
  // console.log("canvas :: ", canvas);
  // console.log("canvas :: ", ctx);
  // ctx.canvas.width = window.innerWidth
  // ctx.canvas.height = window.innerHeight

  return (
    <>
      <div className="main">
        {/* <canvas id="gameCanvas"> </canvas> */}
        <canvas
          id="myCanvas"
          width={400}
          height={400}
          style={{ border: "1px solid black" }}
        ></canvas>
      </div>
      <ScoreBoard scoreBoard={scoreBoard} />
    </>
  );
};

export default Game;
