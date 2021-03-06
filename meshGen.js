import { OrbitControls } from './three.js-master/OrbitControls.js'

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

class vertAngle{
	constructor(index,angle){
		this.index = index; //Index in vert array
		this.angle = angle // Angle in radians
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
img.src = 'pokeball.jpg';

var canvas = document.createElement("CANVAS");
var ctx;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(20, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
camera.position.z = 8;
//camera.position.y = 8;

img.onload = function() {
	//console.log(this.width + 'x' + this.height);
	canvas.width = this.width;
	canvas.height = this.height;
	renderer.setSize(this.width, this.height);
	ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	document.body.appendChild(canvas);
};
//var canvas = document.getElementById('myCanvas');

const controls = new OrbitControls(camera, renderer.domElement);
//camera.rotateY(Math.PI);

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
/*
var cubeGeo = new THREE.BoxGeometry(1,1,2);
var cubeMat = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x00ff00, shininess: 30 });
var cube = new THREE.Mesh(cubeGeo,cubeMat);
cube.rotateX(Math.PI/4);
scene.add(cube);*/

var material = new THREE.MeshStandardMaterial({color: 0xffb0ff, metalness: .0, roughness: .3});

const light = new THREE.AmbientLight( 0x707070 ); // soft white light
const lightPoint = new THREE.PointLight( 0xf0f0f0,2,6,2 );
const lightPoint2 = new THREE.PointLight( 0xf0f0f0,2,3,2 );
lightPoint.position.set(0,0,2);
lightPoint.position.set(1,0,1);
scene.add( light );
scene.add(lightPoint);

//const controls = new OrbitControls( camera, renderer.domElement );
//controls.update();

window.addEventListener('load', function(ev) {
	function meshGen(){
		
		const vertices = [];
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		var piX = 0; // pixelIndexX stores the X index of the pixel we're on
		var piY = 0; // Same but for y
		
		// FIND FIRST POINT AND ADD IT. 
		
		while (piY * canvas.width < data.length) { // While not at end of data
			let imageIndex = (piX+(canvas.width*piY))*4; // Easier parsing of RGB, stores image data index
			if(data[imageIndex]+data[imageIndex+1]+data[imageIndex+2] == 765){ //if white
				//console.log("Coords of first point: " + piX + " " + piY);
				break;
			}
			piX++;
			if(piX == canvas.width){ // Reach end of row
				piX = 0;
				piY++;
			}
			
		}
		
		vertices.push(piX,piY,0);
		
		// TURN IMAGE EDGE INTO MESH EDGE.
		
		let currPX = piX; // Stores current pixel coordinates for comparison. It may be useful to know piX and piY later.
		let currPY = piY;
		let meshDone = false; // Break variable for edgemaking loop
		let resolution = 2; // Determines the density of vertices, 1 vertex for every 'resolution' verts (higher # is lower res)
		let circleSamples = resolution*resolution; // So we don't need to do this a lot, could be lower?
		let lastAngle = 0; // Hold on to angle so check starts from last angle, not from top.
		let xMax = 0,yMax = 0; // Store the min and max coordinate values for vertices to save time in the interior mesh gen, only need to check coords inside these values.
		let xMin = canvas.width;
		let yMin = canvas.height;
		
		// EDGE CREATION LOOP
		
		while(true){ 
			
			// Check all pixels 'resolution' distance away from current vert for edges clockwise.
			// Could use a smaller number than resolution^2? Maybe res*log(res)?
			// Edge data must be thicker than 1px, if it's 1px then it might miss checks on tight pixel diagonals
			for(let i = 0; i < circleSamples/2; i++){
				// (sampleX+currPX,sampleY+currPY) is the coordinates for the current sampled pixel
				let sampleX = Math.floor(Math.cos((2*Math.PI*(lastAngle+i))/circleSamples)*resolution);
				let sampleY = Math.floor(Math.sin((2*Math.PI*(lastAngle+i))/circleSamples)*resolution);
				
				// If sampled pixel has a red value of <= 100 (therefore is an edge), make it the new current vertex
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
			
			// If current vert is within 'resolution' px of another vert, end edge creation
			let iter = 0;
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
		
		// RAYCAST CHECKING FOR INNER VERTICES
		
		let edges = []; // Create loop of line segment objects from edges
		
		for(let i = 3; i < vertices.length; i+=3){
			let seg = new lineSegment(vertices[i-3],vertices[i-2],vertices[i],vertices[i+1]);
			edges.push(seg);
		}
		
		let seg = new lineSegment(vertices[0],vertices[1],vertices[vertices.length-3],vertices[vertices.length-2]);
		edges.push(seg); // Line segment from first to last too
		
		let centerVertices = []; // New array for center vertices only until we figure out how to index edge verts
		
		// Loop through possible inside values (values between maxes and mins), and check each with every line segment.
		// If it hits an even number of line segs total, it's outside. Otherwise, inside.
		//console.log(xMin + " " + xMax + " " + yMin + " " + yMax);
		for(let i = xMin+resolution; i < xMax; i+=resolution){
			for(let j = yMin+resolution; j < yMax; j+=resolution){
				let numIntersections = 0;
				for(let s = 0; s < edges.length; s++){
					let p = new point(i,j);
					if(intersectCheck(edges[s],p)){
						numIntersections++;
					}
				}
				if(numIntersections % 2 == 1){
					centerVertices.push(i,j,0);
				}
			}
		}
		
		// FACE INDEXING
		
		let indices = [];
		for(let i = 0; i < centerVertices.length; i+=3){
			let closeVerts = []; // list of verts within 'resolution' of current vertex
			for(let j = 0; j < centerVertices.length; j+= 3){
				let dist = Math.sqrt(Math.pow(centerVertices[i]-centerVertices[j],2) + Math.pow(centerVertices[i+1]-centerVertices[j+1],2)); // Distance between verts
				if(i != j && dist <= resolution*1.33){ // Adjust this value and make it so there aren't overlapping faces. Also only push verts of higher index.
					//let angle = Math.atan((centerVertices[j+1]-centerVertices[i+1])/(centerVertices[j]-centerVertices[i])); // Absolute angle of vertex in radians
					//let vert = new vertAngle(j/3,angle);
					closeVerts.push(j/3);
				}
			}
			
			// Sort closeVerts by angle
			/*for(let m = 0; m < closeVerts.length-1;m++){
				for(let n = 0; n < closeVerts.length-m-1; n++){
					if(closeVerts[n].angle > closeVerts[n+1].angle){
						let temp = closeVerts[n];
						closeVerts[n] = closeVerts[n+1];
						closeVerts[n+1] = temp;
					}
				}
			}*/

			// Push non-duplicate faces to indices[]
			for(let j = 0; j < closeVerts.length; j++){
				if(closeVerts[j] == (i/3)-1 && j != 0){ // push topleft faces
					indices.push(i/3,closeVerts[j],closeVerts[j-1]);
				}
				if(closeVerts[j] == (i/3)+1 && j != closeVerts.length-1){ // push botright faces
					indices.push(i/3,closeVerts[j],closeVerts[j+1]);
				}
			}
		}
		
		/*for(let i = 0; i < indices.length; i+=3){
			console.log("Face: " + indices[i] + " " + indices[i+1] + " " + indices[i+2]);
		}*/
		//console.log(indices.length/3);
		
		// Converting vert data from pixels to a 2xN coordinate space and displacing on the Z axis.
		let maxHeight = 0;
		for(let i = 0; i < centerVertices.length; i+=3){
			centerVertices[i] = (4*centerVertices[i]/canvas.width)-2;
			centerVertices[i+1] = -1*((4*centerVertices[i+1]/canvas.width)-2);
			let minDist = 5;
			for(let j = 0; j < vertices.length; j+= 3){ // Set z displacement based on distance to closest edge vert
				let currDist = Math.pow(Math.pow((4*vertices[j]/canvas.width)-2-centerVertices[i],2)+Math.pow(-1*((4*vertices[j+1]/canvas.width)-2)-centerVertices[i+1],2),.25);
				if(currDist < minDist){
					minDist = currDist;
					//console.log(currDist);
				}
			}
			if(minDist > maxHeight){
				maxHeight = minDist;
			}
			centerVertices[i+2] = minDist;
		}
		for(let i = 0; i < centerVertices.length; i+=3){ // Spherical falloff
			centerVertices[i+2] = 1*(maxHeight-Math.pow(maxHeight-centerVertices[i+2],2));
		}
		
		// MAKING THE MESH
		var geometry = new THREE.BufferGeometry(); 
		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(centerVertices, 3));
		geometry.computeVertexNormals();
		
		var mesh = new THREE.Mesh(geometry,material);
		scene.add(mesh);
	}

var button = document.querySelector('button');
button.addEventListener('click', meshGen, false);
},false);



let fram = 0;
function animate() {
	
	fram++;
	
	lightPoint.position.set(Math.sin(fram/30)*2,Math.sin((fram/30)+(Math.PI/2))*2,2);
	
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
}

animate();
