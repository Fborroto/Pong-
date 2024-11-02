import * as THREE from 'three';

export function setupLights()
{

}

export function setupCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;
    camera.position.y = -20;
    camera.rotation.x = Math.PI / 6;
    return camera;
}