
# ReleaseNote

## Version 3.6.3-rc1

Release date: 2016/8/11

pzpr.js version: v0.5.0

### New puzzle

* ★アルコネ、しろまるくろまる、ノンダンゴ、月か太陽を追加しました

### BugFix

* Opeartion: 仮置き破棄時に仮置き直前の入力データまで消してしまうことがあるのを修正
* usoone, kurochute: Fix aux. mark on numbers can't be inputted when one button input is selected


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
