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
	public process(where: any, options: any): Promise<any> {
		// figure out
		this.handleWhere(where);
		// with handle Where we need to store the appropriate sections in a separate array
		this.handleOptions(options);
		// which folder/dataset to load
		// instantiate all sections

		return Promise.resolve([]);
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

	public applyLogic(logic: any) {
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
