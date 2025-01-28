import { Ship } from "./Ship.js";
import { Gameboard } from "./Gameboard.js";
import { Player } from "./Player.js";
import { DOMHandler } from "./DOMHandler.js";

const coordsContainer = document.querySelector("#coordinates-input-container");
const startPlacingBtn = coordsContainer.querySelector("#start-placing");

let currentPlayer = 1;
let winner;

const player1 = new Player("P1", new Gameboard());
const player2 = new Player("P2", new Gameboard());

const domHandler = new DOMHandler();
domHandler.createGameboards();

// TODO: REFACTOR: move board-related-functions to gameboard module
// TODO: Create function for let users place their ships in order, first P1 and then P2
// TODO: Create main game function, for create players and boards, ship placement, war and transition functionality and winning.
// TODO: Create restart game function for creating a DOM method for removing elements.

function createShips() {
	// const SHIPLENGTHS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
	const SHIPLENGTHS = [3, 2];
	const ships = [];

	for (let i in SHIPLENGTHS) {
		const ship = new Ship(SHIPLENGTHS[i]);
		ships.push(ship);
	}

	return ships;
}

startPlacingBtn.addEventListener("click", () => {
	handlePlaceShip(player1);
});

async function handlePlaceShip(player) {
	const ships = createShips();
	const coordInput = coordsContainer.querySelector("#coord-input");
	const coordSubmitBtn = coordsContainer.querySelector("#coord-submit");

	for (let ship of ships) {
		console.log("Write your ship coordinates: (e.g: A1,A2...");
		console.log("Ship length: " + ship.length);

		let shipsCount = 0;
		let resolveCoordinates;

		// Create promise for async input
		const coordinatePromise = new Promise((resolve) => {
			resolveCoordinates = resolve;
		});

		function handleCoordInput() {
			const coordResult = player.gameboard.validateCoordinates(
				coordInput.value,
				ship.length
			);

			// If coordinate is correct, place ship
			if (coordResult) {
				const transformedCoords = player.gameboard.transformCoordinates(
					coordInput.value
				);

				shipsCount++;
				coordInput.value = "";

				// Place ship and continue placement
				player.gameboard.placeShip(ship, transformedCoords);
				domHandler.displayShips(player1.name, player1.gameboard.board);
				resolveCoordinates(transformedCoords);

				// Remove event listener and avoid creating several ones
				coordSubmitBtn.removeEventListener("click", handleCoordInput);

				// If there are ships left, continue and log message
				if (!shipsCount === ships.length) {
					console.log("Keep writing your ships' coordinates:");
					console.log("Next Ship length: " + ship.length);
				}
			} else {
				alert(
					"Invalid coordinate format.  Please use a letter A-J followed by a number 1-10 (e.g., B5)"
				);
				coordInput.value = "";
			}
		}
		coordSubmitBtn.addEventListener("click", handleCoordInput);

		// Wait until the current ship is placed
		await coordinatePromise;
	}

	console.log("YOU'RE PREPARE TO WAR!");
}

// TODO: START GAME FUNCTION

function startGame() {}

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
