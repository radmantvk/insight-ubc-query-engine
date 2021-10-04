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
		this.unzip(content);
			// .then((unzipped: any) => {
			// 	console.log("successfully unzipped")
			// });
		// check validity:1. there is at least 1 valid course section (non-empty file), a valid json format, and in valid directory (courses)
		// data modelling
		// storing into disk (not everything)
		// if anything failed: return Promise.reject
		// return Promise.reject(InsightError)
		let sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
		sleep(10000);
		console.log("unzip method finished successfully");
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

	private unzip(content: string) {
		let JSZip = require("jszip");
		let zip = new JSZip();
		const path = "project_team147/data/courses/";
		console.log("size of content is: " + content.length);
		return zip.loadAsync(content, {base64: true})
			.then(function (data: any) {

				console.log("outside");
				Object.keys(data.files).forEach(function (name) {
					let data2 = data.files[name];							// each course file inside dataset stored here
					// console.log(data.toString());
					console.log("hello world");
					let location = path + name;							// location that we want to store the course file
					fs.writeFileSync(location, data);					// write to file at the designated location with designated course
				});
			})
			.catch((err: any) => {
				console.log("oops");
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
	 * Parsing a string to json format and checking if it is valid
	 */
	// TODO: figure out how we would access the content inside a single json file
	private isJsonString(str: string) {
		try {
			JSON.parse(str);
		} catch (error) {
			return false;
		}
		return true;
	}
}

