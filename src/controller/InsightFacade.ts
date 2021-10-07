import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private dataSets: string[] = [];

	constructor() {
		console.trace("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if(!this.isIDAndKindValid(id, kind)) {
			return Promise.reject(InsightError);
		}
		let unzippedData = this.unzip(content)
			.then(() => {
				console.log("data has been unzipped and received");
			})
			.catch(() => {
				console.log("data couldn't be unzipped");
				return Promise.reject(InsightError);
			});
		// data modelling, checking validity of content

		this.processData(unzippedData);
		// console.log("unzip method finished successfully");
		this.dataSets.push(id);
		return Promise.resolve([id]);
	}

	public removeDataset(id: string): Promise<string> {
		// check the id is valid
		if (!this.dataSets.includes(id)) {
			console.log("no such id exists");
			return Promise.reject(NotFoundError);
		}
		// TODO processRemove() to remove dataset from the disk or any other fields
		this.removeData(id);
		return Promise.resolve(id);
	}

	public performQuery(query: any): Promise<any[]> {
		return Promise.resolve([]);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve([]);
	}
	/**
	 * Checks the id and kind of dataset validity
	 * @param id the id of the dataset
	 * @param kind the kind of dataset (room or courses)
	 * @return Promise <string[]>
	 */
	private isIDAndKindValid(id: string, kind: InsightDatasetKind): boolean {
		if (kind === InsightDatasetKind.Rooms) {
			console.log("InsightDatasetKind is Rooms");
			return false;
		} else if (this.dataSets.includes(id)) {
			console.log("id was already added");
			return false;
		} else if (this.dataSets.includes("_")) {
			console.log("id includes underscore");
			return false;
		} else {
			const trimmedID: string = id.replace(" ", "");
			if (trimmedID.length === 0) {
				console.log("id was an empty string or only spaces");
				return false;
			}
		}
		console.log("id is valid; resolving");
		return true;
	}

	private unzip(content: string): Promise<any> {
		const JSZip = require("jszip");
		const zip = new JSZip();
		return zip.loadAsync(content, {base64: true})
			.then((unzippedData: any) => {
				let counter = 0;
				Object.keys(unzippedData.files).forEach(function (filename: any) {
					// console.log("looping");
					// const course = unzippedData.files[filename];
					// JSON.parse("course", )
					// console.log(c
					counter++;
					return Promise.resolve(unzippedData);
				});
				console.log("looped time: " + counter.toString());
			})
			.catch((err: any) => {
				console.log("error unzipping");
				return Promise.reject(InsightError);
			});
	}

	private removeData(id: string) {
		this.dataSets.forEach((value, index) => {
			if(value === id) {
				this.dataSets.splice(index,1);
			}
		});
	}

	/**
	 * @param unzippedData
	 * @private
	 */
	// skip invalid JSONs, need at least 1 json file to continue or FAIL
	// skip invalid sections, if 1 is valid then ok; else, skip file
	// If no valid sections have been added, don't add dataset

	// check validity:1. there is at least 1 valid course section (non-empty file), a valid json format, and in valid directory (courses)

	// const path = "project_team147/data/courses/";
	// data modelling
	// storing into disk (not everything)
	// if anything failed: return Promise.reject
	// return Promise.reject(InsightError)
	private processData(unzippedData: any) {
		console.log("uo");
		let counter = 0;
		Object.keys(unzippedData.files).forEach(function (filename: any) {
			// console.log("looping");
			// const course = unzippedData.files[filename];
			// JSON.parse("course", )
			// console.log(c
			console.log("looped time: " + counter.toString());
			counter++;
			return;
		});
		console.log("looped time: " + counter.toString());
		// Object.keys(unzippedData.files).forEach(function (name) {
		// 	console.log("processing data");
		// 	let data = unzippedData.files[name];
		// 	console.log(data);
		// 	const obj = JSON.parse(data, (key, value) => {
		// 		console.log(obj.toString());
		// 		console.log("processing data finished");
		// 	});
		// });

	}
	/**
	 * Parsing a string to json format and checking if it is valid
	 */
// TODO: figure out how we would access the content inside a single json file
	private parseJson(str: string) {
		try {
			let o = JSON.parse(str);
			if (o && typeof o === "object") {
				return Promise.resolve(o);
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

}

