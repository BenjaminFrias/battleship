import { Ship } from "./Ship.js";
import { Gameboard } from "./Gameboard.js";
import { Player } from "./Player.js";
import { DOMHandler } from "./DOMHandler.js";

let turn = "P1";

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

	const shipOrMiss = player.gameboard.receiveAttack(coords);

	if (shipOrMiss) {
		if (shipOrMiss.isSunk()) {
			destroyShip(player, clickedBoard, shipOrMiss);
			const isGameOver = player.gameboard.areAllShipsSunk();
		}

		cell.classList.add("hit");
	} else {
		cell.classList.add("miss");
	}
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
