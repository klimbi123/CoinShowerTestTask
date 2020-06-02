// ----- Start of the assigment ----- //

class ParticleSystem extends PIXI.Container {
	constructor() {
		super();
		this.start    = 0;
		this.duration = 2000;

		Math.random()
		this.particles = [];
		let count = 100;
		for (let i = 0; i < count; i++) {
			let particle = game.sprite("CoinsGold000");
			particle.pivot.x = particle.width / 2;
			particle.pivot.y = particle.height / 2;
			this.addChild(particle);
			this.particles.push(particle);

			let angle = Math.random() * Math.PI * 2;
			let radius = Math.random() * 50;
			particle.initialPosition = [400 + Math.cos(angle) * radius, 225 + Math.sin(angle) * radius];

			let speed = Math.random() * 1 + 0.1;
			particle.initialVelocity = [Math.cos(angle) * speed, Math.sin(angle) * speed - 0.2];

			particle.rotation = Math.random() * 2 * Math.PI;
			particle.angularVelocity = Math.random() * 20 - 10;

			particle.initialSize = 0.5;
			particle.sizeChange = (i / count - 0.5) * 1.5;

			particle.offset = Math.random();
		}

		this.gravity = 0.001;
	}
	animTick(nt,lt,gt) {
		//this.explosionTick(nt, lt);
		this.continuousShowerTick(nt);
	}
	explosionTick(nt, lt){
		for (let i = 0; i < this.particles.length; i++) {
			let particle = this.particles[i];
			let num = ("000"+Math.floor(((5 * nt + particle.offset) % 1)*8)).substr(-3);
			game.setTexture(particle,"CoinsGold"+num);
			particle.x = particle.initialPosition[0] + lt * particle.initialVelocity[0];
			particle.y = particle.initialPosition[1] + lt * particle.initialVelocity[1] + lt * lt * this.gravity;

			particle.rotation = nt * particle.angularVelocity;

			particle.scale.x = particle.scale.y = particle.initialSize + nt * particle.sizeChange * particle.sizeChange;
		}
	}
	continuousShowerTick(nt){
		for (let i = 0; i < this.particles.length; i++) {
			let particle = this.particles[i];
			let pnt = (nt + particle.offset) % 1
			let plt = this.duration * pnt;
			let num = ("000"+Math.floor(((5 * pnt) % 1)*8)).substr(-3);
			game.setTexture(particle,"CoinsGold"+num);
			particle.x = particle.initialPosition[0] + plt * particle.initialVelocity[0];
			particle.y = particle.initialPosition[1] + plt * particle.initialVelocity[1] + plt * plt * this.gravity;

			particle.rotation = pnt * particle.angularVelocity;

			particle.scale.x = particle.scale.y = particle.initialSize + pnt * particle.sizeChange * particle.sizeChange;
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
