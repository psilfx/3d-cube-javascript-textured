class Light {
	position;
	length; 
	ambient;
	color;
	constructor( position = new Vector3F() , color = new Color( 255 , 255 , 255 ) , length = 30 , ambient = 0.5 ) {
		this.position = position;
		this.color    = color;
		this.length   = length;
		this.ambient  = ambient;
	}
	SetColor( color ) {
		this.color = color;
	}
}