export class DOMHandler {
	constructor() {
		this.GRIDSIZE = 10;
		this.gameboardContainer = document.querySelector("#gameboard");
		this.pages = document.querySelectorAll("div.page");
		this.cells = [];
	}

	createGameboards() {
		// Create players' gameboards
		this.playerGameboard = document.createElement("div");
		this.playerGameboard.id = "player-gameboard";

		this.opponentGameboard = document.createElement("div");
		this.opponentGameboard.id = "opponent-gameboard";

		this.gameboardContainer.appendChild(this.playerGameboard);
		this.gameboardContainer.appendChild(this.opponentGameboard);

		// Create cells
		for (let row = 0; row < this.GRIDSIZE; row++) {
			for (let col = 0; col < this.GRIDSIZE; col++) {
				// Create single board cell
				const boardCell = document.createElement("div");
				boardCell.classList.add("board-cell");
				boardCell.dataset.coords = col + "-" + row;
				boardCell.textContent =
					String.fromCharCode(col + 65) + (row + 1);

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

	showGameboard(playerID) {
		if (playerID == 1) {
			this.playerGameboard.classList.remove("hide");
			this.opponentGameboard.classList.add("hide");
		} else {
			this.opponentGameboard.classList.remove("hide");
			this.playerGameboard.classList.add("hide");
		}
	}

	toggleShips(playerID, board, action) {
		let cells;
		if (playerID === 1) {
			cells = document.querySelectorAll(
				".container #player-gameboard > .board-cell"
			);
		} else if (playerID === 2) {
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
					if (action == "add") {
						cell.classList.add("ship");
					} else {
						cell.classList.remove("ship");
					}
				}
			});
		}
	}

	showPage(pageToShow) {
		this.pages.forEach((page) => {
			page.classList.add("hide");
		});
		pageToShow.classList.remove("hide");
	}
}
