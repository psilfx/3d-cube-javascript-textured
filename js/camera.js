/**
 ** @desc Объект камеры, отвечает за формирование матрицы взгляда
 **/
class Camera {	
	eye    = new Vector3F( 0.0 , 1 , 0.0 ); //Положение камеры
	center = new Vector3F( 0 , 0 , 0 ); //Взгляд камеры
	up     = new Vector3F( 0 , 1 , 0 );
	//Углы поворота
	yaw   = 1.595;
	pitch = -0.204;
	
	sensivity = 0.002; //Чувствительность (для мышки)
	speed     = 0.1; //Скорость перемещения
	/**
	 ** @desc Конструктор камеры, принимает позиции, углы поворота и создаёт точку обзора
	 ** @vars (Vector3F) position - позиция камеры, (float) yaw - угол вращения вокруг оси y (лево/право), (float) pitch - угол вращения вокруг оси x(верх/низ)
	 **/
	constructor( position = new Vector3F() , yaw = 0 , pitch = 0 ) {
		this.eye   = position;
		this.yaw   = yaw;
		this.pitch = pitch;
		this.Rotate();
	}
	/**
	 ** @desc Преобразует углы поворота в координаты взгляда
	 **/
	Rotate() {
		let front   = new Vector3F( 0.0 , 0.0 , 0.0 );
			front.x = Math.cos( this.yaw ) * Math.cos( this.pitch );
			front.y = Math.sin( this.pitch );
			front.z = Math.sin( this.yaw ) * Math.cos( this.pitch );
		this.center = front.Normalize();
	}
	/**
	 ** @desc Движение вперёд, назад
	 ** @vars (int) direction - единичный вектор для определения направления перемещения
	 **/
	MoveFront( direction ) {
		let speed   = this.speed * direction;
		let front   = new Vector3F( this.center.x * speed , this.center.y * speed , this.center.z * speed );
		this.eye.x += front.x;
		this.eye.z += front.z;
		
	}
	/**
	 ** @desc Возвращает вектор взгляд, применяется для формирования матрицы LookAt, возвращает сумму векторов
	 **/
	GetCenter() {
		return this.eye.Plus( this.center );
	}
	/**
	 ** @desc Движение влево, вправо
	 ** @vars (int) direction - единичный вектор для определения направления перемещения
	 **/
	MoveStrafe( direction ) {
		let speed      = this.speed * direction;
		let srafe      = this.center.Cross( this.up );
		this.eye.x -= srafe.x * speed * 2;
		this.eye.z -= srafe.z * speed * 2;
	}
	/**
	 ** @desc Получаем смещение расстояние смещения по x y. Применяется для определения смещения поворота камеры при движении мышки. Возвращает массив в двумя значениями.
	 ** @vars (int) x - на которое сместилась мышка, (int) y - на которое сместилась мышка
	 **/
	GetOffset( x , y ) {
		let xoffset = x ;
		let yoffset = y;
		xoffset    *= -this.sensivity;
		yoffset    *= this.sensivity;
		return [ xoffset , yoffset ];
	}
	/**
	 ** @desc Возвращает плоскость для отсечения полигонов, применяется для отсечения невидимых полигонов
	 **/
	GetCutPlane() {
		return new Plane( this.eye.Plus( new Vector3F( this.center.x * zNear , this.center.y * zNear , this.center.z * zNear ) ) , this.center );
	}
}