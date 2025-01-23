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
