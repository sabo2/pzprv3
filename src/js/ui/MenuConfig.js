// MenuConfig.js v3.4.1
/* global pzpr:false, ui:false, JSON:false */

(function(){
//---------------------------------------------------------------------------
// ★MenuConfigクラス UI側の設定値を管理する
//---------------------------------------------------------------------------
var Config = pzpr.Puzzle.prototype.Config.prototype;

// メニュー描画/取得/html表示系
// Menuクラス
ui.menuconfig = {

	list : null,			// MenuConfigの設定内容を保持する

	//---------------------------------------------------------------------------
	// menuconfig.init()  MenuConfigの初期化を行う
	// menuconfig.add()   初期化時に設定を追加する
	//---------------------------------------------------------------------------
	init : function(){
		this.list = {};
		
		this.add('autocheck',      ui.puzzle.playeronly);	/* 正解自動判定機能 */
		this.add('autocheck_once', ui.puzzle.playeronly);	/* 正解自動判定機能 */
		this.list.autocheck_once.volatile = true;
		
		this.add('keypopup', false);						/* キーポップアップ (数字などのパネル入力) */

		this.add('adjsize', true);							/* 自動横幅調節 */
		this.add('cellsizeval', 36);						/* セルのサイズ設定用 */
		this.add('fullwidth', (ui.windowWidth()<600));		/* キャンバスを横幅いっぱいに広げる */
		
		this.add('toolarea', true);							/* ツールエリアの表示 */
		
		this.add('language', pzpr.lang, ['en','ja']);		/* 言語設定 */

		/* puzzle.configを一括で扱うため登録 */
		for(var name in ui.puzzle.config.list){
			this.add(name, ui.puzzle.config.list[name].defval, ui.puzzle.config.list[name].option);
			this.list[name].volatile = true;
			this.list[name].puzzle = true;
		}
		this.add('mode', (!ui.puzzle.playmode?'edit':'play'), ['edit','play']);
		this.list.mode.volatile = true;
		this.list.mode.puzzle = true;
	},
	add : Config.add,

	//---------------------------------------------------------------------------
	// menuconfig.sync()  URL形式などによって変化する可能性がある設定値を同期する
	//---------------------------------------------------------------------------
	sync : function(){
		var idname = null;
		switch(ui.puzzle.pid){
			case 'yajirin':   idname = 'disptype_yajilin';   break;
			case 'pipelinkr': idname = 'disptype_pipelinkr'; break;
			case 'bosanowa':  idname = 'disptype_bosanowa';  break;
		}
		if(!!idname){ this.set(idname, ui.puzzle.getConfig(idname));}
	},

	//---------------------------------------------------------------------------
	// menuconfig.get()  各フラグの設定値を返す
	// menuconfig.set()  各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	get : Config.get,
	set : function(idname, newval){
		if(!this.list[idname]){ return;}
		if(idname==='mode'){ ui.puzzle.setMode(newval); newval = (!ui.puzzle.playmode?'edit':'play');}
		
		newval = this.setproper(idname, newval);
		
		if(idname==='language'){ pzpr.lang = newval;}
		else if(this.list[idname].puzzle){ ui.puzzle.setConfig(idname, newval);}
		
		this.configevent(idname,newval);
	},

	//---------------------------------------------------------------------------
	// menuconfig.restore()  保存された各種設定値を元に戻す
	// menuconfig.save()     各種設定値を保存する
	//---------------------------------------------------------------------------
	restore : function(){
		/* 設定が保存されている場合は元に戻す */
		ui.puzzle.config.init();
		this.init();
		var json_puzzle = localStorage['pzprv3_config:puzzle'];
		var json_menu   = localStorage['pzprv3_config:ui'];
		if(!!json_puzzle){ this.setAll(JSON.parse(json_puzzle));}
		if(!!json_menu)  { this.setAll(JSON.parse(json_menu));}
	},
	save : function(){
		localStorage['pzprv3_config:puzzle'] = JSON.stringify(ui.puzzle.saveConfig());
		localStorage['pzprv3_config:ui']     = JSON.stringify(this.getAll());
	},

	//---------------------------------------------------------------------------
	// menuconfig.getList()  現在有効な設定値のリストを返す
	//---------------------------------------------------------------------------
	getList : Config.getList,
	getexec : function(name){
		if(!this.list[name]){ return false;}
		if(name==='mode'){ return !ui.puzzle.playeronly;}
		else if(name==='disptype_yajilin'){ return (ui.puzzle.pid==='yajirin');} // WorkAround
		else if(this.list[name].puzzle){ return ui.puzzle.validConfig(name);}
		return true;
	},

	//---------------------------------------------------------------------------
	// menuconfig.getAll()  全フラグの設定値を返す
	// menuconfig.setAll()  全フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getAll : Config.getAll,
	setAll : function(setting){
		for(var key in setting){ this.set(key,setting[key]);}
		this.list.autocheck_once.val = this.list.autocheck.val;
	},

	//---------------------------------------------------------------------------
	// menuconfig.setproper()    設定値の型を正しいものに変換して設定変更する
	// menuconfig.valid()        設定値が有効なパズルかどうかを返す
	//---------------------------------------------------------------------------
	setproper : Config.setproper,
	valid : function(idname){
		if(!!this.list[name]){ return false;}
		if(idname==="keypopup"){ return (ui.keypopup.paneltype[1]!==0 || ui.keypopup.paneltype[3]!==0);}
		else if(idname==='mode'){ return !ui.puzzle.playeronly;}
		else if(idname==='disptype_yajilin'){ return (ui.puzzle.pid==='yajirin');} // WorkAround
		else if(this.list[idname].puzzle){ return ui.puzzle.validConfig(idname);}
		return !!this.list[idname];
	},

	//---------------------------------------------------------------------------
	// config.configevent()  設定変更時の動作を記述する
	//---------------------------------------------------------------------------
	configevent : function(idname, newval){
		if(!ui.menuarea.menuitem){ return;}
		ui.setdisplay(idname);
		switch(idname){
		case 'keypopup':
			ui.keypopup.display();
			break;
			
		case 'adjsize': case 'cellsizeval': case 'fullwidth':
			ui.adjustcellsize();
			break;
			
		case 'autocheck':
			this.list.autocheck_once.val = newval;
			break;
			
		case 'mode':
			ui.setdisplay('keypopup');
			ui.setdisplay('bgcolor');
			ui.keypopup.display();
			break;
			
		case 'language':
			ui.displayAll();
			break;
		}
	}
};

})();