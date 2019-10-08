# front-end-interview

Front-End Interview Exercises

## First, Do This

1. Make sure you have [Git](https://www.git-scm.com/) `>= 2.13.2` [Node.js](https://nodejs.org/en/) `>= 8.6.0` and [Yarn package manager](https://yarnpkg.com/lang/en/) installed on your computer.
1. Run `yarn` to install all the dependencies.
1. Run `yarn start` to open the interview exercises in a new browser window, inside [Storybook](https://storybook.js.org/).

### Checkers

You are given a React app that renders a Checkers board.

Modify [the existing code](https://github.com/Intelight/front-end-interview/blob/master/stories/Checkers.stories.js#L10) to create a functional Checkers game, by implementing these user requirements:

1. As a user, I want to move any piece to any space it is allowed to go, so that the board is correctly updated as a result of that move.
   1. If a piece is captured, it is removed from the board.
   1. If a piece reaches the opposite side, it becomes a king.
   1. The "movement" interaction is up to you. It can be with simple mouse clicks, drag-n-drop if you're up for a challenge, or even the keyboard if you wish.
1. As a user, I want to be able to take turns alternating between two local human players, so that Player One takes as many turns as possible and then Player Two does the same and so on until the game ends.
   1. If a player is allowed to make multiple moves, they are allowed to do so before the other player moves again.
   1. If the next player can't make a move or has no more pieces, they lose.

The rules of Checkers are available [here](https://www.wikihow.com/Play-Checkers).

![Screenshot](https://raw.githubusercontent.com/Intelight/front-end-interview/master/screenshot.png)
