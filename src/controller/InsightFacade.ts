import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";

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
		this.checkIDandKindValidity(id, kind)
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
		return Promise.resolve("Not implemented.");
	}

	public performQuery(query: any): Promise<any[]> {
		return Promise.resolve([]);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve([]);
	}

	/**
	 * Checks ID's validity
	 * @param id  The id of the dataset being added.
	 * @return Promise <string[]>
	 */
	private checkIDandKindValidity(id: string, kind: InsightDatasetKind) {
		if (kind === InsightDatasetKind.Rooms){
			console.log("InsightDatasetKind is Rooms");
			return Promise.reject(InsightError);
		} else if (this.dataSets.includes(id)) {
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
}
