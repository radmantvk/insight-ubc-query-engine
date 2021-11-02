import QueryValidator from "./QueryValidator";
import Course from "./Course";
import Filter from "./Filter";
import Section from "./Section";
import QuerySorter from "./QuerySorter";
import {InsightDatasetKind, ResultTooLargeError} from "../controller/IInsightFacade";

export interface QueryOBJ {
	WHERE?: QueryFilter;
	OPTIONS?: QueryOptions;
	TRANSFORMATIONS?: QueryOBJ;
}

export interface QueryOptions {
	COLUMNS?: QueryOptions;
	ORDER?: any;
}

export interface QueryTransformations {
	GROUP?: QueryTransformations;
	APPLY?: QueryTransformations;
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

	public process(data: any[], kind: string): Promise<any[]> { // TODO: takes a parameter to know if courses/rooms
		let id = "";
		if (!(data.length === 0)) {
			id = data[0].id.split("-")[0];
		}
		if (kind === "courses") {
			let filter: Filter = new Filter(); // TODO, instantiate and pass if rooms/courses
			let sections = this.getSections(data); // TODO, depends if rooms/courses

			let filteredSections: Section[] = filter.handleFilter(sections, this.query.WHERE);
			// handle transformation
			if (filteredSections.length > 5000) {
				return Promise.reject(new ResultTooLargeError());
			}
			let sortedSection: Section[] = this.sortSections(filteredSections); // TODO
			let result: any[] = this.filterColumnsAndConvertToObjects(id, sortedSection); // TODO
			return Promise.resolve(result);
		} else {
			return Promise.resolve([]);
		}
	}
	// public process(dataset: any[], kind: InsightDatasetKind) {
	// 	let id = "";
	// 	if (!(dataset.length === 0)) {
	// 		id = dataset[0].id.split("-")[0];
	// 	}
	// 	let filter: Filter = new Filter();
	// 	// let transform: Transform = new Transform();
	// 	if (kind === InsightDatasetKind.Courses) {
	// 		let sections = this.getSections(dataset);
	// 		let filteredSections: Section[] = filter.handleFilter(sections, this.query.WHERE, kind);
	// 		// let transformedSections: Section[] = transform.handleTransform(sections, this.query, kind);
	// 		let sortedSection: Section[] = this.sortSections(filteredSections);
	// 		let result: any[] = this.filterColumnsAndConvertToObjects(id, sortedSection);
	// 		return result;
	// 	} else if (kind === InsightDatasetKind.Rooms) {
	// 		let rooms = this.getRooms(dataset);
	// 		// let filteredRooms: Room[] = filter.handleFilter(rooms, this.query.WHERE, kind);
	// 		// let transformedRooms: Room[] = transform.handleTransform(rooms, this.query, kind);
	// 		// let sortedRooms: Room[] = this.sortRooms(filteredRooms);
	// 		let result: any[] = this.filterColumnsAndConvertToObjects(id, sortedRooms);
	// 	}
	// }

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
		if (key === "avg") {
			return section._avg;
		}
		if (key === "pass") {
			return section._pass;
		}
		if (key === "fail") {
			return section._fail;
		}
		if (key === "audit") {
			return section._audit;
		}
		if (key === "year") {
			let stringYear = section._year.toString();
			return parseInt(stringYear, 10);
		}
		// return parseInt(section._year, 10);
		return 0;
	}

	private getSField(key: string, section: any): string {
		if (key === "dept") {
			return section._dept;
		}
		if (key === "id") {
			return section._id;
		}
		if (key === "instructor") {
			return section._instructor;
		}
		if (key === "title") {
			return section._title;
		}
		return section._uuid;
	}

}
