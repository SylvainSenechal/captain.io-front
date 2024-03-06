import { useEffect, useRef, useState } from "react";
import ScoreBoard from "./ScoreBoard";

const Game = ({ socket, eventData, nbEventData, images }) => {
  const [game, setGame] = useState({
    board_game: [[]],
  });
  const [scoreBoard, setScoreBoard] = useState([]);
  const [canvas, setCanvas] = useState({});
  const [canvasSetup, setCanvasSetup] = useState(false);
  const GRID_SIZE = 30;

  useEffect(() => {
    const canvasElement = document.getElementById("myCanvas");
    const ctx = canvasElement.getContext("2d");
    setCanvas({
      canvas: canvasElement,
      ctx: ctx,
    });
  }, []);

  useEffect(() => {
    if (eventData.startsWith("/gameUpdate")) {
      canvas.ctx.canvas.width = game.board_game.length * GRID_SIZE;
      canvas.ctx.canvas.height = game.board_game[0].length * GRID_SIZE;
      canvas.ctx.font = "13px Arial";
      canvas.ctx.textAlign = "center";
      canvas.ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

      setGame(JSON.parse(eventData.substring(12)));

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

      setScoreBoard(newScoreBoard);
      for (let i = 0; i < game.board_game.length; i++) {
        for (let j = 0; j < game.board_game[i].length; j++) {
          // 1. Draw grid
          canvas.ctx.strokeRect(
            i * GRID_SIZE,
            j * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
          );
          // 2. Draw background color
          if (game.board_game[i][j].status === "Occupied") {
            const color =
              game.score_board[game.board_game[i][j].player_name].color;
            if (color == "Grey") {
              canvas.ctx.fillStyle = "rgba(125, 125, 125, 0.3)";
            } else if (color === "Red") {
              canvas.ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            } else if (color === "Blue") {
              canvas.ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
            } else if (color === "Pink") {
              canvas.ctx.fillStyle = "rgba(255, 0, 255, 0.3)";
            }
            canvas.ctx.fillRect(
              i * GRID_SIZE,
              j * GRID_SIZE,
              GRID_SIZE,
              GRID_SIZE
            );
          }
          // 3. Draw tile type
          if (game.board_game[i][j].tile_type === "Kingdom") {
            canvas.ctx.drawImage(
              images.crown,
              i * GRID_SIZE,
              j * GRID_SIZE,
              GRID_SIZE,
              GRID_SIZE
            );
          } else if (game.board_game[i][j].tile_type === "Mountain") {
            canvas.ctx.drawImage(
              images.mountain,
              i * GRID_SIZE,
              j * GRID_SIZE,
              GRID_SIZE,
              GRID_SIZE
            );
          } else if (game.board_game[i][j].tile_type === "Castle") {
            canvas.ctx.drawImage(
              images.castle,
              i * GRID_SIZE,
              j * GRID_SIZE,
              GRID_SIZE,
              GRID_SIZE
            );
          }
          // 4. Draw troops quantity
          if (
            game.board_game[i][j].status === "Occupied" ||
            game.board_game[i][j].tile_type === "Castle"
          ) {
            canvas.ctx.fillStyle = "white";
            canvas.ctx.fillText(
              game.board_game[i][j].nb_troops,
              i * GRID_SIZE + GRID_SIZE / 2,
              j * GRID_SIZE + GRID_SIZE / 2
            );
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

  return (
    <>
      <div className="main">
        <canvas id="myCanvas"></canvas>
      </div>
      <ScoreBoard scoreBoard={scoreBoard} />
    </>
  );
};

export default Game;
