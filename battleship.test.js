import { Ship } from "./Ship";
import { Gameboard } from "./Gameboard";
function validateCoordinate(coordinates, mustLength) {
	if (!coordinates) {
		return false;
	}

	if (typeof coordinates != "string") {
		return false;
	}

	if (coordinates.includes(",")) {
		const splittedCoords = coordinates
			.split(",")
			.filter((item) => item != "");

		if (splittedCoords.length != mustLength) {
			return false;
		}

		const areCoordsValid = splittedCoords.every((coord) =>
			validateSingleCoord(coord)
		);

		return areCoordsValid;
	} else {
		if (mustLength > 1 || !validateSingleCoord(coordinates)) {
			return false;
		}
	}

	function validateSingleCoord(coord) {
		const singleCoordRegex = /^[a-j](?:[1-9]|10)$/i;
		return singleCoordRegex.test(coord);
	}

	return true;
}

const testCases = [
	{ input: "A1", expected: true },
	{ input: "a1", expected: true },
	{ input: "J10", expected: true },
	{ input: "j10", expected: true },
	{ input: "B4", expected: true },
	{ input: "a10", expected: true },
	{ input: "J1", expected: true },
	{ input: "z1", expected: false },
	{ input: "A11", expected: false },
	{ input: "A0", expected: false },
	{ input: "A", expected: false },
	{ input: "1A", expected: false },
	{ input: "A 1", expected: false },
	{ input: "AA1", expected: false },
	{ input: "A1A", expected: false },
	{ input: "10A", expected: false },
	{ input: "A10A", expected: false },
	{ input: "a-1", expected: false },
	{ input: "a,1", expected: false },
	{ input: "A.1", expected: false },
];

describe("validateCoordinate", () => {
	testCases.forEach((testCase) => {
		test(`"${testCase.input}" should return ${testCase.expected}`, () => {
			expect(validateCoordinate(testCase.input, 1)).toBe(
				testCase.expected
			);
		});
	});
});

// it("Ship object creation", () => {
// 	const ship = new Ship(2);
// 	ship.hit();
// 	ship.hit();
// 	expect(ship.isSunk()).toBeTruthy();
// });

// it("Gameboard: Placing a ship in specific coordinates", () => {
// 	const gameboard = new Gameboard();
// 	const ship = new Ship(2);
// 	const coordinates = [
// 		[1, 2],
// 		[1, 3],
// 	];
// 	gameboard.placeShip(ship, coordinates);

// 	expect(gameboard.getCoordinates(coordinates[0])).toEqual({
// 		hits: 0,
// 		isDestroyed: false,
// 		length: 2,
// 	});
// });

// it("Gameboard: Get previous shoots", () => {
// 	const gameboard = new Gameboard();
// 	const ship = new Ship(2);
// 	const coordinates = [
// 		[1, 2],
// 		[1, 3],
// 	];
// 	gameboard.placeShip(ship, coordinates);
// 	gameboard.receiveAttack([1, 2], ship);

// 	expect(gameboard.getPreviousShoots()).toEqual([[1, 2]]);
// });

// it("Gameboard: Report all ships have been sunk", () => {
// 	const gameboard = new Gameboard();
// 	const ship = new Ship(2);
// 	ship.hit();
// 	ship.hit();

// 	const coordinates = [
// 		[1, 2],
// 		[1, 3],
// 	];
// 	gameboard.placeShip(ship, coordinates);

// 	expect(gameboard.areAllShipsSunk()).toBeTruthy();
// });
