// ----- Start of the assigment ----- //

class ParticleSystem extends PIXI.Container {
	constructor() {
		super();
		this.start    = 0;
		this.duration = 2000;

		Math.random()
		this.particles = [];
		for (let i = 0; i < 100; i++) {
			let particle = game.sprite("CoinsGold000");
			particle.pivot.x = particle.width / 2;
			particle.pivot.y = particle.height / 2;
			this.addChild(particle);
			this.particles.push(particle);

			let angle = Math.random() * Math.PI * 2;
			let speed = Math.random() * 1 + 0.1;
			particle.initialVelocity = [Math.cos(angle) * speed, Math.sin(angle) * speed];
		}

		this.gravity = 0.001;
	}
	animTick(nt,lt,gt) {
		let num = ("000"+Math.floor(nt*8)).substr(-3);

		for (let i = 0; i < this.particles.length; i++) {
			let particle = this.particles[i];
			particle.x = 400 + lt * particle.initialVelocity[0];
			particle.y = 225 + lt * particle.initialVelocity[1] + lt * lt * this.gravity;
		}

		//game.setTexture(this.sp,"CoinsGold"+num);
		// this.sp.x = 400 + nt * this.initialVelocity[0];
		// this.sp.y = 225 + nt * this.initialVelocity[0] + nt * nt * this.gravity;
		//this.sp.scale.x = this.sp.scale.y = nt;
		//this.sp.alpha = nt;
		//this.sp.rotation = nt*Math.PI*2;
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
