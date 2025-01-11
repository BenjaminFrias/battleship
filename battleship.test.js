import { Ship } from "./Ship";

it("Ship object creation", () => {
	const destroyer = new Ship(2);
	destroyer.hit();
	destroyer.hit();
	expect(destroyer.isSunk()).toBeTruthy();
});
