import { useEffect, useState } from "react";

const BIRD_SIZE = 20;
const GAME_WIDTH = 500;
const GAME_HEIGHT = 500;
const GRAVITY = 6;
const JUMP_HEIGHT = 100;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_GAP = 150;

export default function FlappyBird() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [topObstacleHeight, setTopObstacleHeight] = useState(200);
  const [obstacleLeft, setObstacleLeft] = useState(GAME_WIDTH - OBSTACLE_WIDTH);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([]);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [birdHasCollided, setBirdHasCollided] = useState(false);

  // Update the bird's position
  useEffect(() => {
    let timeId: NodeJS.Timer;
    if (gameInProgress && birdPosition < GAME_HEIGHT - BIRD_SIZE) {
      timeId = setInterval(() => {
        setBirdPosition((birdPosition) => birdPosition + GRAVITY);
      }, 24);
    }

    return () => {
      clearInterval(timeId);
    };
  }, [birdPosition, gameInProgress]);

  // Update the top obstacle height and the bottom obstacle height
  // and the obstacles' position
  const bottomObstacleHeight = GAME_HEIGHT - OBSTACLE_GAP - topObstacleHeight;
  useEffect(() => {
    let obstacleId: NodeJS.Timer;
    if (gameInProgress && obstacleLeft >= -OBSTACLE_WIDTH) {
      obstacleId = setInterval(() => {
        setObstacleLeft((obstacleLeft) => obstacleLeft - 5);
      }, 24);

      return () => {
        clearInterval(obstacleId);
      };
    } else {
      setObstacleLeft(GAME_WIDTH - OBSTACLE_WIDTH);
      setTopObstacleHeight(
        Math.floor(Math.random() * (GAME_HEIGHT - OBSTACLE_GAP))
      );
      setScore((score) => score + 1);
    }
  }, [gameInProgress, obstacleLeft]);

  // Detect if the bird has collided with the obstacles
  useEffect(() => {
    const hasCollidedWithTopObstacle =
      birdPosition >= 0 && birdPosition < topObstacleHeight;
    const hasCollidedWithBottomObstacle =
      birdPosition <= 500 && birdPosition >= 500 - bottomObstacleHeight;

    if (
      obstacleLeft >= 0 &&
      obstacleLeft <= OBSTACLE_WIDTH &&
      (hasCollidedWithTopObstacle || hasCollidedWithBottomObstacle)
    ) {
      setBirdHasCollided(true);
    }
  }, [birdPosition, topObstacleHeight, bottomObstacleHeight, obstacleLeft]);

  // Cause the game to end if the bird has collided with the obstacles
  // Also saves the score of the game session that just ended and
  // fetches the high scores of the game
  useEffect(() => {
    const endGame = async () => {
      await fetch("/api/scores", {
        method: "POST",
        body: JSON.stringify({ score }),
      });
      setGameInProgress(false);
      setScore(0);
      setBirdPosition(250);
    };

    const getHighScores = async () => {
      const response = await fetch("/api/scores", {
        method: "GET",
      });
      const json = await response.json();
      return json.data;
    };
    if (birdHasCollided && gameInProgress) {
      setGameInProgress(false);
      endGame().then(() =>
        getHighScores().then((scores) => {
          setHighScores(scores);
        })
      );
    }
  }, [birdHasCollided, gameInProgress]);

  // Function that makes the bird "jump"
  const handleClick = () => {
    let newBirdPosition = birdPosition - JUMP_HEIGHT;
    if (!gameInProgress) {
      setGameInProgress(true);
      setBirdHasCollided(false);
      setScore(0);
      setBirdPosition(250);
    } else if (newBirdPosition < 0) {
      setBirdPosition(0);
    } else {
      setBirdPosition(newBirdPosition);
    }
  };

  return (
    <div>
      <div
        style={{ display: "flex", width: "100%", justifyContent: "center" }}
        onClick={handleClick}
      >
        {/*HTML Element That Represents The Game Background*/}
        <div
          style={{
            backgroundColor: "white",
            height: `${GAME_HEIGHT}px`,
            width: `${GAME_WIDTH}px`,
          }}
        >
          {/*HTML Element That Represents The Top Obstacle*/}
          <div
            style={{
              width: `${OBSTACLE_WIDTH}px`,
              height: `${topObstacleHeight}px`,
              left: `${obstacleLeft}px`,
              top: "0px",
              position: "relative",
              backgroundColor: "green",
            }}
          />

          {/*HTML Element That Represents The Bottom Obstacle*/}
          <div
            style={{
              width: `${OBSTACLE_WIDTH}px`,
              height: `${bottomObstacleHeight}px`,
              left: `${obstacleLeft}px`,
              top: `${
                GAME_HEIGHT - (topObstacleHeight + bottomObstacleHeight)
              }px`,
              position: "relative",
              backgroundColor: "green",
            }}
          />
          {/*HTML Element That Represents the Bird*/}
          <div
            style={{
              position: "absolute",
              backgroundColor: "red",
              height: `${BIRD_SIZE}px`,
              width: `${BIRD_SIZE}px`,
              borderRadius: "100%",
              top: `${birdPosition}px`,
            }}
          />
        </div>
        {/* Show the current score when the game is in progress */}
        {gameInProgress && (
          <span className={"text-black text-lg absolute"}> {score} </span>
        )}
        {/* Show the high scores when the game is paused */}
        {!gameInProgress && (
          <div className={"absolute text-black text-center"}>
            <p className={"font-bold"}> High scores </p>
            {highScores?.map((score, index) => (
              <div key={index}>
                <span className={"text-black text-lg"}> {score} </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
