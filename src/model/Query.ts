import QueryValidator from "./QueryValidator";


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
	public process() {
		let WHERE: any;
		let OPTIONS: any;
		Object.keys(this.query).forEach((key) => {
			if (key === "WHERE") {
				WHERE = this.query[key];
			}
			if (key === "OPTIONS") {
				OPTIONS = this.query[key];
			}
		});

		let filterKeys = Object.keys(WHERE);

		if (filterKeys.length === 0) {
			// return entire dataset
		}

		return this;
	}


	/**
	 * Responsible for the Where block in Query
	 * @param where : value of the where key, Filter.
	 */
	public handleWhere(where: any) {
		// if (where == "")
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


	public applyComparator(comparator: any, operand: any) {
		return this;
	}

	public applyLogic(body: any, filterVal: any) {
		return this;
	}

	public applyNegation(negation: any) {
		return this;
	}


	public handleOptions(opts: QueryOptions) {
		return this;
	}

	public get query(): any {
		return this._query;
	}
}
