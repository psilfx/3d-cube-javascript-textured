/**
 ** @desc Стандартный объект для работы с плоскостью, position - точка основания плоскости, normal - перпендикуляр.
 **/
class Plane {
	position; //Точка основания
	normal;   //Нормаль
	d = 0;    //Расстояние от начала координат
    constructor( vector3f , normal ) {
        this.position = vector3f.Copy();
        this.normal   = normal.Copy();
		this.d        = this.normal.Dot( this.position ); 
    }
    /**
	 ** @desc Проверяет находится ли точка спереди плоскости, возвращает true или false
	 ** @vars (Vector3F) vector3f - проверяемая точка
	 **/
    PointInFront( vector3f ) {
        return this.Distance( vector3f ) >= 0;
    }
	Distance( vector3f ) {
		return this.normal.Dot( vector3f ) - this.d;
	}
	GetNormal() {
		return this.normal;
	}
}
/**
 ** @desc Объект для работы с отсечением полигонов. Принимает плоскость и массив точек полигонов, проверяет наличие пересечения и возвращает рассеченные треугольники. За основу взят алгоритм Сазерленда-Ходжмана.
 **/
class TriangleClipper {
	/**
	 ** @desc Находит точку пересечения ребра
	 ** @vars (Plane) plane - плоскость отсечения, (Vector3F) edgeStart - начальная точка ребра, (Vector3F) edgeEnd - конечная точка ребра
	 **/
	IntersectEdgeWithPlane( plane , edgeStart, edgeEnd ) {
		let normal = plane.GetNormal().Normalize();
		let d      = plane.d;
		let ad     = edgeStart.Dot( normal );
		let bd     = edgeEnd.Dot( normal );
		let t      = ( d - ad ) / ( bd - ad );
		let edgeVector    = edgeEnd.Subtract( edgeStart );
		let edgeIntersect = edgeVector.Multiply( t );
		return edgeStart.Plus( edgeIntersect );
	}
	/**
	 ** @desc Проверяет с какой стороны лежит точка, наружняя или внутренняя
	 ** @vars (Plane) plane - плоскость отсечения, (array) polygon - массив с точками полигона, (array) insideArray - массив для добавления точек отсечения, (array) outsideArray - массив для добавления точек отсечения
	 **/
	CheckInsideOutsidePointByDistance( plane , polygon , insideArray , outsideArray ) {
		for( let point of polygon ) {
			( plane.PointInFront( point ) ) ? insideArray.push( point ) : outsideArray.push( point );
		}
	}
	/**
	 ** @desc Создаёт два треугольника для внутреннего отсечения, когда две точке лежат в области видимости
	 ** @vars (Plane) plane - плоскость отсечения, (array) insideArray - массив точек отсечения, (array) outsideArray - массив точек отсечения
	 **/
	CreateInsideCutTriangles( plane , insidePoints , outsidePoints ) {
		//Первый треугольник
		let triangle1      = []; 
			triangle1[ 0 ] = insidePoints[ 0 ].Copy();
			triangle1[ 1 ] = insidePoints[ 1 ].Copy();
			triangle1[ 2 ] = this.IntersectEdgeWithPlane( plane , insidePoints[ 0 ] , outsidePoints[ 0 ] );
		//Второй треугольник
		let triangle2      = [];
			triangle2[ 0 ] = insidePoints[ 1 ].Copy();
			triangle2[ 1 ] = triangle1[ 2 ].Copy();
			triangle2[ 2 ] = this.IntersectEdgeWithPlane( plane , insidePoints[ 1 ] , outsidePoints[ 0 ] );
		return [ triangle1 , triangle2 ];
	}
	/**
	 ** @desc Создаёт треугольник для внешнего отсечения, когда две точке лежат вне области видимости
	 ** @vars (Plane) plane - плоскость отсечения, (array) insideArray - массив точек отсечения, (array) outsideArray - массив точек отсечения
	 **/
	CreateOutsideCutTriangle( plane , insidePoints , outsidePoints ) {
		let triangle = [];
			triangle[ 0 ] = insidePoints[ 0 ].Copy();
			triangle[ 1 ] = this.IntersectEdgeWithPlane( plane , insidePoints[ 0 ] , outsidePoints[ 0 ] );
			triangle[ 2 ] = this.IntersectEdgeWithPlane( plane , insidePoints[ 0 ] , outsidePoints[ 1 ] );
		return [ triangle ];
	}
	/**
	 ** @desc ОСНОВНОЙ МЕТОД. Проверяет наличие пересечения полигона с плоскостью, создаёт два массива с точками внутреннего и внешнего отсечения и возвращает рассеченные треугольники
	 ** @vars (Plane) plane - плоскость отсечения, (array) polygon - массив точек полигона
	 **/
	Clip( plane , polygon ) {
		let clippedPolygon  = [];
		let insidePoints    = [];
		let outsidePoints   = [];
		this.CheckInsideOutsidePointByDistance( plane , polygon , insidePoints , outsidePoints );
		//Если все точки лежат в области видимости, возвращаем полигон
		if ( outsidePoints.length == 0 ) {
			return [ polygon ];
		} else if( insidePoints.length == 0 ) { //Если все точки лежат за пределами видимости, возвращаем пустой массив
			return [];
		} else if ( outsidePoints.length == 1 && insidePoints.length == 2 ) {
			//Собираем треугольники, их получается 2
			clippedPolygon = this.CreateInsideCutTriangles( plane , insidePoints , outsidePoints );
		} else if ( outsidePoints.length == 2 && insidePoints.length == 1 ) {
			//Один треугольник, так как нужно просто найти места пересечения
			clippedPolygon = this.CreateOutsideCutTriangle( plane , insidePoints , outsidePoints );
		}
		return clippedPolygon;
	}
}
const triClipper = new TriangleClipper();