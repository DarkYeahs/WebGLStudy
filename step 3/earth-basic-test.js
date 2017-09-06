let Earth = function () {
  Sim.Object.call(this)
}

Earth.prototype = new Sim.Object()
Earth.prototype.TILT = .41
Earth.prototype.ROTATION_y = .0025

Earth.prototype.init = function (opt) {
  let earthMap = opt.earthMap
  let geometry = new THREE.SphereGeometry(1, 32, 32)
  let texture = THREE.ImageUtils.loadTexture(earthMap)
  let material = new THREE.MeshBasicMaterial({map: texture})
  let mesh = new THREE.Mesh(geometry, material)

  mesh.rotation.x = opt.TILT || this.TILT
  this.ROTATION_y = opt.ROTATION_y || this.ROTATION_y
  this.setObject3D(mesh)
}

Earth.prototype.update = function () {
  this.object3D.rotation.y += this.ROTATION_y
}

let EarthApp = function () {
  Sim.App.call(this)
}

EarthApp.prototype = new Sim.App()

EarthApp.prototype.init = function (opt = {}) {
  console.log(opt)
  Sim.App.prototype.init.call(this, opt)

  let earth = new Earth()
  earth.init({
    earthMap: '../images/earth_surface_2048.jpg'
  })
  this.addObject(earth)
}

$(document).ready(
  () => {
    var container = document.getElementById("container")
    var app = new EarthApp()
    app.init({ container: container })
    app.run()
  }
)