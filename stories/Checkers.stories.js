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

//Colors used for board spaces and pieces
const Colors = {
  Player1Man: "white",
  Player1King: "gray",
  Player2Man: "red",
  Player2King: "darkred",
  UsedSpaces: "green",
  UnusedSpaces: "lightgray"
};

//Board piece values stored in Board.state.board
const BoardPiece = {
  Empty: 0,
  Player1Man: 1,
  Player2Man: -1,
  Player1King: 2,
  Player2King: -2
};

//Some quick functions for determing what pieces are
const IsKing = piece => Math.abs(piece) === 2;
const IsMan = piece => Math.abs(piece) === 1;
const IsPlayer1 = piece => piece > 0;
const IsPlayer2 = piece => piece < 0;
const IsEmpty = piece => (piece = 0);

//Player board values
const Player1 = 1;
const Player2 = -1;

//Piece Movement distances
const ManStepDistance = 1;
const ManJumpDistance = 2;

//The initial amount of pieces each player starts with
const InitialPiecesCount = 12;

//The size of one side of the board in spaces
const BoardSideSize = 8;

//A simple (x,y) vector class for assisting in basic vector calculations
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  //is vector diagonal ex (1,1) or (3,-3)
  isDiagonal() {
    return Math.abs(this.x) === Math.abs(this.y);
  }

  //adding two vectors together
  addVector(rhs) {
    return new Vector(this.x + rhs.x, this.y + rhs.y);
  }

  //adding an x,y value pair to a vector
  add(x, y) {
    return new Vector(this.x + x, this.y + y);
  }

  //subtract one vector from another
  sub(rhs) {
    return new Vector(this.x - rhs.x, this.y - rhs.y);
  }

  //Absolute both x and y
  abs() {
    return new Vector(Math.abs(this.x), Math.abs(this.y));
  }

  //does vector equal an (x,y) pair?
  isEqual(x, y) {
    return this.x === x && this.y === y;
  }

  //does vector equal another vector?
  isEqualToVector(rhs) {
    return this.x === rhs.x && this.y === rhs.y;
  }

  //finds a midpoint between two vectors (returns floats)
  midpoint(rhs) {
    return new Vector((this.x + rhs.x) / 2, (this.y + rhs.y) / 2);
  }

  //multiplies both x and y by a multiplier
  multiply(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }

  //do both x and y exist in bounds?
  inBounds(low, high) {
    if (this.x < low || this.x > high) return false;
    if (this.y < low || this.y > high) return false;
    return true;
  }

  //gets (x,y) direction 'unit value'
  baseDirection() {
    return new Vector(Math.sign(x), Math.sign(y));
  }

  //returns a string format of (x,y)
  toString() {
    return `(${this.x},${this.y})`;
  }
}

class Board extends React.Component {
  state = {
    //game board storing all the pieces
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
    //does current player have to jump this turn
    hasToJump: false,
    //Remaining piece counts for each player to determine winner
    remainingPieces: {
      Player1: InitialPiecesCount,
      Player2: InitialPiecesCount
    },
    //Winner of current game
    winner: null,
    //currently selected piece
    selectedPiece: null,
    //currently players turn
    activePlayer: Player2
  };

  //gets the board piece value from the board using its position
  getBoardPiece = position => this.state.board[position.y][position.x];

  //sets the value of a position of the board to a given value
  setBoardPiece = (position, value) => {
    this.state.board[position.y][position.x] = value;
  };

  //sets the pieceSelected state to a given state
  setSelectedPiece = piece => {
    this.setState({ selectedPiece: piece });
  };

  //moves a piece from its current location to a new location
  movePiece = (piece, space) => {
    this.setBoardPiece(space.props.position, piece.props.player);
    this.setBoardPiece(piece.props.position, BoardPiece.Empty);
  };

  //gets the y direction of a translaton from a piece to a space
  getTranslationYDirection = (piece, space) => {
    const startPosition = piece.props.position;
    const endPosition = space.props.position;
    const deltaY = endPosition.sub(startPosition).y;
    return Math.sign(deltaY);
  };

  //switches the current active player in this.state
  switchActivePlayer = () => {
    const currentPlayer = this.state.activePlayer;
    const otherPlayer = currentPlayer === Player1 ? Player2 : Player1;
    this.setState({ activePlayer: otherPlayer });
  };

  //gets the player of a given piece; throws exception if no piece was found
  getPiecePlayer = position => {
    const piece = this.getBoardPiece(position);
    if (IsPlayer1(piece)) {
      return Player1;
    } else if (IsPlayer2(piece)) {
      return Player2;
    }
    throw `Valid piece not found on (${position.x},${position.y})`;
  };

  //is the player of two different pieces different?
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

  //is the attempted King move a valid move? (untested)
  isValidKingMove = (piece, space) => {
    const delta = space.props.position.sub(piece.props.position);
    const direction = delta.baseDirection();
    let i = piece.props.position.add(direction);
    //iterate from the piece to the space checking that the path is clear
    while (!i.isEqualToVector(space.props.position)) {
      //can't jump over own pieces
      if (!isDifferentPlayer(getPiecePlayer(i), piece.props.player)) {
        return false;
      }
      //if jumping over and landing just past opponent, then valid
      else if (!isDifferentPlayer(getPiecePlayer(i), piece.props.player)) {
        if (i.add(direction) == space.props.direction) {
          this.capturePiece(i);
          return true;
        }
        return false;
      }
      i = i.add(direction); //keep iterating to space
    }
  };

  //is the attempted Man move a valid move?
  isValidManStep = (piece, space) => {
    //if player has to jump a step is not a valid move
    if (this.state.hasToJump === true) {
      return false;
    }
    const playersDirection = this.state.activePlayer;
    const deltaY = space.props.position.sub(piece.props.position).y;
    //if traveling in the correct direction, its a valid move
    if (playersDirection === deltaY) {
      return true;
    }
    return false;
  };

  //is the attempted Man jump/capture a valid move?
  isValidManJump = (piece, space) => {
    const playersDirection = this.state.activePlayer;
    const travelDirection = this.getTranslationYDirection(piece, space);
    const midpoint = piece.props.position.midpoint(space.props.position);
    const pieceBetween = this.getBoardPiece(midpoint);
    //if traveling in the correct direction and the jumped piece is an opponents
    //then its a valid jump and the opponents piece is captured
    if (
      playersDirection === travelDirection &&
      pieceBetween !== piece.props.player
    ) {
      this.capturePiece(midpoint);
      return true;
    }
    return false;
  };

  //Tests if the provided move is a valid move by calling functions for
  //the specific move the player is attempting
  isValidMove = (piece, space) => {
    const delta = space.props.position.sub(piece.props.position);
    //All pieces can only move diagonally to open spaces
    if (
      !delta.isDiagonal() ||
      this.getBoardPiece(space.props.position) != BoardPiece.Empty
    ) {
      return false;
    }
    if (IsKing(piece.props.player)) {
      return this.isValidKingMove(piece, space);
    } else if (delta.abs().isEqual(ManStepDistance, ManStepDistance)) {
      return this.isValidManStep(piece, space);
    } else if (delta.abs().isEqual(ManJumpDistance, ManJumpDistance)) {
      return this.isValidManJump(piece, space);
    }
    return false;
  };

  //Give that man a crown, he deserves to be a king
  crownPiece = space => {
    this.state.board[space.props.position.y][space.props.position.x] *= 2;
  };

  //Captures a piece and deletes it from the board
  //decrementing the players remaining pieces
  capturePiece = position => {
    this.getPiecePlayer(position) === Player1
      ? this.state.remainingPieces.Player1--
      : this.state.remainingPieces.Player2--;
    this.setBoardPiece(position, BoardPiece.Empty);
  };

  //handle a space being selected
  spaceSelected = space => {
    //if no piece was selected, do nothing
    if (this.state.selectedPiece !== null) {
      const piece = this.state.selectedPiece;
      //if the move wasn't valid, do nothing
      if (this.isValidMove(piece, space)) {
        this.movePiece(piece, space);
        this.setSelectedPiece(null);
        //If man is on the border, crown that piece
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

  //handle a piece being selected
  pieceSelected = piece => {
    if (piece.props.player === this.state.activePlayer) {
      this.setSelectedPiece(piece);
    }
  };

  //calculate if this man piece has to jump next turn
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

  //Caluclate if this king piece has to jump next turn
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

  //Calculate if this specific piece has to jump next turn
  doesPieceHaveToJump = position => {
    const piece = this.getBoardPiece(position);
    const nextPlayerDirection = this.state.activePlayer * -1;
    if (IsMan(piece)) {
      if (
        this.manPieceHasToJumpInDirection(
          position,
          new Vector(1, nextPlayerDirection)
        ) ||
        this.manPieceHasToJumpInDirection(
          position,
          new Vector(-1, nextPlayerDirection)
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

  //Calculate if the next player will have to jump their next turn
  nextPlayerHasToJump = () => {
    //iterate over all the spaces looking for pieces
    //if there is a piece we'll need to check its neighbors
    //to see if it needs to jump next turn
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
  //call onClick callback if clicked
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
  //call onClick callback if clicked
  clicked = () => {
    this.props.onClick(this);
  };

  //calculates piece display color
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

/* Stretch
  - Refactor into components directory with separate files
  - Test Cases
  + Create position to be a property of Piece and Space
  + Create a Vector class
  - Click and drag pieces
  - Show possible moves
  - Move Suggestions
  - Ai Opponent
  - Timing Turns
  - Undo turn
*/
