import React from "react";
import "./style.css";
import { atelierHeathDark } from "react-syntax-highlighter/dist/styles/hljs";

// This is used by Storybook:
export default {
  title: "Checkers"
};

// This is the main app:
export const Checkers = () => {
  return <Board size={400} />;
};

const Colors = {
  Player1Man: "white",
  Player1King: "gray",
  Player2Man: "red",
  Player2King: "darkred",
  UsedSpaces: "green",
  UnusedSpaces: "lightgray"
};

const BoardPiece = {
  Empty: 0,
  Player1Man: 1,
  Player2Man: -1,
  Player1King: 2,
  Player2King: -2
};
const IsKing = piece => Math.abs(piece) === 2;
const IsMan = piece => Math.abs(piece) === 1;
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
  isDiagonal() {
    return Math.abs(this.x) === Math.abs(this.y);
  }
  addVector(rhs) {
    return new Vector(this.x + rhs.x, this.y + rhs.y);
  }
  add(x, y) {
    return new Vector(this.x + x, this.y + y);
  }
  sub(rhs) {
    return new Vector(this.x - rhs.x, this.y - rhs.y);
  }
  abs() {
    return new Vector(Math.abs(this.x), Math.abs(this.y));
  }
  equals(x, y) {
    return this.x === x && this.y === y;
  }
  equalsVector(rhs) {
    return this.x === rhs.x && this.y === rhs.y;
  }
  midpoint(rhs) {
    return new Vector((this.x + rhs.x) / 2, (this.y + rhs.y) / 2);
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
    selectedPiece: null,
    isPieceSelected: false,
    activePlayer: Player2
  };

  getBoardPiece = position => this.state.board[position.y][position.x];

  setBoardPiece = (position, value) => {
    this.state.board[position.y][position.x] = value;
  };

  setPieceSelectedState = state => {
    this.setState({ isPieceSelected: state });
  };

  movePiece = (piece, space) => {
    this.setBoardPiece(space.props.position, piece.props.player);
    this.setBoardPiece(piece.props.position, BoardPiece.Empty);
  };

  getTranslationDirection = (piece, space) => {
    const startPosition = piece.props.position;
    const endPosition = space.props.position;
    const deltaY = endPosition.sub(startPosition).y;
    return Math.sign(deltaY);
  };

  switchActivePlayer = () => {
    const currentPlayer = this.state.activePlayer;
    const otherPlayer = currentPlayer === Player1 ? Player2 : Player1;
    this.setState({ activePlayer: otherPlayer });
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
      this.getBoardPiece(lhsPosition) === BoardPiece.Empty ||
      this.getBoardPiece(rhsPosition) === BoardPiece.Empty
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

  isValidManStep = (piece, space) => {
    if (this.state.hasToJump === true) {
      return false;
    }
    const playersDirection = this.state.activePlayer;
    const deltaY = space.props.position.sub(piece.props.position).y;
    if (playersDirection === deltaY) {
      return true;
    }
    return false;
  };

  isValidManJump = (piece, space) => {
    const playersDirection = this.state.activePlayer;
    const travelDirection = this.getTranslationDirection(piece, space);
    const midpoint = piece.props.position.midpoint(space.props.position);
    const pieceBetween = this.getBoardPiece(midpoint);
    if (
      playersDirection === travelDirection &&
      pieceBetween != piece.props.player
    ) {
      //needs to account for kings
      this.capturePiece(midpoint); //should be moved up in the call stack
      return true;
    }
    return false;
  };

  //This function should be broken up
  isValidMove = (piece, space) => {
    const delta = piece.props.position.sub(space.props.position);
    //All pieces can only move diagonally to open spaces
    if (
      !delta.isDiagonal() ||
      this.getBoardPiece(space.props.position) != BoardPiece.Empty
    ) {
      return false;
    }
    if (IsKing(piece.props.player)) {
      return this.isValidKingMove();
    } else if (delta.abs().equals(ManStepDistance, ManStepDistance)) {
      return this.isValidManStep(piece, space);
    } else if (delta.abs().equals(ManJumpDistance, ManJumpDistance)) {
      return this.isValidManJump(piece, space);
    }
    return false;
  };

  crownPiece = space => {
    this.state.board[space.props.position.y][space.props.position.x] *= 2;
  };

  capturePiece = position => {
    this.getPiecePlayer(position) === Player1
      ? this.state.remainingPieces.Player1--
      : this.state.remainingPieces.Player2--;
    this.setBoardPiece(position, BoardPiece.Empty);
  };

  spaceSelected = space => {
    if (this.state.selectedPiece !== null) {
      const piece = this.state.selectedPiece;
      if (this.isValidMove(piece, space)) {
        this.movePiece(piece, space);
        this.setState({ selectedPiece: null });
        if (
          (IsMan(piece.props.player) && space.props.position.y === 0) ||
          space.props.position.y === BoardSideSize - 1
        ) {
          this.crownPiece(space);
        }
        this.switchActivePlayer();
        this.state.hasToJump = this.nextPlayerHasToJump();
      }
    }
  };

  pieceSelected = piece => {
    if (piece.props.player === this.state.activePlayer) {
      this.setState({
        selectedPiece: piece,
        isPieceSelected: true
      });
    }
  };

  manPieceHasToJumpInDirection = (position, direction) => {
    if (
      this.isDifferentPlayer(position, position.addVector(direction)) &&
      this.getBoardPiece(position.addVector(direction.multiply(2))) ===
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

  //need to fix again
  doesPieceHaveToJump = position => {
    const piece = this.getBoardPiece(position);
    if (IsMan(piece)) {
      if (
        this.manPieceHasToJumpInDirection(
          position,
          new Vector(1, this.state.activePlayer * -1)
        ) ||
        this.manPieceHasToJumpInDirection(
          position,
          new Vector(-1, this.state.activePlayer * -1)
        )
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
                position={new Vector(x, y)}
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
                position={new Vector(x, y)}
                centerX={spaceX + pieceRadius}
                centerY={spaceY + pieceRadius}
                player={space} //should be renamed to something like type
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
        fill={this.props.shade ? Colors.UsedSpaces : Colors.UnusedSpaces}
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
    this.props.onClick(this);
  };

  pieceFillColor = () => {
    switch (this.props.player) {
      case BoardPiece.Player1Man:
        return Colors.Player1Man;
      case BoardPiece.Player1King:
        return Colors.Player1King;
      case BoardPiece.Player2Man:
        return Colors.Player2Man;
      case BoardPiece.Player2King:
        return Colors.Player2King;
    }
  };
  render() {
    return (
      <circle
        cx={this.props.centerX}
        cy={this.props.centerY}
        fill={this.pieceFillColor()}
        r={this.props.radius}
        onClick={this.clicked}
      />
    );
  }
}

//https://www.checkershistory.com/a-glossary-of-checkers.html

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
  - King capturing logic
  - If king has to jump logic
  + If you can take a piece you must take a piece
  - If you can jump again you may
*/

/* Notes
  - Some methods should be moved to piece class
  - Rename space/piece selected
  + Remove console.log
  + Find new way to calculate which square/piece was selected
  - Uniform formatting
  + No Magic Numbers, including gameboard 0, 1, 2
  - Code Comments
  + Semi-colons
  - Test functions (example Empty into getPlayer)
  - == vs ===
*/

/* Stretch
  - Test Cases
  - Create position to be a property of Piece and Space
  - Create a Vector class
  - Click and drag pieces
  - Show possible moves
  - Move Suggestions
  - Ai Opponent
  - Timing Turns
  - Undo turn
*/
