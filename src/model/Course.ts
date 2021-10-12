import Section from "./Section";

export default class Course {
	private readonly _sections: Section[] = [];
	private readonly _id: string;

	constructor(id: string, sections: Section[]) {
		this._sections = sections;
		this._id = id;
	}

// toString method looping through the section and creating the json.

	public toJson(): string {
		let jsonString = "[";
		for (const section of this._sections) {
			jsonString += section.toJson() + ", ";
		}
		jsonString += "]";
		return jsonString;
	}

	public get id(): string {
		return this._id;
	}

	public get sections(): Section[] {
		return this._sections;
	}
}

