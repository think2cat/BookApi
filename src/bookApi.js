/**
 * 电子书API
 * @author Gavin
 * @ceateDate 2011-09-28 18:22
 */
//(function() {

var BOOKApi = function() {
	this.baseUrl = "";
	this.title = "";
	this.author = "";
	this.intro = "";
	this._sectionArr = [];
	this._contentArr = [];
	this._sectionNow = 0;
	this.lastAjax = {};
	this.global_localstroage = window.localStorage && /.*Android.*/i.test(navigator.userAgent);
};
BOOKApi.prototype = {
	/**
	 * 初始化电子书
	 * @param {string} index 电子书索引文件名，可带路径，为html页面相对路径
	 * @example
	 * init("abc.txt")
	 * init("book/abc.txt")
	 * init("http://www.abc.com/abc.txt");
	 * @return {boolean}初始化结果
	 */
	init : function(filename) {
		//console.log("BOOK > init():" + filename);
		var that = this;
		this.lastAjax = $.ajax({
			'url' : filename,
			'dataType' : 'json',
			'success' : function(_data) {
				_data['path'] && (that.baseUrl = _data['path']);
				_data['title'] && (that.title = _data['title']);
				_data['author'] && (that.author = _data['author']);
				_data['intro'] && (that.intro = _data['intro']);
				_data['content'] && (that._sectionArr = _data['content']);
				that.onInit(true, _data);
			},
			'error' : function() {
				that.onInit(false);
			}
		});
	},
	/**
	 * 初始化索引文件时回调函数
	 * 该函数需由外部重写
	 * @param {boolean}_b 成功访返回true，失败返回false
	 * @param {Object}成功返回JSON对象数据，失败时不返回
	 */
	onInit : function(_b, _data) {
	},
	/**
	 * 根据文件名拼出完整url，方便读取数据
	 * @param {string}fName 传入资源文件名
	 * @return {string}返回完整url，可能是http也可能file协议
	 */
	getUrlByFilename : function(fName) {
		//console.log("BOOK > getUrlByFilename():" + fName);
		if(fName == "") {
			return "";
		} else {
			if(fName.indexOf("://") > 0) {
				return fName;
			} else {
				return this.baseUrl + fName;
			}
		}
	},
	/**
	 * 获取章节数
	 * @return {int}章节数量
	 */
	getSectionNum : function() {
		return this._sectionArr.length;
	},
	/**
	 * 获取某章节内容
	 * @param {int}n	第几章节，0=第一章
	 * @return {string}内容，如果无此章节则返回空字符串
	 */
	getContentBySection : function(n) {
		if(n >= 0 && n < this._sectionArr.length) {
			this._sectionNow = n;
			if( typeof (this._contentArr[n]) != "undefined") {
				this.onGetContent(true, this._sectionNow, this._contentArr[n]);
			} else {
				//如果还未载入该章节
				var url = this.getUrlByFilename(this._sectionArr[n].file);
				var that = this;
				this.lastAjax = $.ajax({
					'url' : url,
					'dataType' : 'json',
					'success' : function(_data) {
						if(!$.isArray(_data)) {
							_data = [_data];
						}
						for(var i = 0; i < _data.length; i++) {
							for(var j = 0; j < that._sectionArr.length; j++) {
								if(_data[i]['section'] == that._sectionArr[j].name) {
									that._contentArr[j] = _data[i].text;
								}
							}
						}
						that.onGetContent(true, that._sectionNow, that._contentArr[that._sectionNow]);
					},
					'error' : function(a, b) {
						that.onGetContent(false);
					}
				});
			}
		} else {
			this.onGetContent(false);
		}
	},
	/**
	 * 获取某章节内容的回调函数
	 * 该函数需由外部重写
	 * @param {boolean}_b 成功访返回true，失败返回false
	 * @param {int}_a 成功访返回章节索引（0=第一章），失败时不返回
	 * @param {Object}_obj 成功返回JSON对象数据，失败时不返回
	 */
	onGetContent : function(_b, _a, _obj) {
	},
	/**
	 * 获取章节清单
	 * @return {array}章节清单
	 */
	getSectionList : function() {
		return this._sectionArr;
	},
	readCookie : function(name) {
		//console.log("readCookie()" + this.global_localstroage);
		if(this.global_localstroage) {
			//console.log("localStorage()" + unescape(window.localStorage.getItem(name)));
			if(window.localStorage.getItem(name)) {
				return unescape(window.localStorage.getItem(name));
			}
		} else {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while(c.charAt(0) == ' ') {
					c = c.substring(1, c.length);
				}
				if(c.indexOf(nameEQ) == 0) {
					//console.log("cookie()" + unescape(c.substring(nameEQ.length, c.length)));
					return unescape(c.substring(nameEQ.length, c.length));
				}
			}
		}
		return null;
	},
	eraseCookie : function(name) {
		if(this.global_localstroage) {
			window.localStorage.removeItem(name);
		} else {
			this.createCookie(name, "", -1);
		}
	},
	createCookie : function(name, value) {
		if($.isArray(value) || typeof (value) == "object") {
			try {
				value = JSON.stringify(value);
			} catch(e) {
			}
		}
		// alert(value);
		if(this.global_localstroage) {
			//console.log("createCookie() localStorage:" + value);
			window.localStorage.setItem(name, escape(value));
		} else {
			var days = 365;
			var expires = "";
			if(days) {
				var date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				var expires = "; expires=" + date.toGMTString();
			}
			//console.log("createCookie() cookie:" + name + "=" + escape(value) + expires + "");
			document.cookie = name + "=" + escape(value) + expires + "";
		}
	}
}
//})()
