import QueryValidator from "./QueryValidator";
import Course from "./Course";
import Filter from "./Filter";
import Section from "./Section";
import QuerySorter from "./QuerySorter";
import {ResultTooLargeError} from "../controller/IInsightFacade";

export interface QueryOBJ {
	WHERE?: QueryFilter;
	OPTIONS?: QueryOptions;
}

export interface QueryOptions {
	COLUMNS?: QueryOptions;
	ORDER?: any;
}

export interface QueryFilter {
	[key: string]: any
}

export interface QueryResult {
	Result: [];
}

export default class Query {
	private courses: Course[] = [];
	private _datasetID: string = "";
	private _query: any;
	constructor(query: any) {
		this._datasetID = query.OPTIONS.COLUMNS[0].split("_")[0];
		this._query = query;
	}

	public get datasetID() {
		return this._datasetID;
	}

	public process(courses: Course[]) {
		let id = "";
		if (!(courses.length === 0)) {
			id = courses[0].id.split("-")[0];
		}
		let filter: Filter = new Filter(this.query.WHERE);
		let sections = this.getSections(courses);
		let filteredSections: Section[] = filter.handleFilter(sections);
		if (filteredSections.length > 5000) {
			return Promise.reject(new ResultTooLargeError());
		}
		let sortedSection: Section[] = this.sortSections(filteredSections);
		let result: any[] = this.filterColumnsAndConvertToObjects(id, sortedSection);
		return result;
	}

	public getSections(courses: Course[]) {
		let sections: Section[] = [];
		for (const course of courses) {
			let hello: any[] = course.sections;
			sections = sections.concat(hello);
		}
		return sections;
	}

	public sortSections(sections: Section[]): Section[] {
		let order = "";
		Object.keys(this.query.OPTIONS).forEach((key) => {
			if (key === "ORDER") {
				order = this.query.OPTIONS.ORDER;
			}
		});
		if (order === "") { // No need to sort if there is no order
			return sections;
		}
		order = order.split("_")[1];
		let sorter: QuerySorter = new QuerySorter(order, sections);
		return sorter.sort();
	}

	public filterColumnsAndConvertToObjects(id: string, sections: Section[]): Section[] {
		let columns: string[] = this.query.OPTIONS.COLUMNS; // ["courses_dept", ...]
		let arrayOfObjs: Section[] = [];
		for (const section of sections) {
			let sectionObj: any = {
			};
			for (const inputString of columns) { // column = "courses_avg"
				const columnKey: string = inputString.split("_")[1];
				if (columnKey === "avg" || columnKey === "pass" || columnKey === "fail" ||
					columnKey === "audit" || columnKey === "year") {
					sectionObj[inputString] = this.getMField(columnKey, section);
				} else {
					sectionObj[inputString] = this.getSField(columnKey, section);
				}
			}
			arrayOfObjs.push(sectionObj);
		}
		return arrayOfObjs;
	}

	// // return a list of all fields inside columns
	// public getColumns(): string[] {
	// 	const keys = this.query.OPTIONS.COLUMNS;
	// 	let columns = [];
	// 	for (const key of keys) {
	// 		const column = key.split("_")[1];
	// 		columns.push(column);
	// 	}
	// 	return columns;
	// }

	public get query(): any {
		return this._query;
	}

	private getMField(key: string, section: Section): number {
		const field = key.split("_")[1];
		if (field === "avg") {
			return section._avg;
		}
		if (field === "pass") {
			return section._pass;
		}
		if (field === "fail") {
			return section._fail;
		}
		if (field === "audit") {
			return section._audit;
		}
		return section._year;
	}

	private getSField(key: string, section: any): string {
		const field = key.split("_")[1];
		if (field === "dept") {
			return section._dept;
		}
		if (field === "id") {
			return section._id;
		}
		if (field === "instructor") {
			return section._instructor;
		}
		if (field === "title") {
			return section._title;
		}
		return section._uuid;
	}

	// private getSectionField(key: any, section: any): any {
	// 	const field = key.split("_")[1];
	// 	if (field === "avg") {
	// 		return section._avg;
	// 	}
	// 	if (field === "pass") {
	// 		return section._pass;
	// 	}
	// 	if (field === "fail") {
	// 		return section._fail;
	// 	}
	// 	if (field === "audit") {
	// 		return section._audit;
	// 	}
	// 	if (field === "year") {
	// 		return section._year;
	// 	}
	// 	if (field === "dept") {
	// 		return section._dept;
	// 	}
	// 	if (field === "id") {
	// 		return section._id;
	// 	}
	// 	if (field === "instructor") {
	// 		return section._instructor;
	// 	}
	// 	if (field === "title") {
	// 		return section._title;
	// 	}
	// 	if (field === "uuid") {
	// 		return section._uuid;
	// 	}
	// }

}
