var requestHandler = function (requestType, url, callback) {

	var http = new XMLHttpRequest();
	http.open(requestType, url, true);

	http.onreadystatechange = function () {
		if (http.readyState == 4 && http.status == 200) {
			var response = JSON.parse(http.response);
			callback(response);
		} else if (http.status == 404 || http.status == 500){
			console.log('its a no go bro' + http.status + 'was given')
		}
	}

	http.send();

}