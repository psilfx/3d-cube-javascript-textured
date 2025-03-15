/**
 ** @desc Объект для хранения и трансформации точек обрабатываемой фигуры
 **/
class Shape3D {
	points              = [];   //Основные точки в пространстве модели
	indices             = [];   //Набор индексов вершин
	normals             = [];   //Нормали вершин
	triangles           = [];   //Треугольники из точек
	uv                  = [];   //Положение текстуры
	translatedTriangles = [];   //Преобразованные треугольники, после применения матриц трансформации, для последующей передачи в рендер
	color     = new Color();    //Цвет фигуры
	translate = new Vector3F(); //Смещение фигуры относительно оси координат
	rotate    = {};             //Углы в радианах для вращения по осям
	scale     = {};
	/**
	 ** @desc Конструктор фигуры, принимает массив точек и сохраняет их в points
	 ** @vars (array) pointsArray - массив с исходными точками фигуры
	 **/
	constructor( pointsArray ) {
		for( let p = 0; p < pointsArray.length; p++ ) {
			this.points.push( pointsArray[ p ] );
		}
		this.color     = new Color( 255 , 165 , 0 );
		this.translate = new Vector3F( 0 , 0 , 0 );
		this.rotate    = { x : 0 , y : 0 , z : 0 };
		this.scale     = { x : 1 , y : 1 , z : 1 };
	}
	/**
	 ** @desc Инициализация треугольников, для дальнейшей работы в рендере, вызывается после заполнения массивов точек и вершин
	 **/
	CreateTriangles() {
		let indices = this.indices;
		let points  = this.points;
		let normals = this.normals;
		let uv      = this.uv;
		let id      = 0;
		for( let p = 0; p < indices.length; p += 3 ) {
			let i1      = indices[ p ];
			let i2      = indices[ p + 1 ];
			let i3      = indices[ p + 2 ];
			let point1  = points[ i1 ].Copy();
			let point2  = points[ i2 ].Copy();
			let point3  = points[ i3 ].Copy();
			let normal1 = normals[ i1 ].Copy();
			let normal2 = normals[ i2 ].Copy();
			let normal3 = normals[ i3 ].Copy();
			let uv1     = uv[ i1 ].Copy();
			let uv2     = uv[ i2 ].Copy();
			let uv3     = uv[ i3 ].Copy();
			//Создаём треугольник и добавляем в массив
			let triangle = new Triangle( id , [ point1  , point2  , point3 ] , [ normal1 , normal2 , normal3 ] , [ uv1 , uv2 , uv3 ] );
				triangle.CalcNormal();
			this.triangles.push( triangle );
			id++;
		}
		
	}
	/**
	 ** @desc Методы поворота осей на заданный угол
	 ** @vars (float) angle - угол в радианах
	 **/
	RotateX( angle ) {
		this.rotate.x += angle;
	}
	RotateY( angle ) {
		this.rotate.y += angle;
	}
	RotateZ( angle ) {
		this.rotate.z += angle;
	}
	Rotate( x = 0 , y = 0 , z = 0 ) {
		this.rotate.x += x;
		this.rotate.y += y;
		this.rotate.z += z;
	}
	/**
	 ** @desc Задаёт вершины фигуры, используются для построения треугольников
	 ** @vars (array) indicesArray - массив вершин
	 **/
	SetIndices( indicesArray ) {
		this.indices = indicesArray;
	}
	/**
	 ** @desc Задаёт нормали точек треугольников
	 ** @vars (array) normalsArray - массив вершин
	 **/
	SetNormals( normalsArray ) {
		this.normals = normalsArray;
	}
	SetUV( uvArray ) {
		this.uv = uvArray;
	}
	GetIndices() {
		return this.indices;
	}
	GetNormals() {
		return this.normals;
	}
	/**
	 ** @desc Добавляем новую точку в фигуру
	 **/
	AddPoint( vector3f ) {
		this.points.push( vector3f );
	}
	/**
	 ** @desc Удаляет точку из фигуры
	 **/
	RemovePoint( pointIndex ) {
		this.points.splice( pointIndex , 1 ) ;
	}
	/**
	 ** @desc Задаёт цвет фигуры
	 **/
	SetColor( color ) {
		this.color = color;
	}
	/**
	 ** @desc Возвращает точки, без преобразований, может понадобится если нужно применить изменения к самой фигуре
	 **/
	GetPoints() {
		return this.points;
	}
	/**
	 ** @desc Выводит фигуру на холст
	 **/
	Draw() {
		draw.Draw3DFigure( this , this.color );
	}
	/**
	 ** @desc Смещает точку на заданный вектор
	 ** @vars (Vector3F) vector3f - вектор смещения
	 **/
	Translate( vector3f ) {
		this.translate.Translate( vector3f );
	}
	/**
	 ** @desc Поворачивает всю фигуру на заданный угол
	 ** @vars (float) angle - угол поворота в радианах
	 **/
	Rotate( angle ) {
		this.angle += angle;
	}
	/**
	 ** @desc Обновление объекта фигуры, применяется раз за кадр
	 **/
	Update() {
		this.translatedTriangles = [];
		this.ApplyTransforms();
	}
	/**
	 ** @desc Применяет преобразования смещения и вращения, должен использоваться раз, за кадр
	 **/
	ApplyTransforms() {
		let triangles       = this.triangles;
		let rotateMatrix    = mat4.Create();
		let translateMatrix = mat4.Create();
		let scaleMatrix     = mat4.Create();
		let rotX            = mat4.RotateY( mat4.Create() , this.rotate.y );
		let rotY            = mat4.RotateX( mat4.Create() , this.rotate.x );
		let rotZ            = mat4.RotateZ( mat4.Create() , this.rotate.z );
			rotateMatrix    = mat4.MultiplyMatrix( mat4.MultiplyMatrix( rotY , rotZ ) , rotX );
		mat4.Translate( translateMatrix , this.translate );
		mat4.Scale( scaleMatrix , new Vector3F( this.scale.x , this.scale.y , this.scale.z ) );
		let modelMatrix     = mat4.Create();
			modelMatrix     = mat4.MultiplyMatrix( mat4.MultiplyMatrix( scaleMatrix , rotateMatrix ) , translateMatrix );
		let cumeraCut       = camera.GetCutPlane();
		for( let t = 0; t < triangles.length; t++ ) {
			let triangle     = triangles[ t ];
				triangle.EmptyTransforms(); //Сбрасываем трансформации
				triangle     = triTransform.TransformModelAndNormal( triangle , modelMatrix , rotateMatrix );
				triangle.Direction( camera.eye );
			if( triangle.Visible() > 0 ) continue; //Откидываем невидимый треугольник
			let cutTriangles = triClipper.Clip( cumeraCut , triangle.fragsTransform ); //Разбиваем полигон, по плоскости камеры
			if( cutTriangles.length > 0 ) {
				for( let ct = 0; ct < cutTriangles.length; ct++ ) {
					let cutTriangleFrags = cutTriangles[ ct ];
					let cutTriangle      = new Triangle( triangle.id , [] , [] , triangle.GetUV() );
					for( let p = 0; p < cutTriangleFrags.length; p++ ) {
						let frag = cutTriangleFrags[ p ];
						cutTriangle.pointsTransform[ p ]  = mat4.MultiplyVector( viewProjectionMatrix ,frag );
						cutTriangle.fragsTransform[ p ]   = frag.Copy();
						cutTriangle.normalTransform       = triangle.normalTransform.Copy();
					}
					this.translatedTriangles.push( cutTriangle );
				}
			}
		}
	}
	/**
	 ** @desc Возвращает точки, со всеми преобразованиями, должен использоваться при основных вычислениях
	 **/
	GetTranslatedTriangles() {
		return this.translatedTriangles;
	}
}