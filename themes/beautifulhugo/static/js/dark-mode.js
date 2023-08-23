$( document ).ready(function() {
    var body = document.body;
	var switcher = document.getElementsByClassName('js-toggle')[0];

	function switchColorMode(color) {
		if (color === "dark") {
			body.classList.add('dark');
			//Save user preference in storage
			localStorage.setItem('darkMode', 'true');
			switcher.classList.add('js-toggle--checked');
		} else {
			body.classList.remove('dark');
			setTimeout(function() {
				localStorage.removeItem('darkMode');
			}, 100);
			switcher.classList.remove('js-toggle--checked');
		}
	}


	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
		if (event.matches) {
			switchColorMode("dark");
		} else {
			switchColorMode("light");
		}
	});

	//Click on dark mode icon. Add dark mode classes and wrappers. Store user preference through sessions
	switcher.addEventListener("click", function() {
		if (body.classList.contains('dark')) {
			switchColorMode("light");
		} else {
			switchColorMode("dark");
		}
	})

	//Check Storage. Keep user preference on page reload
	if (localStorage.getItem('darkMode')) {
		if (localStorage.getItem('darkMode') === 'true') {
			switchColorMode("dark");
		} else {
			switchColorMode("light");
		}
	} else {
		//Check if user has set a preference for dark mode
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			switchColorMode("dark");
		} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
			switchColorMode("light");
		}
	}
});