import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import Course from "../model/Course";
import Section from "../model/Section";
import JSZip, {JSZipObject} from "jszip";
import Query from "../model/Query";
import QueryValidator from "../model/QueryValidator";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private insightDatasets: InsightDataset[] = [];
	constructor() {
		// console.trace("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.isIdValid(id) || this.idHasBeenAdded(id)) {
			return Promise.reject(new InsightError("invalid id to add"));
		}
		return this.unzip(content)
			.then((unzippedContent) => {
				return this.processData(id, kind, unzippedContent);
			}).then((message) => {
				let insight: InsightDataset = {
					id : id,
					kind : kind,
					numRows : message
				};
				this.insightDatasets.push(insight);
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
		const queryValidator = new QueryValidator();
		if (!queryValidator.queryValidate(query)) {
			return Promise.reject(new InsightError());
		}
		const myQuery = new Query(query);
		if (!this.idHasBeenAdded(myQuery.datasetID)) {
			return Promise.reject(new InsightError());
		}
		this.readAndLoadCourses(myQuery.datasetID).then((courses) => {
			// myQuery.process();
			return Promise.resolve();
		}).catch(() => {
			return Promise.reject(new InsightError());
		});
		return Promise.resolve([]);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.insightDatasets);
	}

	private unzip(content: string): Promise<any> {
		const zip = new JSZip();
		return zip.loadAsync(content, {base64: true})
			.catch((err: any) => {
				return Promise.reject(new InsightError(err));
			});
	}
	private processData(id: string, kind: InsightDatasetKind, unzippedData: any): Promise<any> {
		const kindToString = this.getKindToString(kind);
		if (!this.directoryExists(kindToString, unzippedData)) {
			return Promise.reject(new InsightError());
		}
		let listOfFilesToBeLoaded: Array<Promise<any>> = [];
		unzippedData.folder(kindToString).forEach(function (relativePath: any, file: JSZipObject) {
			listOfFilesToBeLoaded.push(file.async("text"));
		});
		if (!fs.pathExistsSync("./data/")) {
			fs.mkdirSync("./data/");
		}
		if (kind === InsightDatasetKind.Courses) {
			return this.processCourses(id, listOfFilesToBeLoaded);
		} else { // InsightDatasetKind === Rooms
			// TODO: implement processRooms
			return Promise.resolve("");
		}
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

	private directoryExists(kind: string, data: any): boolean {
		for (const file of Object.keys(data.files)) {
			if (file.toString().split("/")[0] === kind) {
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

	private readAndLoadCourses(datasetID: any): Promise<Course[]> {
		let path = "./data/" + datasetID;
		let fileNames = fs.readdirSync(path);
		let listOfFilesToBeLoaded: Array<Promise<any>> = [];
		for (const fileName of fileNames) {
			let course: Course;
			const jsonPath = path + "/" + fileName;
			const jsonToRead = fs.readJson(jsonPath);
			listOfFilesToBeLoaded.push(jsonToRead);
				// .then((json) => {
				// 	// courses.push(this.jsonToCourse(json));
				// 	const jsonObj = JSON.parse(json);
				// 	course = new Course(jsonObj.id, jsonObj.sections);
				// 	console.log("hel");
				// 	return Promise.resolve([]);
				// })
				// .catch((err) => {
				// 	console.log(err.toString());
				// 	return Promise.resolve([]);
				// });
		}
		let courses: Course[] = [];
		return Promise.all(listOfFilesToBeLoaded).then((data) => {
			for (const json of data) {
				const jsonObj = JSON.parse(json);
				const course = new Course(jsonObj.id, jsonObj.sections);
				courses.push(course);
			}
		})
			.then(() => {
				return Promise.resolve(courses);
			});
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

	private getKindToString(kind: InsightDatasetKind): string {
		if (kind === InsightDatasetKind.Courses) {
			return "courses";
		} else {
			return "rooms";

		}
	}

	private processCourses(id: string, listOfFilesToBeLoaded: any[]) {
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
						const courseID = "courses-" + sections[0].dept + "-" + sections[0].id; // assuming sections is not empty
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
}


