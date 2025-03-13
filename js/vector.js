/**
 ** @desc Стандартный объект трёхмерного вектора
 **/
class Vector3F {
	x = 0;
	y = 0;
	z = 0;
	w = 1;
	constructor( x = 0 , y = 0 , z = 0 , w = 1 ) {
		this.Set( x , y , z , w );
	}
	Dot( vector3f ) {
		return ( this.x * vector3f.x ) + ( this.y * vector3f.y ) + ( this.z * vector3f.z );
	}
	Cross( vector3f ) {
		return new Vector3F( this.z * vector3f.y - this.y * vector3f.z , this.x * vector3f.z - this.z * vector3f.x , this.y * vector3f.x - this.x * vector3f.y , this.w - vector3f.w );
	}
	Distance( vector3f ) {
		let vec = vector3f.Subtract( this );
		return vec.Length();
	}
	Length() {
		return Math.hypot( this.x , this.y , this.z );
	}
	Normalize() {
		let len = 1 / this.Length();
		return new Vector3F( this.x * len , this.y * len , this.z * len );
	}
	Negate() {
		return new Vector3F( -this.x , -this.y , -this.z );
	}
	Set( x , y , z , w = 0 ) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
	Translate( vector3f ) {
		this.x += vector3f.x;
		this.y += vector3f.y;
		this.z += vector3f.z;
	}
	Copy() {
		return new Vector3F( this.x , this.y , this.z , this.w );
	}
	Subtract( vector3f ) {
		return new Vector3F( this.x - vector3f.x , this.y - vector3f.y , this.z - vector3f.z );
	}
	Plus( vector3f ) {
		return new Vector3F( this.x + vector3f.x , this.y + vector3f.y , this.z + vector3f.z );
	}
	Multiply( num ) {
		return new Vector3F( this.x * num , this.y * num , this.z * num );
	}
	Devide( num ) {
		return new Vector3F( this.x / num , this.y / num , this.z / num );
	}
	Compare( vector3f ) {
		if( vector3f.x == this.x && vector3f.y == this.y && vector3f.z == this.z ) return true;
		return false;
	}
}