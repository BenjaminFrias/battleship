import { Ship } from "./Ship.js";
import { Gameboard } from "./Gameboard.js";
import { Player } from "./Player.js";
import { DOMHandler } from "./DOMHandler.js";

let currentPlayer = 1;
let winner;

const player1 = new Player("P1", new Gameboard());
const player2 = new Player("P2", new Gameboard());

const ship1 = new Ship(4);
const ship2 = new Ship(4);
const ship3 = new Ship(4);

player1.gameboard.placeShip(ship1, [
	[0, 0],
	[0, 1],
	[0, 2],
	[0, 3],
]);

player1.gameboard.placeShip(ship3, [
	[5, 4],
	[5, 5],
	[5, 6],
	[5, 7],
]);

player2.gameboard.placeShip(ship2, [
	[2, 4],
	[2, 5],
	[2, 6],
	[2, 7],
]);

const domHandler = new DOMHandler();
domHandler.createGameboards();
domHandler.displayShips(player1.name, player1.gameboard.board);
domHandler.displayShips(player2.name, player2.gameboard.board);

const cells = document.querySelectorAll(".board-cell");
cells.forEach((cell) => {
	cell.addEventListener("click", () => {
		handleAttack(cell);
	});
});

function handleAttack(cell) {
	const coords = Array.from(cell.dataset.coords.split("-").map(Number));
	const clickedBoard = cell.classList[1];
	let player;

	if (clickedBoard == "player-gameboard") {
		player = player1;
	} else {
		player = player2;
	}

	const attackResult = player.gameboard.receiveAttack(coords);

	if (attackResult instanceof Ship) {
		if (attackResult.isSunk()) {
			destroyShip(player, clickedBoard, attackResult);
			const isGameOver = player.gameboard.areAllShipsSunk();

			if (isGameOver) {
				gameOver();
			}
		}

		cell.classList.add("hit");
	} else if (attackResult == "miss") {
		swapTurns();
		cell.classList.add("miss");
	} else if (attackResult == "prevShoot") {
		console.log("Coordinate already attacked");
	}
}

function swapTurns() {
	currentPlayer = currentPlayer === 1 ? 2 : 1;

	console.log(`P${currentPlayer}'s turn`);
}

function destroyShip(player, board, ship) {
	ship.isDestroyed = true;

	const coordinates = player.gameboard.getShipCoordinates(ship);
	for (let coord of coordinates) {
		const cell = document.querySelector(
			`#${board} > .board-cell[data-coords="${coord.join("-")}"]`
		);

		cell.classList.add("destroyed");
	}
}

function gameOver() {
	alert(`Player ${currentPlayer} won`);
}
