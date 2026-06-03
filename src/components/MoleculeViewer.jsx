import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getElementConfig, getScaledRadius } from '../utils/elementColors';

/**
 * MoleculeViewer Component
 * High-fidelity 3D molecular visualization using Three.js
 * Features:
 * - CPK color scheme for elements
 * - Proper atomic radius scaling
 * - Interactive controls (rotate, zoom, pan)
 * - Atom selection with details
 * - Auto-centering and fitting
 */
const MoleculeViewer = ({ moleculeData, onAtomSelect, onAtomDeselect }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const moleculeGroupRef = useRef(null);
  const atomMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = -15;
    scene.add(gridHelper);

    // Molecule group
    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    moleculeGroupRef.current = moleculeGroup;

    // Simple orbit controls
    const controls = {
      autoRotate: false,
      autoRotateSpeed: 2,
      enableZoom: true,
      enablePan: true,
    };
    controlsRef.current = controls;

    // Mouse interaction
    const onMouseClick = (event) => {
      if (!moleculeGroupRef.current || atomMeshesRef.current.length === 0) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(atomMeshesRef.current);

      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        const atomData = selectedMesh.userData;
        onAtomSelect(atomData);
      } else {
        onAtomDeselect();
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Mouse wheel zoom
    const onMouseWheel = (event) => {
      event.preventDefault();
      const zoomSpeed = 2;
      const direction = event.deltaY > 0 ? 1 : -1;
      camera.position.z += direction * zoomSpeed;
      camera.position.z = Math.max(5, Math.min(200, camera.position.z));
    };

    renderer.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

    // Mouse drag for rotation and pan
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      if (e.button === 0) {
        // Left button: rotate
        const rotationSpeed = 0.01;
        moleculeGroup.rotation.y += deltaX * rotationSpeed;
        moleculeGroup.rotation.x += deltaY * rotationSpeed;
      } else if (e.button === 2) {
        // Right button: pan
        const panSpeed = 0.1;
        camera.position.x -= deltaX * panSpeed;
        camera.position.y += deltaY * panSpeed;
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Handle window resize
    const onWindowResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onWindowResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controls.autoRotate && moleculeGroup) {
        moleculeGroup.rotation.y += controls.autoRotateSpeed * 0.001;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('wheel', onMouseWheel);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [onAtomSelect, onAtomDeselect]);

  // Render molecule when data changes
  useEffect(() => {
    if (!moleculeData || !moleculeGroupRef.current) return;

    setIsLoading(true);

    // Clear previous molecule
    while (moleculeGroupRef.current.children.length > 0) {
      moleculeGroupRef.current.removeChild(moleculeGroupRef.current.children[0]);
    }
    atomMeshesRef.current = [];

    try {
      // Create atoms
      const atoms = moleculeData.atoms || [];
      const atomMeshMap = {};

      atoms.forEach((atom) => {
        const config = getElementConfig(atom.element);
        const radius = getScaledRadius(atom.element, 0.4);

        // Create sphere geometry for atom
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: config.color,
          shininess: 100,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(atom.x || 0, atom.y || 0, atom.z || 0);
        mesh.userData = {
          id: atom.id,
          element: atom.element,
          atomicNumber: config.atomicNumber,
          mass: config.mass,
          charge: atom.charge || 0,
          x: atom.x || 0,
          y: atom.y || 0,
          z: atom.z || 0,
        };

        moleculeGroupRef.current.add(mesh);
        atomMeshesRef.current.push(mesh);
        atomMeshMap[atom.id] = mesh;
      });

      // Create bonds
      const bonds = moleculeData.bonds || [];
      bonds.forEach((bond) => {
        const fromAtom = atoms.find((a) => a.id === bond.from);
        const toAtom = atoms.find((a) => a.id === bond.to);

        if (fromAtom && toAtom) {
          const start = new THREE.Vector3(fromAtom.x || 0, fromAtom.y || 0, fromAtom.z || 0);
          const end = new THREE.Vector3(toAtom.x || 0, toAtom.y || 0, toAtom.z || 0);
          const distance = start.distanceTo(end);

          // Create cylinder for bond
          const geometry = new THREE.CylinderGeometry(0.15, 0.15, distance, 16);
          const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
          const cylinder = new THREE.Mesh(geometry, material);

          // Position and orient cylinder
          const midpoint = start.clone().add(end).multiplyScalar(0.5);
          cylinder.position.copy(midpoint);

          const direction = end.clone().sub(start).normalize();
          const axis = new THREE.Vector3(0, 1, 0);
          const quaternion = new THREE.Quaternion();
          quaternion.setFromUnitVectors(axis, direction);
          cylinder.quaternion.copy(quaternion);

          moleculeGroupRef.current.add(cylinder);
        }
      });

      // Auto-center and fit
      const box = new THREE.Box3().setFromObject(moleculeGroupRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      moleculeGroupRef.current.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5;

      cameraRef.current.position.z = cameraZ;
      cameraRef.current.lookAt(moleculeGroupRef.current.position);

      setIsLoading(false);
    } catch (error) {
      console.error('Error rendering molecule:', error);
      setIsLoading(false);
    }
  }, [moleculeData]);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-700 font-semibold">Rendering molecule...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoleculeViewer;
