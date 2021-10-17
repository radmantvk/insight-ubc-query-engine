import Course from "./Course";
import Section from "./Section";

export default class Filter {
	private content: any;
	constructor(content: any) {
		this.content = content;
	}

	public handleFilter(sections: Section[]) {
		const keys = Object.keys(this.content);
		if (keys.length === 0) {
			return sections;
		}
		let key = keys[0];

		if (key === "AND" || key === "OR") {
			this.applyLogic(this.content, key);
		}
		if (key === "GT" || key === "LT" || key === "EQ") {
			this.applyMathComparator(this.content, key);
		}
		if (key === "IS") {
			this.applyStringComparator(this.content);
		}
		if (key === "NOT") {
			this.applyNegation(this.content);
		}
		return [];
	}

	public applyMathComparator(body: any, filter: any) {
		if (filter === "GT") {
			this.applyGTFilter(body);
		}
		if (filter === "LT") {
			this.applyLTFilter(body);
		} else {
			this.applyEQFilter(body);
		}
	}

	private applyGTFilter(body: any) {
		return this;
	}

	private applyLTFilter(body: any) {
		return this;
	}

	private applyEQFilter(body: any) {
		return this;
	}

	public applyStringComparator(body: any) {
		return this;
	}

	public applyLogic(body: any, filterVal: any) {
		return this;
	}

	public applyNegation(negation: any) {
		return this;
	}
}
