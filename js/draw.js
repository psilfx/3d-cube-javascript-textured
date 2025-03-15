//Массива для кэша, значения которые надо расчитать, но они всегда одинаковые
const pixelPointerXCache = [];
const pixelPointerYCache = [];
/**
 ** @desc Объект для отрисовки фигур
 **/
class Draw {
	frameImage;
	framePixels;
	stride;
	zBuffer = [];
	/**
	 ** @desc Инициализация буффера изображения для вывода, применяется один раз после создания объекта
	 **/
	InitFrameImage() {
		this.frameImage  = context.getImageData( 0 , 0 , canvas.width , canvas.height );
		this.framePixels = this.frameImage.data;
		this.stride      = canvas.width * 4;
		for( let y = 0; y < canvas.height; y++ ) {
			pixelPointerYCache[ y ] = y * this.stride;
		}
		for( let x = 0; x < canvas.width; x++ ) {
			pixelPointerXCache[ x ] = x * 4;
		}
	}
	/**
	 ** @desc Проверяет по збуфферу и пишет пиксель в массив на вывод
	 ** @vars (int) x - координата x отсносительно экрана, (int) y - координата y отсносительно экрана, (Color) color - цвет на заполнение, (int) z - координата z для проверки по буфферу
	 **/
	SetFramePixel( x , y , color , z = 0 ) {
		let pixelPointer = pixelPointerYCache[ y ] + pixelPointerXCache[ x ];
		if( this.zBuffer[ pixelPointer ] > z ) return;
		this.zBuffer[ pixelPointer ]         = z;
		this.framePixels[ pixelPointer ]     = color.r;
		this.framePixels[ pixelPointer + 1 ] = color.g;
		this.framePixels[ pixelPointer + 2 ] = color.b;
		this.framePixels[ pixelPointer + 3 ] = color.a;
	}
	/**
	 ** @desc Основной метод. Рисует 3д фигуру. 
	 ** @vars (Shape3D) figure - объект фигуры, (Color) color - цвет для отрисовки фигуры
	 **/
	Draw3DFigure( figure , color ) {
		let triangles = figure.GetTranslatedTriangles();
		let light     = globalLight;
		for( let t = 0; t < triangles.length; t++ ) {
			let triangle = triangles[ t ];
			let points   = triangle.GetPoints();
			let normal   = triangle.GetNormal();
			let frags    = triangle.GetFrags();
			let uv       = triangle.GetUV();
			let triColor = this.GetColorFromPoint( points[ 0 ] , normal , frags[ 0 ] , light );
			//this.TextureTriangle( points , uv , triColor  );
			this.TextureTriangleBarycentric( triangle , uv , triColor );
		}
	}
	/**
	 ** @desc Основная функция - вызов на отрисовку, выводит массив пикселей на экран, затем чистит его и збуффер
	 **/
	Draw() {
		context.putImageData( this.frameImage , 0 , 0 );
		this.frameImage  = clearContext.getImageData( 0 , 0 , canvas.width , canvas.height );
		this.framePixels = this.frameImage.data;
		this.zBuffer     = [];
	}
	/**
	 ** @desc Получает цвет точки и смешиваем с источником света, возвращает строчное значение цвета
	 ** @vars (Vector3F) point - точка для получения цвета, (Vector3F) normal - нормаль точки, (Vector3F) frag - мировые координаты точки, (object) light - объект цвета
	 **/
	GetColorFromPoint( point , normal , frag , light ) {
		let dot           = normal.Dot( light.position.Subtract( frag ).Normalize() );
		let fragColorDiff = Math.max( Math.min( dot , 1 ) , light.ambient );
		let lightColor    = light.color.Copy();
			lightColor.a  = fragColorDiff;
		return lightColor;
	}
	/**
	 ** @desc Рисует треугольник
	 ** @vars (array) points - массив точек треугольника
	 **/
	DrawTriangle( points ) {
		context.beginPath();
		this.MoveToPoint( points[ 0 ] );
		this.LineToPoint( points[ 1 ] );
		this.LineToPoint( points[ 2 ] );
		this.LineToPoint( points[ 0 ] );
		context.fill();
		context.stroke();
	}
	/**
	 ** @desc Закрашиваем треугольник пикселями
	 ** @vars (array) triangle - массив точек треугольника, (array) uv - массив координат текстур для точек, (Color) defColor - цвет с значением diff для треугольника
	 **/
	TextureTriangle( triangle , uv , defColor ) {
		//Точки треугольника
		let { point1 , point2 , point3 } = triangle.GetTransformedPoints();
		//Получаем разницу отрезков для текстурирования
		let dda1   = this.GetDDAStep( point1 , point2 );
		let dda2   = this.GetDDAStep( point1 , point3 );
		//Длина цикла
		let length = Math.max( dda1.length , dda2.length );
		//Нормализуем отрезки, один может быть короче другого
		let dda1Decrease  = dda1.length / length;
		let dda2Decrease  = dda2.length / length;
		dda1.increment.x *= dda1Decrease , dda1.increment.y *= dda1Decrease;
		dda2.increment.x *= dda2Decrease , dda2.increment.y *= dda2Decrease;
		//Берём стартовые точки для двух направлений
		let triPoint1 = point1.Copy();
		let triPoint2 = point1.Copy();
		//Стартовая точка текстурных координат
		let uvStart   = uv[ 0 ];
		let uvStart1  = uvStart.Copy();
		let uvStart2  = uvStart.Copy();
		let uvPstep   = uvStart1.Subtract( uv[ 1 ] );
		let uvPsend   = uvStart1.Subtract( uv[ 2 ] );
		//Дистанция отрисовки для збуфера
		let zDistance = point2.z - point1.z;
		//Начинаем закрашивать треугольник
		for( let p = 0; p < length; p++ ) {
			let percentY     = p / length; //Прогресс по одной из осей Y - просто случайное название, на самом деле даже не знаю где находится точка
			let dda3         = this.GetDDAStep( triPoint1 , triPoint2 ); //Разница расстояния между двумя закрашиваемыми точками
			triPoint1        = triPoint1.Plus( dda1.increment ); //Делаем шаг по расстоянию с одной стороны
			triPoint2        = triPoint2.Plus( dda2.increment ); //Делаем шаг по расстоянию с другой стороны
			let texturePoint = triPoint1.Copy();                 //Закрашиваемая точка
			let uvStep       = uvStart2.Subtract( uvStart1 );    //Разница по uv координатам текстуры
			let uvPoint      = uvStart1.Copy();                  //Точка отсчета для uv
			let dda3Length   = dda3.length;                      
			let zBuf         = Math.abs( point1.z + zDistance * percentY ); //Координата z для збуфера
			for( let x = 0; x < dda3Length; x++ ) { //Закрашивает полоску
				let percentX    = x / dda3Length;      //Прогресс закрашивания
				let uvPointStep = uvPoint.Plus( uvStep.Multiply( percentX ) ); //Шагаем по uv
				let color       = textureD.GetPixelByUV( uvPointStep.x , uvPointStep.y ); //Основная текстура
				let colorS      = textureS.GetPixelByUV( uvPointStep.x , uvPointStep.y ); //Текстура бликов
				let colorE      = textureR.GetPixelByUV( uvPointStep.x , uvPointStep.y ); //Текстура света emissive
				let outColor    = defColor.Copy();
				if( color.a > 0 ) outColor = defColor.Multiply( colorPercentCache[ colorS.r ] ).Mix( color ).Multiply( outColor.a ).Mix( colorE ); //Смешиваем цвета - outColor.a - значение diff
				outColor.a = 255; //Восстанавливаем альфу
				//Из за того, что в силу погрешности расчетов линии могут идти через точку и оставлять не закрашенные области
				//Сделан костыль, просто закрашиваю пиксели рядом, когда иду по линии
				this.SetFramePixel( Math.floor( widthH + texturePoint.x     ) , Math.floor( heightH + texturePoint.y     ) , outColor , zBuf );
				this.SetFramePixel( Math.floor( widthH + texturePoint.x - 1 ) , Math.floor( heightH + texturePoint.y     ) , outColor , zBuf );
				this.SetFramePixel( Math.floor( widthH + texturePoint.x + 1 ) , Math.floor( heightH + texturePoint.y     ) , outColor , zBuf );
				this.SetFramePixel( Math.floor( widthH + texturePoint.x     ) , Math.floor( heightH + texturePoint.y - 1 ) , outColor , zBuf );
				this.SetFramePixel( Math.floor( widthH + texturePoint.x     ) , Math.floor( heightH + texturePoint.y + 1 ) , outColor , zBuf );
				//Шаг по текстуре
				texturePoint = texturePoint.Plus( dda3.increment );
			}
			//Шаг по треугольнику
			uvStart1 = uvStart.Plus( uvPstep.Multiply( percentY ) );
			uvStart2 = uvStart.Plus( uvPsend.Multiply( percentY ) );
		}
	}
	/**
	 ** @desc Считает разницу между точками по координатам и возвращает значения и шаг сдвига
	 ** @vars (Vector3F) point1 - первая точка, point2 - вторая точка
	 **/
	GetDDAStep( point1 , point2 ) {
		let dx    = ( point2.x - point1.x );
		let dy    = ( point2.y - point1.y );
		let stepL = Math.max( Math.abs( dx ) , Math.abs( dy ) );
		let stepX = dx / stepL;
		let stepY = dy / stepL;
		return { increment : { x : stepX , y : stepY } , length : stepL , diff : { x : dx , y : dy } };	
	}
	/**
	 ** @desc Получает барицентрические координаты для каждой точки и возвращает их
	 ** @vars (int) x - x - пространства треугольника, (int) y - y - пространства треугольника, (Vector3F) point1 - точка треугольника, (Vector3F) point2 - точка треугольника, (Vector3F) point3 - точка треугольника
	 **/
	GetBarycentric( x , y , point1 , point2 , point3 ) {
		let lambda1 = 	( ( point2.y - point3.y ) * ( x - point3.x ) + ( point3.x - point2.x ) * ( y - point3.y ) ) / 
						( ( point2.y - point3.y ) * ( point1.x - point3.x ) + ( point3.x - point2.x ) * ( point1.y - point3.y ) );
		let lambda2 = 	( ( point3.y - point1.y ) * ( x - point3.x ) + ( point1.x - point3.x ) * ( y - point3.y ) ) / 
						( ( point2.y - point3.y ) * ( point1.x - point3.x ) + ( point3.x - point2.x ) * ( point1.y - point3.y ) );
		let lambda3 = 1 - lambda1 - lambda2;
		return { lambda1 , lambda2 , lambda3 };
	}
	/**
	 ** @desc Закрашивает треугольник пикселями используя барицентрические координаты
	 ** @vars (array) triangle - массив точек треугольника, (array) uv - массив координат текстур для точек, (Color) defColor - цвет с значением diff для треугольника
	 **/
	TextureTriangleBarycentric( triangle , uv , defColor ) {
		//Преобразует точки в пространство экрана
		let { point1 , point2 , point3 } = triangle.GetTransformedPoints();
		//Координаты текстуры для каждой точки
		let uv1    = uv[ 0 ].Copy();
		let uv2    = uv[ 1 ].Copy();
		let uv3    = uv[ 2 ].Copy();
		//Прямоугольник из треугольника
		let minX   = Math.min( point1.x , point2.x , point3.x );
		let maxX   = Math.max( point1.x , point2.x , point3.x );
		let minY   = Math.min( point1.y , point2.y , point3.y );
		let maxY   = Math.max( point1.y , point2.y , point3.y );
		//Проходим по каждому пикселю в ограничивающем прямоугольнике
		for ( let x = minX; x <= maxX; x++ ) {
			for ( let y = minY; y <= maxY; y++ ) {
				//Вычисляет барицентрические координаты
				let { lambda1, lambda2, lambda3 } = this.GetBarycentric( x , y , point1 , point2 , point3 );
				//Проверяет, находится ли точка внутри треугольника
				if ( lambda1 >= 0 && lambda2 >= 0 && lambda3 >= 0 ) {
					//Интерполирует текстурные координаты
					let u = lambda1 * uv1.x + lambda2 * uv2.x + lambda3 * uv3.x;
					let v = lambda1 * uv1.y + lambda2 * uv2.y + lambda3 * uv3.y;
					//Получает цвет из набора текстур
					let colorD = textureD.GetPixelByUV( u , v ); //Основная текстура
					let colorS = textureS.GetPixelByUV( u , v ); //Текстура бликов
					let colorE = textureR.GetPixelByUV( u , v ); //Текстура света emissive
					let outColor = defColor.Copy();
					if( colorD.a > 0 ) outColor = defColor.Multiply( colorPercentCache[ colorS.r ] ).Mix( colorD ).Multiply( outColor.a ).Mix( colorE ); //Смешиваем цвета - outColor.a - значение diff
					outColor.a = 255; //Восстанавливаем альфу
					// Рисуем пиксель
					this.SetFramePixel( Math.floor( widthH + x ) , Math.floor( heightH + y ) , outColor , point1.z );
				}
			}
		}
	}
	/**
	 ** @desc Рисует линию к точке
	 ** @vars (Vector3F) point - точка к которой идёт линия
	 **/
	LineToPoint( point ) {
		context.lineTo( widthH + point.x * figscaleX , heightH + point.y * figscaleY );
	}
	/**
	 ** @desc Стартовая точка для начала отрисовки треугольника
	 ** @vars (Vector3F) point - точка начала отрисовки
	 **/
	MoveToPoint( point ) {
		context.moveTo( widthH + point.x * figscaleX , heightH + point.y * figscaleY );
	}
}

const draw = new Draw();