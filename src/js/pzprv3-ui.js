/* eslint-env node */

exports.files = [
	"common/intro",
	"ui/Boot",
	"ui/UI",
	"ui/Event",
	"ui/Listener",
	"ui/MenuConfig",
	"ui/Misc",
	"ui/MenuArea",
	"ui/PopupMenu",
	"ui/ToolArea",
	"ui/Notify",
	"ui/KeyPopup",
	"ui/DataBase",
	"ui/Timer",
	"ui/Debug",
	"common/outro"
].map(function(mod){ return "src/js/"+mod+".js";});
