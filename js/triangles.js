/**
 ** @desc Стандартный объект для работы с треугольником, применяется при хранении и рендере полигонов
 **/
class Triangle {
	points           = [];
	normals          = [];
	uv               = [];
	pointsTransform  = [];
	fragsTransform   = [];
	normal;           //Общая нормаль треугольника
	normalTransform;
	direction        = 0;
	visible          = 0;
   /**
	** @desc Принимает массив из трёх точек и трёх нормалей, для формирования треугольника
	** @vars (array) points - массив из трёх точек треугольника, (array) normals - нормали точек , (array) uv - коордианты текстур для точек
	**/
	constructor( points = [ new Vector3F() , new Vector3F() , new Vector3F() ] , normals = [ new Vector3F() , new Vector3F() , new Vector3F() ] , uv = [ new Vector3F( 1 , 1 ) , new Vector3F( 0 , 1 ) , new Vector3F( 0 , 0 ) ] ) {
		this.points[ 0 ]  = points[ 0 ];
		this.points[ 1 ]  = points[ 1 ];
		this.points[ 2 ]  = points[ 2 ];
		this.normals[ 0 ] = normals[ 0 ];
		this.normals[ 1 ] = normals[ 1 ];
		this.normals[ 2 ] = normals[ 2 ];
		this.uv[ 0 ]      = uv[ 0 ];
		this.uv[ 1 ]      = uv[ 1 ];
		this.uv[ 2 ]      = uv[ 2 ];
		//Создаём пустые вектора, дабы не словить ошибку при вызове пустого объекта
		this.normal          = new Vector3F();
		this.normalTransform = new Vector3F();
	}
	/**
	 ** @desc Считает основную нормаль, для треугольника, как правило нормали у точек совпадают, чтобы не делать одно и тоже три раза
	 **/
	CalcNormal() {
		this.normal = this.normals[ 0 ].Plus(  this.normals[ 1 ].Plus(  this.normals[ 2 ] ) ).Devide( 3 ).Normalize();
	}
	/**
	 ** @desc Функци возврата преобразованных значений, используетдся для расчетов и рендера
	 ** @vars (Color) color - цвет для смешивания
	 **/
	GetPoints() {
		return this.pointsTransform;
	}
	GetNormal() {
		return this.normalTransform;
	}
	GetFrags() {
		return this.fragsTransform;
	}
	GetUV() {
		return this.uv;
	}
	/**
	 ** @desc Считает направление в зависимости от заданной позиции
	 ** @vars (Vector3F) position - позиция, относительно которой нужно посчитать направление
	 **/
	Direction( position ) {
		this.direction = this.fragsTransform[ 0 ].Subtract( position ).Normalize();
	}
	/**
	 ** @desc Возвращает произведения векторов нормали и направления, для отсечения
	 **/
	Visible() {
		return this.visible = this.direction.Dot( this.normalTransform );
	}
	GetVisible() {
		return this.visible;
	}
	/**
	 ** @desc Обнуляет преобразования, применяется перед началом расчетов
	 **/
	EmptyTransforms() {
		this.pointsTransform  = [];
		this.fragsTransform   = [];
	}
}
/**
 ** @desc Объект для работы с треугольниками
 **/
class TriangleTransforms {
	/**
	 ** @desc Применяет матрицу вида и проекции, используется после применения матрицы модели, возвращает треугольник
	 ** @vars (Triangle) triangle - объект треугольника для преобразования, (array) viewProjectionMatrix - матрица вида помноженная на матрицу проекции, массив[0-16]
	 **/
	ApplyProjectionMatrix( triangle , viewProjectionMatrix ) {
		let frags = triangle.fragsTransform;
		for( let i = 0; i < frags.length; i++ ) {
			let frag = frags[ i ];
			//Применяем матрицы вида и перспективы
			triangle.pointsTransform[ i ] = mat4.MultiplyVector( viewProjectionMatrix , frag );
		}
		return triangle;
	}
	/**
	 ** @desc Применяет матрицу модели для преобразования в мировое пространство и поворачивает нормаль треугольника, возвращает треугольник
	 ** @vars (Triangle) triangle - объект треугольника для преобразования, (array) modelMatrix - матрица модели массив[0-16], (array) rotateMatrix - матрица поворота массив[0-16]
	 **/
	TransformModelAndNormal( triangle , modelMatrix , rotateMatrix ) {
		for( let i = 0; i < 3; i++ ) {
			let point  = triangle.points[ i ];
			triangle.fragsTransform[ i ]   = mat4.MultiplyVector( modelMatrix  , point  ); //Применяем трансформации в мировых координатах
		}
		triangle.normalTransform = mat4.MultiplyVector( rotateMatrix , triangle.normal ); //Поворачиваем нормаль
		return triangle;
	}
}
const triTransform = new TriangleTransforms;