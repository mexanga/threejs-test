const orbitCalculation = function (radius, options = {}) {

    let speed = Math.floor(options.speed || 60000);
    let date = Date.now();

    const x = (Math.sin((date % speed) / speed * Math.PI * 2) * radius);
    const z = (Math.cos((date % speed) / speed * Math.PI * 2) * radius);

    return {x, z};
}

//////////////////////////////////////////////////////////////////////////////////
//		Init
//////////////////////////////////////////////////////////////////////////////////

const canvas = document.querySelector('canvas');

// init renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 1)
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// array of functions for the rendering loop
var onRenderFcts = [];

// init scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.z = 50;
var controls = new THREE.OrbitControls(camera)

//////////////////////////////////////////////////////////////////////////////////
//		add an object in the scene
//////////////////////////////////////////////////////////////////////////////////

//object intersected
var INTERSECTED;

// pool of objects which can be selected
var objects = [];

const wireframe = false;

const optionsMainSphere = {
    size: 15,
    radius: 15,
    color: 0x333333
};

const optionsFirstSphere = {
    size: 8,
    radius: 4,
    distance: 25,
    color: 0x333333,
    orbitSpeed: 100000 + Math.random() * 300000
};

const optionsSecondSphere = {
    size: 8,
    radius: 9,
    distance: 57,
    color: 0x333333,
    orbitSpeed: 100000 + Math.random() * 300000
};

const optionsThirdSphere = {
    size: 8,
    radius: 5,
    distance: 35,
    color: 0x333333,
    orbitSpeed: 10000 + Math.random() * 3000
};

// add a main sphere
const mainSphereGeometry = new THREE.SphereGeometry(optionsMainSphere.radius, optionsMainSphere.size, optionsMainSphere.size);
const mainSphereMaterial = new THREE.MeshBasicMaterial({color: optionsMainSphere.color, wireframe});
const mainSphere = new THREE.Mesh(mainSphereGeometry, mainSphereMaterial);
mainSphere.position.set(0, 0, 0);

objects.push(mainSphere);
scene.add(mainSphere);

// add a first sphere
const firstSphereGeometry = new THREE.SphereGeometry(optionsFirstSphere.radius, optionsFirstSphere.size, optionsFirstSphere.size);
const firstSphereMaterial = new THREE.MeshBasicMaterial({color: optionsFirstSphere.color, wireframe});
const firstSphere = new THREE.Mesh(firstSphereGeometry, firstSphereMaterial);
firstSphere.position.set(optionsFirstSphere.distance, 0, 0);

objects.push(firstSphere);

// add a second sphere
const secondSphereGeometry = new THREE.SphereGeometry(optionsSecondSphere.radius, optionsSecondSphere.size, optionsSecondSphere.size);
const secondSphereMaterial = new THREE.MeshBasicMaterial({color: optionsSecondSphere.color, wireframe});
const secondSphere = new THREE.Mesh(secondSphereGeometry, secondSphereMaterial);
secondSphere.position.set(optionsSecondSphere.distance, 0, 0);

objects.push(secondSphere);

// add a third sphere
const thirdSphereGeometry = new THREE.SphereGeometry(optionsThirdSphere.radius, optionsThirdSphere.size, optionsThirdSphere.size);
const thirdSphereMaterial = new THREE.MeshBasicMaterial({color: optionsThirdSphere.color, wireframe});
const thirdSphere = new THREE.Mesh(thirdSphereGeometry, thirdSphereMaterial);
thirdSphere.position.set(optionsThirdSphere.distance, 0, 0);

objects.push(thirdSphere);

setTimeout(() => {
    scene.add(firstSphere);
    scene.add(secondSphere);
    scene.add(thirdSphere);
}, 1 / 60);

const interval = setInterval(() => {
    let x, z;

    const firstSphereOrbit = orbitCalculation(optionsFirstSphere.distance, {speed: optionsFirstSphere.orbitSpeed});
    x = firstSphereOrbit.x;
    z = firstSphereOrbit.z;
    firstSphere.position.set(x, 0, z);

    const secondSphereOrbit = orbitCalculation(optionsSecondSphere.distance, {speed: optionsSecondSphere.orbitSpeed});
    x = secondSphereOrbit.x;
    z = secondSphereOrbit.z;
    secondSphere.position.set(x, 0, z);

    const thirdSphereOrbit = orbitCalculation(optionsThirdSphere.distance, {speed: optionsThirdSphere.orbitSpeed});
    x = thirdSphereOrbit.x;
    z = thirdSphereOrbit.z;
    thirdSphere.position.set(x, z, 0);
}, 1 / 60);

//////////////////////////////////////////////////////////////////////////////////
//		render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);

// handle window resize
window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}, false)

// render the scene

let selectedEntity = undefined;

onRenderFcts.push(function () {
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // all intersects
    var intersects = raycaster.intersectObjects(objects, true);

    if (intersects.length > 0) {
        if (INTERSECTED !== intersects[0].object) {
            //if new item selected swap color of new item
            //& revert color of previous item
            if (INTERSECTED)
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xff0000);

        }
    } else {
        // None selected then revert color of previous item
        if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;
    }

    console.log(selectedEntity);

    renderer.render(scene, camera);
});

// run the rendering loop
var lastTimeMsec = null
requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    requestAnimationFrame(animate);
    // measure time

    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;

    const deltaMsec = Math.min(200, nowMsec - lastTimeMsec);

    lastTimeMsec = nowMsec

    // call each update function
    onRenderFcts.forEach(function (onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
    });
})

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove);
