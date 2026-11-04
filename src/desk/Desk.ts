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
  top: '#16223f',
  edge: '#c8a45d',
  leg: '#0f182f',
  metal: '#c9ccd3',
  dark: '#171e30',
  graphite: '#283044',
  pcb: '#2d4a42',
  gold: '#c8a45d',
  ivory: '#ece7dc',
  tin: '#9aa3b5',
  sky: '#8fb4e6',
  blue: '#7d8fbf',
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
    const colors = [C.gold, C.blue, C.ivory, C.sky, '#5d6b8f']
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
    bubble(14, 30, 130, '#243150')
    bubble(w - 154, 80, 140, '#3b5683')
    bubble(14, 130, 100, '#243150')
    bubble(w - 124, 180, 110, '#3b5683')
  }, 160, 300)
}

export type ScreenKey = 'laptop' | 'tv' | 'phone'

type Screen = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  idle: THREE.Texture
  aspect: number
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
  private screens: Partial<Record<ScreenKey, Screen>> = {}
  private loader = new THREE.TextureLoader()
  private textures = new Map<string, Promise<THREE.Texture>>()
  private fridgeDoor!: THREE.Group
  private fridgeLight!: THREE.PointLight
  private fridgeInner!: THREE.MeshStandardMaterial
  private leds: THREE.MeshStandardMaterial[] = []
  // The H-E-B camera's infrared glow, switched on while the fridge is selected.
  private ir = { level: 0 } as {
    level: number
    beam: THREE.MeshBasicMaterial
    light: THREE.SpotLight
    leds: THREE.MeshStandardMaterial
    body: THREE.MeshStandardMaterial
    halo: THREE.MeshBasicMaterial
  }

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
    this.camera.lookAt(0, 2.0, 0)
    this.scene.add(this.world)

    this.buildLights()
    this.buildDesk()
    this.buildLaptop()
    this.buildFridge()
    this.buildPhone()
    this.buildCalendar()
    this.buildTv()
    this.buildServer()
    // The phone on the desk rests on StickerHub.
    this.idleOn('phone', '/previews/stickerhub.jpg')

    this.selectedRing = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.7, 48),
      new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0, side: THREE.DoubleSide }),
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
    const key = new THREE.DirectionalLight('#f4f1ea', 1.3)
    key.position.set(5, 10, 3)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -6
    key.shadow.camera.right = 6
    key.shadow.camera.top = 6
    key.shadow.camera.bottom = -6
    key.shadow.radius = 4
    this.scene.add(key)
    // A soft warm fill from above the room, so the desk, fridge and wall read at night.
    const fill = new THREE.PointLight('#ffe2bc', 7, 11, 1.4)
    fill.position.set(-1.2, 5.6, 0.2)
    this.world.add(fill)
  }

  // A small room, laid out like a diorama: floor, two walls, a rug, and a
  // compact desk in the middle with the TV, fridge and wall calendar around it.
  private buildDesk() {
    const R = { x0: -4.42, x1: 2.5, z0: -3.8, z1: 1.75, wallH: 3.9 }
    const floor = box(R.x1 - R.x0, 0.16, R.z1 - R.z0, mat('#141d36', { roughness: 0.85 }))
    floor.position.set((R.x0 + R.x1) / 2, -0.08, (R.z0 + R.z1) / 2)
    floor.castShadow = false
    this.world.add(floor)
    const wallMat = mat('#111a31', { roughness: 0.95 })
    const trim = mat(C.edge, { emissive: C.edge, emissiveIntensity: 0.2, metalness: 0.5 })
    // Left wall, which also holds the calendar.
    const left = box(0.12, R.wallH, R.z1 - R.z0, wallMat)
    left.position.set(R.x0 + 0.06, R.wallH / 2, (R.z0 + R.z1) / 2)
    this.world.add(left)
    const leftSkirt = box(0.04, 0.14, R.z1 - R.z0, trim)
    leftSkirt.position.set(R.x0 + 0.14, 0.07, (R.z0 + R.z1) / 2)
    this.world.add(leftSkirt)
    // Back wall behind the TV.
    const back = box(R.x1 - R.x0, R.wallH, 0.12, mat('#0f172d', { roughness: 0.95 }))
    back.position.set((R.x0 + R.x1) / 2, R.wallH / 2, R.z0 + 0.06)
    this.world.add(back)
    const backSkirt = box(R.x1 - R.x0 - 0.12, 0.14, 0.04, trim)
    backSkirt.position.set((R.x0 + R.x1) / 2 + 0.06, 0.07, R.z0 + 0.14)
    this.world.add(backSkirt)
    // A rug under the desk, with a thin gold border.
    const rugBorder = box(4.6, 0.02, 3.1, mat(C.edge, { roughness: 0.9 }))
    rugBorder.position.set(0.1, 0.01, 0.25)
    rugBorder.castShadow = false
    this.world.add(rugBorder)
    const rug = box(4.48, 0.024, 2.98, mat('#1d2b4d', { roughness: 1 }))
    rug.position.set(0.1, 0.012, 0.25)
    rug.castShadow = false
    this.world.add(rug)

    // The desk: smaller, with room for a laptop and a phone.
    const DW = 4.0, DD = 2.0, DX = 0.15, DZ = 0.25
    const top = box(DW, 0.14, DD, mat(C.top, { roughness: 0.45 }))
    top.position.set(DX, 1.94, DZ)
    this.world.add(top)
    const edge = box(DW + 0.02, 0.03, DD + 0.02, mat(C.edge, { emissive: C.edge, emissiveIntensity: 0.25 }))
    edge.position.set(DX, 1.86, DZ)
    this.world.add(edge)
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const leg = box(0.1, 1.86, 0.1, mat(C.leg))
      leg.position.set(DX + sx * (DW / 2 - 0.16), 0.93, DZ + sz * (DD / 2 - 0.14))
      this.world.add(leg)
    }
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
    this.screens.laptop = { mesh: screen, idle: this.code, aspect: 1.56 / 0.96 }
    g.add(lid)
    g.position.set(-0.15, 2.01, 0.2)
    g.rotation.y = 0.3
    this.register('laptop', g)
  }

  // H-E-B's smart grocery device lived with people's groceries, so it gets a
  // fridge with the device mounted inside its door; the door opens on click.
  private buildFridge() {
    const g = new THREE.Group()
    const W = 1.5
    const H = 3.3
    const D = 1.15
    const shell = mat('#d9dde4', { roughness: 0.35, metalness: 0.25 })
    const inner = mat('#eef0f2', { roughness: 0.6, emissive: '#fff4dc', emissiveIntensity: 0 })
    this.fridgeInner = inner
    const back = box(W, H, 0.06, inner)
    back.position.set(0, H / 2, -D / 2 + 0.03)
    g.add(back)
    for (const side of [-1, 1]) {
      const wall = box(0.06, H, D, shell)
      wall.position.set(side * (W / 2 - 0.03), H / 2, 0)
      g.add(wall)
    }
    const top = box(W, 0.06, D, shell)
    top.position.set(0, H - 0.03, 0)
    g.add(top)
    const bottom = box(W, 0.12, D, shell)
    bottom.position.set(0, 0.06, 0)
    g.add(bottom)
    // Shelves and groceries.
    const groceries = [C.gold, C.sky, C.ivory, '#9fb59a', C.tin, '#c98b6b']
    for (let i = 0; i < 4; i++) {
      const y = 0.45 + i * 0.72
      const shelf = box(W - 0.12, 0.03, D - 0.12, mat('#cfd6de', { transparent: true, opacity: 0.85 }))
      shelf.position.set(0, y, 0.02)
      g.add(shelf)
      for (let j = 0; j < 3; j++) {
        const color = groceries[(i * 3 + j) % groceries.length]
        const item =
          (i + j) % 2
            ? cyl(0.09, 0.09, 0.34, mat(color, { roughness: 0.4 }))
            : box(0.26, 0.38, 0.18, mat(color, { roughness: 0.7 }))
        item.position.set(-0.42 + j * 0.42, y + 0.2, -0.1 + ((i + j) % 3) * 0.08)
        g.add(item)
      }
    }
    this.fridgeLight = new THREE.PointLight('#fff1d6', 0, 3, 1.5)
    this.fridgeLight.position.set(0, H - 0.5, 0.3)
    g.add(this.fridgeLight)
    // The door hangs on its left edge.
    const hinge = new THREE.Group()
    hinge.position.set(-W / 2, 0, D / 2)
    const door = box(W, H - 0.04, 0.09, shell)
    door.position.set(W / 2, H / 2, 0.045)
    hinge.add(door)
    const seam = box(W - 0.04, 0.015, 0.01, mat('#a9b0bb'))
    seam.position.set(W / 2, H * 0.68, 0.095)
    hinge.add(seam)
    const handle = box(0.05, 0.8, 0.06, mat(C.gold, { metalness: 0.7, roughness: 0.3 }))
    handle.position.set(W - 0.14, H * 0.5, 0.13)
    hinge.add(handle)
    // The H-E-B device itself, mounted inside the door: a red cube with a white top
    // and a camera in a cutout, looking at the shelves. It shows when the door opens.
    const device = new THREE.Group()
    const S = 0.36
    const red = mat('#e01e2b', { roughness: 0.45, emissive: '#ff2a3c', emissiveIntensity: 0 })
    const body = box(S, S * 0.86, S, red)
    body.position.y = (S * 0.86) / 2
    device.add(body)
    const cap = box(S + 0.012, S * 0.14, S + 0.012, mat('#f4f2ee', { roughness: 0.4 }))
    cap.position.y = S * 0.86 + (S * 0.14) / 2
    device.add(cap)
    const cutout = box(S * 0.46, S * 0.46, 0.02, mat('#0b0f1a', { roughness: 0.9 }))
    cutout.position.set(0, S * 0.45, S / 2 - 0.006)
    device.add(cutout)
    const camBody = cyl(S * 0.13, S * 0.13, 0.03, mat('#1b2133', { metalness: 0.5, roughness: 0.3 }))
    camBody.rotation.x = Math.PI / 2
    camBody.position.set(0, S * 0.45, S / 2 + 0.008)
    device.add(camBody)
    const glass = cyl(S * 0.075, S * 0.075, 0.012, mat('#0b1020', { emissive: C.sky, emissiveIntensity: 1.1, metalness: 0.6, roughness: 0.15 }))
    glass.rotation.x = Math.PI / 2
    glass.position.set(0, S * 0.45, S / 2 + 0.026)
    device.add(glass)
    // A ring of infrared LEDs around the lens, dark until the camera is on.
    const irLeds = mat('#3a0d14', { emissive: '#ff2a3c', emissiveIntensity: 0 })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const led = cyl(0.012, 0.012, 0.01, irLeds, 8)
      led.rotation.x = Math.PI / 2
      led.position.set(Math.cos(a) * S * 0.19, S * 0.45 + Math.sin(a) * S * 0.19, S / 2 + 0.004)
      device.add(led)
    }
    // The beam: a soft red cone from the lens toward the shelves, and the light it casts.
    const beam = new THREE.MeshBasicMaterial({
      color: '#ff3048',
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const beamLen = 1.0
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.42, beamLen, 32, 1, true), beam)
    cone.rotation.x = -Math.PI / 2
    cone.position.set(0, S * 0.45, S / 2 + beamLen / 2 + 0.02)
    cone.castShadow = false
    device.add(cone)
    const irLight = new THREE.SpotLight('#ff2a3c', 0, 3, 0.6, 0.6, 1.2)
    irLight.position.set(0, S * 0.45, S / 2 + 0.03)
    irLight.target.position.set(0, S * 0.2, S / 2 + 1.5)
    device.add(irLight, irLight.target)
    // A halo behind the device so it stands out when selected.
    const halo = new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0, depthWrite: false, side: THREE.BackSide })
    const haloMesh = new THREE.Mesh(new THREE.BoxGeometry(S + 0.06, S + 0.06, S + 0.06), halo)
    haloMesh.position.y = S / 2
    device.add(haloMesh)
    this.ir = { level: 0, beam, light: irLight, leds: irLeds, body: red, halo }

    const status = box(0.03, 0.03, 0.01, mat('#7dff9a', { emissive: '#7dff9a', emissiveIntensity: 1.4 }))
    status.position.set(S * 0.32, S * 0.74, S / 2 + 0.003)
    device.add(status)
    device.rotation.y = Math.PI
    device.position.set(W * 0.5, H - 0.5, -S / 2)
    hinge.add(device)

    g.add(hinge)
    this.fridgeDoor = hinge
    g.position.set(-3.15, 0, -2.45)
    g.rotation.y = 0.12
    this.register('fridge', g)
  }

  private setFridgeOpen(open: boolean) {
    const d = this.reducedMotion ? 0 : 0.9
    gsap.to(this.fridgeDoor.rotation, { y: open ? -1.75 : 0, duration: d, ease: open ? 'power3.out' : 'power2.inOut' })
    gsap.to(this.fridgeLight, { intensity: open ? 2.4 : 0, duration: d * 0.6 })
    gsap.to(this.fridgeInner, { emissiveIntensity: open ? 0.35 : 0, duration: d * 0.6 })
    gsap.to(this.ir, { level: open ? 1 : 0, duration: d * 0.8, delay: open ? d * 0.5 : 0, onUpdate: () => this.applyIr(0) })
  }

  /** Set the camera's infrared glow from its level (0 off, 1 on), with a slow pulse. */
  private applyIr(t: number) {
    const k = this.ir.level * (0.85 + 0.15 * Math.sin(t * 4))
    this.ir.beam.opacity = 0.16 * k
    this.ir.light.intensity = 6 * k
    this.ir.leds.emissiveIntensity = 2.2 * k
    this.ir.body.emissiveIntensity = 0.22 * k
    this.ir.halo.opacity = 0.55 * this.ir.level
  }

  private buildPhone() {
    // The phone lies flat on the desk, screen up.
    const g = new THREE.Group()
    const body = box(0.42, 0.05, 0.82, mat('#0e1220', { metalness: 0.4, roughness: 0.3 }))
    body.position.y = 0.025
    g.add(body)
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.37, 0.74),
      new THREE.MeshBasicMaterial({ map: chatScreen(), toneMapped: false }),
    )
    screen.rotation.x = -Math.PI / 2
    screen.position.set(0, 0.052, 0)
    g.add(screen)
    this.screens.phone = { mesh: screen, idle: screen.material.map!, aspect: 0.37 / 0.74 }
    g.position.set(1.35, 2.01, 0.55)
    g.rotation.y = -0.35
    this.register('phone', g)
  }


  // Film Fırtınası is a movie site, so it plays on a real TV: a big thin panel
  // on a pedestal, standing on a media console behind the desk.
  private buildTv() {
    const g = new THREE.Group()
    const dark = mat(C.dark, { metalness: 0.4, roughness: 0.35 })
    const gold = mat(C.gold, { metalness: 0.7, roughness: 0.3 })

    // Media console: a low walnut cabinet with two doors on short legs.
    const CW = 2.7, CH = 1.45, CD = 0.62, legH = 0.18
    const wood = mat('#4a3a30', { roughness: 0.75 })
    const cabinet = box(CW, CH - legH, CD, wood)
    cabinet.position.y = legH + (CH - legH) / 2
    g.add(cabinet)
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const leg = cyl(0.035, 0.022, legH, dark, 12)
      leg.position.set(x * (CW / 2 - 0.12), legH / 2, z * (CD / 2 - 0.08))
      g.add(leg)
    }
    for (const side of [-1, 1]) {
      const door = box(CW / 2 - 0.08, CH - legH - 0.12, 0.012, mat('#55443a', { roughness: 0.7 }))
      door.position.set(side * (CW / 4), legH + (CH - legH) / 2, CD / 2 + 0.006)
      g.add(door)
      const pull = box(0.18, 0.025, 0.03, gold)
      pull.position.set(side * 0.16, legH + (CH - legH) / 2, CD / 2 + 0.025)
      g.add(pull)
    }

    // Soundbar and remote on top of the console.
    const soundbar = box(1.5, 0.1, 0.16, mat(C.graphite, { roughness: 0.8 }))
    soundbar.position.set(0, CH + 0.05, 0.17)
    g.add(soundbar)
    const grille = box(1.4, 0.06, 0.005, mat('#1a2236', { roughness: 1 }))
    grille.position.set(0, CH + 0.05, 0.253)
    g.add(grille)
    const remote = box(0.09, 0.03, 0.34, mat('#0e1220', { roughness: 0.5 }))
    remote.position.set(1.0, CH + 0.015, 0.12)
    remote.rotation.y = -0.35
    g.add(remote)

    // The TV: a 16:9 panel with thin bezels on a centre pedestal.
    const W = 2.5, H = (W * 9) / 16
    const plate = box(0.7, 0.03, 0.34, dark)
    plate.position.set(0, CH + 0.015, -0.12)
    g.add(plate)
    const neck = box(0.14, 0.26, 0.06, dark)
    neck.position.set(0, CH + 0.14, -0.14)
    g.add(neck)
    const y0 = CH + 0.24
    const panel = box(W + 0.04, H + 0.04, 0.04, mat('#0b1120', { metalness: 0.5, roughness: 0.3 }))
    panel.position.set(0, y0 + (H + 0.04) / 2, -0.12)
    g.add(panel)
    const back = box(W * 0.55, H * 0.55, 0.07, mat('#0b1120', { metalness: 0.4, roughness: 0.4 }))
    back.position.set(0, y0 + H * 0.45, -0.175)
    g.add(back)
    const ledDot = box(0.03, 0.012, 0.01, mat('#ff5a4f', { emissive: '#ff5a4f', emissiveIntensity: 1.2 }))
    ledDot.position.set(0, y0 + 0.006, -0.095)
    g.add(ledDot)
    // Idle picture: a letterboxed film frame with a play button.
    const film = screenTexture((ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#2b1d3f')
      sky.addColorStop(0.6, '#8a4b4a')
      sky.addColorStop(1, '#e0a25b')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#f4d08a'
      ctx.beginPath()
      ctx.arc(w * 0.68, h * 0.6, h * 0.12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1c1830'
      ctx.beginPath()
      ctx.moveTo(0, h * 0.78)
      ctx.lineTo(w * 0.22, h * 0.56)
      ctx.lineTo(w * 0.4, h * 0.7)
      ctx.lineTo(w * 0.62, h * 0.5)
      ctx.lineTo(w, h * 0.74)
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.fill()
      ctx.fillStyle = 'rgba(236, 231, 220, 0.92)'
      ctx.beginPath()
      ctx.moveTo(w / 2 - 14, h / 2 - 20)
      ctx.lineTo(w / 2 + 20, h / 2)
      ctx.lineTo(w / 2 - 14, h / 2 + 20)
      ctx.fill()
      ctx.fillStyle = '#05070d'
      ctx.fillRect(0, 0, w, h * 0.1)
      ctx.fillRect(0, h * 0.9, w, h * 0.1)
    }, 384, 216)
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: film, toneMapped: false }),
    )
    screen.position.set(0, y0 + (H + 0.04) / 2, -0.098)
    g.add(screen)
    this.screens.tv = { mesh: screen, idle: film, aspect: W / H }
    g.position.set(-0.8, 0, -3.3)
    g.rotation.y = 0.12
    this.register('tv', g)
  }

  // Seçki İstanbul is an events site, so it gets a big wall calendar drawn like
  // the site itself: its logo, a white month card with coloured event dots and
  // today in blue, and the light Istanbul skyline along the bottom. It hangs on the
  // back wall, out of the fridge door's way.
  private buildCalendar() {
    const W = 1.5, H = 1.72
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    const now = new Date()
    const blue = '#1d6fb8', ink = '#10273d'
    const page = screenTexture((ctx, w, h) => {
      const font = (wt: number, px: number) => `${wt} ${px}px "Inter Variable", system-ui, sans-serif`
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#e2f0fb')
      sky.addColorStop(1, '#fbf3e4')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      // Logo: a sun over water in a rounded tile, then "Seçki İstanbul".
      ctx.fillStyle = '#cfe7f7'
      ctx.beginPath()
      ctx.roundRect(24, 22, 46, 46, 12)
      ctx.fill()
      ctx.fillStyle = '#f6b73c'
      ctx.beginPath()
      ctx.arc(47, 40, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = blue
      ctx.lineWidth = 3
      for (const y of [53, 60]) {
        ctx.beginPath()
        ctx.moveTo(31, y)
        ctx.bezierCurveTo(39, y - 4, 47, y + 4, 55, y)
        ctx.bezierCurveTo(59, y - 2, 61, y - 2, 63, y)
        ctx.stroke()
      }
      ctx.font = font(700, 28)
      ctx.fillStyle = ink
      ctx.fillText('Seçki', 84, 55)
      ctx.fillStyle = blue
      ctx.fillText('İstanbul', 84 + ctx.measureText('Seçki ').width, 55)

      // The month card.
      const cx = 20, cy = 88, cw = w - 40, chh = h - 88 - 118
      ctx.fillStyle = 'rgba(16, 39, 61, 0.08)'
      ctx.beginPath()
      ctx.roundRect(cx, cy + 4, cw, chh, 22)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(cx, cy, cw, chh, 22)
      ctx.fill()
      ctx.fillStyle = ink
      ctx.font = font(700, 26)
      ctx.fillText(`${months[now.getMonth()]} ${now.getFullYear()}`, cx + 22, cy + 44)

      const days = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
      const gx = cx + 14, colW = (cw - 28) / 7
      const gy = cy + 92, rowH = (cy + chh - 12 - gy) / 6
      ctx.font = font(600, 16)
      ctx.textAlign = 'center'
      days.forEach((d, i) => {
        ctx.fillStyle = i >= 5 ? blue : '#6b7a8c'
        ctx.fillText(d, gx + colW * (i + 0.5), cy + 76)
      })
      const first = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7
      const count = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const prev = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
      const dots = ['#c2255c', '#e64980', '#1c4fb8', '#2f9e44', '#e8590c', '#7048e8']
      for (let i = 0; i < 42; i++) {
        const col = i % 7, row = Math.floor(i / 7)
        const x = gx + col * colW, y = gy + row * rowH
        const d = i - first + 1
        const inMonth = d >= 1 && d <= count
        const label = inMonth ? d : d < 1 ? prev + d : d - count
        if (col >= 5) {
          ctx.fillStyle = '#eef5fb'
          ctx.beginPath()
          ctx.roundRect(x + 3, y + 2, colW - 6, rowH - 4, 10)
          ctx.fill()
        }
        const mx = x + colW / 2, my = y + rowH * 0.44
        if (inMonth && d === now.getDate()) {
          ctx.fillStyle = '#0b65a8'
          ctx.beginPath()
          ctx.arc(mx, my - 6, 16, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#ffffff'
        } else {
          ctx.fillStyle = inMonth ? ink : '#a7b1bd'
        }
        ctx.font = font(600, 19)
        ctx.fillText(String(label), mx, my)
        // A few event dots under every day, like the site's month view.
        for (let k = 0; k < 3; k++) {
          ctx.globalAlpha = inMonth ? 1 : 0.45
          ctx.fillStyle = dots[(label * 5 + k * 7 + row) % dots.length]
          ctx.beginPath()
          ctx.arc(mx - 9 + k * 9, my + 14, 3.2, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }
      ctx.textAlign = 'left'

      // The light skyline over the water: the bridge, a mosque and minarets.
      const base = h - 30
      ctx.fillStyle = '#bcd8ee'
      ctx.fillRect(40, base - 52, 6, 52)
      ctx.fillRect(150, base - 52, 6, 52)
      ctx.strokeStyle = '#bcd8ee'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(10, base - 20)
      ctx.quadraticCurveTo(98, base - 10, 43, base - 50)
      ctx.moveTo(43, base - 50)
      ctx.quadraticCurveTo(98, base - 4, 153, base - 50)
      ctx.moveTo(153, base - 50)
      ctx.quadraticCurveTo(190, base - 16, 210, base - 18)
      ctx.stroke()
      ctx.fillRect(10, base - 18, 200, 5)
      ctx.beginPath()
      ctx.arc(w * 0.66, base, 40, Math.PI, 0)
      ctx.fill()
      ctx.fillRect(w * 0.66 - 60, base - 14, 120, 14)
      for (const [x, ht] of [[w * 0.53, 66], [w * 0.79, 66], [w * 0.92, 44]] as const) {
        ctx.fillRect(x - 3, base - ht, 6, ht)
        ctx.beginPath()
        ctx.moveTo(x - 4, base - ht)
        ctx.lineTo(x, base - ht - 12)
        ctx.lineTo(x + 4, base - ht)
        ctx.fill()
      }
      const sea = ctx.createLinearGradient(0, base, 0, h)
      sea.addColorStop(0, '#a9cfee')
      sea.addColorStop(1, '#86bbe6')
      ctx.fillStyle = sea
      ctx.fillRect(0, base, w, h - base)
    }, 520, 600)
    page.anisotropy = 8

    // The calendar hangs from a nail, facing into the room.
    const g = new THREE.Group()
    const board = box(0.04, H + 0.06, W + 0.06, mat('#d9d3c6', { roughness: 0.9 }))
    board.position.set(0.02, 0, 0)
    g.add(board)
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: page, roughness: 0.8 }))
    sheet.rotation.y = Math.PI / 2
    sheet.position.set(0.045, 0, 0)
    g.add(sheet)
    for (let i = 0; i < 9; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 8, 16), mat(C.gold, { metalness: 0.7, roughness: 0.3 }))
      ring.position.set(0.05, H / 2 - 0.01, -W / 2 + 0.1 + i * ((W - 0.2) / 8))
      g.add(ring)
    }
    const nail = cyl(0.015, 0.015, 0.08, mat(C.metal, { metalness: 0.8 }), 8)
    nail.rotation.z = Math.PI / 2
    nail.position.set(0.02, H / 2 + 0.12, 0)
    g.add(nail)
    const string = box(0.005, 0.12, 0.4, mat('#9a8f7a'))
    string.position.set(0.04, H / 2 + 0.07, 0)
    g.add(string)
    // On the back wall, to the right of the TV.
    g.rotation.y = -Math.PI / 2
    g.position.set(1.4, 2.9, -3.68)
    this.register('calendar', g)
  }

  private buildServer() {
    const g = new THREE.Group()
    const tower = box(0.8, 1.6, 0.9, mat('#171c2c', { metalness: 0.4, roughness: 0.4 }))
    tower.position.y = 0.8
    g.add(tower)
    for (let row = 0; row < 3; row++) {
      const slot = box(0.66, 0.26, 0.02, mat('#222941'))
      slot.position.set(0, 0.32 + row * 0.34, 0.455)
      g.add(slot)
      for (let i = 0; i < 3; i++) {
        const m = mat('#0b1020', { emissive: i === 0 ? C.sky : C.gold, emissiveIntensity: 1 })
        this.leds.push(m)
        const led = box(0.05, 0.05, 0.02, m)
        led.position.set(-0.24 + i * 0.09, 0.32 + row * 0.34, 0.47)
        g.add(led)
      }
    }
    // The top bay is labelled, since this cabinet holds the retired products.
    const label = screenTexture((ctx, w, h) => {
      ctx.fillStyle = C.ivory
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#16223f'
      ctx.font = '700 46px "Inter Variable", system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('ARCHIVE', w / 2, h / 2 + 2)
    }, 256, 80)
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.2), new THREE.MeshStandardMaterial({ map: label, roughness: 0.7 }))
    plate.position.set(0, 0.32 + 3 * 0.34, 0.452)
    g.add(plate)
    g.position.set(1.1, 0.024, 0.35)
    g.rotation.y = -0.1
    this.register('server', g)
  }




  /** Load a screenshot once, cropped to cover a device's screen with the top of the page in view. */
  private screenshot(key: ScreenKey, url: string) {
    const screen = this.screens[key]!
    let tex = this.textures.get(url)
    if (!tex) {
      tex = this.loader.loadAsync(url).then((t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 4
        const img = t.image as HTMLImageElement
        const imgAspect = img.width / img.height
        if (imgAspect > screen.aspect) {
          t.repeat.set(screen.aspect / imgAspect, 1)
          t.offset.set((1 - t.repeat.x) / 2, 0)
        } else {
          t.repeat.set(1, imgAspect / screen.aspect)
          t.offset.set(0, 1 - t.repeat.y)
        }
        return t
      })
      this.textures.set(url, tex)
    }
    return tex
  }

  /** Let a device rest on a site screenshot instead of its idle animation. */
  private idleOn(key: ScreenKey, url: string) {
    const screen = this.screens[key]
    if (!screen) return
    this.screenshot(key, url).then((t) => {
      if (screen.mesh.material.map === screen.idle) {
        screen.mesh.material.map = t
        screen.mesh.material.needsUpdate = true
        if (!this.visible) this.renderOnce()
      }
      screen.idle = t
    })
  }

  /** Put a site screenshot on a device's screen, or its resting picture back with null. */
  showScreen(key: ScreenKey, url: string | null) {
    const screen = this.screens[key]
    if (!screen) return
    if (!url) {
      screen.mesh.material.map = screen.idle
      screen.mesh.material.needsUpdate = true
      if (!this.visible) this.renderOnce()
      return
    }
    this.screenshot(key, url).then((t) => {
      screen.mesh.material.map = t
      screen.mesh.material.needsUpdate = true
      if (!this.visible) this.renderOnce()
    })
  }


  /** Highlight the object whose story is open in the panel. */
  select(id: DeskKey) {
    const item = this.items.find((i) => i.id === id)
    if (!item) return
    if (id === 'fridge' || this.selected?.id === 'fridge') this.setFridgeOpen(id === 'fridge')
    this.selected = item
    const p = item.group.position
    const ring = this.selectedRing
    const onFloor = p.y < 1
    gsap.to(ring.position, { x: p.x, z: p.z, y: onFloor ? 0.04 : 2.021, duration: this.reducedMotion ? 0 : 0.5, ease: 'power3.out' })
    // The wall calendar hangs on a wall, so it has no ring under it.
    gsap.to(ring.material, { opacity: id === 'calendar' ? 0 : 0.9, duration: 0.3 })
    if (!this.visible) this.renderOnce()
  }

  private pick(): Clickable | null {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(this.items.flatMap((i) => i.hit), false)
    if (!hits.length) return null
    return this.items.find((i) => i.hit.includes(hits[0].object)) ?? null
  }

  private aim(e: MouseEvent) {
    const r = this.canvas.getBoundingClientRect()
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    return r
  }

  private onPointerMove = (e: PointerEvent) => {
    const r = this.aim(e)
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

  private onClick = (e: MouseEvent) => {
    // A tap arrives without a pointermove first, so aim where the finger landed.
    this.aim(e)
    const hit = this.pick()
    if (hit) this.onSelect(hit.id)
  }

  private lift(item: Clickable, up: boolean) {
    // A fridge doesn't hop; its door opens a crack instead.
    if (item.id === 'fridge') {
      if (this.selected?.id !== 'fridge') {
        gsap.to(this.fridgeDoor.rotation, { y: up ? -0.18 : 0, duration: this.reducedMotion ? 0 : 0.35 })
      }
      return
    }
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
    const view = 7.2
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
      this.leds.forEach((m, i) => (m.emissiveIntensity = 0.4 + 0.6 * (Math.sin(t * (2 + (i % 5)) + i) > 0.2 ? 1 : 0)))
      if (this.selected) this.selectedRing.scale.setScalar(1 + Math.sin(t * 3) * 0.04)
      if (this.ir.level > 0) this.applyIr(t)
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
