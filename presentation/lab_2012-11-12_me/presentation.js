/* author: xieyu, xie-yu.github.com
 * work with jquery and presentation.css
 * the html should be structured as below:
 * <div class='slide'>
 * <div class='slide_header'>...</div>
 * <div class='list [has-sub|no-sub]'>
 * 		<div class='sub-list'>
 *				<div><span class='title'>TITLE</span><span class='content'>CONTENT</span></div>
 * 				......
 * 		</div>
 * </div>
 * </div>
 */
function init()
{
	$.slides = $('.slide');
	var slides = $.slides;
	var nslide = slides.length;
	var sublists = $('.sublist');
	for(i = 0; i < sublists.length; i++) $(sublists[i]).hide();
	if(nslide <= 0) {
		alert('no slides...');
		return;
	}
	for(var i = 0; i < nslide; i++) {
		$(slides[i]).attr("sid", i);
		$(slides[i]).hide();
	}
	$.cur_sid = 0;
	$(slides[0]).show();
	dolist(slides[0]);
	
	$(document).keydown(function(event) {
			var which = event.keyCode;
			var id = $.cur_sid;
			if(which == 32 || which == 37) { // space
				if(id > 0) {
					$(slides[id]).fadeOut(500);
					$.cur_sid = id - 1;
					$(slides[id - 1]).fadeIn(1000);
					dolist(slides[id - 1]);
				} else {
					alert('THIS IS THE FIRST SLIDE ALREADY!');
				}
			} else if(which == 13 || which == 39) { // enter
				if(id < slides.length - 1) {
					$(slides[id]).fadeOut(500);
					$.cur_sid = id + 1;
					$(slides[id + 1]).fadeIn(1000);
					dolist(slides[id + 1]);
				} else {
					alert('THIS IS THE LAST SLIDE ALREADY!');
				}
			}
		});
}

function dolist(slide)
{
	var hassub = $(slide).find(".has-sub");
	var nosub  = $(slide).find(".no-sub");
	hassub.click(function() {
		has_sub_click(this);
	});
	nosub.click(function() {
		no_sub_click(this);
	});
}

function has_sub_click(me)
{
	var sublist = $(me).find(".sublist");
	if(sublist.length > 0) {
		$(sublist[0]).slideDown();
		$(me).removeClass("has-sub");
		$(me).addClass("no-sub");
		$(me).unbind('click');
		$(me).click(function(){no_sub_click(me);});
	}
}

function no_sub_click(me)
{
	var sublist = $(me).find(".sublist");
	if(sublist.length > 0) {
		$(sublist[0]).slideUp();
		$(me).removeClass("no-sub");
		$(me).addClass("has-sub");
		$(me).unbind('click');
		$(me).click(function(){has_sub_click(me);});
	}
}