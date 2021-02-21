var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'circle.jpg';

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

img.onload = function() {
    ctx.drawImage(img, 0, 0);
};

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(400, 400);
document.body.appendChild(renderer.domElement);
camera.position.z = 5;

/*window.addEventListener('load', function(ev) {
	function invert(){
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		for (var i = 0; i < data.length; i += 4) {
			data[i]     = 255 - data[i];     // red
			data[i + 1] = 255 - data[i + 1]; // green
			data[i + 2] = 255 - data[i + 2]; // blue
			if(data[i] >= 100 && data[i] <= 110){
				console.log("red");
			}
		}
		ctx.putImageData(imageData, 0, 0);
	}

	var button = document.querySelector('button');
		button.addEventListener('click', invert, false);
},false);*/

/*var cubeGeo = new THREE.BoxGeometry(1,1,2);
		var cubeMat = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x00ff00, shininess: 30 });
		var cube = new THREE.Mesh(cubeGeo,cubeMat);
		scene.add(cube);*/

const light = new THREE.AmbientLight( 0x909090 ); // soft white light
scene.add( light );

window.addEventListener('load', function(ev) {
	function meshGen(){
		
		var vertices = new Float32Array(3000); // Can store 1000 verts max
		var vertIndex = 0; // Stores current position in vert array
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		var piX = 0; // pixelIndexX stores the X index of the pixel we're on
		var piY = 0; // Same but for y
		while (piY * canvas.width < data.length) { // While not at end of data
			let imageIndex = (piX+(canvas.width*piY))*4; // Easier parsing of RGB, stores image data index
			if(data[imageIndex]+data[imageIndex+1]+data[imageIndex+2] == 765){ //if white
				console.log(piX + " " + piY);
				break;
			}
			piX++;
			if(piX == canvas.width){ // Reach end of row
				piX = 0;
				piY++;
			}
			
		}
		vertices[vertIndex] = 4*(piX/canvas.width) - 2; // Creates vertices in a 4xN area on Threejs canvas
		vertices[vertIndex+1] = -4*(piY/canvas.width) + 2; // Using canvas.height would squash/stretch the mesh
		vertIndex+=3;
		
		vertices[vertIndex] = 2;
		vertices[vertIndex+1] = 2;
		vertIndex+=3;
		vertices[vertIndex] = -2;
		vertices[vertIndex+1] = -2;
		vertIndex+=3;
		vertices[vertIndex] = -2;
		vertices[vertIndex+1] = 2;
		vertIndex+=3;
		vertices[vertIndex] = 2;
		vertices[vertIndex+1] = -2;
		vertIndex+=3;
		
		
		//ctx.putImageData(imageData, 0, 0); // Updates image, unnecessary
		var geometry = new THREE.BufferGeometry(); // Making the mesh
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3));
		var material = new THREE.PointsMaterial( { color: 0xef983e, size: .1 } );
		
		var points = new THREE.Points(geometry, material); // Adding the mesh
		scene.add(points);
		
		
		
	}

var button = document.querySelector('button');
button.addEventListener('click', meshGen, false);
},false);





function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
}

animate();
