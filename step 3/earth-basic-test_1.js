class Earth {
	constructor (opt = {}) {
		// 初始化参数值
		this.opt = opt
		this.scene = null
		this.camera = null
		this.cube = null
		this.light = null
		this.renderer = null
		this.container = null
		this.object3D = null
		this.cloudMesh = null
		this.globalMesh = null

		// 设定相关的系数
		this.TILT = .41
		this.RATOTION_Y = .0025
		this.CLOUDS_ROTATION_Y = this.RATOTION_Y * .95
		this.CLOUDS_SCALE = 1.005

		// 初始化
		this.init(opt)
	}
	init (opt) {
		// 获取传入的容器
		let container = opt.container || {}
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
		
		// v1.0版本静态化的地球矩阵的初始化
		// let map = THREE.ImageUtils.loadTexture(opt.earthMap)
		// let material = new THREE.MeshPhongMaterial({map: map})
		// let geometry = new THREE.SphereGeometry(1, 32, 32)
		// let cube = new THREE.Mesh(geometry, material)
		// cube.rotation.z = this.TILT
		// cube.rotation.y = Math.PI
		// this.cube = cube

		// 初始化群组以便容纳云层以及球体
		this.object3D = new THREE.Object3D()
		this.object3D.scale.set(.6, .6, .6)

		// 在场景中加入光源以及群组
		this.scene.add(this.light)
		// this.scene.add(this.cube)
		this.scene.add(this.object3D)

		// 创建云层以及球体并加载群组中
		this.createGlobe()
		this.createClouds()
	}

	update () {
		this.renderer.render(this.scene, this.camera)
		// this.cube.rotation.y += this.RATOTION_Y
		this.globalMesh.rotation.y += this.RATOTION_Y
		this.cloudMesh.rotation.y += this.CLOUDS_ROTATION_Y
		this.cloudMesh.rotation.x += .00001
		this.cloudMesh.rotation.z += .00001
		requestAnimationFrame(() => {
			this.update()
		})
	}

	createGlobe () {
		let url = this.opt.url
		// 创建多重纹理,包括球体的法线贴图以及高光贴图
		let surfaceMap = THREE.ImageUtils.loadTexture(url.surfaceMap)
		let normalMap = THREE.ImageUtils.loadTexture(url.normalMap)
		let specularMap = THREE.ImageUtils.loadTexture(url.specularMap)

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

		this.object3D.add(globalMesh)

		this.globalMesh = globalMesh
	}

	createClouds () {
		let url = this.opt.url

		console.log(url)
		let cloudsMap = THREE.ImageUtils.loadTexture(url.cloudsMap)
		let cloudsMaterial = new THREE.MeshLambertMaterial({
					color: 0xffffff,
					map: cloudsMap,
					transparent: true
				})
		let cloudsGeometry = new THREE.SphereGeometry(this.CLOUDS_SCALE, 32, 32)
		let cloudMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
		cloudMesh.rotation.z = this.TILT
		this.object3D.add(cloudMesh)
		this.cloudMesh = cloudMesh
	}
}
console.log(Earth)
$(document).ready(
		() => {
			let container = $('#container')[0]
			let opt = {
				container: container,
				earthMap: '../images/earth_surface_2048.jpg',
				url: {
					surfaceMap: '../images/earth_surface_2048.jpg',
					normalMap: '../images/earth_normal_2048.jpg',
					specularMap: '../images/earth_specular_2048.jpg',
					cloudsMap: '../images/earth_clouds_1024.png'
				}
			}
			let earth = new Earth(opt)
			setTimeout(() => {
				earth.update()
			}, 2000)
		}
	)
