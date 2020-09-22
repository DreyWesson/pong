class Vector {
  constructor(x = 0, y = 0) {
    this.y = y;
    this.x = x;
  }
  get lengthOfVector() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  set lengthOfVector(value) {
    const fact = value / this.lengthOfVector;
    this.x *= fact;
    this.y *= fact;
  }
}
// Data structure for our rectangle
class Rect {
  constructor(w, h) {
    // Initial position of the ball
    this.pos = new Vector();
    // width and size of the ball
    this.size = new Vector(w, h);
  }
  // Get the sides of the ball
  get left() {
    return this.pos.x - this.size.x / 2;
  }
  get right() {
    return this.pos.x + this.size.x / 2;
  }
  get top() {
    return this.pos.y - this.size.y / 2;
  }
  get bottom() {
    return this.pos.y + this.size.y / 2;
  }
}
// create our ball from the rect class
class Ball extends Rect {
  constructor(w, h) {
    super(10, 10);
    this.velocity = new Vector();
  }
}

class Player extends Rect {
  constructor() {
    super(11, 100);
    this.score = 0;
  }
}
const playSound = new Audio("runway.mp3");

class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");

    // Our instance of ball
    this.ball = new Ball();

    // create instances of players
    this.players = [new Player(), new Player()];
    // Let players take their position
    this.players[0].pos.x = 40; //left pos player
    this.players[1].pos.x = this._canvas.width - 40; //right pos player
    this.players.forEach((player) => (player.pos.y = this._canvas.height / 2)); //position players in d middle on the Y-axis

    let lastTime;
    const callback = (millisec) => {
      if (lastTime) {
        this.update((millisec - lastTime) / 1000);
      }
      lastTime = millisec;
      requestAnimationFrame(callback);
    };
    callback();

    this.CHAR_PIXEL = 10;
    // write 0 - 9  with 1s and zeros
    this.CHARS = [
      "111101101101111",
      "010010010010010",
      "111001111100111",
      "111001111001111",
      "101101111001001",
      "111100111001111",
      "111100111101111",
      "111001001001001",
      "111101111101111",
      "111101111001111",
    ].map((str) => {
      // Draw dynamic canvases based on score of players
      const canvas = document.createElement("canvas");
      canvas.height = this.CHAR_PIXEL * 5;
      canvas.width = this.CHAR_PIXEL * 3;
      const context = canvas.getContext("2d");
      context.fillStyle = "#28a745";
      str.split("").forEach((fill, i) => {
        if (fill === "1") {
          context.fillRect(
            (i % 3) * this.CHAR_PIXEL,
            ((i / 3) | 0) * this.CHAR_PIXEL,
            this.CHAR_PIXEL,
            this.CHAR_PIXEL
          );
        }
      });
      return canvas;
    });

    this.reset();
  }
  // Collision detector
  collide(player, ball) {
    if (
      player.left < ball.right &&
      player.right > ball.left &&
      player.top < ball.bottom &&
      player.bottom > ball.top
    ) {
      const length = ball.velocity.lengthOfVector;
      ball.velocity.x = -ball.velocity.x;
      ball.velocity.y += 300 * (Math.random() - 0.5);
      ball.velocity.lengthOfVector = length * 1.05;
    }
  }

  // Draw things
  draw() {
    // Draw canvas
    this._context.fillStyle = "#000";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    // Draw ball
    this.drawRect(this.ball);
    // Draw players
    this.players.forEach((player) => this.drawRect(player));
    this.drawScore();
  }

  // Draw ball method
  drawRect(rect) {
    this._context.fillStyle = "#28a745";
    this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
  }
  drawScore() {
    const align = this._canvas.width / 3;
    const CHAR_WIDTH = this.CHAR_PIXEL * 4;
    this.players.forEach((player, index) => {
      const chars = player.score.toString().split("");
      const offset =
        align * (index + 1) -
        (CHAR_WIDTH * (chars.length / 2) + this.CHAR_PIXEL) / 2;
      chars.forEach((char, pos) => {
        this._context.drawImage(
          this.CHARS[char | 0],
          offset + pos * CHAR_WIDTH,
          20
        );
      });
    });
  }
  reset() {
    // make center the reset position of the ball
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    this.ball.velocity.x = 0;
    this.ball.velocity.y = 0;
    playSound.pause();
  }
  start() {
    if (this.ball.velocity.x === 0 && this.ball.velocity.y === 0) {
      this.ball.velocity.x = 300 * (Math.random() > 0.5 ? 1 : -1);
      this.ball.velocity.y = 300 * (Math.random() * 2 - 1);
      this.ball.velocity.lengthOfVector = 200;
    }
  }
  // Animate the ball
  update(dt) {
    this.ball.pos.x += this.ball.velocity.x * dt;
    this.ball.pos.y += this.ball.velocity.y * dt;

    // Detect if ball has hit the borders/edges
    if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
      const playerId = (this.ball.velocity.x < 0) | 0;
      this.players[playerId].score++;
      this.reset();
      // this.ball.velocity.y = -this.ball.velocity.y;
    }
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
      this.ball.velocity.y = -this.ball.velocity.y;
    }
    // player 1(ai) playing the ball back
    this.players[1].pos.y = this.ball.pos.y;
    this.players.forEach((player) => this.collide(player, this.ball));
    this.draw();
  }
}

const canvas = document.getElementById("pong");
const pong = new Pong(canvas);
canvas.addEventListener("pointermove", (e) => {
  const scale = e.offsetY / e.target.getBoundingClientRect().height;
  pong.players[0].pos.y = canvas.height * scale;
});
canvas.addEventListener("click", (e) => {
  pong.start();
  playSound.play();
});
