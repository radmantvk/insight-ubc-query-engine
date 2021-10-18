import Section from "./Section";
export default class Sorter {
	private readonly order;
	private sections: Section[];
	constructor(order: string, sections: Section[]) {
		this.order = order;
		this.sections = sections;
	}

	public sort(): Section[] {
		// let kjfd = typeof "1234";
		// let qq = typeof this.sections[0]._uuid;
		// let bb = this.sections[0]._uuid.localeCompare(this.sections[1]._uuid);
		switch (this.order) {
			case "avg":
				this.sections.sort((a: Section, b: Section) => (a._avg - b._avg));
				break;
			case "pass":
				this.sections.sort((a: Section, b: Section) => (a._pass - b._pass));
				break;
			case "fail":
				this.sections.sort((a: Section, b: Section) => (a._fail - b._fail));
				break;
			case "audit":
				this.sections.sort((a: Section, b: Section) => (a._audit - b._audit));
				break;
			case "year":
				this.sections.sort((a: Section, b: Section) => (a._year - b._year));
				break;
			case "dept":
				this.sections.sort((a: Section, b: Section) => (a._dept.localeCompare(b._dept)));
				break;
			case "id":
				this.sections.sort((a: Section, b: Section) => (a._id.localeCompare(b._id)));
				break;
			case "instructor":
				this.sections.sort((a: Section, b: Section) => (a._instructor.localeCompare(b._instructor)));
				break;
			case "title":
				this.sections.sort((a: Section, b: Section) => (a._title.localeCompare(b._title)));
				break;
			case "uuid":
				this.sections.sort((a: Section, b: Section) => a._uuid.toString().localeCompare(b._uuid.toString()));
				// this.sections.sort((a: Section, b: Section) => (parseInt(a._uuid, 10) - parseInt(b._uuid, 10)));
				break;
			default:
				console.error("unexpected error");
				break;
		}
		return this.sections;
	}
	// 	private sortIDAlphabetically() {
// 		this.sections.sort();
// 		return [];
// 	}
//
// 	private sortInstructorAlphabetically() {
// 		return [];
// 	}
//
// 	private sortTitleAlphabetically() {
// 		return [];
// 	}
//
// 	private sortUUIDAlphabetically() {
// 		return [];
// 	}
//
//
// 	private partition(arr: Section[], start: any, end: any, type: string){
// 		// Taking the last element as the pivot
// 		const pivotValue = arr[end];
// 		let pivotIndex = start;
// 		for (let i = start; i < end; i++) {
// 			if (arr[i] < pivotValue) {
// 				// Swapping elements
// 				[arr[i], arr[pivotIndex]] = [arr[pivotIndex], arr[i]];
// 				// Moving to next element
// 				pivotIndex++;
// 			}
// 		}
//
// 		// Putting the pivot value in the middle
// 		[arr[pivotIndex], arr[end]] = [arr[end], arr[pivotIndex]];
// 		return pivotIndex;
// 	}
//
// 	private quickSort(arr: Section[], start: any, end: any, type: string) {
// 		// Base case or terminating case
// 		if (start >= end) {
// 			return;
// 		}
//
// 		// Returns pivotIndex
// 		let index = this.partition(arr, start, end, type);
//
// 		// Recursively apply the same logic to the left and right subarrays
// 		this.quickSort(arr, start, index - 1, type);
// 		this.quickSort(arr, index + 1, end, type);
// 	}
}
