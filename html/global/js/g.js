const debug = true;
// ojo3liblary
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/Method_definitions#generator_methods
(function ($) {
	const pattern = /(?<tag>^[^\.# ]+)?(?<attr>[\.#]\S+)?/u;
	const r0 = /^\s*/g;
	const r1 = /\s*$/;
	const r2 = /^\s*|\s*$/;
	const r3 = /^[\d\.]+$/g;
	const r4 = /^<.*>/i;
	const r5 = /[\.\#]/g;
	$.fn.extend({
		href: function ()
		{
			let a = $(this).find('a');
			if (a.length == 0)
				return null;

			return a[0].href;
		},
		setcenter: function ()
		{
			let p = $(this);
			let left = p.getCenterX(window);
			let top = p.getCenterY(window);
			p.setcss({ left: left, top: top });
			return this;
		},
		create: function (selector)
		{
			let parent = $(this);
			const defaultnode = $('<div />');

			if (parent.length == 0)
				return this;

			if (selector == null)
				return defaultnode.appendTo(parent);

			if (typeof selector === 'object')
			{
				if (selector.length == 0)
					return defaultnode.appendTo(parent);

				// 最後の要素をcloneして追加
				let node = selector.last().clone().appendTo(parent);
				return node;
			}

			// htmlの場合は追加して返す
			if (selector.match(r4))
				return $(selector).appendTo(parent);

			// セレクタからhtmlを取得
			let nodes = selector.split(' ');
			let node = null;

			for (let i = 0; i < nodes.length; i++)
			{
				if (nodes[i] == '')
					continue;

				let match = nodes[i].match(pattern);
				let attr  = match.groups.attr;
				let tag   = match.groups.tag;
				let name  = null;

				if (attr != null)
				{
					name = attr.replace(r5, '');
					attr = attr.startsWith('#') ? 'id' : attr.startsWith('.') ? 'class' : null;
				}

				tag = match.groups.tag != null ? match.groups.tag : 'div';

				// console.log(tag, attr, name);

				if (isEnableElement(tag))
				{
					node = (i == 0) ? $('<' + tag + ' />').appendTo(parent) : $('<' + tag + ' />').appendTo(node);
					if (attr != null)
						node.attr(attr, name);
				}
			}

			// ノードがnullの場合はカラのdivを返す
			if (node === null)
				return defaultnode.appendTo(parent);

			// 追加したノードを返す
			return node;
		},
		setcss: function (options)
		{
			if (arguments.length == 0)
				return this;

			options = arguments.length > 1 ? Array.from(arguments).slice(0, 2).join(':') : options;

			return this.each(function ()
			{
				let css = $.fn.parsecss(options);
				if (Object.keys(css).length == 0)
					return this;
				// console.log(css, $(this));
				$(this).css(css);
			});
		},
		parsecss: function (options)
		{
			if (typeof options === 'object' || arguments.length == 0)
				return options;

			let css = {};

			for (const key in match = options.split(';'))
			{
				let item = match[key].replace(r0, '').split(':');

				if (match[key] === '' || item.length < 2)
					continue;

				let prop = item[0].replace(r1, '');
				let value = item[1].replace(r2, '');
				css[prop] = (value.match(r3) !== null) ? parseFloat(value) : value;
			}
			return css;
		},
		getCenterX: function (baseelement) {
			return ((($(baseelement).width() - $(this).outerWidth()) / 2) / $(baseelement).width() * 100) + '%';
		},
		getCenterY: function (baseelement) {
			return ((($(baseelement).height() - $(this).outerHeight()) / 2) / $(baseelement).height() * 100) + '%';
		},
		debug: function () {
			this.each(function () {
				console.log($(this));
			})
		},
	});
})(jQuery);

function trim(string)
{
	return string.replace(/(\r?\n)+$/g, '');
}

function nbr(string)
{
	return string.replace(/(\r\n)+/g, '').replace(/\n/g, '<br />');
}

function htmlspecialchars(params)
{
	return params.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace('\'', '&#039;');
	// return $('<div/>').html(params).text();
}

function str_shuffle(string)
{
	let obj = {};
	// 文字列を文字数分繰り返す
	for (let i = 0; i < string.length; i++)
	{
		// let rand = Math.floor(Math.random() * string.length);
		let rand = Math.floor(Math.random() * 1000000000);
		if (obj[rand] == undefined) obj[rand] = string[i];
		else i--;
	}
	// 0.8172105996252195
	// valueのみを連結
	return Object.values(obj).join('');
}

function isEnableElement(tag)
{
	try
	{
		let el = document.createElement(tag);
		// console.log(el.constructor);
		return el.constructor != HTMLUnknownElement;
	}
	catch (error)
	{
		return false;
	}
}

function getMimeType(contentType)
{
	let r = new RegExp(/^.*\/(?<type>\S*)/gi)
	let result = r.exec(contentType.split(';')[0]);
	console.log(result);
	return result.groups.type;
}

function copy_value(value, position)
{
	Toast.clear('.toast');
	let toast = new Toast();

	if (value == null || value == '')
	{
		toast.show('コピーする値がありません.', position);
		return;
	}

	let e_tmp = $('body').create('input#_copyvalue');

	e_tmp.val(value);
	e_tmp.select();

	// navigator.clipboardは、
	// https（セキュア）環境でないとundefinedを返す
	document.execCommand('copy');

	e_tmp.remove();

	toast.show(value, position);
}

function httpRequest(url = null, params = null, func = null)
{
	Toast.clear();
	let h = new Http();
	let r = h.json(url, params, '#container', func);
	return false;
}

function preview(file, obj) {
	//画像でない場合は処理終了
	if (!file.type.match(/^image.*/i))
		return;

	let image = null;
	let reader = new FileReader();
	reader.readAsDataURL(file);

	// ファイルオブジェクトを取得する
	reader.onloadend = function () {
		image = obj.create('img').attr({ id: Date.now(), class: 'thumnail', src: reader.result });
		// console.log(reader);
		image.setcss('display: inline-block; margin: 5px; width: 20%; overflow: hidden; border: #4789B3 solid 2px;');
	}
}

function get_byte_size(num) {
	var unit = 'Kb';

	if (num == 0) return num + unit;

	num /= 1024;

	if (num > 1024) {
		num /= 1024;
		unit = 'Mb';
	}
	if (num > 1024) {
		num /= 1024;
		unit = 'Gb';
	}
	if (num > 1024) {
		num /= 1024;
		unit = 'Tb';
	}

	return Math.floor(num * 8) / 8 + unit;
}

function show(mess)
{
	Toast.clear();
	let t = new Toast();
		t.show(mess);
	return false;
}

function screen(selector, include = true)
{
	let defaultSelector = '#layer';
	// let height = selector == null ? '100vh' : $(document).height() + 'px';
	let height = selector == '#loading' ? '100%' : $(document).height() + 'px';

	// top: ${ window.pageYOffset };
	let css = `
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: ${height};
		white-space: nowrap;
		opacity: 0.5;
		overflow: hidden;
		background: #000;
	`;

	// ajax通信のとき
	if (selector == '#loading')
	{
		$('body').create(selector).setcss(css).setcss(`
			z-index: 1;
			top: ${ window.pageYOffset };
			background-image: url('/global/images/loading.svg?${Date.now()}');
			background-repeat: no-repeat;
			background-position: center center;
		`);
	}
	// 通常モーダル
	else
	{
		let layer = $('body').create(defaultSelector).setcss(css);
		$('#container').setcss('filter: blur(10px)');
		scrolldeny();
	}

	let selectors = selector != '#loading' ? [defaultSelector, selector].join(', ') : defaultSelector;
	let clickers = include ? selectors : defaultSelector;

	$(clickers).click(function (evt)
	{
		$(selectors).animate({ 'opacity': 0 }, 250, function ()
		{
			$(this).remove();
			$('#container').css({ 'filter': 'none' });
			scrolldeny(false);
		});
	});
}

function deny(evt)
{
	// console.log($(evt.target));
	// if ($(evt.target).attr('id') != 'window')
	// evt.preventDefault();
}

function scrolldeny(reg = true)
{
	if (reg)
	{
		document.addEventListener('mousewheel', deny, { passive: false });
		document.addEventListener('touchmove', deny, { passive: false });
	}
	else
	{
		document.removeEventListener('mousewheel', deny);
		document.removeEventListener('touchmove', deny);
	}
};

const PassWord = (function ()
{
	const _passwordLength = 8;

	function PassWord()
	{
	}

	PassWord.defaultLength = 8;
	PassWord.make = function (length = _passwordLength, strength = false)
	{
		let text = '1234567890abcdefghijklmnopqrstuvwxyz';
		if (strength) {
			text += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			text += '!#$%()*+-/:;=?@[]_{|}<>&';
		}
		let pw = str_shuffle(text).substring(0, length);

		// console.log(length, pw, text);
		// valueのみを連結
		return htmlspecialchars(pw);
	}

	return PassWord;
})();

const Http = (function ()
{
	let _isFileUpload;
	let _progressObj;
	let _progressCount;
	let _self;
	let _isProgress;
	let _isFade;
	let jqxhr;

	function Http()
	{
		// this.domain      = location.host;
		// this.directory   = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
		// this.pagename    = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
		this.url       = location.href;
		this.method    = 'GET';
		this.params    = null;

		_isFileUpload  = false;
		_progressCount = 0;
		_self          = this;
		_isProgress    = true;
		_isFade        = false;
		_scrollBody     = false;
		jqxhr          = null;

		// let events = $._data($(document).get(0), 'events');
		// 中止用キーイベント登録
		document.addEventListener('keydown', keyDownDelegate);
	}

	const NoticeDelegate = function (mess, sleep)
	{
		let toast = new Toast();
		if (sleep !== undefined)
			toast.sleep(5000);
		toast.show(mess, 'top');
	}

	const keyDownDelegate = function (event)
	{
		if (event.keyCode == 27)
		{
			_self.abort(true);
		}
	}

	Http.fn = Http.prototype = {
		constructor: Http,

		settings: function (options)
		{
			if (typeof options !== 'object')
			{
				return this;
			}

			for (key in options)
			{
				switch (key) {
					case 'scrollBody':
						_scrollBody = options[key];
						break;
					case 'progress':
						_isProgress = options[key];
						break;
					case 'fade':
						_isFade = options[key];
						break;
					case 'upload':
						_isFileUpload = options[key];
						break;
					default:
						break;
				}
			}

			return this;
		},

		ajax: function (obj, func = null)
		{
			if (jqxhr)
			{
				return jqxhr;
			}

			if (_isFade && obj.length > 0)
			{
				obj.hide();
			}

			// console.log($.ajaxSettings);

			const XHR = $.ajaxSettings.xhr();

			const upload = function (e) {
				// プログレス用divを追加
				if ($('#prog').length == 0) {
					$('body').create(`<progress value="50" id="prog" max="100"></progress>`)
						.setcss(`
						width: 100%;
						height: 20px;
						border-radius: 0;
						position: fixed;
						top: 0;
						left: 0;
						display: block;
						background-color: #1DA1F2;
					`);
					$('#pv').setcss('font-size: 1.8em');
				}

				let progress = parseInt(e.loaded / e.total * 100);
				$('#prog').val(progress);
			}

			const _xhr = function () {
				// upload用イベント
				if (_isFileUpload)
					XHR.upload.addEventListener('progress', upload);

				// ProgressEvent
				// readyStateイベント
				XHR.onreadystatechange = function () {
					switch (XHR.readyState) {
						// データ送信中.
						case 1:
							{
								if (debug)
									console.log(XHR.readyState + ') loading...' + XHR.responseText.length + ' bytes.');

								if (_isProgress)
									screen('#loading', false);
								break;
							}

						// 応答待ち.
						case 2:
							{
								if (debug)
									console.log(XHR.readyState + ') loaded. ' + XHR.responseText.length + ' bytes.');
								break;
							}

						// データ受信中.
						case 3:
							{
								if (debug)
									console.log(XHR.readyState + ') interactive... ' + XHR.responseText.length + ' bytes.');

								_progressCount++;

								if (_isProgress) {
									$('#progress').remove();
									$('#layer').remove();
									$('#loading').remove();
								}

								obj.html(XHR.responseText);

								let cc = obj != null ? obj != null : document.documentElement.scrollHeight > window.innerHeight;
								// Windowの高さを超えたら自動スクロール
								// if (_progressCount > 10 && document.documentElement.scrollHeight > window.innerHeight)
								if (_progressCount > 10 && cc) {
									// if (_scrollBody) window.scroll(0, document.documentElement.scrollHeight);
									// else if (obj != null) obj.animate({ scrollTop: obj.outerHeight() }, 'slow', 'swing');
									// else window.scroll(0, document.documentElement.scrollHeight);
									window.scroll(0, document.documentElement.scrollHeight);
								}

								break;
							}

						default:
							{
								if (debug)
									console.log(XHR.readyState + ') ' + XHR.responseText.length + ' bytes.');
							}
					}
				}

				return XHR;
			}

			let settings = {
				url : this.url,
				type: this.method,
				xhr : _xhr,
			}

			settings['data'] = this.params != null ? this.params : Date.now().toString();

			// ファイルアップロードのときは
			// contentType, processData = false
			if (_isFileUpload)
			{
				settings['contentType'] = false;
				settings['processData'] = false;
			}

			// settings['timeout'] = 30000;

			jqxhr = $.ajax(settings)
			.done(function (data, textStatus, jqXHR)
			{
				if (obj.length > 0)
				{
					if (jqXHR.status == 200 || jqXHR.status == 304)
					{
						if (_isFade)
							obj.fadeIn(1200);

						if (jqXHR.responseJSON !== undefined)
						{
							obj.html(Object.values(data));
						}
						else
						{
							obj.html(data);
						}
					}
					else
					{
						obj.html(`読み込めません. (${jqXHR.status})`);
					}
				}

				if (func != null)
				{
					func(data, textStatus, jqXHR);
				}
			})
			.fail(function (data, textStatus, jqXHR)
			{
				if (jqXHR !== 'abort')
				{
					// $('#container').setcss('filter: none');
					show('通信を中止しました.');
				}
				console.log(jqXHR)
			})
			.always(function ()
			{
				$('#prog').remove();
				if (_isProgress) $('#loading').remove();
				document.removeEventListener('keydown', keyDownDelegate);
				XHR.upload.removeEventListener('progress', upload);
			});

			return jqxhr;
		},
		
		get: function (path, params, selector, func)
		{
			if (path != null && path != undefined)
				this.url = path;

			this.params = params;
			return this.ajax($(selector), func);
		},

		post: function (path, params, selector, func)
		{
			this.method = 'POST';

			if (path != null && path != undefined)
				this.url = path;

			this.params = params;
			return this.ajax($(selector), func);
		},

		abort: function (stop = false)
		{
			if (jqxhr == null)
			{
				console.log('process is stoped.')
				return;
			}

			!stop ? stop = confirm('will you stop process?') : stop;

			if (stop)
			{
				jqxhr.abort();
				// キーイベント解除
				document.removeEventListener('keydown', keyDownDelegate);
				NoticeDelegate('リクエストを中止しました.', 5000);
			}

			// console.log(jqxhr);
			jqxhr = undefined;
		},

		json: function (path, params, selector, func)
		{
			let obj = $(selector);

			if (_isFade)
				obj.hide();

			const callback = function (json, textStatus, jqXHR)
			{
				if (jqXHR.responseJSON == undefined)
				{
					try
					{
						json = JSON.parse(json);
					}
					catch
					{
						obj.html(json);
					}
				}

				// console.log(json);
				if (json === null)
					return;

				// console.log(json);

				// selectorがnullの場合は
				// funcを実行して終わり
				if (selector == null)
				{
					if (func != null)
						func(json);
					return;
				}

				$('#source, .navi, .processtime, .debug').remove();

				if (_isFade)
					obj.fadeIn(2000);

				if (json.logs !== undefined)
				{
					let sbx = new SelectBox();
					sbx.makeFromJson('#Date', json.logs);
				}

				if (json.time !== undefined)
					obj.create('.processtime').html(json.time);

				if (json.debug !== undefined)
					obj.create('.debug').html(json.debug);

				if (json.navi !== undefined)
					obj.create('.navi').html(json.navi);

				// sourceはHTMLコード
				if (json.source !== undefined)
					obj.create('#source').html(json.source);

				if (json.info !== undefined)
					NoticeDelegate(json.info);

				if (json.count !== undefined && json.count > 0)
					NoticeDelegate(json.count + '件取得しました.');

				if (func != null)
					func(json);
			}

			return this.get(path, params, null, callback);
		},

		upload: function (path, key, tmpFiles, selector, fade = false)
		{
			if (tmpFiles === null || tmpFiles == undefined || tmpFiles.length == 0)
				return false;

			_isFileUpload = true;
			let fd = new FormData();

			for (let i = 0; i < tmpFiles.length; i++)
			{
				fd.append(key, tmpFiles[i]);
			}

			return this.post(path, fd, selector);
		},

		setProgress: function (selector)
		{
			_progressObj = $(selector);
		},
	};

	return Http;
})();

const Toast = (function ()
{
	const defaults = {
		type      : ['top', 'bottom'],
		position  : 'top',
		selector  : '.toast',
		offset    : 20,
		speed     : 300,
		sleep     : 2500,
		slide     : true,
		data_attr : 'data-toast',
		data_value: 'toast',
	};

	let _total_offset = 0
	let _zIndex       = 0;
	let _sleep;
	let _autoClose;
	let _id;
	let obj;
	let css = {};

	const defaultcss = () =>
	{
		return {
			'position': 'fixed',
			'display': 'inline-block',
			'padding': '10px 25px',
			'border-radius': '20px',
			'border': '2px solid #666',
			'box-shadow': '1px 1px 5px rgba(0, 0, 0, 0.2)',
			'opacity': '1',
		};
	}

	function Toast(selector = defaults.selector)
	{
		// 初期化
		this.slide    = true;
		this.selector = selector;
		_self         = this;
		_sleep        = defaults.sleep;
		_autoClose    = true;
		_id           = Date.now();
		obj           = $('body').create(this.selector);
		_zIndex++;
	}

	// private
	const _dispose = function ()
	{
		_zIndex       = 0;
		_total_offset = 0;
	}

	// static
	Toast.clear = function (selector)
	{
		// selectorの指定がない場合は、
		// 独自data-*属性を持った要素を全削除.
		selector = selector !== undefined ? selector : `[${defaults.data_attr}="${defaults.data_value}"]`;
		$(selector).remove();
		_dispose();
	}

	Toast.fn = Toast.prototype = {
		autoclose: function (value) {
			value = typeof value !== 'boolean' ? false : value;
			_autoClose = value;
			return this;
		},
		sleep: function (value) {
			value = typeof value !== 'number' ? defaults.sleep : value;
			_sleep = value;
			return this;
		},
		zindex: function (value) {
			value = typeof value !== 'number' ? 1 : value;
			_zIndex = value;
			return this;
		},
		show: function (message, position, offset, slide, callback)
		{
			if (message === undefined)
			{
				return;
			}
			// speed    = speed === undefined || speed === null ? defaults.speed : speed;
			position = position === undefined || position === null ? defaults.position : position;
			offset   = offset === undefined || offset === null ? defaults.offset : offset;
			slide    = slide === undefined || slide === null ? defaults.slide : slide;

			if ($.inArray(position, defaults.type) < 0)
			{
				console.log(position + ' はありません.');
				return;
			}

			offset = parseInt(offset);

			obj.attr(defaults.data_attr, defaults.data_value);
			obj.attr('id', _id);
			obj.html(htmlspecialchars(message));

			css = defaultcss();

			// 以後cssを順次書き換えていく
			// objに外部CSSで背景色プロパティが宣言されていない場合はあてる
			if (obj.css('background-color') === 'rgba(0, 0, 0, 0)')
			{
				css['background-color'] = 'rgba(0, 0, 0, 0.6)';
				css['color'] = 'rgb(255, 255, 255)';
			}

			css['zIndex'] = _zIndex;

			// 基本CSSをあてる
			obj.setcss(css);

			// 横位置を計算
			let leftpos = ($('body').width() - obj.outerWidth()) / 2;
			leftpos = (leftpos / $('body').width() * 100) + '%';

			// 開始位置をセット
			// slideがtrueならば高さマイナス位置から表示
			let start;
			if (slide)
			{
				start = -obj.outerHeight();
				// 総オフセット数
				// _total_offset += _zIndex > 1 ? obj.outerHeight() + offset : offset;
				// _total_offset += _zIndex > 1 ? obj.outerHeight() + offset : offset;
				_total_offset += offset;
			}
			// スライドしない場合はoffsetをセット
			else
			{
				start = offset;
				_total_offset = offset;
			}

			// _total_offset = offset;

			// アニメーション用CSS
			let set = {
				start: start,
				end  : _total_offset
			};

			// 次回呼ばれた際のためにtopオフセットを加算
			let height = _total_offset + obj.outerHeight() + offset < $(window).height() ? obj.outerHeight() : 0;
			if (slide) {
				// 総オフセット数
				_total_offset += height;
			}

			css['left'] = leftpos;

			// x軸の初期位置をセット
			css[position] = set.start;
			css['opacity'] = '0';
			obj.setcss(css);

			let speed = defaults.speed;
			// タイマーがすでに起動していたら遅延処理
			let delay = _zIndex < 10 && _zIndex > 1 ? _zIndex * speed : 0;

			// アニメーションでセットする値をセット
			css[position] = set.end;
			css['opacity'] = '1';
			obj.delay(delay).animate(css, speed, 'swing');

			obj.setcss({ cursor: 'pointer' });

			obj.click(function (evt) {
				if (callback != null)
					callback();
				_self.hide(this, speed);
			});

			let inter = setInterval(function (selector)
			{
				if ($(selector).length == 0)
				{
					clearInterval(inter);
					// console.log('clear.')
				}

				let top = parseInt($(selector).css('top'));

				if (top == offset)
				{
					return;
				}

				css = {};
				css[position] = offset;
				$(selector).animate(css, speed, 'swing');

				// console.log(offset, selector, $(selector));
			}, 1000, this.selector);

			if (_autoClose)
			{
				// delayが_sleepを超えたら
				// delayをタイマーインターバルにセット
				// let sleep = delay > _sleep ? delay : _sleep;
				let sleep = _sleep;

				let _timer = setTimeout(function ()
				{
					// 表示初期位置に戻す
					css['opacity'] = '0';
					css[position] = set.start;

					obj.delay(delay).animate(css, speed, 'swing', function () {
						clearTimeout(_timer);
						_self.hide(this, speed);
					});
				}, sleep);
			}
			else
			{
				$(window).on({
					resize: function ()
					{
						let leftpos = ($('body').width() - obj.outerWidth()) / 2;
						obj.setcss('left', leftpos);
					}
				});
			}

			return obj;
		},
		hide: function (selector, speed = defaults.speed)
		{
			$(selector).animate({ 'opacity': '0' }, speed, 'swing', function () {
				$(this).remove();
				_dispose();
			});
		}
	}

	return Toast;
})();

const Bio = (function ()
{
	function Bio()
	{
	}

	Bio.fn = Bio.prototype = {
		generateJson: function (b, t, sepa = '')
		{
			if (b == null)
			{
				b = this.getParams($('#birth'), sepa);
			}
			if (t == null)
			{
				t = this.getParams($('#today'), sepa);
			}
			let obj = { birthday: b, basedate: t };
			return JSON.stringify(obj);
		},

		getParams: function (obj, sepa = '')
		{
			let q = '';
			let items = obj.children();
			for (let i = 0; i < items.length; i++) {
				if (items[i].localName != 'select')
					continue;
				q += $(items[i]).val();
				if (i < items.length - 1)
					q += sepa;
			}
			return q;
		}
	}

	return Bio;
})();

const SelectBox = (function ()
{
	function SelectBox(append)
	{
		this.appendElement = append;
	}

	SelectBox.fn = SelectBox.prototype = {
		clone: function (element, newname, idx = 0)
		{
			if (this.appendElement === undefined)
				return;

			// elementをコピー
			let obj = $(element).clone();

			// IDを付与して追加
			obj.appendTo(this.appendElement).attr('id', newname);
			// 子要素すべての選択状態を解除
			obj.children().attr('selected', false);
			obj.children().eq(idx).attr('selected', true);
			return obj;
		},
		selected: function (element, newname)
		{
			if (this.appendElement == null)
				return;

			// 選択状態のインデックスを退避
			let idx = $(element + ' option[selected]').index();
			let sbx = this.clone(element, newname);
			sbx.children().slice(idx + 1).remove();
		},
		makeFromObject: function (element, data, selected)
		{
			let sbx = $(element);
			sbx.empty();
			for (let [key, value] of Object.entries(data))
			{
				let option = $('<option id="' + key + '" value="' + key + '">' + value + '</option>');
				option.appendTo(sbx);
				if (value == selected)
					option.attr('selected', true)
			}
		},
		makeFromJson: function (element, json)
		{
			this.makeFromObject(element, JSON.parse(json), $(element).val());
		},
	}

	return SelectBox;
})();

const Scroll = (function ()
{
	let _timer;
	let _self;

	function Scroll()
	{
		this.test = 0;
	}

	Scroll.Bottom = function (e)
	{
		let start = 0;
		let bottom = document.documentElement.scrollHeight;
		_timer = setInterval(function ()
		{
			if (start >= bottom)
			{
				clearInterval(_timer);
				console.log('タイマーおわり.');
			}
			start += 10;
			window.scroll(0, start);
			// console.log(document.documentElement.scrollHeight, window.innerHeight);
		}, 100);
	}

	return Scroll;
})();

const Task = (function ()
{
	function Task()
	{

	}
	Task.Delay = function (func, interval = 1000)
	{
		let _timer = setTimeout(func, interval);
	}

	return Task;
})();

// 変数の中にクラスを定義し、
// 変数を関数として呼ぶことでコンストラクタとしている...?
// var cat = function() {}
// var test = new cat();
// console.log(test);
