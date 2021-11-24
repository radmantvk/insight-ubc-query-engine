//document.getElementById("click-me-button").addEventListener("click", handleClickMe);

// const fs =require('fs-extra')
// import * as fs from "fs-extra";
// function init() {
// 	// import * as fs from "fs-extra";
//
// 	// const formData = new FormData();
// 	// const fileField = document.querySelector('input[type="file"]');
// 	// fetch('http://localhost:4321/dataset/courses/courses', {
// 	// 	method: 'PUT',
// 	// 	body: formData
// 	// })
// 	// 	.then(response => response.json())
// 	// 	.then(result => {
// 	// 		console.log('Success:', result);
// 	// 	})
// 	// 	.catch(error => {
// 	// 		console.error('Error:', error);
// 	// 	});
// }

function handleClickMe() {
	// alert('getting average!')
	let courseDept = document.getElementById('dept');
	let courseId = document.getElementById('id');
	if (document.getElementById('average').checked) {
		let jsonObj = getJsonObjForAvg(courseDept, courseId);
		postData('http://localhost:4321/query', jsonObj)
			.then((res) => {
				// console.log(res.toString());
				alert("finish")
				// const jsonObj = JSON.parse(res);
				// console.log(jsonObj.stringify());
			})
		// const addquery = fetch("localhost:4321/datasets/").then((response) => response.json())
		// 	.then(data => console.log(data));
	} else if (document.getElementById('maximumFail').checked) {
		let jsonObj = getJsonObjForMaxFailed(courseDept, courseId);
		postData('http://localhost:4321/query', jsonObj)
			.then((res) => {
				alert(res.toString());
				// const jsonObj = JSON.parse(json);
			})
		// process max number of failed students
		alert('getting maxFail!');
	}
}
// renderHeader();
// fetch("http://localhost:4321/datasets/").then(response => response.json())
// 	.then(data => console.log(data));

// const fs = require("fs-extra")
// const content = fs.readFileSync("./test/resources/archives/courses.zip").toString("base64");

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



// formData.append('username', 'abc123');
// formData.append('avatar', fileField.files[0]);

// fetch('http://localhost:4321/dataset/courses/courses', {
// 	method: 'PUT',
// 	body: formData
// })
// 	.then(response => response.json())
// 	.then(result => {
// 		console.log('Success:', result);
// 	})
// 	.catch(error => {
// 		console.error('Error:', error);
// 	});


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
						"courses_dept": courseDept.toString()
					}
				},
				{
					"IS": {
						"courses_id": courseId.toString()
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

// fetch("http://localhost:4321/datasets/").then(response => response.json())
// 	.then(data => console.log(data));

// const xhttp = new XMLHttpRequest();
// xhttp.open("GET", "http//:localhost:4321/datasets/", true);
// xhttp.send();
// fetch('https://example.com/profile', {
// 	method: 'POST', // or 'PUT'
// 	headers: {
// 		'Content-Type': 'application/json',
// 	},
// 	body: JSON.stringify(data),
// })
// 	.then(response => response.json())
// 	.then(data => {
// 		console.log('Success:', data);
// 	})
// 	.catch((error) => {
// 		console.error('Error:', error);
// 	});
