import { Ship } from "./Ship";
import { Gameboard } from "./Gameboard";

it("Ship object creation", () => {
	const ship = new Ship(2);
	ship.hit();
	ship.hit();
	expect(ship.isSunk()).toBeTruthy();
});

it("Gameboard: Placing a ship in specific coordinates", () => {
	const gameboard = new Gameboard();
	const ship = new Ship(2);
	const coordinates = [
		[1, 2],
		[1, 3],
	];
	gameboard.placeShip(ship, coordinates);

	expect(gameboard.getCoordinates(coordinates[0])).toEqual({
		hits: 0,
		isDestroyed: false,
		length: 2,
	});
});
it("Gameboard: Get previous shoots", () => {
	const gameboard = new Gameboard();
	const ship = new Ship(2);
	const coordinates = [
		[1, 2],
		[1, 3],
	];
	gameboard.placeShip(ship, coordinates);
	gameboard.receiveAttack([1, 2], ship);

	expect(gameboard.getPreviousShoots()).toEqual([[1, 2]]);
});
