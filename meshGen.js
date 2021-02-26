//import {OrbitControls} from 'three.js-master/OrbitControls.js';

class lineSegment{
	constructor(x1,y1,x2,y2){
		this.x1 = x1; // Coordinates for both end points
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
	}
}

class point{
	constructor(x,y){
		this.x = x; // Coordinates for start point
		this.y = y;
		//this.dir = dir; // dir is direction in radians. 0 is to the right ofc
	}
}

function intersectCheck(seg,point){ // Checks if 2 line segments intersect each other for raycasts
	// Source: Wikipedia, line-line intersection
	let x4 = point.x+1;
	let y4 = point.y + canvas.height;
	let t = (((seg.x1-point.x)*(point.y-y4))-((seg.y1-point.y)*(point.x-x4)))/(((seg.x1-seg.x2)*(point.y-y4))-((seg.y1-seg.y2)*(point.x-x4)));
	let u = (((seg.x2-seg.x1)*(seg.y1-point.y))-((seg.y2-seg.y1)*(seg.x1-point.x)))/(((seg.x1-seg.x2)*(point.y-y4))-((seg.y1-seg.y2)*(point.x-x4)));
	
	if(0 < t && t < 1 && 0 < u && u < 1){
		return true;
	}
	return false;
	
}

var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'Tetromino.jpg';

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
camera.position.z = 1;

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
				console.log("Coords of first point: " + piX + " " + piY);
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
		/*vertices.push(0,0,0);
		vertices.push(canvas.width,0,0);
		vertices.push(0,canvas.height,0);
		vertices.push(canvas.width,canvas.height,0);*/
		
		// CORNERS AND FIRST POINT SET UP. NEXT SECTION TURNS IMAGE EDGE INTO MESH EDGE.
		
		let currPX = piX; // Stores current pixel coordinates for comparison. It may be useful to know piX and piY later.
		let currPY = piY;
		let meshDone = false; // Break variable for edgemaking loop
		let resolution = 8; // Determines the density of vertices, 1 vertex for every 'resolution' verts (higher # is lower res)
		let circleSamples = resolution*resolution; // So we don't need to do this a lot, could be lower?
		let lastAngle = 0; // Hold on to angle so check starts from last angle, not from top.
		let xMax = 0,yMax = 0; // Store the min and max coordinate values for vertices to save time in the interior mesh gen, only need to check coords inside these values.
		let xMin = canvas.width;
		let yMin = canvas.height;
		
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
					
					currPX = sampleX + currPX;
					currPY = sampleY + currPY;
					
					lastAngle = lastAngle+i;
					
					break;
					
				}
				
				// Counterclockwise check, trying to find the closest in both directions
				
				sampleX = Math.floor(Math.cos((2*Math.PI*(lastAngle-i))/circleSamples)*resolution);
				sampleY = Math.floor(Math.sin((2*Math.PI*(lastAngle-i))/circleSamples)*resolution);
				
				if(data[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))] >= 100){
					
					currPX = sampleX + currPX;
					currPY = sampleY + currPY;
					
					lastAngle = lastAngle-i;
					
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
			
			if(currPX > xMax){xMax = currPX} // Update mins and maxes
			if(currPX < xMin){xMin = currPX}
			if(currPY > yMax){yMax = currPY}
			if(currPY < yMin){yMin = currPY}
			
			vertices.push(currPX,currPY,0);
			
			// If we hit the end, break
			
			if(meshDone){
				console.log("Edge mesh done");
				break;
			}
			
			
		
		}
		
		////////////////
		
		// NEXT, IMPLEMENT RAYCAST CHECKING FOR INNER VERTICES
		
		let edges = []; // Create loop of line segment objects from edges
		
		for(let i = 3; i < vertices.length; i+=3){
			
			let seg = new lineSegment(vertices[i-3],vertices[i-2],vertices[i],vertices[i+1]);
			edges.push(seg);
			
		}
		
		let seg = new lineSegment(vertices[0],vertices[1],vertices[vertices.length-3],vertices[vertices.length-2]);
		edges.push(seg); // Line segment from first to last too
		
		// Loop through possible inside values (values between maxes and mins), and check each with every line segment.
		// If it hits an even number of line segs total, it's outside. Otherwise, inside.
		console.log(xMin + " " + xMax + " " + yMin + " " + yMax);
		for(let i = xMin+resolution; i < xMax; i+=resolution){
			for(let j = yMin+resolution; j < yMax; j+=resolution){
				let numIntersections = 0;
				for(let s = 0; s < edges.length; s++){
					let p = new point(i,j);
					if(intersectCheck(edges[s],p)){
						numIntersections++;
					}
				}
				//console.log(numIntersections);
				if(numIntersections % 2 == 1){
					vertices.push(i,j,0);
				}
			}
		}
		
		//console.log(vertices.length/3);
		
		////////////////
		
		// NEXT, CREATE FACE INDICES
		
		let indices = [];
		for(let i = 0; i < vertices.length; i+=3){
			let closeVerts = []; // list of verts within resolution of current vertex
			for(let j = 0; j < vertices.length; j+= 3){
				let dist = Math.floor(Math.sqrt(Math.pow(vertices[i]-vertices[j],2) + Math.pow(vertices[i+1]-vertices[j+1],2)))-1; // Distance between verts
				if(i != j && dist <= resolution){
					//console.log(j/3);
					closeVerts.push(j/3);
				}
			}
			//console.log(closeVerts);
			for(let j = 0; j < closeVerts.length; j++){
				for(let k = 0; k < closeVerts.length; k++){
					let dist = Math.floor(Math.sqrt(Math.pow(vertices[closeVerts[j]]-vertices[closeVerts[k]],2) + Math.pow(vertices[closeVerts[j]+1]-vertices[closeVerts[k]+1],2)))-1;
					// If 2 verts already close to current vert are also close to each other, then push a face made with the 3 of them to indices.
					if(j != k && dist <= resolution && !(i/3 > closeVerts[j] && i/3 > closeVerts[k])){ // Prevent duplicate faces by not making faces w/ already checked values.
						//console.log(vertices[closeVerts[j+1]]);
						//console.log(vertices[closeVerts[k+1]]);
						indices.push(i/3,closeVerts[j],closeVerts[k]); // How to prevent same face from being added multiple times?
					}
				}
			}
		}
		
		///////
		
		for(let i = 0; i < indices.length; i+=3){
			console.log("Face: " + indices[i] + " " + indices[i+1] + " " + indices[i+2]);
		}
		console.log(indices.length/3);
		
		// Converting vert data from pixels to a 2xN coordinate space.
		for(let i = 0; i < vertices.length; i+=3){
			vertices[i] = (4*vertices[i]/canvas.width)-2;
			vertices[i+1] = -1*((4*vertices[i+1]/canvas.width)-2);
		}
		
		//ctx.putImageData(imageData, 0, 0); // Updates image, unnecessary
		var geometry = new THREE.BufferGeometry(); // Making the mesh
		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3));
		//var material = new THREE.PointsMaterial( { color: 0xef983e, size: .03 } );
		var material = new THREE.MeshBasicMaterial({wireframe:true});
		
		/*var points = new THREE.Points(geometry, material); // Adding the mesh
		scene.add(points);*/
		
		var mesh = new THREE.Mesh(geometry,material);
		scene.add(mesh);
		
		
		
	}

let seg = new lineSegment(100,400,100,0);
let p = new point(200,300);
console.log(intersectCheck(seg,p));

var button = document.querySelector('button');
button.addEventListener('click', meshGen, false);
},false);





function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
}

animate();
