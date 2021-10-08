((e, $, o, P) => {
    const node = class {
        constructor(id, playerSize, mode) {
            this.id = id,
            this.init(playerSize, mode)
        };
        init(playerSize, mode) {
            this.canvas = o.getElementById("canvas"),
            this.dodgeMode = Boolean(Number(mode)),
            this.shootType = this.getRandomVal("shootType"),
            this.x = this.getRandomVal("x"),
            this.y = this.getRandomVal("y"),
            this.playerSize = playerSize,
            this.size = this.getRandomVal("size"),
            this.velX = this.getRandomVal("velX"),
            this.velY = this.getRandomVal("velY"),
            this.color = this.getRandomColor()
        };
        getRandomVal(type) {
            let result, direction, val, difference;
            switch (type) {
                case "shootType":
                    result = Math.round(Math.random()); // 0 = from X to X, 1 = from Y to Y
                    break;
                case "x":
                    if (this.shootType === 0) {
                        direction = Math.round(Math.random()), // 0 = left, 1 = right
                        val = Math.round(100 * Math.random()),
                        result = direction === 0 ? -(val + 10) : (val + 10 + this.canvas.width);
                    } else {
                        result = Math.round(this.canvas.width * Math.random());
                    };
                    break;
                case "y":
                    if (this.shootType === 0) {
                        result = Math.round(this.canvas.height * Math.random());
                    } else {
                        direction = Math.round(Math.random()), // 0 = top, 1 = bottom
                        val = Math.round(100 * Math.random()),
                        result = direction === 0 ? -(val + 10) : (val + 10 + this.canvas.height);
                    };
                    break;
                case "size":
                    difference = Math.round(Math.random()), // 0 = smaller, 1 = bigger
                    val = Math.round(5 * Math.random()),
                    result = difference === 0 ? ((this.dodgeMode ? val : -val) + this.playerSize) : (val + this.playerSize);
                    break;
                case "velX":
                    if (this.shootType === 0) {
                        direction = this.x > 0 ? -1 : 1, // -1 = left, 1 = right
                        val = Math.round((this.dodgeMode ? 10 : 5) * Math.random()),
                        result = val * direction;
                    } else {
                        direction = Math.random() > 0.5 ? -1 : 1, // -1 = left, 1 = right
                        val = Math.round((this.dodgeMode ? 10 : 5) * Math.random()),
                        result = val * direction;
                    }
                    break;
                case "velY":
                    if (this.shootType === 0) {
                        direction = Math.random() > 0.5 ? -1 : 1, // -1 = top, 1 = bottom
                        val = Math.round((this.dodgeMode ? 10 : 5) * Math.random()),
                        result = val * direction;
                    } else {
                        direction = this.y > 0 ? -1 : 1, // -1 = top, 1 = bottom
                        val = Math.round((this.dodgeMode ? 10 : 5) * Math.random()),
                        result = val * direction;
                    };
                    break;
                default:
                    break;
            }
            return result;
        };
        getRandomColor() {
            const rgb = [~~(255 * Math.random()), ~~(255 * Math.random()), ~~(255 * Math.random())];
            return Number("0x" + (16777216 + (rgb[0] << 16) + (rgb[1] << 8) + (0 | rgb[2])).toString(16).slice(1));
        };
        move() {
            this.x += this.velX,
            this.y += this.velY;
            if ((this.x > this.canvas.width+100 || this.x < -100) || (this.y > this.canvas.height+100 || this.y < -100)) {
                this.init(drawer.player.size, drawer.mode);
            };
        };
        checkCollision() {
            drawer.nodes.forEach(t => {
				let dx = this.x - t.x,
					dy = this.y - t.y,
					distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < (3/4 * this.size + 1/2 * t.size) && !drawer.observeMode) {
                    if (this.size > t.size) {
                        t.init(drawer.player.size, drawer.mode),
                        this.size += 1,
                        drawer.score += 1;
                    } else {
                        o.getElementById("mode").style.display = "block",
                        this.init(10, drawer.mode),
                        this.size = 10,
                        this.x = this.canvas.width/2,
                        this.y = this.canvas.height/2,
                        this.color = 0xffffff,
                        drawer.lastMode = drawer.mode,
                        drawer.lastScore = drawer.score,
                        drawer.lastSurvivedTime = drawer.survivedTime,
                        drawer.score = 0,
                        drawer.firstStart = !1,
                        drawer.started = !1,
                        drawer.nodes = [];
                        for (let i=0; i<drawer.nodeNumber; i++) {
                            drawer.nodes[i] = new node(i+1, 10, drawer.mode);
                        };
                        drawer.nodes.sort((a, b) => a.size - b.size);
                    }
                }
            })
        };
    };
    const drawer = new class {
        constructor() {
            this.init();
        };
        init() {
            this.canvas = o.getElementById("canvas"),
            this.renderer = new P.Renderer({
                view: this.canvas,
                width: e.innerWidth,
                height: e.innerHeight,
                resolution: e.devicePixelRatio,
                backgroundColor: 0x000000,
                autoDensity: !0,
                antialias: !1
            }),
            e.onresize = () => this.resize(),
            this.resize(),
            this.setVariables(),
            this.addEvents(),
            this.prepareTexture(),
            this.ready();
        };
        resize() {
            this.canvas.width = e.innerWidth,
            this.canvas.height = e.innerHeight,
            this.renderer.resize(this.canvas.width, this.canvas.height);
        };
        setVariables() {
            this.mode = o.getElementById("mode").value,
            this.firstStart = !0,
            this.started = !1,
            this.score = 0,
            this.fps = 0,
            this.observeMode = !1,
            this.player = new node(0, 10, this.mode),
            this.player.size = 10,
            this.player.x = this.canvas.width/2,
            this.player.y = this.canvas.height/2,
            this.player.color = 0xffffff,
            this.nodeNumber = this.player.dodgeMode ? 50 : 100,
            this.nodes = [];
            for (let i=0; i<this.nodeNumber; i++) {
                this.nodes[i] = new node(i+1, this.player.size, this.mode);
            };
            this.nodes.sort((a, b) => a.size - b.size);
        };
        addEvents() {
            o.getElementById("canvas").addEventListener("mousemove", event => {
                this.started && (this.player.x = event.clientX, this.player.y = event.clientY);
            });
            o.getElementById("canvas").addEventListener("mousedown", event => {
                event.button === 0 && !this.started && (o.getElementById("mode").style.display = "none", this.player.x = event.clientX, this.player.y = event.clientY, this.started = !0, this.startTime = Date.now());
            });
            o.getElementById("mode").addEventListener("change", event => {
                this.mode = o.getElementById("mode").value,
                this.player = new node(0, 10, this.mode),
                this.player.size = 10,
                this.player.x = this.canvas.width/2,
                this.player.y = this.canvas.height/2,
                this.player.color = 0xffffff,
                this.nodeNumber = this.player.dodgeMode ? 50 : 100,
                this.nodes = [];
                for (let i=0; i<this.nodeNumber; i++) {
                    this.nodes[i] = new node(i+1, 10, this.mode);
                };
                this.nodes.sort((a, b) => a.size - b.size);
            });
        };
        prepareTexture() {
            //node
            let e = o.createElement("canvas"),
                t = e.getContext("2d");
            e.width = 200,
            e.height = 200,
            t.moveTo(100, 100),
            t.beginPath(),
            t.arc(100, 100, 100, 0, Math.PI * 2),
            t.closePath(),
            t.fillStyle = "#ffffff",
            t.fill();
            this.nodeTexture = P.Texture.from(e);
            //indicator
            let e2 = o.createElement("canvas"),
                t2 = e2.getContext("2d");
            e2.width = 200,
            e2.height = 200,
            t2.moveTo(100, 100),
            t2.beginPath(),
            t2.arc(100, 100, 98, 0, Math.PI * 2),
            t2.closePath(),
            t2.lineWidth = 4,
            t2.strokeStyle = "#ffffff",
            t2.stroke();
            this.indicatorTexture = P.Texture.from(e2);
        };
        ready() {
            this.root = new P.Container(),
            this.stage = new P.Container(),
            this.graphics = new P.Graphics(),
            this.texts = new Map(),
            this.loop();
        };
        getText(id) {
            let e;
            return this.texts.get(id) || (e = new PIXI.Text(), this.texts.set(id, e), e);
        };
        loop() {
            this.fpsCount = 0,
            this.lastLoopTime = Date.now(),
            this.loop = new P.Ticker(),
            this.loop.add(delta => this.draw(delta)),
            this.loop.start();
        };
        draw(delta) {
            this.nodes.sort((a, b) => a.size - b.size),
            this.fpsCount++,
            1e3 > Date.now() - this.lastLoopTime || (this.lastLoopTime = Date.now(), this.fps = this.fpsCount, this.fpsCount = 0),
            this.survivedTime = this.lastLoopTime - this.startTime,
            this.survivedTime = `${Math.round(this.survivedTime/1000)}s`,
			this.player.dodgeMode && (this.score = ~~Math.pow(1.05, Number(this.survivedTime.slice(0, this.survivedTime.length-1)))),
            this.root.removeChildren(),
            this.stage.removeChildren(),
            this.graphics.clear();
            let allNodes = [];
            this.nodes.forEach(t => allNodes.push(t)),
            allNodes.push(this.player),
            allNodes.sort((a, b) => a.size - b.size);
            for (const n of allNodes) {
                let node = new P.Sprite(this.nodeTexture);
                node.scale.set(n.size/(this.nodeTexture.width/2), n.size/(this.nodeTexture.height/2)),
                node.anchor.set(.5, .5),
                node.position.set(n.x, n.y),
                node.visible = this.started,
                node.tint = n.id === 0 ? n.color : this.player.size > n.size ? 0x00ff00 : 0xff0000;/*n.color;*/
                let indicator = new P.Sprite(this.indicatorTexture);
                indicator.scale.set(n.size/(this.indicatorTexture.width/2), n.size/(this.indicatorTexture.height/2)),
                indicator.anchor.set(.5, .5),
                indicator.position.set(n.x, n.y),
                indicator.visible = this.started,
                indicator.tint = 0x000000;/*n.id === 0 ? n.color : this.player.size > n.size ? 0x00ff00 : 0xff0000;*/
                this.stage.addChild(node, indicator);
            };
            let hint = this.getText("hint");
            hint.text = `   Self |      Food |      Danger\n[${this.player.dodgeMode ? "Dodge Mode" : "Normal Mode"}]`,
            hint.style.align = "center",
            hint.style.fill = 0xffffff,
            hint.style.fontSize = "30px",
            hint.anchor.set(.5, .5),
            hint.position.set(this.canvas.width/2, 10+hint.height/2);
            let self = new P.Sprite(this.nodeTexture);
            self.scale.set(30/this.nodeTexture.width, 30/this.nodeTexture.height),
            self.anchor.set(.5, .5),
            self.position.set(this.canvas.width/2-hint.width/2, 10+self.height/2),
            self.tint = 0xffffff;
            let green = new P.Sprite(this.nodeTexture);
            green.scale.set(30/this.nodeTexture.width, 30/this.nodeTexture.height),
            green.anchor.set(.5, .5),
            green.position.set(this.canvas.width/2-hint.width/5+5, 10+green.height/2),
            green.tint = 0x00ff00;
            let red = new P.Sprite(this.nodeTexture);
            red.scale.set(30/this.nodeTexture.width, 30/this.nodeTexture.height),
            red.anchor.set(.5, .5),
            red.position.set(this.canvas.width/2+hint.width/6, 10+red.height/2),
            red.tint = 0xff0000;
            this.started ? (this.nodes.forEach(t => t.move()),
            this.player.checkCollision(),
            this.statsText = this.getText("stats"),
            this.statsText.text = `FPS: ${this.fps}\nScore: ${this.score}\nSurvived time: ${this.survivedTime}`,
            this.statsText.style.align = "right",
            this.statsText.style.fill = 0xffffff,
            this.statsText.style.fontSize = "30px",
            this.statsText.anchor.set(.5, .5),
            this.statsText.position.set(this.canvas.width-this.statsText.width/2, this.canvas.height-this.statsText.height/2),
            this.stage.addChild(this.statsText)) : (
            this.startText = this.getText("start"),
            this.startText.text = `${!this.firstStart ? "You died!\nMode: " + (Boolean(Number(this.lastMode)) ? "Dodge Mode" : "Normal Mode") + "\nScore: " + this.lastScore + "\nSurvived time: " + this.lastSurvivedTime + "\n" : ""}Click to ${!this.firstStart ? "restart" : "start!\nMove your mouse to move.\nEat the dots in the surroundings.\nDon't get eaten by the big dots.\nGood luck"}!`,
            this.startText.style.align = "center",
            this.startText.style.fill = 0xffffff,
            this.startText.style.fontSize = "60px",
            this.startText.anchor.set(.5, .5),
            this.startText.position.set(this.canvas.width/2, this.canvas.height/2),
            this.stage.addChild(this.startText, hint, self, green, red)),
            this.root.addChild(this.stage),
            this.renderer.render(this.root);
        };
    };
    e.node = node;
    e.drawer = drawer;
})(window, $, document, PIXI);