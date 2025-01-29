import { Ship } from "./Ship.js";
import { Gameboard } from "./Gameboard.js";
import { Player } from "./Player.js";
import { DOMHandler } from "./DOMHandler.js";

const startGamePage = document.querySelector("#start-game-page");
const placeShipsPage = document.querySelector("#place-ships-page");
const coordinatesPage = document.querySelector("#get-coordinates-page");
const battlePage = document.querySelector("#battle-page");
const winnerPage = document.querySelector("#winner-page");
const coordsContainer = document.querySelector("#coordinates-input-container");
const startGameBtn = document.querySelector("#start-game-btn");
const phaseTitle = document.querySelector("#current-phase-title");

// TODO: Create main game function, for create players and boards, ship placement, war and transition functionality and winning.
// TODO: Create restart game function for creating a DOM method for removing elements.
// TODO: Refactor validate coords to return different errors to show to the user
// TODO: REFACTOR: Try to move every gameboard function to gameboard

// TODO: START GAME FUNCTION
let domHandler;
let player1;
let player2;
let currentPlayer;

startGameBtn.addEventListener("click", startGame);

function startGame() {
	// Creating Dom handler
	domHandler = new DOMHandler();

	// Switch start game to placement page
	domHandler.hideElement(startGamePage);
	domHandler.showElement(placeShipsPage);
	domHandler.createGameboards();

	// Creating players
	player1 = new Player("P1", new Gameboard());
	player2 = new Player("P2", new Gameboard());
	currentPlayer = player1;

	domHandler.showElement(phaseTitle);

	// Add event listener to start placing btn
	const startPlacingBtn = document.querySelector("#start-placing-btn");
	startPlacingBtn.addEventListener("click", () => {
		phaseTitle.textContent = `${currentPlayer.name}, place your ships`;

		handlePlaceShip(currentPlayer).then(() => {
			if (currentPlayer == player2) {
				phaseTitle.textContent = "Let's battle!";
				const playerBoard1 =
					document.querySelector("#player-gameboard");
				const playerBoard2 = document.querySelector(
					"#opponent-gameboard"
				);

				// Show both boards
				domHandler.showElement(playerBoard1);
				domHandler.showElement(playerBoard2);
			} else {
				// Swap turns when first player finished placing its ships.
				swapTurns();

				phaseTitle.textContent = `${currentPlayer.name}, place your ships`;
				domHandler.showElement(startPlacingBtn);
				domHandler.hideElement(coordsContainer);
				domHandler.hideElement(gameboardsContainer);
			}
		});

		// Show gameboards
		const gameboardsContainer = document.querySelector("#gameboards");
		domHandler.showElement(gameboardsContainer);

		// Show only the current player gameboard
		domHandler.showGameboard(currentPlayer.name);

		// Show coordinates inputs
		domHandler.showElement(coordsContainer);

		// Hide start placing btn
		domHandler.hideElement(startPlacingBtn);
	});
}

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
				domHandler.displayShips(player.name, player.gameboard.board);
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
}

function createShips() {
	// const SHIPLENGTHS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
	const SHIPLENGTHS = [2, 1];
	const ships = [];

	for (let i in SHIPLENGTHS) {
		const ship = new Ship(SHIPLENGTHS[i]);
		ships.push(ship);
	}

	return ships;
}

// TODO: Create restart game function

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

const cells = document.querySelectorAll(".board-cell");
cells.forEach((cell) => {
	cell.addEventListener("click", () => {
		handleAttack(cell);
	});
});

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

function swapTurns() {
	currentPlayer = currentPlayer == player1 ? player2 : player1;
}

function gameOver() {
	alert(`${currentPlayer.name} won`);
}
