import Course from "./Course";
import Section from "./Section";
import {query} from "express";

export default class Filter {
	private filteredSections: Section[] = [];

	public handleFilter(sections: Section[], content: any, negation: boolean) {
		const keys = Object.keys(content);
		let key = keys[0];

		if (key === "GT" || key === "LT" || key === "EQ") {
			this.applyMathFilter(content, key, sections, negation);
		}
		if (key === "IS") {
			this.applyStringComparator(content, sections, negation);
		}
		if (key === "NOT") {
			this.applyNegation(content, sections, negation);
		}
		return [];
	}

	private applyMathFilter(content: any, key: any, sections: Section[], negation: boolean) {
		let filterKey: any = content[key];
		let mKey = Object.keys(filterKey)[0];
		let bound = filterKey[mKey];
		let mField = mKey.split("_")[1];

		for (let section of sections) {
			switch (filterKey) {
				case "LT":
					this.applyLTFilter(section, mField, bound, negation);
					break;
				case "GT":
					this.applyGTFilter(section, mField, bound, negation);
					break;
				case "EQ":
					this.applyEQFilter(section, mField, bound, negation);
			}
		}
	}

	private applyLTFilter(section: any, mField: any, bound: any, negation: boolean) {
		let sectField = this.getMField(mField, section);
		if (negation) {
			if (!(sectField < bound)) {
				this.filteredSections.push(section);
			}
		}
		if (sectField < bound) {
			this.filteredSections.push(section);
		}
	}

	private applyGTFilter(section: any, mField: any, bound: any, negation: boolean) {
		let sectField = this.getMField(mField, section);

		if (negation) {
			if (!(sectField > bound)) {
				this.filteredSections.push(section);
			}
		}

		if (sectField > bound) {
			this.filteredSections.push(section);
		}
	}

	private applyEQFilter(section: any, mField: any, bound: any, negation: boolean) {
		let sectField = this.getMField(mField, section);

		if (negation) {
			if (sectField !== bound) {
				this.filteredSections.push(section);
			}
		}
		if (sectField === bound) {
			this.filteredSections.push(section);
		}
	}

	private applyStringComparator(content: any, sections: Section[], negation: boolean) {
		let filterKey: any = content["IS"];
		let sKey = Object.keys(filterKey)[0];
		let val = filterKey[sKey];
		let sField = sKey.split("_")[1];

		for (let section of sections) {
			let sectField = this.getSField(sField, section);

			// switch (sField) {
			// 	case "dept":
			// 		if (val.charAt(0) === "*") {
			// 			if (section.dept.toString().charAt(1) === val.charAt(1)) {
			// 				this.filteredSections.push(section);
			// 			}
			// 		}
			// 		if (val.charAt(val.length - 1) === "*") {
			// 			if (section.dept.toString().charAt(section.dept.toString().length - 1) ===
			// 				val.charAt(val.length - 2)) {
			// 				this.filteredSections.push(section);
			// 			}
			// 		}
			// 		if (val === section.dept.toString()) {
			// 			this.filteredSections.push(section);
			// 		}
			// }
		}

	}

	private applyLogic(body: any, filterVal: any, section: Section[], negation: boolean) {
		return this;
	}

	private applyNegation(content: any, sections: Section[], negation: boolean) {
		let notFilter = content["NOT"];
		this.handleFilter(sections, notFilter, !negation);
	}

	private getMField(mField: any, section: any) {
		if (mField === "avg") {
			return section._avg;
		}
		if (mField === "pass") {
			return section._pass;
		}
		if (mField === "fail") {
			return section._fail;
		}
		if (mField === "audit") {
			return section._audit;
		}
		if (mField === "year") {
			return section._year;
		}
	}

	private getSField(sField: any, section: any) {
		if (sField === "dept") {
			return section._dept;
		}
		if (sField === "id") {
			return section._id;
		}
		if (sField === "instructor") {
			return section._instructor;
		}
		if (sField === "title") {
			return section._title;
		}
		if (sField === "uuid") {
			return section._uuid;
		}
	}
}
