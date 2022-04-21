const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scoreElement = document.getElementById("score");
const finalScore = document.getElementById("final-score");
const gameOverModal = document.getElementById("game-over-modal");

const xCanvasCenter = canvas.width / 2;
const yCanvasCenter = canvas.height / 2;

let player = new Player(xCanvasCenter, yCanvasCenter, 15, "white");

let projectiles = [];
let enemies = [];
let particles = [];

function init() {
	player = new Player(xCanvasCenter, yCanvasCenter, 15, "white");
	projectiles = [];
	enemies = [];
	particles = [];
	scoreElement.innerHTML = 0;
}

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (50 - 5) + 5;

		let x;
		let y;

		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
		}

		const angle = Math.atan2(yCanvasCenter - y, xCanvasCenter - x);

		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle),
		};

		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

		enemies.push(new Enemy(x, y, radius, color, velocity));
	}, 1000);
}

window.addEventListener("click", (event) => {
	const angle = Math.atan2(
		event.clientY - yCanvasCenter,
		event.clientX - xCanvasCenter
	);

	const velocity = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5,
	};

	projectiles.push(
		new Projectile(xCanvasCenter, yCanvasCenter, 5, "white", velocity)
	);
	console.log(projectiles);
});

let animationId;
let score = 0;

function animate() {
	animationId = window.requestAnimationFrame(animate);
	c.fillStyle = "rgb(0, 0, 0, 0.2)";
	c.fillRect(0, 0, canvas.width, canvas.height);
	player.update();
	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1);
		} else {
			particle.update();
		}
	});

	projectiles.forEach((projectile, index) => {
		projectile.update();

		if (
			projectiles.x + projectiles.radius < 0 ||
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height
		) {
			setTimeout(() => {
				projectiles.splice(index, 1);
			}, 0);
		}
	});

	enemies.forEach((enemy, enemyIndex) => {
		enemy.update();

		const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

		// end game
		if (distance < enemy.radius + player.radius) {
			cancelAnimationFrame(animationId);
			gameOverModal.style.display = "flex";
			finalScore.innerHTML = score;
		}

		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

			// when projectiles touch enemy
			if (dist < enemy.radius + projectile.radius) {
				// create explosions
				for (let i = 0; i < enemy.radius * 2; i++) {
					particles.push(
						new Particle(projectile.x, projectile.y, enemy.color, {
							x: (Math.random() - 0.5) * (Math.random() * 6),
							y: (Math.random() - 0.5) * (Math.random() * 6),
						})
					);
				}
				setTimeout(() => {
					if (enemy.radius - 10 > 5) {
						//increase score
						score += 100;
						scoreElement.innerHTML = score;

						gsap.to(enemy, {
							radius: enemy.radius - 10,
						});
					} else {
						//increase score
						score += 250;
						scoreElement.innerHTML = score;

						enemies.splice(enemyIndex, 1);
					}
					projectiles.splice(projectileIndex, 1);
				}, 0);
			}
		});
	});
}

function restartGame() {
	init();
	animate();
	gameOverModal.style.display = "none";
}

// canvas.addEventListener('mousemove', event => {
// 	const angle = Math.atan2(
// 		player.x + event.offsetX,
// 		player.y + event.offsetY

// 	);

// 	console.log(angle)

// 	const velocity = {
// 		x: Math.sin(angle),
// 		y: Math.cos(angle),
// 	};
//  console.log(velocity)
// 	player.x += velocity.x

// })

animate();
spawnEnemies();
