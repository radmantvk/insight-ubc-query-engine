import {InsightDatasetKind} from "../controller/IInsightFacade";
import any from "./Section";
import {QueryTransformations} from "./Query";
import Decimal from "decimal.js";

export default class Transform {
	private readonly _transformExists: boolean;
	private dataset: any[] = [];
	constructor(dataset: any[], query: any) {
		let queryKeys = Object.keys(query);
		let transform = "";
		queryKeys.forEach((key) => {
			if (key === "TRANSFORMATIONS") {
				transform = query.TRANSFORMATIONS;
			}
		});
		// no transformation
		if (transform === "") {
			this._transformExists = false;
		} else {
			this.dataset = dataset;
			this._transformExists = true;
			let group: any;
			let apply: any;
			Object.keys(transform).forEach((key) => {
				if (key === "GROUP") {
					group = query.TRANSFORMATIONS.GROUP;
				}
				if (key === "APPLY") {
					apply = query.TRANSFORMATIONS.APPLY;
				}
			});
		}
	}


	public get transformExists(): boolean {
		return this._transformExists;
	}

	// TODO: Continue here
	public groupData(group: any[]): any[][] {
		let listOfGroups: any[][] = this.initialProcessGroup(this.dataset, group[0]);
		for (const key of group) {
			listOfGroups = this.processGroup(listOfGroups, key);
		}
		return listOfGroups;
	}

	private processGroup(doubleList: any[][], key: any) {
		// TODO: Crop off to get field
		let listOfFields: any[] = [];
		let listOfGroups: any[][] = [];
		// first
		for (const group of doubleList) {
			for (const data of group) {
				// TODO: get field of the data
				let field = this.getMField(key.split("_")[1], data);
				if (field === undefined) {
					field = this.getSField(key.split("_")[1], data);
				}
				if (listOfFields.includes(field)) {
					// TODO: check if the value of the field of the data has already been added in the list of fields
					const index = listOfFields.indexOf(field);
					listOfGroups[index].push(data);
				} else {
					listOfFields.push(field);
					listOfGroups.push([data]);
				}
			}
		}
		return listOfGroups;
	}

	/**
	 *
	 * @param dataset
	 * @param key: saved as "courses_dept" for example.
	 * @private
	 */
	private initialProcessGroup(dataset: any[], key: any): any[][] {
		// TODO: Crop off to get field
		let listOfFields: any[] = [];
		let listOfGroups: any[][] = [];
		// first
		for (const data of dataset) {
			// TODO: get field of the data
			let field = this.getMField(key.split("_")[1], data);
			if (field === undefined) {
				field = this.getSField(key.split("_")[1], data);
			}
			if (listOfFields.includes(field)) {
				// TODO: check if the value of the field of the data has already been added in the list of fields
				const index = listOfFields.indexOf(field);
				listOfGroups[index].push(data);
			} else {
				// const index = listOfFields.length;
				listOfFields.push(field);
				listOfGroups.push([data]);
			}
		}

		return listOfGroups;
	}

	public applyTransformation(apply: any[], groups: any[]): any {
		let transformationObj: any = {};
		for (let obj of apply) {
			let applyKey = Object.keys(obj)[0]; // the name of the apply action
			let applyKeyObj = obj[applyKey];
			let applyToken = Object.keys(applyKeyObj)[0];
			let key = applyKeyObj[applyToken];
			switch (applyToken) {
				case "MAX":
					transformationObj[applyKey] = this.applyMax(groups, key);
				case "MIN":
					transformationObj[applyKey] = this.applyMin(groups, key);
				case "AVG":
					transformationObj[applyKey] = this.applyAvg(groups, key);
				case "SUM":
					transformationObj[applyKey] = this.applySum(groups, key);
				case "COUNT":
					transformationObj[applyKey] = this.applyCount(groups, key);
			}
		}
		return transformationObj;
	}

	private applyMax(groups: any[], key: any) {
		let maxes = [];
		for (let group of groups) {
			let max = 0;
			for (let section of group) {
				Object.keys(section).forEach((groupKey) => {
					if (groupKey.split("_")[1] === key.split("_")[1]) {
						if (section[groupKey] > max) {
							max = section[groupKey];
						}
					}
				});
			}
			maxes.push(max);
		}
		return maxes;
	}

	private applyMin(groups: any[], key: any) {
		let minimums = [];
		for (let group of groups) {
			let min = Number.MAX_SAFE_INTEGER;
			for (let section of group) {
				Object.keys(section).forEach((groupKey) => {
					if (groupKey.split("_")[1] === key.split("_")[1]) {
						if (section[groupKey] < min) {
							min = section[groupKey];
						}
					}
				});
			}
			minimums.push(min);
		}
		return minimums;
	}

	private applyAvg(groups: any[], key: any) {
		let averages = [];
		for (let group of groups) {
			let total = new Decimal(0);
			// let test = new Decimal(1);
			// let testSum = total.add(test);
			for (let section of group) {
				Object.keys(section).forEach((groupKey) => {
					if (groupKey.split("_")[1] === key.split("_")[1]) {
						let sectionAvg = new Decimal(section[groupKey]);
						total = total.add(sectionAvg);
					}
				});
			}
			let avg = total.toNumber() / group.length;
			let res = Number(avg.toFixed(2));
			averages.push(res);
		}
		return averages;
	}

	private applyCount(groups: any[], key: any) {
		let counts = [];
		for (let group of groups) {
			let count = 0;
			for (let data of group) {
				Object.keys(data).forEach((groupKey) => {
					if (groupKey.split("_")[1] === key.split("_")[1]) {
						count++;
					}
				});
			}
			counts.push(count);
		}
		return counts;
	}

	private applySum(groups: any[], key: any) {
		let sums = [];
		for (let group of groups) {
			let sum = 0;
			for (let data of group) {
				Object.keys(data).forEach((groupKey) => {
					if (groupKey.split("_")[1] === key.split("_")[1]) {
						sum += data[groupKey];
					}
				});
				sum = Number(sum.toFixed(2));
			}
			sums.push(sum);
		}
		return sums;
	}

	private getSField(sField: any, data: any) {
		if (sField === "dept") {
			return data._dept;
		}
		if (sField === "id") {
			return data._id;
		}
		if (sField === "instructor") {
			return data._instructor;
		}
		if (sField === "title") {
			return data._title;
		}
		if (sField === "uuid") {
			return data._uuid;
		}
		if (sField === "fullname") {
			return data._fullname;
		}
		if (sField === "shortname") {
			return data._shortname;
		}
		if (sField === "number") {
			return data._number;
		}
		if (sField === "name") {
			return data._name;
		}
		if (sField === "address") {
			return data._address;
		}
		if (sField === "type") {
			return data._type;
		}
		if (sField === "furniture") {
			return data._furniture;
		}
		if (sField === "href") {
			return data._href;
		}

	}

	private getMField(mField: any, data: any) {
		if (mField === "avg") {
			return data._avg;
		}
		if (mField === "pass") {
			return data._pass;
		}
		if (mField === "fail") {
			return data._fail;
		}
		if (mField === "audit") {
			return data._audit;
		}
		if (mField === "year") {
			return data._year;
		}
		if (mField === "lat") {
			return data._lat;
		}
		if (mField === "lon") {
			return data._lon;
		}
		if (mField === "seats") {
			return data._seats;
		}
	}
}
