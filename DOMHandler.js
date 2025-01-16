export class DOMHandler {
	constructor() {
		this.GRIDSIZE = 10;
		this.playerBoard = document.querySelector("#player-gameboard");
	}

	createGameboard() {
		for (let row = 0; row < this.GRIDSIZE; row++) {
			for (let col = 0; col < this.GRIDSIZE; col++) {
				const boardCell = document.createElement("div");
				boardCell.classList.add("board-cell");
				boardCell.id = `${row}-${col}`;
				this.playerBoard.appendChild(boardCell);
			}
		}
	}

	placeShipInBoard(coordinates) {
		const cells = document.querySelectorAll(
			".container > #player-gameboard > .board-cell"
		);

		for (let i = 0; i < coordinates.length; i++) {
			const currentCoords = coordinates[i];
			cells.forEach((cell) => {
				if (cell.id == `${currentCoords[0]}-${currentCoords[1]}`) {
					cell.style.backgroundColor = "blue";
				}
			});
		}
	}
}
