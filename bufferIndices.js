let camera, scene, renderer;

let mesh;

init();
animate();

function init() {

	//

	camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 1, 3500 );
	camera.position.z = 64;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x050505 );

	//

	const light = new THREE.HemisphereLight();
	scene.add( light );

	//

	const geometry = new THREE.BufferGeometry();

	const indices = [];

	const vertices = [];
	const normals = [];
	const colors = [];

	const size = 20;
	const segments = 10;

	const halfSize = size / 2;
	const segmentSize = size / segments;

	// generate vertices, normals and color data for a simple grid geometry

	/*for ( let i = 0; i <= segments; i ++ ) {

		const y = ( i * segmentSize ) - halfSize;

		for ( let j = 0; j <= segments; j ++ ) {

			const x = ( j * segmentSize ) - halfSize;

			vertices.push( x, - y, 0 );
			normals.push( 0, 0, 1 );

			const r = ( x / size ) + 0.5;
			const g = ( y / size ) + 0.5;

			colors.push( r, g, 1 );

		}

	}

	// generate indices (data for element array buffer)

	for ( let i = 0; i < segments; i ++ ) {

		for ( let j = 0; j < segments; j ++ ) {

			const a = i * ( segments + 1 ) + ( j + 1 );
			const b = i * ( segments + 1 ) + j;
			const c = ( i + 1 ) * ( segments + 1 ) + j;
			const d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );
			*/
			/*
			Ok how tf do indices work?
			
			Basically, a face index consists of 3 vertices. TRIS GOOD.
			
			These vertices are specified in the vertex array/attribute/thing.
			For example, say you have 3 vertices in the array: (0,0,0),(0,1,0),(1,0,0).
				Putting (0,1,2) into the index array/buffer/attribute/thing will tell
				it to make a face between the vert at those indices.
			*/

			// generate two faces (triangles) per iteration
/*
			indices.push( a, b, d ); // face one
			indices.push( b, c, d ); // face two

		}
		
	}
	
	indices.push(0,2,22);
	indices.push(0,37,10);*/
	
	for(let i = 0; i < 24; i++){
		
		vertices.push(Math.sin((Math.PI*i)/12)*5,Math.sin(((Math.PI*i)/12)+(Math.PI / 2))*5,0);
		//normals.push( 0, 0, 1 );
	}

	for(let i = 1; i < 23; i++){
		indices.push(0,i,i+1);
	}

	//

	geometry.setIndex( indices );
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	geometry.computeVertexNormals();
	//geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
	//geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	const material = new THREE.MeshPhongMaterial( {
		side: THREE.DoubleSide,
		//wireframe: true,
		//vertexColors: true
	} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
	

	//

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	const time = Date.now() * 0.001;

	//mesh.rotation.x = time * 0.25;
	//mesh.rotation.y = time * 0.5;

	renderer.render( scene, camera );

}

