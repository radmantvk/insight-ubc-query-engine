import QueryValidator from "./QueryValidator";
import Course from "./Course";
import Filter from "./Filter";
import Section from "./Section";
import QuerySorter from "./QuerySorter";

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


enum Fields {
	AVG, PASS, FAIL,AUDIT,YEAR,DEPT,ID,INSTRUCTOR,TITLE,UUID
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

// TODO processQuery
	public process(courses: Course[]) {
		let filter: Filter = new Filter();
		let sections = this.getSections(courses);
		let filteredSections: Section[] = filter.handleFilter(sections, this.query.WHERE);
		let sortedSection: Section[] = this.sortSections(filteredSections);
		let result: any[] = this.filterColumnsAndConvertToObjects(sortedSection);
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

	public filterColumnsAndConvertToObjects(sections: Section[]): Section[] {
		return [];
	}

	// return a list of all fields inside columns
	public getColumns(): string[] {
		const keys = this.query.OPTIONS.COLUMNS;
		let columns = [];
		for (const key of keys) {
			const column = key.split("_")[1];
			columns.push(column);
		}
		return columns;
	}


	public get query(): any {
		return this._query;
	}

}
