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
	// private dataSets: string[] = [];
	private insightDatasets: InsightDataset[] = [];
	constructor() {
		// console.trace("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.isIdValid(id) || this.idHasBeenAdded(id)) {
			return Promise.reject(new InsightError("invalid id to add"));
		}
		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("invalid kind to add"));
		}
		return this.unzip(content)
			.then((unzippedContent) => {
				// console.log(promises[0]); // testing
				return this.processData(id, unzippedContent);
			}).then((message) => {
				// console.log(message); // testing
				// this.dataSets.push(id);
				let insight: InsightDataset = {
					id : id,
					kind : kind,
					numRows : message
				};
				this.insightDatasets.push(insight);
				// this.dataSets.push(id);
				let listOfAddedIDs: string[] = [];
				for (const dataset of this.insightDatasets) {
					listOfAddedIDs.push(dataset.id);
				}
				return Promise.resolve(listOfAddedIDs);
			}).catch((err) => {
				// console.log(err.toString()); // testing
				return Promise.reject(new InsightError(err));
			});
	}

	public removeDataset(id: string): Promise<string> {
		if (!this.isIdValid(id)) {
			return Promise.reject(new InsightError());
		} else if (!this.idHasBeenAdded(id)) {
			return Promise.reject(new NotFoundError());
		}
		// remove data from list
		this.insightDatasets.forEach((value, index) => {
			if (value.id === id) {
				this.insightDatasets.splice(index, 1);
			}
		});
		// remove data from disk
		return fs.remove("./data/" + id)
			.then(() => {
				return Promise.resolve(id);
			})
			.catch((err) => {
				// console.log(err.toString());
				return Promise.reject(err);
			});
	}

	public performQuery(query: any): Promise<any[]> {
		const q1 = new Query();
		if (!q1.isValidQuery(query)) {
			// error and return
			return Promise.reject(new InsightError());
		}
		// let isValid = q1.isValidQuery(query);
		// if (isValid) {
		// 	// let datasetToLoad = q1.getID;
		// }
		// const listOfCourses: Course[] = loadDataSet(q1.datasetID);

		// q1.course = loadCourses(q1.datasetID); // returns an array of courses
		// const where = ...
		// const options = ...

		// return q1.process(where, options , key);
		return Promise.resolve([]);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.insightDatasets);
	}

	private unzip(content: string): Promise<any> {
		// TODO: check to see if content is a zipfile
		const zip = new JSZip();
		return zip.loadAsync(content, {base64: true})
			.catch((err: any) => {
				// console.log("unzip: failed");
				return Promise.reject(new InsightError(err));
			});
	}
	private processData(id: string, unzippedData: any): Promise<any> {
		if (!this.directoryCoursesExists(unzippedData)) {
			// console.log("processData: Directory courses not found!");
			return Promise.reject(new InsightError());
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
			let containsOneOrMoreJsonFiles = false;
			let counter = 0;
			data.forEach((courseObject: string) => {
				let sections: Section[] = [];
				try {
					const sectionArr = JSON.parse(courseObject);
					sections = this.createSections(sectionArr.result);
					counter += sections.length;
					if (sections.length > 0) {
						const courseID = sections[0].dept + "-" + sections[0].id; // assuming sections is not empty
						const course: Course = new Course(courseID, sections);
						courses.push(course);
					}
					containsOneOrMoreJsonFiles = true;
				} catch (e) {
					// console.log("do nothing to the invalid json file");
				}
			});
			if (!containsOneOrMoreJsonFiles) {
				return Promise.reject(new InsightError());
			}
			let listOfCoursesToBeStored: Array<Promise<any>> = [];
			this.createDirectory(id)
				.then(() => {
					for (const course of courses) {
						const path = "./data/" + id + "/" +  course.id + ".json";
						listOfFilesToBeLoaded.push(fs.writeJSON(path, course.toJson()));
					}
				});
			return Promise.all(listOfCoursesToBeStored)
				.then(() => {
					return counter;
				});
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

	private isIdValid(id: string): boolean {
		if (id.includes("_")) {
			return false;
		} else {
			let trimmedID: string = id.replace(/ /g, "");
			if (trimmedID.length === 0) {
				return false;
			}
		}
		return true;
	}
	private idHasBeenAdded(id: string): boolean {
		for (const insight of this.insightDatasets) {
			if (insight.id === id) {
				return true;
			}
		}
		return false;
	}
}

