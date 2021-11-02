import Course from "./Course";
import Section from "./Section";
import {InsightError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";

export default class CoursesProcessor {

// toString method looping through the section and creating the json.

	public static process(id: string, listOfFilesToBeLoaded: any) {
		let courses: Course[] = [];
		return Promise.all(listOfFilesToBeLoaded).then((data) => {
			let containsOneOrMoreJsonFiles = false;
			let counter = 0;
			data.forEach((courseObject: any) => {
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

}

