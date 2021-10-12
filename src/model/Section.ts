

export default class Section {
	private readonly _dept: string; // saved as subject "aanb"
	private readonly _id: string; // file name  "551"
	private readonly avg: number; // possibly sort base on average
	private readonly instructor: string;
	private readonly title: string;
	private readonly pass: number;
	private readonly fail: number;
	private readonly audit: number
	private readonly uuid: string; // saved as id
	private readonly year: number;

	constructor(dept: string, id: string, avg: number, instructor: string, title: string, pass: number,
		fail: number, audit: number, uuid: string, year: number) {
		this._dept = dept;
		this._id = id;
		this.avg = avg;
		this.instructor = instructor;
		this.title = title;
		this.pass = pass;
		this.fail = fail;
		this.audit = audit;
		this.uuid = uuid;
		this.year = year;
	}

	public toJson(): string {
		return JSON.stringify({
			dept: this._dept,
			id: this._id,
			avg: this.avg,
			instructor: this.instructor,
			title: this.title,
			pass: this.pass,
			fail: this.fail,
			audit: this.audit,
			uuid: this.uuid,
			year: this.year
		});
	}

	public get dept(): string {
		return this._dept;
	}

	public get id(): string {
		return this._id;
	}
}

