// import Options from "./Options";
// import Body from "./Body";
// import Filter from "./Filter";


export interface QueryOBJ {
	WHERE?: any;
	OPTIONS?: QueryOptions;
}

export interface QueryResult {
	Result: [];
}

export interface QueryOptions {
	COLUMNS?: QueryOptions;
}

export interface QueryFilter {
	[key: string]: any											// Filter can be Logic (NOT/AND), MComp (LT/GT/EQ), SComp (IS), NEG (NOT)
}


export default class Query {
	constructor() {
		return this;
	}

	public isQueryValid(query: QueryOBJ): boolean {
		return ("WHERE" in query && "OPTIONS" in query);			// check if query contains a WHERE and OPTIONS block
	}


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

	/**
	 * receive the appropriate values and apply the appropriate comparison.
	 * @param operator: the type of comparator (GT/EQ/LQ/IS)
	 * @param operand: the value of the key inside the object
	 * FOR EXAMPLE: a query with the WHERE block such as :
	 * WHERE: GT: { courses_avg: 97 },
	 * 97 would be the operand
	 */
	public applyComparator(comparator: any, operand: any) {
		let key = Object.keys(operand);
	}

	/**
	 * Logic comparison based on the EBNF
	 * 1) must contain at least 1 filter
	 * @param logic: "AND" / "OR"
	 */
	public applyLogic(logic: any) {

		if(logic === "AND") {
			//
		} else if (logic === "OR") {
			//
		}
	}

	public applyNegation(negation: any) {
		return this;
	}


	public handleOptions(opts: QueryOptions) {
		return this;
	}


	/**
	 * Check if a query key is valid
	 * <id>_<key> is correct format, where id is the id of the dataset
	 * @param queryKey
	 */
	public isValidQueryKey(queryKey: string, datasetID: string): boolean {
		return (queryKey.split("_")[0] === datasetID);
	}

	public keyTranslate(datasetKey: string) {
		if (datasetKey === "dept") {
			return "Subject";
		}
		if (datasetKey === "id") {
			return "Course";
		}
		if (datasetKey === "avg" || datasetKey === "title" || datasetKey === "pass" || datasetKey === "fail"
			|| datasetKey === "audit" || datasetKey === "year") {
			let newDatasetKey = datasetKey.charAt(0).toUpperCase() + datasetKey.slice(1);
			return newDatasetKey;
		}
		if (datasetKey === "instructor") {
			return "Professor";
		}
		if (datasetKey === "uuid") {
			return "id";
		}
	}


}
