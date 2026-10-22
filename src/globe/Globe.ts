import * as THREE from 'three'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import landTopo from 'world-atlas/land-110m.json'
import gsap from 'gsap'
import { places, type PlaceKey } from '../content'

const DEG = Math.PI / 180

export type Focus = PlaceKey | 'bridge' | 'hero'
export type Layout = 'side' | 'center' | 'top'

// Same convention for dots, pins and arcs.
export function latLonToVec3(lat: number, lon: number, r = 1) {
  const phi = (90 - lat) * DEG
  const theta = (lon + 180) * DEG
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

// Rasterize the land outline once so each sample point is a pixel lookup.
function buildLandMask(width = 1024, height = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>
  const land = feature(topo, topo.objects.land) as GeoJSON.FeatureCollection
  const toX = (lon: number) => ((lon + 180) / 360) * width
  const toY = (lat: number) => ((90 - lat) / 180) * height

  ctx.fillStyle = '#fff'
  for (const f of land.features) {
    const g = f.geometry
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []
    for (const poly of polys) {
      for (const offset of [-360, 0, 360]) {
        ctx.beginPath()
        for (const ring of poly) {
          // Unwrap longitudes so rings that cross the antimeridian stay continuous.
          let prev = ring[0][0]
          let shift = 0
          ring.forEach(([lon, lat], i) => {
            if (i > 0) {
              const d = lon - prev
              if (d > 180) shift -= 360
              else if (d < -180) shift += 360
            }
            prev = lon
            const x = toX(lon + shift + offset)
            const y = toY(lat)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          })
          ctx.closePath()
        }
        ctx.fill('evenodd')
      }
    }
  }
  const data = ctx.getImageData(0, 0, width, height).data
  return (lat: number, lon: number) => {
    const x = Math.min(width - 1, Math.max(0, Math.floor(toX(lon))))
    const y = Math.min(height - 1, Math.max(0, Math.floor(toY(lat))))
    return data[(y * width + x) * 4] > 127
  }
}

const dotVertex = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vFacing;
  varying float vSeed;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * position);
    vFacing = dot(n, normalize(-mv.xyz));
    vSeed = aSeed;
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z) * 3.0;
    gl_Position = projectionMatrix * mv;
  }
`
const dotFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHighlight;
  uniform float uOpacity;
  uniform float uTime;
  varying float vFacing;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.3 + vSeed * 40.0);
    float edge = smoothstep(0.0, 0.55, vFacing);
    vec3 col = mix(uColor, uHighlight, step(0.985, vSeed) * twinkle);
    gl_FragColor = vec4(col, edge * uOpacity * twinkle);
  }
`

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // Back faces: brightest just outside the globe's edge, fading into space.
    float glow = pow(clamp(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.0);
    gl_FragColor = vec4(uColor, glow * uOpacity);
  }
`

const arcVertex = /* glsl */ `
  varying float vU;
  void main() {
    vU = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const arcFragment = /* glsl */ `
  uniform vec3 uFrom;
  uniform vec3 uTo;
  uniform float uDraw;
  uniform float uOpacity;
  uniform float uFade;
  uniform float uTime;
  uniform float uBoth;
  varying float vU;
  void main() {
    if (vU > uDraw) discard;
    vec3 col = mix(uFrom, uTo, vU);
    float head = fract(uTime * 0.22);
    float pulse = exp(-pow((vU - head) * 18.0, 2.0));
    float back = exp(-pow((vU - (1.0 - head)) * 18.0, 2.0)) * uBoth;
    float a = 0.35 + 0.65 * (pulse + back);
    gl_FragColor = vec4(col + (pulse + back) * 0.6, a * uOpacity * uFade);
  }
`

type Arc = {
  key: string
  mesh: THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>
}

type Pin = {
  key: PlaceKey
  group: THREE.Group
  ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  dot: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>
  label: HTMLDivElement
  world: THREE.Vector3
}

const arcKey = (a: PlaceKey, b: PlaceKey) => [a, b].sort().join('-')

export class Globe {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  private root = new THREE.Group()
  private spin = new THREE.Group()
  private dots!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
  private atmosphere!: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>
  private arcs: Arc[] = []
  private pins: Pin[] = []
  private start = performance.now()
  private raf = 0
  private running = true
  private resizeObserver: ResizeObserver
  private pointer = { x: 0, y: 0 }
  private reducedMotion: boolean

  // Tweened view state; the render loop turns it into a rotation.
  private view = { lat: 30, lon: -40, dist: 5.2, x: 0, y: 0, opacity: 1, drift: 1 }
  private activeArc = ''
  private activePlaces = new Set<PlaceKey>()
  private showLabels = false

  constructor(private canvas: HTMLCanvasElement, private labelLayer: HTMLElement) {
    this.reducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (import.meta.env.DEV && new URLSearchParams(location.search).has('instant'))
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)

    this.scene.add(this.root)
    this.root.add(this.spin)
    this.camera.position.set(0, 0, this.view.dist)

    this.buildGlobe()
    this.buildArcs()
    this.buildPins()

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()

    window.addEventListener('pointermove', this.onPointer, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility)
    this.loop()
  }

  private buildGlobe() {
    const isLand = buildLandMask()
    const small = window.innerWidth < 768
    const samples = small ? 22000 : 40000
    const positions: number[] = []
    const seeds: number[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < samples; i++) {
      const y = 1 - (2 * (i + 0.5)) / samples
      const lat = Math.asin(y) / DEG
      const lon = ((((i * golden) / DEG) % 360) + 360) % 360 - 180
      if (!isLand(lat, lon)) continue
      const v = latLonToVec3(lat, lon)
      positions.push(v.x, v.y, v.z)
      seeds.push(Math.random())
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))
    const mat = new THREE.ShaderMaterial({
      vertexShader: dotVertex,
      fragmentShader: dotFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: small ? 2.2 : 2.6 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uColor: { value: new THREE.Color('#8d9dd6') },
        uHighlight: { value: new THREE.Color('#ffd28a') },
        uOpacity: { value: 1 },
        uTime: { value: 0 },
      },
    })
    this.dots = new THREE.Points(geo, mat)
    this.spin.add(this.dots)

    // Dark core hides dots on the far side.
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.985, 64, 64),
      new THREE.MeshBasicMaterial({ color: '#0a0f22' }),
    )
    this.spin.add(core)

    this.atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.18, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color('#5470e0') }, uOpacity: { value: 0.32 } },
      }),
    )
    this.root.add(this.atmosphere)
  }

  private buildArcs() {
    const routes: [PlaceKey, PlaceKey][] = [
      ['istanbul', 'fortWorth'],
      ['fortWorth', 'sanAntonio'],
      ['fortWorth', 'newYork'],
      ['fortWorth', 'lasVegas'],
      ['lasVegas', 'istanbul'],
    ]
    for (const [a, b] of routes) {
      const A = latLonToVec3(places[a].lat, places[a].lon)
      const B = latLonToVec3(places[b].lat, places[b].lon)
      const angle = A.angleTo(B)
      const lift = 1 + 0.08 + angle * 0.32
      const c1 = A.clone().lerp(B, 0.25).normalize().multiplyScalar(lift)
      const c2 = A.clone().lerp(B, 0.75).normalize().multiplyScalar(lift)
      const curve = new THREE.CubicBezierCurve3(A, c1, c2, B)
      const geo = new THREE.TubeGeometry(curve, 160, angle > 1 ? 0.0055 : 0.0045, 8, false)
      const mat = new THREE.ShaderMaterial({
        vertexShader: arcVertex,
        fragmentShader: arcFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uFrom: { value: new THREE.Color('#ffb547') },
          uTo: { value: new THREE.Color('#ff6a4d') },
          uDraw: { value: 0 },
          uOpacity: { value: 0 },
          uFade: { value: 1 },
          uTime: { value: 0 },
          uBoth: { value: 0 },
        },
      })
      const mesh = new THREE.Mesh(geo, mat)
      this.spin.add(mesh)
      this.arcs.push({ key: arcKey(a, b), mesh })
    }
  }

  private buildPins() {
    for (const key of Object.keys(places) as PlaceKey[]) {
      const p = places[key]
      const world = latLonToVec3(p.lat, p.lon, 1.002)
      const group = new THREE.Group()
      group.position.copy(world)
      group.lookAt(world.clone().multiplyScalar(2))
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.012, 24),
        new THREE.MeshBasicMaterial({ color: '#ffc46b', transparent: true }),
      )
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.026, 40),
        new THREE.MeshBasicMaterial({ color: '#ffb547', transparent: true, opacity: 0, side: THREE.DoubleSide }),
      )
      group.add(dot, ring)
      this.spin.add(group)

      const label = document.createElement('div')
      label.className = 'globe-label'
      label.textContent = p.label
      label.dataset.place = key
      this.labelLayer.appendChild(label)
      this.pins.push({ key, group, ring, dot, label, world })
    }
  }

  /** Point the globe at a place (or the Atlantic midpoint for the bridge) and light up one route. */
  focus(focus: Focus, arc?: [PlaceKey, PlaceKey]) {
    let lat: number
    let lon: number
    let dist: number
    this.activePlaces.clear()
    this.showLabels = focus !== 'hero'
    if (focus === 'bridge' || focus === 'hero') {
      lat = focus === 'hero' ? 26 : 36
      lon = focus === 'hero' ? -34 : -18
      dist = focus === 'hero' ? 5.6 : 6.0
    } else {
      const p = places[focus]
      lat = p.lat - 6
      // Center a little east so the place sits on the side of the globe facing the text.
      lon = p.lon + 22
      dist = 3.7
      this.activePlaces.add(focus)
    }
    if (arc) arc.forEach((k) => this.activePlaces.add(k))

    // Take the short way around.
    let dLon = lon - this.view.lon
    dLon = ((dLon + 540) % 360) - 180
    const d = this.reducedMotion ? 0 : 1.6
    gsap.to(this.view, { lat, lon: this.view.lon + dLon, dist, duration: d, ease: 'power3.inOut', overwrite: 'auto' })
    gsap.to(this.view, { drift: focus === 'hero' ? 1 : 0, duration: d })

    // Wide views show the whole route network softly; a chapter lights up one route.
    const network = !arc && (focus === 'hero' || focus === 'bridge')
    const nextArc = arc ? arcKey(arc[0], arc[1]) : ''
    for (const a of this.arcs) {
      const on = a.key === nextArc
      const u = a.mesh.material.uniforms
      u.uBoth.value = 0
      gsap.killTweensOf(u.uDraw)
      if (on && a.key !== this.activeArc) {
        // A newly chosen route draws itself from the start.
        u.uDraw.value = 0
        gsap.to(u.uDraw, { value: 1, duration: this.reducedMotion ? 0 : 1.8, ease: 'power2.out' })
      } else if (!on) {
        u.uDraw.value = 1
      }
      gsap.to(u.uOpacity, { value: on ? 1 : network ? 0.45 : 0.12, duration: d * 0.6 })
    }
    this.activeArc = nextArc
  }

  /** Where the globe sits on screen and how strongly it shows. */
  setLayout(layout: Layout, opacity = 1) {
    const d = this.reducedMotion ? 0 : 1.2
    const x = layout === 'side' ? 0.25 : 0
    const y = layout === 'top' ? 0.8 : 0
    gsap.to(this.view, { x, y, opacity, duration: d, ease: 'power2.inOut' })
  }

  private onPointer = (e: PointerEvent) => {
    this.pointer.x = e.clientX / window.innerWidth - 0.5
    this.pointer.y = e.clientY / window.innerHeight - 0.5
  }

  private onVisibility = () => {
    this.running = !document.hidden
    if (this.running) this.loop()
  }

  private resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  private tmp = new THREE.Vector3()
  private normal = new THREE.Vector3()
  private toCam = new THREE.Vector3()

  private loop = () => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.loop)
    const t = (performance.now() - this.start) / 1000
    const v = this.view
    const drift = this.reducedMotion ? 0 : v.drift * Math.sin(t * 0.12) * 10
    const px = this.reducedMotion ? 0 : this.pointer.x * 6
    const py = this.reducedMotion ? 0 : this.pointer.y * 4

    const lon = v.lon + drift + px
    const lat = v.lat + py
    // Bring (lat, lon) to face the camera with north up.
    const alpha = Math.PI / 2 - (lon + 180) * DEG
    this.spin.rotation.set(lat * DEG, alpha, 0, 'XYZ')

    // Narrow screens keep the globe smaller so it never crowds the text.
    const narrow = this.camera.aspect < 0.8
    this.camera.position.z = v.dist * (narrow ? 1.55 : 1)
    // x is a fraction of camera distance so the globe keeps its place on screen while zooming.
    this.root.position.set(narrow ? 0 : v.x * v.dist, v.y * (narrow ? 1.3 : 1), 0)

    this.dots.material.uniforms.uTime.value = t
    this.dots.material.uniforms.uOpacity.value = v.opacity
    this.atmosphere.material.uniforms.uOpacity.value = 0.32 * v.opacity
    for (const a of this.arcs) {
      a.mesh.material.uniforms.uTime.value = this.reducedMotion ? 0.3 : t
      a.mesh.material.uniforms.uFade.value = v.opacity
    }

    this.root.updateMatrixWorld()
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    for (const pin of this.pins) {
      const on = this.activePlaces.has(pin.key)
      const s = 1 + ((t * 0.8) % 1) * 1.6
      pin.ring.scale.setScalar(on ? s : 1)
      pin.ring.material.opacity = on ? (1 - ((t * 0.8) % 1)) * v.opacity : 0
      pin.dot.material.opacity = v.opacity

      pin.group.getWorldPosition(this.tmp)
      this.normal.copy(this.tmp).sub(this.root.position).normalize()
      this.toCam.copy(this.camera.position).sub(this.tmp).normalize()
      const visible = on && this.showLabels && this.normal.dot(this.toCam) > 0.15 && v.opacity > 0.5
      this.tmp.project(this.camera)
      pin.label.style.transform = `translate(${((this.tmp.x + 1) / 2) * w}px, ${((1 - this.tmp.y) / 2) * h}px)`
      pin.label.classList.toggle('is-on', visible)
    }

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.running = false
    cancelAnimationFrame(this.raf)
    this.resizeObserver.disconnect()
    window.removeEventListener('pointermove', this.onPointer)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.pins.forEach((p) => p.label.remove())
    this.renderer.dispose()
  }
}
