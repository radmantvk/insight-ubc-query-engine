import Filter from "./Filter";


export default class Body {

	constructor(filter: Filter = Error) {
		if (filter === Error) { // todo: is triple equality correct?
			// No filter
		} else {
			this.handleFilter(filter);
		}
	}
	private handleFilter(filter: Filter) {
		console.log("handling filter");
	}

}
