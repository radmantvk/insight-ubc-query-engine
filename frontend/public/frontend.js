//document.getElementById("click-me-button").addEventListener("click", handleClickMe);

function handleClickMe() {
	let courseDept = document.getElementById('dept');
	let courseId = document.getElementById('id');
	if (document.getElementById('average').checked) {
		// process average for query
		alert('getting average');
	} else if (document.getElementById('maximumFail').checked) {
		// process max number of failed students
		alert('getting maxFail');
	}
}
