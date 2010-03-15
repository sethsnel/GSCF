package dbnp.studycapturing

/**
 * The Template class describes a study template, which is basically an extension of the study capture entities
 * in terms of extra fields (described by classes that extend the TemplateField class).
 * At this moment, only extension of the study and subject entities is implemented.
 *
 * Revision information:
 * $Rev$
 * $Author$
 * $Date$
 */
class Template implements Serializable {
	String name
	Class entity
	//nimble.User owner

	static hasMany = [fields: TemplateField]

	static constraints = {

		// outcommented for now due to bug in Grails / Hibernate
		// see http://jira.codehaus.org/browse/GRAILS-6020
		//	name(unique:['entity'])
	}

	/**
	 * overloaded toString method
	 * @return String
	 */
	def String toString() {
		return this.name;
	}

	/**
	 * Look up the type of a certain template subject field
	 * @param	String	fieldName The name of the template field
	 * @return	String	The type (static member of TemplateFieldType) of the field, or null of the field does not exist
	 */
	def TemplateFieldType getFieldType(String fieldName) {
		def field = fields.find {
			it.name == fieldName	
		}
		field?.type
	}

	/**
	 * get all field of a particular type
	 * @param	Class	fieldType
	 * @return	Set<TemplateField>
	 */
	def getFieldsByType(TemplateFieldType fieldType) {
		def result = fields.findAll {
			it.type == fieldType
		}
		return result;
	}

	/**
	 * overloading the findAllByEntity method to make it function as expected
	 * @param	Class		entity (for example: dbnp.studycapturing.Subject)
	 * @return	ArrayList
	 */
	public static findAllByEntity(java.lang.Class entity) {
		def results = []
		println "Searching for" + entity
		// 'this' should not work in static context, however it does so I'll keep
		// this in for now :)
		this.findAll().each() {
			if (entity.equals(it.entity)) {
				results[ results.size() ] = it
			}
		}

		return results
	}
}
