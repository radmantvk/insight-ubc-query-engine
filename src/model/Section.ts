export default class Section {
	public readonly _dept: string; // saved as subject "aanb"
	public readonly _id: string; // file name  "551"
	public readonly _avg: number; // possibly sort base on average
	public readonly _instructor: string;
	public readonly _title: string;
	public readonly _pass: number;
	public readonly _fail: number;
	public readonly _audit: number
	public readonly _uuid: string; // saved as id
	public readonly _year: number;


	constructor(dept: string, id: string, avg: number, instructor: string, title: string, pass: number,
		fail: number, audit: number, uuid: any, year: number) {
		this._dept = dept;
		this._id = id;
		this._avg = avg;
		this._instructor = instructor;
		this._title = title;
		this._pass = pass;
		this._fail = fail;
		this._audit = audit;
		if (typeof uuid === "number") {
			this._uuid = uuid.toString();
		} else {
			this._uuid = uuid;
		}
		this._year = year;
	}

	public get dept(): string {
		return this._dept;
	}

	public get id(): string {
		return this._id;
	}

	public get avg(): number {
		return this._avg;
	}

	public get instructor(): string {
		return this._instructor;
	}

	public get title(): string {
		return this._title;
	}

	public get pass(): number {
		return this._pass;
	}

	public get fail(): number {
		return this._fail;
	}

	public get audit(): number {
		return this._audit;
	}

	public get uuid(): string {
		return this._uuid;
	}

	public get year(): number {
		return this._year;
	}
}
