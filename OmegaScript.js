var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'barbara.jpg';
var canvas = document.createElement("canvas");
var canvas2 = document.createElement("canvas"); // Displays original image for reference

const monoValue = (r,g,b) => (r + g + b) / 3;

// Map range code from RosettaCode
var mapRange = function(from, to, s) {
  return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
};

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
var TheCanvas2;

img.onload = function() {
	canvas.width = this.width;
	canvas.height = this.height;
	canvas2.width = this.width;
	canvas2.height = this.height;
	TheCanvas = canvas.getContext('2d');
  TheCanvas.drawImage(img, 0, 0);
  TheCanvas2 = canvas2.getContext('2d');
  TheCanvas2.drawImage(img, 0, 0);
  document.body.appendChild(canvas);
  document.body.appendChild(canvas2);
  img.style.display = 'none';
  let pixels = TheCanvas.getImageData(0, 0, this.width, this.height);
  let buffer = TheCanvas.createImageData(pixels);


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
	
	for (let x = 1; x < this.width; x++)
	{
		for (let y = 1; y < this.height; y++)
		{
			let v = edgeDetect(pixels, x, y)*7;
			setRGB(buffer, x,y, [v,v,v]);
		}
	}

	TheCanvas.putImageData(buffer, 0, 0);

	let apxI = TheCanvas.getImageData(0, 0, this.width, this.height);
	let apx = apxI.data;
	// Turning it into a silhouette
	/*
	for (let x = 0; x < this.width; x++)
	{
		let topInner, bottomInner;
		let thereIsEdge = false;
		for (let y = 0; y < this.height; y++)
		{
			let imageIndex = (x+(canvas.width*y))*4;
			if(apx[imageIndex] > 150){
				thereIsEdge = true;
				while(apx[imageIndex] > 150 && y <= this.height){
					imageIndex = (x+(canvas.width*y))*4;
					y++
				}
				topInner = y;
				break;
			}
			
		}
		for (let y = this.height-1; y > 0; y--)
		{
			let imageIndex = (x+(canvas.width*y))*4;
			if(apx[imageIndex] > 150){
				while(apx[imageIndex] > 150 && y > 0){
					imageIndex = (x+(canvas.width*y))*4;
					y--
					}
				bottomInner = y;
				break;
			}
			
			
		}
		console.log(topInner);
		console.log(bottomInner);
		if(thereIsEdge){
			for(let y = topInner; y < bottomInner; y++){
				setRGB(buffer, x, y, [0,0,0]);
			}
		}
	}*/
	
	// Magic wand-esque silhouette finder
	
	let checked = [];
	for(let i = 0; i < canvas.width*canvas.height; i++){
		checked.push(0)
	}
	let queue = [];
	queue.push(0);
	// console.log(canvas.width);
	// console.log(canvas.height);
	// console.log(apx[canvas.width*4]);
	//console.log(stack.includes(1));
	
	while(queue.length > 0 && queue.length < 1000){
		let curr = queue.shift();
		//console.log("x: " + Math.floor(curr/canvas.width) + " y: " + curr%canvas.width);
		checked[curr] = 1; // Add adjacent 4 pixels to stack if not already checked and not an edge
		if(!checked[curr+canvas.width] && curr+canvas.width <= canvas.width*canvas.height && apx[(curr+canvas.width)*4] < 100 && !queue.includes(curr+canvas.width)){
			queue.push(curr+canvas.width);
			//console.log("bot");
		}
		if(!checked[curr-canvas.width] && curr-canvas.width >= 0 && apx[(curr-canvas.width)*4] < 100 && !queue.includes(curr-canvas.width)){
			queue.push(curr-canvas.width);
			//console.log("top");
		}
		if(!checked[curr+1] && curr+1 <= canvas.width*canvas.height && apx[(curr+1)*4] < 100 && !queue.includes(curr+1)){
			queue.push(curr+1);
			//console.log("right");
		}
		if(!checked[curr-1] && curr-1 >= 0 && apx[(curr-1)*4] < 100 && !queue.includes(curr-1)){
			queue.push(curr-1);
			//console.log("left");
		}
		//console.log("length: " + queue.length);
	}
	
	console.log(checked);
	console.log(queue);
	
	// Silhouette detected, expand selection by 3
	
	for(let i = 0; i < 3; i++){
		let expand = [];
		for(let j = 0; j < checked.length; j++){
			if(checked[j-canvas.width] == 1 || checked[j-1] == 1 || checked[j+canvas.width] == 1 || checked[j+1] == 1 || checked[j] == 1){
				expand[j] = 1;
			}
		}
		checked = expand;
	}
	
	for(let i = 0; i < canvas.width*canvas.height; i++){
		if(!checked[i]){
			setRGB(buffer, i%canvas.width, Math.floor(i/canvas.width), [0,0,0]);
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
textureLoader.load('barbara.jpg', function (texture){
	console.log('texture loaded');
	material = new THREE.MeshStandardMaterial({metalness: .0, roughness: .6, map: texture, bumpMap: texture, bumpScale: .1, side: THREE.DoubleSide});
});
const light = new THREE.AmbientLight( 0x707070 ); // soft white light
const lightPoint = new THREE.PointLight( 0xf0f0f0,2,6,2 );
const lightPoint2 = new THREE.PointLight( 0xf0f0f0,.2,3,2 );
lightPoint.position.set(2,.5,1);
lightPoint2.position.set(0,0,-1);
scene.add( light );
scene.add(lightPoint);
scene.add(lightPoint2);

//const controls = new OrbitControls( camera, renderer.domElement );
//controls.update();

window.addEventListener('load', function(ev) {
	function meshGen(){
		
		//TheCanvas = canvas.getContext('2d');
		  let px = TheCanvas.getImageData(0, 0, canvas.width, canvas.height);
		  let pixels = px.data;
		  //console.log(typeof(buffer));
		
		const vertices = [];
		//const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		//const data = imageData.data;
		var piX = 0; // pixelIndexX stores the X index of the pixel we're on
		var piY = 0; // Same but for y
		
		// FIND FIRST POINT AND ADD IT. 
		
		// console.log(TheCanvas);
		//console.log(pixels.length);
		// console.log(canvas);
		//let bufLength = canvas.height * canvas.width * 4;
		//console.log(piY * canvas.width);
		while (piY * canvas.width < pixels.length) { // While not at end of data
			let imageIndex = (piX+(canvas.width*piY))*4; // Easier parsing of RGB, stores image data index
			if(pixels[imageIndex]+pixels[imageIndex+1]+pixels[imageIndex+2] >= 700){ //if white
				console.log("Coords of first point: " + piX + " " + piY);
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
		let circleSamples = resolution*resolution*5; // So we don't need to do this a lot, could be lower?
		let lastAngle = 0; // Hold on to angle so check starts from last angle, not from top.
		let xMax = 0,yMax = 0; // Store the min and max coordinate values for vertices to save time in the interior mesh gen, only need to check coords inside these values.
		let xMin = canvas.width;
		let yMin = canvas.height;
		
		// EDGE CREATION LOOP
		
		while(true){ 
			
			// Check all pixels 'resolution' distance away from current vert for edges clockwise.
			// Could use a smaller number than resolution^2? Maybe res*log(res)?
			// Edge data must be thicker than 1px, if it's 1px then it might miss checks on tight pixel diagonals
			let meshGood = false;
			for(let i = 0; i < circleSamples/2; i++){
				// (sampleX+currPX,sampleY+currPY) is the coordinates for the current sampled pixel
				let sampleX = Math.floor(Math.cos((2*Math.PI*(lastAngle+i))/circleSamples)*resolution);
				let sampleY = Math.floor(Math.sin((2*Math.PI*(lastAngle+i))/circleSamples)*resolution);
				
				// If sampled pixel has a red value of <= 100 (therefore is an edge), make it the new current vertex
				if(pixels[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))] >= 100){
					
					let iter = 0;
					let closeToVert = false;
					while(typeof(vertices[iter]) !== 'undefined'){ // Don't make a new vert close to another, just keep checking. This prevents doubling back in certain places.
						if(Math.pow(vertices[iter]-(sampleX+currPX),2)+Math.pow(vertices[iter+1]-(sampleY+currPY),2) <= Math.pow(Math.ceil(resolution/2),2)){
							closeToVert = true;
						}
						iter+=3;
					}
					
					if(!closeToVert){
						currPX = sampleX + currPX;
						currPY = sampleY + currPY;
						
						lastAngle = lastAngle+i;
						
						meshGood = true;
						break;
					}
					
				}
				// Counterclockwise check, trying to find the closest in both directions
				sampleX = Math.floor(Math.cos((2*Math.PI*(lastAngle-i))/circleSamples)*resolution);
				sampleY = Math.floor(Math.sin((2*Math.PI*(lastAngle-i))/circleSamples)*resolution);
				
				if(pixels[4*((sampleX+currPX)+(canvas.width*(sampleY+currPY)))] >= 100){
					
					let iter = 0;
					let closeToVert = false;
					while(typeof(vertices[iter]) !== 'undefined'){ 
						if(Math.pow(vertices[iter]-(sampleX+currPX),2)+Math.pow(vertices[iter+1]-(sampleY+currPY),2) <= Math.pow(Math.ceil(resolution/2),2)){
							closeToVert = true;
						}
						iter+=3;
					}
					if(!closeToVert){
						currPX = sampleX + currPX;
						currPY = sampleY + currPY;
						
						lastAngle = lastAngle-i;
						
						meshGood = true;
						break;
					}
				}
			}
			
			// If current vert is within ciel('resolution'/4) px of another vert 3 times in a row, end edge creation. 3 times to avoid spiky parts ending the mesh
			// let iter = 0;
			// while(typeof(vertices[iter]) !== 'undefined'){ 
				// if(Math.pow(vertices[iter]-currPX,2)+Math.pow(vertices[iter+1]-currPY,2) <= Math.pow(Math.ceil(resolution/4),2)){
					
					// meshDone++;
				// }
				// iter+=3;
			// }
			
			if(meshGood){
				meshGood = false;
			}
			else{
				meshDone = true;
			}
			
			if(currPX > xMax){xMax = currPX} // Update mins and maxes
			if(currPX < xMin){xMin = currPX}
			if(currPY > yMax){yMax = currPY}
			if(currPY < yMin){yMin = currPY}
			
			vertices.push(currPX,currPY,0);
			
			//If we hit the end, break
			if(meshDone){
				console.log("Edge mesh done");
				console.log("Last point: " + currPX + " " + currPY);
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
		
		// MAPPING UVs
		
		
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
			centerVertices[i] = mapRange([0,canvas.width],[-2,2],centerVertices[i]);
			centerVertices[i+1] = mapRange([0,-1*canvas.height],[2,6],centerVertices[i+1]);
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
			centerVertices[i+2] = (maxHeight-Math.pow(maxHeight-centerVertices[i+2],2)-.1);
		}
		for(let i = 0; i < outsideVerts.length; i++){
			centerVertices[outsideVerts[i]*3+2] = 0;
		}
		let fullVerts = centerVertices.concat(centerVertices);
		for(let i = centerVertices.length; i < centerVertices.length*2; i+=3){
			fullVerts[i+2] = fullVerts[i+2-centerVertices.length]*-1;
		}
		
		let UVs = [];
		let fromY = [-2,2];
		let fromX = [-2,2];
		let to = [0,1];
		for(let i = 0; i < fullVerts.length; i+=3){
			//UVs.push(((fullVerts[i]+2)/4)/1,((fullVerts[i+1]+2)/4)/.42 - 1.02);
			
			UVs.push(mapRange(fromX,to,fullVerts[i]),mapRange(fromY,to,fullVerts[i+1]));
			// console.log(fullVerts[i]+2)/4;
			// console.log(fullVerts[i+1]+2)/4;
		}
		
		
		
		// MAKING THE MESH
		var geometry = new THREE.BufferGeometry(); 
		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(fullVerts, 3));
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute(UVs, 2));
		geometry.computeVertexNormals(); // Normals for back face the wrong way I think
		
		var mesh = new THREE.Mesh(geometry,material);
		scene.add(mesh);
		
		var geo = new THREE.BoxGeometry(.2,.2,.2);
		var mesh1 = new THREE.Mesh(geo);
		var mesh2 = new THREE.Mesh(geo);
		var mesh3 = new THREE.Mesh(geo);
		var mesh4 = new THREE.Mesh(geo);
		mesh1.position.set(2,2,0);
		mesh2.position.set(2,-2,0);
		mesh3.position.set(-2,-2,0);
		mesh4.position.set(-2,2,0);
		scene.add(mesh1);
		scene.add(mesh2);
		scene.add(mesh3);
		scene.add(mesh4);
		
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
	
	//lightPoint.position.set(Math.sin(fram/30)*2,Math.sin((fram/30)+(Math.PI/2))*2,2);
	
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
}

animate();
