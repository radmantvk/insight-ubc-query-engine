
import TransformValidator from "./TransformValidator";
import {QueryOBJ} from "./Query";
import FilterValidator from "./FilterValidator";

// let datasetID: string;
//
// let columnKeys: any = [];								// we want to store the column keys so if there is an order, the order key must be in this array


export default class QueryValidator {
	private _datasetID: string = "";
	private columnKeys: any = [];
	private applyKeys: any = [];
	private groupKeys: any = [];
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
				} else {
					this.applyKeys = transformValidator.applyKeys;
					this.groupKeys = transformValidator.groupKeys;
					this._datasetID = transformValidator.datasetID;
				}
			}
		}
		if (Object.keys(OPTIONS).length !== 1 && Object.keys(OPTIONS).length !== 2) {
			return false;
		}
		if (!this.optionsValidate(OPTIONS)) {
			return false;
		}
		if (Object.keys(WHERE).length > 1) {
			return false;
		}
		if (Object.keys(WHERE).length === 0) {
			return true;
		}
		let filterValidator: FilterValidator = new FilterValidator(this._datasetID);
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
			if (this.applyKeys.length !== 0) {
				if (!this.applyKeys.includes(columnVal[key]) && !this.groupKeys.includes(columnVal[key])) {
					return false;
				}
			}
			if (typeof columnVal[key] !== "string") {
				return false;
			}
			let field = "";
			if (!this.isValidApplyKey(columnVal[key])) {
				this._datasetID = columnVal[key].split("_")[0];
				field = columnVal[key].split("_")[1];
				if (this.isValidMField(field)) {
					if (!this.isValidQueryKey(columnVal[key], true)) {
						return false;
					}
				} else if (this.isValidSField(field)) {
					if (!this.isValidQueryKey(columnVal[key], false)) {
						return false;
					}
				}
				if (this._datasetID.includes(" ") || this._datasetID.length === 0) {
					return false;
				}
			} else if (this.isValidApplyKey(columnVal[key]) && this.applyKeys.length === 0) {
				return false;
			}
			this.columnKeys.push(columnVal[key]);
		}
		for (const applyKey of this.applyKeys) {
			for (const groupKey of this.groupKeys) {
				if (!this.columnKeys.includes(applyKey) && !this.columnKeys.includes(groupKey)) {
					return false;
				}
			}
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
		let orderObj = OPTIONS["ORDER"];
		if (typeof orderObj === "string") {
			if (!this.columnKeys.includes(orderObj)) {
				return false;
			}
			if (!(this.isValidQueryKey(orderObj, true)) && !(this.isValidQueryKey(orderObj, false))) {
				if(!this.isValidApplyKey(orderObj)) {
					return false;
				}
			}
			return true;
		}
		let orderKeys = Object.keys(orderObj);
		if (orderKeys.length !== 2) {
			return false;
		}
		let dir: any;
		let keys: any;
		for (let key of orderKeys) {
			if (key !== "dir" && key !== "keys") {
				return false;
			}
			if (key === "dir") {
				dir = orderObj[key];
			} else {
				keys = orderObj[key];
			}
		}
		if (typeof dir !== "string") {
			return false;
		}
		if (dir !== "UP" && dir !== "DOWN") {
			return false;
		}
		if (!(keys instanceof Array)) {
			return false;
		}
		for (let key of keys) {
			if (!this.columnKeys.includes(key)) {
				return false;
			}
			if (this.isValidApplyKey(key)) {
				if (!this.applyKeys.includes(key)) {
					return false;
				}
			} else if (!(this.isValidQueryKey(key, true)) && !(this.isValidQueryKey(key, false))) {
				return false;
			}
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
		if (idString !== this._datasetID) {
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
		return true;
	}


	public get datasetID(): string {
		return this._datasetID;
	}
}

