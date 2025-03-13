/**
 ** @desc Объект для работы с цветом, используется для смешивания и вывода цвета на рендер
 **/
 const colorPercentCache = [];
 const colorHalfDevideCache = [];
for( let c = 0; c <= 255; c++ ) {
	 colorPercentCache[ c ] = c / 255;
}
for( let c = 0; c <= 1000; c++ ) {
	 colorHalfDevideCache[ c ] = parseInt( c / 2 );
}
class Color{
	r = 0;
	g = 0;
	b = 0;
	a = 1;
	constructor( r = 255 , g = 255 , b = 255 , a = 1 ){
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	/**
	 ** @desc Избавляемся от значения альфа канала
	 **/
	SetAlpha(){
		this.r *= this.a;
		this.g *= this.a;
		this.b *= this.a;
		this.a = 1;
	}
	/**
	 ** @desc Смешивает два цвета
	 ** @vars (Color) color - цвет для смешивания
	 **/
	Mix( color ) {
		//color.SetAlpha();
		let r = this.r + color.r;
		let g = this.g + color.g;
		let b = this.b + color.b;
		let a = this.a;
		return new Color( colorHalfDevideCache[ parseInt( r ) ] , colorHalfDevideCache[ parseInt( g ) ] , colorHalfDevideCache[ parseInt( b ) ] , a );
	}
	/**
	 ** @desc Умножает значения всех каналов, возвращает новый цвет
	 ** @vars (number) num - число на которое нужно умножить
	 **/
	Multiply( num ) {
		let r = this.r * num;
		let g = this.g * num;
		let b = this.b * num;
		let a = this.a;
		return new Color( parseInt( r ) , parseInt( g ) , parseInt( b ) , a );
	}
	/**
	 ** @desc Создаёт копию объекта цвета
	 **/
	Copy() {
		return new Color( this.r , this.g , this.b , this. a );
	}
	/**
	 ** @desc Преобразуем значения в строку, применяется при выводе в рендер
	 **/
	ToString() {
		return "rgb( " + this.r * this.a + "," + this.g * this.a + "," + this.b * this.a + " )";
	}
}