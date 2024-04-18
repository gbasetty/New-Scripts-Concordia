/*
	Author				:	GDE Demo services
	Date				:	2015/11/05
    Platform            :   H5/Ming.le
	Script name 		:	M3P3_H5_V1
	Script arguments	:	Program, Option (for Create:-1), Source Field1, Target Field1, Source Field2, Target Field2,...
	Script arg example	: 	PPS440, ,SUNO,W1SUNO,0801,W1CYP6 (Opens Supplier Statistic from PPS170, starts with period 0801)
	Prerequisites		:	None

	This is a ekvivalent of the M3P3_V5 for Smart Office.
    Can be added as a shortcut on any panel and will launch a Std M3 Program when clicked optionally
    combined with a row selected at the same time. It is possible to send contents of fields
    to the called program and the option (create,change,display).

	V2:
		Now it is possible to enter source fields or values and to leave the option blank in order to show list view

	V3:
		Corrected handling with change of inquiry type/sorting order or starting panel. If you now enter f.e. WWQTTP or WWSPIC in argument,
		the screen will be new initialized in order to fill the fields correctly

		Now it is possible to use fields from header / outside from listview as well
			Argument example: PMS100,,31,WWQTTP,ITNO,W1OBKV to call from OIS301
			Argument example: MMS100,,N,WWSPIC,KST,WGTRTP,P01,WGWHLO,PRNO,WRITNO to call from PMS100
			Argument example: OIS005,5,W1OBKV,W1CUNO,ITNO,W1ITNO to call from OIS301
		New option to use for printprograms: Because there is no option to use f.e. for OIS180,ARS500, the Option P should be used in order
		to avoid a direct run.
			Argument example: OIS180,P,ORNO,WFORNO,ORNO,WTORNO,CUNO,WFPYNO,CUNO,WTPYNO from OIS300

	V4/5:
		New date and period handling: DATE(n) or PERIOD(n) sets date- or periodfields with relative dates or periods, calculated from current date
			Argument example: ARS227,,PERIOD(0),WWACPE,WWPYNO,WWPYNO,104,WWCTPT from ARS200
			Argument example: OIS180,P,DATE(-1),WDIDAT,DATE(-1),WDACDT,ORNO,WFORNO,ORNO,WTORNO,CUNO,WFPYNO,CUNO,WTPYNO from OIS300
		Possible to change panel sequence
			Argument example: CRS610,5,JK,WWDSEQ,WWPYNO,W1CUNO from ARS200 to see only finance panels of customer master
			MMS002,2,WWWHLO,W1WHLO,WWITNO,W1ITNO from MMS080


    Test:
            MWS060 � use it on standard sorting order 71
            PPS310, ,REPN,WWREPN

            MMS080
            MWS060, ,WWWHLO,W1OBKV,WWITNO,W2OBKV

            MMS002 - use it on sorting order 3
            MWS060, ,WHLO,W1OBKV,ITNO,W2OBKV

*/


var M3P3_H5_V1_D = new function () {

    //////////////////////////////
    ///  * Global Variables *  ///
    //////////////////////////////

    var _controller;
    var _content;
    var _debug;
    var _arguments;
    var _isDebug = true;

    // Program specific
    var _automationSteps;
    var $_host;
    var _error;


    this.Init = function (scriptArgs) {

        try {

            //////////////////////////////
            ///* Set Global Variables *///
            //////////////////////////////

            _controller = scriptArgs.controller;
            _content = _controller.RenderEngine.Content;
            _debug = scriptArgs.debug;
            _arguments = scriptArgs.args;

            _automationSteps = [];
            $_host = _controller.ParentWindow;

            ///////////////////////////////////
            ///* Create array of arguments *///
            ///////////////////////////////////

            var args = SplitAndTrimArguments(_arguments);

            Main(args);

        } catch (ex) {
            Log(ex);
        }

    }

    //////////////////////////////////////////////////
    ///*                Main Methods            *///
    //////////////////////////////////////////////////

    function Main(args) {
        debugger;
        _error = { code: 0 }; // Need to reset due to jQuery on .on "click" event anonmys closure
        _automationSteps = []; // Need to reset due to jQuery on .on "click" event anonmys closure
        //args = _arguments.split(",");

        // argumentsAsArray = [program, option, sourceField1, targetField1...]
        var argumentsAsArray = args;

        // args = [ sourceField1, targetField1...]
        var args = argumentsAsArray.slice(2);

        // 1. Handles program arguments
        if (argumentsAsArray.length >= 2) {
            var program = $.trim(argumentsAsArray[0]);
            var option = $.trim(argumentsAsArray[1]);
            if (program !== "") {
                _automationSteps.push({ command: "RUN", value: program });
            } else {
                _error.code = 1;
            }
        } else {
            _error.code = 2;
        }

        // 1.1 Error check
        if (ErrorHandling(args) === null) {
            return null;
        }

        // 1.2 Start building automation XML
        if (option.toUpperCase() === "P") {
            _automationSteps.push({ command: "AUTOSET", value: "" });
        } else {
            _automationSteps.push({ command: "KEY", value: "ENTER" });
        }

        // 2. Handles QTTP etc
        SpecialCases(args);

        // 3. Handles date and period arguments
        DateCases(args); //V5

        // 4. Handles listView and not listview
        if (ListControl.ListView.GetDatagrid(_controller)) {
            HasListView(args);
        } else {
            NoListView(args);
        }

        // 5. Handles options argument
        OptionCases(option);

        // 6. Error check
        if (ErrorHandling(args) === null) {
            return null;
        }

        // 7. Handles creation of automationXML
        var uri = CreateAutomationXML();

        // 8. Send xml to automation server
        ScriptUtil.Launch(uri);

    }



    function HasListView(args) {
		debugger;
        var toBeRemoved = [];
        var sourceField;
        var targetField;
        var valueForTargetField;
        var getSelectedListItem
        var selectedRow
        var indexOf;
        var $elementOutsideListView;
        var list;
        var listViewColumns;

        try {
            list = ListControl.ListView.GetDatagrid(_controller);
            listViewColumns = ListControl.Columns();
        } catch (exception) {
            _error.code = 6;
            return null;
        }

        selectedRow = list.getSelectedRows();

        if (selectedRow.length < 1) {
            _error.code = 3;
        } else if (selectedRow.length > 1) {
            _error.code = 4;
            return null;
        } else {
            // Everything is ok
            //_error.code = 5;
        }
        var r_id = ListControl.ListView.SelectedItem()[0];
        // Selects the clicked/selected item
        getSelectedListItem = _controller.GetGrid().getData()[r_id]; // _controller.GetGrid().getData()[index]; TODO should be a better way to this in the future

        for (var i = 0; i < args.length; i = i + 2) {
            sourceField = $.trim(args[i]);
            targetField = $.trim(args[i + 1]);
            indexOf = $.inArray(sourceField, listViewColumns)

            if (indexOf !== -1 && selectedRow.length === 1) {
                valueForTargetField = ListControl.ListView.GetValueByColumnIndex(indexOf)[0]; // TODO should be a better way to this in the future
                valueForTargetField = ($.trim(valueForTargetField) === "?" ? " " : $.trim(valueForTargetField));
                _automationSteps.push({ command: "FIELD", name: targetField, value: valueForTargetField });
                toBeRemoved.push(i);
            } else {
                if(sourceField != "0") {
                    $elementOutsideListView = ScriptUtil.FindChild($_host, sourceField);
                }

                if ($elementOutsideListView.length > 0) {
                    valueForTargetField = ScriptUtil.GetFieldValue(sourceField);
					if(targetField=="WACALT"){
						_automationSteps.push({ command: "FIELD", name: targetField, value: "1" });
					}
					else{
						_automationSteps.push({ command: "FIELD", name: targetField, value: valueForTargetField });
					}
                    toBeRemoved.push(i);
                } else {
                    console.log("Current sourceField did not match anything in listViewColumns OR outside of listViewColumns");
                }
            }
        }

        CleanArray(toBeRemoved, args);

    }

    function NoListView(args) {
        debugger;
        var toBeRemoved = [];
        var sourceField;
        var targetField;
        var valueForTargetField;
        var $elementOutsideListView;

        for (var i = 0; i < args.length; i = i + 2) {
            sourceField = $.trim(args[i]);
            targetField = $.trim(args[i + 1]);

            $elementOutsideListView = ScriptUtil.FindChild($_host, sourceField);
            if ($elementOutsideListView.length > 0) {
                valueForTargetField = $elementOutsideListView.val();
                _automationSteps.push({ command: "FIELD", name: targetField, value: valueForTargetField });
                toBeRemoved.push(i);
            } else {
                console.log("Current sourceField did not match anything outside of listViewColumns");
            }
        }

        CleanArray(toBeRemoved, args);

        // Everything is ok
        //_error.code = 5;

    }

    function DateCases(args) {

        var date;
        var tmpYear;
        var tmpMonth;
        var tmpDay;
        var calculateDate;
        var dateformat = ScriptUtil.GetUserContext("DTFM");
        var sourceField;
        var targetField;
        var toBeRemoved = [];

        var dateDifference;
        var monthDifference;

        for (var i = 0; i < args.length; i = i + 2) {
            sourceField = $.trim(args[i]);
            targetField = $.trim(args[i + 1]);

            if (sourceField.substring(0, 4) === "DATE") {
                dateDifference = (+$.trim(sourceField.substring(5, sourceField.length - 1)));

                // Get the current Date.
                date = new Date();
                // Calculate date from argument
                date.setDate(date.getDate() + dateDifference);
                // Get The current year and just save the last two character of the four character year.
                tmpYear = date.getFullYear().toString().substring(2, 4);
                // Get the current Month and pre-pend a "0" if 1-9.
                tmpMonth = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
                // Get the current Date (Day) and pre-pend a "0" if 1-9.
                tmpDay = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();

                // DDMMYY or YYMMDD or MMDDYY
                switch (dateformat) {
                    case "DMY":
                        calculateDate = "" + tmpDay + tmpMonth + tmpYear;
                        break;
                    case "YMD":
                        calculateDate = "" + tmpYear + tmpMonth + tmpDay;
                        break;
                    case "MDY":
                        calculateDate = "" + tmpMonth + tmpDay + tmpYear;
                        break;
                    default:
                        calculateDate = "" + tmpDay + tmpMonth + tmpYear;
                        break;
                }

                _automationSteps.push({ command: "FIELD", name: targetField, value: calculateDate });
                toBeRemoved.push(i);

            } else if (sourceField.substring(0, 6) === "PERIOD") {

                monthDifference = (+$.trim(sourceField.substring(7, sourceField.length - 1)));
                // Get the current Date.
                date = new Date();
                // Calculate period from argument
                date.setMonth(date.getMonth() + monthDifference);
                // Get The current year and just save the last two character of the four character year.
                tmpYear = date.getFullYear().toString().substring(2, 4);
                // Get the current Month and pre-pend a "0" if 1-9.
                tmpMonth = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
                calculateDate = "" + tmpYear + tmpMonth;
                _automationSteps.push({ command: "FIELD", name: targetField, value: calculateDate });
                toBeRemoved.push(i);
            }
        }

        CleanArray(toBeRemoved, args);

    }

    function SpecialCases(args) {

        var toBeRemoved = [];
        var targetField;
        var valueForTargetField;
        var targetFieldSubstring;

        for (var i = 0; i < args.length; i = i + 2) {
            valueForTargetField = $.trim(args[i]);
            targetField = $.trim(args[i + 1]);

            targetFieldSubstring = targetField.substring(2, 6);
            switch (targetFieldSubstring) {
                case "QTTP":
                    _automationSteps.push({ command: "FIELD", name: targetField, value: valueForTargetField });
                    _automationSteps.push({ command: "KEY", value: "ENTER" });
                    toBeRemoved.push(i);
                    break;
                case "SPIC":
                    _automationSteps.push({ command: "KEY", value: "F13" });
                    _automationSteps.push({ command: "KEY", value: "ENTER" });
                    _automationSteps.push({ command: "FIELD", name: targetField, value: valueForTargetField });
                    _automationSteps.push({ command: "KEY", value: "ENTER" });
                    toBeRemoved.push(i);
                    break;
                case "DSEQ":
                    _automationSteps.push({ command: "KEY", value: "F13" });
                    _automationSteps.push({ command: "KEY", value: "ENTER" });
                    _automationSteps.push({ command: "FIELD", name: targetField, value: valueForTargetField });
                    _automationSteps.push({ command: "KEY", value: "ENTER" });
                    toBeRemoved.push(i);
                    break;
                default:
                    break;
            }
        }

        CleanArray(toBeRemoved, args);
    }

    function OptionCases(option) {
        var argumentOption = option;
        // Create listoption or F-Key optional
        if ((argumentOption >= "-1") && (argumentOption <= "99")) {
            _automationSteps.push({ command: "LSTOPT", value: argumentOption });
        }
        else if (argumentOption.substring(0, 1) === "F") {
            //Checks for a "F"12 letter to differentiate between a list option as above.
            _automationSteps.push({ command: "KEY", value: argumentOption });
        }
    }

    function CreateAutomationXML() {

        //"RUN"
        //"KEY"
        //"LISTOPTION"
        //"AUTOSET"
        //"FIELD"

        //_automationSteps.push({ command: "RUN", value: "PROGRAM" });
        //_automationSteps.push({ command: "KEY", value: "VALUE" });
        //_automationSteps.push({ command: "FIELD", name: "NAME", value: "VALUE" });
        //_automationSteps.push({ command: "FIELD", name: "NAME", value: "VALUE" });
        //_automationSteps.push({ command: "LSTOPT", value: "VALUE" });
        //_automationSteps.push({ command: "AUTOSET", value: "VALUE" });
        //_automationSteps.push({ command: "FIELD", name: "NAME", value: "VALUE" });
        //_automationSteps.push({ command: "FIELD", name: "NAME", value: "VALUE" });

        console.log(_automationSteps);
        automationXML = "<?xml version='1.0' encoding='utf-8'?><sequence>";
        var i = 0;
        var current;
        var next;
        while (_automationSteps.length > 0) {
            next = _automationSteps[i + 1];
            current = _automationSteps.shift();

            // Handles out of bounds ranges
            if (!next) {
                if (current["command"] === "FIELD") {
                    automationXML += "<field name='" + current["name"] + "'>" + current["value"] + "</field>";
                    automationXML += "</step>";
                } else if (current["command"] === "LSTOPT" || current["command"] === "KEY" || current["command"] === "AUTOSET") {
                    automationXML += "<step command='" + current["command"] + "' value='" + current["value"] + "'/>";
                }
                break;
            }

            switch (current["command"]) {
                case "RUN":
                    automationXML += "<step command='RUN' value='" + current["value"] + "'/>";
                    break;
                case "KEY":
                    automationXML += (next["command"] === "FIELD" ? "<step command='KEY' value='" + current["value"] + "'>" : "<step command='KEY' value='" + current["value"] + "'/>");
                    break;
                case "LSTOPT":
                    automationXML += (next["command"] === "FIELD" ? "<step command='LSTOPT' value='" + current["value"] + "'>" : "<step command='LSTOPT' value='" + current["value"] + "'/>");
                    break;
                case "AUTOSET":
                    automationXML += (next["command"] === "FIELD" ? "<step command='AUTOSET' value='" + current["value"] + "'>" : "<step command='AUTOSET' value='" + current["value"] + "'/>");
                    break;
                case "FIELD":
                    automationXML += "<field name='" + current["name"] + "'>" + current["value"] + "</field>";
                    automationXML += (next["command"] === "FIELD" ? "" : "</step>");
                    break;
                default:
                    break;
            }

        }
        automationXML += "</sequence>";
        console.log(automationXML);
        return automationXML;
    }

    function CleanArray(toBeRemoved, args) {
        for (var i = 0; i < toBeRemoved.length; i++) {
            if (toBeRemoved[i] === 0) {
                args.splice(toBeRemoved[i], 2);
            } else {
                args.splice(toBeRemoved[i - 2], 2);
            }
        }
    }

    function SplitAndTrimArguments(args) {
        function trimEachIndex(i) {
            return $.trim(i);
        }
        return $.map(args.split(","), trimEachIndex);
    }

    function ErrorHandling(args) {
        if (_error.code === 1) {
            DialogMessage("Program name is empty, please enter a valid program name", "Error");
            return null;
        } else if (_error.code === 2) {
            DialogMessage("Not enough script arguments", "Error");
            return null;
        } else if (_error.code === 3 && args.length > 0) {
            DialogMessage("No row was selected!", "Warning");
            return null;
        } else if (_error.code === 4) {
            DialogMessage("More then 1 row selected", "Error");
            return null;
        } else if (_error.code === 5 && args.length > 0) {
            DialogMessage("Following arguments were not applied correctly: \n" + args.toString(), "Error");
            return null;
        } else if (_error.code === 6) {
            DialogMessage("Something went wrong when trying to assign/set ListView or ListControl.Columns()", "Error");
            return null;
        }

    }
    //////////////////////////////////////////////////
    ///*                Helper Methods            *///
    //////////////////////////////////////////////////

    function DialogMessage(msg, type) {
        var type = type || "Error"; //Default
        var content = {
            header: type,
            message: msg,
            dialogType: type
        }
        ConfirmDialog.ShowMessageDialog(content);
    }

    function SetPosition(element, column, row, width) {
        /* If the element is a TextBox, one have to subtract width with -6 (pixels for added padding and border) in order to get the desired width*/
        var isElementTextBox = false;
        var isElementLabel = false;

        var classNameArray = element[0].className.split(' ');
        for (var i = 0; i < classNameArray.length; i++) {
            if (classNameArray[i] == 'inforTextbox') {
                isElementTextBox = true;
            } else if (classNameArray[i] == 'inforLabel') {
                isElementLabel = true;
            }
        }

        var rowForAppendingElement = "#pRow" + row; //(row + 1);  // +1 -> Since the top row start with id: #pRow2
        var inputCol = +column;
        var columnValue = (inputCol * 10) + "px"; // *10 -> To make each "column" 10px wide

        var inputWidth = width;
        if (!inputWidth) {
            inputWidth = "auto";
        } else {
            if (typeof inputWidth === 'number') {
                if (isElementTextBox) {
                    inputWidth = (inputWidth * 10 - 6) + "px"; //Subtracting for added padding and border (2+2+1+1) by a stylesheet.
                } else if (isElementLabel) {
                    inputWidth = (inputWidth * 10 - 10) + "px"; //Subtracting for added padding-right (10px) by a stylesheet.
                } else {
                    inputWidth = (inputWidth * 10) + "px";
                }
            } else if (typeof inputWidth === 'string') {
                if (isElementTextBox) {
                    inputWidth = (+inputWidth * 10 - 6) + "px"; //Subtracting for added padding and border (2+2+1+1) by a stylesheet.
                } else if (isElementLabel) {
                    inputWidth = (+inputWidth * 10 - 10) + "px"; //Subtracting for added padding (10px) by a stylesheet.
                } else {
                    inputWidth = (+inputWidth * 10) + "px";
                }
            } else {
                Log("Not a valid input value for width. Setting \"auto\" as width instead.");
                inputWidth = "auto";
            }
        }

        /* Add the different valus for row, column and width to a cssObject*/
        var cssObject = {
            position: "absolute",
            left: columnValue,
            width: inputWidth
        };

        /* Add the cssObject to the element */
        element.css(cssObject);

        /* Append the element to the desired row */
        $_host.find(rowForAppendingElement).append(element);
    }

    function AddButton(text, column, row, width, isEnabled) {
        var button_elem = new ButtonElement();
        button_elem.Name = "button_R" + row + "_C" + column; //The .Name value becomes the ID for the element
        button_elem.Value = text;
        if (isEnabled === true) {
            button_elem.IsEnabled = true;
        } else {
            button_elem.IsEnabled = false;
        }
        var $button = ControlFactory.CreateButton(button_elem);

        /* Settings one might want to apply */
        //$textBox.css("text-transform", "uppercase");
        //$textBox.css("text-align", "right");

        SetPosition($button, column, row, width);

        return $button;
    }

    function Log(text) {
        if (_isDebug) {
            _debug.WriteLine(text);
        }
    }

}