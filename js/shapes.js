import gsap from 'gsap';
import * as THREE from 'three';

function createShape(type) {
    let geometry;

    switch (type) {
        case 'icosahedron':
            geometry = new THREE.IcosahedronGeometry(2.0, 0);
            break;
        case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(2.0, 0);
            break;
        case 'wireframeCube':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        default:
            geometry = new THREE.OctahedronGeometry(2.0, 0);
    }

    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);

    const palette = [
        [0.9, 0.2, 0.3],
        [0.4, 0.8, 0.5],
        [0.8, 0.4, 0.7],
        [0.3, 0.5, 1.0],
        [0.5, 0.3, 0.9],
        [0.2, 0.4, 0.8],
    ];

    for (let i = 0; i < count; i += 3) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = color[0];
        colors[i * 3 + 1] = color[1];
        colors[i * 3 + 2] = color[2];
        colors[(i + 1) * 3] = color[0];
        colors[(i + 1) * 3 + 1] = color[1];
        colors[(i + 1) * 3 + 2] = color[2];
        colors[(i + 2) * 3] = color[0];
        colors[(i + 2) * 3 + 1] = color[1];
        colors[(i + 2) * 3 + 2] = color[2];
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.0,
        roughness: 1.0,
        flatShading: false,
        emissiveIntensity: 1.0,
        // transparent: false 
    });

    material.userData.glowUniform = { value: 0.4 };

    material.onBeforeCompile = (shader) => {
        shader.uniforms.uGlow = material.userData.glowUniform;
        shader.fragmentShader = 'uniform float uGlow;\n' + shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
             totalEmissiveRadiance = diffuseColor.rgb * uGlow;`
        );
    };

    const mesh = new THREE.Mesh(geometry, material);

    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x000000, transparent: false, opacity: 0.2 })
    );
    mesh.add(edges);

    return mesh;
}

export { createShape };
