<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-EN" xml:lang="en-EN">
 <head>
  <title><g:layoutTitle default="Grails" /></title>
  <link rel="stylesheet" href="${resource(dir:'css',file:'style.css')}" />
  <link rel="stylesheet" href="${resource(dir:'css',file:'login_panel.css')}" />
  <link rel="shortcut icon" href="${resource(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
  <g:layoutHead />
  <g:javascript library="jquery" />
  <g:javascript library="login_panel" />
  <g:javascript library="topnav" />
  </head>
 <body>
  <g:render template="/common/login_panel" />
  <div class="container">
   <div id="header">
    <g:render template="/common/topnav" />
   </div>
   <div id="content"><g:layoutBody /></div>
   <div id="footer">
     Copyright © 2008 - <g:formatDate format="yyyy" date="${new Date()}"/> NMC & NuGO. All rights reserved.
     <a href="?showSource=true">show page source</a></div>
  </div>
 </body>
</html>