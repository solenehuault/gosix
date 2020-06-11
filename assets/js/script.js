/* Eléments pour le dessin */
const c = document.getElementById("myCanvas");
const ctx = c.getContext("2d");

const originX = c.width/2;
const originY = c.height/2

ctx.translate(originX, originY);

const sizeHex = 70;
const radiusRound = 10;

const colorCircle = "white";
const colorPlayers = ["green", "red"];

let turn = 0;
let allCorners = {}, allHexa = [], allCorners_arr = [];



// Pavage initial
function pavageHex() {
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			if (Math.abs(i+j) < 2) {
				var hexa = new Hexagon(i,j);
				allHexa.push(hexa);
				hexa.makeCorners().draw();
				hexa.taken = -1;
			}
		}
	}
	Object.keys(allCorners).forEach(key => {
		allCorners[key].drawCircle(colorCircle);
		allCorners[key].taken = -1;
		allCorners_arr.push(allCorners[key]);
	})
}

window.onload = pavageHex();



// Clic sur un cercle
function clickOnCorners(event) {
	var x = event.clientX - originX;
	var y = event.clientY - originY;
	var corners = Object.keys(allCorners).map(key => allCorners[key]).filter(cor => cor.taken == -1);
	for (let cor of corners) {
		if (cor.isInCircle(x,y)) { // On a cliqué sur le coin 'cor'
			cor.taken = turn;

			var equal = false, hexa_taken = [];

			cor.getHexa().forEach(hex => {
				// Si un hexagone 'hex' du coin cliqué est maintenant couvert
				if (hex.taken == -1 && hex.nbCornersFree() === 0) { 
					var chains = [[],[]];

					// Fonction récursive pour trouver les coins récupérés par un même joueur reliés
					function makeChain(corner, player) {
						if (chains[0].length + chains[1].length+chains.length < 50) {
							corner.getNeighbors().forEach(nei => {
								if (nei.taken == player && chains[player].indexOf(nei) == -1) {
									chains[player].push(nei)
									makeChain(nei, player);
								}
							})
						}
						
					}

					// Pour chaque coin de l'hexagone, on cherche et store les coins pris par chaque joueur
					hex.corners.map(name => allCorners[name]).forEach(corh => {
						var pl = corh.taken;
						if (chains[pl].indexOf(corh) == -1) {
							chains[pl].push(corh);
							makeChain(corh, pl);
						}
					})

					// On compte les résultats
					var l0 = chains[0].length, l1 = chains[1].length;
					if (l0 == l1) {equal = true;}
					else {
						if (l0 > l1) {var pl = 0} else {var pl = 1}
						hexa_taken.push({hexagon: hex, player: pl});
					}
				}
			})


			// S'il y a une égalité, on ne peut pas prendre le coin
			if (equal) {
				alert("Rule 618: this corner cannot be taken");
				cor.taken = -1;
			}
			// Sinon, on prend le coin et on gère les nouveaux hexagones pris
			else {
				cor.drawCircle(colorPlayers[turn]);
				turn = (turn+1)%2;

				hexa_taken.forEach(pair => {
					var hex = pair.hexagon, pl = pair.player
					hex.taken = pl;
					hex.getCenterC().drawCircle(colorPlayers[pl]);
					hex.corners.map(name => allCorners[name]).filter(corn => corn.taken == pl).forEach(corn =>{
						corn.taken = -1; corn.drawCircle(colorCircle);
					})
				})
			}

			break;
		}
	}
}

