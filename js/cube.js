function CreateCube( position = new Vector3F() ) {
	let cube;
	cube = new Shape3D( [ 
							new Vector3F( -1 , -1 , 1 ) , new Vector3F( -1 , -1 , 1 ) , new Vector3F( -1 , -1 , 1 ) , 
							new Vector3F( -1 , 1 , 1 ) , new Vector3F( -1 , 1 , 1 ) , new Vector3F( -1 , 1 , 1 ) , 
							new Vector3F( -1 , -1 , -1 ) , new Vector3F( -1 , -1 , -1 ) , new Vector3F( -1 , -1 , -1 ) , 
							new Vector3F( -1 , 1 , -1 ) , new Vector3F( -1 , 1 , -1 ) , new Vector3F( -1 , 1 , -1 ) ,
							new Vector3F( 1 , -1 , 1 ) , new Vector3F( 1 , -1 , 1 ) , new Vector3F( 1 , -1 , 1 ) , 
							new Vector3F( 1 , 1 , 1 ) , new Vector3F( 1 , 1 , 1 ) , new Vector3F( 1 , 1 , 1 ) ,
							new Vector3F( 1 , -1 , -1 ) , new Vector3F( 1 , -1 , -1 ) , new Vector3F( 1 , -1 , -1 ) , 
							new Vector3F( 1 , 1 , -1 ) , new Vector3F( 1 , 1 , -1 ) , new Vector3F( 1 , 1 , -1 )
						] );
	cube.SetIndices( [ 
						0 , 3 , 9 , 
						0 , 9 , 6 , 
						8 , 10 , 21 , 
						8 , 21 , 19 , 
						20 , 23 , 17 , 
						20 , 17 , 14 , 
						13 , 15 , 4 , 
						13 , 4 , 2 , 
						7 , 18 , 12 , 
						7 , 12 , 1 , 
						22 , 11 , 5 , 
						22 , 5 , 16 
						] );
	cube.SetNormals( [ 
						new Vector3F( -1 , 0 , 0 ) , new Vector3F( 0 , -1 , 0 ) , new Vector3F( 0 , 0 , 1 ) , 
						new Vector3F( -1 , 0 , 0 ) , new Vector3F( 0 , 0 , 1 )  , new Vector3F( 0 , 1 , 0 ) , 
						new Vector3F( -1 , 0 , 0 ) , new Vector3F( 0 , -1 , 0 ) , new Vector3F( 0 , 0 , -1 ), 
						new Vector3F( -1 , 0 , 0 ) , new Vector3F( 0 , 0 , -1 ) , new Vector3F( 0 , 1 , 0 ), 
						new Vector3F( 0 , -1 , 0 ) , new Vector3F( 0 , 0 , 1 )  , new Vector3F( 1 , 0 , 0 ) , 
						new Vector3F( 0 , 0 , 1 )  , new Vector3F( 0 , 1 , 0 )  , new Vector3F( 1 , 0 , 0 ) , 
						new Vector3F( 0 , -1 , 0 ) , new Vector3F( 0 , 0 , -1 ) , new Vector3F( 1 , 0 , 0 ) , 
						new Vector3F( 0 , 0 , -1 ) , new Vector3F( 0 , 1 , 0 )  , new Vector3F( 1 , 0 , 0 ) 
					] );
	cube.SetUV([ 
				new Vector3F( 0,3 ) , new Vector3F( -1,0) , new Vector3F( 0,-1 ) , 
				new Vector3F( 1,3 ) , new Vector3F( 1,-1 ) , new Vector3F( 2,0 ) , 
				new Vector3F( 0,2 ) , new Vector3F( -1,1 ) , new Vector3F( 0,2 ) , 
				new Vector3F( 1,2 ) , new Vector3F( 1,2 ) , new Vector3F( 2,1 ) ,
				new Vector3F( 0,0 ) , new Vector3F( 0,0 ) /*14*/ , new Vector3F( 0,0 ) , 
				new Vector3F( 1,0 ) , new Vector3F( 1,0 ) /*17*/ , new Vector3F( 1,0 ) ,
				new Vector3F( 0,1 ) , new Vector3F( 0,1 ) /*20*/ , new Vector3F( 0,1 ) , 
				new Vector3F( 1,1 ) , new Vector3F( 1,1 ) /*23*/ , new Vector3F( 1,1 )
	]);
	cube.CreateTriangles();
	//Положение куба
	cube.translate.x = position.x;
	cube.translate.y = position.y;
	cube.translate.z = position.z;
	return cube;
}