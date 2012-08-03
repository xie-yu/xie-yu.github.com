/*
 * author: MarcieInRed.github.com
 * Use simple-highlight.css for basic layout.
 */
(function($, undefined) {
	var keywords = [
		"auto", "break", "case", "char", "const", "continue", "default",
		"do", "double", "else", "enum", "extern", "float", "for", "for",
		"goto", "if", "int", "long", "register", "return", "short", "signed",
		"sizeof", "static", "struct", "switch", "typedef", "union", "unsigned",
		"void", "volatile", "while",
		"in", "class", "this", "delete", "export", "import", "function", "instanceof",
		"instanceOf", "new", "throw", "try", "catch", "var", "with", "yield", "null",
		"#include", "#define"
	];
	
	var inblockcmt = false;
	
	$.fn.simpleHighlight = function() {
		var code = this.text();
		
		// if the first lines has only new-line
		for(var i = 0; i < code.length; i++) {
			if(code[i] != '\n') {
				code = code.substring(i);
				break;
			}
		}
		
		// cope with < & >
		var strange = code.split("<");
		code = "";
		for(var i = 0; i < strange.length - 1; i++) {
			code += strange[i] + "&lt;";
		}
		code += strange[strange.length - 1];
		strange = code.split(">");
		code = "";
		for(var i = 0; i < strange.length - 1; i++) {
			code += strange[i] + "&gt;";
		}
		code += strange[strange.length - 1];
		
		// pretty tab
		strange = "";
		for(var i = 0; i < code.length; i++) {
			if(code[i] == '\t') strange += "    ";
			else strange += code[i];
		}
		code = strange;
		
		// highlight the code line by line
		var codelines = getLines(code), nline = "";
		code = "";
		for(var l in codelines) {
			code += highlight(codelines[l]);
			var ll = parseInt(l) + 1;
			if(l == 0) {
				nline += "<div class='linenum firstline' style='float:left'>" + ll + "</div>";
			} else if(l == codelines.length - 1) {
				nline += "<div class='linenum lastline' style='float:left'>" + ll + "</div>";
			} else {
				nline += "<div class='linenum' style='float:left'>" + ll + "</div>";
			}
		}
		code = "<div class='code'>" + code + "</div><div class='clear'></div>";
		var nline = "<div class='line'>" + nline + "</div>";
		code = "<pre class='simple-highlight'>" + nline + code + "</pre>";
		this.empty()[0].innerHTML = code;
		this.addClass("simple-highlight-box");
	};
	
	function highlight(line) {
		var newline = "";
		var wordbegin = 0;
		var inword = false;
		var isnum = false;
		
		var begin = 0;
		// cope with block comments
		if(inblockcmt == true) {
			for(var i = 0; i < line.length - 1; i++) {
				if(line[i] == '*' && line[i + 1] == '/') {
					newline += line.substring(0, i + 2);
					newline += "</span>";
					begin = i + 2;
					inblockcmt = false;
					break;
				}
			}
			if(begin == 0) {
				// not closed in this line
				return line;
			}
		}
		
		for(var i = begin; i < line.length; i++) {
			// a plain blank,skip
			if(isBlank(line[i]) && inword == false) {
				wordbegin++;
				newline += line[i];
				continue;
			}
			// end of a word by a blank
			if(isBlank(line[i]) && inword == true) {
				newline += getHighlightWord(line.substring(wordbegin, i), isnum);
				wordbegin = i;
				isnum = false;
				inword = false;
				i--;
				continue;
			}
			//----------- cannot be blank any more -------------
			
			// an 'illegal char'
			if(!islegal(line[i])) {
				// quotes
				if(line[i] == '\'') {
					newline += getHighlightWord(line.substring(wordbegin, i), isnum);
					isnum = false;
					wordbegin = i;
					i++;
					while(i < line.length && line[i] != '\'')
						i++;
					if(i < line.length) i = i + 1;
					newline += "<span class=\"quote\">" + line.substring(wordbegin, i) + "</span>";
					inword = false;
					continue;
				}
				if(line[i] == '"') {
					newline += getHighlightWord(line.substring(wordbegin, i), isnum);
					isnum = false;
					wordbegin = i;
					i++;
					while(i < line.length && line[i] != '"')
						i++;
					if(i < line.length) i = i + 1;
					newline += "<span class=\"quote\">" + line.substring(wordbegin, i) + "</span>";
					inword = false;
					i--;
					continue;
				}
				
				// comments
				if(line[i] == '/') {
					if(i < line.length - 1 && line[i + 1] == '/') {
						newline += getHighlightWord(line.substring(wordbegin, i), isnum);
						isnum = false;
						inword = false;
						wordbegin = i;
						newline += "<span class=\"comment\">" + line.substring(wordbegin, line.length) + "</span>";
						return newline; // the whole line skipped.
					}
					if(i < line.length - 1 && line[i + 1] == '*') {
						newline += getHighlightWord(line.substring(wordbegin, i), isnum);
						isnum = false;
						inword = false;
						inblockcmt = true;
						newline += "<span class=\"comment\">/*";
						// try to see the rest of this line.
						var blockbegin = i + 2;
						for(i = i + 2; i < line.length - 1; i++) {
							if(line[i] == '*' && line[i + 1] == '/') {
								newline += line.substring(blockbegin, i + 2) + "</span>";
								inblockcmt = false;
								i = i + 2;
								break;
							}
						}
						if(inblockcmt == true) {
							// from blockbegin to end are all comments
							newline += line.substring(blockbegin);
							return newline;
						}
					}					
				}
				
				// a plain illegal char, skip
				if(inword == false) {
					wordbegin++;
					newline += line[i];
					continue;
				}
				
				// if it is a number
				if(isnum && line[i] == '.') continue;
				
				// end of a word by an 'illegal char'
				newline += getHighlightWord(line.substring(wordbegin, i), isnum);
				isnum = false;
				inword = false;
				wordbegin = i;
				i--;
			} else if(islegal(line[i])) {
				if(inword == false) { // a new word
					wordbegin = i;
					if(line[i] >= '0' && line[i] <= '9') isnum = true;
					inword = true;
				}
			}
		}
		return newline;
	}
	
	function getHighlightWord(word, isnum) {
		if(iskeyword(word)) {
			word = "<span class=\"keyword\">" + word + "</span>";
		}
		if(isnum) {
			word = "<span class=\"number\">" + word + "</span>";
		}
		return word;
	}
	
	function islegal(ch) {
		return (ch <= '9' && ch >= '0') || (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch == '_' || ch == '#'; 
	}
	
	function iskeyword(word) {
		for(var i in keywords) {
			if(word == keywords[i]) return true;
		}
		return false;
	}
	
	// return a array of lines of 'code',
	// each line is 'trimed' the preceding blanks as to the first line
	function getLines(code) {
		var lines = [];
		var npreblank = 0;
		for(var i = 0; i < code.length && code[i] != '\n' && isBlank(code[i]); i++)
			npreblank++;
		var l = 0, countedblank = 0, linebegin = 0;
		// when first encountered a new line, countedblank is 0, linebegin is index of the first char
		for(var i = 0; i < code.length; i++) {
			if(countedblank < npreblank) {
				if(!isBlank(code[i])) { // less pre-blanks than the first line
					linebegin = i;
					countedblank = npreblank;
				} else {
					if(code[i] == '\n') { // too short
						linebegin = i;
					} else {
						countedblank++;
					}
				}
			}
			if(countedblank == npreblank) {
				countedblank++; // never come back until next line
				linebegin = i + 1;
			}
			if(code[i] == '\n' || i == code.length - 1) {
				lines[l++] = code.substring(linebegin, i + 1); // include the new-line
				countedblank = 0;
				linebegin = i + 1;
			}
		}
		return lines;
	}
	
	function isBlank(ch) {
		return (ch == ' ') || (ch == '\t') || (ch == '\n');
	}
})(jQuery);
