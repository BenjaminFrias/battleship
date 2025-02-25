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
			return false;
		}

		if (typeof coordinates != "string") {
			return false;
		}

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
				splittedCoords.join(",")
			);

			const isCellOccupied = this.checkExistingCoords(transformedCoords);

			if (isCellOccupied) {
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
				return false;
			}

			const transformedCoords = this.transformCoordinates(coordinates);
			const isCellOccupied = this.checkExistingCoords(transformedCoords);
			if (isCellOccupied) {
				return false;
			}

			const shipsAround = this.checkShipsAround(transformedCoords);
			if (shipsAround) {
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
					return true;
				}
			}
		}

		return false;
	}

	getRandomCoordinates(player, coordinateLength) {
		const possibleOrientations = ["horizontal", "vertical"];
		const letters = "ABCDEFGHIJ";

		if (coordinateLength == 1) {
			let coordinate = "";

			const [letterIndex, randomNumber] = getFirstRandomCoord(
				player,
				coordinateLength
			);
			coordinate = letters[letterIndex] + randomNumber;

			return coordinate;
		} else if (coordinateLength > 1) {
			const orientation =
				possibleOrientations[
					Math.floor(Math.random() * possibleOrientations.length)
				];

			// Check every coord from first random coord
			let coordinates = "";
			let isValid = false;

			while (!isValid) {
				coordinates = "";
				let [randomLetterIndex, randomNumber] = getFirstRandomCoord(
					player,
					coordinateLength,
					orientation
				);

				// validate every coord to check if it's valid
				for (let i = 0; i < coordinateLength; i++) {
					let currentLetter = letters[randomLetterIndex];
					coordinates += `${currentLetter + randomNumber}`;

					// Check current coord, if invalid set coords to ""
					if (
						!player.gameboard.validateCoordinates(
							currentLetter + randomNumber,
							1
						)
					) {
						coordinates = "";
					}

					// Check current coordinates
					if (
						!player.gameboard.validateCoordinates(
							coordinates,
							coordinates.split(",").length
						)
					) {
						coordinates = "";
					}

					if (orientation == "horizontal") {
						randomLetterIndex++;
					} else {
						randomNumber++;
					}

					// If isn't last element add ,
					if (i < coordinateLength - 1) {
						coordinates += ",";
					}

					// If last element and random coordinate is equal to coordinates length finish.
					if (
						i == coordinateLength - 1 &&
						coordinates.split(",").length == coordinateLength
					) {
						isValid = true;
					}
				}
			}

			return coordinates;
		}

		function getFirstRandomCoord(player, coordinateLength, orientation) {
			const letters = "ABCDEFGHIJ";
			const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 10];
			const MAX_RANGE = 10;

			let firstRandomCoord;
			let randomLetterIndex;
			let randomNumber;
			let indexToBeChecked = 100;

			while (
				!player.gameboard.validateCoordinates(firstRandomCoord, 1) ||
				indexToBeChecked > MAX_RANGE - coordinateLength
			) {
				randomLetterIndex = Math.floor(Math.random() * MAX_RANGE);
				randomNumber = numbers[Math.floor(Math.random() * MAX_RANGE)];

				firstRandomCoord = letters[randomLetterIndex] + randomNumber;

				if (orientation == "horizontal") {
					indexToBeChecked = randomLetterIndex;
				} else {
					indexToBeChecked = randomNumber;
				}
			}

			return [randomLetterIndex, randomNumber];
		}
	}

	getSingleRandomCoord() {
		const letters = "ABCDEFGHIJ";
		const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 10];

		let singleRandomCoord;
		let randomLetterIndex;
		let randomNumber;
		let MAX_RANGE = 9;

		randomLetterIndex = Math.floor(Math.random() * MAX_RANGE);
		randomNumber = numbers[Math.floor(Math.random() * MAX_RANGE)];
		singleRandomCoord = letters[randomLetterIndex] + randomNumber;

		return singleRandomCoord;
	}

	areAllShipsSunk() {
		return this.ships.every((obj) => obj.ship.isDestroyed);
	}

	getPreviousShoots() {
		return Array.from(this.prevShoots.keys());
	}

	setPreviousShoot(coord) {
		// Coord = [0,1] => "0,1"
		const coordString = coord.toString();
		this.prevShoots.set(coordString);
	}

	getCoordinates(coordinates) {
		const string = coordinates.toString();
		return this.board.get(string) || null;
	}
}
