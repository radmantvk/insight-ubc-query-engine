import {QueryOBJ} from "./Query";

let datasetID: string;

let columnKeys: any = [];								// we want to store the column keys so if there is an order, the order key must be in this array


export default class QueryValidator {

	public queryValidate(query: QueryOBJ) {
		if (query === "undefined" || query == null || !("WHERE" in query) || !("OPTIONS" in query)) {
			return false;
		}
		let WHERE: any;
		let OPTIONS: any;
		if (Object.keys(query).length !== 2) {
			return false;
		}
		Object.keys(query).forEach((key) => {
			if (key === "WHERE") {
				WHERE = query[key];
			}
			if (key === "OPTIONS") {
				OPTIONS = query[key];
			}
		});

		let keysOPTION = Object.keys(OPTIONS);
		if (keysOPTION.length !== 1 && keysOPTION.length !== 2) {
			return false;
		}
		if (!this.optionsValidate(OPTIONS)) {
			return false;
		}

		let keysFILTER = Object.keys(WHERE);
		if (keysFILTER.length > 1) {
			return false;
		}
		if (Object.keys(WHERE).length === 0) {
			return true;
		}
		let keyFILTER: string = Object.keys(WHERE)[0];
		if(!this.isValidFilter(WHERE)) {
			return false;
		}

		return true;
	}

	/**
	 * return true if correct filter matches one of the viable options in EBNF
	 * @param FILTER: The value of filter key (e.g for a "GT" filter, it would be {mKey: number}
	 * @param filter: the filter string (AND/OR/GT/LT/EQ/IS/NOT)
	 */
	public isValidFilter(FILTER: any): boolean {
		const filterKeys = Object.keys(FILTER);
		if (filterKeys.length === 0) {
			return false;
		}
		let comparator = filterKeys[0];
		if (comparator !== "AND" && comparator !== "OR" && comparator !== "GT" && comparator !== "LT" &&
			comparator !== "EQ" && comparator !== "IS" && comparator !== "NOT") {
			return false;
		}

		if (comparator === "AND" || comparator === "OR") {
			if (!this.logicValidate(FILTER, comparator)) {
				return false;
			}
		}

		if (comparator === "GT" || comparator === "LT" || comparator === "EQ") {
			if (!this.mathValidate(FILTER, comparator)) {
				return false;
			}
		}
		if (comparator === "IS") {
			if (!this.stringValidate(FILTER)) {
				return false;
			}
		}

		if (comparator === "NOT") {
			if (!this.negateValidate(FILTER)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * called when the filter key is "AND" or "OR"
	 * Must ensure that the value of the filter key is type of array and non-empty
	 * Must ensure that the elements of the array are valid filters (recursion)
	 * @param FILTER: the FILTER object to access key and value of
	 * @param filter: the filter key "AND", or "OR
	 */
	public logicValidate(FILTER: any, filter: string) {
		let value: any = FILTER[filter];
		if (!(value instanceof Array)) {
			return false;
		}

		if (value.length === 0) {
			return false;
		}


		for (let insideFilter of value) {
			// [{}] {}
			if (!this.isValidFilter(insideFilter)) {
				return false;
			}
		}
		return true;
	}


	/**
	 * called when filter key is "GT", "EQ", or "LT"
	 * must ensure that there is ONLY 1 key:value pair within the value of the filter key
	 * must validate that the value within the value of the filter key is a number
	 * must validate that the key within the value of the filter key is mKEY
	 * @param FILTER: The FILTER object to acess the key and value of
	 * @param filter: the filter key "GT", "EQ", "LT"
	 */
	public mathValidate(FILTER: any, filter: string) {
		let valueMATH: any = FILTER[filter];					// will give us an object {mkey: number}
		if (Object.keys(valueMATH).length !== 1) {				// only one key should exist
			return false;
		}
		let mKey = Object.keys(valueMATH)[0];					// mKey in { "GT": { mKey: number} }
		let number = valueMATH[mKey];
		if (typeof number !== "number") {						// must be a number
			return false;
		}
		if (!this.isValidQueryKey(mKey, true)) {			// validity of mKey
			return false;
		}
		return true;
	}

	/**
	 * Called when filter is "IS"
	 * must ensure queryKey is valid
	 * must ensure that if astericks are used
	 * @param FILTER: the FILTER object to access the key and value of
	 * @private
	 */
	private stringValidate(FILTER: any) {
		let isOBJECT: any = FILTER["IS"];
		if (Object.keys(isOBJECT).length === 0 || Object.keys(isOBJECT).length > 1) {
			return false;
		}
		let queryKey = Object.keys(isOBJECT)[0];
		if (!this.isValidQueryKey(queryKey, false)) {
			return false;
		}
		let isVALUE: any = isOBJECT[queryKey];
		const regex = /[*]?[^*]*[*]?/g;
		if (!isVALUE.match(regex)) {
			return false;
		}
		return true;
	}


	/**
	 * called when filter key is "NOT"
	 * must ensure that there is only one FILTER within the filter key value
	 * must ensure that the FILTER within the filter key value is validFilter (recursion)
	 * @param FILTER : the FILTER object to access the key and value of
	 * @private
	 */
	private negateValidate(FILTER: any) {
		let valueNEGATE: any = FILTER["NOT"];					// will give us { filter }
		if (Object.keys(valueNEGATE).length !== 1) {			// must be a single filter
			return false;
		}
		if (!this.isValidFilter(valueNEGATE)) {
			return false;
		}
		return true;
	}

	/**
	 * must ensure the value of the COLUMNS key is a non-empty array
	 * must ensure key is valid (can be mkey or skey)
	 * @param OPTIONS: The OPTIONS object where the key "COLUMNS" was found
	 */
	public columnValidate(OPTIONS: any): boolean {
		let columnVal = OPTIONS["COLUMNS"];
		if (!(columnVal instanceof Array)) {
			return false;
		}
		if (columnVal.length === 0) {
			return false;
		}
		for (let key in columnVal) {
			if (typeof columnVal[key] !== "string") {
				return false;
			}
			datasetID = columnVal[key].split("_")[0];
			if (datasetID.includes(" ") || datasetID.length === 0) {
				return false;
			}
			if (!(this.isValidQueryKey(columnVal[key], true)) && !(this.isValidQueryKey(columnVal[key], false))) {
				return false;
			}
			columnKeys.push(columnVal[key]);
		}
		return true;
	}


	/**
	 * Called when the key "ORDER" is found within OPTIONS
	 * must ensure the value of the "ORDER" key is a string
	 * must ensure key is valid
	 * @param OPTIONS: the OPTIONS object where the key "ORDER" was found
	 * @private
	 */
	private orderValidate(OPTIONS: any): boolean {
		let orderVal = OPTIONS["ORDER"];
		if (typeof orderVal !== "string") {
			return false;
		}
		if (!columnKeys.includes(orderVal)) {
			return false;
		}
		if (!(this.isValidQueryKey(orderVal, true)) && !(this.isValidQueryKey(orderVal, false))) {
			return false;
		}
		return true;

	}

	/**
	 * Check if a query key is valid
	 * <id>_<key> is correct format, where id is the id of the dataset
	 * an id_string can contain any character except for underscore
	 * @param queryKey: consists of idString and mField/sField in the form <idString>_<m/sField>
	 * @param isMKey: true means MKey, false means SKey
	 */
	public isValidQueryKey(queryKey: string, isMKey: boolean): boolean {
		let idString = queryKey.split("_")[0];
		if (idString !== datasetID) {
			return false;
		}
		if (idString.includes("_")){
			return false;
		}
		let field = queryKey.split("_")[1];
		if (isMKey) {
			let mField = field;
			if (mField === "avg" || mField === "pass" || mField === "fail" || mField === "audit" || mField === "year") {
				return true;
			}
			return false;
		} else {
			let sField = field;
			if (sField === "dept" || sField === "id" || sField === "instructor" || sField === "title" ||
				sField === "uuid") {
				return true;
			}
			return false;
		}
	}

	/**
	 * Validate the OPTIONS requirements from the EBNF
	 * first key in OPTIONS MUST be COLUMNS
	 * if second key exists, it MUST be ORDER
	 * validate the COLUMNS block using the columnValidate method
	 * if ORDER exists, validate it using the orderValidate method
	 * @param OPTIONS: the OPTIONS value object =======> {' COLUMNS (', ORDER:' key)?'}'
	 * @private
	 */
	private optionsValidate(OPTIONS: any): boolean {
		if (Object.keys(OPTIONS)[0] !== "COLUMNS") {
			return false;
		}
		if (!this.columnValidate(OPTIONS)) {
			return false;
		}
		if (Object.keys(OPTIONS).length === 2 && Object.keys(OPTIONS)[1] !== "ORDER") {
			return false;
		} else if (Object.keys(OPTIONS).length === 2) {
			if (!this.orderValidate(OPTIONS)) {
				return false;
			}
		}
		return true;
	}
}
