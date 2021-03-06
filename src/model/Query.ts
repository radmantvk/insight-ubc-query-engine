import Course from "./Course";
import Filter from "./Filter";
import Section from "./Section";
import QuerySorter from "./QuerySorter";
import {InsightDatasetKind, ResultTooLargeError} from "../controller/IInsightFacade";
import Room from "./Room";
import Transformation from "./Transformation";
import FieldAccessor from "./FieldAccessor";

export interface QueryOBJ {
	WHERE?: QueryFilter;
	OPTIONS?: QueryOptions;
	TRANSFORMATIONS?: QueryTransformations;
}

export interface QueryOptions {
	COLUMNS?: QueryOptions;
	ORDER?: any;
}

export interface QueryTransformations {
	GROUP?: any[];
	APPLY?: any[];
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
		// this._datasetID = query.OPTIONS.COLUMNS[0].split("_")[0];
		// this._kind = this.getKind(query.OPTIONS.COLUMNS[0].split("_")[1]);
		if (query.OPTIONS.COLUMNS[0].includes("_")) {
			this._datasetID = query.OPTIONS.COLUMNS[0].split("_")[0];
			this._kind = this.getKind(query.OPTIONS.COLUMNS[0].split("_")[1]);
		} else {
			this._datasetID = query.TRANSFORMATIONS.GROUP[0].split("_")[0];
			this._kind = this.getKind(query.TRANSFORMATIONS.GROUP[0].split("_")[1]);
		}
		this._query = query;
	}

	public get datasetID() {
		return this._datasetID;
	}

	public get kind() {
		return this._kind;
	}

	public process(data: any[], kind: InsightDatasetKind): Promise<any[]> {
		let filter: Filter = new Filter(kind);
		let result: any[];
		let sortedData: any[];
		let filteredData: any[];
		if (kind === InsightDatasetKind.Courses) {
			data = this.getSections(data);
		}
		filteredData = filter.handleFilter(data, this.query.WHERE);
		let transformation: Transformation = new Transformation(filteredData, this._query);

		if (transformation.transformExists) {
			filteredData = transformation.transform();
		}
		if (filteredData.length > 5000) {
			return Promise.reject(new ResultTooLargeError());
		}
		sortedData = this.sortData(filteredData);
		result = this.filterColumnsAndConvertToObjects(sortedData);
		return Promise.resolve(result);
	}

	public getSections(courses: Course[]) {
		let sections: Section[] = [];
		for (const course of courses) {
			let hello: any[] = course.sections;
			sections = sections.concat(hello);
		}
		return sections;

	}

	public sortData(dataset: any[]): any[] {
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
		if (typeof order === "string") {
			if (order.includes("_")) {
				order = order.split("_")[1];
			}
			sorter = new QuerySorter( dataset, [order], "UP");
		} else {
			let orders = [];
			const keys: any[] = order["keys"];
			for (const i of keys) {
				if (i.includes("_")) {
					orders.push(i.split("_")[1]);
				} else {
					orders.push(i);
				}
			}
			sorter = new QuerySorter(dataset, orders, order["dir"]);
		}
		return sorter.sort();
	}

	public filterColumnsAndConvertToObjects(dataset: any[]): any[] {
		let columns: string[] = this.query.OPTIONS.COLUMNS; // ["courses_dept", ...]
		let arrayOfObjs: any[] = [];
		for (const section of dataset) {
			let sectionObj: any = {
			};
			for (const inputString of columns) { // column = "courses_avg"
				if (inputString.includes("_")) {
					const columnKey: string = inputString.split("_")[1];
					sectionObj[inputString] = FieldAccessor.getField(columnKey, section);
				} else {
					sectionObj[inputString] = section[inputString];
				}
			}
			arrayOfObjs.push(sectionObj);
		}
		return arrayOfObjs;
	}


	public get query(): any {
		return this._query;
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
