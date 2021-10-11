import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import Course from "../model/Course";
import Section from "../model/Section";


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
		const isValid = this.isIDAndKindValid(id, kind);
		const isUnzipped = this.unzip(content);
		return Promise.all([isValid, isUnzipped])
			.then((validity) => {
				console.log(validity[0]); // testing
				return this.processData(validity[1]);
			}).then((message) => {
				console.log(message); // testing
				this.dataSets.push(id);
				return Promise.resolve(this.dataSets);
			}).catch((err) => {
				console.error(err); // testing
				return Promise.reject(InsightError);
			});
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
		// check query validity
		// load and instantiate all objects in the folder named by the query id
		//
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
	private isIDAndKindValid(id: string, kind: InsightDatasetKind): Promise<string> {
		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject("isIDAndKindValid: InsightDatasetKind is Rooms!");
		} else if (this.dataSets.includes(id)) {
			return Promise.reject("isIDAndKindValid: id was already added!");
		} else if (this.dataSets.includes("_")) {
			return Promise.reject("isIDAndKindValid: id includes underscore!");
		} else {
			const trimmedID: string = id.replace(" ", "");
			if (trimmedID.length === 0) {
				return Promise.reject("isIDAndKindValid: id was an empty string or only spaces!");
			}
		}
		return Promise.resolve("isIDAndKindValid: id and kind is valid");
	}

	private unzip(content: string): Promise<any> {
		const JSZip = require("jszip");
		const zip = new JSZip();
		return zip.loadAsync(content, {base64: true})
			.catch((err: any) => {
				console.log("unzip: failed");
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
	// storing into disk (not everything)
	// if anything failed: return Promise.reject
	// return Promise.reject(InsightError)
	private processData(unzippedData: any): Promise<string> {
		if (!unzippedData.folder("courses").exists) {
			return Promise.reject("processData: folder courses doesn't exist!");
		}
		let containsValidJson;
		let courses = unzippedData.folder("courses");
		let variable: Array<Promise<any>> = [];
		unzippedData.folder("courses").forEach(function (relativePath: any, file: any) {
			variable.push(file.async("text"));
		});
		Promise.all(variable).then((data) => {
			console.log(data);
			data.forEach((eachData: string) => {
				const json = JSON.parse(eachData);
			});
		});
		return Promise.resolve("processData: successfully finished");
	}
	// type Section = {
	// 	avg: "",
	// 	course: ""
	// }

	/**
	 * let sections = list of Sections
	 * inside each loop:
	 * let Section section;
	 * extract all fields (ex. dept) store on a local variable
	 * instantiate section
	 * add it to List of Section
	 * return List after looping through all sections
	 */
	private createSections(arrayOfObj: JSON[]): Section[] {

		let sections: Section[] = [];
		for (const section of arrayOfObj) {
			// let course: JSON = section["avg"];
			// section.

			// if ("Section" in section && "Course" in section &&
			// 	"Avg" in section && "Professor" in section &&
			// 	"Title" in section && "Pass" in section &&
			// 	"Fail" in section && "Audit" in section &&
			// 	"id" in section && "Year" in section) {
			// 	if (section instanceof Section) {				// idk what this is but i got an error without it
			// 		sections.push(section);
			// 	}
			// }
		}
		return sections;
	}
}

