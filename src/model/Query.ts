import QueryValidator from "./QueryValidator";
import Course from "./Course";
import Filter from "./Filter";
import Section from "./Section";


export interface QueryOBJ {
	WHERE?: QueryFilter;
	OPTIONS?: QueryOptions;
}

export interface QueryOptions {
	COLUMNS?: QueryOptions;
	// order
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
		const filter: Filter = new Filter(this.query.WHERE);
		const sections = this.getSections(courses);
		const filteredSections: Section[] = filter.handleFilter(sections);
		const sortedSection: Section[] = this.sortSections(filteredSections);
		const result: any[] = this.filterColumnsAndConvertToObjects(sortedSection);
		return result;
	}

	public getSections(courses: Course[]) {
		return [];
	}

	public sortSections(sections: Section[]): Section[] {
		return [];
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
