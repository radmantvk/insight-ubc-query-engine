import {InsightDatasetKind} from "../controller/IInsightFacade";
import any from "./Section";
import {QueryTransformations} from "./Query";
import Decimal from "decimal.js";
import FieldAccessor from "./FieldAccessor";

export default class Transformation {
	private readonly _transformExists: boolean;
	private dataset: any[] = [];
	private group: any; // array of strings
	private apply: any; // array of objects

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
			Object.keys(transform).forEach((key) => {
				if (key === "GROUP") {
					this.group = query.TRANSFORMATIONS.GROUP;
				}
				if (key === "APPLY") {
					this.apply = query.TRANSFORMATIONS.APPLY;
				}
			});
		}
	}

	public transform(): any[] {
		let groups: any[][] = this.groupTransformation();
		let applies: any = this.applyTransformation(groups);
		let newList: any[] = [];
		for (const i in groups) {
			let obj: any = {};
			for (const g of this.group) {
				const fieldName = g.split("_")[1];
				obj["_" + fieldName] = FieldAccessor.getField(fieldName, groups[i][0]);
			}
			newList.push(obj);
		}
		Object.keys(applies).forEach((apply) => {
			for (const i in newList) {
				const index: number = parseInt(i, 10);
				newList[index][apply] = applies[apply][index];
			}
		});
		return newList;
	}

	public get transformExists(): boolean {
		return this._transformExists;
	}

	public groupTransformation(): any[][] {
		let listOfGroups: any[][] = this.initialProcessGroup(this.dataset, this.group[0]);
		for (const key of this.group) { // TODO
			listOfGroups = this.processGroup(listOfGroups, key);
		}
		return listOfGroups;
	}

	private processGroup(doubleList: any[][], key: any) {
		// : Crop off to get field
		let listOfFields: any[] = [];
		let listOfGroups: any[][] = [];
		// first
		for (const group of doubleList) {
			for (const data of group) {
				// : get field of the data
				let field = FieldAccessor.getField(key.split("_")[1], data);
				// 	= this.getMField(key.split("_")[1], data);
				// if (field === undefined) {
				// 	field = this.getSField(key.split("_")[1], data);
				// }
				if (listOfFields.includes(field)) {
					// : check if the value of the field of the data has already been added in the list of fields
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
		// : Crop off to get field
		let listOfFields: any[] = [];
		let listOfGroups: any[][] = [];
		// first
		for (const data of dataset) {
			// : get field of the data
			let field = FieldAccessor.getField(key.split("_")[1], data);
			// 	this.getMField(key.split("_")[1], data);
			// if (field === undefined) {
			// 	field = this.getSField(key.split("_")[1], data);
			// }
			if (listOfFields.includes(field)) {
				// : check if the value of the field of the data has already been added in the list of fields
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

	public applyTransformation(groups: any[]): any {
		let transformationObj: any = {};
		for (let obj of this.apply) {
			let applyKey = Object.keys(obj)[0]; // the name of the apply action
			let applyKeyObj = obj[applyKey];
			let applyToken = Object.keys(applyKeyObj)[0];
			let key = applyKeyObj[applyToken];
			switch (applyToken) {
				case "MAX":
					transformationObj[applyKey] = this.applyMax(groups, key);
					break;
				case "MIN":
					transformationObj[applyKey] = this.applyMin(groups, key);
					break;
				case "AVG":
					transformationObj[applyKey] = this.applyAvg(groups);
					break;
				case "SUM":
					transformationObj[applyKey] = this.applySum(groups, key);
					break;
				case "COUNT":
					transformationObj[applyKey] = this.applyCount(groups, key);
					break;
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

	// private applyAvg(groups: any[], key: any) {
	// 	let averages = [];
	// 	for (let group of groups) {
	// 		let total = new Decimal(0);
	// 		for (let section of group) {
	// 			Object.keys(section).forEach((groupKey: string) => {
	// 				if (groupKey.split("_")[1] === key.split("_")[1]) {
	// 					let sectionAvg = new Decimal(section[groupKey]);
	// 					total = total.add(sectionAvg);
	// 				}
	// 			});
	// 		}
	// 		let avg = total.toNumber() / group.length;
	// 		let res = Number(avg.toFixed(2));
	// 		averages.push(res);
	// 	}
	// 	return averages;
	// }

	private applyAvg(groups: any[]) {
		let averages = [];
		for (let group of groups) {
			let total = new Decimal(0);
			for (let section of group) {
				Object.keys(section).forEach((groupKey: string) => {
					if (groupKey === "_avg") {
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

	private handleDirection() {
		return "YOUOUO";
	}
}

