import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import Course from "../model/Course";
// import Room from "../model/Room";
import JSZip, {JSZipObject} from "jszip";
import Query from "../model/Query";
import QueryValidator from "../model/QueryValidator";
import CoursesProcessor from "../model/CoursesProcessor";
import RoomsProcessor from "../model/RoomsProcessor";
import Building from "../model/Building";
import Room from "../model/Room";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private insightDatasets: InsightDataset[] = [];
	constructor() {
		console.trace("InsightFacadeImpl::init()");
		const content = fs.readFileSync("./test/resources/archives/courses.zip").toString("base64");
		this.addDataset("courses", content, InsightDatasetKind.Courses);
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
		// const kind: string = this.getKind(myQuery.datasetID);
		return this.readAndLoad(myQuery.datasetID , myQuery.kind).then((courses) => {
			return myQuery.process(courses, myQuery.kind);
		});
	}

	// private readAndLoadCourses(datasetID: any): Promise<Course[]> {
	// 	let path = "./data/" + datasetID;
	// 	let fileNames = fs.readdirSync(path);
	// 	let listOfFilesToBeLoaded: Array<Promise<any>> = [];
	// 	for (const fileName of fileNames) {
	// 		const jsonPath = path + "/" + fileName;
	// 		const jsonToRead = fs.readJson(jsonPath);
	// 		listOfFilesToBeLoaded.push(jsonToRead);
	// 	}
	// 	let courses: Course[] = [];
	// 	return Promise.all(listOfFilesToBeLoaded).then((data) => {
	// 		for (const json of data) {
	// 			const jsonObj = JSON.parse(json);
	// 			const course = new Course(jsonObj.id, jsonObj.sections);
	// 			courses.push(course);
	// 		}
	// 	})
	// 		.then(() => {
	// 			return Promise.resolve(courses);
	// 		});
	// }

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
		// return numRows
		const kindToString = this.getKindToString(kind);
		if (!this.directoryExists(kindToString, unzippedData)) {
			return Promise.reject(new InsightError());
		}
		if (!fs.pathExistsSync("./data/")) {
			fs.mkdirSync("./data/");
		}
		if (kind === InsightDatasetKind.Courses) {
			let listOfFilesToBeLoaded: Array<Promise<any>> = [];
			unzippedData.folder(kindToString).forEach(function (relativePath: any, file: JSZipObject) {
				listOfFilesToBeLoaded.push(file.async("text"));
			});
			return CoursesProcessor.process(id, listOfFilesToBeLoaded);
		} else { // InsightDatasetKind === Rooms
			let indexFileLoading: Array<Promise<any>> = [];
			unzippedData.folder(kindToString).forEach(function (relativePath: any, file: JSZipObject) {
				const buildingFolder = "rooms/campus/discover/buildings-and-classrooms/";
				if (file.name === "rooms/index.htm"){
					indexFileLoading.push(file.async("text"));
				}
			});
			return RoomsProcessor.getBuildings(indexFileLoading)
				.then((buildings) => {
					const buildingFilesToBeLoaded: any[] = this.getBuildingFiles(unzippedData, buildings);
					return RoomsProcessor.getRooms(buildings, buildingFilesToBeLoaded)
						.then((rooms) => {
							return Promise.resolve(RoomsProcessor.process(id, rooms));
						});
				}).catch((error) => {
					return Promise.reject(new InsightError());
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

	private readAndLoad(datasetID: any, kind: InsightDatasetKind): Promise<any[]> {
		let path = "./data/" + datasetID;
		let fileNames = fs.readdirSync(path);
		let listOfFilesToBeLoaded: Array<Promise<any>> = [];
		for (const fileName of fileNames) {
			const jsonPath = path + "/" + fileName;
			const jsonToRead = fs.readJson(jsonPath);
			listOfFilesToBeLoaded.push(jsonToRead);
		}
		let courses: Course[] = [];
		let rooms: Room[] = [];
		return Promise.all(listOfFilesToBeLoaded).then((data: any[]) => {
			if (kind === InsightDatasetKind.Courses) {
				for (const json of data) {
					const jsonObj = JSON.parse(json);
					const course = new Course(jsonObj.id, jsonObj.sections);
					courses.push(course);
				}
				return courses;
			} else {
				for (const json of data) {
					const jsonObj = JSON.parse(json);
					const lat = parseFloat(jsonObj.lat);
					const lon = parseFloat(jsonObj.lon);
					const seats = parseInt(jsonObj.seats, 10);
					const room = new Room(jsonObj.fullname, jsonObj.shortname, jsonObj.number, jsonObj.name,
						jsonObj.address, lat, lon, seats, jsonObj.type, jsonObj.furniture, jsonObj.href);
					rooms.push(room);
				}
				return rooms;
			}
		}).then((list: any[]) => {
			return Promise.resolve(list);
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

	private getBuildingFiles(unzippedData: any, buildings: Building[]): any[] {
		let buildingFilesToBeLoaded: any[] = [];
		unzippedData.folder("rooms").forEach(function (relativePath: any, file: JSZipObject) {
			if (InsightFacade.hrefExists(buildings, file.name)) {
				buildingFilesToBeLoaded.push(file.async("text"));
			}
		});
		return buildingFilesToBeLoaded;
	}

	private static hrefExists(buildings: Building[], href: string): boolean {
		href = href.replace("rooms/", "./");
		for (const building of buildings) {
			if (href === building.href) {
				return true;
			}
		}
		return false;
	}

}
