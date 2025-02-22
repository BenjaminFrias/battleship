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
const currentAttackBoard = gameboardsContainer.querySelector(
	".current-attack-board"
);
const currentOpponentAttackBoard = gameboardsContainer.querySelector(
	".current-attack-board"
);
const passDevicePage = document.querySelector("#pass-device-page");
const passDeviceBtn = document.querySelector("#pass-btn");
const startGameBtn = document.querySelector("#start-game-btn");
const restartGameBtn = document.querySelector("#restart-game-btn");
const returnHomeBtn = document.querySelector("#return-home-btn");
const startPlacingBtn = document.querySelector("#start-placing-btn");
const shipLengthTitle = document.querySelector("#ship-length");
const coordInput = coordsContainer.querySelector("#coord-input");
const coordSubmitBtn = coordsContainer.querySelector("#coord-submit");
const randomPlacementBtn = document.querySelector("#random-placement");
const currentPlaceGameboard = document.querySelector(
	"#current-placing-gameboard"
);
const continueBtn = document.querySelector("#continue-placing-btn");

// TODO: Refactor: Change battle phase to a single attacking page

// TODO: Feature: Place ships coords using clicks.
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
		this.handleCoordInputListener = null;
	}

	initializeGame() {
		// Creating Dom handler
		this.domHandler = new DOMHandler();

		// Create gameboards
		this.domHandler.createGameboards();

		// Creating players
		this.player1 = new Player(1, "Player 1", new Gameboard());
		this.player2 = new Player(2, "Player 2", new Gameboard());

		// Set current players
		this.currentPlayer = this.player1;
		this.currentOpponent = this.player2;

		// Get every player's gameboard and assign it to each.
		const playerBoard1 = document.querySelector("#player-gameboard");
		const playerBoard2 = document.querySelector("#opponent-gameboard");
		this.player1.gameboard.boardElement = playerBoard1;
		this.player2.gameboard.boardElement = playerBoard2;
	}

	async startGame() {
		this.resetGame();
		this.initializeGame();

		// PLACEMENT PHASE
		this.domHandler.showPageWithTitle(
			placeShipsPage,
			this.currentPlayer.name
		);

		// Let players take turns for placing
		for (let i = 0; i < 2; i++) {
			this.startPlacementPromise = new Promise((resolve) => {
				this.startPlacingListener = () => {
					startPlacingBtn.removeEventListener(
						"click",
						this.startPlacingListener
					);
					resolve();
				};

				startPlacingBtn.addEventListener(
					"click",
					this.startPlacingListener
				);
			});

			await this.startPlacementPromise;
			await this.placementPhase();
		}

		// BATTLE PHASE
		await this.battlePhase();

		// SHOW WINNER PHASE
		this.gameOver();
	}

	async placementPhase() {
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
			// If player 2 placed their ships, and finish placement.
			this.swapTurns();
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
		let isRandom = false;

		// Create promise to finish the placing when user click continue
		let resolveFinishPromise;
		const finishPromise = new Promise((resolve) => {
			resolveFinishPromise = resolve;
		});

		// Remove hide class
		randomPlacementBtn.classList.remove("hide");
		coordInput.classList.remove("hide");
		coordSubmitBtn.classList.remove("hide");
		shipLengthTitle.classList.remove("hide");

		// Hide continue button
		continueBtn.classList.add("hide");
		continueBtn.addEventListener("click", resolveFinishPromise);

		for (let ship of ships) {
			shipLengthTitle.textContent = `Next ship length: ${ship.length} squares!`;

			let resolveCoordinates;

			// Create promise for async input
			const coordinatePromise = new Promise((resolve) => {
				resolveCoordinates = resolve;
			});

			// Set handleCoordInputListener to the function
			this.handleCoordInputListener = () => {
				let coordinate = coordInput.value;
				this.handleCoordInput.bind(
					this,
					player,
					ship,
					coordinate,
					resolveCoordinates
				)();
			};

			this.handleRandomCoordListener = () => {
				isRandom = true;
				let randomCoordinate = player.gameboard.getRandomCoordinates(
					player,
					ship.length
				);

				this.handleCoordInput.bind(
					this,
					player,
					ship,
					randomCoordinate,
					resolveCoordinates
				)();
			};

			coordSubmitBtn.addEventListener(
				"click",
				this.handleCoordInputListener
			);

			randomPlacementBtn.addEventListener(
				"click",
				this.handleRandomCoordListener
			);

			// Place ships automatically if user click to random
			if (isRandom) {
				let randomCoordinate = player.gameboard.getRandomCoordinates(
					player,
					ship.length
				);

				this.handleCoordInput.bind(
					this,
					player,
					ship,
					randomCoordinate,
					resolveCoordinates
				)();
			}

			// Wait until the current ship is placed
			await coordinatePromise;

			randomPlacementBtn.removeEventListener(
				"click",
				this.handleRandomCoordListener
			);

			coordSubmitBtn.removeEventListener(
				"click",
				this.handleCoordInputListener
			);
		}
		// Show continue button
		continueBtn.classList.remove("hide");

		// Hide coords input elements
		randomPlacementBtn.classList.add("hide");
		coordInput.classList.add("hide");
		coordSubmitBtn.classList.add("hide");
		shipLengthTitle.classList.add("hide");

		await finishPromise;
		continueBtn.removeEventListener("click", resolveFinishPromise);
	}

	handleCoordInput(player, ship, coordinate, resolveCoordinates) {
		const coordResult = player.gameboard.validateCoordinates(
			coordinate,
			ship.length
		);

		// If coordinate is correct, place ship
		if (coordResult) {
			const splittedCoords = coordinate
				.split(",")
				.filter((item) => item != "")
				.join(",");

			const transformedCoords =
				player.gameboard.transformCoordinates(splittedCoords);

			// Place ship and continue placement
			player.gameboard.placeShip(ship, transformedCoords);

			this.domHandler.toggleShips(
				player.id,
				player.gameboard.board,
				"add"
			);
			resolveCoordinates();
			coordInput.value = "";
		} else {
			alert("Invalid coordinate.");
			coordInput.value = "";
		}
	}

	// TODO: show only one start battle phase
	// TODO: show both boards with players name up on it.
	// TODO: Avoid attacking currentPlayer board
	async battlePhase() {
		let resolveBattle;
		const battlePromise = new Promise((resolve) => {
			resolveBattle = resolve;
		});

		this.domHandler.showPageWithTitle(passDevicePage, "");

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

		passDeviceBtn.addEventListener("click", passDevice.bind(this));

		function passDevice() {
			this.domHandler.showPageWithTitle(battlePage, "players");
		}

		// handle attack for every cell
		const cells = document.querySelectorAll(".board-cell");
		cells.forEach((cell) => {
			cell.textContent = "";
			cell.addEventListener("click", () => {
				const result = this.handleAttack(cell);

				// Remove text content when user attacks
				if (result == "miss") {
					this.swapTurns();

					// TODO: show current player name and block currentOpponent board
					this.domHandler.showPageWithTitle(
						passDevicePage,
						this.currentPlayer.name
					);
				} else if (result == "gameOver") {
					resolveBattle();
				} else if (result == "prevShoot") {
					alert("You attacked that cell already");
				}
			});
		});

		await battlePromise;
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
		const SHIPLENGTHS = [5, 3, 3, 2, 2, 2, 1, 1, 1, 1];
		const ships = [];

		for (let i in SHIPLENGTHS) {
			const ship = new Ship(SHIPLENGTHS[i]);
			ships.push(ship);
		}

		return ships;
	}

	gameOver() {
		const winner = this.currentPlayer;
		this.domHandler.showPageWithTitle(winnerPage, winner.name);
	}

	resetGame() {
		// Reset game properties
		this.domHandler = null;
		this.player1 = null;
		this.player2 = null;
		this.currentPlayer = this.player1;
		this.currentOpponent = this.player2;

		// Remove boards elements
		gameboardsContainer.textContent = "";

		// Remove event listeners
		startPlacingBtn.removeEventListener("click", this.startPlacingListener);

		coordSubmitBtn.removeEventListener(
			"click",
			this.handleCoordInputListener
		);
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

startGameBtn.addEventListener("click", Game.startGame.bind(Game));
restartGameBtn.addEventListener("click", Game.startGame.bind(Game));
returnHomeBtn.addEventListener("click", Game.returnHome.bind(Game));
