import React, { useEffect, useState } from 'react'
import { FunctionComponent } from "react"
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SurfaceViewOptions } from './Controls';
import { SurfaceData } from './SurfaceView';

type Props = {
    surfaceData: SurfaceData
    width: number
    height: number
    options: SurfaceViewOptions
}

const stats = (x: number[]) => {
    if (!x.length) return {mean: 0, min: 0, max: 0}
    const sum = x.reduce((previous, current) => current += previous, 0)
    const min = Math.min(...x)
    const max = Math.max(...x)
    const mean = sum / x.length
    return {mean, min, max}
}

const getMeshGeometry = (surfaceData: SurfaceData) => {
    const geometry = new THREE.BufferGeometry();

    const indices: number[] = [];

    const vertices = [];
    const normals = [];
    const colors = [];

    // seems to be a problem if we don't divide by a large number ???
    const {mean: xAbsMean} =  stats(surfaceData.vertices.map(v => (Math.abs(v[0]))))
    const {mean: yAbsMean} =  stats(surfaceData.vertices.map(v => (Math.abs(v[1]))))
    const {mean: zAbsMean} =  stats(surfaceData.vertices.map(v => (Math.abs(v[2]))))
    const factor = 100 / ((xAbsMean + yAbsMean + zAbsMean) / 3)

    const x = surfaceData.vertices.map(v => (v[0] * factor))
    const y = surfaceData.vertices.map(v => (v[1] * factor))
    const z = surfaceData.vertices.map(v => (v[2] * factor))
    const {min: xmin, max: xmax} = stats(x)
    const {min: ymin, max: ymax} = stats(y)
    // const {min: zmin, max: zmax} = stats(z)

    for (let i = 0; i < x.length; i++) {
        // vertices.push(2 * (x[i] - xmin) / (xmax - xmin) - 1, 2 * (y[i] - ymin) / (ymax - ymin) - 1, 2 * (z[i] - zmin) / (zmax - zmin) - 1)
        vertices.push(x[i], y[i], z[i])
        normals.push(0, 0, 1)
        const r = ( x[i] - xmin ) / (xmax - xmin)
        const g = ( y[i] - ymin ) / (ymax - ymin)
        colors.push(r, g, 1)
    }

    for (let j = 0; j < surfaceData.ifaces.length; j++) {
        const a = surfaceData.ifaces[j]
        const b =(j + 1 < surfaceData.ifaces.length) ? surfaceData.ifaces[j + 1] : x.length + 1
        for (let k = 3; k <= b - a; k++) {
            indices.push(surfaceData.faces[a], surfaceData.faces[a + k - 2], surfaceData.faces[a + k - 1])
        }
    }

    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    return geometry
}


const SurfaceWidget: FunctionComponent<Props> = ({surfaceData, width, height, options}) => {
    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const [scene, setScene] = useState<THREE.Scene | null>(null)

    useEffect(() => {
        const scene = new THREE.Scene()
        scene.background = new THREE.Color( 0xffffff );

        setScene(scene)
        
    }, [])

    useEffect(() => {
        if (!scene) return
        if (!container) return

        scene.clear()

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );

        const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 100000 );

        while (container.firstChild) container.removeChild(container.firstChild)
        container.appendChild(renderer.domElement)

        const material = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            vertexColors: true
        } );
        // var cube = new THREE.Mesh( geometry, material );
        // scene.add( cube );

        // const mesh = new THREE.Mesh( getMeshGeometry(), material );
        // scene.add(mesh)

        const meshGeometry = getMeshGeometry(surfaceData)
        const mesh2 = new THREE.Mesh( meshGeometry, material );
        if (options.showMesh) {
            scene.add(mesh2)
        }

        if (options.showWireframe) {
            const meshGeometryForWireframe = getMeshGeometry(surfaceData)
            const wireframe = new THREE.WireframeGeometry(meshGeometryForWireframe)
            const wireframeMaterial = new THREE.LineBasicMaterial({color: 0x000000})
            const line = new THREE.LineSegments(wireframe, wireframeMaterial)
            ;(line.material as THREE.Material).depthTest = true
            ;(line.material as THREE.Material).opacity = 0.1
            ;(line.material as THREE.Material).transparent = true
            ;(line.material as THREE.Material).vertexColors = false
            scene.add(line)
        }

        const bbox = new THREE.Box3().setFromObject(mesh2);

        const light = new THREE.HemisphereLight();
		scene.add( light );

        const controls = new OrbitControls( camera, container );

        const p = {x: (bbox.min.x + bbox.max.x) / 2, y: (bbox.min.y + bbox.max.y) / 2, z: (bbox.min.z + bbox.max.z) / 2}
        camera.position.set(p.x, p.y, p.z + (bbox.max.z - bbox.min.z) * 3)
        controls.target.set(p.x, p.y, p.z)
        const animate = () => {
            requestAnimationFrame( animate );
            // cube.rotation.x += 0.01;
            // cube.rotation.y += 0.01;
            controls.update()
            renderer.render( scene, camera );
        };
        animate();
    }, [container, surfaceData, scene, width, height, options])
    return (
        <div ref={setContainer} />
    )
}

export default SurfaceWidget