window.onload = function () {
	app.init()
	app.run()
}
let app = {
	renderer: null,
	scene: null,
	camera: null,
	cube: null,
	light: null,
	animating: true,
	mapUrl: '../images/molumen_small_funny_angry_monster.jpg',
	// 初始化渲染器
	initRenderer: function () {
		var container = document.getElementById('container')
		var renderer = null
		// 启用抗锯齿渲染，避免绘制物体边缘时产生的锯齿
		renderer = new THREE.WebGLRenderer({antialias: true})
		// 设置绘制的区域
		renderer.setSize(container.offsetWidth, container.offsetHeight)
		// 将renderer的dom元素加载到dom树上
		container.appendChild(renderer.domElement)
		this.renderer = renderer
	},
	// 初始化场景
	initScene: function () {
		var scene = new THREE.Scene()
		this.scene = scene
	},
	// 初始化相机
	initCamera: function () {
		var camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 400)
		camera.position.set(0, 0, 3)
		this.camera = camera
	},
	// 初始化光线
	initLight: function () {
		var light = new THREE.DirectionalLight(0xffffff, 1.5)
		light.position.set(0, 0, 1)
		this.light = light
	},
	// 初始化矩阵以及材质并将材质渲染到矩阵上
	initCube: function () {
		// 创建一个纹理
		var map = THREE.ImageUtils.loadTexture(this.mapUrl)
		var material = new THREE.MeshPhongMaterial({map: map})
		// 创建一个立方体的几何体
		var geometry = new THREE.CubeGeometry(1, 1, 1)
		// 将几何体以及材质放入到同一个网格中
		var cube = new THREE.Mesh(geometry, material)
		cube.rotation.x = Math.PI / 5
		cube.rotation.y = Math.PI /5
		this.cube = cube
	},
	// 整个3D环境的初始化
	init: function () {
		this.initScene()
		this.initCamera()
		this.initRenderer()
		this.initLight()
		this.initCube()
		this.scene.add(this.light)
		this.scene.add(this.cube)
		this.addMouseHandle()
	},
	addMouseHandle: function () {
		var dom = this.renderer.domElement
		dom.addEventListener('mouseup', this.onMouseUp.bind(app), false)
	},
	onMouseUp: function (e) {
		e.preventDefault()
		this.animating = !this.animating
	},
	// 动画渲染
	run: function () {
		this.renderer.render(this.scene, this.camera)
		if (this.animating) {
			this.cube.rotation.y -= .01
			this.cube.rotation.x += .03
			this.cube.rotation.z -= .01
		}
		requestAnimationFrame(this.run.bind(app))
	}
}
