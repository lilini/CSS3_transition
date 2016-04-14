//**判断浏览器是否支持某CSS3属性
var supportCss3 = function(style){
	var prefix = ['webkit', 'Moz', 'ms', 'o'];
	var attList = [];
	var htmlStyle = document.documentElement.style;
	var _toHumb = function (string) {
			return string.replace(/-(\w)/g, function ($0, $1) {
				return $1.toUpperCase();
			});
		};
	for (var pre in prefix)
		attList.push(_toHumb(prefix[pre] + '-' + style));
	attList.push(_toHumb(style));
	for (var attr in attList)
		if (attList[attr] in htmlStyle) return true;
	return false;
};

//**获取元素到窗口顶端的
var GT = function(o){T=o.offsetTop;if(o.offsetParent!=null)T+=GT(o.offsetParent);return T;};

//**获取元素到窗口左侧的距离
var GL = function(o){L =o.offsetLeft;if(o.offsetParent!=null)L+=GL(o.offsetParent);return L;};

//**绑定/解除绑定事件通用函数
var EventUtil = {
	addHandler: function(event,element,handler){
		if(element.addEventListener){
			element.addEventListener(event,handler,false);
		}else{
			if(element.attachEvent){
				element.attachEvent("on"+event,handler);
			}else{
				element["on"+event] = handler;
			}
		}
	},
	removeHandler: function (event,element,handler) {
		if(element.removeEventListener){
			element.removeEventListener(event,handler,false);
		}else{
			if(element.detachEvent){
				element.detachEvent("on"+event,handler);
			}else{
				element["on"+event] = null;
			}
		}
	}
};

//**通过id获取dom元素
var dom = function(s){
	return document.getElementById(s);
};

window.onload=function() {
	var mainWidth = 0;   	//速度函数曲线图的宽度
	var ctx;
	var bezierOutput;		//输出的cubic-Bezier函数
	var Output;
	var car = dom("car");
	var car_linear = dom("car-linear");
	var time = dom("time");
	var canvas = dom("canvas");
	var control_1=dom("bezier-control-1");
	var control_2=dom("bezier-control-2");

	if (supportCss3("transition")) {
		mainWidth = dom("curve-creator").offsetWidth;  //获取曲线图的宽度
		console.log(mainWidth);
		draw(mainWidth * 0.75, mainWidth * 0.75, mainWidth * 0.25, mainWidth * 0.25);	//画出初始图像

		// 拖拽控制
		function handler() {
		var me = this;
		function drag(event){
			var x = event.pageX, y = event.pageY, left = GT(canvas), top = GL(canvas);
			if (x === 0 && y == 0) {
				return;
			}
			//限制控制轴的范围
			x = Math.min(Math.max(left, x - 150), left + canvas.offsetWidth-33);
			y = Math.min(Math.max(top, y + 116), top + canvas.offsetHeight-33);
			me.style.top=y - top + 'px';
			me.style.left=x - left + 'px';
			console.log("top"+top,"y"+y);
			draw(control_1.offsetLeft + 16, control_1.offsetTop + 16, control_2.offsetLeft + 16, control_2.offsetTop + 16);; //更新图像
		}
		EventUtil.addHandler("mousemove",document,drag);
		EventUtil.addHandler("mouseup",document,up);
		function up() {
			me.focus();
			EventUtil.removeHandler("mousemove",document,drag);
			EventUtil.removeHandler("mouseup",document,up);
		}
		};
		EventUtil.addHandler("mousedown",control_1,handler);
		EventUtil.addHandler("mousedown",control_2,handler);

		// 时间滑块控制
		/*
		EventUtil.addHandler("change",dom("slider"),function(){
			document.getElementsByClassName("time")[0].innerHTML = this.value;
		});
		*/
	} else {
		dom("container").innerHTML="对不起您使用的浏览器版本太低，无法正常访问！请使用IE10,火狐5以上浏览器";
	}

	//画出控制杆
	function drawLine(x, y, start) {
		ctx.strokeStyle = "#4C4C4B"
		ctx.lineWidth = 4;
		ctx.beginPath();
		if ( start ) {
			ctx.moveTo(mainWidth, 0);
		} else {
			ctx.moveTo(0, mainWidth);
		}
		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.closePath();
	}

	//画出cubic-Bezier曲线
	function drawBezier(target, pos, lineWidth, width) {
		target.strokeStyle = '#000000';
		target.lineWidth = lineWidth;
		target.beginPath();
		target.moveTo(0, width);
		target.bezierCurveTo(pos.x1, pos.y1, pos.x2, pos.y2, width , 0);
		target.stroke();
		target.closePath();
	}

	//画出曲线图
	function draw(x1, y1, x2, y2) {
		if ( canvas.getContext ) {
			ctx = canvas.getContext("2d");
			canvas.width = canvas.width;
			// 画出控制杆
			drawLine(x1, y1);
			drawLine(x2, y2, true);
			// 画出cubic-Bezier曲线
			drawBezier(ctx, {x1: x1, y1: y1, x2: x2, y2: y2}, 7, mainWidth);
		}
		// 计算cubic-Bezier函数的参数n
		x1 = x1/mainWidth;
		y1 = 1-y1/mainWidth;
		x2 = x2/mainWidth;
		y2 = 1-y2/mainWidth;
		//显示cubic-Bezier函数
		bezierOutput = 'cubic-bezier(' + x1.toFixed(2) + ', ' + y1.toFixed(2) + ', ' + x2.toFixed(2) + ', ' + y2.toFixed(2) + ')';
		document.getElementById("output").innerHTML = bezierOutput;
	}
	//生成代码
	EventUtil.addHandler("click",dom("createCode"),function(){
		Output = ' all ' + time.value + 's ' + bezierOutput;
		document.getElementById("webkit_code").innerHTML = "-webkit-transition:" + Output + ";";
		document.getElementById("moz_code").innerHTML = "-moz-transition:" + Output + ";";
		document.getElementById("o_code").innerHTML = "-o-transition:" + Output + ";";
		document.getElementById("normal_code").innerHTML = "transition:" + Output + ";";
	});
	//启动演示滑块
	EventUtil.addHandler("click",dom("run"),function(){
		Output = ' all ' + time.value + 's ' + bezierOutput;
		//设置演示滑块属性
		var pre = ['-webkit-transition','', '-moz-transition','-o-transition', 'transition'];
		var s = "all " + time.value + "s linear";
		for(var i=0;i<pre.length;i++){
			car.style[pre[i]] = Output;
			car_linear.style[pre[i]] = s;
			console.log(car_linear.style[pre[i]]);
		}
		if(car.offsetLeft=="5"){
			car.style.left = "401px";
			car_linear.style.left = "401px";
		}else{
			car.style.left = "5px";
			car_linear.style.left = "5px";
		}
	});
};
