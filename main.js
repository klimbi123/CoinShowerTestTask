// ----- Start of the assigment ----- //

class ParticleSystem extends PIXI.Container {
	constructor() {
		super();
		this.start    = 0;
		this.duration = 3000;
		let count = 100;

		this.particles = [];
		for (let i = 0; i < count; i++) {
			let particle = game.sprite("CoinsGold000");
			particle.pivot.x = particle.width / 2;
			particle.pivot.y = particle.height / 2;
			this.addChild(particle);
			this.particles.push(particle);

			let spread = Math.PI * 0.5;
			let direction = Math.PI * 0.5;
			let angle = Math.random() * spread - (direction + spread * 0.5);

			let radius = Math.random() * 30;
			particle.initialPosition = [400 + Math.cos(angle) * radius, 500 + Math.sin(angle) * radius];

			let speed = Math.random() * 1.5 + 0.2;
			particle.initialVelocity = [Math.cos(angle) * speed, Math.sin(angle) * speed - 0.2];

			particle.rotation = Math.random() * 2 * Math.PI;
			particle.angularVelocity = Math.random() * 20 - 10;

			particle.initialSize = 0.5;
			// Scaling to make it seems like coins are flying at the player.
			// Rendering is done from first added coin to last added coin, 
			// so coins near the end of the queue are allowed to grow bigger.
			// Otherwise the smaller (further) coins would appear in front of bigger (closer) coins.
			particle.sizeChange = (i / count) * 1.2;

			particle.startOffset = (i / count) * 0.4;
			particle.random = Math.random();
		}

		this.gravity = 0.001;
	}
	animTick(nt,lt,gt) {
		// I initially made explosion effect as the tick timings provided are all particle system ones.
		// If confuses me a bit as to why nt, lt and gt are provided instead of deltaTime.
		// It seems to me like particle system itself should be responsible for 
		// keeping its normalized, local, global and particle specific times.
		// I assume the time is provided like that so the system wouldn't rely on framerate or previous frame.
		// This way the animation could be played backwards too.
		// this.explosionTick(nt, lt);
		this.continuousShowerTick(nt);
	}
	explosionTick(nt, lt){
		for (let i = 0; i < this.particles.length; i++) {
			let particle = this.particles[i];
			let num = ("000"+Math.floor(((5 * nt + particle.random) % 1)*8)).substr(-3);
			game.setTexture(particle,"CoinsGold"+num);
			particle.x = particle.initialPosition[0] + lt * particle.initialVelocity[0];
			particle.y = particle.initialPosition[1] + lt * particle.initialVelocity[1] + lt * lt * this.gravity;
			this.wallBounce(particle);

			particle.rotation = nt * particle.angularVelocity;

			particle.scale.x = particle.scale.y = particle.initialSize + nt * particle.sizeChange;
		}
	}
	continuousShowerTick(nt){
		for (let i = 0; i < this.particles.length; i++) {
			let particle = this.particles[i];

			// Getting particle specific times.
			let pnt = (nt + particle.startOffset) % 1
			let plt = this.duration * pnt;

			let num = ("000"+Math.floor(((5 * pnt + particle.random) % 1)*8)).substr(-3);
			game.setTexture(particle,"CoinsGold"+num);
			particle.x = particle.initialPosition[0] + plt * particle.initialVelocity[0];
			particle.y = particle.initialPosition[1] + plt * particle.initialVelocity[1] + plt * plt * this.gravity;
			this.wallBounce(particle);

			particle.rotation = pnt * particle.angularVelocity;

			particle.scale.x = particle.scale.y = particle.initialSize + pnt * particle.sizeChange;
		}
	}
	wallBounce(particle){
		if (particle.x > 800) {
			particle.x = 800 - (particle.x - 800) * 0.35;
		}
		if (particle.x < 0) {
			particle.x = -particle.x * 0.35;
		}
	}
}

// ----- End of the assigment ----- //

class Game {
	constructor(props) {
		this.totalDuration = 0;
		this.effects = [];
		this.renderer = new PIXI.WebGLRenderer(800,450);
		document.body.appendChild(this.renderer.view);
		this.stage = new PIXI.Container();
		this.loadAssets(props&&props.onload);
	}
	loadAssets(cb) {
		let textureNames = [];
		// Load coin assets
		for (let i=0; i<=8; i++) {
			let num  = ("000"+i).substr(-3);
			let name = "CoinsGold"+num;
			let url  = "gfx/CoinsGold/"+num+".png";
			textureNames.push(name);
			PIXI.loader.add(name,url);
		}
		PIXI.loader.load(function(loader,res){
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i=0; i<keys.length; i++) {
				var texture = res[keys[i]].texture;
				if ( ! texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}
			// Assets are loaded and ready!
			this.start();
			cb && cb();
		}.bind(this));
	}
	start() {	
		this.isRunning = true;
		this.t0 = Date.now();
		update.bind(this)();
		function update(){
			if ( ! this.isRunning) return;
			this.tick();
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}
	addEffect(eff) {
		this.totalDuration = Math.max(this.totalDuration,(eff.duration+eff.start)||0);
		this.effects.push(eff);
		this.stage.addChild(eff);
	}
	render() {
		this.renderer.render(this.stage);
	}
	tick() {
		let gt = Date.now();
		let lt = (gt-this.t0) % this.totalDuration;
		for (let i=0; i<this.effects.length; i++) {
			let eff = this.effects[i];
			if (lt>eff.start+eff.duration || lt<eff.start) continue;
			let elt = lt - eff.start;
			let ent = elt / eff.duration;
			eff.animTick(ent,elt,gt);
		}
	}
	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}
	setTexture(sp,name) {
		sp.texture = PIXI.utils.TextureCache[name];
		if ( ! sp.texture) console.warn("Texture '"+name+"' don't exist!")
	}
}

window.onload = function(){
	window.game = new Game({onload:function(){
		game.addEffect(new ParticleSystem());
	}});
}
