
function handleClickMe() {
	let courseDept = document.getElementById('dept').value;
	let courseId = document.getElementById('id').value;
	if (document.getElementById('average').checked) {
		let jsonObj = getJsonObjForAvg(courseDept, courseId);
		postData('http://localhost:4321/query', jsonObj)
			.then((res) => {
				// console.log(res.toString());
				// alert("finish")
				// const jsonObj = JSON.parse(res);
				// console.log(jsonObj.stringify());
				alert("The average of all sections with the given department and ID is " + res.result[0].overallAvg);
			}).catch((err) => {
				alert(err);
		})
		// const addquery = fetch("localhost:4321/datasets/").then((response) => response.json())
		// 	.then(data => console.log(data));
	} else if (document.getElementById('maximumFail').checked) {
		let jsonObj = getJsonObjForMaxFailed(courseDept, courseId);
		postData('http://localhost:4321/query', jsonObj)
			.then((res) => {
				// console.log(res.result[0].courses_fail);
				alert("The max number of failed students in a section with the given department and ID is "
					+ res.result[0].courses_fail);
			})
	}
}

async function postData(url = 'http://localhost:4321/query', data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return response.json(); // parses JSON response into native JavaScript objects
}

async function uploadFile() {
	let formData = new FormData();
	formData.append("courses", fileupload.files[0]);
	await fetch('/upload.php', {
		method: "POST",
		body: formData
	});
	alert('The file has been uploaded successfully.');
}

function getJsonObjForMaxFailed(courseDept, courseId) {
	return {
		"WHERE": {
			"AND": [
				{
					"IS": {
						"courses_dept": courseDept
					}
				},
				{
					"IS": {
						"courses_id": courseId
					}
				}
			]
		},
		"OPTIONS": {
			"COLUMNS": [
				"courses_avg",
				"courses_dept",
				"courses_fail"
			],
			"ORDER": {
				"dir": "DOWN",
				"keys": [
					"courses_fail"
				]
			}
		}
	}
}

function getJsonObjForAvg(courseDept, courseId) {
	return  {
		"WHERE": {
			"AND": [
				{
					"IS": {
						"courses_dept": courseDept
					}
				},
				{
					"IS": {
						"courses_id": courseId
					}
				}
			]
		},
		"OPTIONS": {
			"COLUMNS": [
				"overallAvg"

			]
		},
		"TRANSFORMATIONS": {

			"GROUP": ["courses_dept"],

			"APPLY": [{

				"overallAvg": {

					"AVG": "courses_avg"

				}

			}]

		}
	}
}
