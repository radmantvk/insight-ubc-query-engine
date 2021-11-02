export default class TransformValidator {
	private _datasetID: string = "";
	private _applyKeys: any = [];
	private _groupKeys: any = [];
	public validate(TRANSFORMATIONS: any): boolean {
		const transformationKeys = Object.keys(TRANSFORMATIONS);
		if (transformationKeys.length !== 2) {
			return false;
		}
		let group: any;
		let apply: any;
		for (let key of transformationKeys) {
			if (key !== "GROUP" && key !== "APPLY") {
				return false;
			}
			if (key === "GROUP") {
				group = TRANSFORMATIONS[key];
			} else {
				apply = TRANSFORMATIONS[key];
			}
		}

		if (!this.groupValidate(group)) {
			return false;
		}

		if (!this.applyValidate(apply)) {
			return false;
		}
		return true;
	}

	private groupValidate(group: any) {
		if (!(group instanceof Array)) {
			return false;
		}

		if (group.length === 0) {
			return false;
		}

		this._datasetID = group[0].split("_")[0];
		for (let key of group) {
			if (!this._groupKeys.includes(key)) {
				this._groupKeys.push(key);
			}
			let field = key.split("_")[1];
			if (this.isValidMField(field)) {
				if (!this.isValidQueryKey(key,true)) {
					return false;
				}
			}
			if (this.isValidSField(field)) {
				if (!this.isValidQueryKey(key,false)) {
					return false;
				}
			}
		}
		return true;
	}

	private applyValidate(apply: any) {
		if (!(apply instanceof Array)) {
			return false;
		}

		if (apply.length === 0) {
			return false;
		}

		for (let obj of apply) {
			if (!this.applyRuleValidate(obj)) {
				return false;
			}
		}
		return true;
	}


	private applyRuleValidate(applyRule: any) {
		let keys = Object.keys(applyRule);
		if (keys.length !== 1) {
			return false;
		}
		let applyBody = applyRule[keys[0]];
		let applyTokens = Object.keys(applyBody);
		if (applyTokens.length !== 1) {
			return false;
		}
		let applyToken = applyTokens[0];
		if (applyToken !== "MAX" && applyToken !== "MIN" && applyToken !== "AVG" && applyToken !== "COUNT" &&
			applyToken !== "SUM") {
			return false;
		}
		if (applyToken === "MAX" || applyToken === "MIN" || applyToken === "AVG" || applyToken === "SUM") {
			let key = applyBody[applyToken];
			let field = applyBody[applyToken].split("_")[1];
			if (this.isValidSField(field)) {
				return false;
			}
			if (this.isValidMField(field)) {
				if (!this.isValidQueryKey(key, true)) {
					return false;
				}
			}
		} else {
			let key = applyBody[applyToken];
			let field = applyBody[applyToken].split("_")[1];
			if (this.isValidSField(field)) {
				if (!this.isValidQueryKey(key, false)) {
					return false;
				}
			}
			if (this.isValidMField(field)) {
				if (!this.isValidQueryKey(key, true)) {
					return false;
				}
			}
		}

		if (!this._applyKeys.includes(keys[0])) {
			this._applyKeys.push(keys[0]);
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

	public get datasetID(): string {
		return this._datasetID;
	}

	public get applyKeys(): any {
		return this._applyKeys;
	}

	public get groupKeys(): any {
		return this._groupKeys;
	}
}
