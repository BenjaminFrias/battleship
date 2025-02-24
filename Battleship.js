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
const AttackBoard = gameboardsContainer.querySelector(".current-attack-board");
const OpponentAttackBoard = gameboardsContainer.querySelector(
	".current-opponent-attack-board"
);
const passDevicePage = document.querySelector("#pass-device-page");
const passDeviceBtn = document.querySelector("#pass-btn");
const startGameFriendBtn = document.querySelector("#start-game-vs-friend-btn");
const startGameCPUBtn = document.querySelector("#start-game-vs-computer-btn");
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

// TODO: Feature: vs computer gameplay.
// TODO: Feature: Drag and Drop feature for placing ships.
// TODO: Feature: validate coords to return different errors to show to the user
// TODO: Feature: Ships' graveyard.
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

	async startGame(mode) {
		this.mode = mode;

		this.resetGame();
		this.initializeGame();

		// PLACEMENT PHASE
		this.domHandler.showPageWithTitle(
			placeShipsPage,
			this.currentPlayer.name
		);

		// Let players take turns for placing
		if (mode == "friend") {
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
		} else {
			// Let player 1 place their ships.
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

			// Place cpu ships
			this.handleCpuPlaceShip();

			// Start battle
			this.swapTurns();
			this.battlePhase();

			// TODO: add computer intelligence to attack automatically and randomly

			// Place cpu boards
			this.swapTurns();
		}
	}

	async placementPhase() {
		// move board and show title
		this.domHandler.moveBoard(
			this.currentPlayer.gameboard.boardElement,
			currentPlaceGameboard
		);
		this.domHandler.showPageWithTitle(
			setCoordsPage,
			this.currentPlayer.name
		);

		// Manage placing players' turns
		await this.handlePlaceShip(this.currentPlayer);

		this.domHandler.moveBoard(
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
			this.domHandler.moveBoard(
				this.currentPlayer.gameboard.boardElement,
				currentPlaceGameboard
			);
		}
	}

	handleCpuPlaceShip() {
		const player = this.player2;
		const ships = this.createShips();
		for (let ship of ships) {
			let randomCoordinate = player.gameboard.getRandomCoordinates(
				player,
				ship.length
			);

			this.handleCoordInput(player, ship, randomCoordinate);
		}
	}

	async handlePlaceShip(player) {
		const ships = this.createShips();
		let isRandom = false;

		// Create promise to finish the placing when user click continue
		this.resolveFinishPromise;
		const finishPromise = new Promise((resolve) => {
			this.resolveFinishPromise = resolve;
		});

		// Remove hide class
		randomPlacementBtn.classList.remove("hide");
		coordInput.classList.remove("hide");
		coordSubmitBtn.classList.remove("hide");
		shipLengthTitle.classList.remove("hide");

		// Hide continue button
		continueBtn.classList.add("hide");
		continueBtn.addEventListener("click", this.resolveFinishPromise);

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
		continueBtn.removeEventListener("click", this.resolveFinishPromise);
	}

	handleCoordInput(player, ship, coordinate, resolveCoordinates = null) {
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

			if (resolveCoordinates) {
				resolveCoordinates();
			}
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

		setAttackBoards.bind(this)();

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

		// Handle attack for every cell
		const cells = document.querySelectorAll(".board-cell");

		// Hide each cells' coords
		cells.forEach((cell) => {
			cell.textContent = "";

			// Block player cells in cpu mode
			if (
				this.mode == "cpu" &&
				cell.classList.contains("player-gameboard")
			) {
				cell.classList.add("blocked");
			}
		});

		// attack and receive result of attack and swap turns
		this.handleAttackListener = (cell) => {
			const result = this.handleAttack(cell);

			// Remove text content when user attacks
			if (result == "miss") {
				this.toggleAttackBoards();

				if (this.currentPlayer == this.player2 && this.mode == "cpu") {
					console.log("cpu is thinking");
					setTimeout(() => {
						console.log("player 2 attacked");
						this.cpuAttack();
					}, 1000);
				}
				console.log(
					"Change turns, currPla, currOpo:",
					this.currentPlayer,
					this.currentOpponent
				);
				this.swapTurns();
			} else if (result == "gameOver") {
				resolveBattle();
			} else if (result == "prevShoot") {
				alert("You attacked that cell already");
			} else {
				console.log("hit");

				// if (this.currentPlayer == this.player2 && this.mode == "cpu") {
				// 	console.log("CPU HIT");
				// }
				// if (this.currentPlayer == this.player1 && this.mode == "cpu") {
				// 	console.log("cpu is thinking");
				// 	setTimeout(() => {
				// 		console.log("PLAYER 2 ATTACKED");
				// 		this.cpuAttack();
				// 	}, 1000);
				// }
			}
		};

		// Add handle attack listeners to cells
		cells.forEach((cell) => {
			cell.addEventListener(
				"click",
				this.handleAttackListener.bind(this, cell)
			);
		});

		await battlePromise;

		function setAttackBoards() {
			// Move boards
			this.domHandler.moveBoard(
				this.currentPlayer.gameboard.boardElement,
				AttackBoard
			);

			this.domHandler.moveBoard(
				this.currentOpponent.gameboard.boardElement,
				OpponentAttackBoard
			);

			const player1Name = gameboardsContainer.querySelector(
				"div.current-attack-board > h2"
			);

			const player2Name = gameboardsContainer.querySelector(
				"div.current-opponent-attack-board > h2"
			);

			player1Name.textContent = `${this.currentPlayer.name}'s board`;
			player2Name.textContent = `${this.currentOpponent.name}'s board`;

			// Block current player board
			this.currentPlayer.gameboard.boardElement.classList.add("blocked");
		}
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

	cpuAttack() {
		const player = this.currentPlayer;

		let randomCoordinate;
		let playerCells;
		let cellElement;
		let counter = 0;
		do {
			// Get random coord
			randomCoordinate = player.gameboard.getRandomCoordinates(player, 1);

			const coordNumb =
				player.gameboard.transformCoordinates(randomCoordinate)[0];

			playerCells = document.querySelectorAll(
				`.board-cell.player-gameboard`
			);

			// Get cell element from dataset of random coord
			const cells = Array.from(playerCells);
			cellElement = cells.filter(
				(cell) =>
					cell.dataset.coords == `${coordNumb[0]}-${coordNumb[1]}`
			)[0];

			counter++;
			console.log("counter", counter);

			console.log(coordNumb);
			console.log(cellElement);
			console.log(
				"cell element contains miss or hit?: ",
				cellElement.classList.contains("miss") ||
					cellElement.classList.contains("hit")
			);
		} while (
			(cellElement.classList.contains("miss") ||
				cellElement.classList.contains("hit")) &&
			counter < 10
		);

		console.log("Random attacked cell: ", cellElement);

		this.handleAttackListener(cellElement);
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
		const player1Board = AttackBoard.querySelector("#player-gameboard");
		const player2Board = OpponentAttackBoard.querySelector(
			"#opponent-gameboard"
		);

		if (player1Board && player2Board) {
			player1Board.remove();
			player2Board.remove();
		}

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

	toggleAttackBoards() {
		this.currentOpponent.gameboard.boardElement.classList.remove("blocked");
		this.currentPlayer.gameboard.boardElement.classList.add("blocked");
	}
}

const Game = new GameManager();

startGameFriendBtn.addEventListener(
	"click",
	Game.startGame.bind(Game, "friend")
);

startGameCPUBtn.addEventListener("click", Game.startGame.bind(Game, "cpu"));

restartGameBtn.addEventListener("click", Game.startGame.bind(Game));
returnHomeBtn.addEventListener("click", Game.returnHome.bind(Game));
