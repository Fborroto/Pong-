import * as THREE from 'three';
import Ball from './Scritps/Class/Ball.js';
import Bounds from '/Scritps/Bounds';
import Paddle from './Scritps/Class/Paddle.js';
import InputHandler from './Scritps/Class/InputHandler.js';
import Background from './Scritps/Class/Background.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import srcFont from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { setupCamera } from './Scritps/utils/PongScene.js';
const scene = new THREE.Scene();




// Imposta il renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Imposta la camera
const camera = setupCamera();
// Imposta audio listener
// Crea un contesto audio con il parametro 'interactive'
const audioContext = new (window.AudioContext || window.webkitAudioContext)({
    latencyHint: 'interactive'
});

// Imposta il AudioContext personalizzato in Three.js
THREE.AudioContext.setContext(audioContext);

// Crea un AudioListener di THREE.js e imposta il contesto audio
const listener = new THREE.AudioListener();
listener.context = audioContext;  // Associa il contesto audio al listener

// Aggiungi il listener alla camera
camera.add(listener);

// Oggetto per contenere diversi suoni
const sounds = {
    bounce: new THREE.Audio(listener),
    score: new THREE.Audio(listener),
    gameOver: new THREE.Audio(listener),
    paddleBounce: new THREE.Audio(listener)
};

// Crea un AudioLoader utilizzando lo stesso contesto audio
const audioLoader = new THREE.AudioLoader();

// Carica e assegna i buffer ai suoni
audioLoader.load('./Assets/audio/bounce.wav', function(buffer) {
    sounds.bounce.setBuffer(buffer);
    sounds.bounce.setLoop(false);
    sounds.bounce.setVolume(0.01);
});

audioLoader.load('./Assets/audio/paddleBounce.wav', function(buffer) {
    sounds.paddleBounce.setBuffer(buffer);
    sounds.paddleBounce.setLoop(false);
    sounds.paddleBounce.setVolume(0.01);
});

audioLoader.load('./Assets/audio/score.mp3', function(buffer) {
    sounds.score.setBuffer(buffer);
    sounds.score.setLoop(false);
    sounds.score.setVolume(0.01);
});

audioLoader.load('./Assets/audio/gameOver.mp3', function(buffer) {
    sounds.gameOver.setBuffer(buffer);
    sounds.gameOver.setLoop(false);
    sounds.gameOver.setVolume(0.5);
});


function playScoreSound() {
    if(!sounds.score.isPlaying)
        sounds.score.play();
}

function playGameOverSound() {
    if(!sounds.gameOver.isPlaying)
        sounds.gameOver.play();
}


// Creazione delle racchette e della pallina
const paddle = new Paddle(0.7, 4, 1, 0xffffff);
const enemyPaddle = new Paddle(0.7, 4, 1.2, 0xffffff);
const bounds = new Bounds(-20, 20, -15, 15);
const ball = new Ball(0.6, 27, bounds, [paddle, enemyPaddle], sounds);
const background = new Background(scene, bounds.xMax*2, bounds.yMax*2);

// Gestore input
const inputHandler = new InputHandler('player2', ball);
const inputHandlerAI = new InputHandler('ai', ball);

/**
 * Score
 */
const score = {
	pc: 0,
	player: 0,
}

/**
 * Font loader
 */

let pcScoreMesh, playerScoreMesh, loadedFont

const TEXT_PARAMS = {
	size: 3,
	depth: 0.5,
	curveSegments: 12,
	bevelEnabled: true,
	bevelThickness: 0.1,
	bevelSize: 0.05,
	bevelOffset: 0,
	bevelSegments: 5,
}
const scoreMaterial = new THREE.MeshStandardMaterial({
    color: 'white',
});

const fontLoader = new FontLoader()
fontLoader.load(srcFont, function (font) {
	loadedFont = font
	const geometry = new TextGeometry('0', {
		font: font,
		...TEXT_PARAMS,
	})

	geometry.center()

	pcScoreMesh = new THREE.Mesh(geometry, scoreMaterial)

	playerScoreMesh = pcScoreMesh.clone()
	pcScoreMesh.scale.setScalar(1.5)
    playerScoreMesh.scale.setScalar(1.5)
	pcScoreMesh.position.set(13, 15, 10); // Posizionalo di fronte alla camera
    playerScoreMesh.position.set(-13, 15, 10); // Posiziona il punteggio del giocatore
    pcScoreMesh.rotation.x = Math.PI / 3;  // Ruota di 90 gradi sull'asse Z
    playerScoreMesh.rotation.x = Math.PI / 3;  // Ruota di 90 gradi sull'asse Z
	pcScoreMesh.castShadow = true   
	playerScoreMesh.castShadow = true

	scene.add(pcScoreMesh, playerScoreMesh)
})

function getScoreGeometry(score) {
	const geometry = new TextGeometry(`${score}`, {
		font: loadedFont,
		...TEXT_PARAMS,
	})

	geometry.center()

	return geometry
}
console.log(pcScoreMesh, playerScoreMesh);



// Aggiungi la luce
const ambientLight = new THREE.AmbientLight(0xb0e0e6, 1); // Luce ambientale
scene.add(ambientLight);

const spotLight = new THREE.DirectionalLight(0xffffff, 4);
spotLight.position.set(0, 0, 100); // Posizionamento della luce
scene.add(spotLight);


renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Aggiungi gli oggetti alla scena
scene.add(ball.mesh);
scene.add(paddle.mesh);
scene.add(enemyPaddle.mesh);

// Posiziona le racchette
paddle.mesh.position.set(bounds.xMin + 1.5, 0);
enemyPaddle.mesh.position.set(bounds.xMax - 1.5, 0);

// Funzione per gestire il resize della finestra
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Aggiorna la matrice di proiezione
}

window.addEventListener('resize', onWindowResize, false);

ball.addEventListener('ongoal', (e) => {
    playScoreSound() ;
	// console.log('goal', e.message)
	score[e.message] += 1

	const geometry = getScoreGeometry(score[e.message])

	const mesh = e.message === 'pc' ? pcScoreMesh : playerScoreMesh

	mesh.geometry = geometry

	// console.log(playerScoreMesh.geometry)
	mesh.geometry.getAttribute('position').needsUpdate = true

	// console.log(score)
})

// Costanti per il Fixed Update
const fixedTimeStep = 1 / 60;  // 60 aggiornamenti al secondo
let accumulatedTime = 0;

// Clock per il tempo del gioco
const clock = new THREE.Clock();


// Funzione per il Fixed Update
function fixedUpdate() {
    // Aggiorna la logica degli oggetti del gioco
    inputHandlerAI.setPaddle(enemyPaddle);
    inputHandler.setPaddle(paddle);
    paddle.move(inputHandler.currentSpeed, fixedTimeStep);
    enemyPaddle.move(inputHandlerAI.currentSpeed, fixedTimeStep);
    ball.update(fixedTimeStep);
    paddle.constrainMovement(bounds);
    enemyPaddle.constrainMovement(bounds);
    inputHandler.update();
    inputHandlerAI.update();

}

// Funzione principale di rendering e simulazione
function tic() {
    requestAnimationFrame(tic);
    // Calcola il tempo trascorso
    const deltaTime = clock.getDelta();

    // Aggiungi il tempo trascorso all'accumulatore
    accumulatedTime += deltaTime;

    // Esegui il Fixed Update per ogni intervallo fisso
    while (accumulatedTime >= fixedTimeStep) {
        fixedUpdate();
        accumulatedTime -= fixedTimeStep;
    }

    // Rendering della scena
    renderer.render(scene, camera);

    // Richiede il prossimo frame
}

requestAnimationFrame(tic);

// Funzione per aggiungere messaggi alla chat
function addMessageToChat(message) {
    const chatDisplay = document.getElementById('chat-display');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatDisplay.appendChild(messageElement);

    // Scroll automatico verso il basso
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Event listener per l'invio dei messaggi nella chat
document.getElementById('chat-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const message = input.value.trim();

        if (message !== '') {
            // Aggiungi il messaggio alla chat
            addMessageToChat('Tu: ' + message);

            // Esegui qui la logica per inviare il messaggio al server o altro
            // ad esempio: socket.emit('chatMessage', message);

            // Pulisci il campo di input
            input.value = '';
        }
    }
});
