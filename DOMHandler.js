export class DOMHandler {
	constructor() {
		this.GRIDSIZE = 10;
		this.playerGameboard = document.querySelector("#player-gameboard");
		this.opponentGameboard = document.querySelector("#opponent-gameboard");
		this.cells = [];
	}

	createGameboards() {
		for (let row = 0; row < this.GRIDSIZE; row++) {
			for (let col = 0; col < this.GRIDSIZE; col++) {
				// Create single board cell
				const boardCell = document.createElement("div");
				boardCell.classList.add("board-cell");
				boardCell.dataset.coords = row + "-" + col;

				// copy cell to append it to the opponent board
				const boardCell2 = boardCell.cloneNode(true);

				boardCell.classList.add(`${this.playerGameboard.id}`);
				boardCell2.classList.add(`${this.opponentGameboard.id}`);

				// Append board cell to gameboards
				this.playerGameboard.appendChild(boardCell);
				this.opponentGameboard.appendChild(boardCell2);
			}
		}
	}

	displayShips(player, board) {
		let cells;
		if (player === "P1") {
			cells = document.querySelectorAll(
				".container #player-gameboard > .board-cell"
			);
		} else if (player === "P2") {
			cells = document.querySelectorAll(
				".container #opponent-gameboard > .board-cell"
			);
		}

		const coordinates = Array.from(board.keys()).map((key) =>
			key.split(",").map(Number)
		);

		for (let i = 0; i < coordinates.length; i++) {
			const currentCoords = coordinates[i];

			cells.forEach((cell) => {
				if (
					cell.dataset.coords ==
					`${currentCoords[0]}-${currentCoords[1]}`
				) {
					cell.classList.add("ship");
				}
			});
		}
	}
}
