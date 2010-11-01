package dbnp.studycapturing

import dbnp.authentication.SecUser

/**
 * Domain class describing the basic entity in the study capture part: the Study class.
 *
 * Revision information:
 * $Rev$
 * $Author$
 * $Date$
 */
class Study extends TemplateEntity {
        static searchable = true

	SecUser owner		// The owner of the study. A new study is automatically owned by its creator.
	String title        // The title of the study
	String code 		// currently used as the external study ID, e.g. to reference a study in a SAM module
	Date dateCreated
	Date lastUpdated
	Date startDate
	List subjects
	List events
	List samplingEvents
	List eventGroups
	List samples
	List assays
	boolean published = false // Determines whether a study is private (only accessable by the owner and writers) or published (also visible to readers)
    boolean publicstudy = false  // Determines whether anonymous users are allowed to see this study. This has only effect when published = true
        
	static hasMany = [		
		subjects: Subject,
		samplingEvents: SamplingEvent,
		events: Event,
		eventGroups: EventGroup,
		samples: Sample,
		assays: Assay,
		persons: StudyPerson,
		publications: Publication,
                readers: SecUser,
                writers: SecUser
	]

	static constraints = {
		owner(nullable: true, blank: true)
		code(nullable:false, blank:true,unique:true)

		// TODO: add custom validator for 'published' to assess whether the study meets all quality criteria for publication
		// tested by SampleTests.testStudyPublish
	}

	static mapping = {
		autoTimestamp true
		sort "title"

		// Workaround for bug http://jira.codehaus.org/browse/GRAILS-6754
		templateTextFields type: 'text'
	}

	// The external identifier (studyToken) is currently the code of the study.
	// It is used from within dbNP submodules to refer to particular study in this GSCF instance.
	def getToken() { code }

	/**
	 * return the domain fields for this domain class
	 * @return List
	 */
	static List<TemplateField> giveDomainFields() { return Study.domainFields }

	static final List<TemplateField> domainFields = [
		new TemplateField(
			name: 'title',
			type: TemplateFieldType.STRING,
			required: true),
		new TemplateField(
			name: 'code',
			type: TemplateFieldType.STRING,
			preferredIdentifier:true,
			comment: 'Fill out the code by which many people will recognize your study',
			required: true),
		new TemplateField(
			name: 'startDate',
			type: TemplateFieldType.DATE,
			comment: 'Fill out the official start date or date of first action',
			required: true),
		new TemplateField(
			name: 'published',
			type: TemplateFieldType.BOOLEAN,
			comment: 'Determines whether this study is published (accessible for the study readers and, if the study is public, for anonymous users). A study can only be published if it meets certain quality criteria, which will be checked upon save.',
			required: false)
	]

	/**
	 * return the title of this study
	 */
	def String toString() {
		return title
	}

	/**
	 * returns all events and sampling events that do not belong to a group
	 */
	def List<Event> getOrphanEvents() {
		def orphans =	events.findAll { event -> !event.belongsToGroup(eventGroups) } +
						samplingEvents.findAll { event -> !event.belongsToGroup(eventGroups) }

		return orphans
	}

	/**
	 * Return the unique Subject templates that are used in this study
	 */
	def List<Template> giveSubjectTemplates() {
		TemplateEntity.giveTemplates(subjects)
	}

	/**
	 * Return all subjects for a specific template
	 * @param Template
	 * @return ArrayList
	 */
	def ArrayList<Subject> giveSubjectsForTemplate(Template template) {
		subjects.findAll { it.template.equals(template) }
	}

	/**
	 * Return all unique assay templates
	 * @return Set
	 */
	List<Template> giveAllAssayTemplates() {
		TemplateEntity.giveTemplates(( (assays) ? assays : [] ))
	}

	/**
	 * Return all assays for a particular template
	 * @return ArrayList
	 */
	def ArrayList giveAssaysForTemplate(Template template) {
		assays.findAll { it.template.equals(template) }
	}

	/**
	 * Return the unique Event and SamplingEvent templates that are used in this study
	 */
	List<Template> giveAllEventTemplates() {
		// For some reason, giveAllEventTemplates() + giveAllSamplingEventTemplates()
		// gives trouble when asking .size() to the result
		// So we also use giveTemplates here
		TemplateEntity.giveTemplates( ((events) ? events : []) + ((samplingEvents) ? samplingEvents : []) )
	}


	/**
	 * Return all events and samplingEvenets for a specific template
	 * @param Template
	 * @return ArrayList
	 */
	def ArrayList giveEventsForTemplate(Template template) {
		def events = events.findAll { it.template.equals(template) }
		def samplingEvents = samplingEvents.findAll { it.template.equals(template) }

		return (events) ? events : samplingEvents
	}

	/**
	 * Return the unique Event templates that are used in this study
	 */
	List<Template> giveEventTemplates() {
		TemplateEntity.giveTemplates(events)
	}

	/**
	 * Return the unique SamplingEvent templates that are used in this study
	 */
	List<Template> giveSamplingEventTemplates() {
		TemplateEntity.giveTemplates(samplingEvents)
	}

	/**
	 * Returns the unique Sample templates that are used in the study
	 */
	List<Template> giveSampleTemplates() {
		TemplateEntity.giveTemplates(samples)
	}

	/**
	 * Return all samples for a specific template
	 * @param Template
	 * @return ArrayList
	 */
	def ArrayList<Subject> giveSamplesForTemplate(Template template) {
		samples.findAll { it.template.equals(template) }
	}

	/**
	 * Returns the template of the study
	 */
	Template giveStudyTemplate() {
		return this.template
	}


	/**
	 * Delete a specific subject from this study, including all its relations
	 * @param subject The subject to be deleted
	 * @return A String which contains a (user-readable) message describing the changes to the database
	 */
	String deleteSubject(Subject subject) {
		String msg = "Subject ${subject.name} was deleted"

		// Delete the subject from the event groups it was referenced in
		this.eventGroups.each {
			if (it.subjects.contains(subject)) {
				it.removeFromSubjects(subject)
				msg += ", deleted from event group '${it.name}'"
			}
		}

		// Delete the samples that have this subject as parent
		this.samples.findAll { it.parentSubject.equals(subject) }.each {
			// This should remove the sample itself too, because of the cascading belongsTo relation
			this.removeFromSamples(it)
			// But apparently it needs an explicit delete() too
			it.delete()
			msg += ", sample '${it.name}' was deleted"
		}

		// This should remove the subject itself too, because of the cascading belongsTo relation
		this.removeFromSubjects(subject)
		// But apparently it needs an explicit delete() too
		subject.delete()

		return msg
	}

	/**
	 * Delete an assay from the study
	 * @param Assay
	 * @void
	 */
	def deleteAssay(Assay assay) {
		if (assay && assay instanceof Assay) {
			// iterate through linked samples
			assay.samples.findAll { true }.each() { sample ->
				assay.removeFromSamples(sample)
			}

			// remove this assay from the study
			this.removeFromAssays(assay)

			// and delete it explicitly
			assay.delete()
		}
	}

	/**
	 * Delete an event from the study, including all its relations
	 * @param Event
	 * @return String
	 */
	String deleteEvent(Event event) {
		String msg = "Event ${event} was deleted"

		// remove event from the study
		this.removeFromEvents(event)

		// remove event from eventGroups
		this.eventGroups.each() { eventGroup ->
			eventGroup.removeFromEvents(event)
		}

		return msg
	}

	/**
	 * Delete a samplingEvent from the study, including all its relations
	 * @param SamplingEvent
	 * @return String
	 */
	String deleteSamplingEvent(SamplingEvent samplingEvent) {
		String msg = "SamplingEvent ${samplingEvent} was deleted"

		// remove event from eventGroups
		this.eventGroups.each() { eventGroup ->
			eventGroup.removeFromSamplingEvents(samplingEvent)
		}

		// Delete the samples that have this sampling event as parent
		this.samples.findAll { it.parentEvent.equals(samplingEvent) }.each {
			// This should remove the sample itself too, because of the cascading belongsTo relation
			this.removeFromSamples(it)
			// But apparently it needs an explicit delete() too
			it.delete()
			msg += ", sample '${it.name}' was deleted"
		}

		// Remove event from the study
		// This should remove the event group itself too, because of the cascading belongsTo relation
		this.removeFromSamplingEvents(samplingEvent)

		// But apparently it needs an explicit delete() too
		// (Which can be verified by outcommenting this line, then SampleTests.testDeleteViaParentSamplingEvent fails
		samplingEvent.delete()

		return msg
	}
	
	/**
	 * Delete an eventGroup from the study, including all its relations
	 * @param EventGroup
	 * @return String
	 */
	String deleteEventGroup(EventGroup eventGroup) {
		String msg = "EventGroup ${eventGroup} was deleted"

		// If the event group contains sampling events
		if (eventGroup.samplingEvents) {
			// remove all samples that originate from this eventGroup
			if (eventGroup.samplingEvents.size()) {
				// find all samples related to this eventGroup
				// - subject comparison is relatively straightforward and
				//   behaves as expected
				// - event comparison behaves strange, so now we compare
				//		1. database id's or,
				//		2. object identifiers or,
				//		3. objects itself
				//   this seems now to work as expected
				this.samples.findAll { sample ->
					(
						(eventGroup.subjects.findAll {
							it.equals(sample.parentSubject)
						})
						&&
						(eventGroup.samplingEvents.findAll {
							(
								(it.id && sample.parentEvent.id && it.id==sample.parentEvent.id)
								||
								(it.getIdentifier() == sample.parentEvent.getIdentifier())
								||
								it.equals(sample.parentEvent)
							)
						})
					)
				}.each() { sample ->
					// remove sample from study

					// -------
					// NOTE, the right samples are found, but the don't
					// get deleted from the database!
					// -------

					println ".removing sample '${sample.name}' from study '${this.title}'"
					msg += ", sample '${sample.name}' was deleted"
					this.removeFromSamples( sample )

					// remove the sample from any sampling events it belongs to
					this.samplingEvents.findAll { it.samples.any { it == sample }} .each {
						println ".removed sample ${sample.name} from sampling event ${it} at ${it.getStartTimeString()}"
						it.removeFromSamples(sample)
					}

					// remove the sample from any assays it belongs to
					this.assays.findAll { it.samples.any { it == sample }} .each {
						println ".removed sample ${sample.name} from assay ${it.name}"
						it.removeFromSamples(sample)
					}

					// Also here, contrary to documentation, an extra delete() is needed
					// otherwise date is not properly deleted!
					sample.delete()
				}
			}

			// remove all samplingEvents from this eventGroup
			eventGroup.samplingEvents.findAll{}.each() {
				eventGroup.removeFromSamplingEvents(it)
				println ".removed samplingEvent '${it.name}' from eventGroup '${eventGroup.name}'"
				msg += ", samplingEvent '${it.name}' was removed from eventGroup '${eventGroup.name}'"
			}
		}

		// If the event group contains subjects
		if (eventGroup.subjects) {
			// remove all subject from this eventGroup
			eventGroup.subjects.findAll{}.each() {
				eventGroup.removeFromSubjects(it)
				println ".removed subject '${it.name}' from eventGroup '${eventGroup.name}'"
				msg += ", subject '${it.name}' was removed from eventGroup '${eventGroup.name}'"
			}
		}

		// remove the eventGroup from the study
		println ".remove eventGroup '${eventGroup.name}' from study '${this.title}'"
		this.removeFromEventGroups(eventGroup)

		// Also here, contrary to documentation, an extra delete() is needed
		// otherwise cascaded deletes are not properly performed
		eventGroup.delete()

		return msg
	}

    /**
     * Returns true if the given user is allowed to read this study
     */
    public boolean canRead(SecUser loggedInUser) {
        // Anonymous readers are only given access when published and public
        if( loggedInUser == null ) {
            return this.publicstudy && this.published;
        }

        // Owners and writers are allowed to read this study
        if( this.owner == loggedInUser || this.writers.contains(loggedInUser) ) {
            return true
        }
            
        // Readers are allowed to read this study when it is published
        if( this.readers.contains(loggedInUser) && this.published ) {
            return true
        }
        
        return false
    }

    /**
     * Returns true if the given user is allowed to write this study
     */
    public boolean canWrite(SecUser loggedInUser) {
        if( loggedInUser == null ) {
            return false;
        }
        return this.owner == loggedInUser || this.writers.contains(loggedInUser)
    }

    /**
     * Returns true if the given user is the owner of this study
     */
    public boolean isOwner(SecUser loggedInUser) {
        if( loggedInUser == null ) {
            return false;
        }
        return this.owner == loggedInUser
    }

}
