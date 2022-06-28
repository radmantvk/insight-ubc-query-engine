import Course from "./Course";
import Section from "./Section";
import {query} from "express";
import exp = require("constants");
import {InsightDatasetKind} from "../controller/IInsightFacade";
import FieldAccessor from "./FieldAccessor";

export default class Filter {
	private readonly kind: InsightDatasetKind;
	constructor(kind: InsightDatasetKind) {
		this.kind = kind;
	}

	public handleFilter(coursesOrRooms: any[], content: any): any[] {
		const keys = Object.keys(content);
		if (!(keys.length === 1)) {
			return coursesOrRooms;
		}
		const key = keys[0];
		if (key === "GT" || key === "LT" || key === "EQ") {
			return this.applyMathFilter(content, key, coursesOrRooms);
		} else if (key === "IS") {
			return this.applyStringComparator(content, coursesOrRooms);
		} else if (key === "NOT") {
			return this.applyNegation(content, coursesOrRooms);
		} else if (key === "AND" || key === "OR") {
			return this.applyLogic(content, key, coursesOrRooms);
		} else {
			return coursesOrRooms;
		}

	}


	private applyMathFilter(content: any, key: string, sections: Section[]): Section[] {
		let filterKey: any = content[key];
		let mKey = Object.keys(filterKey)[0];
		let bound = filterKey[mKey];
		let mField = mKey.split("_")[1];

		switch (key) {

			case "LT":
				return this.applyLTFilter(sections, mField, bound);
				break;
			case "GT":
				return this.applyGTFilter(sections, mField, bound);
				break;
			case "EQ":
				return this.applyEQFilter(sections, mField, bound);
				break;
			default:
				return [];
		}
	}

	private applyLTFilter(sections: Section[], mField: any, bound: any): Section[] {
		let validSections: Section[] = [];
		for (let section of sections) {
			let sectField = FieldAccessor.getField(mField, section);
			if (sectField < bound) {
				validSections.push(section);
			}
		}
		return validSections;
	}

	private applyGTFilter(sections: Section[], mField: any, bound: any): Section[] {
		let validSections: Section[] = [];
		for (let section of sections) {
			let sectField = FieldAccessor.getField(mField, section);
			if (sectField > bound) {
				validSections.push(section);
			}
		}
		return validSections;
	}

	private applyEQFilter(sections: Section[], mField: any, bound: any): Section[] {
		let validSections: Section[] = [];
		for (let section of sections) {
			let sectField = FieldAccessor.getField(mField, section);
			if (sectField === bound) {
				validSections.push(section);
			}
		}
		return validSections;
	}

	private applyStringComparator(content: any, sections: Section[]): Section[] { // *, cp*, *ps*, *sc
		let validSections: Section[] = [];
		let filterKey: any = content["IS"];
		let sKey = Object.keys(filterKey)[0];
		let inputString: string = filterKey[sKey];
		let sField = sKey.split("_")[1];
		if (!inputString.includes("*")) { // no asterisk
			for (let section of sections) {
				const sectField = FieldAccessor.getField(sField, section); // "cpsc"
				if (sectField === inputString) {
					validSections.push(section);
				}
			}
		} else if (inputString[0] === "*" && inputString[inputString.length - 1] === "*") { // *abc*
			const expectedString = inputString.replace(/\*/g, "");
			for (let section of sections) {
				const sectField = FieldAccessor.getField(sField, section); // "cpsc"
				if (sectField.includes(expectedString)) {
					validSections.push(section);
				}
			}
		} else if (inputString[0] === "*") { // *sc or *
			const expectedString = inputString.replace(/\*/g, ""); // "" or "sc"
			if (expectedString.length === 0) { // empty string
				for  (const section of sections) {
					validSections.push(section);
				}
			} else {  // "sc"
				for (const section of sections) {
					let sectField: string = FieldAccessor.getField(sField, section);
					let toCompare = sectField.substring(sectField.length - expectedString.length, sectField.length);
					if (expectedString === toCompare) {
						validSections.push(section);
					}
				}
			}
		} else if (inputString[inputString.length - 1] === "*") { // cp*
			const expectedString = inputString.replace(/\*/g, "");
			for (const section of sections) {
				let sectField: string = FieldAccessor.getField(sField, section);
				let toCompare = sectField.substring(0, inputString.length - 1);
				if (expectedString === toCompare) {
					validSections.push(section);
				}
			}
		} else {
			console.log("error");
		}
		return validSections;
	}

	private applyLogic(content: any, key: any, sections: Section[]): Section[] {
		let results: Section[] = [];
		let logicArray = content[key];
		if (key === "AND") {
			results = sections;
			for (let filter of logicArray) {
				results = this.handleFilter(results, filter);
			}
		} else if (key === "OR") {
			let listOfFilteredSections = [];
			for (let filter of logicArray) {
				listOfFilteredSections.push(this.handleFilter(sections, filter));
			}
			for (const filteredSection of listOfFilteredSections) {
				for (const sec of filteredSection) {
					if (!results.includes(sec)) {
						results.push(sec);
					}
				}
			}
		}
		return results;
	}

	private applyNegation(content: any, sections: Section[]): Section[] {
		let validSections: Section[] = [];
		let notFilter = content["NOT"];
		let subFilter: Section[] = this.handleFilter(sections, notFilter);
		for (let section of sections) {
			if (!(subFilter.includes(section))) {
				validSections.push(section);
			}
		}
		return validSections;
	}
}
