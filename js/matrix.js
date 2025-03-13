const matrix_epsilon = 0.000001;
class Matrix {
	/**
	 ** @desc Создаёт пустую матрицу
	 **/
	Create() {
		return this.Empty( [] );
	}
	/**
	 ** @desc Обнуляет значения массива матрицы
	 ** @vars (array) matrix - массив значений матрицы
	 **/
	Empty( matrix ) {
		this.NullMatrix( matrix );
		matrix[ 0 ]  = 1;
		matrix[ 5 ]  = 1;
		matrix[ 10 ] = 1;
		matrix[ 15 ] = 1;
		return matrix;
	}
	NullMatrix( matrix ) {
		for( let m = 0; m < 16; m++ ) {
			matrix[ m ] = 0;
		}
		return matrix;
	}
	Copy( matrix ) {
		let copy = this.Create();
		for( let c = 0; c < 16; c++ ) {
			copy[ c ] = matrix[ c ];
		}
		return copy;
	}
	Perspective( matrix , fieldOfViewRad , aspectRation , zNear, zFar ) {
		this.NullMatrix( matrix );
		matrix[ 0 ]  = aspectRation * fieldOfViewRad;
		matrix[ 5 ]  = fieldOfViewRad;
		matrix[ 10 ] = zFar / ( zFar - zNear );
		matrix[ 11 ] = 1;
		matrix[ 14 ] = ( -zFar * zNear ) / ( zFar - zNear );
		matrix[ 15 ] = 0;
		return matrix;
	}
	Translate( matrix , vector3f ) {
		let cache = this.Copy( matrix );
		matrix[ 12 ] = cache[ 0 ] * vector3f.x + cache[ 4 ] * vector3f.y + cache[ 8 ]  * vector3f.z + cache[ 12 ];
		matrix[ 13 ] = cache[ 1 ] * vector3f.x + cache[ 5 ] * vector3f.y + cache[ 9 ]  * vector3f.z + cache[ 13 ];
		matrix[ 14 ] = cache[ 2 ] * vector3f.x + cache[ 6 ] * vector3f.y + cache[ 10 ] * vector3f.z + cache[ 14 ];
		matrix[ 15 ] = cache[ 3 ] * vector3f.x + cache[ 7 ] * vector3f.y + cache[ 11 ] * vector3f.z + cache[ 15 ];
		return matrix;
	}
	RotateX( matrix , fTheta = 0 ) {
		matrix[ 0 ]  = 1;
		matrix[ 5 ]  = Math.cos( fTheta );
		matrix[ 6 ]  = Math.sin( fTheta );
		matrix[ 9 ]  = -Math.sin( fTheta );
		matrix[ 10 ] = Math.cos( fTheta );
		matrix[ 15 ] = 1;
		return matrix;
	}
	RotateY( matrix , fTheta = 0 ) {
		matrix[ 0 ]  = Math.cos( fTheta );
		matrix[ 2 ]  = -Math.sin( fTheta );
		matrix[ 5 ]  = 1;
		matrix[ 8 ]  = Math.sin( fTheta );
		matrix[ 10 ] = Math.cos( fTheta );
		matrix[ 15 ] = 1;
		return matrix;
	}
	RotateZ( matrix , fTheta = 0 ) {
		matrix[ 0 ]  = Math.cos( fTheta );
		matrix[ 1 ]  = Math.sin( fTheta );
		matrix[ 4 ]  = -Math.sin( fTheta );
		matrix[ 5 ]  = Math.cos( fTheta );
		matrix[ 10 ] = 1;
		matrix[ 15 ] = 1;
		return matrix;
	}
	/**
	 ** @desc Возвращает матрицу взгляда, относительно координатов камеры, некоторые решения подсмотрел реализации glmatrix.net, очень крутая либа
	 ** @vars (Vector3F) eye - позиция камеры, (Vector3F) center - точка взгляда камеры, (Vector3F) up - вертикальное положение камеры
	 **/
	LookAt( matrix , eye , center , up ) {
		let len     = 0;
		let view    = eye.Subtract( center ); //
		if ( Math.abs( view.x ) < matrix_epsilon && Math.abs( view.y ) < matrix_epsilon && Math.abs( view.z ) < matrix_epsilon ) return this.NullMatrix( [] );
		//Перпендикуляры осей, относительно взгляда
		let	z = view.Normalize();
		let x = z.Cross( up.Normalize() ).Normalize();
		let y = x.Cross( z ).Normalize();
		//Заполнение значений матрицы
		matrix[ 0 ]  = x.x;
		matrix[ 1 ]  = y.x;
		matrix[ 2 ]  = z.x;
		matrix[ 3 ]  = 0;
		matrix[ 4 ]  = x.y;
		matrix[ 5 ]  = y.y;
		matrix[ 6 ]  = z.y;
		matrix[ 7 ]  = 0;
		matrix[ 8 ]  = x.z;
		matrix[ 9 ]  = y.z;
		matrix[ 10 ] = z.z;
		matrix[ 11 ] = 0;
		matrix[ 12 ] = -( x.Dot( eye ) );
		matrix[ 13 ] = -( y.Dot( eye ) );
		matrix[ 14 ] = -( z.Dot( eye ) );
		matrix[ 15 ] = 1;
		return matrix;
	}
	MultiplyVector( matrix , vector3f ) {
		let outVector3f = new Vector3F();
		outVector3f.x = vector3f.x * matrix[ 0 ] + vector3f.y * matrix[ 4 ] + vector3f.z * matrix[ 8 ]  + matrix[ 12 ] * vector3f.w;
		outVector3f.y = vector3f.x * matrix[ 1 ] + vector3f.y * matrix[ 5 ] + vector3f.z * matrix[ 9 ]  + matrix[ 13 ] * vector3f.w;
		outVector3f.z = vector3f.x * matrix[ 2 ] + vector3f.y * matrix[ 6 ] + vector3f.z * matrix[ 10 ] + matrix[ 14 ] * vector3f.w;
		outVector3f.w = vector3f.x * matrix[ 3 ] + vector3f.y * matrix[ 7 ] + vector3f.z * matrix[ 11 ] + matrix[ 15 ] * vector3f.w;
		if( outVector3f.w != 0 ) {
			outVector3f.x /= outVector3f.w;
			outVector3f.y /= outVector3f.w;
			outVector3f.z /= outVector3f.w;
			outVector3f.w  = 1;
		}
		return outVector3f;
	}
	MultiplyMatrix( matrix1 , matrix2 ) {
		let out = [];
			out[ 0 ]  = matrix1[ 0 ]  * matrix2[ 0 ] + matrix1[ 1 ]  * matrix2[ 4 ] + matrix1[ 2 ]  * matrix2[ 8 ]  + matrix1[ 3 ]  * matrix2[ 12 ];
			out[ 1 ]  = matrix1[ 0 ]  * matrix2[ 1 ] + matrix1[ 1 ]  * matrix2[ 5 ] + matrix1[ 2 ]  * matrix2[ 9 ]  + matrix1[ 3 ]  * matrix2[ 13 ];
			out[ 2 ]  = matrix1[ 0 ]  * matrix2[ 2 ] + matrix1[ 1 ]  * matrix2[ 6 ] + matrix1[ 2 ]  * matrix2[ 10 ] + matrix1[ 3 ]  * matrix2[ 14 ];
			out[ 3 ]  = matrix1[ 0 ]  * matrix2[ 3 ] + matrix1[ 1 ]  * matrix2[ 7 ] + matrix1[ 2 ]  * matrix2[ 11 ] + matrix1[ 3 ]  * matrix2[ 15 ];
			out[ 4 ]  = matrix1[ 4 ]  * matrix2[ 0 ] + matrix1[ 5 ]  * matrix2[ 4 ] + matrix1[ 6 ]  * matrix2[ 8 ]  + matrix1[ 7 ]  * matrix2[ 12 ];
			out[ 5 ]  = matrix1[ 4 ]  * matrix2[ 1 ] + matrix1[ 5 ]  * matrix2[ 5 ] + matrix1[ 6 ]  * matrix2[ 9 ]  + matrix1[ 7 ]  * matrix2[ 13 ];
			out[ 6 ]  = matrix1[ 4 ]  * matrix2[ 2 ] + matrix1[ 5 ]  * matrix2[ 6 ] + matrix1[ 6 ]  * matrix2[ 10 ] + matrix1[ 7 ]  * matrix2[ 14 ];
			out[ 7 ]  = matrix1[ 4 ]  * matrix2[ 3 ] + matrix1[ 5 ]  * matrix2[ 7 ] + matrix1[ 6 ]  * matrix2[ 11 ] + matrix1[ 7 ]  * matrix2[ 15 ];
			out[ 8 ]  = matrix1[ 8 ]  * matrix2[ 0 ] + matrix1[ 9 ]  * matrix2[ 4 ] + matrix1[ 10 ] * matrix2[ 8 ]  + matrix1[ 11 ] * matrix2[ 12 ];
			out[ 9 ]  = matrix1[ 8 ]  * matrix2[ 1 ] + matrix1[ 9 ]  * matrix2[ 5 ] + matrix1[ 10 ] * matrix2[ 9 ]  + matrix1[ 11 ] * matrix2[ 13 ];
			out[ 10 ] = matrix1[ 8 ]  * matrix2[ 2 ] + matrix1[ 9 ]  * matrix2[ 6 ] + matrix1[ 10 ] * matrix2[ 10 ] + matrix1[ 11 ] * matrix2[ 14 ];
			out[ 11 ] = matrix1[ 8 ]  * matrix2[ 3 ] + matrix1[ 9 ]  * matrix2[ 7 ] + matrix1[ 10 ] * matrix2[ 11 ] + matrix1[ 11 ] * matrix2[ 15 ];
			out[ 12 ] = matrix1[ 12 ] * matrix2[ 0 ] + matrix1[ 13 ] * matrix2[ 4 ] + matrix1[ 14 ] * matrix2[ 8 ]  + matrix1[ 15 ] * matrix2[ 12 ];
			out[ 13 ] = matrix1[ 12 ] * matrix2[ 1 ] + matrix1[ 13 ] * matrix2[ 5 ] + matrix1[ 14 ] * matrix2[ 9 ]  + matrix1[ 15 ] * matrix2[ 13 ];
			out[ 14 ] = matrix1[ 12 ] * matrix2[ 2 ] + matrix1[ 13 ] * matrix2[ 6 ] + matrix1[ 14 ] * matrix2[ 10 ] + matrix1[ 15 ] * matrix2[ 14 ];
			out[ 15 ] = matrix1[ 12 ] * matrix2[ 3 ] + matrix1[ 13 ] * matrix2[ 7 ] + matrix1[ 14 ] * matrix2[ 11 ] + matrix1[ 15 ] * matrix2[ 15 ];
		return out;
	}
	Scale( matrix , vector3f ) {
		matrix[ 0 ]  = vector3f.x;
		matrix[ 5 ]  = vector3f.y;
		matrix[ 10 ] = vector3f.z;
		return;
	}
}
const mat4 = new Matrix();