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
		// TODO: feature: check ships around function
		if (!coordinates) {
			console.log("no value received");

			return false;
		}

		if (typeof coordinates != "string") {
			console.log("no strign");
			return false;
		}

		if (coordinates.includes(",")) {
			const splittedCoords = coordinates
				.split(",")
				.filter((item) => item != "");

			// Check for coordinate length
			if (splittedCoords.length != mustLength) {
				console.log("no length");
				return false;
			}

			// Validate coordinate format
			const areCoordsValid = splittedCoords.every((coord) =>
				this.validateSingleCoord(coord)
			);

			if (!areCoordsValid) {
				console.log("every coord is not valid");
				return false;
			}

			// Check for repeated values;
			const repeatedCoords = this.hasRepeatedCoords(splittedCoords);
			if (repeatedCoords) {
				console.log("repeated coords");
				return false;
			}

			// Check if coords already exist in board
			const transformedCoords = this.transformCoordinates(
				splittedCoords.join(",")
			);

			const isCellOccupied = this.checkExistingCoords(transformedCoords);

			if (isCellOccupied) {
				console.log("cell are occupied");
				return false;
			}

			const contiguityResult =
				this.checkContiguousCoords(transformedCoords);

			if (!contiguityResult) {
				return false;
			}

			const shipsAround = this.checkShipsAround(transformedCoords);

			if (shipsAround) {
				return false;
			}

			return true;
		} else {
			if (mustLength > 1 || !this.validateSingleCoord(coordinates)) {
				console.log(
					"single cell no valid because of length or validation"
				);
				return false;
			}

			const transformedCoords = this.transformCoordinates(coordinates);
			const isCellOccupied = this.checkExistingCoords(transformedCoords);
			if (isCellOccupied) {
				console.log("single cell ocupiedd");

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
			}
		}

		return false;
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

	checkContiguousCoords(coords) {
		let orientation;

		// Check orientation
		let x = coords[0][0];
		let y = coords[0][1];

		if (x + 1 == coords[1][0] && y == coords[1][1]) {
			orientation = "horizontal";
		} else if (y + 1 == coords[1][1] && x == coords[1][0]) {
			orientation = "vertical";
		} else {
			return false;
		}

		if (orientation == "horizontal") {
			// Check for horizontal contiguity
			for (let i = 0; i < coords.length - 1; i++) {
				let x = coords[i][0];
				let y = coords[i][1];

				if (x + 1 != coords[i + 1][0] || y != coords[i + 1][1]) {
					return false;
				}
			}
			return true;
		} else if (orientation == "vertical") {
			// Check for vertical contiguity
			for (let i = 0; i < coords.length - 1; i++) {
				let x = coords[i][0];
				let y = coords[i][1];

				if (y + 1 != coords[i + 1][1] || x != coords[i + 1][0]) {
					return false;
				}
			}
			return true;
		}
	}

	checkShipsAround(coords) {
		// Pass through every cell around the provided coords
		for (let i = 0; i < coords.length; i++) {
			const coordsAround = [
				[-1, 0],
				[-1, -1],
				[0, -1],
				[1, -1],
				[1, 0],
				[1, +1],
				[0, +1],
				[-1, +1],
			];

			// Check every cell around with the coordsAround tests
			for (let j = 0; j < coordsAround.length; j++) {
				let checkX = coords[i][0] + coordsAround[j][0];
				let checkY = coords[i][1] + coordsAround[j][1];

				// Check if the cell around is in board
				if (this.board.has([checkX, checkY].toString())) {
					console.log("THERE IS A SHIP:", [checkX, checkY]);
					return true;
				}
			}
		}

		return false;
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
