import QueryValidator from "./QueryValidator";

export interface QueryOBJ {
	WHERE?: QueryFilter;
	OPTIONS?: QueryOptions;
}

export interface QueryResult {
	Result: [];
}

export interface QueryOptions {
	COLUMNS?: QueryOptions;
	// order
}

export interface QueryFilter {
	[key: string]: any
}


export default class Query {

	public isValidQuery(query: QueryOBJ): boolean {
		let queryValidator: QueryValidator = new QueryValidator();
		return queryValidator.queryValidate(query);
	}

	// TODO processQuery
	// public process(where, options): Promise<any> {
	// 	// figure out
	// 	this.handleWhere(where);
	// 	// with handle Where we need to store the appropriate sections in a separate array
	// 	this.handleOptions(options);
	// 	// which folder/dataset to load
	// 	// instantiate all sections
	//
	// }


	/**
	 * Responsible for the Where block in Query
	 * rei
	 * 1) check if the inside of the WHERE is empty, return entire dataset; otherwise continue
	 * 2) check what type of filter is applied (Logic, M/S Comparator, Negation)
	 * 3) if Logic: call applyLogic method
	 * 4) if M/S Comparator: call applyComparator method
	 * 5) if Negation: call applyNegation method.
	 * @param where : value of the where key, Filter.
	 */
	public handleWhere(where: QueryFilter) {
		let op: string = Object.keys(where)[0];				// operator		-> this will return either "AND", "OR", "GT", etc
		let queryResult: QueryResult;						// result instantiated
		if ("" in where) {
			// empty
		}else if ("OR" === op) {
			this.applyLogic("OR");
		} else if ("AND" === op) {
			this.applyLogic("AND");
		} else if ("LT" === op || "GT" === op || "EQ" === op) {
			let number: any = Object.values(op)[0];			// value of the op object at position 0 (this will return the value)
			this.applyComparator(op,number);
		} else if ("IS" === op) {
			let inputString = Object.values(op)[0];
			this.applyComparator("IS", inputString);
		} else {
			// fail
		}
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

}
