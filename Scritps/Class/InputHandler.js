export default class InputHandler {
    constructor(controller = 'player1', ball = null) {
        this.controller = controller;
        this.movingUp = false;
        this.movingDown = false;
        this.currentSpeed = 0;
        this.acceleration = 0.2;
        this.baseSpeed = 25;       // Velocità AI ridotta per essere meno perfetta
        this.maxSpeed = 35;        // Velocità massima ridotta
        this.reactionDelay = 0.05; // Ritardo nella reazione dell'IA
        this.errorMargin = 1.5;    // Margine di errore per la precisione dell'IA
        this.ball = ball;

        // Mappa dei controlli per i vari giocatori
        this.controls = {
            player1: {
                up: 'ArrowUp',
                down: 'ArrowDown',
            },
            player2: {
                up: 'KeyW',
                down: 'KeyS',
            },
            ai: 'ai'  // Modalità AI
        };

        this.controlKeys = this.controls[controller] || this.controls['player1'];

        if (this.controlKeys !== 'ai') {
            window.addEventListener('keydown', (event) => this.handleKeyDown(event));
            window.addEventListener('keyup', (event) => this.handleKeyUp(event));
        }
    }

    handleKeyDown(event) {
        if (event.code === this.controlKeys.up) {
            this.movingUp = true;
            this.currentSpeed = this.baseSpeed;
        }
        if (event.code === this.controlKeys.down) {
            this.movingDown = true;
            this.currentSpeed = -this.baseSpeed;
        }
    }

    handleKeyUp(event) {
        if (event.code === this.controlKeys.up) {
            this.movingUp = false;
            if (this.currentSpeed > 0) {
                this.currentSpeed = 0;
            }
        }
        if (event.code === this.controlKeys.down) {
            this.movingDown = false;
            if (this.currentSpeed < 0) {
                this.currentSpeed = 0;
            }
        }
    }

    update() {
        if (this.controlKeys === 'ai') {
            this.updateAI();
        } else {
            if (this.movingUp) {
                this.currentSpeed = this.baseSpeed;
            } else if (this.movingDown) {
                this.currentSpeed = -this.baseSpeed;
            } else {
                this.currentSpeed = 0;
            }
        }
    }

    updateAI() {
        if (!this.ball) return;

        const ballY = this.ball.mesh.position.y;
        const paddleY = this.paddlePosition();

        // Se la pallina è già abbastanza vicina alla racchetta, non muovere
        if (Math.abs(ballY - paddleY) < this.errorMargin) {
            this.currentSpeed = 0;
            return;
        }

        // Aggiungi un ritardo alla reazione dell'IA
        const reactionThreshold = Math.random() * this.reactionDelay;

        // Muovi la racchetta verso la pallina ma con una certa imprecisione
        if (ballY > paddleY + reactionThreshold) {
            this.currentSpeed = this.baseSpeed;
        } else if (ballY < paddleY - reactionThreshold) {
            this.currentSpeed = -this.baseSpeed;
        } else {
            this.currentSpeed = 0;
        }

        // Limita la velocità massima per rendere l'IA meno efficiente
        if (Math.abs(this.currentSpeed) > this.maxSpeed) {
            this.currentSpeed = this.currentSpeed > 0 ? this.maxSpeed : -this.maxSpeed;
        }
    }

    paddlePosition() {
        return this.paddle ? this.paddle.mesh.position.y : 0;
    }

    setPaddle(paddle) {
        this.paddle = paddle;
    }
}
