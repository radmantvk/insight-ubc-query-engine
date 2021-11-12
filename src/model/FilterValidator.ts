
let columnKeys: any = [];								// we want to store the column keys so if there is an order, the order key must be in this array
export default class FilterValidator {
	private datasetID: string = "";

	constructor(datasetID: string) {
		this.datasetID = datasetID;
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
		if (isVALUE[0] === "*") {
			isVALUE = isVALUE.substring(1, isVALUE.length);
		}
		if (isVALUE[isVALUE.length - 1] === "*") {
			isVALUE = isVALUE.substring(0, isVALUE.length - 1);
		}
		if (isVALUE.includes("*")) {
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

	private isValidMField(mField: string) {
		let coursesField: boolean = false;
		let roomsField: boolean = false;
		if (mField === "avg" || mField === "pass" || mField === "fail" || mField === "audit" || mField === "year") {
			coursesField = true;
		}
		if (mField === "lat" || mField === "lon" || mField === "seats") {
			roomsField = true;
		}
		if ((roomsField === true && coursesField === true) || (roomsField === false && coursesField === false)) {
			return false;
		}
		return true;
	}

	private isValidSField(sField: string) {
		let coursesField: boolean = false;
		let roomsField: boolean = false;
		if (sField === "dept" || sField === "id" || sField === "instructor" || sField === "title" ||
			sField === "uuid") {
			coursesField = true;
		}
		if (sField === "fullname" || sField === "shortname" || sField === "number" || sField === "name" ||
			sField === "address" || sField === "type" || sField === "furniture" || sField === "href") {
			roomsField = true;
		}
		if ((roomsField === true && coursesField === true) || (roomsField === false && coursesField === false)) {
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
		if (idString !== this.datasetID) {
			return false;
		}
		if (idString.includes("_")){
			return false;
		}
		let field = queryKey.split("_")[1];
		if (isMKey) {
			return this.isValidMField(field);
			// let mField = field;
			// if (mField === "avg" || mField === "pass" || mField === "fail" || mField === "audit" || mField === "year") {
			// 	return true;
			// }
			// return false;
		} else {
			return this.isValidSField(field);
			// let sField = field;
			// if (sField === "dept" || sField === "id" || sField === "instructor" || sField === "title" ||
			// 	sField === "uuid") {
			// 	return true;
			// }
			// return false;
		}
	}

}
