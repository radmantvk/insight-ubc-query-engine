import Section from "./Section";
import FieldAccessor from "./FieldAccessor";
export default class Sorter {
	private readonly orders: string[];
	private readonly dir: string;
	private sectionsOrRooms: any[];
	private sortable: any[];

	constructor(sectionsOrRooms: any[], orders: string[], dir: string) {
		this.orders = orders;
		this.sectionsOrRooms = sectionsOrRooms;
		this.dir = dir;
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
				return this.sortFunction(finishedOrders, a, b, order, true);
			});
		} else if (order === "dept" || order === "id" || order === "instructor" || order === "title" ||
			order === "uuid" ||	order === "fullname" || order === "shortname" || order === "number" ||
			order === "name" || order === "address" || order === "type" || order === "furniture" ||
			order === "href"){
			secOrRoomList.sort((a: Section, b: Section) => {
				return this.sortFunction(finishedOrders, a, b, order, false);
			});
		} else { // applykey
			secOrRoomList.sort((a: any, b: any) => {
				return this.sortFunction(finishedOrders, a, b, order, undefined);
			});
		}
		return secOrRoomList;
	}

	private sortFunction(finishedOrders: string[], a: any, b: any, order: string, isMField: any) {
		let isSortable = true;
		for (const ord of finishedOrders) {
			if (ord === "avg" || ord === "pass" || ord === "fail" || ord === "audit" || ord === "year" ||
				ord === "lat" || ord === "lon" || ord === "seats" || ord === "dept" || ord === "id" ||
				ord === "instructor" || ord === "title" || ord === "uuid" ||	ord === "fullname" ||
				ord === "shortname" || ord === "number" || ord === "name" || ord === "address" || ord === "type" ||
				ord === "furniture" || ord === "href") {
				if (FieldAccessor.getField(ord, a) !== FieldAccessor.getField(ord, b)) {
					isSortable = false;
					break;
				}
			} else if (a[ord] !== b[ord]) {
				isSortable = false;
				break;
			}
		}
		if (isSortable) {
			if (isMField) {
				return FieldAccessor.getField(order, a) - FieldAccessor.getField(order, b).toString();
			} else if (isMField === undefined){
				return a[order] - b[order];
			} else if (!isMField){
				return FieldAccessor.getField(order, a).toString()
					.localeCompare(FieldAccessor.getField(order, b).toString());
			}
		} else {
			return 0;
		}
	}
}

