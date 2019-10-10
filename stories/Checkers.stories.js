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
  Player2Man: -1,
  Player1King: 2,
  Player2King: -2
};
const IsKing = piece => Math.abs(piece) == 2;
const IsMan = piece => Math.abs(piece) == 1;
const IsPlayer1 = piece => piece > 0;
const IsPlayer2 = piece => piece < 0;
const IsEmpty = piece => (piece = 0);

const Direction = {
  Up: -1,
  Down: 1,
  Right: 1,
  Left: -1
};

const Player1 = 1;
const Player2 = -1;

const ManStepDistance = 1;
const ManJumpDistance = 2;

const InitialPiecesCount = 12;

const BoardSideSize = 8;

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  addVector(rhs) {
    return new Vector(this.x + rhs.x, this.y + rhs.y);
  }
  add(x, y) {
    return new Vector(this.x + x, this.y + y);
  }
  multiply(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
  inBounds(low, high) {
    if (this.x < low || this.x > high) return false;
    if (this.y < low || this.y > high) return false;
    return true;
  }
  toString() {
    return `(${this.x},${this.y})`;
  }
}

class Board extends React.Component {
  state = {
    board: [
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [-1, 0, -1, 0, -1, 0, -1, 0],
      [0, -1, 0, -1, 0, -1, 0, -1],
      [-1, 0, -1, 0, -1, 0, -1, 0]
    ],
    hasToJump: false,
    remainingPieces: {
      Player1: InitialPiecesCount,
      Player2: InitialPiecesCount
    },
    selectedPiece: { x: 0, y: 0 },
    isPieceSelected: false,
    activePlayer: Player2
  };

  getBoardPiece = position => this.state.board[position.y][position.x];

  setBoardPiece = (position, value) => {
    this.state.board[position.y][position.x] = value;
  };

  getPiecePlayer = position => {
    const piece = this.getBoardPiece(position);
    if (IsPlayer1(piece)) {
      return Player1;
    } else if (IsPlayer2(piece)) {
      return Player2;
    }
    throw `Valid piece not found on (${position.x},${position.y})`;
  };

  isDifferentPlayer = (lhsPosition, rhsPosition) => {
    if (
      !rhsPosition.inBounds(0, BoardSideSize - 1) ||
      this.getBoardPiece(lhsPosition) == BoardPiece.Empty ||
      this.getBoardPiece(rhsPosition) == BoardPiece.Empty
    ) {
      return false;
    }
    if (this.getPiecePlayer(lhsPosition) != this.getPiecePlayer(rhsPosition)) {
      return true;
    }
    return false;
  };

  isValidKingMove = () => {
    return true;
  };

  isValidManStep = (oldPos, newPos) => {
    if (this.state.hasToJump == true) {
      return false;
    }
    const piece = this.getBoardPiece(oldPos);
    const playersDirection = Math.sign(piece);
    const deltaY = newPos.y - oldPos.y;
    if (playersDirection == deltaY) {
      return true;
    }
    return false;
  };

  isValidManJump = (oldPos, newPos) => {
    console.log("Got to jump");
    const piece = this.getBoardPiece(oldPos); //rename
    const playersDirection = Math.sign(piece);
    const deltaY = newPos.y - oldPos.y;
    const avgX = (oldPos.x + newPos.x) / 2;
    const avgY = (oldPos.y + newPos.y) / 2;
    const avgPos = { x: avgX, y: avgY };
    const pieceBetween = this.getBoardPiece(avgPos);
    if (playersDirection == Math.sign(deltaY) && pieceBetween != piece) {
      //needs to account for kings
      this.capturePiece(avgPos); //should be moved up in the call stack
      return true;
    }
    return false;
  };

  //This function should be broken up
  isValidMove = (oldPos, newPos) => {
    const piece = this.getBoardPiece(oldPos);
    const deltaX = newPos.x - oldPos.x;
    const deltaY = newPos.y - oldPos.y;

    //All pieces can only move diagonally to open spaces
    if (
      (deltaX + deltaY) % 2 != 0 ||
      this.getBoardPiece(newPos) != BoardPiece.Empty
    ) {
      return false;
    }
    if (IsKing(piece)) {
      return this.isValidKingMove();
    } else if (
      Math.abs(deltaX) == ManStepDistance &&
      Math.abs(deltaY) == ManStepDistance
    ) {
      return this.isValidManStep(oldPos, newPos);
    } else if (
      Math.abs(deltaX) == ManJumpDistance &&
      Math.abs(deltaY) == ManJumpDistance
    ) {
      return this.isValidManJump(oldPos, newPos);
    }
    return false;
  };

  crownPiece = position => {
    this.state.board[position.y][position.x] *= 2;
  };

  capturePiece = position => {
    this.getPiecePlayer(position) == Player1
      ? this.state.remainingPieces.Player1--
      : this.state.remainingPieces.Player2--;
    this.setBoardPiece(position, BoardPiece.Empty);
  };

  movePiece = (oldPos, newPos) => {
    if (this.isValidMove(oldPos, newPos)) {
      let gameBoard = this.state.board; //temp
      gameBoard[newPos.y][newPos.x] = gameBoard[oldPos.y][oldPos.x];
      gameBoard[oldPos.y][oldPos.x] = BoardPiece.Empty;
      this.setState({ board: gameBoard, isPieceSelected: false });
      const otherPlayer =
        this.getPiecePlayer(newPos) == Player1 ? Player2 : Player1;
      this.setState({ activePlayer: otherPlayer }); //try to combine
      const piece = this.getBoardPiece(newPos);
      if (
        (Math.abs(piece) != 2 && newPos.y == 0) ||
        newPos.y == BoardSideSize - 1
      ) {
        this.crownPiece(newPos);
      }
      this.state.hasToJump = this.nextPlayerHasToJump();
      console.log(`Player${otherPlayer}'s turn`);
    }
  };

  spaceSelected = space => {
    const spaceSize = this.props.size / 8;
    const spaceX = space.props.x / spaceSize;
    const spaceY = space.props.y / spaceSize;
    const spacePosition = { x: spaceX, y: spaceY };
    if (this.state.isPieceSelected) {
      //put isValidMove here
      this.movePiece(this.state.selectedPiece, spacePosition); //bad format
    }
    console.log("Selected Space:", spaceX, spaceY);
  };

  pieceSelected = piece => {
    if (piece.props.player == this.state.activePlayer) {
      const spaceSize = this.props.size / 8;
      const pieceX = Math.floor(piece.props.centerX / spaceSize);
      const pieceY = Math.floor(piece.props.centerY / spaceSize);
      this.setState({
        selectedPiece: { x: pieceX, y: pieceY },
        isPieceSelected: true
      });

      console.log("Selected Piece:", Math.floor(pieceX), Math.floor(pieceY));
    }
  };

  manPieceHasToJumpInDirection = (position, direction) => {
    if (
      this.isDifferentPlayer(position, position.addVector(direction)) &&
      this.getBoardPiece(position.addVector(direction.multiply(2))) ==
        BoardPiece.Empty
    ) {
      return true;
    }
    return false;
  };

  kingPieceHasToJumpInDirection = (position, direction) => {
    for (let i = 1; i > BoardSideSize - 1; ++i) {
      if (
        this.isDifferentPlayer(position, position.add(direction.multiply(i)))
      ) {
        if (this.getBoardPiece(position.add(direction.multiply(i + 1)))) {
          return true;
        } else {
          return false;
        }
      }
      if (position.add(i, i).inBounds(0, BoardSideSize - 1)) {
        return false;
      }
    }
  };

  doesPieceHaveToJump = position => {
    const piece = this.getBoardPiece(position);
    if (IsMan(piece)) {
      if (
        this.manPieceHasToJumpInDirection(position, new Vector(1, 1)) ||
        this.manPieceHasToJumpInDirection(position, new Vector(-1, 1)) ||
        this.manPieceHasToJumpInDirection(position, new Vector(1, -1)) ||
        this.manPieceHasToJumpInDirection(position, new Vector(-1, -1))
      ) {
        return true;
      }
      return false;
    } else if (IsKing(piece)) {
      if (
        this.kingPieceHasToJumpInDirection(position, new Vector(1, 1)) ||
        this.kingPieceHasToJumpInDirection(position, new Vector(-1, 1)) ||
        this.kingPieceHasToJumpInDirection(position, new Vector(1, -1)) ||
        this.kingPieceHasToJumpInDirection(position, new Vector(-1, -1))
      ) {
        return true;
      }
      return false;
    }
    return false;
  };

  nextPlayerHasToJump = () => {
    for (let y = 0; y < BoardSideSize; ++y) {
      for (let x = 0; x < BoardSideSize; ++x) {
        const piece = this.getBoardPiece({ x: x, y: y });
        console.log(`Jump active player ${this.state.activePlayer}`);
        if (
          piece != BoardPiece.Empty &&
          this.getPiecePlayer({ x: x, y: y }) != this.state.activePlayer &&
          this.doesPieceHaveToJump(new Vector(x, y))
        ) {
          return true;
        }
      }
    }
    return false;
  };

  render() {
    const spaceSize = this.props.size / BoardSideSize;
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
/* Questions
  - How do we determine the King piece
  - How do we provide who won?
*/

/* To Do
  + Be able to click on pieces
  + Store which piece was selected
  + Move piece to selected space
  + Restrict to specific spaces to move to
  + Restrict Man Pieces Direction
  - Add flags for testing (example restrict where to place pieces)
  + Restrict which player is allowed to go based off turns
  + If a piece is captured it is removed from the board
  + Win condition
  + If a piece reaches the opposite side it becomes a king
  - King Movement
  + If you can take a piece you must take a piece
  - If you can jump again you may
*/

/* Notes
  - Some methods should be moved to piece class
  - Rename space/piece selected
  - Remove console.log
  - Find new way to calculate which square/piece was selected
  - Uniform formatting
  - No Magic Numbers, including gameboard 0, 1, 2
  - Code Comments
  - Semi-colons
  - Test functions (example Empty into getPlayer)
  - == vs ===
*/

/* Stretch
  - Create position to be a property of Piece and Space
  - Create a Vector class
  - Click and drag pieces
  - Show possible moves
  - Move Suggestions
  - Ai Opponent
  - Timing Turns
  - Undo turn
*/
