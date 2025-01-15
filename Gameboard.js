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
		this.ships.push(ship);
	}

	receiveAttack(coordinates) {
		const coordString = coordinates.toString();

		// If coordinates exist in previous shoots, return
		if (this.prevShoots.has(coordString)) {
			return "already shooted";
		}

		// If coordinates exist in board, hit ship
		if (this.board.has(coordString)) {
			const ship = this.board.get(coordString);
			ship.hit();
		}

		this.prevShoots.set(coordString, coordinates);
	}

	areAllShipsSunk() {
		return this.ships.every((ship) => ship.isDestroyed);
	}

	getPreviousShoots() {
		return Array.from(this.prevShoots.values());
	}

	getCoordinates(coordinates) {
		const string = coordinates.toString();
		return this.board.get(string) || null;
	}
}
