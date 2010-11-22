/**
 * Ontology chooser JavaScript class
 *
 * NCBO wrote it's own cross-site form completion utility
 * utilizing it's json webservice. However, the service is
 * no proper json service as it does not return proper json
 * objects (just a self designed string using | for value
 * breaks and ~!~ for line breaks. Also, their implementation
 * conflicts with the table editor. Therefore, I wrote this
 * cleaner implementation using jquery-ui's autocomplete
 * functionality.
 *
 * Usage:
 * ------
 * <input type="text" name="..." rel="ontology-all-name" />
 *
 * Where the 'rel' value is the similar as the 'class' value in
 * the NCBO documentation (bp_form_complete-all-name) but here
 * we use 'ontology' instead of 'bp_form_complete' to
 * identify ontology fields.
 *
 * N.B. In order to show the labels of the terms correctly (i.e.
 * no ugly HTML tags, you also have to include jquery.ui.autocomplete.html.js
 * in your page!
 *
 * @author		Jeroen Wesbeek
 * @since		20100312
 * @package		wizard
 * @requires	jquery, jquery-ui
 * @see			http://bioportal.bioontology.org/ontologies/
 * @see			http://bioportal.bioontology.org/search/json_search/?q=musculus
 *
 * Revision information:
 * $Rev$
 * $Author$
 * $Date$
 */
function OntologyChooser() {
}
OntologyChooser.prototype = {
	cache		: [],		// ontology cache
	ctrl		: false,	// work variable to search for copy/paste events
	noSearch	: false,	// work variable to disable/enable autocomplete search
	clipboard   : [],		// a clipboard to contain copied ontologies
	options		: {
		minLength	: 3,	// minimum input length before launching Ajax request
		showHide	: null,	// show / hide this DOM element on select/deselect autocomplete results
		spinner		: '../images/spinner.gif'
	},

	/**
	 * initialize object
	 */
	init: function(options) {
		var that = this;

		// set class parameters
		if (options) {
			$.each(options, function(key, value) {
				that.options[key] = value;
			});
		}

		// hide showHide div?
		if (this.options.showHide) {
			this.options.showHide.hide();
		}

		// find all ontology elements
		$("input[rel*='ontology']").each(function() {
			that.initAutocomplete(this);
		});
	},

	/**
	 * initialize the ontology autocomplete
	 * @param element
	 */
	initAutocomplete: function(element) {
		var that = this
		var inputElement = $(element);
		var selected = false;

		// determine what ontology to use
		var values = inputElement.attr('rel').split("-");
		var ontology_id = values[1];
		var target_property = values[2];
		if (ontology_id == "all") {
			ontology_id = "";
		}

		// handle ctrl or apple keys (to find ctrl-escape / ctrl-paste)
		inputElement.bind('keydown', function(e) {
			// check if ctrl-key or apple cmd key is pressed
			// to start capturing copy events
			if (e.keyCode == 17 || e.keyCode == 224) that.ctrl = true;

			// ignore ENTER key in inputElement so the form cannot
			// be submitted by pressing the ENTER key
			if (e.keyCode == 13) return false;

			// when a user uses the backspace the showHide element
			// (normally the button) gets hidden
			if (e.keyCode == 8 && that.options.showHide) that.options.showHide.hide();

			// check for 'copy' event
			if (e.keyCode == 67 && that.ctrl) return that.copy(inputElement);

			// check for 'paste' event
			if (e.keyCode == 86 && that.ctrl) return that.paste(inputElement);
		});

		// check if ctrl-key is released
		inputElement.bind('keyup', function(e) {
			// check if ctrl-key or apple cmd key is released
			// to start capturing paste events
			if (e.keyCode == 17 || e.keyCode == 224) that.ctrl = false;
		});

		// http://bioportal.bioontology.org/search/json_search/?q=musculus
		inputElement.autocomplete({
			minLength: that.options.minLength,
			delay: 300,
			search: function(event, ui) {
				// check if we need to skip searching, generally
				// after a paste event
				if (that.noSearch) {
					// yeah, skip search and reset value
					that.noSearch = false;
					return false;
				}

				// set the spinner
				if (that.options.spinner) {
					inputElement.css({ 'background': 'url(' + that.options.spinner + ') no-repeat right top' });
				}
				selected = false;
			},
			source: function(request, response) {
				var q = $.trim(request.term);
				var url = "http://bioportal.bioontology.org/search/json_search/" + ontology_id + "?q=" + request.term + "&response=json&callback=?";
				
				// got cache?
				if (that.cache[ q ]) {
					// hide spinner
					inputElement.css({ 'background': 'none' });

					// yeah, lucky us! ;-P
					response(that.cache[ q ]);
				} else {
					// nope, fetch it from NCBO
					$.getJSON(url, function(data) {
						// parse result data
						var result = that.parseData(data.data, ontology_id);

						// cache results
						that.cache[ q ] = result;

						// hide spinner
						inputElement.css({ 'background': 'none' });

						// no results?
						if (!data.data) {
							// hide showHide element?
							if (that.options.showHide) that.options.showHide.hide();

							// clear hidden fields
							that.setInputValue(inputElement, 'concept_id', null);
							that.setInputValue(inputElement, 'ontology_id', null);
							that.setInputValue(inputElement, 'ncbo_id', null);
							that.setInputValue(inputElement, 'full_id', null);							
						}

						// response callback
						response(result);
					});
				}
			},
			select: function(event, ui) {
				// mark that the user selected a suggestion
				selected = true;

				// option selected, set hidden fields
				var element = inputElement;

				// set hidden fields
				that.setInputValue(element, 'concept_id', ui.item.concept_id);
				that.setInputValue(element, 'ontology_id', ui.item.ontology_id);
				that.setInputValue(element, 'ncbo_id', ui.item.ncbo_id);
				that.setInputValue(element, 'full_id', ui.item.full_id);

				// remove error class (if present)
				element.removeClass('error');

				// show showHide element if set
				if (that.options.showHide) {
					that.options.showHide.show();
				}
			},
			close: function(event, ui) {
				// check if the user picked something from the ontology suggestions
				if (!selected) {
					// no he didn't, clear the field(s)
					var element = inputElement;

					// set fields
					inputElement.val('');
					that.setInputValue(element, 'concept_id', '');
					that.setInputValue(element, 'ontology_id', '');
					that.setInputValue(element, 'ncbo_id', '');
					that.setInputValue(element, 'full_id', '');

					// add error class
					element.addClass('error');
				}
			},
			html: true
		});
	},

	/**
	 * Set the value of a particular DOM element
	 * @param inputElement
	 * @param name
	 * @param value
	 */
	setInputValue: function(inputElement, name, value) {
		var elementName = inputElement.attr('name') + '-' + name;
		var searchElement = inputElement.parent().find("input[name='" + elementName + "']");

		// got a text/hidden field in the DOM?
		if (searchElement.size() > 0) {
			// yeah, set it
			$(searchElement[0]).val(value);
		} else {
			// no, dynamically insert it after the input element
			inputElement.after('<input type="hidden" name="' + elementName + '" value="' + value + '"/>');
		}
	},

	/**
	 * Get the value of a particular DOM element
	 * @param inputElement
	 * @param name
	 */
	getInputValue: function(inputElement, name) {
		var elementName = inputElement.attr('name') + '-' + name;
		var searchElement = inputElement.parent().find("input[name='" + elementName + "']");

		// got a text/hidden field in the DOM?
		return (searchElement.size() > 0) ? $(searchElement[0]).val() : '';
	},

	/**
	 * Parse the result data
	 *
	 * Data is in the following format:
	 * Mus musculus musculus|birnlex_161|preferred name|29684|http://bioontology.org/projects/ontologies/birnlex#birnlex_161|Mus musculus musculus|Mus musculus musculus|BIRNLex~!~
	 *
	 * Where | codes for a column break, and ~!~ for
	 * a line break
	 *
	 * @param data
	 * @return array
	 */
	parseData: function(data, ontology_ids) {
		var parsed = [];
		var rows = data.split('~!~');

		for (var i = 0; i < rows.length; i++) {
			var row = $.trim(rows[i]);
			if (row) {
				var cols = row.split('|');

				// If we search in a single ontology, the json doesn't return the
				// NCBO id in the 8th column (probably because we already know the NCBO id)
				var ncbo_id;
				if (cols.length > 8) {
					ncbo_id = cols[8];
				} else {
					ncbo_id = ontology_ids;
				}

				parsed[ parsed.length ] = {
					value			: cols[0],
					label			: cols[0] + ' <span class="about">(' + cols[2] + ')</span> <span class="from">from: ' + cols[ (cols.length - 2) ] + '</span>',
					preferred_name	: cols[0],  // e.g. Mus musculus musculus
					concept_id		: cols[1],  // e.g. birnlex_161
					ontology_id		: cols[3],  // e.g. 29684
					full_id			: cols[4],  // e.g. http://bioontology.org/projects/ontologies/birnlex#birnlex_161
					ncbo_id			: ncbo_id   // e.g. 1494
				}
			}
		}

		return parsed;
	},

	/**
	 * an ontology field is being copied, store all copied data
	 * in the clipboard
	 * @param inputElement source input element
	 */
	copy: function(inputElement) {
		this.clipboard = {
			sourceValue		: $(inputElement).val(),
			concept_id		: this.getInputValue(inputElement, 'concept_id'),
			ontology_id		: this.getInputValue(inputElement, 'ontology_id'),
			ncbo_id			: this.getInputValue(inputElement, 'ncbo_id'),
			full_id			: this.getInputValue(inputElement, 'full_id')
		}
		return false;
	},

	/**
	 * paste an copied ontology (if present)
	 * @param inputElement target input element
	 */
	paste: function(inputElement) {
		// can we paste an ontology?
		if (this.clipboard.sourceValue &&
			this.clipboard.concept_id &&
			this.clipboard.ncbo_id &&
			this.clipboard.full_id) {

			// check if this target ontology field can accept this copied ontology
			var pattern = new RegExp(this.clipboard.ncbo_id);
			if (inputElement.attr('rel').match(pattern) || inputElement.attr('rel').match(/all/)) {
				// yes, disable search
				this.noSearch = true;

				// paste values
				$(inputElement).val(this.clipboard.sourceValue);
				this.setInputValue(inputElement, 'concept_id', this.clipboard.concept_id);
				this.setInputValue(inputElement, 'ontology_id', this.clipboard.ontology_id);
				this.setInputValue(inputElement, 'ncbo_id', this.clipboard.ncbo_id);
				this.setInputValue(inputElement, 'full_id', this.clipboard.full_id);
			}
		}
		return false;
	}
}