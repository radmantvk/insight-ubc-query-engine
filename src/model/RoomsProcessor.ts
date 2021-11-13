import Course from "./Course";
import Section from "./Section";
import {InsightError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import parse5 from "parse5";
import Building from "./Building";
import tdd = Mocha.interfaces.tdd;
import http from "http";
import {JSZipObject} from "jszip";
import Room from "./Room";

interface GeoResponse {

	lat?: number;

	lon?: number;

	error?: string;

}
export default class RoomsProcessor {
	public static getBuildings(indexFile: Array<Promise<any>>): Promise<any> {
		return Promise.all(indexFile)
			.then((data) => {
				try {
					const document = parse5.parse(data[0]);
					const tBody = this.findTBody(document);
					const buildings: any = this.processTBodyAndCreateBuildings(tBody);
					return Promise.resolve(buildings);
				} catch (e) {
					return Promise.reject(e);
				}
			});
		// return Promise.reject();
	}


	public static findTBody(motherNode: any): any {
		let bigBoy: any;
		if (motherNode.nodeName === "tbody") {
			// return motherNode;
			bigBoy = motherNode;
		} else if (motherNode["childNodes"] !== undefined) {
			for (const child of motherNode.childNodes) {
				const smallBoy = this.findTBody(child);
				if (smallBoy !== undefined) {
					bigBoy = smallBoy;
				}
			}
		}
		return bigBoy;
	}

	public static findBuilding(motherNode: any, buildings: Building[]): any {
		let bigBoy: any;
		if (motherNode["attrs"] !== undefined && motherNode.attrs.length > 0 &&
			motherNode.attrs[0].value === "building-info") {
			let buildingName: string = "";
			for (const childNode of motherNode.childNodes) {
				if (childNode.nodeName === "h2") {
					buildingName = childNode.childNodes[0].childNodes[0].value;
				}
			}
			for (const building of buildings) {
				if (buildingName === building.fullname) {
					return building;
				}
			}
			return undefined;
		} else if (motherNode["childNodes"] !== undefined) {
			for (const child of motherNode.childNodes) {
				const smallBoy = this.findBuilding(child, buildings);
				if (smallBoy !== undefined) {
					bigBoy = smallBoy;
				}
			}
		}
		return bigBoy;
	}

	private static processTBodyAndCreateBuildings(node: any) {
		let buildings: Building[] = [];
		for (const tr of node.childNodes) {
			if (tr.nodeName === "tr") {
				let building: Building;
				let fullname;
				let shortname;
				let address;
				let href;
				let lat = 1;
				let lon = 2;
				let className = "views-field views-field-";
				for(const td of tr.childNodes) {
					if (td.nodeName === "td") {
						const tdAttr = td.attrs[0].value;
						if (tdAttr === className + "field-building-code") {
							shortname = td.childNodes[0].value;
							shortname = shortname.replace("\n", "");
							shortname = shortname.trim();
						}  else if (tdAttr === className + "title") {
							href = td.childNodes[1].attrs[0].value;
							fullname = td.childNodes[1].childNodes[0].value;
						}  else if (tdAttr === className + "field-building-address") {
							address = td.childNodes[0].value;
							address = address.replace("\n", "");
							address = address.trim();
							// address = address.replace(/ /g, "%20");
						}
					}
				}

				// curl "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team109/6245%20Agronomy%20Road%20V6T%201Z4"

				// let yo = http.get("http://cs310.students.cs.ubc.ca:11316/api/v1/project_team147/" + address,
				// 	(res) => {
				// 		let buff: any;
				// 		res.on("data", (d) => {
				// 			buff += d;
				// 		});
				// 		res.on("end", () => {
				// 			const l = JSON.parse(buff);
				// 			console.log(buff);
				// 		});
				// 	});
				// return Promise.all([yo])
				// 	.then((res) => {
				// 		return [new Building("", "shortname", "address", lat, lon, "href")];
				// 	});
				building = new Building(fullname, shortname, address, lat, lon, href);
				buildings.push(building);
			}
		}
		return buildings;
	}

	private static processTBodyAndCreateRooms(node: any, building: Building) {
		let rooms: Room[] = [];
		for (const tr of node.childNodes) {
			let number: string = "";
			let name: string = "";
			let seats: number = 0;
			let type: string = "";
			let furniture: string = "";
			let href: string = "";
			if (tr.nodeName === "tr") {
				let className = "views-field views-field-";
				for (const td of tr.childNodes) {
					if (td.nodeName === "td") {
						const tdAttr = td.attrs[0].value;
						if (tdAttr === className + "field-room-number") {
							href = td.childNodes[1].attrs[0].value;
							number = td.childNodes[1].childNodes[0].value;
						} else if (tdAttr === className + "field-room-capacity") {
							let seatsString = td.childNodes[0].value;
							seatsString = seatsString.replace("\n", "");
							seats = parseInt(seatsString.trim(), 10);
						} else if (tdAttr === className + "field-room-furniture") {
							furniture = td.childNodes[0].value;
							furniture = furniture.replace("\n", "");
							furniture = furniture.trim();
						} else if (tdAttr === className + "field-room-type") {
							type = td.childNodes[0].value;
							type = type.replace("\n", "");
							type = type.trim();
						}
					}
				}
				name = building.shortname + "-" + number;
				const room = new Room(building.fullname, building.shortname, number, name,
					building.address, building.lat, building.lon, seats, type, furniture, href);
				rooms.push(room);
			}
		}
		return rooms;
	}

	private static getGeo(address: string): Promise<any> {
		const urlAddress = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team147/" +
			address.replace(/ /g, "%20");
		return new Promise((resolve, reject) => {
			try {
				const response: any = http.request(urlAddress); // .get(urlAddress);
				return resolve(response);
			} catch (err) {
				return reject(err);
			}
		});
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
	private static createSections(sections: any): Section[] {
		let listOfSections: Section[] = [];
		for (const section of sections) {
			if ("Section" in section && "Course" in section &&
				"Avg" in section && "Professor" in section &&
				"Title" in section && "Pass" in section &&
				"Fail" in section && "Audit" in section &&
				"id" in section && "Year" in section) {
				let s: Section;
				if (section["Section"] === "overall") {
					s = new Section(section.Subject, section.Course, section.Avg, section.Professor,
						section.Title, section.Pass, section.Fail, section.Audit, section.id, 1900);
				} else {
					s = new Section(section.Subject, section.Course, section.Avg, section.Professor,
						section.Title, section.Pass, section.Fail, section.Audit, section.id, section.Year);
				}
				listOfSections.push(s);
			}
		}
		return listOfSections;
	}

	private static createDirectory(id: string): Promise<any> {
		if (fs.pathExistsSync("./data/")) {
			return fs.mkdir("./data/" + id);
		} else {
			return fs.mkdir("./data/")
				.then(() => {
					return fs.mkdir("./data/" + id);
				});
		}
	}

	public static getRooms(buildings: Building[], buildingFilesToBeLoaded: Array<Promise<any>>): Promise<any> {
		return Promise.all(buildingFilesToBeLoaded)
			.then((data) => {
				let rooms: Room[] = [];
				data.forEach((buildingObject: any) => {
					try {
						const document = parse5.parse(buildingObject);
						const building = this.findBuilding(document, buildings);
						const tBody = this.findTBody(document);
						if (building !== undefined && tBody !== undefined) { // If building exists in index file
							const newRooms: Room[] = this.processTBodyAndCreateRooms(tBody, building);
							rooms = rooms.concat(newRooms);
						}
					} catch (e) {
						return Promise.reject(e);
					}
				});
				return Promise.resolve(rooms);
			})
			.catch((err) => {
				return Promise.reject();
			});
	}

	public static process(id: string, rooms: Room[]) {
		let listOfFilesToBeWritten: any[] = [];
		return this.createDirectory(id)
			.then(() => {
				for (const room of rooms) {
					const roomID = id + "-" + room.shortname + "-" + room.number;
					const path = "./data/" + id + "/" +  roomID + ".json";
					const hel = room.toJson();
					listOfFilesToBeWritten.push(fs.writeJSON(path, room.toJson()));
				}
				return Promise.all(listOfFilesToBeWritten);
					// .then(() => {
					// 	return Promise.resolve(rooms.length);
					// });
			}).then(() => {
				return Promise.resolve(rooms.length);
			});
	}
}

