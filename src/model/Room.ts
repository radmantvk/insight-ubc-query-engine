import Section from "./Section";
import Building from "./Building";

export default class Room extends Building {
	private readonly _number: string;    // 201
	private readonly _name: string;      // rooms_shortname+"_"+rooms_number ("DMP-201")
	private readonly _seats: number;   // default = 0
	private readonly _type: string;      // "Small Group"
	private readonly _furniture: string; // "Classroom-Movable Tables & Chairs"

	constructor(fullname: string, shortname: string, number: string, name: string, address: string, lat: number,
		lon: number, seats: number, type: string, furniture: string, href: string) {
		super(fullname, shortname, address, lat, lon, href);
		this._number = number;
		this._name = name;
		this._seats = seats;
		this._type = type;
		this._furniture = furniture;
	}

// toString method looping through the section and creating the json.

	public toJson(): string {
		return JSON.stringify({
			fullname: this.fullname,
			shortname: this.shortname,
			address: this.address,
			href: this.href,
			lat: this.lat,
			lon: this.lon,
			number: this._number,
			name: this._name,
			seats: this._seats,
			type: this._type,
			furniture: this._furniture,
		});
	}

	public get number(): string {
		return this._number;
	}

	public get name(): string {
		return this._name;
	}

	public get seats(): number {
		return this._seats;
	}

	public get type(): string {
		return this._type;
	}

	public get furniture(): string {
		return this._furniture;
	}
}

