// import Options from "./Options";
// import Body from "./Body";
// import Filter from "./Filter";


export interface QueryOBJ {
	WHERE?: any;
	OPTIONS?: QueryOptions;
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
	 * 1) check if the inside of the WHERE is empty, return entire dataset; otherwise continue
	 * 2) check what type of filter is applied (Logic, M/S Comparator, Negation)
	 * 3) if Logic: call applyLogic method
	 * 4) if M/S Comparator: call applyComparator method
	 * 5) if Negation: call applyNegation method.
	 * @param where : value of the where key, Filter.
	 */
	public handleWhere(where: QueryFilter) {
		if ("" in where) {
			// empty
		}else if ("OR" in where) {
			this.applyLogic("OR");
		} else if ("AND" in where) {
			this.applyLogic("AND");
		} else if ("LT" in where) {
			this.applyComparator("LT");
		} else if ("GT" in where) {
			this.applyComparator("GT");
		} else if ("EQ" in where) {
			this.applyComparator("EQ");
		} else if ("IS" in where) {
			this.applyComparator("IS");
		} else if ("NOT" in where) {
			this.applyNegation("NOT");
		} else {
			// fail
		}
	}

	public handleOptions(opts: QueryOptions) {

	}

	public applyComparator(comparator: any) {
	}

	public applyLogic(logic: any) {

	}

	public applyNegation(negation: any) {

	}


	/**
	 * Check if a query key is valid
	 * <id>_<key> is correct format, where id is the id of the dataset
	 * @param queryKey
	 */
	public isValidQueryKey(queryKey: string): boolean {
		return (queryKey.split("_")[0] === "courses");
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
