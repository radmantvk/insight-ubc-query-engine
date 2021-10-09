import Section from "./Section";

export default class Course {
	private readonly sections: Section[] = [];

	constructor(sections: Section[]) {
		this.sections = sections;
		sections[0].toJson();
	}

	// toString method looping through the section and creating the json.

	public toJson(): string {
		let jsonString = "[";
		for (const section of this.sections) {
			jsonString += section.toJson() + ", ";
		}
		jsonString += "]";
		return jsonString;
	}
}

