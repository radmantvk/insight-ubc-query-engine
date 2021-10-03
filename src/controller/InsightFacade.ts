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
		this.checkIDValidity(id)
			.catch((err) => {
				return err;
			});
		this.checkKindValidity(kind)
			.catch((err) => {
				return err;
			});
		// this.unzip(content);
		// check validity:1. there is at least 1 valid course section (non-empty file), a valid json format, and in valid directory (courses)
		// data modelling
		// storing into disk (not everything)
		// if anything failed: return Promise.reject
		// return Promise.reject(InsightError)

		this.dataSets.push(id);
		return Promise.resolve(this.dataSets);
	}

	public removeDataset(id: string): Promise<string> {
		this.checkIDValidity(id)
			.catch((err) => {
				return err;
			});
		delete this.dataSets[this.dataSets.indexOf(id)];
		return Promise.resolve(id);
	}

	public performQuery(query: any): Promise<any[]> {
		return Promise.resolve([]);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve([]);
	}

	/**
	 * Checks the kind of dataset validity
	 * @param kind  the kind of dataset (room or courses)
	 * @return Promise <string[]>
	 */
	private checkKindValidity(kind: InsightDatasetKind): Promise<InsightDatasetKind> {
		if (kind === InsightDatasetKind.Rooms) {
			console.log("InsightDatasetKind is Rooms");
			return Promise.reject(InsightError);
		}
		return Promise.resolve(kind);
	}

	/**
	 * Checks ID's validity
	 * @param id  The id of the dataset being added.
	 * @return Promise <string[]>
	 */
	private checkIDValidity(id: string): Promise<string> {
		if (this.dataSets.includes(id)) {
			console.log("id was already added");
			return Promise.reject(InsightError);
		} else if (this.dataSets.includes("_")) {
			console.log("id includes underscore");
			return Promise.reject(InsightError);
		} else {
			const trimmedID: string = id.replace(" ", "");
			if (trimmedID.length === 0) {
				return Promise.reject(InsightError);
			}
		}
		return Promise.resolve(id);
	}

	private unzip(content: string) {
		const JSZip = require("jszip");
		const zip = new JSZip();
		const path = "project_team147/data/courses/";
		zip.loadAsync(content, {base64: true})
			.then(function (contents: any) {
				Object.keys(zip.files).forEach(function (name) {
					let data = zip.files[name];							// each course file inside dataset stored here
					let location = path + name;							// location that we want to store the course file
					fs.writeFileSync(location, data);					// write to file at the designated location with designated course
				});
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
	// private unzip(content:string) {
	//     // const JSZip = require("jszip");
	//     // const fs = require("fs-extra");
	//     // const zip = new JSZip()
	//     // fs.readFile("courses.zip", function (err:any, data:any) {
	//     //     if (!err) {
	//     //         zip.loadAsync(content, {base64:true})
	//     //             .then(function( contents:any) {
	//     //                 Object.keys(zip.files).forEach(function(name) {
	//     //                     let data = zip.files[name];
	//     //                     // path
	//     //                     // fs.writeFileSync(path, data);
	//     //                 })
	//     //
	//     //             })
	//     //         console.log(zip.files);
	//     //
	//     //
	//     //         // Object.keys(contents.files).forEach(function(filename) {
	//     //         //     zip.file(filename).async('nodebuffer').then(function(content) {
	//     //         //         var dest = path + filename;
	//     //         //         fs.writeFileSync(dest, content);
	//     //         //     });
	//     //         // });
	//     //     })
	//     //
	//     // });
	// }

