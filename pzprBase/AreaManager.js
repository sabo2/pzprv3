// AreaManager.js v3.4.0

//--------------------------------------------------------------------------------
// ★AreaManagerクラス セルの部屋情報などを保持するクラス
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRoomNumber()等が必要です。
//--------------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaManager',
{
	initialize : function(){
		this.max;
		this.invalidid;	// 使わなくなったIDのリスト
		this.id;		// 各々のセルのid
		this.linkinfo;	// セルの情報を保持しておく

		this.separate = [];		// 境界線に線が引いてあるかどうか
	},
	init : function(){
		if(this.enabled){
			for(var i=0;i<this.relation.length;i++){
				this.owner.board.validinfo[this.relation[i]].push(this);
				this.owner.board.validinfo.all.push(this);
			}
		}
	},
	enabled : false,
	relation : ['cell'],

	irowakeEnable : function(){
		return (this.owner.flags.irowakeblk || (this.owner.pid==='amibo' && this.owner.flags.irowake));
	},
	irowakeValid : function(){
		return (this.owner.getConfig('irowakeblk') || (this.owner.pid==='amibo' && this.owner.getConfig('irowake')));
	},

	//--------------------------------------------------------------------------------
	// info.isvalid() そのセルが有効かどうか返す
	// info.bdfunc()  境界線が存在するかどうかを返す
	//--------------------------------------------------------------------------------
	isvalid : function(cell){
		return (cell.ques!==7);
	},
	bdfunc : function(border){
		return false;
	},

	//--------------------------------------------------------------------------------
	// info.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// info.rebuild() 既存の情報からデータを再設定する
	//--------------------------------------------------------------------------------
	reset : function(){
		this.max       = 0;
		this.invalidid = [];
		this.id        = [];
		this.linkinfo  = [];

		this.separate  = [];

		this.rebuild();
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		if(this.owner.board.isborder){
			for(var id=0;id<this.owner.board.bdmax;id++){
				this.separate[id] = false;
				this.setSeparateInfo(this.owner.board.border[id]);
			}
		}

		for(var cc=0;cc<this.owner.board.cellmax;cc++){
			this.linkinfo[cc] = 0;
			this.setLinkInfo(this.owner.board.cell[cc]);
			this.id[cc] = 0;
		}

		this.searchIdlist(this.owner.board.cell);
	},

	//--------------------------------------------------------------------------------
	// info.setCellInfo()  黒マス・白マスが入力されたり消された時などに、IDの情報を変更する
	// info.setLinkInfo()  自分のセルと4方向の接続情報を設定する
	// info.calcLinkInfo() 上下左右にのセルに繋がることが可能かどうかの情報を取得する
	//--------------------------------------------------------------------------------
	setCellInfo : function(cell){
		if(!this.enabled){ return;}

		if(this.owner.board.isborder){
			/* 自分の状態によってseparate状態が変わる場合があるのでチェックします */
			var cblist=cell.getdir4cblist();
			for(var i=0;i<cblist.length;i++){ this.setSeparateInfo(cblist[i][1]);}
		}

		var val = this.calcLinkInfo(cell), old = this.linkinfo[cell.id];
		if(this.setLinkInfo(cell)){
			var cidlist = this.getRemakeCell(cell, (val|old));
			var isadd = !!((val&16)&&!(old&16)), isremove = !!(!(val&16)&&(old&16));
			// 新たに黒マス(白マス)くっつける場合 => 自分に領域IDを設定するだけ
			if(isadd && (cidlist.length<=1)){
				this.assignCell(cell, (cidlist.length===1?this.owner.board.cell[cidlist[0]]:null));
			}
			// 端の黒マス(白マス)ではなくなった時 => まわりの数が0か1なら情報or自分を消去するだけ
			else if(isremove && (cidlist.length<=1)){
				this.removeCell(cell);
			}
			else{
				cidlist.push(cell.id);
				this.remakeInfo(cidlist);
			}
		}
	},
	setLinkInfo : function(cell){
		var val = this.calcLinkInfo(cell);
		if(this.linkinfo[cell.id]!==val){
			this.linkinfo[cell.id]=val;
			return true;
		}
		return false;
	},
	calcLinkInfo : function(cell){
		var val = 0;
		if(!cell.up().isnull && !this.bdfunc(cell.ub())){ val+=1;}
		if(!cell.dn().isnull && !this.bdfunc(cell.db())){ val+=2;}
		if(!cell.lt().isnull && !this.bdfunc(cell.lb())){ val+=4;}
		if(!cell.rt().isnull && !this.bdfunc(cell.rb())){ val+=8;}
		if(this.isvalid(cell)){ val+=16;}
		return val;
	},

	//--------------------------------------------------------------------------------
	// info.setBorderInfo()   境界線が引かれたり消されてたりした時に、部屋情報を更新する
	// info.setSeparateInfo() 境界線情報と実際の境界線の差異を調べて設定する
	// info.checkExecSearch() 部屋情報が変化したかsearch前にチェックする
	//--------------------------------------------------------------------------------
	setBorderInfo : function(border){
		if(!this.enabled){ return;}
		
		if(this.setSeparateInfo(border)){
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull){ this.setLinkInfo(cell1);}
			if(!cell2.isnull){ this.setLinkInfo(cell2);}
			if(cell1.isnull || cell2.isnull || !this.checkExecSearch(border)){ return;}

			this.remakeInfo([cell1.id, cell2.id]);
		}
	},
	setSeparateInfo : function(border){
		var isbd = this.bdfunc(border);
		if(this.separate[border.id]!==isbd){
			this.separate[border.id]=isbd;
			return true;
		}
		return false;
	},
	checkExecSearch : function(border){
		var cc1 = border.sidecell[0].id,  cc2 = border.sidecell[1].id;

		if(this.separate[border.id]){ /* 部屋を分けるのに、最初から分かれていた */
			if(this.id[cc1]===null || this.id[cc2]===null || this.id[cc1]!==this.id[cc2]){ return false;} // はじめから分かれていた
		}
		else{ /* 部屋を繋げるのに、最初から同じ部屋だった */
			if(this.id[cc1]!==null && this.id[cc1]===this.id[cc2]){ return false;}
		}
		return true;
	},

	//--------------------------------------------------------------------------------
	// info.getRemakeCell() 自分＋接する最大4箇所のセルのうち、自分に繋がることができるものを返す
	// info.getLinkCell()   今自分が繋がっているセルを返す
	//--------------------------------------------------------------------------------
	getRemakeCell : function(cell, link){
		var cidlist = [], list = cell.getdir4clist(), pow=[0,1,2,4,8], pow2=[0,2,1,8,4];
		for(var i=0;i<list.length;i++){
			var cell2=list[i][0], dir=list[i][1], link2=this.linkinfo[cell2.id];
			if(this.id[cell2.id]!==null && !!(link & pow[dir]) && !!(link2 & pow2[dir])){ cidlist.push(cell2.id);}
		}
		return cidlist;
	},
	getLinkCell : function(cell){
		return this.getRemakeCell(cell, this.linkinfo[cell.id]);
	},

	//--------------------------------------------------------------------------------
	// info.assignCell() 指定されたセルを有効なセルとして設定する
	// info.removeCell() 指定されたセルを無効なセルとして設定する
	// info.remakeInfo() 線が引かれたり消された時、領域分割統合時のidの再設定を行う
	//--------------------------------------------------------------------------------
	assignCell : function(cell, cell2){
		var areaid = this.id[cell.id];
		if(areaid!==null && areaid!==0){ return;}

		if(cell2===null){
			areaid = this.addArea();
			if(this.irowakeEnable()){ cell.color = this.owner.painter.getNewLineColor();}
		}
		else{
			areaid = this.id[cell2.id];
			if(this.irowakeEnable()){ cell.color = cell2.color;}
		}
		this[areaid].idlist.push(cell.id);
		this.id[cell.id] = areaid;
	},
	removeCell : function(cell){
		var areaid = this.id[cell.id];
		if(areaid===null || areaid===0){ return;}

		var idlist = this[areaid].idlist;
		if(idlist.length>0){
			for(var i=0;i<idlist.length;i++){
				if(idlist[i]===cell.id){ idlist.splice(i,1); break;}
			}
		}

		if(idlist.length===0){ this.removeArea(areaid);}
		this.id[cell.id] = null;
		if(this.irowakeEnable()){ cell.color = "";}
	},
	remakeInfo : function(cidlist){
		var longColor = (this.irowakeEnable() ? this.getLongColor(cidlist) : "");

		/* info.popArea() 指定された複数のセルが含まれる部屋を全て無効にしてidlistを返す */
		/* 周りのセルから、周りのセルを含む領域のセル全体に対象を拡大する */
		var clist = this.owner.newInstance('CellList');
		for(var i=0;i<cidlist.length;i++){
			var r=this.id[cidlist[i]], bd=this.owner.board;
			if(r!==null && r!==0){ clist.extend(this.removeArea(r));}
			else if(r===null)    { clist.add(bd.cell[cidlist[i]]);}
		}
		var assign = this.searchIdlist(clist);

		if(this.irowakeEnable()){ this.setLongColor(assign, longColor);}
	},

	//--------------------------------------------------------------------------------
	// info.addArea()    新しく割り当てるidを取得する
	// info.removeArea() 部屋idを無効にする
	//--------------------------------------------------------------------------------
	addArea : function(){
		var newid;
		if(this.invalidid.length>0){ newid = this.invalidid.shift();}
		else{ this.max++; newid=this.max;}

		this[newid] = {idlist:[]};
		return newid;
	},
	removeArea : function(id){
		var clist = this.owner.newInstance('CellList').addByIdlist(this[id].idlist);
		for(var i=0;i<clist.length;i++){ this.id[clist[i].id] = null;}
		
		this[id] = {idlist:[]};
		this.invalidid.push(id);
		return clist;
	},

	//--------------------------------------------------------------------------------
	// info.newIrowake()  線の情報が再構築された際、ブロックに色をつける
	//--------------------------------------------------------------------------------
	newIrowake : function(){
		for(var i=1;i<=this.max;i++){
			var idlist = this[i].idlist;
			if(idlist.length>0){
				var newColor = this.owner.painter.getNewLineColor();
				for(var n=0;n<idlist.length;n++){
					this.owner.board.cell[idlist[n]].color = newColor;
				}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	getLongColor : function(cidlist){
		// 周りで一番大きな線は？
		var largeid = null, longColor = "";
		for(var i=0;i<cidlist.length;i++){
			var r = this.id[cidlist[i]];
			if(r===null){ continue;}
			if(largeid===null || this[largeid].idlist.length < this[r].idlist.length){
				largeid = r;
				longColor = this.owner.board.cell[cidlist[i]].color;
			}
		}
		return (!!longColor ? longColor : this.owner.painter.getNewLineColor());
	},
	setLongColor : function(assign, longColor){
		/* assign:影響のあったareaidの配列 */
		var clist = this.owner.newInstance('CellList');
		
		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する
		// もしassign.length===1の場合、色が同じになる
		
		// できた線の中でもっとも長いものを取得する
		var longid = assign[0];
		for(var i=1;i<assign.length;i++){
			if(this[longid].idlist.length < this[assign[i]].idlist.length){ longid = assign[i];}
		}
		
		// 新しい色の設定
		for(var i=0;i<assign.length;i++){
			var newColor = (assign[i]===longid ? longColor : this.owner.painter.getNewLineColor());
			var clist1 = this.owner.newInstance('CellList').addByIdlist(this[assign[i]].idlist);
			for(var n=0,len=clist1.length;n<len;n++){ clist1[n].color = newColor;}
			clist.extend(clist1);
		}
		
		if(this.irowakeValid()){ this.owner.painter.repaintBlocks(clist);}
	},

	//--------------------------------------------------------------------------------
	// info.searchIdlist() 盤面内のidlistに含まれるセルにIDを付け直す
	// info.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	searchIdlist : function(clist){
		var assign = [];
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			this.id[cell.id] = (this.isvalid(cell)?0:null);
		}
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(this.id[cell.id]!==0){ continue;}
			var newid = this.addArea();
			this.searchSingle(cell, newid);
			assign.push(newid);
		}
		return assign;
	},
	searchSingle : function(cell, newid){
		var stack=[cell], iid=this.id[cell.id];
		while(stack.length>0){
			var cell=stack.pop();
			if(this.id[cell.id]!==iid){ continue;}
			this.id[cell.id] = newid;
			this[newid].idlist.push(cell.id);

			var cidlist = this.getLinkCell(cell);
			for(var i=0;i<cidlist.length;i++){
				if(this.id[cidlist[i]]===0){ stack.push(this.owner.board.cell[cidlist[i]]);}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getAreaInfo()  情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getAreaInfo : function(){
		var bd = this.owner.board, info = this.owner.newInstance('AreaInfo');
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(this.id[c]>0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!info.emptyCell(cell)){ continue;}
			info.addRoom();

			var clist = this.getClistByCell(cell);
			for(var i=0;i<clist.length;i++){ info.addCell(clist[i]);}
		}
		return info;
	},

	//--------------------------------------------------------------------------------
	// info.getClistByCell() 指定したセルが含まれる領域のセル配列を取得する
	// info.getClist()       指定した領域のセル配列を取得する
	//--------------------------------------------------------------------------------
	getClistByCell : function(cell){ return this.getClist(this.id[cell.id]);},
	getClist : function(areaid){
		if(!this[areaid]){ alert(areaid);}
		return this.owner.newInstance('CellList').addByIdlist(this[areaid].idlist);
	}
});

//--------------------------------------------------------------------------------
// ☆AreaBlackManagerクラス  黒マス情報オブジェクトのクラス
// ☆AreaWhiteManagerクラス  白マス情報オブジェクトのクラス
// ☆AreaNumberManagerクラス 数字情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaBlackManager:AreaManager',
{
	isvalid : function(cell){ return cell.isBlack();}
});

pzprv3.createPuzzleClass('AreaWhiteManager:AreaManager',
{
	isvalid : function(cell){ return cell.isWhite();}
});

pzprv3.createPuzzleClass('AreaNumberManager:AreaManager',
{
	isvalid : function(cell){ return cell.isNumberObj();}
});

//--------------------------------------------------------------------------------
// ☆AreaRoomManagerクラス 部屋情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaRoomManager:AreaManager',
{
	initialize : function(){
		this.crosscnt = [];		// 格子点の周りの境界線の数

		pzprv3.core.AreaManager.prototype.initialize.call(this);
	},
	relation : ['cell', 'border'],
	bdfunc : function(border){ return border.isBorder();},

	hastop : false,

	//--------------------------------------------------------------------------------
	// rooms.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// rooms.rebuild() 部屋情報の再設定を行う
	//--------------------------------------------------------------------------------
	rebuild : function(){
		if(!this.enabled){ return;}

		/* 外枠のカウントをあらかじめ足しておく */
		var bd = this.owner.board;
		for(var by=bd.minby;by<=bd.maxby;by+=2){ for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
			var c = (bx>>1)+(by>>1)*(bd.qcols+1);
			var ischassis = (bd.isborder===1 ? (bx===bd.minbx||bx===bd.maxbx||by===bd.minby||by===bd.maxby):false);
			this.crosscnt[c]=(ischassis?2:0);
		}}

		pzprv3.core.AreaManager.prototype.rebuild.call(this);

		if(this.enabled && this.hastop){ this.resetRoomNumber();}
	},

	//--------------------------------------------------------------------------------
	// rooms.setSeparateInfo()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	setSeparateInfo : function(border){
		var isbd = this.bdfunc(border);
		if(this.separate[border.id]!==isbd){
			var cc1 = border.sidecross[0].id, cc2 = border.sidecross[1].id;
			if(cc1!==null){ this.crosscnt[cc1]+=(isbd?1:-1);}
			if(cc2!==null){ this.crosscnt[cc2]+=(isbd?1:-1);}
			this.separate[border.id]=isbd;
			if(border.id<this.owner.board.bdinside){ return true;}
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// rooms.checkExecSearch() 部屋情報が変化したかsearch前にチェックする
	//--------------------------------------------------------------------------------
	// オーバーライド
	checkExecSearch : function(border){
		if(!pzprv3.core.AreaManager.prototype.checkExecSearch.call(this,border)){ return false;}

		// 途切れた線だったとき
		var xc1 = border.sidecross[0].id, xc2 = border.sidecross[1].id;
		if     ( this.separate[border.id] && (this.crosscnt[xc1]===1 || this.crosscnt[xc2]===1)){ return false;}
		else if(!this.separate[border.id] && (this.crosscnt[xc1]===0 || this.crosscnt[xc2]===0)){ return false;}

		// TOPがある場合 どっちの数字を残すかは、TOP同士の位置で比較する
		var cell1 = border.sidecell[0],  cell2 = border.sidecell[1];
		if(!this.separate[border.id] && this.hastop){this.setTopOfRoom_combine(cell1,cell2);}

		return true;
	},

	//--------------------------------------------------------------------------------
	// rooms.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	// オーバーライド
	searchSingle : function(cell, newid){
		pzprv3.core.AreaManager.prototype.searchSingle.call(this, cell, newid);

		if(this.hastop){ this.setTopOfRoom(newid);}
	},

	//--------------------------------------------------------------------------------
	// rooms.setTopOfRoom_combine()  部屋が繋がったとき、部屋のTOPを設定する
	//--------------------------------------------------------------------------------
	setTopOfRoom_combine : function(cell1,cell2){
		var merged, keep;
		var tcell1 = this.getTopOfRoomByCell(cell1);
		var tcell2 = this.getTopOfRoomByCell(cell2);
		if(cell1.bx>cell2.bx || (cell1.bx===cell2.bx && cell1.id>cell2.id)){ merged = tcell1; keep = tcell2;}
		else                                                               { merged = tcell2; keep = tcell1;}

		// 消える部屋のほうの数字を消す
		if(merged.isNum()){
			// 数字が消える部屋にしかない場合 -> 残るほうに移動させる
			if(keep.noNum()){
				keep.setQnum(merged.getQnum());
				keep.draw();
			}
			merged.setQnum(-1);
			merged.draw();
		}
	},

	//--------------------------------------------------------------------------------
	// rooms.calcTopOfRoom()   部屋のTOPになりそうなセルのIDを返す
	// rooms.setTopOfRoom()    部屋のTOPを設定する
	// rooms.resetRoomNumber() 情報の再構築時に部屋のTOPのIDを設定したり、数字を移動する
	//--------------------------------------------------------------------------------
	calcTopOfRoom : function(roomid){
		var bd=this.owner.board, cc=null, bx=bd.maxbx, by=bd.maxby;
		var idlist = this[roomid].idlist;
		for(var i=0;i<idlist.length;i++){
			var cell = bd.cell[idlist[i]];
			if(cell.bx>bx || (cell.bx===bx && cell.by>=by)){ continue;}
			cc=idlist[i];
			bx=cell.bx;
			by=cell.by;
		}
		return cc;
	},
	setTopOfRoom : function(roomid){
		this[roomid].top = this.calcTopOfRoom(roomid);
	},
	resetRoomNumber : function(){
		for(var r=1;r<=this.max;r++){
			var val = -1, idlist = this[r].idlist, top = this.getTopOfRoom(r);
			for(var i=0,len=idlist.length;i<len;i++){
				var c = idlist[i], cell = this.owner.board.cell[c];
				if(this.id[c]===r && cell.qnum!==-1){
					if(val===-1){ val = cell.qnum;}
					if(top!==c){ cell.qnum = -1;}
				}
			}
			if(val!==-1 && top.qnum===-1){
				top.qnum = val;
			}
		}
	},

	//--------------------------------------------------------------------------------
	// rooms.getRoomID()  このオブジェクトで管理しているセルの部屋IDを取得する
	// rooms.setRoomID()  このオブジェクトで管理しているセルの部屋IDを設定する
	// rooms.getTopOfRoomByCell() 指定したセルが含まれる領域のTOPの部屋を取得する
	// rooms.getTopOfRoom()       指定した領域のTOPの部屋を取得する
	// rooms.getCntOfRoomByCell() 指定したセルが含まれる領域の大きさを抽出する
	// rooms.getCntOfRoom()       指定した領域の大きさを抽出する
	//--------------------------------------------------------------------------------
	getRoomID : function(cell){ return this.id[cell.id];},
//	setRoomID : function(cell,val){ this.id[cell.id] = val;},

	getTopOfRoomByCell : function(cell){ return this.owner.board.cell[this[this.id[cell.id]].top];},
	getTopOfRoom       : function(id)  { return this.owner.board.cell[this[id].top];},

	getCntOfRoomByCell : function(cell){ return this[this.id[cell.id]].idlist.length;}
//	getCntOfRoom       : function(id)  { return this[id].idlist.length;},
});

//--------------------------------------------------------------------------------
// ☆AreaLineManagerクラス 線つながり情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaLineManager:AreaManager',
{
	initialize : function(){
		this.bdcnt = [];		// セルの周りの領域を分断する境界線の数

		pzprv3.core.AreaManager.prototype.initialize.call(this);
	},
	relation : ['cell', 'line'],
	isvalid : function(cell){ return this.bdcnt[cell.id]<4;},
	bdfunc : function(border){ return !border.isLine();},

	//--------------------------------------------------------------------------------
	// linfo.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// linfo.rebuild() 境界線情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset : function(){
		this.bdcnt = [];

		pzprv3.core.AreaManager.prototype.reset.call(this);
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		/* 外枠のカウントをあらかじめ足しておく */
		var bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var bx=bd.cell[c].bx, by=bd.cell[c].by;
			this.bdcnt[c]=0;
			if(bx===bd.minbx+1||bx===bd.maxbx-1){ this.bdcnt[c]++;}
			if(by===bd.minby+1||by===bd.maxby-1){ this.bdcnt[c]++;}
		}

		pzprv3.core.AreaManager.prototype.rebuild.call(this);
	},

	//--------------------------------------------------------------------------------
	// linfo.setSeparateInfo()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	setSeparateInfo : function(border){
		var isbd = this.bdfunc(border);
		if(this.separate[border.id]!==isbd){
			var cc1 = border.sidecell[0].id, cc2 = border.sidecell[1].id;
			if(cc1!==null){ this.bdcnt[cc1]+=(isbd?1:-1);}
			if(cc2!==null){ this.bdcnt[cc2]+=(isbd?1:-1);}
			this.separate[border.id]=isbd;
			if(border.id<this.owner.board.bdinside){ return true;}
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// info.setLineInfo()  線が引かれたり消されてたりした時に、部屋情報を更新する
	//--------------------------------------------------------------------------------
	setLineInfo : function(border){
		this.setBorderInfo(border);
	}
});

//---------------------------------------------------------------------------
// ★AreaInfoクラス 主に色分けの情報を管理する
//   id : null   どの部屋にも属さないセル(黒マス情報で白マスのセル、等)
//         0     どの部屋に属させるかの処理中
//         1以上 その番号の部屋に属する
//---------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaInfo',
{
	initialize : function(){
		this.max  = 0;	// 最大の部屋番号(1〜maxまで存在するよう構成してください)
		this.id   = [];	// 各セル/線などが属する部屋番号を保持する
		this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].idlistで取得)
	},

	addRoom : function(){
		this.max++;
		this.room[this.max] = {idlist:[]};
	},
	getRoomID : function(obj){ return this.id[obj.id];},
	setRoomID : function(obj, areaid){
		this.room[areaid].idlist.push(obj.id);
		this.id[obj.id] = areaid;
	},

	addCell   : function(cell){ this.setRoomID(cell, this.max);},
	emptyCell : function(cell){ return (this.id[cell.id]===0);},

	getclistbycell : function(cell)  { return this.getclist(this.id[cell.id]);},
	getclist : function(areaid){
		return this.owner.newInstance('CellList').addByIdlist(this.room[areaid].idlist);
	},

	//---------------------------------------------------------------------------
	// info.getSideAreaInfo()  接しているが異なる領域部屋の情報を取得する
	//---------------------------------------------------------------------------
	getSideAreaInfo : function(){
		var adjs=[], sides=[], max=this.max;
		for(var r=1;r<=max-1;r++){ adjs[r]=[];}

		for(var id=0;id<this.bdmax;id++){
			var cell1 = this.border[id].sidecell[0], cell2 = this.border[id].sidecell[1];
			if(cell1.isnull || cell2.isnull){ continue;}
			var r1=this.getRoomID(cell1), r2=this.getRoomID(cell2);
			if(r1===null || r2===null){ continue;}

			if(r1<r2){ adjs[r1][r2]=true;}
			if(r1>r2){ adjs[r2][r1]=true;}
		}

		for(var r=1;r<=max-1;r++){
			sides[r]=[];
			for(var s=r+1;s<=max;s++){
				if(!!adjs[r][s]){ sides[r].push(s);}
			}
		}
		return sides;
	},

	//---------------------------------------------------------------------------
	// info.setErrLareaByCell() ひとつながりになった線が存在するマスにエラーを設定する
	// info.setErrLareaById()   ひとつながりになった線が存在するマスにエラーを設定する
	//---------------------------------------------------------------------------
	setErrLareaByCell : function(cell, val){
		this.setErrLareaById(this.id[cell.id], val);
	},
	setErrLareaById : function(areaid, val){
		var self = this;
		this.owner.board.border.filter(function(border){
			var cc1 = border.sidecell[0].id, cc2 = border.sidecell[1].id;
			return (border.isLine() && self.id[cc1]===areaid && self.id[cc2]===areaid);
		}).seterr(val);

		this.owner.board.cell.filter(function(cell){
			return (self.id[cell.id]===areaid && cell.isNum());
		}).seterr(4);
	}
});
