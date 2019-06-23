// for_test.js v3.5.0

(function(){

/* Debug用オブジェクトに関数などを追加する */
ui.debug.extend(
{
	loadperf : function(){
		ui.puzzle.open(perfstr, function(puzzle){ // eslint-disable-line no-use-before-define
			ui.menuconfig.set('autocheck_once',false);
			ui.menuconfig.set('mode', 'play');
			ui.menuconfig.set('irowake',true);
		});
	},
	
	keydown : function(ca){
		if(ca==='alt+p'){ this.disppoptest();}
		else if(ca==='F7'){ this.accheck1();}
		else if(ca==='ctrl+F9'){ this.starttest();}
		else if(ca==='shift+ctrl+F10'){ this.all_test();}
		else{ return false;}
		
		ui.puzzle.key.cancelEvent = true;	/* カーソルを移動させない */
	},
	
	accheck1 : function(){
		ui.puzzle.checker.checkOnly = false;
		ui.puzzle.checker.checkAns();
		var outputstr = ui.puzzle.getFileData(pzpr.parser.FILE_PZPR).replace(/\r?\n/g, "/");
		var failcode  = ui.puzzle.checker.failcode[0];
		var failstr   = (!!failcode ? "\""+failcode+"\"" : "null");
		ui.puzzle.board.haserror = true;
		ui.puzzle.board.errclear();
		ui.puzzle.redraw();
		this.addTA("\t\t["+failstr+",\""+outputstr+"\"],");
	},

	urls : {},
	acs  : {},
	inputs : {},
	addDebugData : function(pid, data){
		this.urls[pid] = data.url;
		this.acs[pid] = data.failcheck;
		this.inputs[pid] = data.inputs || [];
	},

	execinput : function(str){
		var strs = str.split(/,/);
		switch(strs[0]){
			case 'newboard':
				var urls = [ui.puzzle.pid, strs[1], strs[2]];
				if(ui.puzzle.pid==='tawa'){ urls.push(strs[3]);}
				ui.puzzle.open(urls.join("/"));
				break;
			case 'clear':
				ui.puzzle.clear();
				break;
			case 'ansclear':
				ui.puzzle.ansclear();
				break;
			case 'playmode':
			case 'editmode':
				ui.menuconfig.set('mode', strs[0]);
				break;
			case 'setconfig':
				if     (strs[2]==="true") { ui.menuconfig.set(strs[1], true);}
				else if(strs[2]==="false"){ ui.menuconfig.set(strs[1], false);}
				else                      { ui.menuconfig.set(strs[1], strs[2]);}
				break;
			case 'key':
				for(var i=1;i<strs.length;i++){
					ui.puzzle.key.keyevent(strs[i],0);
					ui.puzzle.key.keyevent(strs[i],1);
				}
				break;
			case 'cursor':
				ui.puzzle.cursor.init(+strs[1], +strs[2]);
				break;
			case 'mouse':
				this.execmouse(strs);
				break;
		}
	},
	execmouse : function(strs){
		var matches = (strs[1].match(/(left|right)(.*)/)[2]||"").match(/x([0-9]+)/);
		var repeat = matches ? +matches[1] : 1;
		var args = [];
		if     (strs[1].substr(0,4)==="left") { args.push('left');}
		else if(strs[1].substr(0,5)==="right"){ args.push('right');}
		for(var i=2;i<strs.length;i++){ args.push(+strs[i]);}
		for(var t=0;t<repeat;t++){
			ui.puzzle.mouse.inputPath.apply(ui.puzzle.mouse, args);
		}
	},
	inputcheck_popup : function(){
		this.inputcheck(this.getTA());
	},
	inputcheck : function(text){
		ui.menuconfig.save();
		var inparray = eval("["+text+"]");
		for(var n=0;n<inparray.length;n++){
			var data = inparray[n];
			if(data.input===void 0 || !data.input){ continue;}
			for(var i=0;i<data.input.length;i++){
				this.execinput(data.input[i]);
			}
		}
		this.execinput("playmode");
		ui.menuconfig.restore();
		ui.displayAll();
	},

	alltimer : null,
	idlist : [],
	pid  : '',
	pnum : 0,
	starttime : 0,
	totalfails : 0,
	all_test : function(){
		if(this.alltimer !== null){ return;}
		var self = this;
		self.pnum = 0;
		self.totalfails = 0;
		self.idlist = pzpr.variety.getList().sort();
		self.starttime = pzpr.util.currentTime();
		self.alltimer = true;
		self.each_test();
	},
	each_test : function(){
		var self = ui.debug;
		if(self.idlist.length===0){
			if(self.alltimer){
				var ms = ((pzpr.util.currentTime() - self.starttime)/100)|0;
				var timetext = ""+((ms/10)|0)+"."+(ms%10)+" sec.";
				self.addTA("Total time: "+timetext);
				self.alltimer = false;
				alert(["All tests done.", "pzpr.js: v"+pzpr.version+" pzprv3-ui.js: v"+ui.version, "Total time: "+timetext, "Fail count="+self.totalfails].join('\n'));
			}
			return;
		}

		var newid = self.idlist[0];
		if(!!newid && !self.urls[newid]){
			self.includeDebugScript("test_"+newid+".js");
			setTimeout(self.each_test,0);
			return;
		}

		self.idlist.shift();
		self.pnum++;

		ui.puzzle.open(newid+"/"+self.urls[newid], function(){
			/* スクリプトチェック開始 */
			self.sccheck();
			self.addTA("Test ("+self.pnum+", "+newid+") start.");
		});
	},

	starttest : function(){
		this.erasetext();
		this.sccheck();
	},

	fails : 0,
	sccheck : function(){
		ui.menuconfig.set('autocheck_once',false);
		var self = this;
		self.fails = 0;
		self.testing = false;
		self.pid = ui.puzzle.pid;
		self.filedata = self.acs[self.pid][self.acs[self.pid].length-1][1];

		var testlist = [];
		testlist.push('check_input');
		if(self.pid!=='tawa'){
			testlist.push('check_turn');
		}
		testlist.push('check_flip');
		testlist.push('check_adjust');
		testlist.push('check_end');

		setTimeout(function tests(){
			if(!self.testing && testlist.length>0){
				self.testing = true;
				self[testlist.shift()](self);
			}
			if(testlist.length>0){ setTimeout(tests,0);}
			else{
				self.totalfails += self.fails;
				self.each_test();
			}
		},0);
	},
	//Input test---------------------------------------------------------------
	check_input : function(self){
		var inps = self.inputs[self.pid];
		if(inps.length>0){
			var count=0, pass=0;
			ui.menuconfig.save();
			for(var n=0;n<inps.length;n++){
				var data = inps[n];
				if(data.input!==void 0 && !!data.input){
					for(var i=0;i<data.input.length;i++){
						self.execinput(data.input[i]);
					}
				}
				if(data.result!==void 0 && !!data.result){
					var iserror = (data.result!==ui.puzzle.getFileData(pzpr.parser.FILE_PZPR).replace(/\r?\n/g, "/"));
					count++;
					if(iserror){ self.fails++; self.addTA("Input Error No."+n);}
					if(!iserror){ pass++;}
				}
			}
			if(!self.alltimer || pass!==count){
				self.addTA("Input test Pass = "+pass+"/"+count);
			}
			self.execinput("playmode");
			ui.menuconfig.restore();
			ui.displayAll();
		}
		self.testing = false;
	},
	//Turn test--------------------------------------------------------------
	check_turn : function(self){
		ui.puzzle.open(self.filedata);
		ui.menuconfig.set('autocheck_once',false);

		var bd = ui.puzzle.board, bd2 = bd.freezecopy();
		bd.operate('turnr');
		bd.operate('turnl');
		ui.puzzle.undo();
		ui.puzzle.undo();

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnR test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnR test 1  = pass");}

		self.testing = false;
	},
	//Flip test--------------------------------------------------------------
	check_flip : function(self){
		ui.puzzle.open(self.filedata);
		ui.menuconfig.set('autocheck_once',false);

		var bd = ui.puzzle.board, bd2 = bd.freezecopy();
		bd.operate('flipx');
		bd.operate('flipy');
		ui.puzzle.undo();
		ui.puzzle.undo();

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipX test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipX test 1  = pass");}

		self.testing = false;
	},
	//Adjust test--------------------------------------------------------------
	check_adjust : function(self){
		ui.puzzle.open(self.filedata);
		ui.menuconfig.set('autocheck_once',false);

		var bd = ui.puzzle.board, bd2 = bd.freezecopy();
		bd.operate('expandup');
		bd.operate('expandrt');
		bd.operate('reduceup');
		bd.operate('reducert');
		ui.puzzle.undo();
		ui.puzzle.undo();
		ui.puzzle.undo();
		ui.puzzle.undo();

		if(!self.bd_compare(bd,bd2)){ self.addTA("Adjust test  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("Adjust test  = pass");}

		self.testing = false;
	},
	//test end--------------------------------------------------------------
	check_end : function(self){
		if(!self.alltimer){ self.addTA("Test end.");}

		self.testing = false;
	},

	bd_compare : function(bd1,bd2){
		var result = true;
		var self = this;
		bd1.compareData(bd2,function(group, c, a){
			self.addTA(group+"["+c+"]."+a+" "+bd1[group][c][a]+" <- "+bd2[group][c][a]);
			result = false;
		});
		return result;
	}
});

var perfstr = "pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /".replace(/\//g, "\n");

})();
