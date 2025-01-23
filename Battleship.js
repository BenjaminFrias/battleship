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

function createShips() {
	// const SHIPLENGTHS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
	const SHIPLENGTHS = [2];
	const ships = [];

	for (let i in SHIPLENGTHS) {
		const ship = new Ship(SHIPLENGTHS[i]);
		ships.push(ship);
	}

	return ships;
}

startPlacingBtn.addEventListener("click", () => {
	handlePlaceShip();
});

async function handlePlaceShip() {
	const ships = createShips();
	const coordInput = coordsContainer.querySelector("#coord-input");
	const coordSubmitBtn = coordsContainer.querySelector("#coord-submit");

	for (let ship of ships) {
		console.log("Write your ship coordinates: (e.g: A1,A2...");
		console.log("Ship length: " + ship.length);

		const coordinates = [];
		let coordinateCount = 0;
		let resolveCoordinates;

		const coordinatePromise = new Promise((resolve) => {
			resolveCoordinates = resolve;
		});

		coordInput.value = "";

		function handleCoordInput() {
			const coord = validateCoordinate(coordInput.value);

			if (coord) {
				const transformedCoords = transformCoordinates(coord);

				coordinates.push(transformedCoords);
				coordinateCount++;
				coordInput.value = "";

				if (coordinateCount === ships.length) {
					resolveCoordinates(coordinates);
					console.log("PLACIIINGGG SHIIIIIP");

					// Place ship in player's gameboard
					// player.gameboard.placeShip(ship, coordinates);

					coordSubmitBtn.removeEventListener(
						"click",
						handleCoordInput
					);
				} else {
					console.log("Keep writing your ship's coordinate:");
				}
			} else {
				alert("INVALID BRO");
				coordInput.value = "";
			}
		}

		coordSubmitBtn.addEventListener("click", handleCoordInput);
		await coordinatePromise;

		console.log(coordinates);
	}

	console.log("YOU'RE PREPARE TO WAR!");
}

function transformCoordinates(coords) {
	return coords;
}

function validateCoordinate(coordinate) {
	return coordinate;
}

// TODO: START GAME FUNCTION

const domHandler = new DOMHandler();
domHandler.createGameboards();
domHandler.displayShips(player2.name, player2.gameboard.board);

// TODO: Create a place ship system

// let attempts = 4;
// const shipCoordinates = [];
// coordsForm.addEventListener("submit", (e) => {
// 	e.preventDefault();

// 	const coordInput = coordsForm.querySelector("#coord-input");

// 	if (coordInput.value == "") {
// 		alert("Write a coordinate");
// 		return;
// 	}

// 	const coord = Array.from(coordInput.value.split(",").map(Number));
// 	shipCoordinates.push(coord);

// 	coordInput.value = "";
// 	attempts--;
// 	if (attempts == 0) {
// 		const ship = new Ship(4);
// 		handlePlaceShip(ship, shipCoordinates);
// 		domHandler.displayShips(player1.name, player1.gameboard.board);
// 		coordInput.value = "";
// 	}
// });

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
