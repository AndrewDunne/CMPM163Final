//import {OrbitControls} from 'three.js-master/OrbitControls.js';

var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'tetromino.jpg';

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

img.onload = function() {
    ctx.drawImage(img, 0, 0);
};

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(400, 400);
document.body.appendChild(renderer.domElement);
camera.position.z = 3;

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

//const controls = new OrbitControls( camera, renderer.domElement );
//controls.update();

window.addEventListener('load', function(ev) {
	function meshGen(){
		
		const vertices = [];
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
		
		//let vertX = 4*(piX/canvas.width) - 2; // Creates vertices in a 4xN area on Threejs canvas
		//let vertY = -1*(4*(piY/canvas.width) - 2); // Using canvas.height would squash/stretch the mesh.
		// Above is negative because on canvas positive y is down and in scene positive y is up.
		vertices.push(piX,piY,0);
		
		// Mesh boundaries
		vertices.push(0,0,0);
		vertices.push(canvas.width,0,0);
		vertices.push(0,canvas.height,0);
		vertices.push(canvas.width,canvas.height,0);
		
		// CORNERS AND FIRST POINT SET UP. NEXT SECTION TURNS IMAGE EDGE INTO MESH EDGE.
		
		
		let currPX = piX; // Stores current pixel coordinates for comparison. It may be useful to know piX and piY later.
		let currPY = piY;
		let meshDone = false; // Break variable for edgemaking loop
		let resolution = 10; // Determines the density of vertices, 1 vertex for every 'resolution' verts (higher # is lower res)
		let circleSamples = resolution*resolution; // So we don't need to do this a lot, could be lower?
		let lastAngle = 0; // Hold on to angle so check starts from last angle, not from top.
		
		while(true){ // Edge creation loop
			
			// Check all pixels 'resolution' distance away from current vert for edges clockwise.
			// Could use a smaller number than resolution^2? Maybe res*log(res)?
			// Edge data must be thicker than 1px, if it's 1px then it might miss checks on tight pixel diagonals
			for(let i = 0; i < circleSamples/2; i++){
				// (sampleX+currPX,sampleY+currPY) is the coordinates for the current sampled pixel
				let sampleX = Math.floor(Math.cos((2*Math.PI*(lastAngle+i))/circleSamples)*resolution);
				let sampleY = Math.floor(Math.sin((2*Math.PI*(lastAngle+i))/circleSamples)*resolution);
				
				// If sampled pixel has a red value of 255 (therefore is white/an edge), make it the new current vertex
				if(data[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))] >= 100){
					
					//console.log(data[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))]);
					
					currPX = sampleX + currPX;
					currPY = sampleY + currPY;
					
					lastAngle = lastAngle+i;
					//console.log(lastAngle);
					
					break;
					
				}
				
				// Counterclockwise check, trying to find the closest in both directions
				
				sampleX = Math.floor(Math.cos((2*Math.PI*(lastAngle-i))/circleSamples)*resolution);
				sampleY = Math.floor(Math.sin((2*Math.PI*(lastAngle-i))/circleSamples)*resolution);
				
				if(data[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))] >= 100){
					
					//console.log(data[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))]);
					
					currPX = sampleX + currPX;
					currPY = sampleY + currPY;
					
					lastAngle = lastAngle-i;
					//console.log(lastAngle);
					
					break;
					
				}
				
			}
			
			let iter = 0;
			
			// If current vert is within 'resolution-1' px of another vert, end edge creation
			while(typeof(vertices[iter]) !== 'undefined'){ 
				if(Math.pow(vertices[iter]-currPX,2)+Math.pow(vertices[iter+1]-currPY,2) <= Math.pow(resolution-4,2)){
					meshDone = true;
					break;
				}
				iter+=3;
			}
			
			// Create new vertex
			
			vertices.push(currPX,currPY,0);
			
			if(meshDone){
				console.log("done");
				break;
			}
			
			
		
		}
		
		
		
		
		////////////////
		
		// Converting vert data from pixels to a 2xN coordinate space.
		for(let i = 0; typeof(vertices[i]) !== 'undefined'; i+=3){
			vertices[i] = (4*vertices[i]/canvas.width)-2;
			vertices[i+1] = -1*((4*vertices[i+1]/canvas.width)-2);
		}
		
		//ctx.putImageData(imageData, 0, 0); // Updates image, unnecessary
		var geometry = new THREE.BufferGeometry(); // Making the mesh
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3));
		var material = new THREE.PointsMaterial( { color: 0xef983e, size: .03 } );
		
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
