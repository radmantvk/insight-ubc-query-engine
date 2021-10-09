export default class Section {
	private readonly dept: string; // saved as subject
	private readonly id: string; // file name
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
		this.dept = dept;
		this.id = id;
		this.avg = avg;
		this.instructor = instructor;
		this.title = title;
		this.pass = pass;
		this.fail = fail;
		this.audit = audit;
		this.uuid = uuid;
		this.year = year;
	}

	private toString() {
		JSON.stringify(this);
	}
}
