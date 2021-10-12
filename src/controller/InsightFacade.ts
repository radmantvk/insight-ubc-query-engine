import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import Course from "../model/Course";
import Section from "../model/Section";
import Query from "../model/Query";


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
		this.unzipAndProcess(content)
			.then((unzippedData) => {
				console.log("data has been unzipped and received");
				return this.processData(unzippedData);
			})
			.catch(() => {
				console.log("data couldn't be unzipped");
				return Promise.reject(InsightError);
			});
		// data modelling, checking validity of content

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
		const q1 = new Query();
		if (!q1.isValidQuery(query)) {
			// error and return
		}

		// q1.course = loadCourses(q1.datasetID); // returns an array of courses
		// const where = ...
		// const options = ...

		// return q1.process(where, options , key);
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

	private unzipAndProcess(content: string): Promise<any> {
		const JSZip = require("jszip");
		const zip = new JSZip();
		return zip.loadAsync(content, {base64: true})
			.then((unzippedData: any) => {
				return unzippedData;
			})
			.catch((err: any) => {
				console.log("unzipAndProcess: error unzipping");
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
	private processData(unzippedData: any) {
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
		// Object.keys(unzippedData.files).forEach(function (file: any) {
		// 	// Course course;
		// 	console.log(file);
		// 	try {
		// 		const obj = JSON.parse(file);
		// 			// , function(key,value) {
		// 			// if (key === "result") {
		// 			// 	console.log(value);
		// 			//
		// 			// 	let sections: Section[] = this.createSections(value); // returns an array of type section
		// 			// 	let course = new Course(sections);
		// 			// 	// course.toString  write it into a json object
		// 			// 	// store it into the data folder is the new id
		// 			//
		// 			// }
		// 		// });
		// 		containsValidJson = true;
		// 	} catch (err) {
		// 		console.log(err);
		// 		console.log("invalid json file couldn't be parsed");
		// 	}
		// });
		if (!containsValidJson) {
			return Promise.reject(InsightError);
		}
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

