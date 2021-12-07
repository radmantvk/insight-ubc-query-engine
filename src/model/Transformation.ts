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
		let groups: Map<string, any[]> = this.groupTransformation();
		let applies: any = this.applyTransformation(groups);
		let newList: any[] = [];
		let index = 0;
		for (let [gKey, value] of groups) {
			let obj: any = {};
			let counter = 0;
			for (const g of this.group) {
				const fieldName = g.split("_")[1];
				let val = gKey.split("~")[counter];
				if (val.includes("$")) {
					val = val.split("$")[1];
					obj["_" + fieldName] = parseFloat(val);
				} else {
					obj["_" + fieldName] = val;
				}
				counter++;
			}
			Object.keys(applies).forEach((apply) => {
				obj[apply] = applies[apply][index];
			});
			// counter2++;
			index++;
			newList.push(obj);
		}
		// for (let i = ) {
		// 	let obj: any = {};
		// 	for (const g of this.group) {
		// 		const fieldName = g.split("_")[1];
		// 		// obj["_" + fieldName] = FieldAccessor.getField(fieldName, groups[i][0]);
		// 	}
		// 	newList.push(obj);
		// 	index++;
		// }
		// Object.keys(applies).forEach((apply) => {
		// 	for (const i in newList) {
		// 		const index: number = parseInt(i, 10);
		// 		newList[index][apply] = applies[apply][index];
		// 	}
		// });
		// newList = [{_dept:"apcs", sum 2010},{_dept:"bmeg", sum:2012}]
		return newList;
	}

	public get transformExists(): boolean {
		return this._transformExists;
	}

	public groupTransformation() {
		let map = new Map();
		// map.set()
		// dept, id
		// "cpsc-110": []
		// for (const data of this.dataset) {
		// 	if (map.has(key)) {
		// 	} else {
		// 	}
		// }
		// "cpsc-210"
		// let listOfGroups: any[][] = [];
		// let listOfFields: any[] = [];   // [{"courses_year": 1900, "courses_dept": atsc},   ]
		for (const data of this.dataset) {
			let stringToCompare = "";
			for (const key of this.group) {
				let keyToSearch = key.split("_")[1];
				let newKeyVal = FieldAccessor.getMField(keyToSearch, data);
				if (newKeyVal === "") {
					newKeyVal = FieldAccessor.getSField(keyToSearch, data);
				} else {
					stringToCompare += "$";
				}
				stringToCompare += newKeyVal + "~";
			}
			if(map.has(stringToCompare)) {
				let arrOfCoursesOrRooms = map.get(stringToCompare);
				arrOfCoursesOrRooms.push(data);
				map.set(stringToCompare, arrOfCoursesOrRooms);
			} else {
				map.set(stringToCompare, [data]);
			}
			// if (this.doesGroupExists(data, listOfFields)) {
			// 	const fieldIndex: number = this.findFieldIndex(data, listOfFields);
			// 	listOfGroups[fieldIndex].push(data);
			// } else {
			// 	let obj: any = {};
			// 	for (const item of this.group) {
			// 		obj[item] = FieldAccessor.getField(item.split("_")[1], data);
			// 	}
			// 	listOfFields.push(obj);
			// 	listOfGroups.push([data]);
			// }
		}
		// return listOfGroups;
		return map;
	}

	private doesGroupExists(data: any, listOfFields: any[]) {
		for (const obj of listOfFields) {
			let allFieldsMatch = true;
			Object.keys(obj).forEach((field: any) => {
				if (obj[field] === FieldAccessor.getField(field.split("_")[1],data) && allFieldsMatch) {
					allFieldsMatch = true;
				} else {
					allFieldsMatch = false;
				}
			});
			if (allFieldsMatch) {
				return true;
			}
		}
		return false;
	}

	private findFieldIndex(data: any, listOfFields: any[]): number {
		for (const obj of listOfFields) {
			let allFieldsMatch = true;
			Object.keys(obj).forEach((field: any) => {
				if (obj[field] === FieldAccessor.getField(field.split("_")[1],data) && allFieldsMatch) {
					allFieldsMatch = true;
				} else {
					allFieldsMatch = false;
				}
			});
			if (allFieldsMatch) {
				return listOfFields.indexOf(obj);
			}
		}
		return 0;
	}

	public applyTransformation(groups: any): any {
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
					transformationObj[applyKey] = this.applyAvg(groups, key);
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

	private applyMax(groups: any, key: any) {
		let maxes = [];
		for (let [gKey, value] of groups) {
			let max = Number.MIN_SAFE_INTEGER;
			for (let section of value) {
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
		for (let [gKey, value] of groups) {
			let min = Number.MAX_SAFE_INTEGER;
			for (let section of value) {
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
		for (let [gKey, value] of groups) {
			let total = new Decimal(0);
			for (let section of value) {
				Object.keys(section).forEach((groupKey: string) => {
					if (groupKey.split("_")[1] === key.split("_")[1]) {
						let sectionAvg = new Decimal(section[groupKey]);
						total = total.add(sectionAvg);
					}
				});
			}
			let avg = total.toNumber() / value.length;
			let res = Number(avg.toFixed(2));
			averages.push(res);
		}
		return averages;
	}

	private applyCount(groups: any[], key: any) {
		let counts = [];
		let field: string = key.split("_")[1];
		for (let [gKey, value] of groups) {
			let count = 0;
			let uniqueVals: any[] = [];
			for (let data of value) {
				const fieldVal = FieldAccessor.getField(field, data);
				if(!uniqueVals.includes(fieldVal)) {
					count++;
					uniqueVals.push(fieldVal);
				}
			}
			counts.push(count);
		}
		return counts;
	}

	private applySum(groups: any[], key: any) {
		let sums = [];
		for (let [gKey, value] of groups) {
			let sum = 0;
			for (let data of value) {
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
}

