/* =========================================================
           YEAR
========================================================= */

document.getElementById("year").textContent = new Date().getFullYear();

/* =========================================================
           REVEAL ON SCROLL
        ========================================================= */

const revealEls = document.querySelectorAll(".reveal");

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  {
    threshold: 0.12,
  },
);

revealEls.forEach((el) => io.observe(el));

/* =========================================================
           THREE.JS HERO
        ========================================================= */

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const canvas = document.getElementById("hero-canvas");

const heroEl = document.getElementById("hero");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  heroEl.clientWidth / heroEl.clientHeight,
  0.1,
  100,
);

camera.position.set(0, 0, 13);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setSize(heroEl.clientWidth, heroEl.clientHeight);

/* =========================================================
           CIRCUIT GROUP
        ========================================================= */

const group = new THREE.Group();

scene.add(group);

const isSmall = window.innerWidth < 640;

const gridCount = isSmall ? 5 : 7;

const spacing = 2.6;

const nodes = [];

const half = (gridCount - 1) / 2;

/* =========================================================
           CREATE NODES
        ========================================================= */

for (let x = 0; x < gridCount; x++) {
  for (let y = 0; y < gridCount; y++) {
    for (let z = 0; z < 2; z++) {
      if (Math.random() > 0.55) continue;

      const px = (x - half) * spacing + (Math.random() - 0.5) * 0.6;

      const py = (y - half) * spacing + (Math.random() - 0.5) * 0.6;

      const pz = (z - 0.5) * 3 + (Math.random() - 0.5) * 0.6;

      nodes.push(new THREE.Vector3(px, py, pz));
    }
  }
}

/* =========================================================
           NODE POINTS
        ========================================================= */

const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodes);

const nodeMat = new THREE.PointsMaterial({
  color: 0xc17a42,

  size: 0.11,

  transparent: true,

  opacity: 0.9,

  blending: THREE.AdditiveBlending,

  depthWrite: false,
});

const pointCloud = new THREE.Points(nodeGeo, nodeMat);

group.add(pointCloud);

/* =========================================================
           TRACE LINES
        ========================================================= */

const maxDist = spacing * 1.15;

const linePositions = [];

for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    if (nodes[i].distanceTo(nodes[j]) < maxDist) {
      linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);

      linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
    }
  }
}

const lineGeo = new THREE.BufferGeometry();

lineGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(linePositions, 3),
);

const lineMat = new THREE.LineBasicMaterial({
  color: 0x49d998,

  transparent: true,

  opacity: 0.22,

  blending: THREE.AdditiveBlending,
});

const traces = new THREE.LineSegments(lineGeo, lineMat);

group.add(traces);

/* =========================================================
           SIGNAL PULSES
        ========================================================= */

const pulseCount = Math.min(7, nodes.length);

const pulseIndices = [];

while (pulseIndices.length < pulseCount) {
  const idx = Math.floor(Math.random() * nodes.length);

  if (!pulseIndices.includes(idx)) {
    pulseIndices.push(idx);
  }
}

const pulseGeo = new THREE.BufferGeometry().setFromPoints(
  pulseIndices.map((i) => nodes[i]),
);

const pulseMat = new THREE.PointsMaterial({
  color: 0x49d998,

  size: 0.17,

  transparent: true,

  opacity: 1,

  blending: THREE.AdditiveBlending,

  depthWrite: false,
});

const pulsePoints = new THREE.Points(pulseGeo, pulseMat);

group.add(pulsePoints);

/* =========================================================
           INITIAL ROTATION
        ========================================================= */

group.rotation.set(-0.25, -0.4, 0.08);

let targetRotX = group.rotation.x;

let targetRotY = group.rotation.y;

const baseRotX = group.rotation.x;

const baseRotY = group.rotation.y;

/* =========================================================
           MOUSE INTERACTION
        ========================================================= */

window.addEventListener("mousemove", (event) => {
  if (window.innerWidth < 700) return;

  const nx = event.clientX / window.innerWidth - 0.5;

  const ny = event.clientY / window.innerHeight - 0.5;

  targetRotY = baseRotY + nx * 0.5;

  targetRotX = baseRotX - ny * 0.3;
});

/* =========================================================
           RESIZE
        ========================================================= */

function onResize() {
  const w = heroEl.clientWidth;

  const h = heroEl.clientHeight;

  camera.aspect = w / h;

  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
}

window.addEventListener("resize", onResize);

/* =========================================================
           ANIMATION
        ========================================================= */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (!reduceMotion) {
    group.rotation.x += (targetRotX - group.rotation.x) * 0.03;

    group.rotation.y += (targetRotY - group.rotation.y) * 0.03;

    group.rotation.y += 0.0009;

    pulseMat.opacity = 0.55 + Math.sin(t * 2.2) * 0.45;

    nodeMat.opacity = 0.75 + Math.sin(t * 0.8) * 0.15;
  }

  renderer.render(scene, camera);
}

animate();
