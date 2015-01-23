define(["jquery", "sprintf", "mobiscroll", "validate", "jqgrid", "app/demo.globals", "app/demo.utility"],
    function($, sp, scroller, validate, jqgrid, globals, utility)
{
//    "use strict"; // Can't be used in this script due to the use of 'eval' for complex

    var navEntries,
        pages,
        onePage,
        pageIds,
        gridSizeCodes = ["a", "b", "c", "d", "e"],
        formElements = [],
        multiTables = [],

        grids = [],

        validationRules = {},

        currentSection = ""
    ;

    var mobiOpts = {
        'datetime':
        {
            preset: 'datetime',
            //minDate: new Date(2014, 1, 10, 9, 22),
            //maxDate: new Date(2014, 7, 30, 15, 44),
            stepMinute: 1,
            showNow: true
        },
        'date':
        {
            preset: 'date'
        }
    };

    var datePickerOpts =
    {
        theme: "jqm",
        display: "modal",
        mode: "scroller",
        lang: "en",
        animation: ""
    };


    var datetimePickerOpts =
    {
        theme: "jqm",
        display: "modal",
        mode: "scroller",
        lang: "en",
        animation: "",
        timeWheels: "HHii",
        timeFormat: "HH:ii"
    };

    var jqGridControlMap = { "textbox": "string", "checkbox": "bool", "datetimeinput": "date", "numberfield": "number", "dropdownlist": "string" };


    //==============================================
    // HTML templates
    //==============================================

    // Page container template
    var tmplPageContainer = "<div data-role='page' id='%s'><div data-role='header' data-position='fixed' data-tap-toggle='false'><h1>%s</h1><a href='#pnlNavGlobal' class='ui-btn ui-icon-bars ui-btn-icon-left'>%s</a></div><div role='main' class='ui-content'>%s</div><div data-role='footer'><h5>&copy 2014 BAY</h5></div>";

    // Navigation entry template
    //var tmplNavEntry = "<a href='#%s' id='%s' class='ui-btn itemSpecific' style='display: none;'>%s</a>";
    var tmplNavEntry = "<a href='#%s' id='%s' class='ui-btn itemSpecific'>%s</a>";

    // Grid templates
    var tmplGridContainer = "<div class='ui-grid-%s'>%s</div>";
    var tmplGridItemContainer = "<div class='ui-block-%s'>%s</div>";

    // Heading template
    var tmplHeading = "<h3 class='ui-bar ui-bar-a ui-corner-all'>%s</h3>";

    // Label template
    var  tmplLabel = "<label for='%s'>%s</label>";

    // Textbox wrapper template
    var tmplTextboxWrap = "<div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset ui-input-has-clear'>%s<a href='#' class='ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-input-clear-hidden' title='Clear text'>Clear text</a></div>"

    // Checkbox templates
    var tmplCheckboxSingle = "<div class='ui-checkbox'><label for='%s' class='ui-btn ui-btn-inherit ui-btn-icon-left ui-checkbox-off ui-corner-all'>%s</label><input type='checkbox' id='%s' name='%s' value='%s' data-enhanced='true'/></div>";
    var tmplCheckboxGroupHorizontalContainer = "<fieldset data-role='controlgroup' data-type='horizontal' class='ui-controlgroup ui-controlgroup-horizontal ui-corner-all'><div role='heading' class='ui-controlgroup-label'><legend>%s</legend></div><div class='ui-controlgroup-controls'>%s</div></fieldset>";
    var tmplCheckboxGroupHorizontalItem = "<div class='ui-checkbox'><label for='%s' class='ui-btn ui-corner-all ui-btn-inherit %s ui-checkbox-off'>%s</label><input id='%s' name='%s' value='%s' type='checkbox' data-enhanced='true'/></div>";
    var tmplCheckboxGroupVerticalContainer = "<fieldset data-role='controlgroup' class='ui-controlgroup ui-controlgroup-vertical ui-corner-all'><div role='heading' class='ui-controlgroup-label'><legend>%s</legend></div><div class='ui-controlgroup-controls'>%s</div></fieldset>";
    var tmplCheckboxGroupVerticalItem = "<div class='ui-checkbox'><label for='%s' class='ui-btn ui-corner-all ui-btn-inherit %s ui-checkbox-off'>%s</label><input id='%s' name='%s' value='%s' type='checkbox' data-enhanced='true'/></div>";

    // Textbox templates
    var tmplTextbox = "<input type='text' data-clear-btn='true' id='%s' name='%s' placeholder='%s' data-enhanced='true' maxlength='%s'/>";
    var tmplNumberbox = "<input type='number' data-clear-btn='true' id='%s' name='%s' placeholder='%s' data-enhanced='true' maxlength='%s' pattern='[0-9]*'/>";
    var tmplTimebox = "<input type='time' data-clear-btn='true' id='%s' name='%s' placeholder='%s' data-enhanced='true' maxlength='%s'/>";
    var tmplPhonebox = "<input type='tel' data-clear-btn='true' id='%s' name='%s' placeholder='%s' data-enhanced='true' maxlength='%s'/>";
    var tmplDatetime = "<input type='text' data-clear-btn='true' class='datetimepicker' id='%s' name='%s' placeholder='%s' data-enhanced='true' />";
    var tmplDate = "<input type='text' data-clear-btn='true' class='datepicker' id='%s' name='%s' placeholder='%s' data-enhanced='true' />";

    // Textarea template
    var tmplTextarea = "<textarea id='%s' name='%s' placeholder='%s'></textarea>";

    // Radio templates
    var tmplRadioSingle = "<div class='ui-radio'><label for='%s' class='ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-radio-off'>%s</label><input id='%s' name='%s' value='%s' type='radio' data-enhanced='true'/></div>";
    var tmplRadioHorizontalContainer = "<fieldset data-role='controlgroup' data-type='horizontal' class='ui-controlgroup ui-controlgroup-horizontal ui-corner-all'><div role='heading' class='ui-controlgroup-label'><legend>%s</legend></div><div class='ui-controlgroup-controls'>%s</div></fieldset>";
    var tmplRadioHorizontalItem = "<div class='ui-radio'><label for='%s' class='ui-btn ui-corner-all ui-btn-inherit %s ui-radio-off'>%s</label><input id='%s' name='%s' value='%s' type='radio' data-enhanced='true'/></div>";
    var tmplRadioVerticalContainer = "<fieldset data-role='controlgroup' class='ui-controlgroup ui-controlgroup-vertical ui-corner-all'><div role='heading' class='ui-controlgroup-label'><legend>%s</legend></div><div class='ui-controlgroup-controls'>%s</div></fieldset>";
    var tmplRadioVerticalItem = "<div class='ui-radio'><label for='%s' class='ui-btn ui-corner-all ui-btn-inherit %s ui-radio-off'>%s</label><input id='%s' name='%s' value='%s' type='radio' data-enhanced='true'/></div>";

    // Subsection template
    var tmplSubsection = "<div data-role='collapsible' data-theme='b' data-content-theme='a' data-collapsed='%s'><h4>%s</h4>%s</div>";

    // Signature template
    var tmplSignature = "<h3 class='ui-bar ui-bar-a ui-corner-all'>%s</h3><div style='%s'><canvas id='%s' class='signature' style='cursor: crosshair;'></canvas></div><a href='#' data-canvasid='%s' class='ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all clearSignature'>No text</a>";

    // Multitable templates
    //var tmplMultiTableContainerBodyCol = "<td data-fieldname='%s'><input type='text' /></td>";
    //var tmplMultiTableContainer = "<h4>%s<h4><table id='%s' data-role='table' class='ui-responsive multitable' data-multiname='%s' width='100%%'><thead><tr>%s</tr></thead><tbody><tr style='display:none;'>%s</tr></tbody><tfoot><tr><td colspan='%s'>%s</td></tr></tfoot></table>";
    var tmplMultiTableContainer = "<h4>%s<h4><table id='%s' data-role='table' class='ui-responsive multitable' data-multiname='%s' width='100%%'><thead><tr>%s</tr></thead><tbody></tbody><tfoot><tr><td colspan='%s'>%s</td></tr></tfoot></table>";


    var tmplMultiTableContainerHeaderCol = "<th data-fieldname='%s'>%s</th>";
    var tmplMultiTableContainerBodyCol = "<td data-fieldname='%s'>%s</td>";
    var tmplMultiTableRemoveCell = "<td width='5%'><button class='ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-minus ui-btn-icon-notext'>minus</button></td>";
    var tmplMultiTableAddButton = "<button class='ui-btn ui-shadow ui-corner-all ui-btn-icon-right ui-icon-plus'>%s</button>";

    // Selectmenu templates (these elements don't support pre-enhancement, coming in JQM 1.5)
    var tmplSelectMenuLabel = "<label for='%s' class='select'>%s</label>";
    var tmplSelectMenuVertical = "<select id='%s' name='%s' data-mini='%s' %s %s>%s</select>";
    var tmplSelectMenuHorizontalContainer = "<div class='ui-field-contain'>%s</div>";

    // Guidebutton template
    var tmplGuideButton = "<a href='#%s' data-rel='popup' data-position-to='window' class='ui-btn ui-corner-all ui-shadow' data-transition='pop'>%s</a><div data-role='popup' id='%s' class='ui-content' data-theme='b' data-overlay-theme='b' data-corners='false'><a href='#' data-rel='back' class='ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right'>Close</a><img src='%s' style='max-height:512px;' alt=''></div>";

    // Flipswitch template
    var tmplFlipswitch = "<div class='ui-flipswitch ui-shadow-inset ui-bar-inherit ui-corner-all'><span class='ui-flipswitch-on ui-btn ui-shadow ui-btn-inherit'>%s</span><span class='ui-flipswitch-off'>%s</span><input type='checkbox' data-role='flipswitch' data-enhanced='true' data-corners='true' id='%s' name='%s' value='%s' class='ui-flipswitch-input'></div>";

    // Manny template
    var tmplManny = "<h3 class='ui-bar ui-bar-a ui-corner-all'>%s</h3><a href='#' data-canvasid='%s' class='ui-btn ui-icon-delete ui-btn-inline ui-corner-all clearManny'>%s</a><div style='%s'><canvas id='%s' class='manny' style='cursor: crosshair;' data-bgimage='%s' data-brushcolor='%s'></canvas></div><textarea id='%s' name='%s'></textarea><a href='#' data-canvasnotesid='%s' class='ui-btn ui-icon-delete ui-btn-inline ui-corner-all clearMannyNotes'>%s</a>";

    // jqGrid template
    var tmplJqGrid = "<div id='%s' class='tablegrid'></div>";


    //==============================================
    
    var parseFormDefinition = function(formData)
    {
        utility.p("Parsing form definition");

        if(formData.hasOwnProperty("listDisplayFormat"))
        {
            globals.setListDisplayFormat(formData.listDisplayFormat);
        }

        if(formData.sections && $.isArray(formData.sections))
        {
            utility.p("Found [" + formData.sections.length + "] sections");

            for(var i = 0; i < formData.sections.length; i++)
            {
                var oneSection = formData.sections[i];

                if(oneSection.visible)
                {

                    currentSection = oneSection.id;

                    onePage = new Array();

                    pageIds.push("#" + oneSection.id);

                    // Add entry to navigation
                    navEntries.push(sp.vsprintf(tmplNavEntry, [oneSection.id, oneSection.linkId, globals.getLocalizedResources()[oneSection.labelKey]]));

                    // Parse form elements
                    if(oneSection.elements && $.isArray(oneSection.elements))
                    {
                        parseSection(oneSection);
                    }

                    var pageContents = "";
                    for(var j = 0; j < onePage.length; j++) { pageContents += onePage[j]; }

                    var headerTitle = globals.getLocalizedResources()["global_appTitle"] + " - " + globals.getLocalizedResources()[oneSection.labelKey];
                    pages.push(sp.vsprintf(tmplPageContainer, [oneSection.id, headerTitle, globals.getLocalizedResources()["global_menu"], pageContents]));
                }
            }

            var navHtml = "";
            for(var i = 0; i < navEntries.length; i++) { navHtml += navEntries[i]; }
            $(navHtml).insertAfter("#pnlNavGlobal a:first");

            $.each(pages, function(index, value)
            {
                $(value).appendTo(globals.getFormId());
            });

            $(generateDeveloperSection()).appendTo(globals.getFormId());

            // Setup any multitables
            if(multiTables.length > 0) { setupMultiTables(); }

            // Setup any jqGrids
            if(grids.length > 0) { setupJqGrids(); }

            // Init any date/datetime pickers
            $(".datepicker").scroller($.extend(mobiOpts["date"], datePickerOpts));
            $(".datetimepicker").scroller($.extend(mobiOpts["datetime"], datetimePickerOpts));

            // Init annotorious
            //anno.makeAnnotatable(document.getElementById("btest"));

            // Store page IDs
            globals.setFormPages(pageIds);

            // Store form elements for faster access
            //console.log(formElements);
            globals.setFormElements(formElements);

            // Store validation rules for later use
            globals.setValidationRules(validationRules);

        }
    };

    var parseSection = function(section)
    {
        //utility.p("Parsing [" + section.elements.length + "] elements in section [" + section.id + "]");
        for(var i = 0; i < section.elements.length; i++)
        {
            var el = section.elements[i];
            if(el.type && (el.visible == undefined || el.visible)) // Make sure it has a type and it's marked as visible
            {
                var html = parseElement(el);
                if(html !== "")
                {
                    onePage.push(html);
                }
            }
        }
    };

    var parseElement = function(elem, addToElemList)
    {
        addToElemList = typeof addToElemList !== "undefined" ?  addToElemList : true;

        var el = elem;
        var html = "";

        switch (el.type)
        {
            case "checkboxsingle":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseCheckboxSingle(el);
                break;

            case "checkboxgroup":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseCheckboxGroup(el);
                break;

            case "text":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseTextbox(el);
                break;

            case "number":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseNumberbox(el);
                break;

            case "time":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseTimebox(el);
                break;

            case "phone":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parsePhonebox(el);
                break;

            case "textarea":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseTextarea(el);
                break;

            case "radiosingle":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseRadioSingle(el);
                break;

            case "radiogroup":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseRadioGroup(el);
                break;

            case "datetime":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseDateTime(el);
                break;

            case "date":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseDate(el);
                break;

            case "signature":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseSignature(el);
                break;

            case "multitable":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, fields: el.fields, section: currentSection }); }
                html = parseMultiTable(el);
                break;

            case "subsection":
                html = parseSubsection(el);
                break;

            case "grid":
                html = parseGrid(el);
                break;

            case "heading":
                html = parseHeading(el);
                break;

            case "select":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseSelectMenu(el);
                break;

            case "guideButton":
                html = parseGuideButton(el);
                break;

            case "flipswitch":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseFlipswitch(el);
                break;

            case "manny":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseManny(el);
                break;

            case "tablegrid":
                if(addToElemList) { formElements.push({ id: el.id, type: el.type, section: currentSection }); }
                html = parseTableGrid(el);
                break;

            default:
                utility.p("Unknown element type: [" + el.type + "], ignoring");
                break;
        }

        if(html !== "" && el.hasOwnProperty("validation"))
        {
            applyValidation(el);
        }

        return html;
    };

    var parseHeading = function(e)
    {
        //utility.p("Parsing heading: [" + e.id + "]");

        return sp.vsprintf(tmplHeading, [globals.getLocalizedResources()[e.labelKey]]);
    };

    var parseTextbox = function(e)
    {
        //utility.p("Parsing textbox: [" + e.id + "]");

        var wrap = tmplTextboxWrap;
        var html = "";
        var i = "";

        if(e.labelMode)
        {
            switch(e.labelMode)
            {
                case "label":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplTextbox, [e.id, e.id, "", e.maxlength]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    break;

                case "placeholder":
                    i = sp.vsprintf(tmplTextbox, [e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    html = sp.vsprintf(wrap, [i]);
                    break;

                case "both":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplTextbox, [e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    break;

                case "none":
                    i = sp.vsprintf(tmplTextbox, [e.id, e.id, "", e.maxlength]);
                    i = $(i).removeAttr("id").removeAttr("name")[0].outerHTML;
                    html = sp.vsprintf(wrap, [i]);
                    break;
            }
        }

        return html;
    };

    var parseTextarea = function(e)
    {
        //utility.p("Parsing textarea: [" + e.id + "]");

        var wrap = tmplTextarea;
        var html = "";
        var i = "";

        if(e.labelMode)
        {
            switch(e.labelMode)
            {
                case "label":
                    wrap = tmplLabel + wrap;
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], e.id, e.id, ""]);
                    break;
                    break;

                case "placeholder":
                    html = sp.vsprintf(tmplTextarea, [e.id, e.id, globals.getLocalizedResources()[e.labelKey]]);
                    break;

                case "both":
                    wrap = tmplLabel + wrap;
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], e.id, e.id, globals.getLocalizedResources()[e.labelKey]]);
                    break;

                case "none":
                    html = sp.vsprintf(tmplTextarea, [e.id, "", e.id, e.id, ""]);
                    break;
            }
        }

        return html;
    };

    var parseNumberbox = function(e)
    {
        //utility.p("Parsing numberbox: [" + e.id + "]");

        var wrap = tmplTextboxWrap;
        var html = "";
        var i = "";

        if(e.labelMode)
        {

            switch(e.labelMode)
            {
                case "label":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplNumberbox, [e.id, e.id, "", e.maxlength]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    //html = sp.vsprintf(tmplNumberbox, [e.id, globals.getLocalizedResources()[e.labelKey], e.id, e.id, "", e.maxlength]);
                    break;

                case "placeholder":
                    i = sp.vsprintf(tmplNumberbox, [e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    html = sp.vsprintf(wrap, [i]);
                    //html = sp.vsprintf(tmplNumberbox, [e.id, "", e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    break;

                case "both":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplNumberbox, [e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    //html = sp.vsprintf(tmplNumberbox, [e.id, globals.getLocalizedResources()[e.labelKey], e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    break;

                case "none":
                    i = sp.vsprintf(tmplNumberbox, [e.id, e.id, "", e.maxlength]);
                    i = $(i).removeAttr("id").removeAttr("name")[0].outerHTML;
                    html = sp.vsprintf(wrap, [i]);
                    break;
            }
        }

        return html;
    };

    var parseTimebox = function(e)
    {
        //utility.p("Parsing timebox: [" + e.id + "]");

        var wrap = tmplTextboxWrap;
        var html = "";
        var i = "";

        if(e.labelMode)
        {
            switch(e.labelMode)
            {
                case "label":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplTimebox, [e.id, e.id, "", e.maxlength]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey],i]);
                    break;

                case "placeholder":
                    i = sp.vsprintf(tmplNumberbox, [e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    html = sp.vsprintf(wrap, [i]);
                    break;

                case "both":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplTimebox, [e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    break;

                case "none":
                    html = sp.vsprintf(tmplTimebox, [e.id, "", e.id, e.id, ""]);
                    break;
            }
        }

        return html;
    };

    var parsePhonebox = function(e)
    {
        var wrap = tmplTextboxWrap;
        var html = "";
        var i = "";

        if(e.labelMode)
        {
            switch(e.labelMode)
            {
                case "label":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplPhonebox, [e.id, e.id, "", e.maxlength]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey],i]);
                    break;

                case "placeholder":
                    i = sp.vsprintf(tmplPhonebox, [e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    html = sp.vsprintf(wrap, [i]);
                    break;

                case "both":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplPhonebox, [e.id, e.id, globals.getLocalizedResources()[e.labelKey], e.maxlength]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    break;

                case "none":
                    i = sp.vsprintf(tmplPhonebox, [e.id, "", e.id, e.id, ""]);
                    html = sp.vsprintf(wrap, [i]);
                    break;
            }
        }

        return html;
    };

    var parseCheckboxSingle = function(e)
    {
        //utility.p("Parsing checkboxsingle: [" + e.id + "]");

        return sp.vsprintf(tmplCheckboxSingle, [e.id, globals.getLocalizedResources()[e.labelKey], e.id, e.name, e.value]);
    };

    var parseCheckboxGroup = function(e)
    {
        //utility.p("Parsing checkboxgroup: [" + e.id + "]");

        var html = "";
        if(e.orientation && e.choices && $.isArray(e.choices) && e.choices.length > 1)
        {
            var items = "";
            for(var i = 0; i < e.choices.length; i++)
            {
                var item = e.choices[i];
                var bookendClass = "";

                if(i == 0) { bookendClass = "ui-first-child"; }
                else if(i == (e.choices.length - 1)) { bookendClass = "ui-last-child"; }

                if(e.orientation === "H")
                {
                    items += sp.vsprintf(tmplCheckboxGroupHorizontalItem, [item.id, bookendClass, globals.getLocalizedResources()[item.labelKey], item.id, e.id, item.value]);
                }
                else
                {
                    items += sp.vsprintf(tmplCheckboxGroupVerticalItem, [item.id, bookendClass, globals.getLocalizedResources()[item.labelKey], item.id, e.id, item.value]);
                }
            }

            if(e.orientation === "H")
            {
                html = sp.vsprintf(tmplCheckboxGroupHorizontalContainer, [globals.getLocalizedResources()[e.labelKey], items]);
            }
            else
            {
                html = sp.vsprintf(tmplCheckboxGroupVerticalContainer, [globals.getLocalizedResources()[e.labelKey], items]);
            }
        }

        return html;
    };

    var parseRadioSingle = function(e)
    {
        //utility.p("Parsing radiosingle: [" + e.id + "]");

        return sp.vsprintf(tmplRadioSingle, [e.id, globals.getLocalizedResources()[e.labelKey], e.id, e.name, e.value]);
    };

    var parseRadioGroup = function(e)
    {
        //utility.p("Parsing radio: [" + e.id + "]");

        var html = "";
        if(e.orientation && e.choices && $.isArray(e.choices) && e.choices.length > 1)
        {
            var items = "";
            for(var i = 0; i < e.choices.length; i++)
            {
                var item = e.choices[i];
                var bookendClass = "";

                if(i == 0) { bookendClass = "ui-first-child"; }
                else if(i == (e.choices.length - 1)) { bookendClass = "ui-last-child"; }

                if(e.orientation === "H")
                {
                    items += sp.vsprintf(tmplRadioHorizontalItem, [item.id, bookendClass, globals.getLocalizedResources()[item.labelKey], item.id, e.id, item.value]);
                }
                else
                {
                    items += sp.vsprintf(tmplRadioVerticalItem, [item.id, bookendClass, globals.getLocalizedResources()[item.labelKey], item.id, e.id, item.value]);
                }
            }

            if(e.orientation === "H")
            {
                html = sp.vsprintf(tmplRadioHorizontalContainer, [globals.getLocalizedResources()[e.labelKey], items]);
            }
            else
            {
                html = sp.vsprintf(tmplRadioVerticalContainer, [globals.getLocalizedResources()[e.labelKey], items]);
            }
        }

        return html;
    };

    var parseDateTime = function(e)
    {
        //utility.p("Parsing datetime: [" + e.id + "]");


        var wrap = tmplTextboxWrap;
        var html = "";
        var i = "";

        if(e.labelMode)
        {
            switch(e.labelMode)
            {
                case "label":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplDatetime, [e.id, e.id, ""]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    break;

                case "placeholder":
                    i = sp.vsprintf(tmplDatetime, [e.id, e.id, globals.getLocalizedResources()[e.labelKey]]);
                    html = sp.vsprintf(wrap, [i]);
                    break;

                case "both":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplDatetime, [e.id, e.id, globals.getLocalizedResources()[e.labelKey]]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    break;

                case "none":
                    i = sp.vsprintf(tmplDatetime, [e.id, e.id, ""]);
                    i = $(i).removeAttr("id").removeAttr("name").removeAttr("placeholder")[0].outerHTML;
                    html = sp.vsprintf(wrap, [i]);
                    break;
            }
        }

        return html;
    };

    var parseDate = function(e)
    {
        //utility.p("Parsing date: [" + e.id + "]");

        var wrap = tmplTextboxWrap;
        var html = "";
        var i = "";

        if(e.labelMode)
        {
            switch(e.labelMode)
            {
                case "label":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplDate, [e.id, e.id, ""]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    break;

                case "placeholder":
                    i = sp.vsprintf(tmplDate, [e.id, e.id, globals.getLocalizedResources()[e.labelKey]]);
                    html = sp.vsprintf(wrap, [i]);
                    break;

                case "both":
                    wrap = tmplLabel + wrap;
                    i = sp.vsprintf(tmplDate, [e.id, e.id, globals.getLocalizedResources()[e.labelKey]]);
                    html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], i]);
                    break;

                case "none":
                    i = sp.vsprintf(tmplDate, [e.id, "", e.id, e.id, ""]);
                    html = sp.vsprintf(wrap, [i]);
                    break;
            }
        }

        return html;
    };

    var parseSignature = function(e)
    {
        //utility.p("Parsing signature: [" + e.id + "]");

        return sp.vsprintf(tmplSignature, [globals.getLocalizedResources()[e.labelKey], e.containerStyle, e.id, e.id]);
    };

    var parseMultiTable = function(e)
    {
        //utility.p("Parsing multitable: [" + e.id + "]");

         var tableRow = "";
         var tableHeaders = "";

        if(e.fields && $.isArray(e.fields) && e.fields.length > 0)
        {
            multiTables.push(e.id);

            var colCount = e.fields.length + 1;

            for(var i = 0; i < e.fields.length; i++)
            {
                var f = e.fields[i];
                tableHeaders += sp.vsprintf(tmplMultiTableContainerHeaderCol, [f.id, globals.getLocalizedResources()[f.labelKey]]);

                //var elem = parseElement(f.element);
                //console.log(elem);
                //tableRow += sp.vsprintf(tmplMultiTableContainerBodyCol, [f.id, elem]);
            }
            tableHeaders += "<th></th>"; // Needed for remove button
            //tableRow += tmplMultiTableRemoveCell;
        }

        var addButton = sp.vsprintf(tmplMultiTableAddButton, [globals.getLocalizedResources()[e.addButtonLabelKey]]);

        //return sp.vsprintf(tmplMultiTableContainer, [globals.getLocalizedResources()[e.labelKey], e.id, e.id, tableHeaders, tableRow, colCount, addButton]);
        return sp.vsprintf(tmplMultiTableContainer, [globals.getLocalizedResources()[e.labelKey], e.id, e.id, tableHeaders, colCount, addButton]);
    };

    var parseSubsection = function(e)
    {
        //utility.p("Parsing subsection: [" + e.id + "]");

        var html = "";
        if(e.elements && $.isArray(e.elements) && e.elements.length > 0)
        {
            for(var i = 0; i < e.elements.length; i++)
            {
                var el = e.elements[i];
                if(el.type && el.visible)
                {
                    var c = parseElement(el);
                    if(c !== "") { html += c; }
                }
            }
        }

        return sp.vsprintf(tmplSubsection, [!e.expanded, globals.getLocalizedResources()[e.labelKey], html]);
    };

    var parseGrid = function(e)
    {
        //utility.p("Parsing grid: [" + e.id + "]");

        var html = "";
        if(e.elements && $.isArray(e.elements) && e.elements.length > 0)
        {
            var currentColItem = 0;
            for(var i = 0; i < e.elements.length; i++)
            {
                var el = e.elements[i];
                if(el.type && el.visible)
                {
                    var c = parseElement(el);
                    if(c !== "")
                    {
                        var c = sp.vsprintf(tmplGridItemContainer, [gridSizeCodes[currentColItem], c]);
                        html += c;
                        if(currentColItem === (e.columns - 1))
                        {
                            currentColItem = 0;
                        }
                        else
                        {
                            currentColItem += 1;
                        }
                    }
                }
            }
        }

        return sp.vsprintf(tmplGridContainer, [gridSizeCodes[e.columns-2], html]);
    };

    var parseSelectMenu = function(e)
    {
        //utility.p("Parsing select: [" + e.id + "]");

        var html = "";

        if(e.orientation && e.choices && $.isArray(e.choices) && e.choices.length > 1)
        {
            var selectedVal = "";
            if(e.hasOwnProperty("selectedValue") && !e.multiple)
            {
                selectedVal = e.selectedValue;
            }

            var items = "";
            for(var i = 0; i < e.choices.length; i++)
            {
                var item = e.choices[i];
                if(item.value === selectedVal)
                {
                    items += "<option value='" + item.value + "' selected='selected'>" + globals.getLocalizedResources()[item.labelKey] + "</option>";
                }
                else
                {
                    items += "<option value='" + item.value + "'>" + globals.getLocalizedResources()[item.labelKey] + "</option>";
                }
            }

            var customMenu = "data-native-menu='false'";
            if(!e.useCustomMenu) { customMenu = ""; }

            var multiple = "multiple='multiple'";
            if(!e.multiple || !e.useCustomMenu) { multiple = ""; } // Multiple wont work in JQM unless custom menus are used

            var mini = true;
            if(!e.mini) { mini = false; }

            if(e.orientation === "V" || e.orientation === "H")
            {
                var wrap = tmplSelectMenuLabel + tmplSelectMenuVertical;
                html = sp.vsprintf(wrap, [e.id, globals.getLocalizedResources()[e.labelKey], e.id, e.id, mini, customMenu, multiple, items]);

                if(e.orientation === "H")
                {
                    html = sp.vsprintf(tmplSelectMenuHorizontalContainer, [html]);
                }
            }
            else if(e.orientation === "N")
            {
                html = sp.vsprintf(tmplSelectMenuVertical, [e.id, e.id, mini, customMenu, multiple, items]);
                html = $(html).removeAttr("id").removeAttr("name")[0].outerHTML;
            }
        }

        return html;
    };

    var parseFlipswitch = function(e)
    {
        //utility.p("Parsing flipswitch: [" + e.id + "]");

        if(!e.includeLabel)
        {
            var t = sp.vsprintf(tmplFlipswitch, [globals.getLocalizedResources()[e.labelOnKey], globals.getLocalizedResources()[e.labelOffKey], e.id, e.id, e.value]);
            return $(t).removeAttr("id").removeAttr("name")[0].outerHTML;
        }

        var tmpl = tmplLabel + tmplFlipswitch;
        return sp.vsprintf(tmpl, [e.id, globals.getLocalizedResources()[e.labelKey], globals.getLocalizedResources()[e.labelOnKey], globals.getLocalizedResources()[e.labelOffKey], e.id, e.id, e.value]);
    };

    var parseGuideButton = function(e)
    {
        //utility.p("Parsing guide button: [" + e.id + "]");

        var html = "";

        // TODO: Localize images
        html = sp.vsprintf(tmplGuideButton, [e.id, globals.getLocalizedResources()[e.labelKey], e.id, e.imagePath]);

        return html;
    };

    var parseManny = function(e)
    {
        //utility.p("Parsing paperdoll: [" + e.id + "]");
        var textareaId = "notes-" + e.id;
        return sp.vsprintf(tmplManny, [globals.getLocalizedResources()[e.labelKey], e.id, globals.getLocalizedResources()["mnHeadToToeExam_clearManny"], e.containerStyle, e.id, e.imageUrl, e.brushColor, textareaId, textareaId, textareaId, globals.getLocalizedResources()["mnHeadToToeExam_clearNotes"] ]);
    };

    var parseTableGrid = function(e)
    {
        if(e.fields && $.isArray(e.fields) && e.fields.length > 0)
        {
            grids.push(e);

            return sp.vsprintf(tmplJqGrid, [e.id]);
        }
    };

    var setupMultiTables = function()
    {
        for(var i = 0; i < multiTables.length; i++)
        {
            var elems = [];
            var mtData = utility.findInObjectLiteral(formElements, "id", multiTables[i]);

            //console.log(mtData);

            for(var z = 0; z < mtData.length; z++)
            {
                var fields = mtData[z].fields;
                //console.log(fields);

                for(var j = 0; j < fields.length; j++)
                {
                    elems.push({ id: fields[j].id , element: fields[j].element});
                }

                //console.log(elems);

                var tbl = $("#" + multiTables[i]);
                var addBtn = tbl.find("tfoot button");

                addBtn.click({ table: tbl, elements: elems }, function(e)
                {
                    //console.log(e.data);
                    e.preventDefault();
                    setupMultiTableRow(e.data.table, e.data.elements);
                });
            }
        }
    };

    var setupMultiTableRow = function(tbl, elems, vals)
    {
        var row = "<tr>";
        for(var i = 0; i < elems.length; i++)
        {
            var h = parseElement(elems[i].element, false);
            //console.log(h);
            row += "<td data-fieldname='" + elems[i].id + "' data-fieldtype='" + elems[i].element.type + "'>" + h + "</td>";
        }
        row += tmplMultiTableRemoveCell;
        row += "</tr>";

        //tbl.find("tbody").append(row).trigger("create");
        tbl.find("tbody").append(row);

        if(vals)
        {
            $.each(tbl.find("tbody").find("td"), function()
            {
                if($(this).data("fieldname"))
                {
                    var v = vals[$(this).data("fieldname")];
                    var e = $(this).find(":input");

                    switch(e.attr("type"))
                    {
                        case "text":
                        case "number":
                        case "tel":
                        {
                            e.val(v);
                            break;
                        }
                        case "checkbox":
                        {
                            if(v !== null) { e.prop("checked", true);}
                            break;
                        }
                        case undefined:

                            switch(e.prop("tagName"))
                            {
                                case "SELECT":
                                {
                                    e.val(v);
                                    break;
                                }
                            }
                            break;
                    }
                }
            });
        }

        // Initialize JQM widgets
        tbl.find("tbody").trigger("create");

        // Refresh any flipswitches with their set values
        var fs = tbl.find("td[data-fieldtype='flipswitch']").find(":input");
        if(fs.length > 0) { fs.flipswitch("refresh"); }

        // Setup any datetime pickers
        tbl.find(".datetimepicker").scroller($.extend(mobiOpts["datetime"], datetimePickerOpts));

        // Setup remove button event
        tbl.find("tbody :button").click(function(e)
        {
            e.preventDefault();
            var $tr = $(this).closest("tr");
            $tr.remove();
        });
    };

    var applyValidation = function(e)
    {
        // TODO: Code validation stuff

        if(e.validation.hasOwnProperty("rules"))
        {
            utility.p("Applying validation rules for [" + e.id + "]");

            if(e.validation.rules.hasOwnProperty("messages"))
            {
                $.each(e.validation.rules.messages, function(key, val)
                {
                    e.validation.rules.messages[key] = globals.getLocalizedResources()[val];
                });
            }

            if(e.validation.rules.hasOwnProperty("required"))
            {
                if(typeof(e.validation.rules.required) === "string")
                {
                    // Complex rule, convert to obj literal.
                    var obj = eval("(" + e.validation.rules.required + ")");
                    e.validation.rules.required = obj;
                }
            }

            validationRules[e.id] = e.validation.rules;
        }
    };

    var generateDeveloperSection = function()
    {
        return "<div data-role='page' id='pgDevTools'>"
            + "<div data-role='header' data-position='fixed' data-tap-toggle='false'>"
            + "<h1>Developer Tools</h1>"
            + "<a href='#pnlNavGlobal' class='ui-btn ui-icon-bars ui-btn-icon-left'>" + globals.getLocalizedResources()["global_menu"] + "</a>"
            + "</div>"
            + "<div role='main' class='ui-content'>"
            + "<p>Language File</p>"
            + "<input type='text' id='tbDevLanguageFile' value='' class='ignore'/>"
            + "<p>Form File</p>"
            + "<input type='text' id='tbDevFormFile' value='' class='ignore'/>"
            + "<p>Report File</p>"
            + "<input type='text' id='tbDevReportFile' value='' class='ignore'/>"
            + "<a href='#' id='hlDevUpdate' class='ui-btn'>Update File Settings</a>"
            + "<a href='#' id='hlDevClearLocalStorage' class='ui-btn ui-btn-b ui-icon-delete ui-btn-icon-left'>Clear Local Storage</a>"
            + "</div>"
            + "<div data-role='footer'><h5>&copy 2014 BAY</h5></div>";
    };

    var setupJqGrids = function()
    {
        for(var i = 0; i < grids.length; i++)
        {
            var g = grids[i];
            var cols = [];
            var dataFields = [];

            $.each(g.fields, function(idx, val)
            {
                var oneCol = {};
                var df = {};


                oneCol.datafield = val.id;
                oneCol.text = globals.getLocalizedResources()[val.labelKey];
                oneCol.width = val.width;
                oneCol.columntype = val.type;
                if(val.hasOwnProperty("pinned")) {oneCol.pinned = val.pinned;}


                df.name = val.id;
                df.type = jqGridControlMap[val.type];

                if(val.type === "dropdownlist")
                {
                    var choices = [];
                    if(val.hasOwnProperty("choices"))
                    {
                        for(var x = 0; x < val.choices.length; x++)
                        {
                            choices.push({value: val.choices[x].value, label: globals.getLocalizedResources()[val.choices[x].labelKey] })
                        }
                    }

                    var choiceSource = { datatype: "array", datafields: [ { name: "label", type: "string"}, { name: "value", type: "string"} ], localdata: choices };
                    var choicesAdapter = new $.jqx.dataAdapter(choiceSource, { autoBind: true });

                    oneCol.displayfield = val.id;
                    oneCol.createeditor = function(row, value, editor) { editor.jqxDropDownList({ source: choicesAdapter, displayMember: "label", valueMember: "value" }); };

                    df.value = val.id;
                    df.values = { source: choicesAdapter.records, value: "value", name: "label" };
                    dataFields.push(df);

                    dataFields.push({ name: val.id, type: "string"});

                    //{ name: 'Country', value: 'countryCode', values: { source: countriesAdapter.records, value: 'value', name: 'label' } }, { name: 'countryCode', type: 'string'}
                }
                else
                {
                    dataFields.push(df);
                }

                cols.push(oneCol);
            });

            var src =
            {
                localdata: [],
                datatype: "json",
                datafields: dataFields
            };
            var dataAdapter = new $.jqx.dataAdapter(src);

            var gId = g.id;
            var addBtnId = g.id + "_add";
            var delBtnId = g.id + "_del";

            $("#" + gId).data("jqx-datafields", dataFields);
            $("#" + gId).jqxGrid(
                {
                    source: dataAdapter,
                    editable: true,
                    //editmode: "click",
                    //selectionmode: "singlecell",
                    showtoolbar: true,
                    rendertoolbar: function(toolbar)
                    {
                        var me = this;
                        var container = $("<div style='margin: 5px;'></div>");
                        toolbar.append(container);
                        container.append("<input id='" + addBtnId + "' type='button' value='Add New Row' />");
                        container.append("<input style='margin-left: 5px;' id='" + delBtnId + "' type='button' value='Delete Selected Row' />");

                        $("#" + addBtnId).jqxButton();
                        $("#" + delBtnId).jqxButton();

                        // create new row.
                        $("#" + addBtnId).on('click', function ()
                        {
                            var datarow = {};
                            var commit = $("#" + gId).jqxGrid('addrow', null, datarow);
                        });

                        // delete row.
                        $("#" + delBtnId).on('click', function ()
                        {
                            var selectedrowindex = $("#" + gId).jqxGrid('getselectedrowindex');
                            var rowscount = $("#" + gId).jqxGrid('getdatainformation').rowscount;
                            if (selectedrowindex >= 0 && selectedrowindex < rowscount)
                            {
                                var id = $("#" + gId).jqxGrid('getrowid', selectedrowindex);
                                var commit = $("#" + gId).jqxGrid('deleterow', id);
                            }
                        });
                    },
                    columns: cols
                });
        }
    };

    var init = function()
    {
        navEntries = new Array();
        pages = new Array();
        pageIds = new Array();
        formElements = new Array();
        multiTables = new Array();

        validationRules = {};

        utility.p("Form Parser inited");
    };

    // Public method exposure
    var pub =
    {
        init: init,
        parseFormDefinition: parseFormDefinition,
        setupMultiTableRow: setupMultiTableRow
    };

    return pub;


});