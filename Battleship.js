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
let currentOpponent;

startGameBtn.addEventListener("click", startGame);

function startGame() {
	// Creating Dom handler
	domHandler = new DOMHandler();

	// Switch start game to placement page
	domHandler.showPage(placeShipsPage);
	domHandler.createGameboards();

	// Creating players
	player1 = new Player("P1", new Gameboard());
	player2 = new Player("P2", new Gameboard());
	currentPlayer = player1;
	currentOpponent = player2;

	const playerBoard1 = document.querySelector("#player-gameboard");
	const playerBoard2 = document.querySelector("#opponent-gameboard");

	player1.gameboard.boardElement = playerBoard1;
	player2.gameboard.boardElement = playerBoard2;

	domHandler.showElement(phaseTitle);
	updatePhaseTitle("Start placement phase!");

	// Add event listener to start placing btn
	const startPlacingBtn = document.querySelector("#start-placing-btn");
	startPlacingBtn.addEventListener("click", () => {
		startPlacingPhase();
	});

	function startPlacingPhase() {
		const currentPlaceGameboard = document.querySelector(
			"#current-placing-gameboard"
		);

		updatePhaseTitle(`${currentPlayer.name}, place your ships`);

		handlePlaceShip(currentPlayer).then(() => {
			if (currentPlayer == player2) {
				// Move previous player's board to gameboard Container

				moveBoard(
					currentPlayer.gameboard.boardElement,
					gameboardsContainer
				);

				updatePhaseTitle("Let's battle!");
				swapTurns();
				startBattlePhase();
			} else {
				// Move previous player's board to gameboard Container

				moveBoard(
					currentPlayer.gameboard.boardElement,
					gameboardsContainer
				);

				// Swap turns when first player finished placing its ships.
				swapTurns();

				updatePhaseTitle(`${currentPlayer.name}, place your ships`);

				// Show current player's board by moving it to

				moveBoard(
					currentPlayer.gameboard.boardElement,
					currentPlaceGameboard
				);

				domHandler.showPage(placeShipsPage);
			}
		});

		moveBoard(currentPlayer.gameboard.boardElement, currentPlaceGameboard);

		domHandler.showPage(setCoordsPage);
	}

	// TODO: ATTACK Phase, move boards to current player and opponent board and create switch page
	function startBattlePhase() {
		updatePhaseTitle(`Let's battle! It's ${currentPlayer.name}'s turn`);

		domHandler.showPage(passDevicePage);

		// Remove all ships classes from boards
		domHandler.toggleShips(
			currentOpponent.name,
			currentOpponent.gameboard.board,
			"remove"
		);

		domHandler.toggleShips(
			currentPlayer.name,
			currentPlayer.gameboard.board,
			"remove"
		);

		passDeviceBtn.addEventListener("click", () => {
			domHandler.showGameboard(currentOpponent.name);
			domHandler.showPage(battlePage);
		});

		// handle attack for every cell
		const cells = document.querySelectorAll(".board-cell");
		cells.forEach((cell) => {
			cell.addEventListener("click", () => {
				const result = handleAttack(cell);

				if (result == "miss") {
					swapTurns();
					updatePhaseTitle(
						`Let's battle! It's ${currentPlayer.name}'s turn`
					);
					domHandler.showPage(passDevicePage);
				} else if (result == "gameOver") {
					gameOver();
				} else if (result == "prevShoot") {
					alert("You attacked that cell already");
				}
			});
		});
	}

	function moveBoard(board, container) {
		container.appendChild(board);
	}

	function updatePhaseTitle(message) {
		phaseTitle.textContent = message;
	}
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
				domHandler.toggleShips(
					player.name,
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
	const SHIPLENGTHS = [1];
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
	currentOpponent = currentPlayer == player2 ? player1 : player2;
}

function gameOver() {
	alert(`${currentPlayer.name} won`);
}
