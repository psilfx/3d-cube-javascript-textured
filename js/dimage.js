/**
 ** @desc Объект для загрузки и обработки изображения
 **/
class DImage {
	src = ""; //Путь к изображению
	img;      //Загруженное изображение
	pixels     = []; //Массив пикселей
	rgbaData   = []; //Массив с объектами пикселей
	rgbaStride = []; //Длина значений пикселей по оси y
	rgbaXOff   = []; //Сдвиг пикселей по оси x
	constructor( path ) {
		this.img        = new Image();
		this.img.src    = path;
		this.img.loaded = false;
		this.img.wrap   = this;
		//По завершению загрузки
		this.img.onload = function() {
			this.stride = this.width * 4;
			this.loaded = true;
			//Канвас для загрузки текстуры
			let tcontext = tcanvas.getContext( '2d'  );
			tcontext.clearRect( 0 , 0 , tcanvas.width, tcanvas.height );
			tcanvas.width  = this.width;
			tcanvas.height = this.height;
			//Считает
			this.heightHalf = parseInt( this.height * 0.5 );
			this.widthHalf  = parseInt( this.width * 0.5 );
			this.maxheight  = Math.max( this.width , this.height );
			//Считает центр изображения
			this.origin           = {}
			this.origin.translate = parseInt( this.maxheight * 0.5 );
			this.origin.offsetX   = parseInt( this.origin.translate - this.widthHalf );
			this.origin.offsetY   = parseInt( this.origin.translate - this.heightHalf );
			tcontext.drawImage( this , 0 , 0 );
			//Сохраняет пиксели изображения
			let imageData = tcontext.getImageData( 0 , 0 , this.width , this.height );
			let pixelData = imageData.data;
			for( let p = 0; p <= pixelData.length; p++ ) {
				this.wrap.pixels[ p ] = pixelData[ p ];
			}
			this.wrap.CreateRGBA();
		}
		
	}
	/**
	 ** @desc Создаёт массив с объектами пикселей, чтобы не создавать их каждый раз
	 **/
	CreateRGBA() {
		for( let y = 0; y <= this.img.height; y++ ) {
			this.rgbaStride[ y ] = parseInt( y * this.img.stride );
			for( let x = 0; x <= this.img.width; x++ ) {
				this.rgbaXOff[ x ] = x * 4;
				this.rgbaData[ this.rgbaStride[ y ] + this.rgbaXOff[ x ] ] = this.GetPixelFromData( x , y );
			}
		}
	}
	/**
	 ** @desc Получает и возвращает пиксель из массива
	 ** @vars (int) x - координата x отсносительно текстуры, (int) y - координата y отсносительно текстуры
	 **/
	GetPixel( x , y ) {
		return this.GetPixelFromData( x , y );
	}
	/**
	 ** @desc Возвращает объект пикселя
	 ** @vars (int) x - координата x отсносительно текстуры, (int) y - координата y отсносительно текстуры
	 **/
	GetRGBAPixel( x , y ) {
		return this.rgbaData[ this.rgbaStride[ y ] + this.rgbaXOff[ x ] ];
	}
	/**
	 ** @desc Получает и возвращает пиксель по uv координатам
	 ** @vars (int) x - координата x отсносительно текстуры, (int) y - координата y отсносительно текстуры
	 **/
	GetPixelByUV( x , y ) {
		x = Math.abs( x );
		y = Math.abs( y );
		x = parseInt( ( x - Math.floor( x ) ) * this.img.width );
		y = parseInt( ( y - Math.floor( y ) ) * this.img.height );
		return this.GetRGBAPixel( x , y );
	}
	/**
	 ** @desc Получает и возвращает пиксель напрямую из массива
	 ** @vars (int) x - координата x отсносительно текстуры, (int) y - координата y отсносительно текстуры
	 **/
	GetPixelFromData( x , y ) {
		let pixel = {};
		let pixelPointer = this.rgbaStride[ y ] + this.rgbaXOff[ x ];
		pixel.r = this.pixels[ pixelPointer ];
		pixel.g = this.pixels[ pixelPointer + 1 ];
		pixel.b = this.pixels[ pixelPointer + 2 ];
		pixel.a = this.pixels[ pixelPointer + 3 ];
		return pixel;
	}
}