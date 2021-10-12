import Section from "./Course";
import Course from "./Course";

export default class Dataset {
	private readonly id: string;
	private readonly courses: Course[];
	constructor(id: string, courses: Course[]) {
		this.id = id;
		this.courses = courses;
	}
	public load(): void {
		return;
	}
	public store(): void {
		return;
	}
}

