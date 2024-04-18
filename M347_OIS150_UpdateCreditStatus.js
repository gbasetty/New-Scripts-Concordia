/**
 * @author Jeremie Concon
 * @version 1.0.0
 * @since 20230308
 *
 * @description
 * M3
 *
 * History:
 * 16358713 - Update customize parameters in STS201.
 */

var M347_OIS150_UpdateCreditStatus = /** @class */ (function () {
   function M347_OIS150_UpdateCreditStatus(scriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
        this.element = scriptArgs.elem;
        this.SCRIPTNAME = 'M347_OIS150_UpdateCreditStatus';	
		panelFlag = this.controller.GetPanelName() == "OIA150E0";
    }
    /**
     * Script initialization static function; Entry point for M3 Panel personalized script
     */
    M347_OIS150_UpdateCreditStatus.Init = function (scriptArgs) {
        new M347_OIS150_UpdateCreditStatus(scriptArgs).run();
		
    };
	
    M347_OIS150_UpdateCreditStatus.prototype.run = function () {
		debugger;
		if(this.controller.GetPanelName() == "OIA150E0"){
			var _this = this;
			console.log(this.SCRIPTNAME + " is now running...");
			//var content = this.controller.GetContentElement();
			var WWORNO = ScriptUtil.GetFieldValue("WWORNO");
			var WWWHLO = ScriptUtil.GetFieldValue("WWWHLO");
			var WWDLIX = ScriptUtil.GetFieldValue("WWDLIX");
			var WRTEPY = ScriptUtil.GetFieldValue("WRTEPY");
			_this.uORNO = WWORNO;
			_this.uWHLO = WWWHLO;
			_this.uDLIX = WWDLIX;
			_this.uTEPY = WRTEPY;
			_this.uDIVI = ScriptUtil.GetUserContext("CurrentDivision");
			_this.uCONO = ScriptUtil.GetUserContext("CurrentCompany"); 
			_this.getEXTODH();
			var lblleft_7 = 40;
			var lbltop_7 = 18;
			var lblwidth_7 = 163;
			_this.createLabel("lblN096", "Internal - not to send to cust",lblleft_7,lbltop_7,lblwidth_7);
			
			//--------------------------------------------------------------------//
			
			var editMode = true;
			_this.editMode1 = true;
			if (document.getElementById("WRDLDT").readOnly) {
				var editMode = false;
				_this.editMode1 = false;
			}
			
			//--------------------------------------------------------------------//
			this.attachEvents(this.controller);
			//this.controller.Requested.On((eventArgs) => this.onRequested(eventArgs));
		}
    };
	
	M347_OIS150_UpdateCreditStatus.prototype.attachEvents = function (controller) {
        var _this = this;
		
        this.detachRequesting = controller.Requesting.On(function (e) {
            _this.onRequesting(e);
        });
       
    };
	
	M347_OIS150_UpdateCreditStatus.prototype.onRequesting = function (args) {
		debugger;
		panelFlag = this.controller.GetPanelName() == "OIA150E0";
		if(panelFlag){
			var _this = this;
			//var content = this.controller.GetContentElement();
			var WWORNO = ScriptUtil.GetFieldValue("WWORNO");
			var WWWHLO = ScriptUtil.GetFieldValue("WWWHLO");
			var WWDLIX = ScriptUtil.GetFieldValue("WWDLIX");
			var WRTEPY = ScriptUtil.GetFieldValue("WRTEPY");
			_this.uORNO = WWORNO;
			_this.uWHLO = WWWHLO;
			_this.uDLIX = WWDLIX;
			_this.uTEPY = WRTEPY;
			
			_this.uDIVI = ScriptUtil.GetUserContext("CurrentDivision"); 
			debugger;
			if(args.commandType === "KEY" && args.commandValue === "F12"){
				if (this.controller.GetPanelName() == "OIA150E0") {
					var check1 = document.getElementById('cusCHB1').checked;
					if(check1)	_this.uINTI = 1;
					else	_this.uINTI = 0;
					_this.changeEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI );
					//this.detachRequesting();
					//this.detachRequested();
					//this.detachRequestCompleted();
				} else {
					//_this.getEXTODH();
					var check1 = document.getElementById('cusCHB1').checked;
					if(check1)	_this.uINTI = 1;
					else	_this.uINTI = 0;
					_this.changeEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI );
					
				}
			}
			if (args.commandType === "LSTOPT" && args.commandValue === "5" ||
				args.commandType === "KEY" && args.commandValue === "F5" ||
				args.commandType === "LSTOPT" && args.commandValue === "2") {
				var WWORNO = ScriptUtil.GetFieldValue("WWORNO");
				var WWWHLO = ScriptUtil.GetFieldValue("WWWHLO");
				var WWDLIX = ScriptUtil.GetFieldValue("WWDLIX");
				var WRTEPY = ScriptUtil.GetFieldValue("WRTEPY");
				_this.uORNO = WWORNO;
				_this.uWHLO = WWWHLO;
				_this.uDLIX = WWDLIX;
				_this.uTEPY = WRTEPY;
				//_this.getEXTODH();
				var check1 = document.getElementById('cusCHB1').checked;
				if(check1)	_this.uINTI = 1;
				else	_this.uINTI = 0;
				_this.changeEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI );
				
			}
			if ((args.commandType === "KEY" && args.commandValue === "ENTER")) {
				var check1 = document.getElementById('cusCHB1').checked;
				if(check1)	_this.uINTI = 1;
				else	_this.uINTI = 0;
				//_this.addEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI);
				_this.changeEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI);
			} 
		}
	}
	
	M347_OIS150_UpdateCreditStatus.prototype.changeEXTODH = function (CONO, WHLO, ORNO, DLIX, TEPY, INTI) {
		debugger;
		if(panelFlag){
			var _this = this;
			
			var myRequest = new MIRequest();
			myRequest.program = "EXT004MI";
			myRequest.transaction = "UpdEXTODH";
			// var iCONO = parseInt(CONO);
			// var iDLIX = parseInt(DLIX);
			// var iINTI = parseInt(INTI);
			if (INTI === null || INTI === NaN || INTI === "undefined") {
				INTI = "0";
				// iINTI = parseInt(INTI);
			}
			
			//debugger: 
			myRequest.record = {CONO: _this.uCONO, WHLO:_this.uWHLO, ORNO:_this.uORNO, DLIX:_this.uDLIX, TEPY: _this.uTEPY, INTI: INTI};
			MIService.Current.executeRequest(myRequest).then(function (response) {
				debugger;
				
			}).catch(function (response) {
				//Handle errors here
				_this.log.Error(response.errorMessage);
				
			});
		}
		
    };
	
	M347_OIS150_UpdateCreditStatus.prototype.getEXTODH = function () {
		debugger;
		if(panelFlag){
			var _this = this;
			var myRequest = new MIRequest();
			myRequest.program = "EXT004MI";
			myRequest.transaction = "GetEXTODH";
			//debugger: 
			myRequest.record = {CONO: _this.uCONO, ORNO:_this.uORNO, WHLO:_this.uWHLO, DLIX:_this.uDLIX, TEPY:_this.uTEPY};
			MIService.Current.executeRequest(myRequest).then(function (response) {
				debugger;
				 for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
					var item = _a[_i];
					_this.vINTI = item.INTI;
					if (_this.vINTI == "1") {
						_this.uINTI = "1";
						var checkValue1 = true;
					} else {
						_this.uINTI = "0";
						var checkValue1 = false;
					}
					var chkleft_1 = 54
					var chktop_1 = 18;
					var chkwidth_1 = 20;
					if(document.getElementById('cusCHB1')==null){
						_this.createCheckBox("cusCHB1", chkleft_1, chktop_1, chkwidth_1, _this.editMode1,checkValue1);
					}
				 }
				 if(document.getElementById('cusCHB1')==null)
				 {
					_this.addEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI); 
				 }
			   
			}).catch(function (response) {
				 if (response.errorType = "1") { // Check handler if record already exist
					_this.addEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI);
				} else {
					//Handle errors here
					_this.log.Error(response.errorMessage);
				}
				
			});
		}
    };	
	
	M347_OIS150_UpdateCreditStatus.prototype.addEXTODH = function (CONO, ORNO, WHLO, DLIX, TEPY, INTI) {
		debugger;
		if(panelFlag){
			var _this = this;
			var myRequest = new MIRequest();
			var iINTI = parseInt(INTI);
			if (INTI === null || INTI === NaN || INTI === "undefined") {
				INTI = "0";
				iINTI = parseInt(INTI);
			}
			myRequest.program = "EXT004MI";
			myRequest.transaction = "AddEXTODH";
			//debugger: 
			myRequest.record = {CONO: _this.uCONO, WHLO:_this.uWHLO, ORNO:_this.uORNO, DLIX:_this.uDLIX, TEPY: _this.uTEPY, INTI: INTI};
			MIService.Current.executeRequest(myRequest).then(function (response) {
				debugger;
					_this.vINTI = iINTI;
					if (_this.vINTI == "1") {
						_this.uINTI = "1";
						var checkValue1 = true;
					} else {
						_this.uINTI = "0";
						var checkValue1 = false;
					}
					var chkleft_1 = 54
					var chktop_1 = 18;
					var chkwidth_1 = 20;
					if(document.getElementById('cusCHB1')==null)
					{
						_this.createCheckBox("cusCHB1", chkleft_1, chktop_1, chkwidth_1, _this.editMode1,checkValue1);
					}
					else{
						_this.changeEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI);
					}
							
			}).catch(function (response) {
				if (response.errorType = "1") {
					if (_this.uINTI == "1") {
						var checkValue1 = true;
					} else {
						var checkValue1 = false;
					}
					var chkleft_1 = 54
					var chktop_1 = 18;
					var chkwidth_1 = 20;
					_this.createCheckBox("cusCHB1", chkleft_1, chktop_1, chkwidth_1, _this.editMode1,checkValue1);
				}
				if (response.errorType = "4") { // Check handler if record already exist
					_this.changeEXTODH(_this.uCONO, _this.uWHLO,  _this.uORNO, _this.uDLIX, _this.uTEPY, _this.uINTI);
				} else {
					//Handle errors here
					_this.log.Error(response.errorMessage);
				}
				
			});
		}
    };	
	
	
	
	
    M347_OIS150_UpdateCreditStatus.prototype.createLabel = function (lblName,lblValue,posLeft1,posTop1,posWidth1) {
		debugger;
		if(panelFlag){
			var labelElement = new LabelElement();
			labelElement.Name = lblName;
			labelElement.Value = lblValue;
			labelElement.Position = new PositionElement();
			labelElement.Position.Top = posTop1;
			labelElement.Position.Left = posLeft1;
			labelElement.Position.Width = posWidth1;
			var contentElement = this.controller.GetContentElement();
			contentElement.AddElement(labelElement);
		}
    };
	
	M347_OIS150_UpdateCreditStatus.prototype.createCheckBox = function (chkBoxName,posLeft,posTop,posWidth,disp,val) {
		debugger;
		if(panelFlag){
			var buttonElement  = new CheckBoxElement();
			buttonElement.Name = chkBoxName;
			buttonElement.Position = new PositionElement();
			buttonElement.IsChecked = val;
			buttonElement.Position.Top = posTop;
			buttonElement.Position.Left = posLeft;
			buttonElement.Position.Width = posWidth;
			buttonElement.IsEnabled = disp;
			 var $txt2 = this.controller.GetContentElement().AddElement(buttonElement);
			return $txt2;
		}
    };
    return M347_OIS150_UpdateCreditStatus;
}());

