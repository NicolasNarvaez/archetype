
//MIT 2015 Nicolás Narváez

//Un visualiador 3D de audio en html, multiexplorador, multidispositivo
//soporta multiples servicios web, como soundcloud y youtube, basado en THREE y de facil extension.
//las visualizaciones con las que trabaja son modulares por lo que permite remezcla, similar a milkdrop,
//y todas ellas tienen acceso a un conjunto de informacion que proviene de un analizador
//tambien se le pueden agregar mas filtros al analizador
//esta diseñado para ser insertado como componente en otras paginas, o como aplicacion unica,

//Licensia, repositorio:
//https://github.com/NicolasNarvaez/archetype

/*
(function() {
    if(typeof Object.prototype.uniqueid === 'undefined') {
        var id = 0;
        Object.prototype.uniqueid = function(){
            if(typeof this.__uniqueid === 'undefined')
                this.__uniqueid = ++id;
            return this.__uniqueid;
        };
    }
})();
*/
var NZ = {};

NZ.AlgorithmTester = function() {
	var self = this;
	this.algorithm = function() {  };
	this.testOnce = function(context, params) {
		var t = (new Date()).getTime();
		self.algorithm.apply(context,params);
		self.tests.push( (new Date()).getTime() - t);
	};
	this.test = function(context, params) {
		if( (self.testLimit !== 0 && self.tests.length >= self.testLimit) || !self.continueTesting) {
			self.testEnd();
			return;
		}
		self.testOnce(context, params);
		setTimeout(self.test, self.testInterval);
	};
	this.testEnd = function() { console.log(this.tests); };
	this.tests = [];
	this.testInterval = 0;
	this.continueTesting = true;
	this.testLimit = 50;
};
NZ.debugging = false;

NZ.HTML5 = {};
NZ.HTML5.Media = {};
NZ.HTML5.Media.error = function(error) {
	var error_media = [
		'Has abortado el playback del medio',
		'Error de coneccion en descarga de medio',
		'Medio usa caracteristicas no soportadas, o esta corrupto',
		'Servidor o red inaccesibles, o formato no soportado'
	];
	var resp = 'Error desconocido';
	switch(error.code) {
		case error.MEDIA_ERR_ABORTED:
			resp = error_media[0]; break;
		case error.MEDIA_ERR_NETWORK:
			resp = error_media[1]; break;
		case error.MEDIA_ERR_DECODE:
			resp = error_media[2]; break;
		case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
			resp = error_media[3]; break;
	}
	return resp;
};
NZ.HTML5.Media.readyState = function(readyState) {
		/*
	0 = HAVE_NOTHING - no information whether or not the audio/video is ready
	1 = HAVE_METADATA - metadata for the audio/video is ready
	2 = HAVE_CURRENT_DATA - data for the current playback position is available, but not enough data to play next frame/millisecond
	3 = HAVE_FUTURE_DATA - data for the current and at least the next frame is available
	4 = HAVE_ENOUGH_DATA - enough data available to start playing
	*/
	var estados = ['Sin metadatos', 'Con metadatos', 'Posicion actual cargada','Segmento cargado', 'Suficientes datos cargados'];
	return estados[readyState];
};
NZ.HTML5.Style = {};
NZ.HTML5.Style.addBackground = function(domElement){

    var div = document.createElement('DIV');
    div.className = 'backShadow';
    domElement.insertBefore(div,domElement.childNodes[0]);
};

NZ.SC = {};
NZ.SC.initialize = function(args) {
	if(NZ.SC.available() && !NZ.SC.initialized() ) {
		if(!args) args = {};

		if(args.client_id) 	NZ.SC.client_id = args.client_id;
		else 				args.client_id = NZ.SC.client_id;

		if(!args.client_id) return false;

		NZ.SC._initialized = true;
		return SC.initialize( args );
	}
	return false;
};
NZ.SC.client_id = null;
NZ.SC.initialized = function() {
	return (NZ.SC._initialized)? NZ.SC._initialized : false;
};
NZ.SC.available = function() {
	var res;
	try {
		if(SC !== undefined)
			res =true;
	}
	catch(e) {
		res = false;
	}
	return res;
};

NZ.navigator = {};
NZ.navigator.getUserMedia = function() {
	var funcion = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	return funcion.apply(navigator, arguments);
};

NZ.window = {};
NZ.window.AudioContext = function() {
	var old = window.AudioContext;
	var funcion = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
	window.AudioContext = funcion;
	var ret = new window.AudioContext();
	window.AudioContext = old;
	return ret;
};
NZ.window.audioContextAvailable = function() {
	try {
		var audioCtx = NZ.window.AudioContext();
		return true;
	}
	catch(e) {
		return false;
	}
};
NZ.window.audioContext = {};
NZ.window.audioContext.audioNode = {};
NZ.window.audioContext.audioNode.disconnect = function(audioNode, arrayArgs) {
	var funcion = audioNode.disconnect || audioNode.oDisconnect || audioNode.msDisconnect || audioNode.mozDisconnect || audioNode.webKitDisconnect;
	return funcion.apply(audioNode, arrayArgs);
};
NZ.window.requestAnimationFrame = function() {
	var funcion = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
	return funcion.apply(window, arguments);
};
NZ.window.cancelAnimationFrame = function() {
	var funcion = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
	return funcion.apply(window, arguments);
};

NZ.document = {};
NZ.document.requestFullScreen = function(elem) {
	var funcion = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
	return funcion.call(elem);
};
NZ.document.exitFullscreen = function() {
	var funcion = document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
	return funcion.apply(document, arguments);
};

NZ.WEBGL = {};

NZ.WEBGL.available = (function() {
	var canvas = document.createElement('canvas'),
		gl = null;

	try {
		gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	}
	catch(e) {}

	if (gl) return true;
	return false;
})();

NZ.THREE = {};

NZ.THREE.Renderer = function(params, container) {
	var self = this;

	this._container = null;
	this.container = function(container) {};
	this.renderer = null;
	this.dom = null;
	this.onResize = function() {};

	this._resolution = 1.0;
	this.resolution = function(res){};

	params = (params)? params : {};
	if(NZ.WEBGL.available)
		this.renderer = new THREE.WebGLRenderer(params);
	else
		this.renderer = new THREE.CanvasRenderer(params);
	this.renderer.setClearColor( 0x6699AA , 1.0);
	this.dom = this.renderer.domElement;

	this.onResize = function(e) {
		var res = self.resolution();
		var style = window.getComputedStyle(this);
		var width = parseInt(parseInt(style.width)*res),
			height = parseInt(parseInt(style.height)*res);

		//actualizar el size del canvas
		self.dom.width = width;
		self.dom.height = height;
		//actualizar el size del renderizador THREE
		self.renderer.setSize( width , height );

		self.dom.dispatchEvent(new Event('resize'));
	};

	this.container = function(container) {
		if(container) {
			this._container = container;
			container.appendChild(this.dom);

			this.dom.parentNode.addEventListener('resize', this.onResize, false);
			this.dom.parentNode.addEventListener('change', this.onResize, false);

			this.dom.parentNode.dispatchEvent(new Event('resize'));
		}

		return container;
	};

	this.container(container);

	this.resolution = function(res){
		if(res) {
			this._resolution = res;
			this.dom.dispatchEvent(new Event('resize'));
		}

		return this._resolution;
	};
};

NZ.THREE.GeometrySphereUniform = function(radio, pisos, data, random) {

	if(data === undefined)
		data = {};
	//crear la estructura geometrica, los vertices y meterlos en un array de geometria:
	var geometry = new THREE.Geometry();	//llenar con vertices
	var indices = [];	//tendra la estructura: [ ..., pisoene = [indice de vert1, indice de vert2, ...  ], ... , pisoverts= [indice de ultimo vert] ]

	var theta = Math.PI/pisos;	//ang entre verts
	var arco = theta*radio;    //arco entre verts

	var txt = '';
	var current = 0;// = indice vertice actual, usado para crear la asociacion en "indices"
	for( var piso = 0; piso <= pisos; piso++ ){	//para cada piso
		indices[piso] = [];				//inicializa piso
		var y = Math.sin(piso*theta - Math.PI/2)*radio;	//altura del piso

		var rp = Math.sqrt(radio*radio - y*y);			//dist. eje vertical de verts en piso
		var verts = Math.floor(Math.PI*2*rp/arco);		//vertices en piso, a partir de l y perim del piso
		if(!verts) verts=1;				//valor limite

		var delta = 2*Math.PI/verts;			//angulo entre verts de piso
		var ang = (piso%2)/2*delta;		//angulo actual, iniciacion alternada en pisos pares -> "asegurar" densidad uniforme

		for(var vert = 0 ; vert < verts; vert++ ) {	//para cada vertice en piso
			indices[piso].push(geometry.vertices.length);	//llenar asociador
			geometry.vertices.push( new THREE.Vector3(	//crear vert
				rp*Math.cos(ang),
				y,
				rp*Math.sin(ang)//
			));
			ang += delta;	//aumentar angulo
		}
	}
    data.indices = indices;
	data.pisos = pisos;
	data.radio = radio;

	//creacion de la lista de caras
	//retorna vertice en el piso mas cercana segun su angulo de produccion, al angulo "ang", en el piso dado
                        var nearest = function(piso,verts, ang, b) {
				var delta = 2*Math.PI/verts;    //ang entre verts
				var gama = (piso%2)/2 * delta;     //ang inicial

				for(var v=0;v<verts;v++)     //por cada vert en list
					if( Math.abs((gama+delta*v) - ang) < Math.abs((gama + delta*(v+1)) - ang) )
						return v;
				return 0;
			};
	for(var piso=1, pisofinal=indices.length-1, comp=[],compold=null,vold=null; piso<pisofinal; ++piso){	//una ves por piso menos extremos

		for(var vert=0, verts=indices[piso].length; vert<verts; ++vert){    //por cada vert en piso

                        //iguales angulos al loop de construccion geometrica
                        var delta = (2*Math.PI/verts);           //ang entre verts
			var ang = (vert+ (piso%2)/2)*delta;     //ang de vert actual
			var vert_next = (vert==verts-1)?0:vert+1 ;        //indice vert siguiente en indices

                        //pedir vertice superior del triangulo, sumar medio delta, "el punto entre ambos vertices del lado inferior"
			var vact = nearest(piso+1,indices[piso+1].length, ang + delta*0.5);
			if( vact != vold ) {
                                comp.push(vert); comp.push(vact);
				vold = vact;
			}
			vact = indices[piso+1][vact];

			//Construir caras!! :3
			var faces = [];
			if(piso==1) //llenar primer piso
				faces.push( new THREE.Face3(
					indices[piso][vert],
					indices[piso][vert_next],
					indices[piso-1][nearest(piso-1,indices[piso-1].length, ang + delta*0.5)]
					));
                        //apunta hacia arriba
			faces.push( new THREE.Face3(    //cara actual
				indices[piso][vert_next],
				indices[piso][vert],
				vact
			));
                        //apunta hacia abajo
                        if(compold)
                            for(var triang = 1, trianglast = compold.length; triang < trianglast; triang +=2 ) { //por cada triangulo inferior
                                    var a = (triang==1)? compold[compold.length-1]: compold[triang-2]; //indice de vertice anterior, piso actual
                                    var b = compold[triang];
                                    var c = compold[triang-1];
                                    //txt += 'triang: a='+a+', b='+b+', c='+c+'\n';
                                    if(a < b)
                                        for(var v = a; v < b; v++)
                                            faces.push( new THREE.Face3(    //cara actual
                                                indices[piso][v],
                                                indices[piso][v+1],
                                                indices[piso-1][c]
                                            ));
                                    else {
                                        //vertices en piso
                                        var top = indices[piso].length-1;
                                        for(var v = a; v < top; v++) {
                                            faces.push( new THREE.Face3(    //cara actual
                                                indices[piso][v],
                                                indices[piso][v+1],
                                                indices[piso-1][c]
                                            ));
                                            //txt += 'triang: a='+v+', b='+(v+1)+', c='+c+'\n';
                                        }
                                        for(var v = 0; v < b; v++) {
                                            faces.push( new THREE.Face3(    //cara actual
                                                    indices[piso][v],
                                                    indices[piso][v+1],
                                                    indices[piso-1][c]
                                                ));
                                            //txt += 'triang: a='+v+', b='+(v+1)+', c='+c+'\n';
                                        }
						faces.push( new THREE.Face3(    //cara actual
													indices[piso][top],
													indices[piso][0],
													(piso%2)? indices[piso-1][0] :indices[piso-1][c]
						));
				}
			}
			//colores que tendran los vertices de los triangulos
			if(!random) {
				var color1 = new THREE.Color( (0)? 0x00ffff : 0x00aa88, 1.0);
				var color2 = new THREE.Color(0xffaa88, 1.0);
				var color3 = new THREE.Color(0xb00088, 1.0);

				for(var face=0, limit=faces.length, f=geometry.faces.length; face<limit; face++,f++) {  //por cada cara agregar colores

					geometry.faces.push(faces[face]);
					geometry.faces[f].vertexColors.push( color1 );
					geometry.faces[f].vertexColors.push( color2 );
					geometry.faces[f].vertexColors.push( color3 );
				}
			}
			else {
				for(var face=0, limit=faces.length, f=geometry.faces.length; face<limit; face++,f++) {  //por cada cara agregar colores
					geometry.faces.push(faces[face]);
					var a = Math.random()
					var r = 0.66 + a;
					r-=Math.floor(r);
					var g = 0.33 + a;
					g-=Math.floor(g);
					var b = 0.33 + a;
					b-=Math.floor(b);
					var color =  new THREE.Color(r, g, b);
					geometry.faces[f].vertexColors.push( color );
					geometry.faces[f].vertexColors.push( color );
					geometry.faces[f].vertexColors.push( color );
				}
			}
		}
		compold=comp; comp=[];
	}
	return geometry;
};

NZ.THREE.World = function() {

	this.scene = [];
	this.camera = [];
	this.light = [];

	this.material = [];
	this.geometry = [];
	this.object  = [];
};

NZ.DataAnalizer = function( soundSources ) {
	var self = this;
	this.analize = function() {};
};

NZ.AudioAnalyser = function( audioCtx ) {
	var self = this;

	this.audioCtx = audioCtx;
	this.audioNode = audioCtx.createAnalyser();
	this.audioNode.smoothingTimeConstant = 0.8;
	this.update = function() {};

	this.data = {
		raw : [],

		normalized : [],
		normalizeFrecUnit : 100,
		normalizeFrecPow : 3,

		usableLogMean : 0,
		usableLog : [] };

	this.rawUpdate = function() {
		if(this.audioNode === null) {
			this.data.raw = [];
			return;
		}
        var array = new Uint8Array(this.audioNode.frequencyBinCount);
        this.audioNode.getByteFrequencyData(array);
		this.data.raw = array;
    };

	this.normalizedUpdate = function() {
		var normalized = [];
		var raw = this.data.raw;
		var frecUnit = this.data.normalizeFrecUnit;
		var frecPow = this.data.normalizeFrecPow;
		for(var i = 0; i < this.data.usableLogMean; i++)
			  normalized.push( Math.pow( raw[i]/frecUnit, frecPow) );
		this.data.normalized = normalized;
	};

	this.usableLogUpdate = function() {
		var frecData = this.data.raw;
		var i = 0;
		for(var j = 0, length = frecData.length; j < length; j++){
			i++;
			if (frecData[j] !== 0)
				i = 0;
		}
		var r = frecData.length - i;

		var usableLog = this.data.usableLog;
		if(r !== 0)
			usableLog.push(r);
		if(usableLog.length > 40)
			usableLog.shift();

		i = 0;
		for(j = 0, length = usableLog.length; j < length; j++)
			i += usableLog[j];
		this.data.usableLogMean = i/usableLog.length;
	};

	this.update = function() {
		this.rawUpdate();
		this.usableLogUpdate();
		this.normalizedUpdate();
	};

};

NZ.DataVisualyser = function(renderer) {
	var self = this;

	this.data = null;
	this.world = null;

	this.viz = null;
	this.vizlast = null;
	this.transition = false;

	this.update = function() {};
	this.change = function() {};

	this.renderer = (renderer)? renderer : new NZ.THREE.Renderer();
	this.container = function() {};
	this.draw = function() {};

	this.change = function(viz) {

		if( this.vizlast !== null ) {
		}

		else {
			viz.data = this.data;
			viz.init();


			this.world = viz.world;
			this.domResize( this.renderer.dom );
			this.viz = viz;
		}
	};

	this.update = function() {
		if(this.viz) {
			this.viz.update();
		}
	};

	this.draw = function() {
		if(this.world === null)
			return;

		var scene = this.world.scene[0];
		var cameras = this.world.camera;

		this.renderer.renderer.autoClear = false;
		this.renderer.renderer.clear();
		for(var i = 0, length = cameras.length; i < length; i++) {
			this.renderer.renderer.render(scene, cameras[i] );
		}
		this.renderer.renderer.autoClear = this.viz.configRenderer.autoClear;
	};

	this.domResize = function( renderer ) {
		if(renderer.timeStamp)
			renderer = this;

		if(self.world === null)
			return;

		var cameras = self.world.camera;
		var length = cameras.length;
		if( length !== 0 )
			for(var i = 0; i < length; i++) {
				var camera = cameras[i];
				var style = window.getComputedStyle(renderer);

				camera.aspect = parseInt(style.width)/parseInt(style.height);
				camera.updateProjectionMatrix();
			}
	};

	this.container = function(container) {
		if(container)
			this.renderer.container(container);
		else
			container = this.renderer.container();
		this.renderer.dom.addEventListener('resize', this.domResize, false);
		return container;
	};
};

NZ.DataVisualyserVis = function() {
	var self = this;

	this.world = new NZ.THREE.World();
	this.data = [];

	this.init = function() {};
	this.update = function() {};
	this.mix = function(a, b) {};
	//representa informacion minima requerida por cada componente, como si cada componente fuera un canal de inf.
	//asi cada canal requiere un espacio dominio, y aca se especifican los dominios, cosa de normalizar los valores cuando sea necesario
	this.config = {};
	this.configRenderer = {
		autoClear : true
	};
	this.configVis = {};
	this.controls = {};

	this.sceneInit = function() {
		this.world.scene.push(new THREE.Scene());
	};
	this.sceneUpdate = function() {};
	this.cameraInit = function() {};
	this.cameraUpdate = function() {};
	this.lightInit = function() {};
	this.lightUpdate = function() {};

	this.materialInit = function() {};
	this.materialUpdate = function() {};
	this.geometryInit = function() {};
	this.geometryUpdate = function() {};
	this.objectInit = function() {};
	this.objectUpdate = function() {};

	this.vs = '';
	this.fs = '';
	this.vsUpdate = function() {};
	this.fsUpdate = function() {};

	this.init = function() {
		this.sceneInit();
		this.cameraInit();
		this.lightInit();

		this.materialInit();
		this.geometryInit();
		this.objectInit();
	};
	this.update = function() {
		this.sceneUpdate();
		this.cameraUpdate();
		this.lightUpdate();
		this.materialUpdate();
		this.geometryUpdate();
		this.objectUpdate();

		this.vsUpdate();
		this.fsUpdate();
	};

	//funde dos visualizaciones aleatoriamente
	this.mix = function(a,b) {

	};
};

NZ.MusicVisualyser = function(audioAnalyser, dataVisualyser) {
	var self = this;

	this.audioAnalyser = audioAnalyser;
	this.dataVisualyser = (dataVisualyser)? dataVisualyser: new NZ.DataVisualyser() ;
	this.controlsAdmin = null;
	this.controls = null;

	this.step = function() {};
	this.loop = function() {};
	this.stop = function() {};
	this._stepID = null;

	this.vises = NZ.MusicVises;
	this.mix = function() {};
	this.vis = function() {};

	this.update = function() {
		this.audioAnalyser.update();
		this.dataVisualyser.update();
		this.dataVisualyser.draw();
	};

	this.loop = function() {
		self.update();
		this._stepID = NZ.window.requestAnimationFrame(self.loop);
	};

	this.stop = function() {
		if(this._stepID !== null) {
			NZ.window.cancelAnimationFrame(this._stepID);
			this._stepID = null;
		}
	};

	this.dataVisualyser.data = this.audioAnalyser.data;

	this.vis = function(vis) {
		this.dataVisualyser.change(vis);
	};
};

NZ.MusicVises = {};

NZ.MusicVises.Arktype = new NZ.DataVisualyserVis();
NZ.MusicVises.Arktype.configVis = {
	pisos : 10,
	distortUnit : 0.5,
	radio : 1.5
};
NZ.MusicVises.Arktype.cameraInit = function() {
	var scene = this.world.scene[0];

	var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
	camera.position.set(0, 1, 9);
	camera.lookAt(scene.position);
	this.world.camera.push(camera);
	scene.add(camera);
};
NZ.MusicVises.Arktype.lightInit = function() {
	var scene = this.world.scene[0];

	var light = new THREE.PointLight( 0xFFFFFF );
	light.position.set(20, 20, 20);
	this.world.light.push(light);
	scene.add(light);
};
NZ.MusicVises.Arktype.materialInit = function() {
	var material = new THREE.MeshBasicMaterial(	{vertexColors:THREE.VertexColors, wireframe : false} );
	material.side = THREE.DoubleSide;
	this.world.material.push(material);

	material = new THREE.MeshBasicMaterial(	{vertexColors:THREE.VertexColors, wireframe : false} );
	material.side = THREE.DoubleSide;
	this.world.material.push(material);
};
NZ.MusicVises.Arktype.geometryInit = function() {
	var geometry = NZ.THREE.GeometrySphereUniform(1.5, this.configVis.pisos, undefined, true);
	this.world.geometry.push(geometry);

	geometry = NZ.THREE.GeometrySphereUniform(40, this.configVis.pisos, undefined, true);
	this.world.geometry.push(geometry);
};
NZ.MusicVises.Arktype.objectInit = function() {
	var scene = this.world.scene[0];

	var mesh = new THREE.Mesh( this.world.geometry[0], this.world.material[0]);
	this.world.object.push(mesh);
	scene.add(mesh);

	mesh = new THREE.Mesh( this.world.geometry[1], this.world.material[1] );
	this.world.object.push(mesh);
	scene.add(mesh);
};
NZ.MusicVises.Arktype.geometryUpdate = function() {
	if(this.data.normalized.length < 10)
		return;

	var vertices = this.world.geometry[0].vertices,
		vertices2 = this.world.geometry[1].vertices,
		step = this.data.usableLogMean/vertices.length;

	var faces1 = this.world.geometry[0].faces,
		faces2 = this.world.geometry[1].faces,
		faceStep =  this.data.usableLogMean/faces1.length;

	var radio = this.configVis.radio,
		distortUnit = this.configVis.distortUnit;

	var normalized = this.data.normalized;

	for(var i = 0, length = vertices.length, a = 0; i < length; i++) {
		a = distortUnit*this.data.normalized[Math.floor(step*i)];
		vertices[i].normalize().multiplyScalar( radio*(a+1) );
		vertices2[i].normalize().multiplyScalar( 40*(1-(a-Math.floor(a))*0.8) );
	}

	for(var face = 0, length = faces1.length, a = 0; face < length;face++) {
		a = (distortUnit*this.data.normalized[Math.floor(faceStep*face)]);
		a-= Math.floor(a);

		var r = 0;
		var g = a*0.33 -Math.floor(a+0.33);
		var b = 1.6*a;
		faces2[face].vertexColors[0].setRGB(a ,g, 1.6*a);
		faces2[face].vertexColors[1].setRGB(a ,g, 1.6*a);
		faces2[face].vertexColors[2].setRGB(a ,g, 1.6*a);
		g = a*1.33;
		b = a*1.66;

		r = a;
		g = g- Math.floor(g);
		b = b- Math.floor(b);
		faces1[face].vertexColors[0].setRGB(r, g , b);
		faces1[face].vertexColors[1].setRGB(r, g , b);
		faces1[face].vertexColors[2].setRGB(r, g , b);
	}
	this.world.geometry[0].verticesNeedUpdate = true;
	this.world.geometry[1].verticesNeedUpdate = true;
	this.world.geometry[0].colorsNeedUpdate = true;
	this.world.geometry[1].colorsNeedUpdate = true;
};
NZ.MusicVises.Arktype.objectUpdate = function() {
	var adding = 0.003;
	var mesh = this.world.object[0];
	mesh.rotation.y += adding;

	mesh = this.world.object[1];
	mesh.rotation.x = 0.0;
};

NZ.Controls = function() {
	self = this;

	this.defContenedor = document.getElementById('controles');

	this.genControls = function (data) {
		if(data.contenedor === undefined)
			data.contenedor = this.defContenedor;
		data.update = function() {
				if(data.receptor === null) return;
				for(var i = 0, length = data.controles.length; i < length; i++){
					if(data.receptor[data.controles[i].varName] !== undefined)
						data.controles[i].divValor.textContent = data.receptor[data.controles[i].varName];
				}
			};
		data.conmutador = function(e) {
			var clase = e.toElement.className.split(' ');

			if(data.receptor[clase[1]] === undefined) return;

			var controlid = clase[2].split('-')[1];

			if (clase[0] == 'a1')
				data.receptor[clase[1]] -= data.controles[controlid].step;
			else
				data.receptor[clase[1]] += data.controles[controlid].step;

			data.update();

			if( data.receptor[data.controles[controlid].f] !== undefined)
				data.receptor[data.controles[controlid].f]();
		};
		var controles = data.controles;
		for(var i = 0; i < controles.length; i ++) {
			var control = controles[i];

			var division = document.createElement('div');
			division.className = 'control main';

			var nombre = document.createElement('p');
			nombre.className = 'name';
			nombre.textContent = control.varName+': ';

			var descripcion = document.createElement('p');
			descripcion.textContent = '"'+control.comentario+'"';

			var divConmutador = document.createElement('div');
			divConmutador.className = 'conmutador';

			var conmutador1 =  document.createElement('div');
			conmutador1.className = 'a1 '+control.varName+' control-'+i;
			var conmutador2 =  document.createElement('div');
			conmutador2.className = 'a2 '+control.varName+' control-'+i;

			var valor =  document.createElement('p');
			valor.className = 'conmutador-valor';

			data.contenedor.appendChild(division);
				division.appendChild(nombre);
				division.appendChild(descripcion);
				division.appendChild(divConmutador);

					divConmutador.appendChild(conmutador1);
					divConmutador.appendChild(valor);
					divConmutador.appendChild(conmutador2);

			controles[i].div = division;
			controles[i].divValor = valor;

			division.addEventListener('mouseover', data.update, false);
			conmutador1.addEventListener('click', data.conmutador );
			conmutador2.addEventListener('click', data.conmutador );
		}
	};

	$(document).keyup(function(evt) {
		switch(evt.keyCode){
			case 80: //p
				break;
			case 84: //t
				break;
			case 76: //l
				break;
			default:
				break;
		}
	});
};

NZ.AudioSourceMic = function(audioCtx) {
	var self = this;

	this.audioCtx = audioCtx;
	this.audioTag = document.createElement('audio');
	this.audioSource = null;
	this.mediaStream = null;
	this.info = function() {};
	this.infoCall = function() {};
	this.infoLabel = null;

	this.play = function(onConnectedCallback) {};
	this.askingUserMedia = false;
	this.connectStream = function(mediaStream) {};
	this.stop = function() {};

	this.audioSourceReady = function() {};
	this.onAudioSourceReady = function() {};

	this.play = function() {
		if(!this.mediaStream && !this.askingUserMedia) {
			NZ.navigator.getUserMedia( {audio:true}, this.connectStream , function() {self.askingUserMedia = false;});
			this.info('Esperando que el usuario acepte el pedido del microfono');
			this.askingUserMedia = true;
		}
	};
	this.connectStream = function(mediaStream) {
		self.askingUserMedia = true;
		self.info('Conectando flujo de audio');
		self.mediaStream = mediaStream;
		self.audioSource = self.audioCtx.createMediaStreamSource(mediaStream);
		self.onAudioSourceReady();
		self.info('Conectado');
	};
	this.stop = function() {

	};
	this.audioSourceReady = function() {
		if(this.audioSource)
			return true;
		return false;
	};

	this.info = function(text) {
		if(self.infoLabel)
			self.infoLabel.innerHTML = text;
		if(NZ.debugging)
			console.log(self,text);
		self.infoCall(text);
	};
};

NZ.AudioSourceTag = function(audioCtx) {
	var self = this;

	this.audioCtx = audioCtx
	this.audioTag = new Audio()
	this.audioTag.crossOrigin = 'anonymous'
	this.audioSource = self.audioCtx.createMediaElementSource(self.audioTag);
	this.info = function() {};
	this.infoCall = function() {};
	this.infoLabel = null;
	this.onerror = function(e) {};

	this.play = function() {};
	this.playCall = function() {};

	this.audioTag.setAttribute('controls','controls');

    this.stream = function(streamURL){
		this.info('Iniciando stream');
		if(this.audioTag.src != streamURL) {
        	this.audioTag.src = streamURL;
        	this.play();
		}
		else
			this.info('Reproduciendo');
    };
    this.play = function() {
		if(self.audioTag.readyState > 2) {
			self.info('Cargado, reproduciendo');
			self.audioTag.play();
			self.playCall();
		}
		else if(self.audioTag.error) {
			self.info('Error: '+NZ.HTML5.Media.error(self.audioTag.error));
		}
		else {
			setTimeout(self.play,1000);
			self.info('Cargando: '+NZ.HTML5.Media.readyState(self.audioTag.readyState) );
		}
    };

	this.onerror = function(e) {
		self.info('Error: '+NZ.HTML5.Media.error(e.target.error));
	};
	this.audioTag.addEventListener('error', this.onerror, false);

	this.info = function(text) {
		if(self.infoLabel)
			self.infoLabel.innerHTML = text;
		if(NZ.debugging)
			console.log(self,text);
		self.infoCall(text);
	};
};

NZ.AudioSourceSCApp = function(audioCtx) {

	var self = this;
	this.sourceTag = new NZ.AudioSourceTag( audioCtx );
	this.client_id = NZ.SC.client_id;
	this.streamURL = "";
	this.errors = null;
	this.soundObj = null;
	this.ui = null;
	this.info = function() {};
	this.infoCall = function() {};
	this.infoLabel = null;
	this.audioSource = this.sourceTag.audioSource;

	this.play = function() {};
	this.playCall = function() {};
	this.loadUrl = function() {};
	this.loadUrlCallSuc = function() {};
	this.loadUrlCallErr = function() {};

	this.loadUrl = function(url) {
		this.sourceTag.infoCall = function() {};
		this.info('Obteniendo informacion de la pista');
		SC.get('/resolve', { url: url}, function(soundObj) {
			if(soundObj.errors) {
				self.errors = soundObj.errors;
				self.info('Error al cargar url');
				console.log(soundObj.errors);
				self.loadUrlCallErr();
			}
			else {
				self.soundObj = soundObj;
				self.streamURL = soundObj.stream_url + '?client_id=' + self.client_id;
				self.info('Url cargada');
				self.loadUrlCallSuc();
			}
		} );
	};
	this.loadUrlCallSuc = function() { self.play(); };
	this.play = function() {
		if(self.streamURL) {
			self.info('Reproduciendo');
			self.sourceTag.infoCall = self.info;
			self.sourceTag.stream(self.streamURL);
		}
		else
			self.info('Esperando URL');
	};

	this.info = function(text) {
		if(self.infoLabel)
			self.infoLabel.innerHTML = text;
		if(NZ.debugging)
			console.log(self,text);
		self.infoCall(text);
	};
};

NZ.AudioSourceFile = function(audioCtx) {
	var self = this;

	this.audioCtx = audioCtx;
	this.audioSource = null;
	this.audioBuffer = null;
	this.file = null;
	this.fileName = null;
	this.fileReader = null;
	this.audioSourceReady = function(){};
	this.onAudioSourceReady = function(){};

	this._fileInput = null;
	this.fileInput = function() {};
	this._dropContainer = null;
	this.dropContainer = function() {};

	this.decodificar = function() {};
	this.play = function() {};
	this.playCall = function() {};
	this.playing = false;

	this.cargarCall = function() {};

	this.info = function() {};
	this.infoCall = function() {};
	this.infoLabel = null;

	var audioSource = this.audioCtx.createBufferSource();
	if(!audioSource.start)	{
		audioSource.start = audioSource.noteOn;
		audioSource.stop = audioSource.noteOff;
	}
	audioSource.onended = function() {
		this.playing = false;
		self.playCall();
	};
	this.audioSource = audioSource;

	this.fileInput = function(fileInput) {
		if(fileInput)	{
			this._fileInput = fileInput;

			fileInput.addEventListener('change', function(e) {
				if (e.target.files.length !== 0) {

					self.file = e.target.files[0];
					self.fileName = self.file.name;
					if (self.playing)	self.stop();
					self.info('Subiendo archivo');
					self.decodificar();

				}
			}, false);

		}
		return this._fileInput;
	};

	this.dropContainer = function(dropContainer) {
		if(dropContainer)	{
			this._dropContainer = dropContainer;

			dropContainer.addEventListener("dragenter", function() {
				self.info('Suelta el mouse!:P');
			}, false);
			dropContainer.addEventListener("dragover", function(e) {
				e.stopPropagation();	e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
			}, false);
			dropContainer.addEventListener("dragleave", function() {
				self.info('');
			}, false);
			dropContainer.addEventListener("drop", function(e) {
				e.stopPropagation();
				e.preventDefault();
				self._fileInput.files = e.dataTransfer.files;
			}, false);

		}

		return this._dropContainer;
	};

	this.decodificar = function() {
		if(!this.fileReader)
			this.fileReader = new FileReader();

		var fileReader = this.fileReader;
		fileReader.onload = function(e) {
			if (self.audioCtx === null) return;
			self.info('Decodificando el audio: '+self.fileName);

			self.audioCtx.decodeAudioData(e.target.result, function(buffer) {
				self.info('Decodificacion exitosa, iniciando visualizador :3');
				self.audioBuffer = buffer;
				self.onAudioSourceReady();
			}, function(e) {
				self.info('Fallo al decodificar el archivo !!! :C');
				console.log(e);
			});
		};
		fileReader.onerror = function(e) {
			self.info('Fallo al leer el archivo !! ~(o,,,o)~');
			console.log(e);
		};

		//enviar archivo al lector
		this.info('Empezando a leer el archivo');
		fileReader.readAsArrayBuffer(this.file);
	};

	this.play = function() {
		if(!this.audioBuffer)
			return;

		if(this.playing)
			this.audioSource.stop(0);
		this.playing = true;
		this.audioSource.buffer = this.audioBuffer;
		this.audioSource.start(0);

		this.info('Reproduciendo: '+this.fileName);
	};
	this.audioSourceReady = function() {
		if(this.audioSource)
			return true;
		return false;
	};

	this.info = function(text) {
		if(self.infoLabel)
			self.infoLabel.innerHTML = text;
		if(NZ.debugging)
			console.log(self,text);
		self.infoCall(text);
	};
};

NZ.AudioSources = function() {
	var self = this;

	this.audioCtx = NZ.window.AudioContext();
	this.volume = new NZ.AudioVolume( this.audioCtx );
	this.audioNode = this.volume.audioNode;
	this.audioSource = null;
	this.audioSourceConnect = function() {};

	this._sourceFile = null;
	this.sourceFile = function() {};
	this._sourceSoundcloud = null;
	this.sourceSoundcloud = function() {};
	this._sourceMicrophone = null;
	this.sourceMicrophone = function() {};

	this.playCall = function() {};
	this.info = function() {};

	this.playing = function() {};
	this.autoPlay = true;
	this.autoStop = false;

	this.sourceFile = function() {
		if(!self._sourceFile)
			this._sourceFile = new NZ.AudioSourceFile(this.audioCtx);

		return this._sourceFile;
	};

	this.sourceSoundcloud = function() {
		if( !this._sourceSoundcloud && NZ.SC.initialized() )
			this._sourceSoundcloud = new NZ.AudioSourceSCApp( this.audioCtx );

		return this._sourceSoundcloud;
	};

	this.sourceMicrophone = function() {
		if( !this._sourceMicrophone )
			this._sourceMicrophone = new NZ.AudioSourceMic(this.audioCtx);

		return this._sourceMicrophone;
	};
	//se desconecta de la fuente actual, y se contecta-configura a la nueva, en caso que esta no pueda aun
	//le agrega un callback para cuando pueda
	this.audioSourceConnect = function(audioSource) {
		//desconectar
		if(this.audioSource) {

			if(this.audioSource.infoCall !== undefined)
				this.audioSource.infoCall = function() {};

			if(this.audioSource.playCall !== undefined)
				this.audioSource.playCall = function() {};

			if(this.audioSource.audioSourceReady)
				this.audioSource.onAudioSourceReady = function() {};

			if(this.audioSource.pause)
				this.audioSource.pause();
			else if(this.audioSource.stop && this.autoStop)
				this.audioSource.stop();
			if(this.audioSource.audioSource)
				NZ.window.audioContext.audioNode.disconnect(this.audioSource.audioSource);
		}

		if(audioSource === undefined)
			return;
		this.audioSource = audioSource;
		//conectar
		if(audioSource.infoCall !== undefined)
			audioSource.infoCall = self.info;
		if(audioSource.playCall !== undefined)
			audioSource.playCall = this.playCall;

		if(audioSource.audioSourceReady) {
			audioSource.onAudioSourceReady = function() {
				this.audioSource.connect(self.audioNode);
				if(this.play && self.autoPlay)
					this.play();
			};
		}
		if(audioSource.audioSource)
			audioSource.audioSource.connect(this.audioNode);

		if(audioSource.play && this.autoPlay)
			audioSource.play();
	};
};

NZ.AudioVolume = function(audioCtx) {
	var self = this;

	this.audioCtx = audioCtx;
	this.audioCtx.createGain = this.audioCtx.createGainNode || this.audioCtx.createGain;
	this.audioNode = this.audioCtx.createGain();

	this._volume = 1.0;
	this._mute = false;
	this.volume = function(volume) {};
	this.mute = function(mute) {};
	this.update = function() {};

	this.volume = function(volume) {
		if(volume !== undefined)
			this._volume = volume;
		this.update();
		return this._volume;
	};
	this.mute = function(mute) {
		if(mute !== undefined)
			this._mute = mute;
		this.update();
		return this._mute;
	};
	this.update = function() {
		if(this._mute) {
			this.audioNode.gain.value = 0.0;
		}
		else
			this.audioNode.gain.value = this._volume;
	};
};
//////////////////////////////////////////////Aplicacion
NZ.Arquetipo = function() {
	var self = this;

	this.UI = function(args) {
		var self = this;

		this._root = args.root;
		this._dom = null;
		this.domText = '';
		this.dom = function(type) {};
		this.container = function(container) {};
		this.addEventListeners = function() {};

		this.ui = null;
		this.panels = {
			controller : null,
			main : null,
			playing : null,
			sources : null,
		};
		this.toggles = {
			ui : null,
			mute : null,
			fullscreen : null,
			panel_main : null,
			panel_sources : null
		};
		this.toggles_sources = {
			soundcloud : null,
			microphone : null,
			file : null,
		};
		this.sources = {
			soundcloud : null,
			microphone : null,
			file : null,
			hide : function() {}
		};
		this.sources_infos = {
			soundcloud : null,
			microphone : null,
			file : null
		};
		this.objects = {
			visualyser : null
		};
		this.info = function() {};
		this.infoLabel = null;


		this.stateStart = function() {};
		this.stateNormal = function() {};

		//uso interno en construccion de interfaze propia
		this.domText = "\
			<div class='visualyser'> </div> \
			<div class='ui' > \
				<div class='panel panel-main' data-visual-state='start' > \
					<div class='toggle toggle-panel-main'> </div> \
					<div class='app-cover'> \
						<h1 class='app-title'>Arquetipo<p>(Beta 0.35)</p> </h1> \
						<div class='info info-app' >Pausado</div> \
						<div class='firma'> \
							<p class='nombre'> Nicol&aacute;s Narv&aacute;ez </p> \
							<p class='e-mail'> edge731@gmail.com </p> \
						</div> \
					</div> \
					<div class='app-controls'> \
						<div class='toggle toggle-app-controls-right'> </div> \
						<h1>Controles</h1> \
					</div> \
				</div> \
				<div class='panel panel-playing' data-visual-state='start'> \
					<div class='playing-cover'> </div> \
					<div class='playing-controller'> \
						<div class='player player-global'> </div> \
						<div class='player-microphone'> </div> \
					</div> \
				</div> \
				<div class='panel panel-sources' data-visual-state='start'> \
					<div class='toggle toggle-panel-sources'> </div> \
					<div class='navigator navigator-sources'> \
						<div class='navigator-selector toggle-sources-soundcloud'> Soundcloud </div> \
						<div class='navigator-selector toggle-sources-microphone'> Microfono </div> \
						<div class='navigator-selector toggle-sources-file'> Archivo </div> \
					</div> \
					<div class='navigator-tabs sources'> \
						<div class='navigator-tab sources-soundcloud'> \
							<div class='info info-warning'> \
								"+((navigator.userAgent.match(/android/i))?'El formato de compresion de soundcloud no es usable aun por los exploradores de dispositivos moviles':'')+" \
							</div> \
							<div class='player player-soundcloud'> </div> \
							<div class='soundcloud-url'> \
								<div class='soundcloud-url-text'> <p> URL de Soundcloud: </p> <input class='soundcloud-url-input' type='text' /> </div> \
								<div class='soundcloud-url-load' > <p class='noselect'>Cargar</p> </div> \
							 </div> \
							<div class='info info-sources-soundcloud'> </div> \
						</div> \
						<div class='navigator-tab sources-microphone'> \
							<div class='info info-warning'>Una vez activado el microfono, el audio se desactiva para evitar bucles, puedes activarlo con el boton del panel superior 'Activar audio'</div> \
							<div class='toggle toggle-sources-microphone'> </div>' \
							<div class='info info-sources-microphone'></div> \
						</div> \
						<div class='navigator-tab sources-file'> \
							<label for='uploadedFile'>Arrastra y suelta un archivo a reproducir, o ingresa uno desde aqu&iacute; <br/></label> \
							<input type='file' class='uploadedFile'> \
							<div class='info info-sources-file'></div> \
						</div> \
					</div> \
				</div> \
			</div> \
			<div class='panel panel-controller' data-visual-state='start'> \
				<div class='toggle ui-circle toggle-ui'>Ocultar interfaze</div> \
				<div class='toggle ui-circle toggle-fullscreen'>Pantalla completa (f11)</div> \
				<div class='toggle ui-circle toggle-mute'>Silenciar audio</div> \
			</div> \
		";

		this.dom = function(type) {
			if(type === undefined)
				return this._dom;

			this._dom = document.createElement('div');
			var container = this._dom;
			container.className = 'arktype-app-wrapper '+type;
			container.innerHTML = this.domText;

			this.ui = container.getElementsByClassName('ui')[0];
			this.panels.controller = container.getElementsByClassName('panel-controller')[0];
			this.panels.main = container.getElementsByClassName('panel-main')[0];
			this.panels.playing = container.getElementsByClassName('panel-playing')[0];
			this.panels.sources = container.getElementsByClassName('panel-sources')[0];

			this.toggles.ui = container.getElementsByClassName('toggle-ui')[0];
			this.toggles.mute = container.getElementsByClassName('toggle-mute')[0];
			this.toggles.fullscreen = container.getElementsByClassName('toggle-fullscreen')[0];
			this.toggles.panel_main = container.getElementsByClassName('toggle-panel-main')[0];
			this.toggles.panel_sources = container.getElementsByClassName('toggle-panel-sources')[0];
			this.toggles.microphone = container.getElementsByClassName('toggle-sources-microphone')[0];

			this.sources.soundcloud = container.getElementsByClassName('sources-soundcloud')[0];
			this.sources.microphone = container.getElementsByClassName('sources-microphone')[0];
			this.sources.file = container.getElementsByClassName('sources-file')[0];

			this.toggles_sources.soundcloud = container.getElementsByClassName('toggle-sources-soundcloud')[0];
			this.toggles_sources.microphone = container.getElementsByClassName('toggle-sources-microphone')[0];
			this.toggles_sources.file = container.getElementsByClassName('toggle-sources-file')[0];

			this.sources_infos.soundcloud = container.getElementsByClassName('info-sources-soundcloud')[0];
			this.sources_infos.microphone = container.getElementsByClassName('info-sources-microphone')[0];
			this.sources_infos.file = container.getElementsByClassName('info-sources-file')[0];
			console.log(this.sources_infos);

			this.objects.visualyser = container.getElementsByClassName('visualyser')[0];

			this.infoLabel = container.getElementsByClassName('info-app')[0];

			var sourceFile = this._root.audioSources.sourceFile();
			sourceFile.fileInput(this.sources.file.getElementsByTagName('input')[0]);
			sourceFile.dropContainer(this.sources.file);

			this._root.audioSources.sourceFile().infoLabel = this.sources_infos.file;
			this._root.audioSources.sourceMicrophone().infoLabel = this.sources_infos.microphone;
			this._root.audioSources.sourceSoundcloud().infoLabel = this.sources_infos.soundcloud;

			this.sources.soundcloud.getElementsByClassName('player-soundcloud')[0].appendChild(this._root.audioSources.sourceSoundcloud().sourceTag.audioTag);

			this.sources.hide = function() {
				for(var source in this )
					if( this.hasOwnProperty(source) ) {
					source = this[source];
					if(!!source.setAttribute)
						source.setAttribute('data-visual-state','stored');
				}
			};
			this.toggles_sources.deselect = function() {
				for(var source in this )
					if( this.hasOwnProperty(source) ) {
					source = this[source];
					if(!!source.setAttribute)
						source.setAttribute('data-selected','false');
				}
			};
			return this._dom;
		};

		this.addEventListeners = function() {
			if(!this._dom) return;

			this._root.audioSources.info = this.info;

			this._root.musicVisualyser.dataVisualyser.container( this.objects.visualyser );
			window.addEventListener('resize', function(){
				self.objects.visualyser.dispatchEvent(new Event('resize'));
			}, false);
			this.objects.visualyser.dispatchEvent(new Event('resize'));

			this.toggles.panel_main.addEventListener('click',function(e) {
				var toggled = e.target.getAttribute('data-toggled') == 'true';

				var controls = self.panels.main.getElementsByClassName('app-controls')[0];
				var cover = self.panels.main.getElementsByClassName('app-cover')[0];

				if(toggled) {
					controls.setAttribute('data-visual-state','stored');
					cover.setAttribute('data-visual-state','normal');
				}
				else {
					controls.setAttribute('data-visual-state','normal');
					cover.setAttribute('data-visual-state','stored');
				}

				e.target.setAttribute('data-toggled', !toggled);
			}, false);
			this.toggles.ui.addEventListener('click',function(e) {
				var toggled = e.target.getAttribute('data-toggled') == 'true';
				if(toggled) {
					self.ui.classList.remove('hidden');
					self.panels.controller.classList.remove('hidden');
					self.toggles.ui.innerHTML = 'Ocultar interfaze';
				}
				else {
					self.ui.classList.add('hidden');
					self.panels.controller.classList.add('hidden');
					self.toggles.ui.innerHTML = 'Mostrar interfaze';
				}
				e.target.setAttribute('data-toggled', !toggled);
			}, false);
			this.toggles.mute.addEventListener('click',function(e) {
				var toggled = e.target.getAttribute('data-toggled') == 'true';
				if(toggled) {
					self._root.volume.mute(false);
					self.toggles.mute.innerHTML = 'Silenciar audio';
				}
				else {
					self._root.volume.mute(true);
					self.toggles.mute.innerHTML = 'Activar audio';
				}

				e.target.setAttribute('data-toggled', !toggled);
			}, false);
			this.toggles.fullscreen.addEventListener('click',function(e) {
				var toggled = e.target.getAttribute('data-toggled') == 'true';
				if(toggled) {
					NZ.document.exitFullscreen();
					self.toggles.fullscreen.innerHTML = 'Pantalla completa';
				}
				else {
					NZ.document.requestFullScreen(self._dom);
					self.toggles.fullscreen.innerHTML = 'Minimizar pantalla';
				}
				e.target.setAttribute('data-toggled', !toggled);
			}, false);
			this.toggles.panel_sources.addEventListener('click',function(e) {
				var toggled = e.target.getAttribute('data-toggled') == 'true';
				if(toggled) {
					self.panels.sources.setAttribute('data-visual-state','start');
				}
				else {
					self.panels.sources.setAttribute('data-visual-state','stored');
				}
				e.target.setAttribute('data-toggled', !toggled);
			}, false);

			//por cada toggle
			for(var toggle in this.toggles_sources) {
				if( this.toggles_sources.hasOwnProperty(toggle) )
					if(this.toggles_sources[toggle].addEventListener){

						//configurar toggle, agregar source objetivo
						var name = toggle;
						name = name[0].toUpperCase()+name.slice(1);
						toggle = this.toggles_sources[toggle];
						toggle.setAttribute('data-toggle-target',name);

						//agregar eventListener
						toggle.addEventListener('click', function(e) {
							var name = e.target.getAttribute('data-toggle-target');

							//conectar audioSource
							if(!self._root.volume.mute() && e.target == self.toggles_sources.microphone)
								self.toggles.mute.dispatchEvent(new Event('click'));
							self._root.audioSources.audioSourceConnect(self._root.audioSources['source'+name]());

							//actualizar interfaz
							self.sources.hide();
							self.toggles_sources.deselect();
							self.toggles_sources[name.toLowerCase()].setAttribute('data-selected','true');
							self.sources[name.toLowerCase()].setAttribute('data-visual-state','normal');

						}, false);
					}
			}

			this._dom.getElementsByClassName('soundcloud-url-load')[0].addEventListener('click', function(e) {
				var text = self.sources.soundcloud.getElementsByClassName('soundcloud-url')[0].getElementsByTagName('input')[0].value;
				if(text !== '' && text) {
					self._root.audioSources.sourceSoundcloud().loadUrl(text);
				}
			}, false);


		};

		this.stateStart = function() {
			self.panels.main.getElementsByClassName('app-controls')[0].setAttribute('data-visual-state','stored');
			self.panels.main.getElementsByClassName('app-cover')[0].setAttribute('data-visual-state','normal');

			for( var panel in self.panels )
				if( self.panels.hasOwnProperty(panel) ) {
				panel = self.panels[panel];
				if(!!panel.setAttribute)
					panel.setAttribute('data-visual-state','start');
				}
		};
		this.stateNormal = function() {
			for(var panel in self.panels )
				if( self.panels.hasOwnProperty(panel) ) {
				panel = self.panels[panel];
				if(!!panel.setAttribute)
					panel.setAttribute('data-visual-state','normal');
				}
			self.toggles.panel_sources.dispatchEvent(new Event('click'));
			self.toggles_sources.soundcloud.dispatchEvent(new Event('click'));
		};

		this.container = function(container) {
			if(container) {
				container.appendChild(this._dom);
				this.addEventListeners();
			}
			return this._dom.parentNode;
		};

		this.info = function(msg) {
			if(self.infoLabel)
				self.infoLabel.innerHTML = msg;
		};

		this.dom(args.type);
		if(args.container)
			this.container(args.container);

		this.stateStart();

	};

	this.init = function(args) {

		if(!NZ.WEBGL.available){
			var help = '';
			if(navigator.vendor.match(/google/i) && navigator.userAgent.match(/android/i))
				help = 'Parece ser que estas utilizando chrome movil, es probable que webgl se haya desactivado debido a que tu targeta no soporta una caracteristica especifica (puedes comprobarlo escribiendo chrome://gpu en la barra de busqueda y revisar si esta el mensage "WebGL is disabled on Android unless GPU reset notification is supported" en la seccion "Problems Detected"), en tal caso prueba a habilitar el flag "Ignorar la lista de renderizacion por software" en chrome://flags, pero es bajo tu propio riesgo ;).';
			alert('Error, webgl no pudo iniciarse, por lo que en caso de ejecutarse la aplicacion lo hara en un rendimiento deplorable, arregla webgl en tu explorador o dispositivo, los exploradores recomendados son chrome y opera.'+'\n\n'+help);
		}
		console.log( (NZ.WEBGL.available)? "webgl!":"canvas :s" );
		if(!NZ.window.audioContextAvailable()) {
			console.log('Explorador no soporta AudioContext!');
			alert('Tu explorador no soporta AudioContext!, utiliza uno que lo soprte, mas info aqui: http://caniuse.com/#feat=audio-api');
			this.info('Tu explorador no soporta AudioContext! \n Usa uno mas actualizado',false);
		}

		this.controls = new NZ.Controls();

		this.audioSources = new NZ.AudioSources();
		this.audioCtx = this.audioSources.audioCtx;

		this.audioAnalyser = new NZ.AudioAnalyser( this.audioCtx );
		this.volume = new NZ.AudioVolume( this.audioCtx );
		this.audioNode = this.volume.audioNode;

		this.audioSources.audioNode.connect(this.audioAnalyser.audioNode);
		this.audioAnalyser.audioNode.connect( this.audioNode );
		this.audioNode.connect(this.audioCtx.destination);

		this.musicVisualyser = new NZ.MusicVisualyser( this.audioAnalyser );
		this.musicVisualyser.vis( NZ.MusicVises.Arktype );
		this.musicVisualyser.loop();

		if(NZ.SC.available()) {
			if(!NZ.SC.initialized())
				NZ.SC.initialize( {client_id: 'dbcd126ea4efaf59359ab64f529e7de1' }  );
		}

		this.ui = new this.UI( { root : this, type : args.ui_type, container:args.container} );

		if(NZ.SC.initialized()) {
			this.ui.dom().getElementsByClassName('soundcloud-url-input')[0].value = "https://soundcloud.com/form-music/form-pod-023-aert-prog";
			if(!NZ.debugging)
				this.ui.dom().getElementsByClassName('soundcloud-url-load')[0].dispatchEvent(new Event('click'));
		}
		setTimeout(function() {self.ui.stateNormal();},1000);
    };
};
