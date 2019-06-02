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
	menu.innerHTML = 'save';
	menu.id = 'mce-menubar';

	document.body.append(menu);

	menu.addEventListener('click', function(evt) {
		saveForm();
	});
});

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

window.addEventListener('click', function(evt) {
	var el = dataEl(evt.target);

	evt.preventDefault();
	evt.stopPropagation();
});
