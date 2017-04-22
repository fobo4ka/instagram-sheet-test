(function () {
	var callbackRegistry = {};
	window.CallbackRegistry = callbackRegistry;

	function scriptRequest(url, onSuccess, onError) {
		var scriptSuccess = false;
		var callbackName = 'cb' + String(Math.random()).slice(-6);

		url += ~url.indexOf('?') ? '&' : '?';
		url += 'callback=CallbackRegistry.' + callbackName;

    callbackRegistry[callbackName] = function(data) {
			scriptSuccess = true;
			delete callbackRegistry[callbackName];
			onSuccess(data);
		};

		function checkCallback() {
			if (scriptSuccess) return; 
			delete callbackRegistry[callbackName];
			onError(url);
		}

		var script = document.createElement('script');

		script.onreadystatechange = function() {
			if (this.readyState == 'complete' || this.readyState == 'loaded') {
				this.onreadystatechange = null;
				setTimeout(checkCallback, 0);
			}
		}

		script.onload = script.onerror = checkCallback;
		script.src = url;

		document.body.appendChild(script);
	}

	function success(data) {
		processingData(data.data);
	}

	function error(url) {
		console.log('Error');
	}

	scriptRequest("https://api.instagram.com/v1/users/691623/media/recent?access_token=691623.1419b97.479e4603aff24de596b1bf18891729f3&count=20", success, error); 

	function processingData(data) {
		var fragment = document.createDocumentFragment();

    var itemInfo = {};
		for(var i = 0; i < data.length; i++) {
			var item = data[i];

			itemInfo.id = item.id;
			itemInfo.img = item.images.low_resolution.url;
			itemInfo.description = item.caption ? item.caption.text : '';
			itemInfo.location = item.location ? item.location.name : '';
			itemInfo.username = item.user.username;
			itemInfo.avatar = item.user.profile_picture;
			itemInfo.likesCount = item.likes.count;
			itemInfo.time = formatDuration(item.created_time);

			fragment.appendChild(createItemInfo(itemInfo));
		}

		var helper = document.createElement('div');
		helper.classList.add('helper');
		helper.innerHTML = helper.innerHTML.trim();
		fragment.appendChild(helper);

		document.getElementById('page__items').appendChild(fragment);
	}

	function formatDuration(seconds) {
		seconds = Math.floor(Date.now()/1000) - parseInt(seconds);

		if (seconds <= 60) {
			return seconds + 's';
		}

		var minutes = Math.floor(seconds/60);
		if (minutes <= 60) {
			return minutes + 'm';
		}

		var hours = Math.floor(minutes/60);
		if (hours <= 24) {
			return hours + 'h';
		}

		var days = Math.floor(hours/24);
		if (days <= 7) {
			return days + 'd';
		}

		var weeks = Math.floor(days/7);
		if (weeks <= 4) {
			return weeks + 'w';
		}

		var months = Math.floor(weeks/4);
		if (months <= 12) {
			return months + 'm';
		}

		var years = Math.floor(months/12);
		if (years) {
			return years + 'y';
		}
	}

	var templateNode;

	function getTemplate(id) {
		if (!templateNode) {
			var itemTmpHtml = document.getElementById(id).innerHTML.trim();
			var tmp = document.createElement('div');
			tmp.innerHTML = itemTmpHtml;
			templateNode = tmp.firstChild;
		}
		return templateNode.cloneNode(true);
	}

	function createItemInfo(itemInfo) {
	    var itemTmp = getTemplate('item');

	    itemTmp.setAttribute('id', itemInfo.id);
	    itemTmp.querySelector('.photo').style.backgroundImage = "url(" + itemInfo.img + ")";
	    itemTmp.querySelector('.avatar__img').style.backgroundImage = "url(" + itemInfo.avatar + ")";
	    itemTmp.querySelector('.info__username').innerHTML = itemInfo.username;
	    itemTmp.querySelector('.info__location').innerHTML = itemInfo.location;
	    itemTmp.querySelector('.header__created-time').innerHTML = itemInfo.time;
	    itemTmp.querySelector('.info__description').innerHTML = itemInfo.description;
	    itemTmp.querySelector('.likes__count').innerHTML = itemInfo.likesCount;
	    itemTmp.querySelector('.likes__icon').setAttribute('data-id', itemInfo.id);
	    itemTmp.querySelector('.likes__icon').onclick = showId;

	    if(!itemInfo.location) {
	    	itemTmp.querySelector('.info__location').style.display = 'none';
	    }

	    if (!itemInfo.description) {
	    	itemTmp.querySelector('.info__description').style.display = 'none';
	    }

	    return itemTmp;
	}

	function showId() {
		var id = this.getAttribute('data-id');
		alert(id);
	}
})();
