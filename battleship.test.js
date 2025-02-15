function checkContiguousCoords(coords) {
	let orientation;

	// Check orientation
	let x = coords[0][0];
	let y = coords[0][1];

	if (x + 1 == coords[1][0] && y == coords[1][1]) {
		orientation = "horizontal";
	} else if (y + 1 == coords[1][1] && x == coords[1][0]) {
		orientation = "vertical";
	} else {
		return "not contiguous";
	}

	if (orientation == "horizontal") {
		// Check for horizontal contiguity
		for (let i = 0; i < coords.length - 1; i++) {
			let x = coords[i][0];
			let y = coords[i][1];

			if (x + 1 != coords[i + 1][0] || y != coords[i + 1][1]) {
				return "not horizontally contigougs";
			}
		}
		return true;
	} else if (orientation == "vertical") {
		// Check for vertical contiguity
		for (let i = 0; i < coords.length - 1; i++) {
			let x = coords[i][0];
			let y = coords[i][1];

			if (y + 1 != coords[i + 1][1] || x != coords[i + 1][0]) {
				return "not vertically contigougs";
				return false;
			}
		}
		return true;
	}
}

test("check contiguity", () => {
	const coords = [
		[0, 0],
		[1, 1],
		[2, 0],
	];
	expect(checkContiguousCoords(coords)).toBe(true);
});
