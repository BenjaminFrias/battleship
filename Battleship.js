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
class GameManager {
	constructor() {
		this.domHandler = null;
		this.player1 = null;
		this.player2 = null;
		this.currentPlayer = this.player1;
		this.currentOpponent = this.player2;
		this.startPlacingListener = null;
	}

	initializeGame() {
		// Creating Dom handler
		this.domHandler = new DOMHandler();

		// Create gameboards
		this.domHandler.createGameboards();

		// Creating players
		this.player1 = new Player(1, "P1", new Gameboard());
		this.player2 = new Player(2, "P2", new Gameboard());

		// Set current players
		this.currentPlayer = this.player1;
		this.currentOpponent = this.player2;

		// Get every player's gameboard and assign it to each.
		const playerBoard1 = document.querySelector("#player-gameboard");
		const playerBoard2 = document.querySelector("#opponent-gameboard");
		this.player1.gameboard.boardElement = playerBoard1;
		this.player2.gameboard.boardElement = playerBoard2;

		// TODO: fix the this thing in start placing phase
		// Add event listener to start placing btn
		this.startPlacingListener = this.startPlacingPhase;
		startPlacingBtn.addEventListener(
			"click",
			this.startPlacingListener.bind(this)
		);
	}

	startGame() {
		this.initializeGame();

		// Placement phase
		this.domHandler.showPageWithTitle(
			placeShipsPage,
			this.currentPlayer.name
		);
	}

	async startPlacingPhase() {
		// move board and show title
		moveBoard(
			this.currentPlayer.gameboard.boardElement,
			currentPlaceGameboard
		);
		this.domHandler.showPageWithTitle(
			setCoordsPage,
			this.currentPlayer.name
		);

		// Manage placing players' turns
		await this.handlePlaceShip(this.currentPlayer);

		moveBoard(
			this.currentPlayer.gameboard.boardElement,
			gameboardsContainer
		);

		// Handle placement turns
		if (this.currentPlayer == this.player2) {
			// If player 2 placed their ships, move to next phase
			this.swapTurns();
			this.startBattlePhase();
		} else {
			// If player 1 placed ships, let player2 place their ships.
			this.swapTurns();
			this.domHandler.showPageWithTitle(
				placeShipsPage,
				this.currentPlayer.name
			);
			moveBoard(
				this.currentPlayer.gameboard.boardElement,
				currentPlaceGameboard
			);
		}

		function moveBoard(board, container) {
			container.appendChild(board);
		}
	}

	async handlePlaceShip(player) {
		const ships = this.createShips();
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
					this.domHandler.toggleShips(
						player.id,
						player.gameboard.board,
						"add"
					);
					resolveCoordinates(transformedCoords);

					// Remove event listener and avoid creating several ones
					coordSubmitBtn.removeEventListener(
						"click",
						handleCoordInput
					);

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

	startBattlePhase() {
		this.domHandler.showPageWithTitle(passDevicePage, currentPlayer.name);

		// Remove all ships classes from boards
		this.domHandler.toggleShips(
			this.currentOpponent.id,
			this.currentOpponent.gameboard.board,
			"remove"
		);

		this.domHandler.toggleShips(
			this.currentPlayer.id,
			this.currentPlayer.gameboard.board,
			"remove"
		);

		passDeviceBtn.addEventListener("click", passDevice);

		function passDevice() {
			this.domHandler.showPageWithTitle(
				battlePage,
				this.currentOpponent.name
			);
			this.domHandler.showGameboard(this.currentOpponent.id);
		}

		// handle attack for every cell
		const cells = document.querySelectorAll(".board-cell");
		cells.forEach((cell) => {
			cell.textContent = "";
			cell.addEventListener("click", () => {
				const result = handleAttack(cell);

				// Remove text content when user attacks
				if (result == "miss") {
					this.swapTurns();

					this.domHandler.showPageWithTitle(
						passDevicePage,
						this.currentPlayer.name
					);
				} else if (result == "gameOver") {
					this.gameOver();
				} else if (result == "prevShoot") {
					alert("You attacked that cell already");
				}
			});
		});
	}

	handleAttack(cell) {
		const coords = Array.from(cell.dataset.coords.split("-").map(Number));
		const clickedBoard = cell.classList[1];
		let player;

		if (clickedBoard == "player-gameboard") {
			player = this.player1;
		} else {
			player = this.player2;
		}

		const attackResult = player.gameboard.receiveAttack(coords);

		if (attackResult instanceof Ship) {
			if (attackResult.isSunk()) {
				player.gameboard.destroyShip(
					player,
					clickedBoard,
					attackResult
				);
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

	createShips() {
		const SHIPLENGTHS = [2, 1];
		const ships = [];

		for (let i in SHIPLENGTHS) {
			const ship = new Ship(SHIPLENGTHS[i]);
			ships.push(ship);
		}

		return ships;
	}

	gameOver() {
		const winner = currentPlayer;
		this.domHandler.showPageWithTitle(winnerPage, winner.name);
	}

	restartValues() {
		this.domHandler = null;
		this.player1 = null;
		this.player2 = null;
		this.currentPlayer = this.player1;
		this.currentOpponent = this.player2;
		this.startPlacingListener = null;

		// Remove boards elements
		gameboardsContainer.textContent = "";
		startPlacingBtn.removeEventListener("click", this.startPlacingListener);
	}

	returnHome() {
		this.domHandler.showPageWithTitle(startGamePage);
	}

	swapTurns() {
		[this.currentPlayer, this.currentOpponent] = [
			this.currentOpponent,
			this.currentPlayer,
		];
	}
}

const Game = new GameManager();

startGameBtn.addEventListener("click", () => {
	Game.restartValues();
	Game.startGame();
});

returnHomeBtn.addEventListener("click", () => {
	Game.returnHome();
});

restartGameBtn.addEventListener("click", () => {
	Game.restartValues();
	Game.startGame();
});
