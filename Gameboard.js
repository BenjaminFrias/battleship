export class Gameboard {
	constructor() {
		this.board = new Map();
	}

	placeShip(ship, shipCoords) {
		for (let i = 0; i < shipCoords.length; i++) {
			const singleCoordinate = shipCoords[i];
			const singleCoorString = singleCoordinate.toString();

			if (!this.board.has(singleCoorString)) {
				this.board.set(singleCoorString, {
					ship: ship,
					isAttacked: false,
				});
			} else {
				throw Error("This coordinate has a ship already");
			}
		}
	}

	getCoordinates(coordinates) {
		const string = coordinates.toString();
		return this.board.get(string);
	}
}
