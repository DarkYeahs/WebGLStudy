class Earth extends THREE.Object3D {
	constructor (opt = {}) {
		// 初始化参数值
		super()
		this.cloudMesh = null
		this.globalMesh = null

		this.surfaceMap = '../images/earth_surface_2048.jpg'
		this.normalMap = '../images/earth_normal_2048.jpg'
		this.specularMap = '../images/earth_specular_2048.jpg'
		this.cloudsMap = '../images/earth_clouds_1024.png'
		// 设定相关的系数
		this.TILT = .41
		this.RATOTION_Y = .0025
		this.CLOUDS_ROTATION_Y = this.RATOTION_Y * .95
		this.CLOUDS_SCALE = 1.005
		this.RADIUS = 6371;
		// 初始化
		this.init(opt)
	}
	init (opt) {

		// 创建云层以及球体并加载群组中
		this.createGlobe()
		this.createClouds()
	}

	update () {
		// this.cube.rotation.y += this.RATOTION_Y
		this.globalMesh.rotation.y += this.RATOTION_Y
		this.cloudMesh.rotation.y += this.CLOUDS_ROTATION_Y
		this.cloudMesh.rotation.x += .00001
		this.cloudMesh.rotation.z += .00001
	}

	createGlobe () {
		// 创建多重纹理,包括球体的法线贴图以及高光贴图
		let surfaceMap = THREE.ImageUtils.loadTexture(this.surfaceMap)
		let normalMap = THREE.ImageUtils.loadTexture(this.normalMap)
		let specularMap = THREE.ImageUtils.loadTexture(this.specularMap)

		let shader = THREE.ShaderUtils.lib['normal']		//	法线贴图着色器
		let uniforms = THREE.UniformsUtils.clone( shader.uniforms )

		uniforms['tNormal'].texture = normalMap
		uniforms['tDiffuse'].texture = surfaceMap
		uniforms['tSpecular'].texture = specularMap

		// 着色器在计算时需要使用颜色值以及高光值
		uniforms['enableDiffuse'].value = true
		uniforms['enableSpecular'].value = false

		let shaderMaterial = new THREE.ShaderMaterial({
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms,
			lights: true
		})

		let globalGeometry = new THREE.SphereGeometry(1, 32, 32)
		globalGeometry.computeTangents()
		let globalMesh = new THREE.Mesh(globalGeometry, shaderMaterial)

		globalMesh.rotation.z = this.TILT

		this.add(globalMesh)

		this.globalMesh = globalMesh
	}

	createClouds () {
		let cloudsMap = THREE.ImageUtils.loadTexture(this.cloudsMap)
		let cloudsMaterial = new THREE.MeshLambertMaterial({
					color: 0xffffff,
					map: cloudsMap,
					transparent: true
				})
		let cloudsGeometry = new THREE.SphereGeometry(this.CLOUDS_SCALE, 32, 32)
		let cloudMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
		cloudMesh.rotation.z = this.TILT
		this.add(cloudMesh)
		this.cloudMesh = cloudMesh
	}
}
class Moon extends Earth {
	constructor () {
		super()
		this.MOON_MAP = '../images/moon_1024.jpg'
		this.mesh = null

		this.EXAGGERATE_FACTOR = 1.2
		this.SIZE_IN_EARTH = 1 / 3.7 * this.EXAGGERATE_FACTOR
		this.INCLINATION = 0.089;
		this.DISTANCE_FROM_EARTH = 356400;
		this.PERIOD = 28;
		this.init()
	}
	init () {
		let texture = new THREE.ImageUtils.loadTexture(this.MOON_MAP)
		let material = new THREE.MeshPhongMaterial({
			map: texture,
			ambient: 0x888888
		})

		let geometry = new THREE.SphereGeometry(this.SIZE_IN_EARTH, 32, 32)

		let mesh = new THREE.Mesh(geometry, material)
		let distance = this.DISTANCE_FROM_EARTH / this.RADIUS
		mesh.position.set(Math.sqrt(distance / 2), 0, -Math.sqrt(distance / 2))
		mesh.rotation.y = Math.PI
		this.mesh = mesh

		this.add(mesh)
		this.rotation.x = this.INCLINATION
	}
	update() {
		console.group('update start')
		console.log(this.RATOTION_Y, this.PERIOD)
		this.rotation.y += (this.RATOTION_Y / this.PERIOD);
		console.log(this.rotation.y)
		console.groupEnd('update end')
	}
}
class EarthSystem {
	constructor (opt = {}) {
		this.opt = opt
		this.earth = new Earth()
		this.moon = new Moon()
		this.init()
	}
	init () {
		// 获取传入的容器
		let container = this.opt.container || {}
		this.container = container

		// 初始化渲染器
		let renderer = new THREE.WebGLRenderer({antialias: true})
		renderer.setSize(container.offsetWidth, container.offsetHeight)
		container.appendChild(renderer.domElement)
		this.renderer = renderer

		// 初始化场景
		let scene = new THREE.Scene()
		this.scene = scene

		// 初始化相机
		let camera = new THREE.PerspectiveCamera(45, container.offsetWidth/container.offsetHeight, 1, 400)
		camera.position.set(0, 0, 3)
		this.camera = camera

		// 初始化光源，这里模拟太阳的光照所以使用了
		let light = new THREE.PointLight(0xffffff, 2, 100)
		light.position.set(-10, 0, 20)
		this.light = light

		// 初始化群组以便容纳云层以及球体
		this.object3D = new THREE.Object3D()
		this.object3D.scale.set(.6, .6, .6)
		this.object3D.add(this.earth)
		this.object3D.add(this.moon)
		this.children = [this.object3D]
		// 在场景中加入光源以及群组
		this.scene.add(this.light)
		// this.scene.add(this.cube)
		this.scene.add(this.object3D)
	}
	update () {
		this.renderer.render(this.scene, this.camera)
		let children = this.children.concat([])
		let len = children.length
		for (let i = 0; i < len; i++) {
			let item = children[i]
			if (item.update) item.update()
			if (item.children) {
				let cItem = item.children
				let cLen = cItem.length
				for (let j = 0; j < cLen; j++) {
					children.push(cItem[j])
				}
				len += cLen
			}
			children.shift()
			i--
			len--
		}
		requestAnimationFrame(() => {
			this.update()
		})
	}
}
let moon = new Moon()
let earth = new Earth()
console.log(moon)
console.log(earth)
$(document).ready(
	() => {
		let container = $('#container')
		container = container && container[0]
		let earthSystem = new EarthSystem({
			container: container
		})
		setTimeout(() => {
			earthSystem.update()
		}, 1000)
	})
