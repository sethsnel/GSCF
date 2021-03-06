<g:if test="${(meta(name: 'app.build.display.info') as int) as boolean}">
<div class="buildinfo">
	<table>
		<tr>
			<td colspan="2">${meta(name: 'app.name')} ${meta(name: 'app.version')} <b><i><u>${meta(name: 'app.build.type')}</u> build</i></b></td>
		</tr>
		<tr>
			<td>revision</td>
			<td>: ${meta(name: 'app.build.svn.revision')}</td>
		</tr>
		<tr>
			<td>Grails version</td>
			<td>: <g:meta name="app.grails.version"></g:meta></td>
		</tr>
		<tr>
			<td>deployed</td>
			<td>: <span id="info-deployed" /></td>
		</tr>
		<tr>
			<td>build age</td>
			<td>: <span id="info-uptime" /></td>
		</tr>
		<tr>
			<td>hostname</td>
			<td>: ${InetAddress.getLocalHost().getHostName()}</td>
		</tr>
	</table>

	<script type="text/javascript">
	var deployed = ${meta(name: 'app.build.timestamp')};

	// change deployed time
	$('#info-deployed').html(new Date((deployed * 1000)).toLocaleString());

	// start uptime counter
	updateUptime();

	// uptime
	function updateUptime() {
		var currentTime	= Math.floor(new Date().getTime() / 1000);
		var seconds		= currentTime - deployed;
		var minutes		= Math.floor(seconds / 60);
		var seconds		= seconds - (minutes * 60);
		var hours		= Math.floor(minutes / 60);
		var minutes		= minutes - (hours * 60);
		var days		= Math.floor(hours / 24);
		var hours		= hours - (days * 24);

		$('#info-uptime').html(days + 'd, ' + hours + 'h, ' + minutes + 'm, ' + seconds + 's');

		setTimeout("updateUptime();", 1000);
	}
	</script>
</div>
</g:if>