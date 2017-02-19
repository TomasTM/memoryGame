var game = (function () {

	var gameBoard = document.querySelector('.game'),
		initialScreen = document.querySelector('.initial-screen'),
		kickOffbtn = document.querySelector('.kickof-btn'),
		watch = document.querySelector('.watch'),
		twitterBtn = document.querySelector('.share'),
		runWatch = true,
		tileState = {},
		possibleMatches = 9,
		currentMatches = 0;

	return {

		kickoff: function (response) {

			// escolher 9 resultados random e duplicar os mesmos. 

			var gamePices = [],
				duplicate = [],
				i = 0;

			while (i < 9) {
				var indexed = Math.floor(Math.random() * response.length);
				gamePices.push(response[indexed]);
				duplicate.push(response[indexed]);
				i++
			}

			var unshuffledPices = gamePices.concat(duplicate);

			game.shuffle(unshuffledPices);

		},

		shuffle: function (gamePices) {
			
			// Fisher-yates shuffle para as peças não seguirem a mesma ordem

			var currentIndex = gamePices.length,
				temporaryValue,
				randomIndex;

			while (0 !== currentIndex) {

				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				temporaryValue = gamePices[currentIndex];
				gamePices[currentIndex] = gamePices[randomIndex];
				gamePices[randomIndex] = temporaryValue;

			}

			game.buildGameTile(gamePices);

		},

		buildGameTile: function (gameSet) {

			// versão dos pobres de handlebars

			initialScreen.style.display = 'none';
			var readyHTML = '';

			for (var i = 0; i < gameSet.length; i++) {

				var concatHolder = '';

				// mapear as vars presentes na string de html (Template) e atribuir o valor correcto
				var mapItems = {
					'#id': gameSet[i].id,
					'#faceUrl': gameSet[i].img
				};

				// regex para atribuir string correcta 
				var htmlASstring = Template.tile.replace(/#id|#faceUrl/gi, function (matched) {
					return mapItems[matched];
				});

				// concatenar cada tile numa var unica
				readyHTML += concatHolder.concat(htmlASstring);

			}

			// Apenas uma operação à DOM para injectar todos os tiles 
			var parentElem = document.createElement('div');
			parentElem.className = 'game-board';
			parentElem.innerHTML = readyHTML;

			gameBoard.insertBefore(parentElem, kickOffbtn);

			kickOffbtn.style.display = 'block';
			kickOffbtn.addEventListener('click', game.readyInitialCall ,false);
		},
		
		readyInitialCall: function(){
			
			document.querySelectorAll('.tile img').forEach(function (imgs) {
				imgs.src = imgs.dataset.aside;
			});
			
			game.startInitialCount();
			
		},

		startInitialCount: function () {
			
			// count down inicial para para ver as peças

			var countDown = function () {

				if (countTo === 0) {
					window.clearInterval(tileInterval);
					kickOffbtn.innerHTML = 'Game On';
					game.handleInitialTiles();
					game.gameTime(run = true);
				} else {
					kickOffbtn.innerHTML = countTo;
					countTo--
				}

			};

			kickOffbtn.removeEventListener('click', game.readyInitialCall ,false);
			var countTo = 3;
			var tileInterval = window.setInterval(function () {
				countDown()
			}, 1000);

		},

		handleInitialTiles: function () {
			
			// Virar as peças e atribuir click events aos tiles

			document.querySelectorAll('.tile').forEach(function (tile) {
				tile.firstChild.src = tile.firstChild.dataset.bside;
				tile.addEventListener('click', game.tileClickLogic.bind(this), false);
			});

		},

		gameTime: function () {
			
			// Inicial é mostar o tempo de jogo
			
			var seconds = 0, 
				minutes = 0, 
				hours = 0,
				secondInterval;
			
			console.log(runWatch)
			
			var startWatch = function(){
				
				seconds++;
				if (seconds >= 60) {
					seconds = 0;
					minutes++;
					if (minutes >= 60) {
						minutes = 0;
						hours++;
					}
				}

				watch.innerHTML = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
				
				if(!runWatch) {
					window.clearInterval(secondCount);
					watch.innerHTML = ''
				} 

			}
			
			var secondCount = window.setInterval(function () {
				startWatch()
			}, 1000);
		},

		tileClickLogic: function (e) {

			// virar o tile e Preencher obj com os dois resultados para comparação

			if (e !== undefined) {

				e.currentTarget.firstChild.src = e.currentTarget.firstChild.dataset.aside; // virar tile

				// Preencher obj ( condicionar primeiro o secondTile para obj não herdar os dois valores à cabeça )
				tileState.secondTile = tileState.firstTile !== undefined ? e.currentTarget : '';
				tileState.firstTile = tileState.firstTile === undefined ? e.currentTarget : tileState.firstTile;

				// Ter a certez que o tileState tem os dois resutados e que não são exactamente iguais, caso contrário o dbClick ia contar como match
				
				if ((tileState.secondTile !== '' && tileState.firstTile !== '') && (tileState.firstTile !== tileState.secondTile)) {
					game.compareTileSelection();
				}
			}

		},

		compareTileSelection: function () {

			// Se forem uma match, incrementar as currentMatches e verificar se ainda há jogadas possiveis 
			
			if (tileState.firstTile.dataset.id === tileState.secondTile.dataset.id) {

				currentMatches++
				tileState = {};

				if (currentMatches === 9) {
					game.endGame();
				}

			} else {
				
				// Criar cópia do obj inicial para poder mostar as escolhas erradas e continuar a trabalhar imediactamente com um tileState limpo.
				// Mais eficaz do que remover e voltar a atribuir click events durante o timeout   
				
				var tileStateClone = {
					firstTile: tileState.firstTile,
					secondTile: tileState.secondTile
				};
				
				window.setTimeout(function () {
					
					// Mostar escolha errada num obj à parte

					tileStateClone.firstTile.firstChild.src = tileStateClone.firstTile.firstChild.dataset.bside;
					tileStateClone.secondTile.firstChild.src = tileStateClone.secondTile.firstChild.dataset.bside;
					
				}, 800);
				
			}
			
			tileState = {};

		},
		
		endGame: function() {
			
			// Parar o relógio e partilhar resultados 
			
			runWatch = false;
			game.gameTime();
			
			gameBoard.innerHTML = 'Jogo terminado em: ' + watch.innerHTML + '! Nice!';
			
			var share = document.createElement('a');
				share.href = 'https://twitter.com/intent/tweet/?text=Memory JavaScript FTW em:' + watch.innerHTML;
				share.className = 'btn share';
				share.innerHTML = 'Partilhar';
			
			gameBoard.appendChild(share);
			
		}

	}
}());