import { Ship } from "./Ship.js";
import { Gameboard } from "./Gameboard.js";
import { Player } from "./Player.js";
import { DOMHandler } from "./DOMHandler.js";

const startGamePage = document.querySelector("#start-game-page");
const placeShipsPage = document.querySelector("#start-placing-page");
const setCoordsPage = document.querySelector("#set-coordinates-page");
const battlePage = document.querySelector("#battle-page");
const winnerPage = document.querySelector("#winner-page");
const coordsContainer = document.querySelector("#coordinates-input-container");
const gameboardsContainer = document.querySelector("#gameboard");
const passDevicePage = document.querySelector("#pass-device-page");
const passDeviceBtn = document.querySelector("#pass-btn");
const startGameBtn = document.querySelector("#start-game-btn");
const restartGameBtn = document.querySelector("#restart-game-btn");
const returnHomeBtn = document.querySelector("#return-home-btn");
const startPlacingBtn = document.querySelector("#start-placing-btn");
const shipLengthTitle = document.querySelector("#ship-length");
const startPlacingTitle = document.querySelector("#start-placing-title");
const setCoordinatesTitle = document.querySelector("#set-coordinates-title");
const passDeviceTitle = document.querySelector("#pass-device-title");
const attackTitle = document.querySelector("#attack-title");
const currentPlaceGameboard = document.querySelector(
	"#current-placing-gameboard"
);

// TODO: Feature: validate coords to return different errors to show to the user
// TODO: Feature: Drag and Drop feature for placing ships.
// TODO: Feature: Ships' graveyard.
// TODO: Feature: vs computer gameplay.

let domHandler;
let player1;
let player2;
let currentPlayer;
let currentOpponent;
let startPlacingListener;

startGameBtn.addEventListener("click", () => {
	restartValues();
	startGame();
});

returnHomeBtn.addEventListener("click", () => {
	domHandler.showPageWithTitle(startGamePage);
});

restartGameBtn.addEventListener("click", () => {
	restartValues();
	startGame();
});

function initializeGame() {
	// Creating Dom handler
	domHandler = new DOMHandler();

	// Create gameboards
	domHandler.createGameboards();

	// Creating players
	player1 = new Player(1, "P1", new Gameboard());
	player2 = new Player(2, "P2", new Gameboard());

	// Set current players
	currentPlayer = player1;
	currentOpponent = player2;

	// Get every player's gameboard and assign it to each.
	const playerBoard1 = document.querySelector("#player-gameboard");
	const playerBoard2 = document.querySelector("#opponent-gameboard");
	player1.gameboard.boardElement = playerBoard1;
	player2.gameboard.boardElement = playerBoard2;

	// Add event listener to start placing btn
	startPlacingListener = startPlacingPhase;
	startPlacingBtn.addEventListener("click", startPlacingListener);
}

function startGame() {
	initializeGame();

	// Placement phase

	domHandler.showPageWithTitle(placeShipsPage, currentPlayer.name);
}

async function startPlacingPhase() {
	moveBoard(currentPlayer.gameboard.boardElement, currentPlaceGameboard);
	domHandler.showPageWithTitle(setCoordsPage, currentPlayer.name);

	// Manage placing players' turns
	await handlePlaceShip(currentPlayer);
	moveBoard(currentPlayer.gameboard.boardElement, gameboardsContainer);

	if (currentPlayer == player2) {
		swapTurns();
		startBattlePhase();
	} else {
		swapTurns();
		domHandler.showPageWithTitle(placeShipsPage, currentPlayer.name);
		moveBoard(currentPlayer.gameboard.boardElement, currentPlaceGameboard);
	}

	function moveBoard(board, container) {
		container.appendChild(board);
	}
}

function startBattlePhase() {
	domHandler.showPageWithTitle(passDevicePage, currentPlayer.name);

	// Remove all ships classes from boards
	domHandler.toggleShips(
		currentOpponent.id,
		currentOpponent.gameboard.board,
		"remove"
	);

	domHandler.toggleShips(
		currentPlayer.id,
		currentPlayer.gameboard.board,
		"remove"
	);

	passDeviceBtn.addEventListener("click", passDevice);

	function passDevice() {
		domHandler.showPageWithTitle(battlePage, currentOpponent.name);
		domHandler.showGameboard(currentOpponent.id);
	}

	// handle attack for every cell
	const cells = document.querySelectorAll(".board-cell");
	cells.forEach((cell) => {
		cell.textContent = "";
		cell.addEventListener("click", () => {
			const result = handleAttack(cell);

			// Remove text content when user attacks
			if (result == "miss") {
				swapTurns();

				domHandler.showPageWithTitle(
					passDevicePage,
					currentPlayer.name
				);
			} else if (result == "gameOver") {
				gameOver();
			} else if (result == "prevShoot") {
				alert("You attacked that cell already");
			}
		});
	});
}

function gameOver() {
	const winner = currentPlayer;
	domHandler.showPageWithTitle(winnerPage, winner.name);
}

function swapTurns() {
	currentPlayer = currentPlayer == player1 ? player2 : player1;
	currentOpponent = currentPlayer == player2 ? player1 : player2;
}

async function handlePlaceShip(player) {
	const ships = createShips();
	const coordInput = coordsContainer.querySelector("#coord-input");
	const coordSubmitBtn = coordsContainer.querySelector("#coord-submit");

	for (let ship of ships) {
		shipLengthTitle.textContent = `Next ship length: ${ship.length} squares!`;

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
				const splittedCoords = coordInput.value
					.split(",")
					.filter((item) => item != "")
					.join(",");

				const transformedCoords =
					player.gameboard.transformCoordinates(splittedCoords);

				shipsCount++;

				// Place ship and continue placement
				player.gameboard.placeShip(ship, transformedCoords);
				domHandler.toggleShips(
					player.id,
					player.gameboard.board,
					"add"
				);
				resolveCoordinates(transformedCoords);

				// Remove event listener and avoid creating several ones
				coordSubmitBtn.removeEventListener("click", handleCoordInput);

				// If there are ships left, continue and log message
				if (!shipsCount === ships.length) {
					console.log("Keep writing your ships' coordinates:");
					console.log("Next Ship length: " + ship.length);
				}
				coordInput.value = "";
			} else {
				alert("Invalid coordinate.");
				coordInput.value = "";
			}
		}
		coordSubmitBtn.addEventListener("click", handleCoordInput);

		// Wait until the current ship is placed
		await coordinatePromise;
	}
}

function createShips() {
	const SHIPLENGTHS = [2, 1];
	const ships = [];

	for (let i in SHIPLENGTHS) {
		const ship = new Ship(SHIPLENGTHS[i]);
		ships.push(ship);
	}

	return ships;
}

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
			player.gameboard.destroyShip(player, clickedBoard, attackResult);
			const isGameOver = player.gameboard.areAllShipsSunk();

			if (isGameOver) {
				return "gameOver";
			}
		}

		cell.classList.add("hit");
		return "hit";
	} else if (attackResult == "miss") {
		cell.classList.add("miss");
		return "miss";
	} else if (attackResult == "prevShoot") {
		return "prevShoot";
	}
}

function restartValues() {
	domHandler = undefined;
	player1 = undefined;
	player2 = undefined;
	currentPlayer = undefined;
	currentOpponent = undefined;

	// Remove boards elements
	gameboardsContainer.textContent = "";
	startPlacingBtn.removeEventListener("click", startPlacingListener);
}
