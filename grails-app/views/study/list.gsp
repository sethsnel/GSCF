
<%@ page import="dbnp.studycapturing.Study" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="layout" content="main" />
  <g:set var="entityName" value="${message(code: 'study.label', default: 'Study')}" />
  <title><g:message code="default.list.label" args="[entityName]" /></title>
</head>
<body>

  <g:form action="list_extended">

  <div class="nav">
    <span class="menuButton"><a class="home" href="${createLink(uri: '/')}">Home</a></span>
    <span class="menuButton"><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></span>
  </div>
  <div class="body">
    <h1><g:message code="default.list.label" args="[entityName]" /></h1>
    <g:if test="${flash.message}">
      <div class="message">${flash.message}</div>
    </g:if>

      <g:each in="${studyInstanceList}" var="studyInstance">
        <br>
        <table>
          <tr>
            <td width="50"></td>
            <td colspan="3">
              <center><b>${studyInstance.title}</b></center>
            </td>
          </tr>
          <tr>
            <td>

              <input type="checkbox" name="${studyInstance.title}" id="${studyInstance.title}"></td>

            <td width="150">
          <g:link action="show" id="${studyInstance.id}">
${message(code: 'study.id.label', default: 'Id')} :
${fieldValue(bean: studyInstance, field: "id")}</g:link></td>

        <td width="300">
<b>${message(code: 'study.template.label', default: 'Template')} </b>:
${fieldValue(bean: studyInstance, field: "template")}</td>

<td >
<b>${message(code: 'study.subjects.label', default: 'Subjects')} </b>:
${studyInstance.subjects.size()} subjects</td>

        </tr>
        <tr>
          <td></td>
          <td >
<b>${message(code: 'study.owner.label', default: 'Owner')} </b>:
${fieldValue(bean: studyInstance, field: "owner")}</td>

          <td >
<b>Assays </b>:
        <g:each in="${studyInstance.assays}" var="assay">
          ${assay.name}
        </g:each>
          </td>

          <td><b> Samples </b>:
          <g:each in="${studyInstance.assays.samples}" var="samples">
          ${samples.name}
          </g:each>
          </td>


        </tr>
        <g:if test="${studyInstance.fieldExists( 'Description' )}">
        <tr>
          <td></td>
          <td colspan="3">
            <b>${message(code: 'study.description.label', default: 'Description')} </b>:
            ${studyInstance.getFieldValue( 'Description' )}
            
          </td>
        </tr>
        </g:if>
        </table>
      </g:each>
   
    <div class="paginateButtons">
      <g:paginate total="${studyInstanceTotal}" />
      <br>
      <INPUT TYPE=submit name=submit Value="Compare selected studies">
    </div>
  </div>
</g:form>
</body>
</html>
