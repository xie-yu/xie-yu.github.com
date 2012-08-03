/* author: beiyuu.com */
function includeScript(file,callback){
	var _doc = document.getElementsByTagName('head')[0];
	var js = document.createElement('script');
	js.setAttribute('type', 'text/javascript');
	js.setAttribute('src', file);
	_doc.appendChild(js);

	if (!/*@cc_on!@*/0) { //if not IE
         //Firefox2°¢Firefox3°¢Safari3.1+°¢Opera9.6+ support js.onload
         js.onload = function () {
              callback();
         }
	} else {
         //IE6°¢IE7 support js.onreadystatechange
         js.onreadystatechange = function () {
			 if (js.readyState == 'loaded' || js.readyState == 'complete') {
				  callback();
			 }
		}
    }
     return false;
}

/*
 * source: beiyuu.com
 * show disqus comments
 */
function seeComments(thisAnchor) {
	$(thisAnchor).html('º”‘ÿ÷–...');
	var disqus_shortname = 'marcieinredgithubpage';
	var that = $(thisAnchor).parent(); // In my app.
	includeScript('http://' + disqus_shortname + '.disqus.com/embed.js',function(){$(that).remove()}); 
	return false;
}
