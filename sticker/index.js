// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
// Ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Soft light
scene.add(ambientLight);

// Directional light from the user's perspective (front-left)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(-5, 5, 10); // Positioned in front and slightly to the left of the user
scene.add(directionalLight);

// Point light to emphasize the left side
const pointLight = new THREE.PointLight(0xffffff, 0.6);
pointLight.position.set(-10, 5, 0); // Positioned to the left of the model
scene.add(pointLight);

// Load GLTF model
const loader = new THREE.GLTFLoader();
let model;
loader.load(
  'macbook/Sketchfab_2021_12_17_15_43_17.gltf', // Path to your GLTF file
  (gltf) => {
    model = gltf.scene;
    // Increase model size
    model.scale.set(30, 30, 30);
    // Initial rotation of the model (180 degrees)
    model.rotation.y = -Math.PI; // 180 degrees in radians
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('Error loading the model:', error);
  }
);

// Camera position
camera.position.z = 20; // Increase distance to the camera

// Animation loop
let rotationAmount = 0;
const maxRotationLeft = Math.PI / 180; // 60 degrees in radians (to the left)
const maxRotationRight = Math.PI / 3; // 1 degree in radians (to the right)
let direction = 1; // 1 for rotating to the right, -1 for rotating to the left

function animate() {
  requestAnimationFrame(animate);
  if (model) {
    // Update rotation amount based on direction
    rotationAmount += direction * 0.01;
    // Check limits and change direction if necessary
    if (rotationAmount >= maxRotationRight) {
      rotationAmount = maxRotationRight; // Clamp to the right limit
      direction *= -1; // Reverse direction
    } else if (rotationAmount <= -maxRotationLeft) {
      rotationAmount = -maxRotationLeft; // Clamp to the left limit
      direction *= -1; // Reverse direction
    }
    // Apply rotation to the model
    model.rotation.y = Math.PI + rotationAmount;
  }
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();