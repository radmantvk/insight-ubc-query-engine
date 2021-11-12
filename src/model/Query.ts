import Course from "./Course";
import Filter from "./Filter";
import Section from "./Section";
import QuerySorter from "./QuerySorter";
import {InsightDatasetKind, ResultTooLargeError} from "../controller/IInsightFacade";
import Room from "./Room";

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
	// private courses: Course[] = [];
	private _datasetID: string = "";
	private _query: any;
	private _kind: InsightDatasetKind;
	constructor(query: any) {
		this._datasetID = query.OPTIONS.COLUMNS[0].split("_")[0];
		this._kind = this.getKind(query.OPTIONS.COLUMNS[0].split("_")[1]);
		this._query = query;
	}

	public get datasetID() {
		return this._datasetID;
	}

	public get kind() {
		return this._kind;
	}

	public process(data: any[], kind: InsightDatasetKind): Promise<any[]> { // TODO: takes a parameter to know if courses/rooms
		let filter: Filter = new Filter(kind);
		if (kind === InsightDatasetKind.Courses) {
			let sections: Section[] = this.getSections(data);
			let filteredSections: Section[] = filter.handleFilter(sections, this.query.WHERE);
			if (filteredSections.length > 5000) {
				return Promise.reject(new ResultTooLargeError());
			}
			let groups: any[][] = [];
			let applies: any = {
				maxAvg: [90, 93, 91, 92]
			};
			let sortedSection: Section[] = this.sortData(filteredSections, groups, applies);
			let result: any[] = this.filterColumnsAndConvertToObjects(sortedSection);
			return Promise.resolve(result);
		} else {
			let rooms: Room[] = data;
			// let filteredRooms: Room[] = filter.handleFilter(rooms, this._query.WHERE);
			// transformations: TODO: Parham doing handle transformations returning object with keys apply keys and  values list of numbers
			// if (filteredRooms.length > 5000) {
			// 	return Promise.reject(new ResultTooLargeError());
			// }
			// let sortedRooms: Room[] = this.sortData(filteredRooms);
		// 	LISTOFGROUPS = [[group 1], [group 2], [group 3], ...]
		//
		// 	If grouping based on year and dept:
		// 		Group 1: all CPSC’s in 2010
		// 	Group 2: all CPSC’s in 2011
		// 	Group 3: all DSCI’s in 2010
		// ....
		//
		// 	LISTOFAPPLY = {
		// 		maxAvg = [90 (group 1’s avg), 98 (group 2’s avg), 80 (group 3’s avg), ….]
		// 	overallAvg =  [4(group 1’s avg), 6 (group 2’s avg), 5 (group 3’s avg), ...]
		// ...
		// }
			let groups: any[][] = [];
			let applies: any = {
				maxAvg: [90, 93, 91, 92]
			};
			let transformations = {};
			let sortedRooms: Room[] = this.sortData(rooms, groups, applies);
			let result: any[] = this.filterColumnsAndConvertToObjects(sortedRooms);

			return Promise.resolve(result);
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

	public sortData(dataset: any[], groups: any[][], applies: any): any[] {
		let order = "";
		Object.keys(this.query.OPTIONS).forEach((key) => {
			if (key === "ORDER") {
				order = this.query.OPTIONS.ORDER;
			}
		});
		if (order === "") { // No need to sort if there is no order
			return dataset;
		}
		let sorter: QuerySorter;
		if (typeof order === "string") { // ANYKEY: either key or applykey
			order = order.split("_")[1];
			sorter = new QuerySorter( dataset, [order], groups, applies, "UP");
		} else {
			let orders = [];
			const keys: any[] = order["keys"];
			for (const i of keys) {
				orders.push(i.split("_")[1]);
			}
			sorter = new QuerySorter(dataset, orders, groups, applies, order["dir"]);
		}
		return sorter.sort();
	}

	public filterColumnsAndConvertToObjects(dataset: any[]): any[] {
		let columns: string[] = this.query.OPTIONS.COLUMNS; // ["courses_dept", ...]
		let arrayOfObjs: Section[] = [];
		for (const section of dataset) {
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

	private getKind(f: string) {
		if (f === "dept" || f === "id" || f === "instructor" || f === "title" || f === "uuid" || f === "avg" ||
			f === "pass" || f === "fail" || f === "audit" || f === "year") {
			return InsightDatasetKind.Courses;
		} else {
			return InsightDatasetKind.Rooms;
		}
	}
}
