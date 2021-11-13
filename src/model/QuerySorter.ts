import Section from "./Section";
export default class Sorter {
	private readonly orders: string[];
	private readonly dir: string;
	private sectionsOrRooms: any[];
	private groups: any[][];
	private applies: any;
	private sortable: any[];

	constructor(sectionsOrRooms: any[], orders: string[], groups: any[][], applies: any, dir: string) {
		this.orders = orders;
		this.sectionsOrRooms = sectionsOrRooms;
		this.dir = dir;
		this.groups = groups;
		this.applies = applies;
		this.sortable = new Array(this.sectionsOrRooms.length).fill(true);
	}

	public sort(): Section[] {
		let finishedOrders = [];
		for (const order of this.orders) {
			this.sectionsOrRooms = this.normalSort(order, finishedOrders);
			finishedOrders.push(order);
		}
		if (this.dir === "DOWN") {
			this.sectionsOrRooms = this.sectionsOrRooms.reverse();
		}
		// this.handleDirection();

		return this.sectionsOrRooms;
	}

	private normalSort(order: string, finishedOrders: string[]): any[] {
		let secOrRoomList: any[] = this.sectionsOrRooms;
		if (order === "avg" || order === "pass" || order === "fail" || order === "audit" || order === "year" ||
			order === "lat" || order === "lon" || order === "seats") {
			secOrRoomList.sort((a: any, b: any) => {
				return this.sortFunction(finishedOrders, a, b, order);
			});
		} else if (order === "dept" || order === "id" || order === "instructor" || order === "title" ||
			order === "uuid" ||	order === "fullname" || order === "shortname" || order === "number" ||
			order === "name" || order === "address" || order === "type" || order === "furniture" ||
			order === "href"){
			secOrRoomList.sort((a: Section, b: Section) => {
				return this.sortFunction(finishedOrders, a, b, order);
			});
		}
		return secOrRoomList;
	}

	private sortFunction(finishedOrders: string[], a: Section, b: Section, order: string) {
		let isSortable = true;
		for (const ord of finishedOrders) {
			if (this.getField(ord, a) !== this.getField(ord, b)) {
				isSortable = false;
				break;
			}
		}
		if (isSortable) {
			return this.getField(order, a) - this.getField(order, b);
		} else {
			return 0;
		}
	}

	private transformationSort(sectionsOrRooms: any[], order: string, dir: string): any[] {
		let secOrRoomList = sectionsOrRooms;

		return secOrRoomList;
	}

	private getField(fieldName: string, sectionOrRoom: any): any {
		let field: any;
		field = this.getMField(fieldName, sectionOrRoom);
		if (field === "") {
			field = this.getSField(fieldName, sectionOrRoom);
		}
		return field;
	}

	private getMField(mField: any, sectionOrRoom: any): any {
		if (mField === "avg") {
			return sectionOrRoom._avg;
		}
		if (mField === "pass") {
			return sectionOrRoom._pass;
		}
		if (mField === "fail") {
			return sectionOrRoom._fail;
		}
		if (mField === "audit") {
			return sectionOrRoom._audit;
		}
		if (mField === "year") {
			return sectionOrRoom._year;
		}
		// TODO
		if (mField === "lat") {
			return sectionOrRoom._lat;
		}
		if (mField === "lon") {
			return sectionOrRoom._lon;
		}
		if (mField === "seats") {
			return sectionOrRoom._seats;
		}
		return "";
	}

	private getSField(sField: string, section: any): any {
		if (sField === "dept") {
			return section._dept;
		}
		if (sField === "id") {
			return section._id;
		}
		if (sField === "instructor") {
			return section._instructor;
		}
		if (sField === "title") {
			return section._title;
		}
		if (sField === "uuid") {
			return section._uuid;
		}
		if (sField === "fullname") {
			return section._fullname;
		}
		if (sField === "shortname") {
			return section._shortname;
		}
		if (sField === "number") {
			return section._number;
		}
		if (sField === "name") {
			return section._name;
		}
		if (sField === "address") {
			return section._address;
		}
		if (sField === "type") {
			return section._type;
		}
		if (sField === "furniture") {
			return section._furniture;
		}
		if (sField === "href") {
			return section._href;
		}
		return "";
	}

	private handleDirection() {
		return "YOUOUO";
	}
}


// switch (fieldName) {
// 	case "avg":
// 		field = sectionOrRoom._avg;
// 		break;
// 	case "pass":
// 		field = sectionOrRoom._pass;
// 		break;
// 	case "fail":
// 		field = sectionOrRoom._fail;
// 		break;
// 	case "audit":
// 		field = sectionOrRoom._audit;
// 		break;
// 	case "year":
// 		field = sectionOrRoom._year;
// 		break;
// 	case "dept":
// 		field = sectionOrRoom._dept;
// 		break;
// 	case "id":
// 		field = sectionOrRoom._id;
// 		break;
// 	case "instructor":
// 		field = sectionOrRoom._instructor;
// 		break;
// 	case "title":
// 		field = sectionOrRoom._title;
// 		break;
// 	case "uuid":
// 		field = sectionOrRoom._uuid;
// 		break;
// 	case "fullname":
// 		field = sectionOrRoom.fullname;
// 		break;
// 	case "shortname":
// 		field = sectionOrRoom.shortname;
// 		break;
// 	case "address":
// 		field = sectionOrRoom.address;
// 		break;
// 	case "href":
// 		field = sectionOrRoom.href;
// 		break;
// 	case "lat":
// 		field = sectionOrRoom.lat;
// 		break;
// 	case "lon":
// 		field = sectionOrRoom.lon;
// 		break;
// 	case "number":
// 		field = sectionOrRoom.number;
// 		break;
// 	case "name":
// 		field = sectionOrRoom.name;
// 		break;
// 	case "seats":
// 		field = sectionOrRoom.seats;
// 		break;
// 	case "type":
// 		field = sectionOrRoom.type;
// 		break;
// 	case "furniture":
// 		field = sectionOrRoom.furniture;
// 		break;
// 	default:
// 		field = "WRONG";
// 		break;
// }
