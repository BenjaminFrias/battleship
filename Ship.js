export class Ship {
	constructor(length) {
		this.length = length;
		this.hits = 0;
		this.isDestroyed = false;
	}

	hit() {
		this.hits++;

		if (this.isSunk()) {
			this.isDestroyed = true;
		}
	}

	isSunk() {
		return this.length - this.hits == 0 ? true : false;
	}
}
