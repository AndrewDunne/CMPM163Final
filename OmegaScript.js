var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'picture.jpg';
var canvas = document.createElement("canvas");

const monoValue = (r,g,b) => (r + g + b) / 3;

function rgbValue(img, x, y, c)     // 'c' for RGBA channel
{
    return img.data[((y * (4 * img.width)) + (4 * x)) + c];
}

function setMonochrome(img, x, y, v)  // 'v' for value
{
	img.data[((y * (4 * img.width)) + (4 * x)) + 0] = v;
	img.data[((y * (4 * img.width)) + (4 * x)) + 1] = v;
	img.data[((y * (4 * img.width)) + (4 * x)) + 2] = v;
}

function pxlValue(img, x, y)  // we just read the 'red' value
{
    return img.data[((y * (4 * img.width)) + (4 * x))];
}

function setRGB(img, x, y, rgb)
{
	img.data[((y * (4 * img.width)) + (4 * x)) + 0] = rgb[0];
	img.data[((y * (4 * img.width)) + (4 * x)) + 1] = rgb[1];
	img.data[((y * (4 * img.width)) + (4 * x)) + 2] = rgb[2];
	img.data[((y * (4 * img.width)) + (4 * x)) + 3] = 255;
}


function edgeDetect(img, x, y)
{
	var gradX = 0;
	var gradY = 0;

	gradX += pxlValue(img, x-1, y-1) * -2;
	gradX += pxlValue(img, x-1, y+0) * -4;
	gradX += pxlValue(img, x-1, y+1) * -2;
	gradX += pxlValue(img, x+1, y-1) *  2;
	gradX += pxlValue(img, x+1, y+0) *  4;
	gradX += pxlValue(img, x+1, y+1) *  2;

	gradY += pxlValue(img, x-1, y-1) * -2;
	gradY += pxlValue(img, x+0, y-1) * -4;
	gradY += pxlValue(img, x+1, y-1) * -2;
	gradY += pxlValue(img, x-1, y+1) *  2;
	gradY += pxlValue(img, x+0, y+1) *  4;
	gradY += pxlValue(img, x+1, y+1) *  2;

	gradX /= 9;
	gradY /= 9;

	return Math.sqrt(Math.pow(gradX, 2) + Math.pow(gradY, 2));
}

var TheCanvas;

img.onload = function() {
	canvas.width = this.width;
	canvas.height = this.height;
	TheCanvas = canvas.getContext('2d');
  TheCanvas.drawImage(img, 0, 0);
  document.body.appendChild(canvas);
  img.style.display = 'none';
  let pixels = TheCanvas.getImageData(0, 0, this.width, this.height);
  let buffer = TheCanvas.createImageData(pixels);
  console.log(pixels.length);


	for (let x = 1; x < 340; x++)
	{
		for (let y = 1; y < 1350; y++)
		{
			let r = rgbValue(pixels, x, y, 0);
			let g = rgbValue(pixels, x, y, 1);
			let b = rgbValue(pixels, x, y, 2);
			setMonochrome(pixels, x, y, monoValue(r, g, b));
		}
	}

for (let x = 1; x < this.width; x++)
	{
		for (let y = 1; y < this.height; y++)
		{
			let v = edgeDetect(pixels, x, y)*7;
			setRGB(buffer, x,y, [v,v,v]);
		}
	}


	TheCanvas.putImageData(buffer, 0, 0);


};





var hoveredColor = document.getElementById('hovered-color');
var selectedColor = document.getElementById('selected-color');


function pick(event, destination) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = TheCanvas.getImageData(x, y, 1, 1);
  var data = pixel.data;

	const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
	destination.style.background = rgba;
	destination.textContent = rgba;

	return rgba;
}

canvas.addEventListener('mousemove', function(event) {
	//pick(event, hoveredColor);
});
canvas.addEventListener('click', function(event) {
	//pick(event, selectedColor);
});

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

// var img = new Image();
// img.crossOrigin = 'anonymous';
// img.src = 'Tetromino.jpg';

// var canvas = document.createElement("CANVAS");
// var ctx;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(500, 500);
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(20, window.innerWidth/window.innerHeight, 0.1, 1000);
// var renderer = new THREE.WebGLRenderer();
// document.body.appendChild(renderer.domElement);
camera.position.z = 8;

// img.onload = function() {
	//console.log(this.width + 'x' + this.height);
	// canvas.width = this.width;
	// canvas.height = this.height;
	// renderer.setSize(this.width, this.height);
	// ctx = canvas.getContext('2d');
	// ctx.drawImage(img, 0, 0);
	// document.body.appendChild(canvas);
// };
//var canvas = document.getElementById('myCanvas');

const controls = new OrbitControls(camera, renderer.domElement);
var material;

var textureLoader = new THREE.TextureLoader();
textureLoader.load('197.jpg', function (texture){
	console.log('texture loaded');
	material = new THREE.MeshStandardMaterial({metalness: .0, roughness: .3, map: texture, bumpMap: texture, bumpScale: .1, side: THREE.DoubleSide});
});
const light = new THREE.AmbientLight( 0x707070 ); // soft white light
const lightPoint = new THREE.PointLight( 0xf0f0f0,2,6,2 );
const lightPoint2 = new THREE.PointLight( 0xf0f0f0,1,3,2 );
lightPoint2.position.set(0,0,-1);
scene.add( light );
scene.add(lightPoint);
scene.add(lightPoint2);

//const controls = new OrbitControls( camera, renderer.domElement );
//controls.update();

window.addEventListener('load', function(ev) {
	function meshGen(){
		
		//TheCanvas = canvas.getContext('2d');
		  let pixels = TheCanvas.getImageData(0, 0, canvas.width, canvas.height);
		  //console.log(typeof(buffer));
		
		const vertices = [];
		//const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		//const data = imageData.data;
		var piX = 0; // pixelIndexX stores the X index of the pixel we're on
		var piY = 0; // Same but for y
		
		// FIND FIRST POINT AND ADD IT. 
		
		// console.log(TheCanvas);
		 console.log(pixels.length);
		// console.log(canvas);
		//let bufLength = canvas.height * canvas.width * 4;
		//console.log(piY * canvas.width);
		while (piY * canvas.width < pixels.length) { // While not at end of data
			let imageIndex = (piX+(canvas.width*piY))*4; // Easier parsing of RGB, stores image data index
			if(pixels[imageIndex]+pixels[imageIndex+1]+pixels[imageIndex+2] >= 400){ //if white
				console.log("Coords of first point: " + piX + " " + piY);
				break;
			}
			piX++;
			if(piX == canvas.width){ // Reach end of row
				piX = 0;
				piY++;
				console.log(pixels[imageIndex]);
			}
			
		}
		vertices.push(piX,piY,0);
		
		// TURN IMAGE EDGE INTO MESH EDGE.
		
		let currPX = piX; // Stores current pixel coordinates for comparison. It may be useful to know piX and piY later.
		let currPY = piY;
		let meshDone = false; // Break variable for edgemaking loop
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
				if(pixels[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))] >= 100){
					
					currPX = sampleX + currPX;
					currPY = sampleY + currPY;
					
					lastAngle = lastAngle+i;
					
					break;
				}
				// Counterclockwise check, trying to find the closest in both directions
				sampleX = Math.floor(Math.cos((2*Math.PI*(lastAngle-i))/circleSamples)*resolution);
				sampleY = Math.floor(Math.sin((2*Math.PI*(lastAngle-i))/circleSamples)*resolution);
				
				if(pixels[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))] >= 100){
					
					currPX = sampleX + currPX;
					currPY = sampleY + currPY;
					
					lastAngle = lastAngle-i;
					
					break;
				}
			}
			
			// If current vert is within ciel('resolution'/4) px of another vert, end edge creation
			let iter = 0;
			while(typeof(vertices[iter]) !== 'undefined'){ 
				if(Math.pow(vertices[iter]-currPX,2)+Math.pow(vertices[iter+1]-currPY,2) <= Math.pow(Math.ceil(resolution/4),2)){
					meshDone = true;
					break;
				}
				iter+=3;
			}
			
			if(currPX > xMax){xMax = currPX} // Update mins and maxes
			if(currPX < xMin){xMin = currPX}
			if(currPY > yMax){yMax = currPY}
			if(currPY < yMin){yMin = currPY}
			
			vertices.push(currPX,currPY,0);
			
			// If we hit the end, break
			if(meshDone){
				console.log("Edge mesh done");
				console.log(currPX + " " + currPY);
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

			// Push non-duplicate faces to indices[]
			for(let j = 0; j < closeVerts.length; j++){
				if(closeVerts[j] == (i/3)-1 && j != 0 && centerVertices[closeVerts[0]*3] == centerVertices[closeVerts[0]*3-3]){ // push topleft faces if there's also a vert to the topleft
					indices.push(i/3,closeVerts[j],closeVerts[j-1]);
				}
				if(closeVerts[j] == (i/3)+1 && j != closeVerts.length-1 && centerVertices[closeVerts[closeVerts.length-1]*3] == centerVertices[closeVerts[closeVerts.length-1]*3+3]){ // push botright faces if there's also a vert to the botright
					indices.push(i/3,closeVerts[j],closeVerts[j+1]);
				}
			}
		}
		/*
		var fullVerts = centerVertices.concat(vertices);
		
		//linking edge verts to center mesh
		for(let i = 0; i < vertices.length; i+=3){
			let closeVerts = [];
			for(let j = 0; j < centerVertices.length; j+=3){
				let dist = Math.sqrt(Math.pow(vertices[i]-centerVertices[j],2) + Math.pow(vertices[i+1]-centerVertices[j+1],2));
				if(dist < resolution){
					// Find absolute angle from next edge vert to every other close vert.
					//let dot = vertices[(i+3)%vertices.length]*centerVertices[j]+vertices[(i+4)%vertices.length]*centerVertices[j+1]; // Modulo in case we are on the last element
					//let det = vertices[(i+3)%vertices.length]*centerVertices[j+1]-vertices[(i+4)%vertices.length]*centerVertices[j];
					let a1 = Math.atan2(vertices[(i+4)%vertices.length]-vertices[i+1],vertices[(i+3)%vertices.length]-vertices[i]); // absolute angle of next edge vert
					let a2 = Math.atan2(centerVertices[j+1]-vertices[i+1],centerVertices[j]-vertices[i]); // absolute angle of close vert
					
					a2 += Math.PI-a1;
					
					if(a2 > Math.PI){
						a2 -= 2 * Math.PI;
					} // a2 now equals absolute angle between next edge vert and close vert
					console.log(a2);
					let v = new vertAngle(j/3,a2);
					closeVerts.push(v);
				}
			}
			// Sort closeVerts by angle
			for(let m = 0; m < closeVerts.length-1;m++){
				for(let n = 0; n < closeVerts.length-m-1; n++){
					if(closeVerts[n].angle > closeVerts[n+1].angle){
						let temp = closeVerts[n];
						closeVerts[n] = closeVerts[n+1];
						closeVerts[n+1] = temp;
					}
				}
			}
			
			//Index edge verts into faces w/ center verts
			for(let i = 0; i < closeVerts.length; i++){
				let firstVert;
				let secondVert;
				if(i == 0){
					firstVert = ((i+3)/3)%vertices.length+(centerVertices.length/3); // index of next edge vert in fullVerts
				}
				else{
					firstVert = closeVerts[i].index;
				}
				if(i+1 == closeVerts.length){
					secondVert = ((i-3)/3)%vertices.length+(centerVertices.length/3); // index of previous edge vert in fullVerts
				}
				else{
					secondVert = closeVerts[i+1].index;
				}
				indices.push(i+centerVertices.length/3,firstVert,secondVert);
			}
		}*/
		
		
		/*for(let i = 0; i < indices.length; i+=3){
			console.log("Face: " + indices[i] + " " + indices[i+1] + " " + indices[i+2]);
		}*/
		//console.log(indices.length/3);
		
		// Indexing opposite side of mesh
		let iLength = indices.length;
		for(let i = 0; i < iLength; i++){
			indices.push(indices[i]+centerVertices.length/3);
		}
		let outsideVerts = []; // OutsideVerts is like the edges of centerVertices. Contains the indices of outside verts in centerVertices.
		for(let i = 0; i < centerVertices.length; i+=3){
			let numAdjacentVerts = 0;
			for(let j = 0; j < centerVertices.length; j++){
				if(Math.sqrt(Math.pow(centerVertices[i]-centerVertices[j],2) + Math.pow(centerVertices[i+1]-centerVertices[j+1],2)) < resolution*1.5){
					numAdjacentVerts++;
				}
			}
			if(numAdjacentVerts != 9){
				outsideVerts.push(i/3);
			}
		}
		
		// Connecting both sides of mesh
		/*for(let i = 0; i < centerVertices.length/3; i++){ // These are the correct ways to connect both sides of the mesh, however the input mesh sux so it looks weird
			indices.push(i,(i+1)%(centerVertices.length/3),(i+1)%(centerVertices.length/3)+centerVertices.length/3);
			indices.push(i,i+centerVertices.length/3,(i+1)%(centerVertices.length/3)+centerVertices.length/3);
		}*/
		/*for(let i = 0; i < 10; i++){ 
			indices.push(outsideVerts[i],(outsideVerts[i]+1)%(centerVertices.length/3),(outsideVerts[i]+1)%(centerVertices.length/3)+centerVertices.length/3);
			indices.push(outsideVerts[i],outsideVerts[i]+centerVertices.length/3,(outsideVerts[i]+1)%(centerVertices.length/3)+centerVertices.length/3);
		}*/
		
		// Converting vert data from pixels to a 2xN coordinate space and displacing on the Z axis.
		let maxHeight = 0;
		for(let i = 0; i < centerVertices.length; i+=3){
			centerVertices[i] = (4*centerVertices[i]/canvas.width)-2;
			centerVertices[i+1] = -.7*((4*centerVertices[i+1]/canvas.width)-2);
			let minDist = 5;
			for(let j = 0; j < vertices.length; j+= 3){ // Set z displacement based on distance to closest edge vert
				let currDist = Math.pow(Math.pow((4*vertices[j]/canvas.width)-2-centerVertices[i],2)+Math.pow(-1*((4*vertices[j+1]/canvas.width)-2)-centerVertices[i+1],2),.25);
				if(currDist < minDist){
					minDist = currDist;
				}
			}
			if(minDist > maxHeight){
				maxHeight = minDist;
			}
			centerVertices[i+2] = minDist;
		}
		for(let i = 0; i < centerVertices.length; i+=3){ // Spherical falloff
			centerVertices[i+2] = (maxHeight-Math.pow(maxHeight-centerVertices[i+2],2)-.3);
		}
		for(let i = 0; i < outsideVerts.length; i++){
			centerVertices[outsideVerts[i]*3+2] = 0;
		}
		let fullVerts = centerVertices.concat(centerVertices);
		for(let i = centerVertices.length; i < centerVertices.length*2; i+=3){
			fullVerts[i+2] = fullVerts[i+2-centerVertices.length]*-1;
		}
		
		// MAPPING UVs
		// xMin = xMin/canvas.width;
		// xMax = yMax/canvas.width;
		// yMax = -1*(yMax/canvas.width)+1;
		// yMin = -1*(yMin/canvas.width)+1;
		
		let UVs = [];
		for(let i = 0; i < fullVerts.length; i+=3){
			UVs.push((fullVerts[i]+2)/4,(fullVerts[i+1]+2)/4);
		}
		
		
		// MAKING THE MESH
		var geometry = new THREE.BufferGeometry(); 
		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(fullVerts, 3));
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute(UVs, 2));
		geometry.computeVertexNormals(); // Normals for back face the wrong way I think
		
		var mesh = new THREE.Mesh(geometry,material);
		scene.add(mesh);
	}

var button = document.querySelector('button');
button.addEventListener('click', meshGen, false);
},false);

// RESOLUTION SLIDER

var slider = document.getElementById("myRes");
var output = document.getElementById("resVal");
output.innerHTML = slider.value;
var resolution = Number(slider.value);

slider.oninput = function() {
  output.innerHTML = this.value;
  resolution = Number(this.value); // Determines the density of vertices, 1 vertex for every 'resolution' pixels (higher # is lower res)
}


let fram = 0;
function animate() {
	
	fram++;
	
	lightPoint.position.set(Math.sin(fram/30)*2,Math.sin((fram/30)+(Math.PI/2))*2,2);
	
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
}

animate();
