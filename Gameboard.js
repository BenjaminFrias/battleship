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
			this.board.set(singleCoorString, ship);
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
		// if (!coordinates) {
		// 	return false;
		// }

		// // if (typeof coordinates != "string") {
		// // 	return false;
		// // }

		if (coordinates.includes(",")) {
			const splittedCoords = coordinates
				.split(",")
				.filter((item) => item != "");

			// Check for coordinate length
			if (splittedCoords.length != mustLength) {
				return false;
			}

			// Validate coordinate format
			const areCoordsValid = splittedCoords.every((coord) =>
				this.validateSingleCoord(coord)
			);

			if (!areCoordsValid) {
				return false;
			}

			// Check for repeated values;
			const repeatedCoords = this.hasRepeatedCoords(splittedCoords);
			if (repeatedCoords) {
				return false;
			}

			// Check if coords already exist in board
			const transformedCoords = this.transformCoordinates(
				splittedCoords.join("")
			);
			const isCellOccupied = this.checkExistingCoords(transformedCoords);

			if (isCellOccupied) {
				return false;
			}

			return true;
		} else {
			if (mustLength > 1 || !this.validateSingleCoord(coordinates)) {
				return false;
			}

			const transformedCoords = this.transformCoordinates(coordinates);
			const isCellOccupied = this.checkExistingCoords(transformedCoords);
			if (isCellOccupied) {
				return false;
			}
		}

		return true;
	}

	validateSingleCoord(coord) {
		const singleCoordRegex = /^[a-j](?:[1-9]|10)$/i;
		return singleCoordRegex.test(coord);
	}

	hasRepeatedCoords(coords) {
		for (let i = 0; i < coords.length - 1; i++) {
			for (let j = i + 1; j < coords.length; j++) {
				if (coords[i] == coords[j]) {
					return true;
				}
			}
		}
		return false;
	}

	checkExistingCoords(coords) {
		for (let i = 0; i < coords.length; i++) {
			const coordString = coords[i].toString();

			if (this.board.has(coordString)) {
				return true;
			} else {
				return false;
			}
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
