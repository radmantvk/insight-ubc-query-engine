import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import Course from "../model/Course";
import Section from "../model/Section";
import JSZip, {JSZipObject} from "jszip";
import Dataset from "../model/Dataset";
import Query from "../model/Query";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private dataSets: string[] = [];

	constructor() {
		// console.trace("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		const isValid = this.isIDAndKindValid(id, kind);
		const isUnzipped = this.unzip(content);
		return Promise.all([isValid, isUnzipped])
			.then((promises) => {
				console.log(promises[0]); // testing
				return this.processData(id, promises[1]);
			}).then((message) => {
				console.log(message); // testing
				this.dataSets.push(id);
				return Promise.resolve(this.dataSets);
			}).catch((err) => {
				// console.log(err); // testing
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
		const q1 = new Query();
		if (!q1.isValidQuery(query)) {
			// error and return
		}
		let isValid = q1.isValidQuery(query);
		if (isValid) {
			// let datasetToLoad = q1.getID;
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
		// TODO: check to see if content is a zipfile
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
	private processData(id: string, unzippedData: any): Promise<any> {
		if (!this.directoryCoursesExists(unzippedData)) {
			console.log("processData: Directory courses not found!");
			return Promise.reject(InsightError);
		}
		let listOfFilesToBeLoaded: Array<Promise<any>> = [];
		unzippedData.folder("courses").forEach(function (relativePath: any, file: JSZipObject) {
			listOfFilesToBeLoaded.push(file.async("text")); // what does .async do here?
		});
		if (!fs.pathExistsSync("./data/")) {
			fs.mkdirSync("./data/");
		}
		let courses: Course[] = [];
		return Promise.all(listOfFilesToBeLoaded).then((data) => {
			data.forEach((courseObject: string) => {
				const sectionArr = JSON.parse(courseObject).result;
				const sections: Section[] = this.createSections(sectionArr);
				if (sections.length > 0) {
					const courseID = sections[0].dept + "-" + sections[0].id; // assuming sections is not empty
					const course: Course = new Course(courseID, sections);
					courses.push(course);
				}
			});
			let listOfCoursesToBeStored: Array<Promise<any>> = [];
			this.createDirectory(id)
				.then(() => {
					for (const course of courses) {
						const path = "./data/" + id + "/" +  course.id + ".json";
						listOfFilesToBeLoaded.push(fs.writeJSON(path, course.toJson()));
					}
				});
			return Promise.all(listOfCoursesToBeStored);
		});
	}
	private createDirectory(id: string): Promise<any> {
		if (fs.pathExistsSync("./data/")) {
			return fs.mkdir("./data/" + id);
		} else {
			return fs.mkdir("./data/")
				.then(() => {
					return fs.mkdir("./data/" + id);
				});
		}
	}

	private directoryCoursesExists(data: any): boolean {
		for (const file of Object.keys(data.files)) {
			if (file.toString().split("/")[0] === "courses") {
				return true;
			}
		}
		return false;
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
	private createSections(sections: any): Section[] {
		let listOfSections: Section[] = [];
		for (const section of sections) {
			if ("Section" in section && "Course" in section &&
				"Avg" in section && "Professor" in section &&
				"Title" in section && "Pass" in section &&
				"Fail" in section && "Audit" in section &&
				"id" in section && "Year" in section) {
				const s: Section = new Section(section.Subject, section.Course, section.Avg, section.Professor,
					section.Title, section.Pass, section.Fail, section.Audit, section.id, section.Year);
				listOfSections.push(s);
			}
		}
		return listOfSections;
	}
}

