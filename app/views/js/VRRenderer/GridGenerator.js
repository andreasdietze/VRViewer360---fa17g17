var GridGenerator = function(renderer){
	this.renderer 	= renderer;
	this.group 		= new THREE.Group();
};

GridGenerator.prototype.createGrid = function(gridSettings)
{
	this.group.name  		= typeof(gridSettings.name) 		=== 'undefined' 
							? 'WorldGrid' 	: gridSettings.name;

	gridSettings.position 	= typeof(gridSettings.position) 	=== 'undefined' 
							? new THREE.Vector3( 0, 0, 0 ) : gridSettings.position;

	gridSettings.segments 	= ( typeof(gridSettings.segments) 	=== 'undefined' 
							|| gridSettings.segments === 0 ) 
							? 100 			: gridSettings.segments; 

	gridSettings.size  			= ( typeof(gridSettings.size) 	=== 'undefined' 
							|| gridSettings.size === 0 ) 
							? 1000			: gridSettings.size;

	gridSettings.gridColor 	= typeof(gridSettings.gridColor) 	=== 'undefined' 
							? 0x666666 	: gridSettings.gridColor;

	gridSettings.borderColor= typeof(gridSettings.borderColor)  === 'undefined' 
							? 0xbbbbbb 	: gridSettings.borderColor;

	gridSettings.xAxisColor = typeof(gridSettings.xAxisColor)	=== 'undefined' 
							? 0xff4444 	: gridSettings.xAxisColor;

	gridSettings.yAxisColor = typeof(gridSettings.yAxisColor)	=== 'undefined' 
							? 0x44ff44 	: gridSettings.yAxisColor;

	gridSettings.zAxisColor = typeof(gridSettings.zAxisColor)	=== 'undefined' 
							? 0x4444ff 	: gridSettings.zAxisColor;

	var geo 		= null;
	var line 		= null;
	var mesh 		= null;
	var steps 		= gridSettings.size / gridSettings.segments;

	var mat 		= new THREE.LineBasicMaterial({ color : gridSettings.gridColor });
	var borderMat 	= new THREE.LineBasicMaterial({ color : gridSettings.borderColor });
	var xAxisMat 	= new THREE.LineBasicMaterial({ color : gridSettings.xAxisColor });
	var zAxisMat 	= new THREE.LineBasicMaterial({ color : gridSettings.zAxisColor });
	var yAxisMat 	= new THREE.LineBasicMaterial({ color : gridSettings.yAxisColor });

	// Set arrows on positive axis directions.
	var dir 		= new THREE.Vector3( 1, 0, 0 );
	var origin 		= new THREE.Vector3 (gridSettings.size / 5, 0, 0 ).add(gridSettings.position);
	var length 		= gridSettings.size;
	var hex 		= gridSettings.xAxisColor;
	var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
	this.group.add(arrowHelper);
	
	dir 			= new THREE.Vector3( 0, 0, 1 );
	origin 			= new THREE.Vector3( 0, 0, gridSettings.size / 5 ).add(gridSettings.position);
	length 			= gridSettings.size;
	hex 			= gridSettings.zAxisColor;
	arrowHelper 	= new THREE.ArrowHelper( dir, origin, length, hex );
	this.group.add(arrowHelper);

	dir 			= new THREE.Vector3( 0, 1, 0 );
	origin 			= new THREE.Vector3( 0, gridSettings.size / 5, 0).add(gridSettings.position);
	length 			= gridSettings.size;
	hex 			= gridSettings.yAxisColor;
	arrowHelper 	= new THREE.ArrowHelper( dir, origin, length, hex );
	this.group.add(arrowHelper);

	// X-axis
	geo = new THREE.Geometry();
	geo.vertices.push
	(
		new THREE.Vector3
		( 
			-gridSettings.size + gridSettings.position.x,
			gridSettings.position.y,
			gridSettings.position.z
		),	
		new THREE.Vector3
		(
			gridSettings.size + gridSettings.position.x,
			gridSettings.position.y,
			gridSettings.position.z
		)
	);

	line = new THREE.Line(geo, xAxisMat);
	this.group.add(line);

	// Z-axis
	geo = new THREE.Geometry();
	geo.vertices.push
	(
		new THREE.Vector3
		(
			gridSettings.position.x,
			gridSettings.position.y,
			-gridSettings.size + gridSettings.position.z
		),
		new THREE.Vector3
		(
			gridSettings.position.x,
			gridSettings.position.y,
			gridSettings.size + gridSettings.position.z
		)
	);

	line = new THREE.Line(geo, zAxisMat);
	this.group.add(line);

	// Y-axis
	geo = new THREE.Geometry();
	geo.vertices.push
	(
		new THREE.Vector3
		(
			gridSettings.position.x,
			-gridSettings.size + gridSettings.position.y,
			gridSettings.position.z
		),
		new THREE.Vector3
		(
			gridSettings.position.x,
			gridSettings.size + gridSettings.position.y,
			gridSettings.position.z
		)
	);

	line = new THREE.Line(geo, yAxisMat);
	this.group.add(line);

	// Segments (top->down)
	for(i = -steps + 1; i < steps; i++)
	{
	    if(i !== 0)
	    {
			geo = new THREE.Geometry();
			geo.vertices.push
			(
				new THREE.Vector3
				(
					-gridSettings.size + gridSettings.position.x,
					gridSettings.position.y,
					i * gridSettings.segments + gridSettings.position.z
				),
				new THREE.Vector3
				(
					gridSettings.size + gridSettings.position.x,
					gridSettings.position.y,
					i * gridSettings.segments + gridSettings.position.z
				)
	    	);

		    line = new THREE.Line(geo, mat);
		    this.group.add(line);
	  	}
	}

	// Segments (left->right)
	for(i = -steps + 1; i < steps; i++)
	{
		if(i !== 0)
		{
			geo = new THREE.Geometry();
			geo.vertices.push
			(
				new THREE.Vector3
				(
					i * gridSettings.segments + gridSettings.position.x,
					gridSettings.position.y,
					-gridSettings.size + gridSettings.position.z
				),
				new THREE.Vector3
				(
					i * gridSettings.segments + gridSettings.position.x,
					gridSettings.position.y,
					gridSettings.size + gridSettings.position.z
				)
			);

			line = new THREE.Line(geo, mat);
			this.group.add(line);
		}
	}

	// Close border (bottom)
	geo = new THREE.Geometry();
	geo.vertices.push
	(
		new THREE.Vector3
		(
			-gridSettings.size + gridSettings.position.x,
			gridSettings.position.y,
			steps * gridSettings.segments + gridSettings.position.z
		),
		new THREE.Vector3
		(
			gridSettings.size + gridSettings.position.x,
			gridSettings.position.y,
			steps * gridSettings.segments + gridSettings.position.z
		)
	);

	line = new THREE.Line(geo, borderMat);
	this.group.add(line);

	// Close border (top)
	geo = new THREE.Geometry();
	geo.vertices.push
	(
		new THREE.Vector3
		(
			-gridSettings.size + gridSettings.position.x,
			gridSettings.position.y,
			-steps * gridSettings.segments + gridSettings.position.z
		),
		new THREE.Vector3
		(
			gridSettings.size + gridSettings.position.x,
			gridSettings.position.y,
			-steps * gridSettings.segments + gridSettings.position.z
		)
	);

	line = new THREE.Line(geo, borderMat);
	this.group.add(line);

	// Close border (right)
	geo = new THREE.Geometry();
	geo.vertices.push
	(
		new THREE.Vector3
		(
			steps * gridSettings.segments + gridSettings.position.x,
			gridSettings.position.y,
			-gridSettings.size + gridSettings.position.z
		),
		new THREE.Vector3
		(
			steps * gridSettings.segments + gridSettings.position.x,
			gridSettings.position.y,
			gridSettings.size + gridSettings.position.z
		)
	);

	line = new THREE.Line(geo, borderMat);
	this.group.add(line);

	// Close border (left)
	geo = new THREE.Geometry();
	geo.vertices.push
	(
		new THREE.Vector3
		(
			-steps * gridSettings.segments + gridSettings.position.x,
			gridSettings.position.y,
			-gridSettings.size + gridSettings.position.z
		),
		new THREE.Vector3
		(
			-steps * gridSettings.segments + gridSettings.position.x,
			gridSettings.position.y,
			gridSettings.size + gridSettings.position.z
		)
	);

	line = new THREE.Line(geo, borderMat);
	this.group.add(line);

	// Add the final grid to the scene.
	this.renderer.scene.add(this.group);
};