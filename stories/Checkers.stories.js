import React from "react";
import "./style.css";

// This is used by Storybook:
export default {
  title: "Checkers"
};

// This is the main app:
export const Checkers = () => {
  return <Board size={400} />;
};

const BoardPiece = {
  Empty: 0,
  Player1Man: 1,
  Player2Man: 2,
  Player1King: 3,
  Player2King: 4
};

const Direction = {
  Up: -1,
  Down: 1,
  Right: 1,
  Left: -1
};

const Player1 = 1;
const Player2 = 2;

const MaxManDistance = 1;

class Board extends React.Component {
  state = {
    board: [
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0]
    ],
    selectedPiece: { x: -1, y: -1 },
    isPieceSelected: false
  };

  getBoardPiece = position => {
    return this.state.board[position.y][position.x];
  };

  isValidKingMove = () => {
    return true;
  };

  isValidMove = (oldPos, newPos) => {
    const piece = this.getBoardPiece(oldPos);
    //If its a king check their movement
    if (piece == BoardPiece.Player1King || piece == BoardPiece.Player2King) {
      return isValidKingMove();
    }
    const playersDirection =
      piece == BoardPiece.Player1Man ? Direction.Down : Direction.Up;
    const deltaX = newPos.x - oldPos.x;
    const deltaY = newPos.y - oldPos.y;
    console.log(`pd: ${playersDirection} delta: ${deltaY}`);
    if (
      this.getBoardPiece(newPos) == BoardPiece.Empty && //can only step onto an empty space
      (deltaX + deltaY) % 2 == 0 && //has to travel on diagonals
      playersDirection == deltaY && //player has to play in their direction
      Math.abs(deltaX) == MaxManDistance && //check max X
      Math.abs(deltaY) == MaxManDistance //check max Y
    ) {
      return true;
    }
    return false;
  };

  movePiece = (oldPos, newPos) => {
    if (this.isValidMove(oldPos, newPos)) {
      let gameBoard = this.state.board; //temp
      gameBoard[newPos.y][newPos.x] = gameBoard[oldPos.y][oldPos.x];
      gameBoard[oldPos.y][oldPos.x] = BoardPiece.Empty;
      this.setState({ board: gameBoard, isPieceSelected: false });
    }
  };

  spaceSelected = space => {
    const spaceSize = this.props.size / 8;
    const spaceX = space.props.x / spaceSize;
    const spaceY = space.props.y / spaceSize;
    if (this.state.isPieceSelected) {
      this.movePiece(this.state.selectedPiece, { x: spaceX, y: spaceY }); //bad format
    }
    console.log("Selected Space:", spaceX, spaceY);
  };

  pieceSelected = piece => {
    console.log(piece);
    const spaceSize = this.props.size / 8;
    const pieceX = Math.floor(piece.props.centerX / spaceSize);
    const pieceY = Math.floor(piece.props.centerY / spaceSize);
    this.setState({
      selectedPiece: { x: pieceX, y: pieceY },
      isPieceSelected: true
    });

    console.log("Selected Piece:", Math.floor(pieceX), Math.floor(pieceY));
  };

  render() {
    const spaceSize = this.props.size / 8;
    const pieceRadius = spaceSize / 2;

    return (
      <svg
        height={this.props.size}
        width={this.props.size}
        viewBox={`0 0 ${this.props.size} ${this.props.size}`}
      >
        {this.state.board.map((row, y) => {
          const isEvenRow = y % 2;
          const spaceY = spaceSize * y;

          return row.map((space, x) => {
            const isEvenSpace = x % 2;
            const spaceX = spaceSize * x;

            return (
              <Space
                key={x}
                shade={
                  (isEvenSpace && !isEvenRow) || (!isEvenSpace && isEvenRow)
                }
                size={spaceSize}
                x={spaceX}
                y={spaceY}
                onClick={this.spaceSelected}
              />
            );
          });
        })}
        {this.state.board.map((row, y) => {
          const spaceY = spaceSize * y;

          return row.map((space, x) => {
            const spaceX = spaceSize * x;

            if (space === BoardPiece.Empty) {
              // The space is empty.
              return null;
            }

            return (
              <Piece
                key={x}
                centerX={spaceX + pieceRadius}
                centerY={spaceY + pieceRadius}
                player={space}
                radius={pieceRadius * 0.75}
                onClick={this.pieceSelected}
              />
            );
          });
        })}
      </svg>
    );
  }
}

class Space extends React.Component {
  clicked = () => {
    this.props.onClick(this);
  };
  render() {
    return (
      <rect
        fill={this.props.shade ? "green" : "lightgray"}
        height={this.props.size}
        width={this.props.size}
        x={this.props.x}
        y={this.props.y}
        onClick={this.clicked}
      />
    );
  }
}

class Piece extends React.Component {
  clicked = () => {
    this.props.onClick(this, this.props.centerX, this.props.centerY);
  };
  render() {
    return (
      <circle
        cx={this.props.centerX}
        cy={this.props.centerY}
        fill={this.props.player === Player1 ? "white" : "red"}
        r={this.props.radius}
        onClick={this.clicked}
      />
    );
  }
}

//https://www.checkershistory.com/a-glossary-of-checkers.html
/* Questions:
  - What is the purpose of the key value in the Piece and the Space class?
  - Are we guaranteed the boards position on the screen? (Is it valid to use postion to determine piece?)
  - so that Player One takes as many turns as possible and then Player Two does the same? (From README 2)(refers to jumps?)
  - there are some unused props like key and radius? Can I modify how these fields are used?
  - Can I be guaranteed that the squares will remain squres?
  - Can I change the value of the checker pieces? (Could use this to make white v black 1 and -1 to use that as the direction)

  - Refer to Git version issue as discussed in https://github.com/typicode/husky/issues/326#issuecomment-517513832 for Huskey errors (PR?)
*/

/* To Do
  + Be able to click on pieces
  + Store which piece was selected
  + Move piece to selected space
  + Restrict to specific spaces to move to
  + Restrict Man Pieces Direction
  - Add flags for testing (example restrict where to place pieces)
  - Restrict which player is allowed to go based off turns
  - If a piece is captured it is removed from the board
  - Win condition
  - If a piece reaches the opposite side it becomes a king
  - Highlight available positions
  - If you can take a piece you must take a piece
*/

/* Notes
  - Rename space/piece selected
  - Remove console.log
  - Find new way to calculate which squre/piece was selected
  - Uniform formatting
  - No Magic Numbers, including gameboard 0, 1, 2
  - Code Comments
  - Semi-colons
*/

/* Stretch
  - Click and drag pieces
  - Show possible moves
  - Move Suggestions
  - Ai Opponent
  - Timing Turns
*/
