export class Gameboard {
	constructor() {
		this.board = new Map();
		this.prevShoots = new Map();
		this.ships = [];
	}

	placeShip(ship, shipCoords) {
		for (let i = 0; i < shipCoords.length; i++) {
			const singleCoordinate = shipCoords[i];
			const singleCoorString = singleCoordinate.toString();

			if (!this.board.has(singleCoorString)) {
				this.board.set(singleCoorString, ship);
			} else {
				throw Error("This coordinate has a ship already");
			}
		}
		this.ships.push({ ship: ship, coords: shipCoords });
	}

	destroyShip(player, board, ship) {
		ship.isDestroyed = true;

		const coordinates = player.gameboard.getShipCoordinates(ship);
		for (let coord of coordinates) {
			const cell = document.querySelector(
				`#${board} > .board-cell[data-coords="${coord.join("-")}"]`
			);

			cell.classList.add("destroyed");
		}
	}

	receiveAttack(coordinates) {
		const coordString = coordinates.toString();

		// If coordinates exist in previous shoots, return
		if (this.prevShoots.has(coordString)) {
			return "prevShoot";
		}

		this.prevShoots.set(coordString, coordinates);

		// If coordinates exist in board, hit ship
		if (this.board.has(coordString)) {
			const ship = this.board.get(coordString);
			ship.hit();
			return ship;
		} else {
			return "miss";
		}
	}

	getShipCoordinates(ship) {
		for (const shipData of this.ships) {
			if (shipData.ship === ship) {
				return shipData.coords;
			}
		}
		return null;
	}

	validateCoordinates(coordinates, mustLength) {
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

		return true;

		function validateSingleCoord(coord) {
			const singleCoordRegex = /^[a-j](?:[1-9]|10)$/i;
			return singleCoordRegex.test(coord);
		}
	}

	transformCoordinates(coords) {
		if (coords.includes(",")) {
			const coordElements = coords.split(",");
			const coordinates = [];

			for (let coord of coordElements) {
				const formmatedCoord = transformSingleCoord(coord);
				coordinates.push(formmatedCoord);
			}

			return coordinates;
		} else {
			return [transformSingleCoord(coords)];
		}

		function transformSingleCoord(coordinate) {
			const x = coordinate[0].toUpperCase().charCodeAt(0) - 65;
			const y = parseInt(coordinate.slice(1)) - 1;

			return [x, y];
		}
	}

	areAllShipsSunk() {
		return this.ships.every((obj) => obj.ship.isDestroyed);
	}

	getPreviousShoots() {
		return Array.from(this.prevShoots.keys());
	}

	getCoordinates(coordinates) {
		const string = coordinates.toString();
		return this.board.get(string) || null;
	}
}
