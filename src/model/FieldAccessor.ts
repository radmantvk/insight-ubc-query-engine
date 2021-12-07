import Course from "./Course";
import Section from "./Section";
import {InsightDatasetKind} from "../controller/IInsightFacade";

export default class FieldAccessor {


	public static getField(fieldName: string, sectionOrRoom: any): any {
		let field: any;
		field = this.getMField(fieldName, sectionOrRoom);
		if (field === "") {
			field = this.getSField(fieldName, sectionOrRoom);
		}
		return field;
	}

	public static getMField(mField: any, sectionOrRoom: any): any {
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

	public static getSField(sField: string, section: any): any {
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
}
