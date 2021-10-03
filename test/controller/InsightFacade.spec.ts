import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";

import {testFolder} from "@ubccpsc310/folder-test";
import {expect} from "chai";

describe("InsightFacade", function () {
	let facade: InsightFacade;

	const persistDir = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		courses: "./test/resources/archives/courses.zip",
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent from the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDir);
		});

		// This is a unit test. You should create more like this!
		it("Should add a valid dataset", function () {
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			const expected: string[] = [id];
			return facade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		// TODO: reformat the following
		let id: string;
		let content: string = datasetContents.get("courses") ?? "";
		it("should reject invalid ID: adding empty string", function () {
			id = "";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with ${res}"))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets()
						.then((insightDatasets) => {
							expect(insightDatasets).to.have.length(0);
						});
				});
		});

		it('should reject invalid ID: string = " "', function () {
			id = " ";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with ${res}"))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets()
						.then((insightDatasets) => {
							expect(insightDatasets).to.have.length(0);
						});
				});
		});
		it("should reject invalid ID: string with only multiple spaces", function () {
			id = "       ";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with ${res}"))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets().then((list) => expect(list).to.have.length(0));
				});
		});
		it("should reject invalid ID: string containing underscore at front", function () {
			id = "_1234";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets().then((list) => expect(list).to.have.length(0));
				});
		});
		it("should reject invalid ID: string containing underscore at middle", function () {
			id = "12_34";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets()
						.then((res) => {
							expect(res).to.have.length(0);
							return facade.listDatasets().then((list) => expect(list).to.have.length(0));
						});
				});
		});

		it("should reject invalid ID: string containing underscore at end", function () {
			id = "1234_";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets().then((list) => expect(list).to.have.length(0));
				});
		});

		it("should reject a new dataset with an existing id in the dataset", function () {
			id = "courses";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset(id, content, InsightDatasetKind.Courses)
						.then((res) => {
							expect.fail("adding the existing id resolved instead of catching error");
						})
						.catch((err) => {
							expect(err).is.instanceof(InsightError);
							// return facade.listDatasets().then((res) => expect(res).to.have.length(1)); Why's this passing
						});
				})
				.catch((err) => {
					expect.fail("unexpected error caught");
				});
		});
		it("should reject content that is not named courses", function () {
			const wrongContent = "test/resources/archives/notNamedCourses.zip";
			return facade.addDataset("courses", wrongContent, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
				});
		});
		it("should reject content not Json files", function () {
			const wrongContent = getFileContent("test/resources/archives/notJsonFiles.zip");
			return facade.addDataset("courses", wrongContent, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets().then((res) => expect(res).to.have.length(0));
				});
		});
		it("should reject content that is not a zip file", function () {
			const wrongContent = getFileContent("test/resources/archives/notZipFile.jpg");
			return facade.addDataset("courses", wrongContent, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets().then((res) => expect(res).to.have.length(0));
				});
		});

		it("should reject content with only invalid json Files", function () {
			const wrongContent = getFileContent("test/resources/archives/unserialized.zip");
			return facade.addDataset("courses", wrongContent, InsightDatasetKind.Courses)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets().then((res) => expect(res).to.have.length(0));
				});
		});
		it("should accept content mix of valid and invalid json files", function () {
			id = "ContainsMixOfValidAndInvalidCourses";
			const wrongContent = getFileContent("test/resources/archives/mixOfValidAndInvalid.zip");
			return facade.addDataset(id, wrongContent, InsightDatasetKind.Courses)
				.then((res) => {
					expect(res).to.have.length(1);
					expect(res).to.deep.equal([id]);
					expect(facade.listDatasets().then((list) => list.toString().includes(id)));
				})
				.catch(() => {
					expect.fail("Unexpected error");
				});
		});


		it("should reject content of dataset not base64", function () {
			let base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
			let notBase64Content = fs.readFileSync("test/resources/archives/courses.zip")
				.toString("utf8") + "%";
			return facade.addDataset("courses", content, InsightDatasetKind.Courses)
				.catch((error) => {
					expect(!base64regex.test(notBase64Content));
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets().then((res) => expect(res).to.have.length(0));
				});
		});

		it("should reject InsightDataSetKind Rooms", function () {
			return facade.addDataset("courses", content, InsightDatasetKind.Rooms)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
					return facade.listDatasets().then((list) => expect(list).to.have.length(0));
				});
		});

		it("should add a proper id (new id), proper content, and proper InsightDatasetKind", function () {
			// check id is unique or concat "1" to the id until it is unique
			id = "courses";
			const validContent = getFileContent("test/resources/archives/oneValidSection.zip");
			return facade.addDataset(id, validContent, InsightDatasetKind.Courses)
				.then((result) => {
					expect(result).to.have.length(1);
					expect(result).to.deep.equal([id]);
					expect(facade.listDatasets().then((list) => list.toString().includes(id)));
				})
				.catch(() => {
					expect.fail("valid add dataset failed");
				});
		});
		it("should add a proper id (new id), proper content, and proper InsightDatasetKind v2", function () {
			// check id is unique or concat "1" to the id until it is unique
			id = "courses";
			const validContent = getFileContent("test/resources/archives/oneValidSection.zip");
			return facade.addDataset(id, validContent, InsightDatasetKind.Courses)
				.then((result) => {
					expect(result).to.deep.equal([id]);
					expect(facade.listDatasets().then((list) => list.toString().includes(id)));
				})
				.catch(() => {
					expect.fail("valid add dataset failed");
				});
		});
		it("should add a proper id (new id), proper content, and proper InsightDatasetKind v3", function () {
			// check id is unique or concat "1" to the id until it is unique
			id = "courses";
			const validContent = getFileContent("test/resources/archives/oneValidSection.zip");
			return facade.addDataset(id, validContent, InsightDatasetKind.Courses)
				.then((result) => {
					expect(result).to.have.length(1);
					expect(result).to.deep.equal([id]);
				})
				.catch(() => {
					expect.fail("valid add dataset failed");
				});
		});

		it("reject add: content with no valid course section", function () {
			const invalidContent = getFileContent("test/resources/archives/noValidSections.zip");
			return facade.addDataset("courses", invalidContent, InsightDatasetKind.Courses)
				.then((result) => {
					expect.fail("error not caught");
					expect(facade.listDatasets().then((list) => list.toString().includes(id))); // should be removed?
				})
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
				});
		});
		it("should add a proper id (new id), proper content, and proper InsightDatasetKind", function () {
			// check id is unique or concat "1" to the id until it is unique
			id = "courses";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then((result) => {
					expect(result).to.have.length(1);
					expect(result).to.deep.equal([id]);
					expect(facade.listDatasets().then((list) => list.toString().includes(id)));
				})
				.catch(() => {
					expect.fail("valid add dataset failed");
				});
		});
		it("should add multiple valid datasets", function () {
			let id1 = "courses1";
			let id2 = "courses2";
			let id3 = "courses3";
			return facade.addDataset(id1, content, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset(id2, content, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.addDataset(id3, content, InsightDatasetKind.Courses);
				})
				.then((res) => {
					expect(res).to.have.length(3);
					expect(res).to.deep.include(id1);
					expect(res).to.deep.include(id2);
					expect(res).to.deep.include(id3);
				})
				.catch(() => {
					expect.fail("valid add datasets failed");
				});
		});

		it("should reject if dataset was never added with NotFoundError", function () {
			return facade.removeDataset("courses")
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(NotFoundError);
				});
		});
		it("should reject invalid ID: removing empty string", function () {
			id = "";
			return facade.removeDataset(id)
				.then((removedID) => {
					expect.fail("an invalid id was removed instead of rejecting: " + removedID);
				})
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
				});
		});
		it('should reject invalid ID: string = " "', function () {
			id = " ";
			return facade.removeDataset(id)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
				});
		});
		it("should reject invalid ID: string with only multiple spaces", function () {
			id = "       ";
			return facade.removeDataset(id)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
				});
		});
		it("should reject invalid ID: string containing underscore at front", function () {
			id = "_1234";
			return facade.removeDataset(id)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
				});
		});
		it("should reject invalid ID: string containing underscore at middle", function () {
			id = "12_34";
			return facade.removeDataset(id)
				.then((res) => expect.fail("Resolved with: " + res))
				.catch((error) => {
					expect(error).to.be.instanceof(InsightError);
				});
		});
		it("should successfully remove valid dataset added", function () {
			id = "courses";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => {
					facade.listDatasets().then((datasets) => expect(datasets).to.have.length(1));
					return facade.removeDataset(id)
						.then((res) => {
							expect(res).to.deep.equal(id);
							facade.listDatasets().then((datasets) => expect(datasets).to.have.length(0));
						})
						.catch((err) => {
							expect.fail("caught an unexpected error interfering remove");
						});
				})
				.catch((error) => {
					expect.fail("unexpected error caught " + error);
				});
		});
		it("Should remove a dataset from the internal model", function () { // todo, remove the above code if this passes
			id = "courses";
			return facade.addDataset(id, content, InsightDatasetKind.Courses)
				.then(() => facade.removeDataset(id))
				.then((removedId) => {
					expect(removedId).to.deep.equal(id);
					return facade.listDatasets();
				})
				.then((insightDatasets) =>
					expect(insightDatasets).to.deep.equal([]))
				.catch((error) => expect.fail("caught an error interfering remove"));
		});


		it("should remove the 1st id after adding 2 ids", function () {
			let id1 = "courses";
			let id2 = "courses2";
			const expectedDatasets: InsightDataset[] = [
				{
					id: id2,
					kind: InsightDatasetKind.Courses,
					numRows: 64612
				}
			];
			return facade.addDataset(id1, content, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset(id2, content, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.removeDataset(id1);
				})
				.then((id3) => {
					expect(id3).to.equal(id1);
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.have.length(1);
					expect(insightDatasets).to.have.deep.members(expectedDatasets);
				})
				.catch((err) => {
					expect.fail("caught an unexpected error");
				});
		});

		it("should remove the 2nd id after adding 2 ids", function () {
			let id1 = "courses";
			let id2 = "courses2";
			const expectedDatasets: InsightDataset[] = [
				{
					id: id1,
					kind: InsightDatasetKind.Courses,
					numRows: 64612
				}
			];
			return facade.addDataset(id1, content, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset(id2, content, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.removeDataset(id2);
				})
				.then((id3) => {
					expect(id3).to.equal(id2);
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.have.length(1);
					expect(insightDatasets).to.have.deep.members(expectedDatasets);
				})
				.catch((err) => {
					expect.fail("unexpectedly caught an error: " + err);
				});
		});
		it("should list no datasets", function () {
			return facade.listDatasets()
				.then((res) => {
					expect(res).is.instanceof(Array);
					expect(res).to.have.length(0);
				})
				.catch((error) => {
					expect.fail("unexpected error caught ${error}" + error);
				});
		});
		it("should list an added dataset", function () {
			return facade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then((addedIds) => {
					return facade.listDatasets();
				})
				.then((insightDataSets) => {
					expect(insightDataSets).is.instanceof(Array);
					expect(insightDataSets).to.have.length(1);
					expect(insightDataSets).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612
					}]);
				})
				.catch((error) => {
					expect.fail("unexpected error caught ${error}" + error);
				});
		});
		it("should list multiple added datasets", function () {
			return facade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses2", content, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					const expectedDatasets: InsightDataset[] = [
						{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: 64612
						},
						{
							id: "courses2",
							kind: InsightDatasetKind.Courses,
							numRows: 64612
						}
					];
					expect(insightDatasets).is.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					expect(insightDatasets).to.have.deep.members(expectedDatasets);
					// alternative solution, but have to repeat twice for courses2
					// const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
					// expect(insightDatasetCourses).to.exist;
					// expect(insightDatasetCourses).to.deep.equal({
					//             id: "courses",
					//             kind: InsightDatasetKind.Courses,
					//             numRows: 64612
					//         });

				})
				.catch((error) => {
					expect.fail("unexpected error caught ${error}" + error);
				});
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			fs.removeSync(persistDir);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		testFolder<any, any[], PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError(expected, actual) {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect(actual).to.be.instanceof(InsightError);
					}
				},
			}
		);
	});
});

// TODO: to be removed
function getFileContent(path: string): string {
	return fs.readFileSync(path).toString("base64");
}
