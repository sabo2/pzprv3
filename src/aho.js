//
// �p�Y���ŗL�X�N���v�g�� �A�z�ɂȂ�؂�� aho.js v3.3.0
//
Puzzles.aho = function(){ };
Puzzles.aho.prototype = {
	setting : function(){
		// �O���[�o���ϐ��̏����ݒ�
		if(!k.qcols){ k.qcols = 10;}	// �Ֆʂ̉���
		if(!k.qrows){ k.qrows = 10;}	// �Ֆʂ̏c��
		k.irowake  = 0;		// 0:�F�����ݒ薳�� 1:�F�������Ȃ� 2:�F��������

		k.iscross  = 0;		// 1:�Ֆʓ�����Cross������p�Y�� 2:�O�g����܂߂�Cross������p�Y��
		k.isborder = 1;		// 1:Border/Line������\�ȃp�Y�� 2:�O�g�������\�ȃp�Y��
		k.isexcell = 0;		// 1:��E�����ɃZ����p�ӂ���p�Y�� 2:�l���ɃZ����p�ӂ���p�Y��

		k.isLineCross     = false;	// ������������p�Y��
		k.isCenterLine    = false;	// �}�X�̐^�񒆂�ʂ�����񓚂Ƃ��ē��͂���p�Y��
		k.isborderAsLine  = false;	// ���E����line�Ƃ��Ĉ���
		k.hasroom         = true;	// �������̗̈�ɕ�����Ă���/������p�Y��
		k.roomNumber      = false;	// �����̖��̐�����1��������p�Y��

		k.dispzero        = false;	// 0��\�����邩�ǂ���
		k.isDispHatena    = false;	// qnum��-2�̂Ƃ��ɁH��\������
		k.isAnsNumber     = false;	// �񓚂ɐ�������͂���p�Y��
		k.NumberWithMB    = false;	// �񓚂̐����Ɓ��~������p�Y��
		k.linkNumber      = false;	// �������ЂƂȂ���ɂȂ�p�Y��

		k.BlackCell       = false;	// ���}�X����͂���p�Y��
		k.NumberIsWhite   = false;	// �����̂���}�X�����}�X�ɂȂ�Ȃ��p�Y��
		k.RBBlackCell     = false;	// �A�����f�ւ̃p�Y��
		k.checkBlackCell  = false;	// ��������ō��}�X�̏����`�F�b�N����p�Y��
		k.checkWhiteCell  = false;	// ��������Ŕ��}�X�̏����`�F�b�N����p�Y��

		k.ispzprv3ONLY    = true;	// �ς��Ղ�A�v���b�g�ɂ͑��݂��Ȃ��p�Y��
		k.isKanpenExist   = false;	// pencilbox/�J���y���ɂ���p�Y��

		base.setTitle("�A�z�ɂȂ�؂�","Aho-ni-Narikire");
		base.setExpression("�@���h���b�O�ŋ��E�����A�E�h���b�O�ŕ⏕�L�������͂ł��܂��B",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//���͌n�֐��I�[�o�[���C�h
	input_init : function(){
		// �}�E�X���͌n
		mv.mousedown = function(){
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.enableInputHatena = true;

		// �L�[�{�[�h���͌n
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.generate(0, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}
	},

	//---------------------------------------------------------
	//�摜�\���n�֐��I�[�o�[���C�h
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.fontcolor = pc.fontErrcolor = "white";
		pc.setBorderColorFunc('qans');

		pc.circledcolor = "black";
		pc.fontsizeratio = 0.85;
		pc.circleratio = [0, 0.40];

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawCirclesAtNumber_shikaku(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawCirclesAtNumber_shikaku = function(x1,y1,x2,y2){
			this.vinc('cell_circle', 'auto');

			var rsize2 = this.cw*this.circleratio[1];
			var header = "c_cir_";
			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum!=-1){
					g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.Cellcolor);
					if(this.vnop(header+c,this.FILL)){
						g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};
	},

	//---------------------------------------------------------
	// URL�G���R�[�h/�f�R�[�h����
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// ���𔻒菈�����s��
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = area.getRoomInfo();
			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('�����̓����Ă��Ȃ��̈悪����܂��B','An area has no numbers.'); return false;
			}

			if( !this.checkDoubleNumber(rinfo) ){
				this.setAlert('1�̗̈��2�ȏ�̐����������Ă��܂��B','An area has plural numbers.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (n<0 || (n%3)==0 || w*h==a);} ) ){
				this.setAlert('�傫����3�̔{���ł͂Ȃ��̂Ɏl�p�`�ł͂Ȃ��̈悪����܂��B','An area whose size is not multiples of three is not rectangle.'); return false;
			}

			if( !this.checkAhoArea(rinfo) ){
				this.setAlert('�傫����3�̔{���ł���̈悪L���^�ɂȂ��Ă��܂���B','An area whose size is multiples of three is not L-shape.'); return false;
			}

			if( !this.checkNumberAndSize(rinfo) ){
				this.setAlert('�����Ɨ̈�̑傫�����Ⴂ�܂��B','The size of the area is not equal to the number.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('�r�؂�Ă����������܂��B','There is a dead-end line.'); return false;
			}

			return true;
		};

		ans.checkAhoArea = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				var n = bd.QnC(this.getQnumCellOfClist(rinfo.room[id].idlist));
				if(n<0 || (n%3)!=0){ continue;}

				var d = this.getSizeOfClist(rinfo.room[id].idlist,f_true);
				var clist = [];
				for(var bx=d.x1;bx<=d.x2;bx+=2){
					for(var by=d.y1;by<=d.y2;by+=2){
						var cc = bd.cnum(bx,by);
						if(rinfo.id[cc]!=id){ clist.push(cc);}
					}
				}
				var dl = this.getSizeOfClist(clist,f_true);
				if( clist.length==0 || (dl.cols*dl.rows!=dl.cnt) || (d.x1!==dl.x1 && d.x2!==dl.x2) || (d.y1!==dl.y1 && d.y2!==dl.y2) ){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};