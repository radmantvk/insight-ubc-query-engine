export default class TransformValidator {

	public validate(TRANSFORMATIONS: any): boolean {
		const transformationKeys = Object.keys(TRANSFORMATIONS);
		if (transformationKeys.length !== 2) {
			return false;
		}
		let group: any;
		let apply: any;
		for (let key of transformationKeys) {
			if (key !== "GROUP" && key !== "APPLY") {
				return false;
			}
			if (key === "GROUP") {
				group = TRANSFORMATIONS[key];
			} else {
				apply = TRANSFORMATIONS[key];
			}
		}

		if (!this.groupValidate(group)) {
			return false;
		}

		if (!this.applyValidate(apply)) {
			return false;
		}
		return true;
	}

	private groupValidate(group: any) {
		return true;
	}

	private applyValidate(apply: any) {
		return true;
	}
}
