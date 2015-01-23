/**
 * Created by byoung on 6/27/2014.
 */

define(function()
{
    "use strict";

    var productionMode = false;
    var developerMode = true;

    var culture = "en";
    var localizedResources = {};


    var languageFile = "js/lang/resources_" + culture + ".json";
    var formDefinitionFile = "js/forms/form1.json";
    //var formDefinitionFile = "js/forms/gridtest.json";
    var reportFile = "js/templates/form1.mst";

    var useTermsAndConditions = true;


    var version = 0.1;
    var webserviceUrl = "";
    var formPages = [];
    var formId = "#form1";
    var reviewTableId = "#tblReview";
    var currentUser = "";
    var aesKey = null;
    var aesIv = null;
    var salt = null;
    var dataLayer = null;
    var forceWebSql = false;
    var dateFormat = "DD.MM.YYYY HH:mm";
    var idleTimeMax = 5; // In mins
    var formElements = [];
    var listDisplayFormat = "";

    var validationRules = {};
    var formValidator =
    {
        debug: true,
        onsubmit: false,
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        ignore: ".ignore",
        errorPlacement: function(error, element)
        {
            var t = element.attr("type");
            //console.log(element.attr("type"));
            // Handle error placement differently depending on the element type
            if(t === undefined)
            {
                if(element.prop("tagName") === "TEXTAREA")
                {
                    error.insertAfter($(element));
                }
            }
            else if(t === "radio")
            {
                //console.log($(element));
                //console.log(error);
                error.insertAfter($(element).parent().parent().parent());
            }
            else
            {
                error.insertAfter($(element).parent());
            }
        },
        showErrors: function(errorMap, errorList)
        {
            $("#divReviewErrorSummary").hide();
            if(this.numberOfInvalids() > 0)
            {
                $("#divReviewErrorSummary").html("The form contains " + this.numberOfInvalids() + " errors");
                $("#divReviewErrorSummary").show();
            }

            var tds = $("#tblReview tbody").find("td[data-elemid]");
            $.each(errorList, function()
            {
                var id = $(this.element).attr("id");
                var type = $(this.element).attr("type");
                if(type === "radio")
                {
                    id = $(this.element).attr("name");
                }

                var oneTd = tds.filter(function()
                {
                    //console.log($(this).data("elemid") + "----" + id);
                    return $(this).data("elemid") == id;
                });

                if(oneTd.length > 0)
                {
                    oneTd.addClass("report_error");
                }
            });

            this.defaultShowErrors();
        }
    };

    var getLocalizedResources = function() { return localizedResources; };
    var setLocalizedResources = function(val) { localizedResources = val; };
    var getCulture = function() { return culture; };
    var isDeveloperMode = function() { return developerMode; };
    var getAesKey = function() { return aesKey; };
    var setAesKey = function(val) { aesKey = val; };
    var getAesIv = function() { return aesIv; };
    var setAesIv = function(val){ aesIv = val; };
    var getSalt = function() { return salt; };
    var setSalt = function(val) { salt = val; };
    var getFormPages = function() { return formPages; };
    var setFormPages = function(val) { formPages = val; };
    var getWebServiceUrl = function() { return webserviceUrl; };
    var getVersion = function() { return version; };
    var isProduction = function() { return productionMode; };
    var getFormId = function() { return formId; };
    var getReviewTableId = function() { return reviewTableId; };
    var getCurrentUser = function() { return currentUser; };
    var setCurrentUser = function(user) { currentUser = user; };
    var getDataLayer = function() { return dataLayer; };
    var setDataLayer = function(obj) { dataLayer = obj; };
    var getDateFormat = function() { return dateFormat; };
    var getIdleTimeMax = function() { return idleTimeMax; };
    var getFormElements = function() { return formElements; };
    var setFormElements = function(obj) { formElements = obj; };
    var getListDisplayFormat = function() { return listDisplayFormat; };
    var setListDisplayFormat = function(obj) { listDisplayFormat = obj; };
    var getValidationRules = function() { return validationRules; };
    var setValidationRules = function(obj) { validationRules = obj; };
    var getFormValidator = function() { return formValidator; };
    var setFormValidator = function(obj) { formValidator = obj; };

    var getLanguageFile = function() { return languageFile; };
    var setLanguageFile = function(val) { languageFile = val; };
    var getFormDefinitionFile = function() { return formDefinitionFile; };
    var setFormDefinitionFile = function(val) { formDefinitionFile = val; };
    var getReportFile = function() { return reportFile; };
    var setReportFile = function(val) { reportFile = val; };
    var getUseTermsAndConditions = function() { return useTermsAndConditions; };
    var setUseTermsAndConditions = function(val) { useTermsAndConditions = val; };

    // Public method exposure
    var pub =
    {
        getCulture: getCulture,
        getLocalizedResources: getLocalizedResources,
        setLocalizedResources: setLocalizedResources,
        getCurrentUser: getCurrentUser,
        setCurrentUser: setCurrentUser,
        getVersion: getVersion,
        isProduction: isProduction,
        isDeveloperMode: isDeveloperMode,
        getFormId: getFormId,
        getFormPages: getFormPages,
        setFormPages: setFormPages,
        getReviewTableId: getReviewTableId,
        getWebServiceUrl: getWebServiceUrl,
        getAesKey: getAesKey,
        setAesKey: setAesKey,
        getAesIv: getAesIv,
        setAesIv: setAesIv,
        getSalt: getSalt,
        setSalt: setSalt,
        getDataLayer: getDataLayer,
        setDataLayer: setDataLayer,
        getDateFormat: getDateFormat,
        getIdleTimeMax: getIdleTimeMax,
        getFormElements: getFormElements,
        setFormElements: setFormElements,
        getListDisplayFormat: getListDisplayFormat,
        setListDisplayFormat: setListDisplayFormat,
        getValidationRules: getValidationRules,
        setValidationRules: setValidationRules,
        getFormValidator: getFormValidator,
        setFormValidator: setFormValidator,
        getLanguageFile: getLanguageFile,
        setLanguageFile: setLanguageFile,
        getFormDefinitionFile: getFormDefinitionFile,
        setFormDefinitionFile: setFormDefinitionFile,
        getReportFile: getReportFile,
        setReportFile: setReportFile,
        getUseTermsAndConditions: getUseTermsAndConditions,
        setUseTermsAndConditions: setUseTermsAndConditions
    };

    return pub;
});