import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import styles from "./InteractiveMap3D.module.css";
import ReactDOM from "react-dom";

// Configuration constants
const CONSTANTS = {
  // Number of planets (used as fallback if no data is provided)
  PLANET_COUNT: 20,

  // Sizes
  STAR_SIZE: 2,
  PLANET_SIZE: 0.7,

  // Distribution
  MIN_ORBIT_RADIUS: 6,
  MAX_ORBIT_RADIUS: 15,

  // Lighting
  AMBIENT_LIGHT_INTENSITY: 0.15, // Reduced for more contrast
  DIRECTIONAL_LIGHT_INTENSITY: 1.4, // Increased for stronger shadows
  LIGHT_POSITION: { x: 15, y: 15, z: 15 },

  // Material properties
  STAR_OPACITY: 0.8,
  GLASS_PROPERTIES: {
    roughness: 0.05, // Smoother surfaces for better reflections
    transmission: 0.2, // Slightly more transparent
    thickness: 2.0, // Increased thickness for better refraction
    metalness: 0.25, // Slightly more metallic for better highlights
    clearcoat: 0.8, // Increased for better surface highlights
    clearcoatRoughness: 0.02, // Smoother clearcoat
  },

  FOG: {
    enabled: true,
    density: 0.008, // Subtle fog
    color: "#000020", // Very dark blue
  },

  // Starfield background
  BACKGROUND_STARS: 2000,
  BACKGROUND_STAR_MIN_DISTANCE: 110, // Increased beyond MAX_DISTANCE
  BACKGROUND_STAR_MAX_DISTANCE: 200, // Increased for better depth perception

  // Camera settings
  CAMERA: {
    PAN_SPEED: 0.03,
    ZOOM_SPEED: 0.1,
    MIN_DISTANCE: 5,
    MAX_DISTANCE: 100,
    DEFAULT_POSITION: { x: 0, y: 5, z: 20 },
    ANIMATION_DURATION: 1000,
  },

  VISUAL_GUIDES: {
    showOrbitalRings: true,
    orbitalRingOpacity: 0.15,
    gradientBackground: true,
  },

  // Connection tubes
  TUBE_RADIUS: 0.1,
  TUBE_SEGMENTS: 16,
  TUBE_OPACITY: 0.5,
};
/**
 * InteractiveMap3D Component
 * @param {Object} props - Component props
 * @param {Array} [props.data] - Optional array of objects to display as planets
 *   Each object should have at least:
 *   - id: Unique identifier
 *   - name: Display name for the planet
 *   - details: Description text or additional information
 *   - Optional: orbit, color, size, or any other custom properties
 * @param {string} [props.backgroundColor] - Optional background color override
 * @param {boolean} [props.transparentBackground] - Set to true for transparent background
 * @param {boolean} [props.pulse] - Enable glittering/pulsing effect on planets
 * @param {string} [props.pulseColor] - Color for pulse effect (default: var(--brand-color))
 * @param {number} [props.pulseDuration] - Duration of pulse effect in ms (default: 2000)
 * @param {number} [props.initialZoom] - Initial zoom level (default: calculated optimal distance)
 * @param {number} [props.minZoom] - Minimum zoom level (default: 5)
 * @param {number} [props.maxZoom] - Maximum zoom level (default: 100)
 * @param {Function} [props.renderModalContent] - Optional function to render custom modal content
 *   This function receives: { planetId, data } and should return JSX
 * @param {boolean} [props.draggable=true] - Whether the modal should be draggable
 */
const InteractiveMap3D = ({
  data,
  backgroundColor,
  transparentBackground,
  pulse = false,
  pulseColor,
  pulseDuration = 2000,
  initialZoom,
  minZoom = 5,
  maxZoom = 100,
  rotationAxisX = 0, // X-axis rotation angle in degrees
  rotationAxisY = 0, // Y-axis rotation angle in degrees
  rotationAxisZ = 0, // Z-axis rotation angle in degrees
  renderModalContent, // Changed from customModal to renderModalContent
  draggable = true, // Whether the modal should be draggable
  lockZoom = false, // New prop: Whether to disable user zooming
}) => {
  // Scene references
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);
  const starRef = useRef(null);
  const planetsRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouse2DRef = useRef(new THREE.Vector2());
  const eventHandlersRef = useRef({});

  // Interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const distanceRef = useRef(CONSTANTS.CAMERA.DEFAULT_POSITION.z);
  const inspectedPlanetRef = useRef(null);
  const cameraPositionRef = useRef({
    x: CONSTANTS.CAMERA.DEFAULT_POSITION.x,
    y: CONSTANTS.CAMERA.DEFAULT_POSITION.y,
    z: CONSTANTS.CAMERA.DEFAULT_POSITION.z,
  });
  const isPlanetAnimationPausedRef = useRef(false);

  // Glittering/pulsing effect timer - moved to component level
  const pulseTimerRef = useRef(null);

  // UI state
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    planetId: null,
    position: { x: 0, y: 0 },
    data: {},
  });

  // Helper: Trigger a glow effect on the planet.
  const triggerPlanetGlow = (planetObj, customDuration) => {
    const material = planetObj.mesh.material;

    // Ensure we have the original color stored
    if (!planetObj.originalColor) {
      planetObj.originalColor = material.color.clone();
    }
    const originalColor = planetObj.originalColor;

    // Get pulse color from prop or default to brand color
    let glowColor;
    if (pulseColor) {
      glowColor = new THREE.Color(cssColorToHex(pulseColor));
    } else {
      let brandColor = getCssVariableValue("--brand-color");
      glowColor = new THREE.Color(cssColorToHex(brandColor));
    }

    // Use shorter duration for hover effect - make it snappier
    // If custom duration is provided, use that, otherwise just 400ms for a quick pulse
    const glowDuration = customDuration || 400;
    const startTime = performance.now();

    // Cancel any existing glow animation
    if (planetObj.glowAnimationId) {
      cancelAnimationFrame(planetObj.glowAnimationId);
    }

    // More pronounced but faster glow effect
    const animateGlow = (currentTime) => {
      const elapsed = currentTime - startTime;
      let t = Math.min(elapsed / glowDuration, 1);

      // Faster pulse with quicker falloff
      // Use quadratic ease-out for snappier feel
      let factor = (1 - t) * (1 - t) * 0.8;

      // Apply glow to emissive for light emission effect
      material.emissive = glowColor.clone().multiplyScalar(factor);

      // Slight color shift - reduced for subtlety
      material.color.lerpColors(originalColor, glowColor, factor * 0.3);

      // Add slight scale effect but smaller and quicker
      const scale = 1 + factor * 0.08;
      planetObj.mesh.scale.set(scale, scale, scale);

      if (elapsed < glowDuration) {
        planetObj.glowAnimationId = requestAnimationFrame(animateGlow);
      } else {
        // Reset to original state
        material.emissive.set(0x000000);
        material.color.copy(originalColor);
        planetObj.mesh.scale.set(1, 1, 1);
        planetObj.glowAnimationId = null;
      }
    };

    planetObj.glowAnimationId = requestAnimationFrame(animateGlow);
  };

  // Add this function to calculate optimal camera distance
  const calculateOptimalCameraDistance = () => {
    if (!containerRef.current) return CONSTANTS.CAMERA.DEFAULT_POSITION.z;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const aspect = width / height;

    // Calculate the safe radius (max orbit radius + some padding for planets)
    const safeRadius = CONSTANTS.MAX_ORBIT_RADIUS * 1.2;

    // Calculate distance needed based on field of view (60 degrees)
    // Use the smaller dimension for the calculation to ensure visibility
    const fovRadians = (60 * Math.PI) / 180;
    let distance;

    if (aspect >= 1) {
      // For landscape orientation, height is the limiting factor
      distance = (safeRadius / Math.tan(fovRadians / 2)) * (1 / aspect) * 1.8;
    } else {
      // For portrait orientation, width is the limiting factor
      distance = (safeRadius / Math.tan(fovRadians / 2)) * aspect * 1.8;
    }

    return Math.max(distance, CONSTANTS.CAMERA.MIN_DISTANCE);
  };

  // Helper function to get random point on sphere
  const getRandomPointOnSphere = (radius) => {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
    };
  };

  // Custom easing function
  const easeInOut = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  // Helper function to get CSS variable value
  const getCssVariableValue = (variableName) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  };

  const enhanceDepthPerception = () => {
    // Add stronger fog for depth perception
    // Only add fog if we don't have a transparent background
    if (CONSTANTS.FOG.enabled && !transparentBackground) {
      const fogColor = new THREE.Color(CONSTANTS.FOG.color);
      scene.fog = new THREE.FogExp2(fogColor, CONSTANTS.FOG.density);
    }

    // Add a subtle directional hemisphere light for better top/bottom definition
    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff, // Sky color
      0x303050, // Ground color
      0.3 // Intensity
    );
    scene.add(hemisphereLight);

    // Add a subtle gradient background if enabled
    if (CONSTANTS.VISUAL_GUIDES.gradientBackground) {
      // Create a large sphere as background with inside-facing normals
      const bgGeometry = new THREE.SphereGeometry(90, 32, 32);
      const bgMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color1: { value: new THREE.Color(primaryColor).multiplyScalar(0.7) },
          color2: { value: new THREE.Color("#000000") },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          varying vec2 vUv;
          void main() {
            gl_FragColor = vec4(mix(color2, color1, vUv.y), 1.0);
          }
        `,
        side: THREE.BackSide,
      });
      const background = new THREE.Mesh(bgGeometry, bgMaterial);
      scene.add(background);
    }
  };

  // Helper function to convert CSS color to hex
  const cssColorToHex = (color) => {
    // Create a temporary element to parse the color
    const tempElement = document.createElement("div");
    tempElement.style.color = color;
    document.body.appendChild(tempElement);

    // Get computed color and convert to hex
    const computedColor = getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    // Parse the rgb() or rgba() value
    const rgbMatch = computedColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    return color; // Return original if parsing failed
  };

  // Theme detection effect (runs once and sets up observer)
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDarkTheme(theme === "dark");
    };

    // Initial check
    checkTheme();

    // Set up a mutation observer to watch for attribute changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Function to clean up Three.js resources
  const cleanupThreeJS = () => {
    // Stop animation loop first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Remove event listeners before removing DOM element
    if (rendererRef.current && eventHandlersRef.current) {
      const {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave,
        handleWheel,
      } = eventHandlersRef.current;

      const domElement = rendererRef.current.domElement;
      if (domElement) {
        if (handleMouseDown)
          domElement.removeEventListener("mousedown", handleMouseDown);
        if (handleMouseMove)
          domElement.removeEventListener("mousemove", handleMouseMove);
        if (handleMouseUp)
          domElement.removeEventListener("mouseup", handleMouseUp);
        if (handleMouseLeave)
          domElement.removeEventListener("mouseleave", handleMouseLeave);
        if (handleWheel) domElement.removeEventListener("wheel", handleWheel);
      }
    }

    // Clear all scene objects and dispose of resources
    if (sceneRef.current) {
      while (sceneRef.current.children.length > 0) {
        const object = sceneRef.current.children[0];
        sceneRef.current.remove(object);

        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    }

    // Critical step: Remove WebGL canvas from DOM
    if (containerRef.current) {
      // Remove all child elements to ensure canvas is removed
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }

    // Properly dispose of renderer
    if (rendererRef.current) {
      rendererRef.current.forceContextLoss();
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    // Clear all other references
    sceneRef.current = null;
    cameraRef.current = null;
    starRef.current = null;
    planetsRef.current = [];
  };

  // Setup scene and all related objects
  const setupScene = () => {
    if (!containerRef.current) return;

    console.log("Setting up new scene");

    // Store current camera position if it exists
    if (cameraRef.current) {
      cameraPositionRef.current = {
        x: cameraRef.current.position.x,
        y: cameraRef.current.position.y,
        z: cameraRef.current.position.z,
      };
    }

    // Get container dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    console.log(height);

    // Get CSS variable values for colors
    let primaryColor = getCssVariableValue("--primary-color");
    let complementaryColor = getCssVariableValue("--complementary-color");

    // Convert to hex if necessary
    primaryColor = cssColorToHex(primaryColor);
    complementaryColor = cssColorToHex(complementaryColor);

    // Create scene with appropriate background
    const scene = new THREE.Scene();

    // Check for transparent background first
    if (transparentBackground) {
      // Set background to null for transparency
      scene.background = null;
    } else if (backgroundColor) {
      // Use provided backgroundColor if available
      scene.background = new THREE.Color(cssColorToHex(backgroundColor));
    } else {
      // Default to primaryColor
      scene.background = new THREE.Color(primaryColor);
    }

    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff, // Sky color
      0x303050, // Ground color
      0.3 // Intensity
    );
    scene.add(hemisphereLight);

    if (CONSTANTS.FOG.enabled) {
      const fogColor = new THREE.Color(CONSTANTS.FOG.color);
      scene.fog = new THREE.FogExp2(fogColor, CONSTANTS.FOG.density);
    }

    sceneRef.current = scene;

    // Create camera, either new or restored
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);

    // Calculate optimal distance or use provided initialZoom
    const optimalDistance = initialZoom || calculateOptimalCameraDistance();
    distanceRef.current = optimalDistance;

    // Use stored position but with optimal distance if starting fresh
    if (!cameraRef.current) {
      const defaultDirection = new THREE.Vector3(
        CONSTANTS.CAMERA.DEFAULT_POSITION.x,
        CONSTANTS.CAMERA.DEFAULT_POSITION.y,
        CONSTANTS.CAMERA.DEFAULT_POSITION.z
      ).normalize();

      camera.position.copy(defaultDirection.multiplyScalar(optimalDistance));
      cameraPositionRef.current = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };
    } else {
      camera.position.set(
        cameraPositionRef.current.x,
        cameraPositionRef.current.y,
        cameraPositionRef.current.z
      );
    }

    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer with alpha option for transparency if needed
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: transparentBackground, // Enable alpha channel for transparent background
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add enhanced lighting for better depth perception
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      CONSTANTS.AMBIENT_LIGHT_INTENSITY
    );
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      CONSTANTS.DIRECTIONAL_LIGHT_INTENSITY
    );
    directionalLight.position.set(
      CONSTANTS.LIGHT_POSITION.x,
      CONSTANTS.LIGHT_POSITION.y,
      CONSTANTS.LIGHT_POSITION.z
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.001;
    scene.add(directionalLight);

    // Add a secondary rim light from opposite direction for better volume
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(
      -CONSTANTS.LIGHT_POSITION.x,
      -CONSTANTS.LIGHT_POSITION.y,
      -CONSTANTS.LIGHT_POSITION.z
    );
    scene.add(rimLight);

    // Create starfield background for depth reference
    createStarfieldBackground();

    // Create central star and planets with complementary color
    createSceneObjects(complementaryColor);

    // Function to animate camera to target position
    const animateCameraToPosition = (
      targetPosition,
      duration = CONSTANTS.CAMERA.ANIMATION_DURATION,
      lookAtTarget = new THREE.Vector3(0, 0, 0) // Default to looking at origin
    ) => {
      const startPosition = camera.position.clone();
      const startTime = Date.now();
      const startLookAt = inspectedPlanetRef.current
        ? inspectedPlanetRef.current.position.clone()
        : new THREE.Vector3(0, 0, 0);

      const animateFrame = () => {
        const currentTime = Date.now();

        // Calculate progress (0 to 1)
        let progress = (currentTime - startTime) / duration;
        progress = Math.min(progress, 1.0); // Clamp to 1

        // Apply easing
        const easedProgress = easeInOut(progress);

        // Interpolate position
        camera.position.x =
          startPosition.x +
          (targetPosition.x - startPosition.x) * easedProgress;
        camera.position.y =
          startPosition.y +
          (targetPosition.y - startPosition.y) * easedProgress;
        camera.position.z =
          startPosition.z +
          (targetPosition.z - startPosition.z) * easedProgress;

        // Interpolate lookAt target from center to planet
        const currentLookAt = new THREE.Vector3(
          startLookAt.x + (lookAtTarget.x - startLookAt.x) * easedProgress,
          startLookAt.y + (lookAtTarget.y - startLookAt.y) * easedProgress,
          startLookAt.z + (lookAtTarget.z - startLookAt.z) * easedProgress
        );

        camera.lookAt(currentLookAt);

        // Continue animation if not finished
        if (progress < 1.0) {
          requestAnimationFrame(animateFrame);
        }
      };

      requestAnimationFrame(animateFrame);
    };

    // Reset camera to default position
    const resetCameraView = () => {
      if (inspectedPlanetRef.current) {
        animateCameraReset();
      } else {
        // Just reset the animation if no planet is inspected
        isPlanetAnimationPausedRef.current = false;

        animateCameraToPosition({
          x: CONSTANTS.CAMERA.DEFAULT_POSITION.x,
          y: CONSTANTS.CAMERA.DEFAULT_POSITION.y,
          z: CONSTANTS.CAMERA.DEFAULT_POSITION.z,
        });

        distanceRef.current = CONSTANTS.CAMERA.DEFAULT_POSITION.z;
      }
    };

    // Add this hook to your codebase, for custom modals to use
    const useDraggableModal = (initialPosition, isDraggable = true) => {
      const modalRef = useRef(null);

      // Position modal initially
      useEffect(() => {
        if (!modalRef.current || !initialPosition) return;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Get modal dimensions
        const modalWidth = modalRef.current.offsetWidth;
        const modalHeight = modalRef.current.offsetHeight;

        // Calculate position that keeps modal fully in viewport
        let left = initialPosition.x;
        let top = initialPosition.y;

        // Adjust if modal would go off edges
        if (left + modalWidth > viewportWidth - 20) {
          left = viewportWidth - modalWidth - 20;
        }

        if (top + modalHeight > viewportHeight - 20) {
          top = viewportHeight - modalHeight - 20;
        }

        // Ensure modal stays within boundaries
        left = Math.max(20, left);
        top = Math.max(20, top);

        // Position modal
        modalRef.current.style.position = "fixed";
        modalRef.current.style.left = `${left}px`;
        modalRef.current.style.top = `${top}px`;
        modalRef.current.style.right = "auto";
      }, [initialPosition]);

      // Setup dragging behavior
      useEffect(() => {
        if (!modalRef.current || !isDraggable) return;

        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let rafId = null;

        // Helper to add CSS class
        const addDraggingClass = () => {
          modalRef.current.classList.add("modalDragging");
        };

        // Helper to remove CSS class
        const removeDraggingClass = () => {
          modalRef.current.classList.remove("modalDragging");
        };

        const moveModal = (x, y) => {
          if (rafId) cancelAnimationFrame(rafId);

          rafId = requestAnimationFrame(() => {
            if (!modalRef.current) return;
            modalRef.current.style.left = `${startLeft + (x - startX)}px`;
            modalRef.current.style.top = `${startTop + (y - startY)}px`;
            modalRef.current.style.right = "auto";
            rafId = null;
          });
        };

        const onMouseDown = (e) => {
          if (!modalRef.current) return;
          e.preventDefault();

          // Get current position
          const rect = modalRef.current.getBoundingClientRect();

          // Add class to disable transitions
          addDraggingClass();

          // Set explicit left position
          modalRef.current.style.left = `${rect.left}px`;
          modalRef.current.style.right = "auto";

          startLeft = rect.left;
          startTop = rect.top;
          startX = e.clientX;
          startY = e.clientY;
          isDragging = true;

          document.addEventListener("mousemove", onMouseMove, {
            passive: true,
          });
          document.addEventListener("mouseup", onMouseUp, { passive: true });
        };

        const onMouseMove = (e) => {
          if (!isDragging) return;
          moveModal(e.clientX, e.clientY);
        };

        const onMouseUp = () => {
          isDragging = false;
          removeDraggingClass();
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        // Touch event handlers
        const onTouchStart = (e) => {
          if (!modalRef.current || e.touches.length !== 1) return;
          e.preventDefault();

          const rect = modalRef.current.getBoundingClientRect();
          addDraggingClass();

          modalRef.current.style.left = `${rect.left}px`;
          modalRef.current.style.right = "auto";

          startLeft = rect.left;
          startTop = rect.top;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          isDragging = true;

          document.addEventListener("touchmove", onTouchMove, {
            passive: false,
          });
          document.addEventListener("touchend", onTouchEnd, { passive: true });
        };

        const onTouchMove = (e) => {
          if (!isDragging || e.touches.length !== 1) return;
          e.preventDefault();
          moveModal(e.touches[0].clientX, e.touches[0].clientY);
        };

        const onTouchEnd = () => {
          isDragging = false;
          removeDraggingClass();
          document.removeEventListener("touchmove", onTouchMove);
          document.removeEventListener("touchend", onTouchEnd);
        };

        // Find drag handles within the modal
        const getDragHandles = () => {
          const header = modalRef.current.querySelector(
            "[data-draggable='header']"
          );
          const handles = modalRef.current.querySelectorAll(
            "[data-draggable='handle']"
          );
          return [header, ...handles].filter((el) => el);
        };

        // Add event listeners to drag handles
        const dragHandles = getDragHandles();

        // If no specific drag handles found, make the whole modal draggable
        if (dragHandles.length === 0) {
          modalRef.current.addEventListener("mousedown", onMouseDown);
          modalRef.current.addEventListener("touchstart", onTouchStart, {
            passive: false,
          });
        } else {
          dragHandles.forEach((handle) => {
            handle.addEventListener("mousedown", onMouseDown);
            handle.addEventListener("touchstart", onTouchStart, {
              passive: false,
            });
          });
        }

        return () => {
          if (rafId) cancelAnimationFrame(rafId);

          if (dragHandles.length === 0) {
            modalRef.current?.removeEventListener("mousedown", onMouseDown);
            modalRef.current?.removeEventListener("touchstart", onTouchStart);
          } else {
            dragHandles.forEach((handle) => {
              handle?.removeEventListener("mousedown", onMouseDown);
              handle?.removeEventListener("touchstart", onTouchStart);
            });
          }

          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("touchmove", onTouchMove);
          document.removeEventListener("touchend", onTouchEnd);
        };
      }, [isDraggable]);

      return modalRef;
    };

    // Handle planet click
    const handlePlanetClick = (event) => {
      if (isDraggingRef.current) return; // Don't process clicks while dragging

      // Calculate normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse2DRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2DRef.current.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(mouse2DRef.current, camera);

      // Find intersections with planets
      const intersects = raycasterRef.current.intersectObjects(
        planetsRef.current.map((p) => p.mesh),
        false // Don't check descendants
      );

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const planetData = planetsRef.current.find(
          (p) => p.mesh.uuid === clickedObject.uuid
        );
        if (!planetData) return;

        // Pause planet animation
        isPlanetAnimationPausedRef.current = true;

        // Capture the current lookAt target BEFORE updating the inspected planet.
        const previousLookAt = inspectedPlanetRef.current
          ? inspectedPlanetRef.current.position.clone()
          : new THREE.Vector3(0, 0, 0);

        // Now update the inspected planet to the clicked one.
        inspectedPlanetRef.current = clickedObject;
        const planetPosition = clickedObject.position.clone();

        // Determine the target camera position (existing logic)
        let targetPosition;
        const currentToPlanet = new THREE.Vector3().subVectors(
          planetPosition,
          camera.position
        );
        const distanceToPlanet = currentToPlanet.length();
        const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
        const dotProduct = cameraDirection.dot(
          currentToPlanet.clone().normalize()
        );

        if (dotProduct > 0.7) {
          targetPosition = camera.position.clone().add(
            currentToPlanet
              .clone()
              .normalize()
              .multiplyScalar(distanceToPlanet - 6)
          );
        } else {
          const currentSpherical = new THREE.Spherical().setFromVector3(
            camera.position
          );
          const planetSpherical = new THREE.Spherical().setFromVector3(
            planetPosition
          );
          const newSpherical = new THREE.Spherical(
            6, // Fixed distance from planet
            planetSpherical.phi + 0.2, // Slightly above planet
            currentSpherical.theta
          );
          const idealPosition = new THREE.Vector3().setFromSpherical(
            newSpherical
          );
          targetPosition = new THREE.Vector3().addVectors(
            planetPosition,
            idealPosition
          );
        }

        // Define a natural easing function.
        const naturalEasing = (t) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // Smooth camera animation from previousLookAt to the new planet.
        const animateCameraSmooth = () => {
          const startPosition = camera.position.clone();
          // Use the captured previous lookAt as the start.
          const startLookAt = previousLookAt;
          const startTime = Date.now();
          const duration = CONSTANTS.CAMERA.ANIMATION_DURATION;

          const animateFrame = () => {
            const currentTime = Date.now();
            let progress = (currentTime - startTime) / duration;
            progress = Math.min(progress, 1.0);
            const easedProgress = naturalEasing(progress);

            // Interpolate camera position
            camera.position.lerpVectors(
              startPosition,
              targetPosition,
              easedProgress
            );
            // Smoothly interpolate the lookAt target from the previous planet to the new one.
            const currentLookAt = new THREE.Vector3().lerpVectors(
              startLookAt,
              planetPosition,
              easedProgress
            );
            camera.lookAt(currentLookAt);

            if (progress < 1.0) {
              requestAnimationFrame(animateFrame);
            }
          };

          requestAnimationFrame(animateFrame);
        };

        animateCameraSmooth();

        // Show the modal after the animation completes.
        // Show the modal after the animation completes.
        // Store the cursor position for modal placement
        const cursorPosition = {
          x: event.clientX,
          y: event.clientY,
        };

        // Show the modal after the animation completes.
        setTimeout(() => {
          setModalInfo({
            planetId: clickedObject.userData.id,
            position: cursorPosition, // Add cursor position
            data: clickedObject.userData.data,
          });
          setShowModal(true);
        }, CONSTANTS.CAMERA.ANIMATION_DURATION);
      } else {
        setShowModal(false);

        if (inspectedPlanetRef.current) {
          animateCameraReset();
        }
      }
    };

    // Handle mouse interaction for panning
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      // Always update the mouse position for hover detection
      const rect = renderer.domElement.getBoundingClientRect();
      mouse2DRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2DRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current) {
        // Calculate movement delta
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        // Use spherical coordinates for smoother camera control
        const panSpeed = CONSTANTS.CAMERA.PAN_SPEED;

        if (inspectedPlanetRef.current === null) {
          // Only allow panning when not inspecting a planet

          // Convert camera position to spherical coordinates
          const radius = camera.position.length();
          const spherical = new THREE.Spherical().setFromVector3(
            camera.position
          );

          // Apply rotation in spherical space (with vertical angle limits to prevent flipping)
          spherical.phi = Math.max(
            0.1,
            Math.min(Math.PI - 0.1, spherical.phi + deltaY * panSpeed)
          );
          spherical.theta += deltaX * panSpeed;

          // Convert back to Cartesian coordinates
          camera.position.setFromSpherical(spherical);

          // Maintain the original distance
          camera.position.normalize().multiplyScalar(radius);

          // Update camera position reference
          cameraPositionRef.current = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
          };

          // Keep camera looking at the center
          camera.lookAt(0, 0, 0);
        }

        // Update previous position
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e) => {
      // Calculate if it was a short click/drag
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Reset dragging state first
      const wasDragging = isDraggingRef.current;
      isDraggingRef.current = false;

      // If it was a short click, handle it as a planet click
      if (wasDragging && distance < 5) {
        handlePlanetClick(e);
      }
    };

    const handleMouseLeave = (e) => {
      isDraggingRef.current = false;
    };

    // Handle zooming with mouse wheel
    const handleWheel = (e) => {
      a;
      if (lockZoom) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      // Zoom speed factor
      const zoomSpeed = CONSTANTS.CAMERA.ZOOM_SPEED;

      // Calculate zoom direction
      const zoomDelta = e.deltaY * zoomSpeed;

      // Calculate new distance
      let newDistance = distanceRef.current + zoomDelta;

      // Apply constraints (use props values if provided)
      newDistance = Math.max(minZoom, Math.min(maxZoom, newDistance));

      // Update camera position
      const direction = camera.position.clone().normalize();
      camera.position.copy(direction.multiplyScalar(newDistance));

      // Update camera position reference
      cameraPositionRef.current = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      };

      // Update distance ref
      distanceRef.current = newDistance;
    };

    // Store handlers for cleanup
    eventHandlersRef.current = {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
      handleWheel,
    };

    // Add event listeners
    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("mouseleave", handleMouseLeave);
    
    if (!lockZoom) {
      renderer.domElement.addEventListener("wheel", handleWheel, {
        passive: false,
      });
    }

    // Handle window resize
    // Enhanced resize handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Update camera and renderer
      cameraRef.current.aspect = width / height;

      // Calculate new optimal distance
      const optimalDistance = calculateOptimalCameraDistance();

      // Only update position if not currently inspecting a planet
      if (!inspectedPlanetRef.current) {
        // Maintain camera direction but adjust distance
        const direction = cameraRef.current.position.clone().normalize();
        cameraRef.current.position.copy(
          direction.multiplyScalar(optimalDistance)
        );
        distanceRef.current = optimalDistance;

        // Update stored position reference
        cameraPositionRef.current = {
          x: cameraRef.current.position.x,
          y: cameraRef.current.position.y,
          z: cameraRef.current.position.z,
        };
      }

      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      if (
        !planetsRef.current ||
        !sceneRef.current ||
        !cameraRef.current ||
        !rendererRef.current
      )
        return;

      const time = Date.now() * 0.001;

      const directionalLights = sceneRef.current.children.filter(
        (child) => child instanceof THREE.DirectionalLight
      );

      if (directionalLights.length > 0) {
        // Add subtle movement to the main light for dynamic shadows
        const sinTime = Math.sin(time * 0.2) * 2;
        const cosTime = Math.cos(time * 0.2) * 2;

        directionalLights[0].position.set(
          CONSTANTS.LIGHT_POSITION.x + sinTime,
          CONSTANTS.LIGHT_POSITION.y,
          CONSTANTS.LIGHT_POSITION.z + cosTime
        );
      }

      // Handle planet hover detection and update positions
      if (!isPlanetAnimationPausedRef.current) {
        // Update raycaster for hover detection
        if (cameraRef.current) {
          raycasterRef.current.setFromCamera(
            mouse2DRef.current,
            cameraRef.current
          );
          const intersects = raycasterRef.current.intersectObjects(
            planetsRef.current.map((p) => p.mesh)
          );

          // Track which planets are being hovered
          planetsRef.current.forEach((planet) => {
            const wasHovered = planet.isHovered;
            // Check if this planet is currently being hovered
            const isHovered =
              intersects.length > 0 &&
              intersects[0].object.uuid === planet.mesh.uuid;

            // Update hover state
            planet.isHovered = isHovered;

            // Trigger hover animation if state changed - make it snappier
            if (isHovered && !wasHovered && pulse) {
              // Use a short duration for hover effect (300ms)
              triggerPlanetGlow(planet, 300);
            }
          });
        }

        // Update planet positions with stable orbital motion
        planetsRef.current.forEach((planet) => {
          if (!planet.isSpringing && !isPlanetAnimationPausedRef.current) {
            // Using actual time for consistent speed
            const currentTime = performance.now() / 1000;

            // Ensure we have initialAngle and orbitRadius from animation phase
            // These should already be set by animatePlanet but double-check
            if (
              planet.initialAngle === undefined ||
              planet.orbitRadius === undefined
            ) {
              const currentPos = planet.mesh.position;
              planet.orbitRadius = Math.sqrt(
                currentPos.x * currentPos.x + currentPos.z * currentPos.z
              );
              planet.initialAngle = Math.atan2(currentPos.z, currentPos.x);
            }

            // Use the springEndTime as the beginning of the orbit
            // This ensures consistent motion and prevents jitter
            const orbitStartTime = planet.springEndTime / 1000;
            const orbitElapsedTime = currentTime - orbitStartTime;

            // Calculate angle based on elapsed time since spring animation ended
            // Keep the initial angle consistent to prevent jumps
            const rotationAngle = orbitElapsedTime * planet.rotationSpeed * 0.1;
            const angle = planet.initialAngle + rotationAngle;

            // Calculate new position using exact trig functions
            // Use the stored orbit radius for consistency
            const newPosition = new THREE.Vector3(
              Math.cos(angle) * planet.orbitRadius,
              planet.initialPosition.y, // maintain y position
              Math.sin(angle) * planet.orbitRadius
            );

            planet.mesh.position.copy(newPosition);

            // Update the line to follow the planet
            planet.tube.geometry.setFromPoints([
              new THREE.Vector3(0, 0, 0),
              newPosition,
            ]);
          }
        });
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animate();

    // Return cleanup function for window resize and pulse timer
    return () => {
      window.removeEventListener("resize", handleResize);

      // Clear pulse timer if it exists
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  };

  // Create starfield background for depth cues
  const createStarfieldBackground = () => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Create star particles
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    const starSizes = [];

    for (let i = 0; i < CONSTANTS.BACKGROUND_STARS; i++) {
      // Random position on a larger sphere
      const distance =
        CONSTANTS.BACKGROUND_STAR_MIN_DISTANCE +
        Math.random() *
          (CONSTANTS.BACKGROUND_STAR_MAX_DISTANCE -
            CONSTANTS.BACKGROUND_STAR_MIN_DISTANCE);

      const position = getRandomPointOnSphere(distance);
      starPositions.push(position.x, position.y, position.z);

      // Random size, smaller stars in the background
      const size = 0.05 + Math.random() * 0.2;
      starSizes.push(size);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );
    starsGeometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(starSizes, 1)
    );

    // Create point material
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
  };

  // Helper: Animate the central star to glow up to the brand color and then remain there.
  const triggerStarGlow = () => {
    if (!starRef.current) return;
    const material = starRef.current.material;
    // Save the star's original color.
    const originalColor = material.color.clone();
    let brandColor = getCssVariableValue("--brand-color");
    brandColor = new THREE.Color(cssColorToHex(brandColor));
    const duration = 1500; // Duration of the glow transition in milliseconds.
    const startTime = performance.now();
    const animateGlow = (currentTime) => {
      const elapsed = currentTime - startTime;
      let t = Math.min(elapsed / duration, 1);
      // Lerp the star's color from its original color to the brand color.
      material.color.lerpColors(originalColor, brandColor, t);
      if (t < 1) {
        requestAnimationFrame(animateGlow);
      } else {
        // Ensure the star's color remains at the brand color.
        material.color.copy(brandColor);
      }
    };
    requestAnimationFrame(animateGlow);
  };

  const createSceneObjects = (objectColor) => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Create central star.
    const starGeometry = new THREE.SphereGeometry(CONSTANTS.STAR_SIZE, 32, 32);
    const starMaterial = new THREE.MeshPhysicalMaterial({
      color: objectColor,
      opacity: CONSTANTS.STAR_OPACITY,
      transparent: true,
      ...CONSTANTS.GLASS_PROPERTIES,
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.castShadow = true;
    star.receiveShadow = true;
    star.userData = {
      type: "star",
      id: "central-star",
      data: { name: "Central Star" },
    };
    scene.add(star);
    starRef.current = star;

    // Trigger the star glow animation.
    triggerStarGlow();

    // Create planets and connecting low-poly lines with spring animation.
    const planets = [];

    // Define the orbit radius distribution range
    const minOrbitRadius = CONSTANTS.MIN_ORBIT_RADIUS;
    const maxOrbitRadius = CONSTANTS.MAX_ORBIT_RADIUS;
    const orbitRadius = (minOrbitRadius + maxOrbitRadius) / 2;

    // Easing function: smooth ease-out cubic.
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Helper: Trigger a pulse effect along the connecting line.
    // (Pulse is drawn as a short moving line segment with the brand color.)
    const triggerPulse = (planetObj) => {
      let brandColor = getCssVariableValue("--brand-color");
      brandColor = cssColorToHex(brandColor);
      const targetPos = new THREE.Vector3(
        planetObj.initialPosition.x,
        planetObj.initialPosition.y,
        planetObj.initialPosition.z
      );
      const pulseFraction = 0.1;
      const pulseGeometry = new THREE.BufferGeometry();
      pulseGeometry.setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const pulseMaterial = new THREE.LineBasicMaterial({
        color: brandColor,
        transparent: true,
        opacity: 1,
        linewidth: 2,
      });
      const pulseLine = new THREE.Line(pulseGeometry, pulseMaterial);
      scene.add(pulseLine);

      const startTime = performance.now();
      const duration = 1000; // 1 second pulse animation.

      const animatePulse = (currentTime) => {
        const elapsed = currentTime - startTime;
        let t = Math.min(elapsed / duration, 1);
        const pulseStart = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(0, 0, 0),
          targetPos,
          t
        );
        const pulseEnd = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(0, 0, 0),
          targetPos,
          Math.min(t + pulseFraction, 1)
        );
        pulseGeometry.setFromPoints([pulseStart, pulseEnd]);
        pulseMaterial.opacity = 1 - t;
        if (elapsed < duration) {
          requestAnimationFrame(animatePulse);
        } else {
          scene.remove(pulseLine);
          pulseGeometry.dispose();
          pulseMaterial.dispose();
        }
      };
      requestAnimationFrame(animatePulse);
    };

    // Animate a planet from the star's center (0,0,0) to its target position.
    const animatePlanet = (planetObj, delay = 0) => {
      setTimeout(() => {
        const startTime = performance.now();
        // Reduce duration from 2000ms to 800ms for faster movement
        const duration = 800;

        // Calculate orbit parameters once to ensure consistency
        if (!planetObj.initialAngle) {
          // Convert cartesian to polar coordinates for smooth orbital motion
          const radius = Math.sqrt(
            planetObj.initialPosition.x * planetObj.initialPosition.x +
              planetObj.initialPosition.z * planetObj.initialPosition.z
          );
          const angle = Math.atan2(
            planetObj.initialPosition.z,
            planetObj.initialPosition.x
          );

          // Store these values for consistent orbit
          planetObj.orbitRadius = radius;
          planetObj.initialAngle = angle;

          // We'll use these values throughout the component's lifecycle
          // to ensure smooth transition between animation phases
        }

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          let t = Math.min(elapsed / duration, 1);
          // Keep original easing but accelerate the expansion
          t = easeOutCubic(t);

          // Position using the radius and angle to ensure consistent positioning
          // This prevents the jitter when transitioning to orbital motion
          const radius = planetObj.orbitRadius * t;
          const angle = planetObj.initialAngle;

          planetObj.mesh.position.set(
            Math.cos(angle) * radius,
            planetObj.initialPosition.y * t,
            Math.sin(angle) * radius
          );

          planetObj.tube.geometry.setFromPoints([
            new THREE.Vector3(0, 0, 0),
            planetObj.mesh.position.clone(),
          ]);

          if (elapsed < duration) {
            requestAnimationFrame(animate);
          } else {
            // When animation completes, set the final position using the same
            // orbital calculation method to maintain consistency
            planetObj.mesh.position.set(
              Math.cos(angle) * planetObj.orbitRadius,
              planetObj.initialPosition.y,
              Math.sin(angle) * planetObj.orbitRadius
            );

            // Note the time when animation ended
            planetObj.isSpringing = false;
            planetObj.springEndTime = performance.now();

            // Start orbital motion using consistent speed and parameters
            // The rotation will now smoothly continue from this point

            triggerPulse(planetObj);
            setTimeout(() => {
              triggerPlanetGlow(planetObj, 600); // Slightly longer final glow
            }, 300); // Reduced delay
          }
        };
        requestAnimationFrame(animate);
      }, delay);
    };

    // Determine number of planets and data source
    const planetCount = data ? data.length : CONSTANTS.PLANET_COUNT;

    // Setup random pulse effect if enabled
    const setupPulseEffect = () => {
      if (!pulse || !planetsRef.current || planetsRef.current.length === 0)
        return;

      // Clear existing timer if any
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
      }

      // Set up a timer to randomly pulse planets
      pulseTimerRef.current = setInterval(() => {
        if (!planetsRef.current || isPlanetAnimationPausedRef.current) return;

        // Randomly choose 1-3 planets to pulse
        const pulsesCount = 1 + Math.floor(Math.random() * 3);
        const planetsToGlow = [];

        // Get random planets
        for (let i = 0; i < pulsesCount; i++) {
          const randomIndex = Math.floor(
            Math.random() * planetsRef.current.length
          );
          if (!planetsToGlow.includes(planetsRef.current[randomIndex])) {
            planetsToGlow.push(planetsRef.current[randomIndex]);
          }
        }

        // Trigger pulse on selected planets
        planetsToGlow.forEach((planet) => {
          // Random duration between 500ms and 1500ms for variation
          const randomDuration = 500 + Math.random() * 1000;
          triggerPlanetGlow(planet, randomDuration);
        });
      }, 2000); // Check for new pulses every 2 seconds
    };

    // Create each planet
    for (let i = 0; i < planetCount; i++) {
      // Determine if we're using provided data or generating random data
      const isUsingProvidedData = data && i < data.length;
      const itemData = isUsingProvidedData ? data[i] : null;

      // Calculate planet position using Fibonacci sphere distribution
      // KEEPING THE ORIGINAL ALGORITHM - this was correct
      const phi = Math.acos(1 - (2 * (i + 0.5)) / planetCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);

      // Safely extract orbit value from data if available, otherwise use default
      const planetOrbitRadius =
        isUsingProvidedData &&
        itemData.orbit !== undefined &&
        !isNaN(parseFloat(itemData.orbit))
          ? parseFloat(itemData.orbit)
          : orbitRadius;

      // Calculate final position
      const targetPosition = {
        x: x * planetOrbitRadius,
        y: y * planetOrbitRadius,
        z: z * planetOrbitRadius,
      };

      // Determine planet color - use from data or generate based on position
      let planetColor;
      if (isUsingProvidedData && itemData.color) {
        try {
          planetColor = new THREE.Color(itemData.color);
        } catch (e) {
          // If color parsing fails, use default
          planetColor = new THREE.Color(objectColor);
        }
      } else {
        planetColor = new THREE.Color(objectColor);
        const colorShift = Math.abs(y);
        const distantColor = new THREE.Color(objectColor).lerp(
          new THREE.Color(0x4466ff),
          0.3
        );
        planetColor.lerp(distantColor, colorShift);
      }

      // Determine planet size - use from data or use default
      const planetSize =
        isUsingProvidedData &&
        itemData.size !== undefined &&
        !isNaN(parseFloat(itemData.size))
          ? parseFloat(itemData.size)
          : CONSTANTS.PLANET_SIZE;

      // Create planet geometry and material
      const planetGeometry = new THREE.SphereGeometry(planetSize, 24, 24);
      const planetMaterial = new THREE.MeshPhysicalMaterial({
        color: planetColor,
        ...CONSTANTS.GLASS_PROPERTIES,
        reflectivity: 0.9,
        envMapIntensity: 2.0,
        sheen: 0.4,
        sheenColor: 0xffffff,
        sheenRoughness: 0.3,
      });

      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      planet.position.set(0, 0, 0);
      planet.castShadow = true;
      planet.receiveShadow = true;

      // Helper function to extract a simple display name from potentially complex data
      const extractName = (dataItem) => {
        if (!dataItem) return `Planet ${i + 1}`;

        // Try to use 'name' property first
        if (typeof dataItem.name === "string") return dataItem.name;

        // Try to use 'title' property next
        if (typeof dataItem.title === "string") return dataItem.title;

        // If there's a 'point' property that's a string (from example data)
        if (typeof dataItem.point === "string") {
          // Return first 30 chars of point
          return (
            dataItem.point.substring(0, 30) +
            (dataItem.point.length > 30 ? "..." : "")
          );
        }

        // Look for any string property that might be suitable as a name
        const stringProps = Object.entries(dataItem)
          .filter(([_, v]) => typeof v === "string")
          .map(([k, v]) => ({ key: k, value: v }));

        if (stringProps.length > 0) {
          // Prefer shorter string properties for names
          const candidate = stringProps.sort(
            (a, b) => a.value.length - b.value.length
          )[0];
          if (candidate.value.length <= 50) {
            return (
              candidate.value.substring(0, 30) +
              (candidate.value.length > 30 ? "..." : "")
            );
          }
        }

        // Default identifier
        return `Item ${i + 1}`;
      };

      // Helper function to extract a details string from potentially complex data
      const extractDetails = (dataItem) => {
        if (!dataItem) return `Generated planet ${i + 1}`;

        // If there's a 'details' property that's a string
        if (typeof dataItem.details === "string") return dataItem.details;

        // If there's a 'description' property that's a string
        if (typeof dataItem.description === "string")
          return dataItem.description;

        // If there's a 'point' property that's a string (from example data)
        if (typeof dataItem.point === "string") return dataItem.point;

        // Look for any suitable string property for details
        const stringProps = Object.entries(dataItem)
          .filter(([k, v]) => typeof v === "string" && v.length > 30)
          .map(([k, v]) => v);

        if (stringProps.length > 0) {
          return stringProps[0];
        }

        // If no suitable string, create a placeholder
        return `This represents data item ${i + 1}`;
      };

      // Set user data from provided data or generate default
      if (isUsingProvidedData) {
        const itemData = data[i];
        planet.userData = {
          type: "planet",
          id: itemData.id !== undefined ? itemData.id : `planet-${i}`,
          data: {
            name: extractName(itemData),
            orbit: planetOrbitRadius.toFixed(2),
            details: extractDetails(itemData),
            ...itemData, // Include all original properties from the data object
          },
        };
      } else {
        planet.userData = {
          type: "planet",
          id: `planet-${i}`,
          data: {
            name: `Planet ${i + 1}`,
            orbit: planetOrbitRadius.toFixed(2),
            details: `This is planet ${
              i + 1
            }, evenly distributed using the Fibonacci sphere algorithm.`,
            // Generate random properties for demo purposes
            atmosphere: Math.random() > 0.5 ? "Breathable" : "Toxic",
            surface: ["Rocky", "Oceanic", "Gaseous", "Desert"][
              Math.floor(Math.random() * 4)
            ],
            temperature: Math.floor(Math.random() * 500) - 200,
            resources:
              Math.random() > 0.7
                ? "Abundant"
                : Math.random() > 0.5
                ? "Moderate"
                : "Scarce",
          },
        };
      }

      scene.add(planet);

      // Create connection line
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: objectColor,
        transparent: true,
        opacity: CONSTANTS.TUBE_OPACITY,
        linewidth: 1,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);

      // Determine rotation speed from data or generate
      const rotationSpeed =
        isUsingProvidedData && data[i].rotationSpeed
          ? parseFloat(data[i].rotationSpeed)
          : 0.2; // Constant speed for all planets

      const planetObj = {
        mesh: planet,
        tube: line,
        radius: planetOrbitRadius,
        initialPosition: { ...targetPosition },
        rotationAxis: new THREE.Vector3(0, 1, 0),
        rotationSpeed: rotationSpeed,
        isSpringing: true,
        springEndTime: 0,
      };

      planets.push(planetObj);
    }

    // Animate planets with staggered delays
    // Animate planets with staggered delays
    planets.forEach((planetObj, index) => {
      // Reduce delay from 100ms to just 10ms between planets
      const delay = index * 10; // 10x faster initial staggering
      animatePlanet(planetObj, delay);
    });

    planetsRef.current = planets;

    // Start the pulse effect if enabled
    if (pulse) {
      setupPulseEffect();
    }
  };

  // CSS variable change observer effect
  useEffect(() => {
    const observeCssVariables = () => {
      // Setup MutationObserver for style changes
      const observer = new MutationObserver((mutations) => {
        let needsUpdate = false;

        // Check if any mutations affect the CSS variables we care about
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName === "style" ||
            mutation.attributeName === "class"
          ) {
            needsUpdate = true;
          }
        });

        if (needsUpdate && sceneRef.current) {
          // Get the current colors
          const primaryColor = cssColorToHex(
            getCssVariableValue("--primary-color")
          );
          const complementaryColor = cssColorToHex(
            getCssVariableValue("--complementary-color")
          );

          // Update scene background - respect transparency first, then custom background
          if (transparentBackground) {
            sceneRef.current.background = null;
          } else if (backgroundColor) {
            sceneRef.current.background = new THREE.Color(
              cssColorToHex(backgroundColor)
            );
          } else {
            sceneRef.current.background = new THREE.Color(primaryColor);
          }

          // Update all objects with complementary color
          if (starRef.current) {
            starRef.current.material.color = new THREE.Color(
              complementaryColor
            );
          }

          planetsRef.current.forEach((planet) => {
            planet.mesh.material.color = new THREE.Color(complementaryColor);
            if (planet.tube) {
              planet.tube.material.color = new THREE.Color(complementaryColor);
            }
          });
        }
      });

      // Observe the document element for style changes
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      return observer;
    };

    const cssObserver = observeCssVariables();

    return () => {
      cssObserver.disconnect();
    };
  }, [backgroundColor, transparentBackground]); // Add dependencies

  // Initial setup effect - recreate scene when relevant props change
  useEffect(() => {
    setupScene();

    // Cleanup on component unmount
    return () => {
      console.log("unmount");
      cleanupThreeJS();

      // Clean up pulse timer
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, [
    data,
    backgroundColor,
    transparentBackground,
    pulse,
    pulseColor,
    pulseDuration,
    initialZoom,
    minZoom,
    maxZoom,
  ]); // Add all relevant props to dependency array

  // Theme change effect - recreate scene completely
  useEffect(() => {
    console.log("Theme changed to:", isDarkTheme ? "dark" : "light");

    // Skip initial render
    if (!sceneRef.current) return;

    // Clean up existing scene
    cleanupThreeJS();

    // Create new scene with updated theme
    setupScene();
  }, [isDarkTheme, backgroundColor, transparentBackground]); // Add all relevant props to dependency array

  const animateCameraReset = () => {
    if (!inspectedPlanetRef.current) return;

    // Store current camera state
    const currentCameraPosition = cameraRef.current.position.clone();
    const currentTarget = inspectedPlanetRef.current.position.clone();

    // Clear reference
    inspectedPlanetRef.current = null;
    isPlanetAnimationPausedRef.current = false;

    // Natural easing function
    const naturalEasing = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // Start animation
    const startTime = Date.now();
    const duration = CONSTANTS.CAMERA.ANIMATION_DURATION;

    const targetPosition = {
      x: cameraPositionRef.current.x,
      y: cameraPositionRef.current.y,
      z: cameraPositionRef.current.z,
    };

    const animateFrame = () => {
      const currentTime = Date.now();
      let progress = (currentTime - startTime) / duration;
      progress = Math.min(progress, 1.0);

      const easedProgress = naturalEasing(progress);

      // Interpolate position
      cameraRef.current.position.x =
        currentCameraPosition.x +
        (targetPosition.x - currentCameraPosition.x) * easedProgress;
      cameraRef.current.position.y =
        currentCameraPosition.y +
        (targetPosition.y - currentCameraPosition.y) * easedProgress;
      cameraRef.current.position.z =
        currentCameraPosition.z +
        (targetPosition.z - currentCameraPosition.z) * easedProgress;

      // Smoothly transition lookAt
      const currentLookAtX = currentTarget.x * (1 - easedProgress);
      const currentLookAtY = currentTarget.y * (1 - easedProgress);
      const currentLookAtZ = currentTarget.z * (1 - easedProgress);

      cameraRef.current.lookAt(currentLookAtX, currentLookAtY, currentLookAtZ);

      if (progress < 1.0) {
        requestAnimationFrame(animateFrame);
      } else {
        distanceRef.current = CONSTANTS.CAMERA.DEFAULT_POSITION.z;
      }
    };

    requestAnimationFrame(animateFrame);
  };

  // First, create a BasePlanetModal component inside InteractiveMap3D
  // Add this right before the DefaultPlanetModal definition

  // The BasePlanetModal component
  const BasePlanetModal = ({ children, onClose, draggable }) => {
    const modalRef = useRef(null);

    // Position modal at cursor position
    useEffect(() => {
      if (!modalRef.current) return;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = modalRef.current.offsetWidth;
      const modalHeight = modalRef.current.offsetHeight;
      let left = modalInfo.position.x;
      let top = modalInfo.position.y;

      if (left + modalWidth > viewportWidth - 20) {
        left = viewportWidth - modalWidth - 20;
      }
      if (top + modalHeight > viewportHeight - 20) {
        top = viewportHeight - modalHeight - 20;
      }
      left = Math.max(20, left);
      top = Math.max(20, top);

      modalRef.current.style.position = "fixed";
      modalRef.current.style.left = `${left}px`;
      modalRef.current.style.top = `${top}px`;
      modalRef.current.style.right = "auto";
      modalRef.current.style.zIndex = "1000";
      modalRef.current.style.transform = "none";
    }, []); // Note: modalInfo.position is assumed to be stable when modal opens

    // Ultra-optimized dragging effect
    useEffect(() => {
      if (!modalRef.current || !draggable) return;
      let isDragging = false;
      let startX, startY, startLeft, startTop;
      let rafId = null;

      const moveModal = (x, y) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (!modalRef.current) return;
          modalRef.current.style.left = `${startLeft + (x - startX)}px`;
          modalRef.current.style.top = `${startTop + (y - startY)}px`;
          modalRef.current.style.right = "auto";
          rafId = null;
        });
      };

      const onMouseDown = (e) => {
        if (!modalRef.current) return;
        e.preventDefault();
        const rect = modalRef.current.getBoundingClientRect();
        modalRef.current.classList.add(styles.modalDragging);
        modalRef.current.style.left = `${rect.left}px`;
        modalRef.current.style.right = "auto";
        startLeft = rect.left;
        startTop = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        isDragging = true;
        document.addEventListener("mousemove", onMouseMove, { passive: true });
        document.addEventListener("mouseup", onMouseUp, { passive: true });
      };

      const onMouseUp = () => {
        isDragging = false;
        if (modalRef.current) {
          modalRef.current.classList.remove(styles.modalDragging);
        }
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e) => {
        if (!isDragging) return;
        moveModal(e.clientX, e.clientY);
      };

      const onTouchStart = (e) => {
        if (!modalRef.current || e.touches.length !== 1) return;
        e.preventDefault();
        const rect = modalRef.current.getBoundingClientRect();
        modalRef.current.style.left = `${rect.left}px`;
        modalRef.current.style.right = "auto";
        const updatedRect = modalRef.current.getBoundingClientRect();
        startLeft = updatedRect.left;
        startTop = updatedRect.top;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onTouchEnd, { passive: true });
      };

      const onTouchMove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        moveModal(e.touches[0].clientX, e.touches[0].clientY);
      };

      const onTouchEnd = () => {
        isDragging = false;
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      const header = modalRef.current.querySelector(`.${styles.modalHeader}`);
      if (header) {
        header.addEventListener("mousedown", onMouseDown);
        header.addEventListener("touchstart", onTouchStart, { passive: false });
      }
      const handles = modalRef.current.querySelectorAll(
        `.${styles.dragHandle}`
      );
      handles.forEach((handle) => {
        handle.addEventListener("mousedown", onMouseDown);
        handle.addEventListener("touchstart", onTouchStart, { passive: false });
      });

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (header) {
          header.removeEventListener("mousedown", onMouseDown);
          header.removeEventListener("touchstart", onTouchStart);
        }
        handles.forEach((handle) => {
          handle.removeEventListener("mousedown", onMouseDown);
          handle.removeEventListener("touchstart", onTouchStart);
        });
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };
    }, [draggable]);

    const handleClose = (e) => {
      e.stopPropagation();
      if (modalRef.current) {
        modalRef.current.style.opacity = "0";
        modalRef.current.style.transform = "scale(0.95) translateY(10px)";
        setTimeout(() => {
          onClose();
        }, 200);
      } else {
        onClose();
      }
    };

    return (
      <div ref={modalRef} className={styles.modal}>
        <div
          className={styles.modalHeader}
          style={{ cursor: draggable ? "grab" : "default" }}
        >
          <button
            onClick={handleClose}
            className={styles.modalClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        {children}
        {draggable && (
          <>
            <div className={styles.dragHandle} style={{ top: 0, left: 0 }} />
            <div className={styles.dragHandle} style={{ top: 0, right: 0 }} />
            <div className={styles.dragHandle} style={{ bottom: 0, left: 0 }} />
            <div
              className={styles.dragHandle}
              style={{ bottom: 0, right: 0 }}
            />
          </>
        )}
      </div>
    );
  };

  // ──────────────────────────────
  // DefaultPlanetModal Component
  // ──────────────────────────────
  const DefaultPlanetModal = () => {
    const renderPlanetProperties = () => {
      const commonProps = ["name", "orbit", "details", "id"];
      const additionalProps = Object.keys(modalInfo.data).filter(
        (key) => !commonProps.includes(key)
      );
      if (additionalProps.length === 0) return null;
      const renderValue = (value, depth = 0) => {
        if (value === null || value === undefined) {
          return <span style={{ color: "var(--text-color-50)" }}>null</span>;
        }
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          return String(value);
        }
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return <span style={{ color: "var(--text-color-50)" }}>[]</span>;
          }
          return (
            <ul
              style={{
                margin: 0,
                paddingLeft: depth > 0 ? 16 : 0,
                listStyle: depth > 0 ? "disc" : "none",
              }}
            >
              {value.map((item, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {renderValue(item, depth + 1)}
                </li>
              ))}
            </ul>
          );
        }
        if (typeof value === "object") {
          return (
            <div style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
              {Object.entries(value).map(([key, val]) => (
                <div key={key} style={{ marginBottom: 4 }}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                  {renderValue(val, depth + 1)}
                </div>
              ))}
            </div>
          );
        }
        return String(value);
      };
      return (
        <div
          style={{
            marginTop: "20px",
            paddingTop: "15px",
            borderTop: "1px solid var(--text-color-10)",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0" }}>Planet Properties</h4>
          <div style={{ padding: "0 0 0 20px", margin: 0 }}>
            {additionalProps.map((prop) => (
              <div key={prop} style={{ marginBottom: "12px" }}>
                <strong>{prop.charAt(0).toUpperCase() + prop.slice(1)}:</strong>{" "}
                {renderValue(modalInfo.data[prop])}
              </div>
            ))}
          </div>
        </div>
      );
    };

    const learningMaterialsBtn = (
      <button
        className={styles.learningMaterialsBtn}
        onClick={() =>
          window.open(
            `https://www.example.com/materials/${modalInfo.planetId}`,
            "_blank"
          )
        }
      >
        Learning Materials
      </button>
    );

    return (
      <>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{modalInfo.data.name}</h3>
        </div>
        <div className={styles.modalContent}>
          <p>
            <strong>Orbit:</strong> {modalInfo.data.orbit} units
          </p>
          <p>{modalInfo.data.details}</p>
          {renderPlanetProperties()}
        </div>
        <div className={styles.modalFooter}>{learningMaterialsBtn}</div>
      </>
    );
  };

  const PortalPlanetModal = React.memo(({ children, onClose, draggable }) => {
    return ReactDOM.createPortal(
      <BasePlanetModal draggable={draggable} onClose={onClose}>
        {children}
      </BasePlanetModal>,
      document.body
    );
  });

  // Updated InteractiveMap3D return statement
  // Updated InteractiveMap3D return statement
  return (
    <div className={styles.container} style={{ height: "100%", width: "100%" }}>
      <div ref={containerRef} className={styles.scene} />
      {showModal && (
        // Use the PortalPlanetModal to render the modal outside the main tree.
        <PortalPlanetModal
          draggable={draggable}
          onClose={() => {
            setShowModal(false);
            animateCameraReset();
          }}
        >
          {renderModalContent ? (
            renderModalContent({
              planetId: modalInfo.planetId,
              data: modalInfo.data,
            })
          ) : (
            <DefaultPlanetModal />
          )}
        </PortalPlanetModal>
      )}
    </div>
  );
};

export default InteractiveMap3D;
