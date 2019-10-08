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

const NoPieceSelected = { x: -1, y: -1 };

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
    selectedPiece: NoPieceSelected
  };

  movePiece = (oldPos, newPos) => {
    let gameBoard = this.state.board; //temp
    console.log(
      `old x: ${oldPos.x} y: ${oldPos.y} val: ${gameBoard[oldPos.y][oldPos.x]}`
    );
    console.log(
      `new x: ${newPos.x} y: ${newPos.y} val: ${gameBoard[newPos.y][newPos.x]}`
    );
    gameBoard[newPos.y][newPos.x] = gameBoard[oldPos.y][oldPos.x];
    gameBoard[oldPos.y][oldPos.x] = 0;
    this.setState({ board: gameBoard });
    selectedPiece = NoPieceSelected;
  };

  spaceSelected = (new_x, new_y) => {
    const spaceSize = this.props.size / 8;
    new_x /= spaceSize;
    new_y /= spaceSize;

    if (this.state.selectedPiece != NoPieceSelected) {
      this.movePiece(this.state.selectedPiece, { x: new_x, y: new_y }); //bad format
    }
    console.log("Selected Space:", new_x, new_y);
  };

  pieceSelected = (x, y) => {
    const spaceSize = this.props.size / 8;
    this.state.selectedPiece.x = Math.floor(x / spaceSize);
    this.state.selectedPiece.y = Math.floor(y / spaceSize);

    console.log(
      "Selected Piece:",
      Math.floor(x / spaceSize),
      Math.floor(y / spaceSize)
    );
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

            if (space === 0) {
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
    this.props.onClick(this.props.x, this.props.y, this.props.size);
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
    this.props.onClick(this.props.centerX, this.props.centerY);
  };
  render() {
    return (
      <circle
        cx={this.props.centerX}
        cy={this.props.centerY}
        fill={this.props.player === 1 ? "white" : "red"}
        r={this.props.radius}
        onClick={this.clicked}
      />
    );
  }
}

/* Questions:
  - What is the purpose of the key value in the Piece and the Space class?
  - Are we guaranteed the boards position on the screen? (Is it valid to use postion to determine piece?)
  - so that Player One takes as many turns as possible and then Player Two does the same? (From README 2)(refers to jumps?)
  - there are some unused props like key and radius? Can I modify how these fields are used?
  - Can I be guaranteed that the squares will remain squres?

  - Refer to Git version issue as discussed in https://github.com/typicode/husky/issues/326#issuecomment-517513832 for Huskey errors (PR?)
*/

/* To Do
  + Be able to click on pieces
  + Store which piece was selected
  + Move piece to selected space
  - Restrict to specific spaces to move to
  - Add flags for testing (example restrict where to place pieces)
  - Restrict which player is allowed to go based off turns
  - If a piece is captured it is removed from the board
  - Win condition
  - If a piece reaches the opposite side it becomes a king
  - Highlight available positions
*/

/* Notes
  - Rename space/piece selected
  - Remove console.log
  - Find new way to calculate which squre/piece was selected
  - Uniform formatting
  - No Magic Numbers, including gameboard 0, 1, 2
*/

/* Stretch
  - Click and drag pieces
  - Suggestions
  - Ai Opponent
  - Timing Turns
*/
