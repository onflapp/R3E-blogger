ImageCropper = {
		CROP_EVT_MOVE:"mousemove",
		CROP_EVT_DOWN:"mousedown",
		CROP_EVT_UP:"mouseup",

		crop_event: {},
		_crop_eventInfo:function(evt) {
			if (evt.targetTouches) {
				var t = evt.targetTouches[0];
				return {
					pageX:t.pageX,
					pageY:t.pageY
				};
			}
			else {
				return {
					pageX:evt.pageX,
					pageY:evt.pageY
				};
			}
		},
		_crop_unlock_body:function () {
			document.body.style.height = "";
			document.body.style.width = "";
		},

		_crop_lock_body:function () {
			var h = document.body.clientHeight;
			var w = document.body.clientWidth;
			document.body.style.height = h+"px";
			document.body.style.width = w+"px";
		},

		crop_move_content:function(evt) {
			var ei = ImageCropper._crop_eventInfo(evt);

			if (ImageCropper.crop_event.img && (evt.shiftKey || evt.altKey || evt.metaKey || evt.ctrlKey)) {
				var target = ImageCropper.crop_event.img;
				var dx = ei.pageX - ImageCropper.crop_event.x;
				var w = (ImageCropper.crop_event.iw + dx);
				var ow = target.width;
				if (w > 100) {
					if (w >= ImageCropper.crop_event.img.__cropframe.clientWidth) {
						target.width = w;
					}
					if (target.height < ImageCropper.crop_event.img.__cropframe.clientHeight) {
						target.width = ow;
					}
				}
			}
			else if (ImageCropper.crop_event.img) {
				var target = ImageCropper.crop_event.img;
				var dx = ei.pageX - ImageCropper.crop_event.x;
				var dy = ei.pageY - ImageCropper.crop_event.y;
				var l = ImageCropper.crop_event.l + dx;
				var t = ImageCropper.crop_event.t + dy;
				var w = ImageCropper.crop_event.w;
				var h = ImageCropper.crop_event.h;

				if (l > 1) l = 0;
				//if ((target.clientWidth + l) < w) l = w - target.clientWidth;
				
				if (t > 1) t = 0;
				//if ((target.clientHeight + t) < h) t = h- target.clientHeight;

				if (target.__cropbackground) {
					target.style["backgroundPositionX"] = l + 'px';
					target.style["backgroundPositionY"] = t + 'px';
				}
				else {
					target.style["marginLeft"] = l + "px";
					target.style["marginTop"] = t + "px";
				}
			}
			else if (ImageCropper.crop_event.resize) {
				var target = ImageCropper.crop_event.resize;
				var dx = ei.pageX - ImageCropper.crop_event.x;
				var dy = ei.pageY - ImageCropper.crop_event.y;
				var w = ImageCropper.crop_event.w + dx;
				var h = ImageCropper.crop_event.h + dy;

				if (w > 50 && w <= ImageCropper.crop_event.resize_img.width + ImageCropper.crop_event.resize_img.offsetLeft) {
					target.style["width"] = w + "px";
				}
				if (h > 50 && h <= ImageCropper.crop_event.resize_img.height + ImageCropper.crop_event.resize_img.offsetTop) {
					target.style["height"] = h + "px";
				}
			}

			evt.preventDefault();
			evt.stopPropagation();
			return false;
		},
		crop_dragover:function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
		},
		crop_drop:function(evt) {
			var url = evt.dataTransfer.getData('text/uri-list');
			var img = evt.currentTarget.querySelector('img');
			if (img && evt.dataTransfer.files.length > 0) {
				var fl = evt.dataTransfer.files[0];
				if (fl.type.indexOf('image/') === 0) {
					var reader  = new FileReader();
					reader.onload = function(evt) {
						img.src = reader.result;
					};
					reader.readAsDataURL(fl);
					return;
				}
			}
			else if (img && url) {
				if (url.match('(\.jpg|\.png|\.svg)$')) {
					img.src = url;
				}
			}

			evt.preventDefault();
			evt.stopPropagation();
		},
		crop_cancel:function(evt) {
			ImageCropper._crop_unlock_body();

			ImageCropper.crop_event.img = null;
			ImageCropper.crop_event.resize = null;
			ImageCropper.crop_event.resize_img = null;

			document.removeEventListener(ImageCropper.CROP_EVT_MOVE, ImageCropper.crop_move_content, false);
			document.removeEventListener(ImageCropper.CROP_EVT_UP, ImageCropper.crop_cancel, false);

			evt.preventDefault();
			evt.stopPropagation();
			return false;
		},
		crop_move_start:function(evt) {
			ImageCropper.crop_event.img = evt.target;
			ImageCropper.crop_start(evt);

			evt.preventDefault();
			return false;
		},
		crop_resize_start:function(evt) {
			ImageCropper._crop_lock_body();
			ImageCropper.crop_event.resize = evt.target.__cropframe;
			ImageCropper.crop_event.resize_img = evt.target.__cropframe.querySelector('img');
			ImageCropper.crop_start(evt);

			evt.preventDefault();
			evt.stopPropagation();
			return false;
		},

		crop_start:function(evt) {
			var ei = ImageCropper._crop_eventInfo(evt);
			var l = 0;
			var t = 0;

			ImageCropper.crop_event.x = ei.pageX;
			ImageCropper.crop_event.y = ei.pageY;
			ImageCropper.crop_event.w = evt.target.parentElement.clientWidth;
			ImageCropper.crop_event.h = evt.target.parentElement.clientHeight;
			ImageCropper.crop_event.iw = evt.target.width;
			ImageCropper.crop_event.ih = evt.target.height;

			if (evt.target.__cropbackground) {
				l = evt.target.style.backgroundPositionX;
				t = evt.target.style.backgroundPositionY;
			}
			else {
				l = evt.target.style.marginLeft;
				t = evt.target.style.marginTop;
			}

			if (l == "") l = 0;
			else l = parseInt(l.substr(0, l.length-2));
			if (t == "") t = 0;
			else t = parseInt(t.substr(0, t.length-2));

			ImageCropper.crop_event.l = l;
			ImageCropper.crop_event.t = t;

			document.addEventListener(ImageCropper.CROP_EVT_MOVE, ImageCropper.crop_move_content, false);
			document.addEventListener(ImageCropper.CROP_EVT_UP, ImageCropper.crop_cancel, false);
		},

		find_cropframe: function (img, frameclass) {
			var p = img.parentElement;
			while (p) {
				if (p.classList.contains(frameclass)) return p;
				p = p.parentElement;
			}

			p = img.parentElement;
			var w = p.style.width;
			var h = p.style.height;

			if (w == '') w = img.width + 'px';
			if (h == '') h = img.height + 'px';

			var el = document.createElement("div");
			el.classList.add('ui-cropframe-tmp');
			el.style.overflow = "hidden";
			el.style.width = w;
			el.style.height = h;
			el.style.position = "relative";
			img.parentElement.replaceChild(el, img);
			el.appendChild(img);
		
			return el;	
		},

    mk_crop_frame: function (img, settings) {
			var frame = this.find_cropframe(img, settings.cropFrame);
			var doresize = false;

			if (!img.__resizehandle) {
				if (doresize) {
					var handle = document.createElement("div");
					handle.classList.add("ui-cropframe-handle");
					handle.style.position = "absolute";
					handle.style.bottom = "0px";
					handle.style.right = "0px";
					handle.style.zIndex = 90;
					frame.appendChild(handle);

					img.addEventListener(ImageCropper.CROP_EVT_DOWN, this.crop_move_start, false);
					handle.addEventListener(ImageCropper.CROP_EVT_DOWN, this.crop_resize_start, false);

					img.__resizehandle = handle;
					img.__cropframe = frame;
					handle.__cropframe = frame;
				}
				else {
					img.addEventListener(ImageCropper.CROP_EVT_DOWN, this.crop_move_start, false);
					img.__cropbackground = img;
				}

				frame.addEventListener('dragover', ImageCropper.crop_dragover, false);
				frame.addEventListener('dragenter', ImageCropper.crop_dragover, false);
				frame.addEventListener('dragleave', ImageCropper.crop_dragover, false);
				frame.addEventListener('drop', ImageCropper.crop_drop, false);
			}
    },
	
    rm_crop_frame: function (img) {
			ImageCropper._crop_unlock_body();
			var p = img.parentElement;

			img.removeEventListener(ImageCropper.CROP_EVT_DOWN, this.crop_move_start, false);
			if (img.__resizehandle) {
				img.__resizehandle.removeEventListener(ImageCropper.CROP_EVT_DOWN, this.crop_resize_start, false);
				img.__resizehandle.parentElement.removeChild(img.__resizehandle);
			}

			if (img.__cropframe) {
				img.__cropframe.removeEventListener('dragover', ImageCropper.crop_dragover, false);
				img.__cropframe.removeEventListener('dragleave', ImageCropper.crop_dragover, false);
				img.__cropframe.removeEventListener('dragenter', ImageCropper.crop_dragover, false);
				img.__cropframe.removeEventListener('drop', ImageCropper.crop_drop, false);
			}

			if (img.__cropframe && img.__cropframe.classList.contains('ui-cropframe-tmp')) {
				var f = img.__cropframe;
				var ip = f.parentElement;
				ip.style.width = f.style.width;
				ip.style.height = f.style.height;
				f.parentElement.replaceChild(img, f);
			}

			img.__resizehandle = null;
			img.__cropframe = null;
			img.__cropbackground = null;
		}
};

if ("ontouchstart" in window) {
	ImageCropper.CROP_EVT_MOVE = "touchmove";
	ImageCropper.CROP_EVT_DOWN = "touchstart";
	ImageCropper.CROP_EVT_UP = "touchend";
}

if (typeof jQuery !== 'undefined') {
	jQuery.fn.crop = function (options) {

		if (options == "destroy") {
			this.each(function(n,it) {
				ImageCropper.rm_crop_frame(it);
			});
		}
		else {
			var settings = {
				cropFrame:'item'
			}; 

			jQuery.extend(settings, options);
			this.each(function(n,it) {
				ImageCropper.mk_crop_frame(it, settings);
			});
		}
	};
}
else {
	ImageCropper.crop = function(el) {
		if (el === 'destroy') {
		}
		else {
			var settings = {
				cropFrame:'item'
			}; 

			ImageCropper.mk_crop_frame(el, settings);
		}
	}
}

