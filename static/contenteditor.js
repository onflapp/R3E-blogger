window.addEventListener('load', function () {
	var ls = [];
	document.querySelectorAll('[data-content]').forEach(function(i) { ls.push(i) });
	document.querySelectorAll('[data-field]').forEach(function(i) { ls.push(i) });

	for (var i = 0; i < ls.length; i++) {
		var el = ls[i];
		tinymce.init({
			target: el,
			plugins: 'image paste hr lists link',
			menubar: false,
			inline: true,
			paste_as_text: true
		});
	}

	var menu = document.createElement('div');
	menu.id = 'mainmenubar';
  menu.style.position = 'fixed';
	document.body.append(menu);

  initDragger();
});

window.addEventListener('xclick', function (evt) {
  var target = evt.target;
  var path = target.dataset.editable;
  var menu = document.getElementById('mainmenubar');

  while(!path) {
    target = target.parentElement; 
    if (!target) break;

    path = target.dataset.editable;
  }

  if (path) {
    reqFragment(path+'.x-editable-actions', function(html) {
      menu.innerHTML = html;
      menu.style.top = evt.clientY+'px';
      menu.style.left = evt.clientX+'px';
    });
  }
  else {
    menu.innerHTML = '';
  }
});

function initDragger() {
	$('.container').dragger({
		getDragSource:function(target) {
			if (this.CONTAINER.contentEditable == 'true') return null;

			var p = target;
			while(p) {
				if (p.classList.contains('container-item')) return p;
				var p = p.parentElement;
			}
			return null;

		},
		getDragDestination:function(target) {
			var p = target;
			while(p) {
				if (p.classList.contains('container-item')) return p;
				if (p.classList.contains('container')) return p;
				var p = p.parentElement;
			}
			return null;
		},
		droppedExternal:function(src, pos, dest) {
			var self = this;

			var fil = src.files.item(0);
			var urlA = src.getData('text/x-moz-url');
			var urlB = src.getData('public.url');
			var urlC = src.getData('public.url-name');
			var text = src.getData('text/plain');

			if (fil) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					if (data.indexOf('data:image/') === 0) {
						var img = insert_image(e.target.result);
						self.dropped(img, pos, dest);
					}
				};
				reader.readAsDataURL(fil);
			}
			else if (urlA) {
				var a = urlA.split('\n');
				var link = insert_link(a[0], a[1]?a[1]:'a link');
				self.dropped(link, pos, dest);
			}
			else if (urlB) {
				var link = insert_link(urlB, urlC?urlC:'a link');
				self.dropped(link, pos, dest);
			}
			else if (text) {
				var text = insert_text('p', text);
				self.dropped(text, pos, dest);
			}

		},
		dropped:function(src, pos, dest) {
			console.log(pos);
			var par = src.parentElement;
			if      (pos == "over") return; //dest.appendChild(src);
			else if (pos == "before") dest.parentElement.insertBefore(src, dest);
			else                      dest.parentElement.insertBefore(src, dest.nextElementSibling);
		},
		start:function(evt) {
		},
		stop:function(evt) {
		}
	});
}

function reqFragment(action, cb) {
  var req = new XMLHttpRequest();

  req.open('GET', action);
  req.onload = function(evt) {
    if (req.status == 200) {
      cb(this.response);
		}
    else {
     	console.log(req.status);
    }
  };

  req.send();
}

function saveForm() {
	var formData = new FormData();

	var ls = document.querySelectorAll('[data-field]');
	for (var i = 0; i < ls.length; i++) {
		var it = ls[i];
		var name = it.dataset['field'];
		var value = it.innerHTML;

		formData.append(name, value);
	}

	ls = document.querySelectorAll('[data-content]');
	for (var i = 0; i < ls.length; i++) {
		var it = ls[i];
		var name = it.dataset['content'];
		var value = it.innerHTML;

		formData.append(name+'/_content', value);
	}

	var req = new XMLHttpRequest();
	var action = window.location.toString();

  req.open('POST', action, true);
  req.onload = function(evt) {
    if (req.status == 200) {
		}
    else {
     	console.log(req.status);
    }
  };

  req.send(formData);
}

function dataEl(el) {
	while (el) {
		if (el.dataset['field'] || el.dataset['content']) {
			return el;
		}
		else {
			el = el.parentElement;
		}
	}
	return null;
}

/*
window.addEventListener('click', function(evt) {
	var el = dataEl(evt.target);

	evt.preventDefault();
	evt.stopPropagation();
});
*/
