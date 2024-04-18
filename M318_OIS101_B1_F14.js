/**
 * @author Jorge Co
 * @version 1.0.0
 * @since 2020-01-28
 *
 * @description
 * M318 OIS101/B1 F14 Copy CO.
 *
 * History:
 * 20200128     Base script created
 * 20200624     OIS101/G handling for credit complaint
 * 20201103     Create custom record on manual CO line creation
 * 20210127     Avoid race condition for AddFieldValue
 * 20211220     Update Order quantity based on reference invoice
 * 2022090      Solution for IXS 16732864 M324 - complaints mashup not showing lines for claim item
 * 20231103  Use new XTEND M3 API
 */
var M318_OIS101_B1_F14 = (function () {
	function M318_OIS101_B1_F14(scriptArgs) {
		this.controller = scriptArgs.controller;
		this.log = scriptArgs.log;
		this.args = scriptArgs.args;
		this.element = scriptArgs.elem;
		this.SCRIPTNAME = 'M318_OIS101_B1_F14';
		this.ZZORNO = "";   //A 20201103
		this.ZZCUNO = "";   //A 20201103
		this.ZZCUOR = "";   //A 20201103
		this.ZZOIVR = "";   //A 20201103
		this.ZZUSID = "";   //A 20201103
		this.automationSteps = [];	//A 20211220 Jorge
		//panelFlag = this.controller.GetPanelName() == "OIA101BC";
	}
	M318_OIS101_B1_F14.Init = function (scriptArgs) {
		new M318_OIS101_B1_F14(scriptArgs).run();
	};
	M318_OIS101_B1_F14.prototype.run = function () {
		//var _this = this;
		this.log.Info("Start " + this.SCRIPTNAME);
		//this.updateOrderQty();	//A 20211220
		this.executeF14();

		// Skip if coming from OIS106's F14             //A 20210127
		if (!SessionCache.Get("M318_OIS106_F14")) {     //A 20210127
			this.manualCreate();    //A 20201103
		}                                               //A 20210127
		SessionCache.Remove("M318_OIS106_F14");         //A 20210127

		this.attachEvents(this.controller);
	};
	M318_OIS101_B1_F14.prototype.executeF14 = function () {
		var _this = this;
		var vORTP = ScriptUtil.GetFieldValue("OAORTP");
		debugger;
		if (vORTP == "CPC") {   //A 20200624
			if (SessionCache.ContainsKey("OIS101_LinesCopied")) {   //A 20200624
				var linesCopied = Number(SessionCache.Get("OIS101_LinesCopied"));   //A 20200624
				if (linesCopied == 0) { //A 20200624
					SessionCache.Remove("OIS101_PONR"); //A 20200624
					SessionCache.Remove("OIS101_LinesCopied");  //A 20200624
				}   //A 20200624
			}   //A 20200624
		}   //A 20200624
		if (vORTP != "CMP") {
			return;
		}
		SessionCache.Remove("OIS106_OIVR");
		SessionCache.Remove("OIS106_OYEA");
		SessionCache.Remove("OIS106_ORNO");
		SessionCache.Remove("OIS101_OIVR");
		SessionCache.Remove("OIS101_OYEA");
		SessionCache.Remove("OIS101_PONR");
		var vORNO = ScriptUtil.GetFieldValue("OAORNO");
		// create button
		//var $button = this.addButton("Copy CO", "270", "900");
		var buttonElement = new ButtonElement();
		buttonElement.Name = "Copy CO";
		buttonElement.Value = "Copy CO";
		buttonElement.Position = new PositionElement();
		buttonElement.Position.Top = 8;
		buttonElement.Position.Left = 38;
		buttonElement.Position.Width = 6;
		var contentElement = _this.controller.GetContentElement();
		var button = contentElement.AddElement(buttonElement);

		button.on("click", function () {
			SessionCache.Add("OIS101_CUOR", "");
			SessionCache.Add("OIS101_OIVR", "");
			SessionCache.Add("OIS101_OYEA", "");
			SessionCache.Add("OIS101_PONR", "0");
			SessionCache.Add("NEXT_PONR", "0");	//A 20211220
			var lineNumber = 0;
			var recordLine = { ORNO: vORNO };
			var outHeadFields = ["CUOR", "OIVR", "OYEA"];
			var outLineFields = ["PONR", "POSX"];
			//Read CO lines
			var myRequest = new MIRequest();
			myRequest.program = "OIS100MI";
			myRequest.transaction = "GetHead";
			myRequest.record = recordLine;
			myRequest.outputFields = outHeadFields;
			myRequest.includeMetadata = true;
			myRequest.typedOutput = true;
			myRequest.maxReturnedRecords = 0;
			myRequest.timeout = 60000;
			MIService.Current.executeRequest(myRequest).then(function (response) {
				debugger;
				if (response != null && response.items != undefined && response.items != null && response.items.length > 0) {
					debugger;
					//Save CO values to cache
					var vCUOR = response.items[0].CUOR;
					if (vCUOR == null || vCUOR == undefined) {
						vCUOR = "";
					}
					var vOIVR = response.items[0].OIVR;
					if (vOIVR == null || vOIVR == undefined) {
						vOIVR = "";
					}
					var vOYEA = response.items[0].OYEA;
					if (vOYEA == null || vOYEA == undefined) {
						vOYEA = "";
					}
					SessionCache.Add("OIS101_CUOR", response.items[0].CUOR);
					SessionCache.Add("OIS101_OIVR", response.items[0].OIVR);
					SessionCache.Add("OIS101_OYEA", response.items[0].OYEA);
					//Read CO lines
					var myRequestLines = new MIRequest();
					myRequestLines.program = "OIS100MI";
					myRequestLines.transaction = "LstLine";
					myRequestLines.record = recordLine;
					myRequestLines.outputFields = outLineFields;
					myRequestLines.includeMetadata = true;
					myRequestLines.typedOutput = true;
					myRequestLines.maxReturnedRecords = 0;
					myRequestLines.timeout = 60000;
					MIService.Current.executeRequest(myRequestLines).then(function (response) {
						debugger;
						if (response != null && response.items != undefined && response.items != null && response.items.length > 0) {
							//Get last line number
							lineNumber = response.items[response.items.length - 1].PONR;
							SessionCache.Add("OIS101_PONR", lineNumber);
							SessionCache.Add("NEXT_PONR", Number(lineNumber) + 1);	//A 20211220
							//_this.controller.PressKey("F14");
						} else {
							SessionCache.Add("OIS101_PONR", "0");
							SessionCache.Add("NEXT_PONR", "1");	//A 20211220
						}
						_this.controller.PressKey("F14");
					}, function (response) {//}).catch(function (response) {
						debugger;
						console.log(response.errorMessage);
						SessionCache.Add("OIS101_PONR", "0");
						SessionCache.Add("NEXT_PONR", "1");	//A 20211220
						_this.controller.PressKey("F14");
					}, function (response) { //}).finally(function () {
						debugger;
						SessionCache.Add("OIS101_PONR", "0");
						SessionCache.Add("NEXT_PONR", "1");	//A 20211220
						_this.controller.PressKey("F14");
					});
				}
			}, function (response) {//}).catch(function (response) {
				debugger;
				console.log(response.errorMessage);
				SessionCache.Add("OIS101_CUOR", "");
				SessionCache.Add("OIS101_PONR", "0");
				SessionCache.Add("NEXT_PONR", "1");	//A 20211220
				_this.controller.PressKey("F14");
			}, function (response) { //}).finally(function () {
				debugger;
				SessionCache.Add("OIS101_CUOR", "");
				SessionCache.Add("OIS101_PONR", "0");
				SessionCache.Add("NEXT_PONR", "1");	//A 20211220
				_this.controller.PressKey("F14");
			});
		});
		this.log.Info("End " + this.SCRIPTNAME);
	};
	M318_OIS101_B1_F14.prototype.saveLastLine = function () {
		var _this = this;
		var vORTP = ScriptUtil.GetFieldValue("OAORTP");
		//Credit Complaint order
		if (vORTP != "CPC") {
			return;
		}
		console.log("Method: saveLastLine");
		SessionCache.Add("OIS106_CPC", "1");
		var vORNO = ScriptUtil.GetFieldValue("OAORNO");
		var lineNumber = 0;
		var recordLine = { ORNO: vORNO };
		var outLineFields = ["PONR", "POSX"];
		//Read CO lines
		var myRequestLines = new MIRequest();
		myRequestLines.program = "OIS100MI";
		myRequestLines.transaction = "LstLine";
		myRequestLines.record = recordLine;
		myRequestLines.outputFields = outLineFields;
		myRequestLines.includeMetadata = true;
		myRequestLines.typedOutput = true;
		myRequestLines.maxReturnedRecords = 0;
		myRequestLines.timeout = 60000;
		MIService.Current.executeRequest(myRequestLines).then(function (response) {
			debugger;
			if (response != null && response.items != undefined && response.items != null && response.items.length > 0) {
				//Get last line number
				lineNumber = response.items[response.items.length - 1].PONR;
				SessionCache.Add("OIS101_PONR", lineNumber);
			}
		}, function (response) {//}).catch(function (response) {
			debugger;
			console.log(response.errorMessage);
			SessionCache.Add("OIS101_PONR", 0);
		}, function (response) { //}).finally(function () {
			debugger;
		});
	};
	M318_OIS101_B1_F14.prototype.manualCreate = function () {   //A 20201103
		var _this = this;
		var vORTP = ScriptUtil.GetFieldValue("OAORTP");
		debugger;
		if (vORTP != "CMP") {
			return;
		}
		this.ZZORNO = ScriptUtil.GetFieldValue("OAORNO");
		this.ZZUSID = ScriptUtil.GetUserContext("USID");
		var recordLine = { ORNO: this.ZZORNO };
		var outHeadFields = ["CUNO", "CUOR", "OIVR", "OYEA"];
		var outLineFields = ["PONR", "POSX"];
		//Read CO lines
		var myRequest = new MIRequest();
		myRequest.program = "OIS100MI";
		myRequest.transaction = "GetHead";
		myRequest.record = recordLine;
		myRequest.outputFields = outHeadFields;
		myRequest.includeMetadata = true;
		myRequest.typedOutput = true;
		myRequest.maxReturnedRecords = 0;
		myRequest.timeout = 60000;
		MIService.Current.executeRequest(myRequest).then(function (response) {
			debugger;
			if (response != null && response.items != undefined && response.items != null && response.items.length > 0) {
				debugger;
				var creditStatus = "0";
				//Save CO values to cache
				_this.ZZCUNO = response.items[0].CUNO;
				if (_this.ZZCUNO == null || _this.ZZCUNO == undefined) {
					_this.ZZCUNO = "";
				}
				_this.ZZCUOR = response.items[0].CUOR;
				if (_this.ZZCUOR == null || _this.ZZCUOR == undefined) {
					_this.ZZCUOR = "";
				}
				_this.ZZOIVR = response.items[0].OIVR;
				if (_this.ZZOIVR == null || _this.ZZOIVR == undefined) {
					_this.ZZOIVR = "";
				}
				var vOYEA = response.items[0].OYEA;
				if (vOYEA == null || vOYEA == undefined) {
					vOYEA = "";
				}
				if (_this.ZZOIVR != "" && vOYEA != "") {
					_this.ZZOIVR = vOYEA + "/" + _this.ZZOIVR;
				}
				//Read CO lines
				var myRequestLines = new MIRequest();
				myRequestLines.program = "OIS100MI";
				myRequestLines.transaction = "LstLine";
				myRequestLines.record = recordLine;
				myRequestLines.outputFields = outLineFields;
				myRequestLines.includeMetadata = true;
				myRequestLines.typedOutput = true;
				myRequestLines.maxReturnedRecords = 0;
				myRequestLines.timeout = 60000;
				MIService.Current.executeRequest(myRequestLines).then(function (response) {
					debugger;
					if (response != null && response.items != undefined && response.items != null && response.items.length > 0) {
						//Add default OOLINE custom record
						_this.addFieldValueSMCD(
							_this.ZZORNO,
							response.items[response.items.length - 1].PONR,
							response.items[response.items.length - 1].POSX,
							_this.ZZOIVR,
							_this.ZZCUOR,
							_this.ZZCUNO,
							_this.ZZUSID
						);
					}
				}, function (response) {//}).catch(function (response) {
					debugger;
				}, function (response) { //}).finally(function () {
					debugger;
				});
			}
		}, function (response) {//}).catch(function (response) {
			debugger;
		}, function (response) { //}).finally(function () {
			debugger;
		});
	};
	M318_OIS101_B1_F14.prototype.updateOrderQty = function () {   //A 20211220 Jorge
		var _this = this;
		var vORTP = ScriptUtil.GetFieldValue("OAORTP");
		var vORNO = ScriptUtil.GetFieldValue("OAORNO");
		debugger;
		if (vORTP != "CMP") {
			return;
		}
		//Get Salesperson
		var vNextLine = 0;
		if (SessionCache.ContainsKey("NEXT_PONR")) {
			vNextLine = Number(SessionCache.Get("NEXT_PONR"));
		}
		if (vNextLine == 0) {
			return;
		}
		SessionCache.Remove("NEXT_PONR");
		this.MICaller("CUSEXTMI", "LstFieldValue", {
			FILE: "OOLINE",
			PK01: vORNO
		}, ["PK01","PK02","PK03","A330","A430","N096","N996"]).then(function (response) {
			debugger;
			if (response != null && response.items != undefined && response.items != null && response.items.length > 0) {
				for (var i = 0; i < response.items.length; i++) {
					if (Number(response.items[i].N996) > 0.00 && vNextLine <= Number(response.items[i].PK02)) {
						if (_this.automationSteps == null) {
							// clear previous
							_this.automationSteps = [];
							// autoset
							_this.automationSteps.push({ command: "AUTOSET", value: "P" });
							// settings
							_this.automationSteps.push({ command: "KEY", value: "F13" });
							// set panel sequence
							_this.automationSteps.push({ command: "FIELD", name: "WWDSEQ", value: "E" });
							// enter
							_this.automationSteps.push({ command: "KEY", value: "ENTER" });
							// set sorting order
							_this.automationSteps.push({ command: "FIELD", name: "WWQTTP", value: "1" });
							// enter
							_this.automationSteps.push({ command: "KEY", value: "ENTER" });
						}
						// autoset
						_this.automationSteps.push({ command: "AUTOSET", value: "P" });
						// set positing fields
						_this.automationSteps.push({ command: "FIELD", name: "WBPONR", value: response.items[i].PK02 });
						// change
						_this.automationSteps.push({ command: "LSTOPT", value: "2" });
						// rev sign qty
						_this.automationSteps.push({ command: "FIELD", name: "WEORQT", value: response.items[i].N996 });
						// enter
						_this.automationSteps.push({ command: "KEY", value: "ENTER" });
						// build automation xml string
						if (i == (response.items.length-1)) {
							// settings
							_this.automationSteps.push({ command: "KEY", value: "F13" });
							// set panel sequence
							_this.automationSteps.push({ command: "FIELD", name: "WWDSEQ", value: "F" });
							// enter
							_this.automationSteps.push({ command: "KEY", value: "ENTER" });
							// launch automation xml string
							ScriptUtil.Launch(_this.createAutomationXML(_this.automationSteps));
						}
					}
				}
			}
		}).catch(function (response) {
			//debugger;
			console.log("MICaller-response: " + response.errorMessage);
		});
	};
	/**
	 * Create and return an automation XML string constructed from the automation steps
	 *
	 * Commands available
	 * RUN - { command: "RUN", value: "PROGRAM" }
	 * KEY - { command: "KEY", value: "VALUE" }
	 * FIELD - { command: "FIELD", name: "NAME", value: "VALUE" }
	 * LSTOPT - { command: "LSTOPT", value: "VALUE" }
	 * AUTOSET - { command: "AUTOSET", value: "VALUE" }
	 */
	M318_OIS101_B1_F14.prototype.createAutomationXML = function (automationSteps) {	//A 20211220 Jorge
		var i = 0;
		var automationXML = "<?xml version='1.0' encoding='utf-8'?><sequence>";
		while (this.automationSteps.length > 0) {
			var next = this.automationSteps[i + 1];
			var current = this.automationSteps.shift();
			// Handles out of bounds ranges
			if (!next) {
				if (current["command"] === "FIELD") {
					automationXML += "<field name='" + current["name"] + "'>" + current["value"] + "</field>";
					automationXML += "</step>";
				}
				else if (current["command"] === "LSTOPT" || current["command"] === "KEY" || current["command"] === "AUTOSET") {
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
		return automationXML;
	};
	/**
	 * addFieldValueSMCD - Retrieve Salesperson
	 * //A 20201103
	 * @param {any} complaintOrder
	 * @param {any} complaintNumber
	 * @param {any} origInvoice
	 * @param {any} origCO
	 * @param {any} origLine
	 */
	M318_OIS101_B1_F14.prototype.addFieldValueSMCD = function (complaintOrder, complaintNumber, complaintSubNo, origInvoice, origCO, custNo, userID) {   //A 20200703 Jorge
		var _this = this;
		debugger;
		//Get Salesperson
		var vQuery = "OBSMCD from OOLINE where OBORNO = '" + complaintOrder + "' and OBPONR = " + complaintNumber;
		this.MICaller("EXPORTMI", "Select", {
			QERY: vQuery
		}, ["REPL"]).then(function (response2) {
			debugger;
			if (response2 != null && response2.items != undefined && response2.items != null && response2.items.length > 0 && response2.items[0].REPL != "") {
				//Save Original Invoice/CO/line values
				_this.addFieldValue(complaintOrder, complaintNumber, complaintSubNo, origInvoice, origCO, custNo, response2.items[0].REPL, userID);
			} else {
				//Save Original Invoice/CO/line values
				_this.addFieldValue(complaintOrder, complaintNumber, complaintSubNo, origInvoice, origCO, custNo, "", userID);
			}
		}).catch(function (response2) {
			//debugger;
			console.log("MICaller-response: " + response2.errorMessage);
			_this.addFieldValue(complaintOrder, complaintNumber, complaintSubNo, origInvoice, origCO, custNo, "", userID);
		});
	};
	M318_OIS101_B1_F14.prototype.addFieldValue = function (thisOrder, thisLine, thisSubNo, origInvoice, origCO, custNo, salesPerson, userID) {  //A 20201103
		var creditStatus = "0";
		var _this = this;
		_this.vCONO = ScriptUtil.GetUserContext("CONO");
		//Save Original Invoice/CO/line values
		/*this.MICaller("CUSEXTMI", "AddFieldValue", {
            FILE: "OOLINE",
            PK01: thisOrder,
            PK02: thisLine,
            PK03: thisSubNo,
            A130: creditStatus,
            A330: origInvoice,
            A430: origCO,
            A530: custNo,
            A630: salesPerson,
            A730: userID  */
		this.MICaller("EXT001MI", "AddEXTCOL", {
			CONO: _this.vCONO,
			ORNO: thisOrder,
			PONR: thisLine,
			POSX: thisSubNo,
			CRST: creditStatus,
			OIVN: origInvoice,
			OORN: origCO,
			CUNO: custNo,
			SMCD: salesPerson,
			RESP: userID
		}, []).then(function (responseAdd) {
			debugger;
			console.log("MICall successful:CUSEXTMI/AddFieldValue");
		}).catch(function (responseAdd) {
			debugger;
			console.log("MICaller-response: " + responseAdd.errorMessage);
		});
	};
	M318_OIS101_B1_F14.prototype.MICaller = function (iProgram, iTransaction, iRecord, iOutputFields) { //A 20201103
		var request = new MIRequest();
		request.program = iProgram;
		request.transaction = iTransaction;
		request.record = iRecord;
		request.outputFields = iOutputFields;
		request.includeMetadata = true;
		request.typedOutput = true;
		request.maxReturnedRecords = 0;
		return MIService.Current.executeRequest(request);
	};
	M318_OIS101_B1_F14.prototype.addButton = function (text, top, left) {

	}
	/**
	 * Add button with absolute position
	 */
	/*
	M318_OIS101_B1_F14.prototype.addButton = function (text, top, left) {
		// Create
		debugger;
		var $button = $('<button></button>', {
			'class': "inforFormButton " + this.SCRIPTNAME + "_button",
			'text': "" + text,
			'id': this.SCRIPTNAME + "_button_top" + top + "_left" + left
		});
		this.SetPosition($button, left, top, 10);
		// Return
		return $button;
	};
	M318_OIS101_B1_F14.prototype.SetPosition = function (element, column, row, width) {
		// If the element is a TextBox, one have to subtract width with -6 (pixels for added padding and border) in order to get the desired width
		debugger;
		var isElementTextBox = false;
		var isElementLabel = false;
		var classNameArray = element[0].className.split(' ');
		for (var i = 0; i < classNameArray.length; i++) {
			if (classNameArray[i] == 'inforTextbox') {
				isElementTextBox = true;
			}
			else if (classNameArray[i] == 'inforLabel') {
				isElementLabel = true;
			}
		}
		var rowForAppendingElement = "#pRow" + row; //(row + 1);  // +1 -> Since the top row start with id: #pRow2
		var inputCol = column;
		var columnValue = (inputCol * 10) + "px"; // *10 -> To make each "column" 10px wide
		var inputWidth = width;
		if (!inputWidth) {
			inputWidth = "auto";
		}
		else {
			if (typeof inputWidth === 'number') {
				if (isElementTextBox) {
					inputWidth = (inputWidth * 10 - 6) + "px"; //Subtracting for added padding and border (2+2+1+1) by a stylesheet.
				}
				else if (isElementLabel) {
					inputWidth = (inputWidth * 10 - 10) + "px"; //Subtracting for added padding-right (10px) by a stylesheet.
				}
				else {
					inputWidth = (inputWidth * 10) + "px";
				}
			}
			else if (typeof inputWidth === 'string') {
				if (isElementTextBox) {
					inputWidth = (+inputWidth * 10 - 6) + "px"; //Subtracting for added padding and border (2+2+1+1) by a stylesheet.
				}
				else if (isElementLabel) {
					inputWidth = (+inputWidth * 10 - 10) + "px"; //Subtracting for added padding (10px) by a stylesheet.
				}
				else {
					inputWidth = (+inputWidth * 10) + "px";
				}
			}
			else {
				// Log("Not a valid input value for width. Setting \"auto\" as width instead.");
				inputWidth = "auto";
			}
		}
		// Add the different values for row, column and width to a cssObject
		var cssObject = {
			position: "absolute",
			left: columnValue,
			width: inputWidth,
		};
		// Add the cssObject to the element
		element.css(cssObject);
		//  Use free placement if 5th arg exist
		element.css("top", row + "px");
		element.css("left", column + "px");
		this.controller.GetContent().append(element);
	}
*/


	/**
	 * Split a string into array of substrings and remove any whitespaces.
	 */
	M318_OIS101_B1_F14.prototype.parseArguments = function (args) {
		return args
			.split(',')
			.map(function (item) { return item.trim(); });
	};
	/**
	 * Show message to user
	 * @param {string} dialogType - The type on the dialog "Error", "Warning", "Info"
	 * @param {string} message - The message to display
	 */
	M318_OIS101_B1_F14.prototype.showMessage = function (dialogType, message, header) {
		ConfirmDialog.Show({
			header: header || this.SCRIPTNAME,
			dialogType: dialogType,
			message: message || 'default message'
		});
	};
	M318_OIS101_B1_F14.prototype.attachEvents = function (controller) {
		var _this = this;
		this.detachRequesting = controller.Requesting.On(function (e) {
			_this.onRequesting(e);
		});
		this.detachRequested = controller.Requested.On(function (e) {
			_this.onRequested(e);
		});
		this.detachRequestCompleted = controller.RequestCompleted.On(function (e) {
			_this.onRequestCompleted(e);
		});
	};
	M318_OIS101_B1_F14.prototype.onRequesting = function (args) {
		console.log("Requesting");
	};
	M318_OIS101_B1_F14.prototype.onRequested = function (args) {
	};
	M318_OIS101_B1_F14.prototype.onRequestCompleted = function (args) {
		if (args.commandType === "KEY" && args.commandValue === "F14") {
			console.log("OIS101->F14");
			this.saveLastLine();
		}
		// RGUAL START IXS 16732864 09/08/22
		if (args.commandType === "KEY" && args.commandValue === "ENTER") {
			console.log("IXS 16732864 TEST");
			// Skip if coming from OIS106's F14
			if (!SessionCache.Get("M318_OIS106_F14")) {
				this.manualCreate();    //A 20201103
				console.log("IXS 16732864 TEST EXECUTED");
			}
			SessionCache.Remove("M318_OIS106_F14");

		}
		// RGUAL END IXS 16732864 09/08/22
		this.detachRequesting();
		this.detachRequested();
		this.detachRequestCompleted();
		this.log.Info("Request Completed");
	};
	return M318_OIS101_B1_F14;
}());