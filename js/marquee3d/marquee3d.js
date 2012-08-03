(function($, pass, timeout, undefined) {
	// the eye
	var eye = [0, 1000, 270];
	// the virtual panel
	var vy = 400;
	// the radius of the real circle
	var radius = 10;
	// other global variables
	var ratio;
	var images;
	var angles = [];
	var div;
	var high;
	var curZero = 0;
	var position = [0, 0];
	// image loading things...
	var imageLoaded = 0;
	// for move
	var dAngle;
	var cur;
	var end;
	var endAngles;
	var timeout = 40;
	var pass = 1000;
	
	var marquee3d = function() {
		if(arguments.length == 2) {
			pass = parseInt(arguments[0]);
			timeout = parseInt(arguments[1]);
		}
		
		div = $(this);
		if($(div).css("position") == "static") {
			position = [parseInt($(div).position().left), parseInt($(div).position().top)];
		}
		
		// get the images
		images = $(this).find("img");
		var imagesCount = images.length;
		if(imagesCount == 0) return null;
		marginDifferenceWidth = $(images[0]).position().left;
		marginDifferenceHeight = $(images[0]).position().top;
		// get the ratio
		ratio = getRatio(this);
		ratio[0] = ratio[0] * 0.8;
		ratio[1] = ratio[1] + 45;
		// set image loader
		for(var i = 0; i < imagesCount; i++) {
			images[i].onload = function() { countImages(this); };
		}
		// initial layout
		var angle = 360 / imagesCount;
		for(var i = 0, init = 0; i < imagesCount; i++) {
			angles.push(init);
			init = init + angle;
		}
	};
	
	// expose marquee3d to juqery
	$.fn.marquee3d = marquee3d;
	
	function countImages(img) {
		imageLoaded = imageLoaded + 1;
		if(imageLoaded == images.length) {
			for(var i = 0; i < images.length; i++) {
				$(images[i]).attr("o_width", $(images[i]).css("width"));
				$(images[i]).attr("o_height", $(images[i]).css("height"));
			}
			high = show(true);
			addButton();
		}
	}
	
	function addButton() {
		var buttonDiv = $("<div></div>");
		var left = $("<a href='' class='marquee3dmove'><</a>");
		var right = $("<a href='' class='marquee3dmove'>></a>");
		buttonDiv.append(left);
		buttonDiv.append(right);
		$(div).append(buttonDiv);
		left.click(function(e) {
			e.preventDefault();
			go("left");
			return false;
		});
		right.click(function(e) {
			e.preventDefault();
			go("right");
			return false;
		});
		$(".marquee3dmove").css({
			"margin-right": "10px",
			"font-weight": "bold",
			"padding": "5px 20px",
			"background": "#555555",
			"font-size": "20px",
			"color": "#ffffff",
			"border-radius": "5px",
			"text-decoration": "none"
		});
		var bwidth = $($(".marquee3dmove").get(0)).outerWidth();
		bwidth = bwidth + 15 + $($(".marquee3dmove").get(1)).outerWidth();
		buttonDiv.css({
			"position": "absolute",
			"top": high + "px",
			"left": (position[0] + $(div).width() / 2 - bwidth / 2) + "px"
		});
		$(".marquee3dmove").mouseover(function() {
			$(this).css("background", "#2299ff");
		});
		$(".marquee3dmove").mouseout(function() {
			$(this).css("background", "#555555");
		});
	}
	
	function go(direction) {
		var imageCount = images.length;
		var angle = 360 / imageCount
		var interval = pass / timeout;
		dAngle = angle / interval;
		endAngles = [];
		
		if(direction == "right") {
			curZero = (curZero - 1 + imageCount) % imageCount;
			for(var i = 0; i < imageCount; i++) {
				endAngles.push((angles[i] + angle) % 360);
			}
		} else {
			curZero = (curZero + 1) % imageCount;
			dAngle = -1 * dAngle;
			for(var i = 0; i < imageCount; i++) {
				endAngles.push((angles[i] + 360 - angle) % 360);
			}
		}
		cur = 0;
		end = interval - 1;
		setTimeout(move, timeout);
	}
	
	function move() {
		var imageCount = images.length;
		for(var i = 0; i < angles.length; i++) {
			angles[i] = (angles[i] + dAngle) % 360;
		}
		show();
		if(cur < end) {
			cur = cur + 1;
			setTimeout(move, timeout);
		} else {
			for(var i = 0; i < imageCount; i++) {
				angles[i] = endAngles[i];
			}
			show(true);
		}
	}
	
	// kernel method to show them up
	function show(changeView) {
		var imageCount = images.length;
		
		for(var i = 0, j = curZero; i < (imageCount + 1) / 2; i++) {
			if(changeView) {
				$(images[(j + i) % imageCount]).css({
					"z-index": imageCount - i,
					"width": parseInt($(images[(j + i) % imageCount]).attr("o_width")) * (imageCount - i) / imageCount,
					"height": parseInt($(images[(j + i) % imageCount]).attr("o_height")) * (imageCount - i) / imageCount
				});
				$(images[(j - i + imageCount) % imageCount]).css({
					"z-index": imageCount - i,
					"width": parseInt($(images[(j - i + imageCount) % imageCount]).attr("o_width")) * (imageCount - i) / imageCount,
					"height": parseInt($(images[(j - i + imageCount) % imageCount]).attr("o_height")) * (imageCount - i) / imageCount
				});
			}
		}
		
		for(var i = 0; i < imageCount; i++) {
			var coord = virtual2target(real2virtual(angle2coord(angles[i])));
			$(images[i]).css("position", "absolute");
			$(images[i]).css("top", (position[1] + coord[1] - $(images[i]).height() / 2) + "px");
			$(images[i]).css("left", (position[0] + coord[0] - $(images[i]).width() / 2) + "px");
			if(i - 1 <= images.length / 2 && i + 1 >= images.length / 2) {
				high = $(images[i]).css("top");
			}
		}
		return parseInt(high) - 45;
	}
	
	// the circl: 6 at [0,0,0], 9 at [r, -r, 0], 0 at[0, -2r, 0], 3 at[-r, -r, 0]
	function angle2coord(angle) {
		return [
			-1 * radius * Math.sin(angle * Math.PI / 180),
			-1 * radius * ( 1 - Math.cos(angle * Math.PI / 180)),
			0
		];
	}
	
	function real2virtual(coord) {
		var ncoord = [], x, z;
		x = ( (vy-coord[1])*eye[0] - (vy-eye[1])*coord[0]) / (eye[1]-coord[1]);
		z = ( (vy-coord[1])*eye[2] ) / (eye[1]-coord[1]);
		ncoord.push(x);
		ncoord.push(vy);
		ncoord.push(z);
		return ncoord;
	}
	
	function virtual2target(coord) {
		var zero = real2virtual([0, -2 * radius, 0]);
		var nine = real2virtual([radius, -1 * radius, 0]);
		var virtualCoord = [nine[0] - coord[0], zero[2] - coord[2]];
		return [
			virtualCoord[0] * ratio[0] + ratio[1],
			virtualCoord[1] * ratio[0] + ratio[2]
		];
	}
	
	/*
	 * ratio[
	 * 	 '0': ratio
	 *   '1': x difference
	 *   '2': y difference
	 * ]
	 */
	function getRatio(div) {
		var width = $(div).width();
		var height = $(div).height();
		var six = real2virtual([0, 0, 0]);
		var three = real2virtual([-1 * radius, -1 * radius, 0]);
		var zero = real2virtual([0, -2 * radius, 0]);
		var nine = real2virtual([radius, -1 * radius, 0]);
		var virtualWidth = nine[0] - three[0];
		var virtualHeight = zero[2] - six[2];
		var ratioTarget = (0.1 * width) / (0.1 * height);
		var ratioVirtual = (0.1 * virtualWidth) / (0.1 * virtualHeight);
		if(ratioTarget < ratioVirtual) { // fill the width
			var ratio = width / virtualWidth;
			var ydiff = (height - virtualHeight * ratio) / 2;
			return [ratio, 0, ydiff];
		} else { // fill the height
			var ratio = height / virtualHeight;
			var xdiff = (width - virtualWidth * ratio) / 2;
			return [ratio, xdiff, 0];
		}
	}
	
})(jQuery);