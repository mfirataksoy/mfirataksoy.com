import * as THREE from 'three'
import gsap from 'gsap'
import type { DeskKey } from '../content'

type Clickable = {
  id: DeskKey
  group: THREE.Group
  base: THREE.Vector3
  hit: THREE.Object3D[]
}

const C = {
  top: '#202846',
  edge: '#ffb547',
  leg: '#141a32',
  metal: '#c7cde0',
  dark: '#1a1f2e',
  graphite: '#2b3142',
  pcb: '#1d6b4b',
  amber: '#ffb547',
  coral: '#ff6a4d',
  blue: '#6f86e6',
  green: '#4ade80',
}

const mat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, ...extra })

function box(w: number, h: number, d: number, m: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function cyl(rt: number, rb: number, h: number, m: THREE.Material, seg = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

// Little canvases that act as screens.
function screenTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 256, h = 160) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d')!, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function codeScreen() {
  const tex = screenTexture((ctx, w, h) => {
    ctx.fillStyle = '#0b1020'
    ctx.fillRect(0, 0, w, h * 2)
    const colors = [C.amber, C.blue, '#e9ecf5', C.coral, '#8d9dd6']
    let y = 12
    let seed = 7
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
    while (y < h * 2) {
      let x = 12 + Math.floor(rnd() * 3) * 14
      const words = 1 + Math.floor(rnd() * 4)
      for (let i = 0; i < words; i++) {
        const len = 14 + rnd() * 46
        ctx.fillStyle = colors[Math.floor(rnd() * colors.length)]
        ctx.globalAlpha = 0.85
        ctx.fillRect(x, y, len, 5)
        x += len + 8
      }
      y += 12
    }
  }, 256, 320)
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 0.5)
  return tex
}

function chatScreen() {
  return screenTexture((ctx, w, h) => {
    ctx.fillStyle = '#0e1424'
    ctx.fillRect(0, 0, w, h)
    const bubble = (x: number, y: number, bw: number, color: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x, y, bw, 34, 12)
      ctx.fill()
    }
    bubble(14, 30, 130, '#2a3350')
    bubble(w - 154, 80, 140, '#1f7a4f')
    bubble(14, 130, 100, '#2a3350')
    // a "sticker"
    ctx.fillStyle = C.amber
    ctx.beginPath()
    ctx.arc(w - 70, 230, 34, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0e1424'
    ctx.beginPath()
    ctx.arc(w - 82, 222, 5, 0, Math.PI * 2)
    ctx.arc(w - 58, 222, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#0e1424'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(w - 70, 232, 14, 0.2, Math.PI - 0.2)
    ctx.stroke()
  }, 160, 300)
}

export class Desk {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  private world = new THREE.Group()
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2(9, 9)
  private sway = { x: 0, y: 0 }
  private items: Clickable[] = []
  private hovered: Clickable | null = null
  private selectedRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  private selected: Clickable | null = null
  private raf = 0
  private visible = false
  private start = performance.now()
  private resizeObserver: ResizeObserver
  private intersection: IntersectionObserver
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Animated bits.
  private code!: THREE.CanvasTexture
  private fan!: THREE.Mesh
  private leds: THREE.MeshStandardMaterial[] = []
  private lampLight!: THREE.PointLight

  constructor(
    private canvas: HTMLCanvasElement,
    private onSelect: (id: DeskKey) => void,
    private onHover: (id: DeskKey | null, x: number, y: number) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.camera.position.set(9, 8.2, 9)
    this.camera.lookAt(0, 1.4, 0)
    this.scene.add(this.world)

    this.buildLights()
    this.buildDesk()
    this.buildLaptop()
    this.buildJetson()
    this.buildPhone()
    this.buildHeadset()
    this.buildServer()
    this.buildDecor()

    this.selectedRing = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.7, 48),
      new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0, side: THREE.DoubleSide }),
    )
    this.selectedRing.rotation.x = -Math.PI / 2
    this.selectedRing.position.y = 2.021
    this.world.add(this.selectedRing)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()

    // Only render while the desk is on screen; the globe already uses the GPU elsewhere.
    this.intersection = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting
      if (this.visible) this.loop()
    })
    this.intersection.observe(canvas)

    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerleave', this.onPointerLeave)
    canvas.addEventListener('click', this.onClick)
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight('#9fb0ff', '#0b1020', 0.9))
    const key = new THREE.DirectionalLight('#ffffff', 1.4)
    key.position.set(5, 10, 3)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -6
    key.shadow.camera.right = 6
    key.shadow.camera.top = 6
    key.shadow.camera.bottom = -6
    key.shadow.radius = 4
    this.scene.add(key)
    this.lampLight = new THREE.PointLight('#ffb05c', 6, 6, 1.6)
    this.lampLight.position.set(-2.1, 3.3, -0.6)
    this.world.add(this.lampLight)
  }

  private buildDesk() {
    const top = box(6.4, 0.18, 3.4, mat(C.top, { roughness: 0.45 }))
    top.position.y = 1.92
    this.world.add(top)
    const edge = box(6.42, 0.03, 3.42, mat(C.edge, { emissive: C.edge, emissiveIntensity: 0.25 }))
    edge.position.y = 1.83
    this.world.add(edge)
    for (const [x, z] of [[-3, -1.5], [3, -1.5], [-3, 1.5], [3, 1.5]]) {
      const leg = box(0.14, 1.84, 0.14, mat(C.leg))
      leg.position.set(x, 0.92, z)
      this.world.add(leg)
    }
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.35 }))
    shadow.rotation.x = -Math.PI / 2
    shadow.receiveShadow = true
    this.world.add(shadow)
  }

  private register(id: DeskKey, group: THREE.Group) {
    const hit: THREE.Object3D[] = []
    group.traverse((o) => (o as THREE.Mesh).isMesh && hit.push(o))
    this.world.add(group)
    this.items.push({ id, group, base: group.position.clone(), hit })
  }

  private buildLaptop() {
    const g = new THREE.Group()
    const alu = mat(C.metal, { metalness: 0.6, roughness: 0.35 })
    const base = box(1.7, 0.06, 1.15, alu)
    base.position.y = 0.03
    g.add(base)
    const keys = box(1.45, 0.01, 0.55, mat(C.graphite))
    keys.position.set(0, 0.065, -0.1)
    g.add(keys)
    const lid = new THREE.Group()
    lid.position.set(0, 0.06, -0.55)
    lid.rotation.x = -0.28
    const back = box(1.7, 1.1, 0.04, alu)
    back.position.y = 0.55
    lid.add(back)
    this.code = codeScreen()
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.56, 0.96),
      new THREE.MeshBasicMaterial({ map: this.code, toneMapped: false }),
    )
    screen.position.set(0, 0.56, 0.021)
    lid.add(screen)
    g.add(lid)
    g.position.set(-0.4, 2.01, 0.2)
    g.rotation.y = 0.35
    this.register('laptop', g)
  }

  private buildJetson() {
    const g = new THREE.Group()
    const pcb = box(0.95, 0.05, 0.75, mat(C.pcb, { roughness: 0.5 }))
    pcb.position.y = 0.025
    g.add(pcb)
    const sink = box(0.55, 0.12, 0.5, mat(C.graphite, { metalness: 0.5 }))
    sink.position.y = 0.11
    g.add(sink)
    for (let i = -2; i <= 2; i++) {
      const fin = box(0.04, 0.12, 0.5, mat('#3a4156', { metalness: 0.5 }))
      fin.position.set(i * 0.11, 0.23, 0)
      g.add(fin)
    }
    this.fan = cyl(0.17, 0.17, 0.03, mat('#11151f'), 6)
    this.fan.position.y = 0.31
    g.add(this.fan)
    // Camera on a little arm, looking at a can of beans.
    const pole = cyl(0.025, 0.025, 1.1, mat(C.dark))
    pole.position.set(0.62, 0.55, -0.1)
    g.add(pole)
    const arm = box(0.5, 0.04, 0.04, mat(C.dark))
    arm.position.set(0.4, 1.1, -0.1)
    g.add(arm)
    const cam = box(0.18, 0.12, 0.14, mat(C.dark))
    cam.position.set(0.2, 1.04, -0.1)
    g.add(cam)
    const lens = cyl(0.04, 0.04, 0.05, mat('#0b1020', { emissive: C.blue, emissiveIntensity: 0.8 }))
    lens.position.set(0.2, 0.96, -0.1)
    g.add(lens)
    const can = cyl(0.13, 0.13, 0.32, mat(C.coral, { roughness: 0.4, metalness: 0.3 }))
    can.position.set(0.2, 0.16, 0.6)
    g.add(can)
    const label = cyl(0.132, 0.132, 0.14, mat('#f5efe6'))
    label.position.set(0.2, 0.16, 0.6)
    g.add(label)
    g.position.set(1.85, 2.01, -0.75)
    g.rotation.y = -0.3
    this.register('jetson', g)
  }

  private buildPhone() {
    const g = new THREE.Group()
    const dock = box(0.42, 0.08, 0.32, mat(C.graphite))
    dock.position.y = 0.04
    g.add(dock)
    const phone = new THREE.Group()
    phone.position.set(0, 0.06, -0.04)
    phone.rotation.x = -0.25
    const body = box(0.42, 0.82, 0.05, mat('#0e1220', { metalness: 0.4, roughness: 0.3 }))
    body.position.y = 0.41
    phone.add(body)
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.37, 0.74),
      new THREE.MeshBasicMaterial({ map: chatScreen(), toneMapped: false }),
    )
    screen.position.set(0, 0.42, 0.026)
    phone.add(screen)
    g.add(phone)
    g.position.set(1.35, 2.01, 0.95)
    g.rotation.y = -0.5
    this.register('phone', g)
  }

  private buildHeadset() {
    const g = new THREE.Group()
    const stand = cyl(0.05, 0.05, 0.9, mat(C.dark))
    stand.position.y = 0.45
    g.add(stand)
    const foot = cyl(0.26, 0.28, 0.05, mat(C.dark))
    foot.position.y = 0.025
    g.add(foot)
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.045, 12, 40, Math.PI),
      mat(C.amber, { roughness: 0.4 }),
    )
    band.castShadow = true
    band.position.y = 0.92
    g.add(band)
    for (const side of [-1, 1]) {
      const cup = cyl(0.17, 0.17, 0.12, mat('#262c3f'))
      cup.rotation.z = Math.PI / 2
      cup.position.set(side * 0.38, 0.86, 0)
      g.add(cup)
      const pad = cyl(0.13, 0.13, 0.03, mat('#11151f'))
      pad.rotation.z = Math.PI / 2
      pad.position.set(side * 0.31, 0.86, 0)
      g.add(pad)
    }
    const mic = cyl(0.015, 0.015, 0.4, mat(C.dark))
    mic.rotation.z = 1.1
    mic.position.set(-0.28, 0.7, 0.14)
    g.add(mic)
    g.position.set(-2.35, 2.01, 1.0)
    g.rotation.y = 0.5
    this.register('headset', g)
  }

  private buildServer() {
    const g = new THREE.Group()
    const tower = box(0.8, 1.6, 0.9, mat('#171c2c', { metalness: 0.4, roughness: 0.4 }))
    tower.position.y = 0.8
    g.add(tower)
    for (let row = 0; row < 4; row++) {
      const slot = box(0.66, 0.26, 0.02, mat('#222941'))
      slot.position.set(0, 0.32 + row * 0.34, 0.455)
      g.add(slot)
      for (let i = 0; i < 3; i++) {
        const m = mat('#0b1020', { emissive: i === 0 ? C.green : C.amber, emissiveIntensity: 1 })
        this.leds.push(m)
        const led = box(0.05, 0.05, 0.02, m)
        led.position.set(-0.24 + i * 0.09, 0.32 + row * 0.34, 0.47)
        g.add(led)
      }
    }
    g.position.set(3.75, 0, 0.4)
    g.rotation.y = -0.15
    this.register('server', g)
  }

  private buildDecor() {
    // Lamp
    const lamp = new THREE.Group()
    const base = cyl(0.24, 0.28, 0.06, mat(C.dark))
    base.position.y = 0.03
    lamp.add(base)
    const arm1 = cyl(0.025, 0.025, 1.0, mat(C.dark))
    arm1.position.set(0.12, 0.5, 0)
    arm1.rotation.z = -0.25
    lamp.add(arm1)
    const arm2 = cyl(0.025, 0.025, 0.8, mat(C.dark))
    arm2.position.set(0.05, 1.12, 0.2)
    arm2.rotation.x = 0.9
    lamp.add(arm2)
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.3, 24, 1, true),
      mat(C.amber, { side: THREE.DoubleSide, emissive: '#ff9a3c', emissiveIntensity: 0.5 }),
    )
    shade.position.set(0.0, 1.35, 0.55)
    shade.rotation.x = 0.6
    lamp.add(shade)
    lamp.position.set(-2.3, 2.01, -1.05)
    this.world.add(lamp)

    // Mug
    const mug = cyl(0.13, 0.12, 0.26, mat('#e9ecf5'))
    mug.position.set(0.85, 2.14, 1.05)
    this.world.add(mug)
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16), mat('#e9ecf5'))
    handle.position.set(0.99, 2.14, 1.05)
    this.world.add(handle)

    // Plant
    const pot = cyl(0.2, 0.15, 0.3, mat(C.coral, { roughness: 0.8 }))
    pot.position.set(-3.6, 0.15, -1.2)
    this.world.add(pot)
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.7 + (i % 3) * 0.15, 6), mat('#3f8f63'))
      leaf.castShadow = true
      const a = (i / 6) * Math.PI * 2
      leaf.position.set(-3.6 + Math.cos(a) * 0.08, 0.6, -1.2 + Math.sin(a) * 0.08)
      leaf.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35)
      this.world.add(leaf)
    }

    // Notebook and pen
    const book = box(0.7, 0.05, 0.95, mat('#2f3a66'))
    book.position.set(-1.45, 2.04, -0.35)
    book.rotation.y = -0.2
    this.world.add(book)
    const pen = cyl(0.018, 0.018, 0.6, mat(C.amber))
    pen.rotation.set(Math.PI / 2, 0, 0.6)
    pen.position.set(-1.35, 2.09, -0.3)
    this.world.add(pen)
  }

  /** Highlight the object whose story is open in the panel. */
  select(id: DeskKey) {
    const item = this.items.find((i) => i.id === id)
    if (!item) return
    this.selected = item
    const p = item.group.position
    const ring = this.selectedRing
    const onFloor = p.y < 1
    gsap.to(ring.position, { x: p.x, z: p.z, y: onFloor ? 0.01 : 2.021, duration: this.reducedMotion ? 0 : 0.5, ease: 'power3.out' })
    gsap.to(ring.material, { opacity: 0.9, duration: 0.3 })
    if (!this.visible) this.renderOnce()
  }

  private pick(): Clickable | null {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(this.items.flatMap((i) => i.hit), false)
    if (!hits.length) return null
    return this.items.find((i) => i.hit.includes(hits[0].object)) ?? null
  }

  private onPointerMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect()
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    this.sway.x = this.pointer.x
    this.sway.y = this.pointer.y
    const hit = this.pick()
    if (hit !== this.hovered) {
      if (this.hovered) this.lift(this.hovered, false)
      if (hit) this.lift(hit, true)
      this.hovered = hit
      this.canvas.style.cursor = hit ? 'pointer' : 'default'
    }
    this.onHover(hit?.id ?? null, e.clientX - r.left, e.clientY - r.top)
  }

  private onPointerLeave = () => {
    if (this.hovered) this.lift(this.hovered, false)
    this.hovered = null
    this.pointer.set(9, 9)
    this.sway.x = 0
    this.sway.y = 0
    this.onHover(null, 0, 0)
  }

  private onClick = () => {
    const hit = this.pick()
    if (hit) this.onSelect(hit.id)
  }

  private lift(item: Clickable, up: boolean) {
    gsap.to(item.group.position, {
      y: item.base.y + (up ? 0.18 : 0),
      duration: this.reducedMotion ? 0 : 0.35,
      ease: up ? 'back.out(2)' : 'power2.out',
    })
  }

  private resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    // Fit the desk: keep a fixed world height, widen for wide canvases.
    const view = 5.7
    const aspect = w / h
    const half = aspect >= 1.25 ? view / 2 : (view * 1.25) / aspect / 2
    this.camera.left = -half * aspect
    this.camera.right = half * aspect
    this.camera.top = half
    this.camera.bottom = -half
    this.camera.updateProjectionMatrix()
    if (!this.visible) this.renderOnce()
  }

  private renderOnce() {
    this.renderer.render(this.scene, this.camera)
  }

  private loop = () => {
    if (!this.visible) return
    this.raf = requestAnimationFrame(this.loop)
    const t = (performance.now() - this.start) / 1000
    if (!this.reducedMotion) {
      this.world.rotation.y += (this.sway.x * 0.12 - this.world.rotation.y) * 0.05
      this.world.rotation.x += (-this.sway.y * 0.04 - this.world.rotation.x) * 0.05
      this.code.offset.y = (t * 0.04) % 1
      this.fan.rotation.y = t * 6
      this.leds.forEach((m, i) => (m.emissiveIntensity = 0.4 + 0.6 * (Math.sin(t * (2 + (i % 5)) + i) > 0.2 ? 1 : 0)))
      this.lampLight.intensity = 6 + Math.sin(t * 1.3) * 0.3
      if (this.selected) this.selectedRing.scale.setScalar(1 + Math.sin(t * 3) * 0.04)
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.visible = false
    cancelAnimationFrame(this.raf)
    this.resizeObserver.disconnect()
    this.intersection.disconnect()
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave)
    this.canvas.removeEventListener('click', this.onClick)
    this.renderer.dispose()
  }
}
