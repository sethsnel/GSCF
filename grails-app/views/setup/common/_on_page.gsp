<%
/**
 * wizard refresh flow action
 *
 * When a page (/ partial) is rendered, any DOM event handlers need to be
 * (re-)attached. The af:ajaxButton, af:ajaxSubmitJs and af:redirect tags
 * supports calling a JavaScript after the page has been rendered by passing
 * the 'afterSuccess' argument.
 *
 * Example:	af:redirect afterSuccess="onPage();"
 * 		af:redirect afterSuccess="console.log('redirecting...');"
 *
 * Generally one would expect this code to add jQuery event handlers to
 * DOM objects in the rendered page (/ partial).
 *
 * @author Jeroen Wesbeek
 * @since  20110318
 *
 * Revision information:
 * $Rev:  67320 $
 * $Author:  duh $
 * $Date:  2010-12-22 17:49:27 +0100 (Wed, 22 Dec 2010) $
 */
%>
<script type="text/javascript">
	function onPage() {
		if (console) {
			attachHelpTooltips();

			// syntax highlighting
			function path() {
				var args = arguments,result = [];
				for(var i = 0; i < args.length; i++) result.push(args[i].replace('@', 'http://alexgorbatchev.com/pub/sh/current/scripts/'));
				return result
			}

			SyntaxHighlighter.autoloader.apply(null, path(
			  'applescript            @shBrushAppleScript.js',
			  'bash shell             @shBrushBash.js',
			  'css                    @shBrushCss.js',
			  'diff patch pas         @shBrushDiff.js',
			  'groovy                 @shBrushGroovy.js',
			  'java                   @shBrushJava.js',
			  'jfx javafx             @shBrushJavaFX.js',
			  'js jscript javascript  @shBrushJScript.js',
			  'php                    @shBrushPhp.js',
			  'text plain             @shBrushPlain.js',
			  'py python              @shBrushPython.js',
			  'sql                    @shBrushSql.js',
			  'xml xhtml xslt html    @shBrushXml.js'
			));
			SyntaxHighlighter.all();
		}
	}
</script>

