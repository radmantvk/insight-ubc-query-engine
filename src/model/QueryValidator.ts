import {QueryOBJ} from "./Query";
import FilterValidator from "./FilterValidator";
import TransformValidator from "./TransformValidator";

let datasetID: string;

let columnKeys: any = [];								// we want to store the column keys so if there is an order, the order key must be in this array


export default class QueryValidator {
	public queryValidate(query: QueryOBJ) {
		if (query === "undefined" || query == null || !("WHERE" in query) || !("OPTIONS" in query)) {
			return false;
		}
		let WHERE: any;
		let OPTIONS: any;
		let queryKeys = Object.keys(query);
		if (queryKeys.length < 2 || queryKeys.length > 3) {
			return false;
		}
		for (let key of queryKeys) {
			if (key !== "WHERE" && key !== "OPTIONS" && key !== "TRANSFORMATIONS") {
				return false;
			}
			if (key === "WHERE") {
				WHERE = query[key];
			}
			if (key === "OPTIONS") {
				OPTIONS = query[key];
			}
			if (key === "TRANSFORMATIONS") {
				const TRANSFORMATIONS = query[key];
				const transformValidator: TransformValidator = new TransformValidator();
				if (!transformValidator.validate(TRANSFORMATIONS)) {
					return false;
				}
			}
		}
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
		datasetID = OPTIONS["COLUMNS"][0].split("_")[0];
		let filterValidator: FilterValidator = new FilterValidator(datasetID);
		if(!filterValidator.isValidFilter(WHERE)) {
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
			let field = columnVal[key].split("_")[1];
			if (datasetID.includes(" ") || datasetID.length === 0) {
				return false;
			}
			if (this.isValidMField(field)) {
				if (!this.isValidQueryKey(columnVal[key], true)) {
					return false;
				}
			} else if (this.isValidSField(field)) {
				if (!this.isValidQueryKey(columnVal[key], false)) {
					return false;
				}
			} else {
				if (!this.isValidApplyKey(columnVal[key])) {
					return false;
				}
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
		if (!(this.isValidQueryKey(orderVal, true)) &&
			!(this.isValidQueryKey(orderVal, false))) {
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
			return this.isValidMField(mField);
		} else {
			let sField = field;
			return this.isValidSField(sField);
		}
	}

	private isValidSField(sField: string) {
		if (sField === "dept" || sField === "id" || sField === "instructor" || sField === "title" ||
			sField === "uuid") {
			return true;
		}
		return false;
	}

	private isValidMField(mField: string) {
		if (mField === "avg" || mField === "pass" || mField === "fail" || mField === "audit" || mField === "year") {
			return true;
		}
		return false;
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

	private isValidApplyKey(key: string) {
		if (key.includes("_")) {
			return false;
		} else if (key.length === 0) {
			return false;
		}
	}
}

