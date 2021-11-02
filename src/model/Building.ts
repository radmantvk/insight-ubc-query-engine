import Section from "./Section";

// old
export default class Building {
	// each row is a building
	// ACU shorName
	// addre
	private readonly _fullname: string; // "Hugh Dempster Pavilion" -> ACEN.html
	private readonly _shortname: string; // DMP
	private readonly _address: string;  // "6245 Agronomy Road V6T 1Z4"
	public readonly _href: string; // "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201"
	private readonly _lat: number;
	private readonly _lon: number;

	constructor(fullname: string, shortname: string, address: string, lat: number,
		lon: number, href: string) {
		this._fullname = fullname;
		this._shortname = shortname;
		this._address = address;
		this._lat = lat;
		this._lon = lon;
		this._href = href;
	}

// toString method looping through the section and creating the json.

	public toJson(): string {
		// let jsonString = "{";
		// for (const section of this._sections) {
		// 	jsonString += section.toJson() + ", ";
		// }
		// jsonString += "}";
		// return jsonString;
		return JSON.stringify({
			// id: this._id,
			// sections: this._sections
		});
	}

	public get href(): string {
		return this._href;
	}

	public get fullname(): string {
		return this._fullname;
	}

	public get shortname(): string {
		return this._shortname;
	}

	public get address(): string {
		return this._address;
	}

	public get lat(): number {
		return this._lat;
	}

	public get lon(): number {
		return this._lon;
	}
}

