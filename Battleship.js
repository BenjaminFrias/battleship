import { Ship } from "./Ship.js";
import { Gameboard } from "./Gameboard.js";
import { Player } from "./Player.js";
import { DOMHandler } from "./DOMHandler.js";

const player1 = new Player("real", new Gameboard());
const player2 = new Player("real", new Gameboard());

const coordinates = [
	[0, 0],
	[0, 1],
];
const ship = new Ship(coordinates.length);
player1.gameboard.placeShip(ship, coordinates);

const coordinates2 = [
	[0, 0],
	[0, 1],
	[0, 2],
];
const ship2 = new Ship(coordinates.length);
player2.gameboard.placeShip(ship2, coordinates);

const domHandler = new DOMHandler();
domHandler.createGameboard();
domHandler.placeShipInBoard(coordinates2);
