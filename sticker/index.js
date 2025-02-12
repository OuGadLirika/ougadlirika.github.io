// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);

const canvasContainer = document.getElementById('3d-model');

function updateRendererSize() {
    const width = canvasContainer.offsetWidth;
    const height = canvasContainer.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

canvasContainer.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemisphereLight);

const directionalLights = [
    new THREE.DirectionalLight(0xffffff, 0.8),
    new THREE.DirectionalLight(0xffffff, 0.5),
    new THREE.DirectionalLight(0xffffff, 0.5),
    new THREE.DirectionalLight(0xffffff, 0.5)
];

directionalLights[0].position.set(5, 5, 10);
directionalLights[1].position.set(-5, 5, -10);
directionalLights[2].position.set(-10, 5, 0);
directionalLights[3].position.set(10, 5, 0);

directionalLights.forEach(light => scene.add(light));

const loader = new THREE.GLTFLoader();
let model;

loader.load(
    'macbook/Sketchfab_2021_12_17_15_43_17.gltf',
    (gltf) => {
        model = gltf.scene;
        model.scale.set(30, 30, 30);
        model.rotation.y = -Math.PI;
        scene.add(model);

        // Автоматически центрируем и масштабируем модель
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        
        const fitHeightDistance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360));
        camera.position.set(0, 0, fitHeightDistance * 1.5);

        updateRendererSize();
    },
    undefined,
    (error) => {
        console.error('Error loading the model:', error);
    }
);

let rotationAmount = 0;
const maxRotationLeft = Math.PI / 180;
const maxRotationRight = Math.PI / 3;
let direction = 1;

function animate() {
    requestAnimationFrame(animate);
    if (model) {
        rotationAmount += direction * 0.01;
        if (rotationAmount >= maxRotationRight) {
            rotationAmount = maxRotationRight;
            direction *= -1;
        } else if (rotationAmount <= -maxRotationLeft) {
            rotationAmount = -maxRotationLeft;
            direction *= -1;
        }
        model.rotation.y = Math.PI + rotationAmount;
    }
    renderer.render(scene, camera);
}

window.addEventListener('resize', updateRendererSize);
updateRendererSize();
animate();
