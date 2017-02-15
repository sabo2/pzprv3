
# ReleaseNote

## Version 3.6.7

Release date: 2017/2/16

pzpr.js version: v0.8.1

### Notable change

* p.html: InputMode選択のメニューを追加します

### BugFix

* akari: 正解判定ボタンを押した後照明が照らしているセルの情報が消えてしまう不具合を修正
* kinkonkan: Opera12.17でキンコンカンのファイル出力がただしくなくなる不具合を修正
* listener: Alt+Cでモードを切り替えた時にMenuなどが切り替わらない不具合を修正

## Version 3.6.7-rc

Release date: 2017/2/9

pzpr.js version: v0.8.0

### BugFix

* slalom: 旗門の数字がうまく再生成できないことがあるのを修正

## Version 3.6.7-beta2

Release date: 2017/1/9

pzpr.js version: v0.8.0-beta2

### New puzzle

* ★ビルディングパズル、Kropki、スターバトル、ABCプレースを追加しました

### Notable change

* menuconfig: デフォルトのサイズを大きくしました

## Version 3.6.7-beta1

Release date: 2016/12/31

pzpr.js version: v0.8.0-beta1

### Notable change

* Board: いくつかの数字を入力するパズルで四隅に保持数字を入力できるようにしました

### Improvement

* bosanowa: 問題入力時、BSキーやスペースキーで円を消せるよう変更
* gokigen: ドラッグ入力で斜線の入力ができるようにしました
* norinori: ドラッグで黒マスを2つ入力したらそれ以上入力しないように動作変更

### Minor Changes

* Config: 左右入力判定設定を削除

## Version 3.6.6

Release date: 2016/12/4

pzpr.js version: v0.7.1

### BugFix

* LineManager: ごきげんななめのループ判定計算ができなくなることがあるバグを修正
* onsen: 単独の○が残っていても正解と判定してしまうバグを修正

## Version 3.6.5

Release date: 2016/10/10

pzpr.js version: v0.7.0

### New puzzle

* ★温泉めぐりを追加しました

### Improvement

* moonsun: スマホ・タブレットで×印を入力できるように修正
* shugaku: スマホ・タブレットで黒マスを入力できるように修正
* kakuru: スマホ・タブレットで問題の黒マスを入力できるように修正
* hakoiri: ドラッグでドットを入力できるように修正
* hebi: ドラッグでドットを入力できるように修正
* tatamibari: あみぼーと同じように問題の記号を入力できるように修正
* amibo: スマホ・タブレットで補助記号を入力できるように修正
* bag: bgcolor設定値に関わらず背景色を入力できるように修正
* Graph: 入力時に不必要な場合部屋・黒マス情報などを再生成しないように修正

### BugFix

* tilepaint: 設定値によって黒マスが入力できないことがあったのを修正
* boot: 一度パズルが読み込まれた後はfailOpen関数を呼び出さないように修正
* p.html: 黒マスの色分けにつけたキャプションを変更

### Minor Changes

* Boot: dev.pzv.jpでもアクセスログを取得できるようコードを修正
* PopupMenu: 盤面サイズをフォームに反映する初期化ルーチンを整理
* PopupMenu: ポップアップ表示時の内容初期化メソッドをinit/reset/showの3つに分離
* Misc: data-disp-pid属性をもとに要素の表示を切り替えるdisplayByPid関数をui.miscへ移動
* menuarea: スマートフォンでのポップアップメニュー表示位置を修正
* tests: All Testの呼び出し元をmenuからcredit表示に移動
* Graphic: いくつかのパズルのドット色を黒ではなく緑色に変更
* variety: いくつかのパズルの英語名を変更
* stostone: 落とした黒マスの位置を記憶して再計算しないよう修正
* stostone: 黒マスを落とした時に背景の数字を隠すよう修正
* stostone: 黒マス色分けがエラーになるのを修正　
* hebi: へびいちごのURL名をsnakesからhebiに修正
* Graph: いくつか部屋・黒マス情報などの生成にあった不具合を修正

## Version 3.6.4

Release date: 2016/9/19

pzpr.js version: v0.6.1

### New puzzle

* ★ストストーンを追加しました

### Improvement

* menuarea, toolarea: スラロームの旗門上数字表示用ボタン/メニューを追加
* Config: しろまるくろまるの問題へ背景色を描画するかどうかのconfigを追加
* hanare: 部屋に数字を一つだけ入力するかどうか設定するconfigを追加
* shugaku: 布団も通路もないセルの背景色をグレーにするかどうかのconfigを追加
* toichika, hanare: 背景色を自動でつけるautocmp configを有効化
* Graph: ストストーンの黒マス色分けを行う'irowakeblk' configを有効化
* variety: cave, rome, bossanovaをそれぞれBAG, ろーま, ボサノワの別名に追加

### BugFix

* p.html: autocmp関連で抜けているキャプションを追加
* variety, Answer: Divideのスペルミスを修正
* yinyang: しろまるくろまるで補助記号消去のボタンを表示しないよう変更
* Config: "passallcell"のコンフィグが誤って全パズル有効になっているのを変更
* shimaguni, stostone: いくつかの正答判定系ルーチンをLITSを共通化

### Minor changes

* プロジェクトのURLをBitbucketからGithubに変更
* docs: ドキュメントフォルダに日本語を追加しフォルダ構成を変更
* arukone: エラー時の背景描画範囲を修正
* Graphic: 色分け無効時の仮置きモードで線の太さを変更しないように修正
* moonsun: 月か太陽の英語名を'Moon or Sun'に変更
* Graphic: 境界線と黒マス間に描画する線を少し明るくしました
* Graphic: 外枠の描画位置を少し内側に修正しました
* Graphic: 描画色設定ルーチンを共通化
* Graphic: 回答の黒マス描画ルーチンを従来のdrawBGCells、drawQuesCellsと分離
* KeyInput: スラロームとストストーンで使うためxキーを押した時の情報表示ルーチンkeyDispInfoを作成
* slalom: board.operate関数に数字を旗門上に表示するためshow/hidegatenumberを追加
* norinori: 不要な黒マス管理オブジェクトを生成しないよう修正

## Version 3.6.3

Release date: 2016/8/11

pzpr.js version: v0.5.0

### New puzzle

* ★アルコネ、しろまるくろまる、ノンダンゴ、月か太陽を追加しました

### BugFix

* Opeartion: 仮置き破棄時に仮置き直前の入力データまで消してしまうことがあるのを修正
* usoone, kurochute: "One Button"入力時(スマホ/タブレットのデフォルト)に補助記号の入力ができなくなっているのを修正

## Version 3.6.2

Release date: 2016/8/05

pzpr.js version: v0.4.0

### New puzzle

* usoone: ★ウソワンを追加しました

### Improvement

* puzzle, history: 仮置きモードを追加しました
* opemgr: ファイル保存後にタブを閉じた時ダイアログを開かないように変更
* env: Safariなどでスクリプトを開いた時にDataBase領域要求のダイアログが出ないように修正
* html: js, cssファイルにバージョンを付加してバージョンアップ時に再読み込みされるようにします

### BugFix

* lits: テトロミノの形の判定が間違ってしまうのを修正
* fillomino: 誤って削除されたままになっていた全マス数字なしで正解判定するかどうかのオプションを復活
* pipelink: 記号が繋がった時に線が分断されている判定になってしまうのを修正
* parser: twitter短縮URL対策で、URLの末尾がa-z, A-Z or 0-9以外の時末尾に/を付加するよう修正
* Operation: パズルデータが更新されたかどうかの判定に不具合があったので修正
* Operation: ファイルの履歴データが空の時にファイルの読み込みに失敗するのを修正
* iOS 5.1で未サポートのFinction#bindを使用していた箇所を修正

## Version 3.6.1

Release date: 2016/3/03

### Improvement

* candle: SVG画像出力時に余分なid属性を出力しないように変更
* PopupMenu: 画像出力時に背景を透明にできるオプションを追加
* PopupMenu: 背景色の指定ができるようにしました
* Graphic: 矢印つき数字の矢印描画ルーチンを修正して綺麗に描画できるよう変更
* Graphic: 氷のセルがエラーになった時の描画色を変更
* yajilin: 矢印つき数字などの背景色をグレーにするオプションを追加 (The Art of Puzzle等の盤面タイプ)

### BugFix

* box: 数字を変更した際に前の数字が残ったまま上書きしてしまう不具合を修正
* Graphic: SVG以外の形式での画像出力時に背景色が描画されず透明になってしまう不具合を修正
* shwolf: 最初の描画時にヤギとオオカミの画像が描画されないことがあるのを修正
* Key: スラローム等でキーボードから矢印を入力した場合に数字ごと消えてしまうことがある不具合を修正
* PopupMenu: 誤って未サポートの画像形式を一覧に載せてしまう不具合を修正
* PopupMenu: IE, Edgeで画像を別タブで開くが動作しないので以前の直接DataURLを開かないルーチンを再実装

### Minor changes

* Config: lrcheck, redblk, redline, redheadの各オプションが保存されないようにしました

## Version 3.6.0-patch2

Release : 2016/02/16

### BugFix

* slalom: 旗門の数字生成ルーチンに存在したバグを修正
* slalom: 線の順番探索ルーチンで逆向きに探索していたと気付いた時誤って探索を打ち切る不具合を修正
* slalom: 丸から線が出ていない正答判定エラー時の英語テキストを修正

## Version 3.6.0-patch1

Release : 2016/02/14

### BugFix

* boot: URLを開いた時に誤ってエディタモードで開いてしまう不具合を修正

## Version 3.6.0

Release : 2016/02/13

### Breaking Changes

* project: IE8以下の対応ルーチンを削除 (Android 2.3/3.0, iOS 5.0, Safari 5.0までも完全に非対応となります)
* Encode, parser: ぱずぷれアプレット用URL出力処理を削除

### Improvement

* gokigen: ごきげんななめのLoop判定をLineManager利用に変更し、斜線を色分けできるように変更
* dosufuwa: 風船/鉄球のドラッグ入力および部屋のautocmp表示に対応
* Mouse: マウスが盤面外にいる間にボタンが離れた場合マウスイベントを継続しないよう変更
* Key: BackSpaceキーで最後の一文字を削除した時に？に遷移しないように変更
* Answer: 盤面に何も入力されていない場合にデフォルトでは正解と判定しないように変更
* nagare: 流れるループで"両側から風が吹いている"状態をエラーにしないよう変更
* ui.popupmenu: gif, jpegなどの形式でも画像を保存できるようにします
* index: index_en.htmlをindex.htmlに統合して、リンクの生成方法、タブなどのデザインを変更
* index: 言語設定をindex.htmlとぱずぷれの盤面編集で共通化
* index, boot: パズルのエディタを開いた履歴や回数を保存して表示します

### BugFix

* Encode: 意図せず長いURLが入力されてもスクリプトエラーにならないように修正
* kouchoku: 色分け設定でのcanvasモード描画やcanvas未設定時にエラーするのを修正
* yajitatami: 回転・反転時に矢印の向きを変え忘れていた不具合を修正
* kinkonkan: キンコンカンで回転反転時に盤面外の数字が追従していなかったのを修正
* tawa: たわむれんがで上下反転が正しく動作していない不具合を修正
* heyawake: へやわけアプレットのURLを正しく解析できない不具合を修正
* factors: 問題作成モードで正答判定した場合に時間がかかるのを修正
* Graphic: AndroidのChromeでのフォント表示を修正
* ui.event: AndroidのChromeで盤面外のフォントも修正
* ui.event: スマホ/タブレットでエラー表示できなくなっている不具合を修正
* ui.menuconfig: getCurrentConfigList()関数がエラーにならないよう修正

### Internal Changes

* project: pzpr.jsとpzprv3-ui.jsを再分離しました
* ui.popupmenu: creditにpzpr.jsとpzprv3-ui.jsのバージョンを併記します
* ui: ui.versionにpzprv3-uiのバージョン情報を付加します
* ui: localStoarge, sessionStorageの存在判定箇所を削除
* ui.menuconfig: 設定値を管理するオブジェクトの違いをmenuconfigで管理するように変更
* ui.menuconfig: 盤面へのキー入力オプションを削除
* ui.menuconfig: toolarea設定値をboolean型に変更
* p.html: XML形式の閉じタグをHTML形式に修正
* project: sourceMapを生成するかどうかの判定部を修正
* project: 画像をDataURL化してsrc/img下のファイルを削除
