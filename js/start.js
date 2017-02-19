var startThigsOff = function () {

	var kickOffBtn = document.querySelector('.inicio-btn'),
		initialUrl = 'https://services.sapo.pt/Codebits/listbadges';

	var callRequest = function () {
		requestHandler('GET', initialUrl, game.kickoff)
	}

	kickOffBtn.addEventListener('click', callRequest, false);

}


window.addEventListener('load', startThigsOff, false)