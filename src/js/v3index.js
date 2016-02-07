/* global File:false, JSON:false */
(function(){

/* variables */
var v3index = {
	typelist : [],
	current  : '',
	doclang  : pzpr.lang,
	complete : false,
	testdoc  : false,
	captions : [],
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var self = v3index;
var typelist = self.typelist;

self.doclang = JSON.parse(localStorage['pzprv3_config:ui']||'{}').language || pzpr.lang;

if(location.search==='?en'||location.search==='?ja'){
	self.doclang = location.search.substr(1,2);
}
if(location.href.match(/\/tests\/index/)){
	self.doclang = 'ja';
	self.testdoc = true;
}

function getEL(id){ return _doc.getElementById(id);}
function customAttr(el, name){
	var value = "";
	if(el.dataset!==void 0){ value = el.dataset[name];}
	/* IE10, Firefox5, Chrome7, Safari5.1以下のフォールバック */
	else{
		var lowername = "data-";
		for(var i=0;i<name.length;i++){
			var ch = name[i] || name.charAt(i);
			lowername += ((ch>="A" && ch<="Z") ? ("-" + ch.toLowerCase()) : ch);
		}
		value = el[lowername] || el.getAttribute(lowername) || "";
	}
	return value;
}

v3index.extend({
	/* onload function */
	onload_func : function(){
		if(!window.pzprfaq && !self.input_init()){
			var el = getEL("puzmenu_input");
			if(!!el){
				el.parentNode.removeChild(el);
				getEL("table_input").style.display = 'none';
			}
		}

		Array.prototype.slice.call(_doc.querySelectorAll('#puztypes > li')).forEach(function(el){
			if((el.id||'').match(/puzmenu_(.+)$/)){
				var typename = RegExp.$1;
				typelist.push(typename);
				el.addEventListener("click",(function(typename){ return function(e){self.click_tab(typename);};})(typename),false);
				if(el.className==="puzmenusel"){ self.current = typename;}
			}
		});
		Array.prototype.slice.call(_doc.querySelectorAll('#statefilter input')).forEach(function(el){
			if((el.id||'').match(/filter_(.+)$/)){
				el.addEventListener("change",self.click_filter,false);
			}
		});
		if(!self.current && typelist.length>0){ self.current = typelist[0];}
		if(!!getEL('puztypes')){ getEL('puztypes').style.display = "block";}
		self.setRecentPuzzle();

		self.setTranslation();

		self.disp();
	},
	input_init : function(){
		var cnt=0;
		if(self.urlif.init()) { cnt++;}
		if(self.fileif.init()){ cnt++;}
		if(self.dbif.init())  { cnt++;}

		return (cnt>0);
	},

	reset_func : function(){
		typelist = [];
		self.current  = '';
		self.onload_func();
	},

	/* tab-click function */
	click_tab : function(typename){
		self.current = typename;
		self.disp();
		if(self.current==="input"){ self.dbif.display();} /* iPhone用 */
	},

	/* filter-click function */
	click_filter : function(){
		var state = {}, alldisp = getEL('filter_all').checked;
		['lunch','nigun','omopa','extra'].forEach(function(id){ state[id] = getEL('filter_'+id).checked;});
		Array.prototype.slice.call(_doc.querySelectorAll('.lists ul > li')).forEach(function(el){
			var pid = pzpr.variety.toPID(customAttr(el, 'pid'));
			if(!!pid && self.variety[pid]){
				el.style.display = (alldisp||state[self.variety[pid].tab] ? '' : 'none');
			}
		});
		Array.prototype.slice.call(_doc.querySelectorAll('.lists ul')).forEach(function(el){
			var count = 0;
			Array.prototype.slice.call(el.querySelectorAll('li')).forEach(function(el){
				if(el.style.display!=='none'){ count++;}
			});
			el.parentNode.style.display = (count>0 ? '' : 'none');
		});
	},

	/* display tabs and tables function */
	disp : function(){
		for(var i=0;i<typelist.length;i++){
			var el = getEL("puzmenu_"+typelist[i]);
			var table = getEL("table_"+typelist[i]);
			if(typelist[i]===self.current){
				el.className = "puzmenusel";
				table.style.display = 'block';
			}
			else{
				el.className = "puzmenu";
				table.style.display = 'none';
			}
		}
		self.translate();
	},

	setRecentPuzzle : function(){
		var listparent;
		function addPuzzle(pid){
			var el = _doc.createElement('li');
			el.innerHTML = '<a href="p.html?'+pid+'"></a>';
			listparent.appendChild(el);
			self.captions.push({anode:el.firstChild, str_jp:pzpr.variety.info[pid].ja, str_en:pzpr.variety.info[pid].en});
		}

		listparent = getEL('recentpuzzle');
		if(!listparent){ return;}
		listparent.innerHTML = '';
		(JSON.parse(localStorage['pzprv3_index:ranking']).recent || []).forEach(addPuzzle);

		listparent = getEL('frequentpuzzle');
		listparent.innerHTML = '';
		var count = JSON.parse(localStorage['pzprv3_index:ranking']).count || {}, counts = [];
		for(var i in count){ counts.push({pid:i, count:count[i]});}
		counts.sort(function(a,b){ return b.count-a.count;}).slice(0,10).forEach(function(item){ addPuzzle(item.pid);});
	},

	setlang : function(lang){
		self.doclang = lang;
		self.disp();
		var setting = JSON.parse(localStorage['pzprv3_config:ui']);
		setting.language = lang;
		localStorage['pzprv3_config:ui'] = JSON.stringify(setting);
	},
	setTranslation : function(){
		Array.prototype.slice.call(_doc.querySelectorAll('.lists li')).forEach(function(el){
			var pid = pzpr.variety.toPID(customAttr(el, 'pid'));
			if(!pid){ return;}
			if(el.childNodes.length===0){
				el.className = self.variety[pid].state;
				el.innerHTML = '<a href="p.html?'+pid+(!self.testdoc?'':'_test')+'"></a>';
			}
			self.captions.push({anode:el.firstChild, str_jp:pzpr.variety.info[pid].ja, str_en:pzpr.variety.info[pid].en});
		});
	},
	translate : function(){
		/* キャプションの設定 */
		for(var i=0;i<this.captions.length;i++){
			var obj = this.captions[i];
			if(!!obj.anode){
				var text = (self.doclang==="ja" ? obj.str_jp : obj.str_en);
				obj.anode.innerHTML = text.replace(/(\(.+\))/g, "<small>$1</small>");
			}
		}
		Array.prototype.slice.call(_doc.body.querySelectorAll('[lang="ja"]')).forEach(function(el){
			el.style.display = (self.doclang==='ja' ? '' : 'none');
		});
		Array.prototype.slice.call(_doc.body.querySelectorAll('[lang="en"]')).forEach(function(el){
			el.style.display = (self.doclang==='en' ? '' : 'none');
		});
	}
});

/* addEventListener */
window.addEventListener('load', self.onload_func, false);

/* extern */
window.v3index = v3index;

})();

/*********************/
/* URLInput function */
/*********************/
(function(){

var v3index = window.v3index;

v3index.urlif = {
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var _form;
var self = v3index.urlif;

function getEL(id){ return _doc.getElementById(id);}

v3index.urlif.extend({
	init : function(){
		_form = _doc.urlinput;
		if(!!_form){
			getEL("urlinput_btn").addEventListener("click", self.urlinput, false);
			return true;
		}
	},
	urlinput : function(e){
		var url = getEL("urlinput_text").value;
		if(!!url){
			localStorage['pzprv3_urldata'] = url;
			window.open('./p.html', '');
		}
	}
});

})();

/*********************/
/* FileRead function */
/*********************/
(function(){

var v3index = window.v3index;

v3index.fileif = {
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var _form;
var self = v3index.fileif;

v3index.fileif.extend({
	init : function(){
		_form = _doc.fileform;
		if(!!_form){
			_form.filebox.addEventListener("change", self.fileinput, false);
			return true;
		}
	},

	fileinput : function(e){
		var fileEL = _doc.fileform.filebox;
		if(typeof FileReader !== 'undefined'){
			var reader = new FileReader();
			reader.onload = function(e){
				self.fileonload.call(self, e.target.result);
			};
			reader.readAsText(fileEL.files[0]);
		}
		else if(typeof FileList !== 'undefined' &&
			    typeof File.prototype.getAsText !== 'undefined')
		{
			if(!fileEL.files[0]){ return;}
			this.fileonload(fileEL.files[0].getAsText(''));
		}
		else{
			if(!fileEL.value){ return;}
			_doc.fileform.action = (_doc.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi");
			_doc.fileform.submit();
		}

		_doc.fileform.reset();
	},
	fileonload : function(str){
		if(!!str){
			var farray = str.replace(/[\t\r]*\n/g,"\n").split(/\n/);
			var fstr = "";
			for(var i=0;i<farray.length;i++){
				if(farray[i].match(/^http\:\/\//)){ break;}
				fstr += (farray[i]+"\n");
			}

			localStorage['pzprv3_filedata'] = fstr;
			window.open('./p.html', '');
		}
	}
});

})();

/*********************/
/* Database function */
/*********************/
(function(){

var v3index = window.v3index;

v3index.dbif = {
	list   : [],
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var _form;
var self = v3index.dbif;
var DBlist = self.list;
var pheader = '';

pzpr.MetaData.prototype.update = function(metadata){
	if(!metadata){ return;}
	for(var i in this.items){ if(typeof metadata[i]==='string'){ this[i] = metadata[i];}}
};

v3index.dbif.extend({
	init : function(){
		_form = _doc.database;
		if(!!_form){
			_form.sorts_ja.addEventListener("change", self.display, false);
			_form.sorts_en.addEventListener("change", self.display, false);
			_form.datalist.addEventListener("change", self.select,  false);
			_form.open_ja.addEventListener( "click",  self.open,    false);
			_form.open_en.addEventListener( "click",  self.open,    false);
			
			pheader = 'pzprv3_storage:data:';
			self.importlist(self.display);
			return true;
		}
	},
	importlist : function(callback){
		/* jshint eqnull:true */
		DBlist = [];
		for(var i=1;true;i++){
			var data = localStorage[pheader+i];
			if(!data){ break;}
			var row = JSON.parse(data);
			if(row.id==null){ break;}
			var pzl = pzpr.parser.parse(row.pdata);
			row.pid = pzl.pid;
			row.col = pzl.cols;
			row.row = pzl.rows;
			DBlist.push(row);
		}

		if(!!callback){ callback();}
	},
	display : function(){
		var order = (v3index.doclang==='ja'?_form.sorts_ja:_form.sorts_en).value;
		switch(order){
			case 'idlist' : DBlist = DBlist.sort(function(a,b){ return (a.id-b.id);}); break;
			case 'newsave': DBlist = DBlist.sort(function(a,b){ return (b.time-a.time || a.id-b.id);}); break;
			case 'oldsave': DBlist = DBlist.sort(function(a,b){ return (a.time-b.time || a.id-b.id);}); break;
			case 'size'   : DBlist = DBlist.sort(function(a,b){ return (a.col-b.col || a.row-b.row || a.id-b.id);}); break;
		}
		(v3index.doclang==='ja'?_form.sorts_en:_form.sorts_ja).value = order;

		_form.datalist.innerHTML = "";
		for(var i=0;i<DBlist.length;i++){
			var row = DBlist[i];
			if(!!row){
				var opt = _doc.createElement('option');
				opt.setAttribute('value', row.id);
				opt.innerHTML = self.getcaption(row);
				_form.datalist.appendChild(opt);
			}
		}
		if(DBlist.length>=1){
			_form.datalist.firstChild.setAttribute('selected', 'selected');
			var metadata = pzpr.parser.parse(DBlist[0].pdata).metadata;
			_form.comtext.value = metadata.comment;
			_form.author.value  = metadata.author;
			_form.source.value  = metadata.source;
		}
		else{
			_form.comtext.value = "";
			_form.datalist.style.width = "180px";
		}
	},
	getcaption : function(row){
		/* jshint eqeqeq:false */
		var datestr = (function(){
			var ni = function(num){ return (num<10?"0":"")+num;}, str = "", date = new Date();
			date.setTime(row.time*1000);
			str += (ni(date.getFullYear()%100) + "/" + ni(date.getMonth()+1) + "/" + ni(date.getDate())+" ");
			str += (ni(date.getHours()) + ":" + ni(date.getMinutes()));
			return str;
		})();

		var str = "";
		str += ((row.id<10?"&nbsp;":"")+row.id+" :&nbsp;");
		str += (pzpr.variety.info[row.pid][v3index.doclang]+"&nbsp;");
		str += (""+row.col+"×"+row.row+" &nbsp;");
		str += (pzpr.parser.parse(row.pdata).metadata.hard+"&nbsp;");
		str += ("("+datestr+")");
		return str;
	},

	select : function(){
		var selected = self.getvalue();
		var metadata = (selected>=0 ? pzpr.parser.parse(DBlist[selected].pdata).metadata : {});
		_form.comtext.value = metadata.comment;
		_form.author.value  = metadata.author;
		_form.source.value  = metadata.source;
	},
	open : function(){
		var selected = self.getvalue();
		if(selected>=0){
			var str = DBlist[selected].pdata;
			if(!!str){
				localStorage['pzprv3_filedata'] = str;
				window.open('./p.html', '');
			}
		}
	},
	getvalue : function(){
		/* jshint eqeqeq:false */
		var val = _form.datalist.value;
		if(val!==""){
			for(var i=0;i<DBlist.length;i++){
				if(DBlist[i].id==val){ return i;}
			}
		}
		return -1;
	}
});

})();

/*********************/
/* Database function */
/*********************/
(function(){

var v3index = window.v3index;

var pstate = {
	lunch :['nurikabe','tilepaint','norinori','nurimaze','heyawake','hitori','slither','mashu','yajilin',
			'slalom','numlin','hashikake','herugolf','shikaku','tentaisho','kakuro','sudoku','fillomino','ripple',
			'akari','shakashaka'],
	testa :['nagare','makaro','juosan','dosufuwa'],
	trial :[],
	lunch2:['box','lits','kurodoko','goishi'],
	lunch3:['minarism','factors'],
	nigun :['creek','mochikoro','tasquare','kurotto','shimaguni','yajikazu','bag','country','reflect','icebarn',
			'firefly','kaero','yosenabe','bdblock','fivecells','sashigane','tatamibari','sukoro',
			'gokigen','tateyoko','kinkonkan','snakes'],
	omopa :['nuribou','tawa','lookair','paintarea','chocona','kurochute','mejilink',
			'pipelink','loopsp','nagenawa','kouchoku','ringring','pipelinkr','barns','icelom','icelom2',
			'wblink','kusabi','ichimaga','ichimagam','ichimagax','amibo','bonsan','heyabon','rectslider',
			'nawabari','triplace','fourcells','kramma','kramman','shwolf','loute','fillmat','usotatami','yajitatami',
			'kakuru','view','bosanowa','nanro','cojun','renban','sukororoom','hanare','kazunori',
			'wagiri','shugaku','hakoiri','roma','toichika','cbblock'],
	orig  :['mochinyoro','ayeheya','aho'],
	genre :['tapa']
};
var tabstate = {
	lunch:'lunch', lunch2:'lunch', lunch3:'nigun',
	testa:'nigun', nigun:'nigun',
	trial:'omopa', omopa:'omopa',
	orig :'extra', genre:'extra'
};

var genres = {};
for(var state in pstate){
	pstate[state].forEach(function(pid){
		genres[pzpr.variety.toPID(pid)] = {state:state, tab:tabstate[state]};
	});
}

v3index.extend({variety:genres});

})();
