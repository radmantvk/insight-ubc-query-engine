import Section from "./Section";

export default class Course {
	private readonly sections: Section[] = [];

	constructor(sections: Section[]) {
		this.sections = sections;
	}

	// toString method looping through the section and creating the json.

}

