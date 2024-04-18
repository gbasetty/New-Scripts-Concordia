var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var M347_OIS350B_AddInternalColumn = /** @class */ (function () {
    function M347_OIS350B_AddInternalColumn(args) {
        this.scriptName = 'M347_OIS350B_AddInternalColumn';
        this.cache = InstanceCache; // Use to create a cache instance when script is loaded for the first time
        this.key = this.scriptName; // Unique key for InstanceCache
        this.lastRowIndex = 0; // Used to track down the last row processed when page down
        this.COL_INTERNAL = 'ColInternal'; // Column id for Internal
        this.sortingOrder = '';
        this.DIVI = '';
        this.YEA4 = '';
        this.controller = args.controller;
        this.log = args.log;
    }
    M347_OIS350B_AddInternalColumn.Init = function (args) {
        new M347_OIS350B_AddInternalColumn(args).run();
    };
    // Start your code here
    M347_OIS350B_AddInternalColumn.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.checkPanel()) {
                            return [2 /*return*/];
                        }
                        // Get division
                        _a = this;
                        return [4 /*yield*/, this.getDivision()];
                    case 1:
                        // Get division
                        _a.DIVI = _b.sent();
                        this.appendColumns();
                        //this.populateData();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add new column
     */
    M347_OIS350B_AddInternalColumn.prototype.appendColumns = async function () {
        //debugger;
        // Get Grid

        this.grid = this.controller.GetGrid();
        // Get columns
        this.columns = this.grid.getColumns();
		
		console.log('columns (before):', this.columns);
		
		/*
        function SelectionCheckbox(row, cell, value, columnDef, dataContext, gridOptions) {
            //debugger;
            value = dataContext.ColInternal;
            var isReadonly = false;
            if (columnDef.editability !== undefined && columnDef.editability(row, cell, value, columnDef, dataContext) || !gridOptions.editable)
                isReadonly = true;
            var checkboxStyle = 'width: 20px; height: 20px; margin: auto;'; // Reduced size checkbox and centered alignment
            //return '<div class="inforCheckboxContainer ' + (isReadonly ? 'uneditable readonly"' : '"') + ' style="display: flex; justify-content: center;"> <div class="inforCheckbox ' + (isReadonly ? ' readonly"' : '"') + '><div><input type="checkbox" checked="checked" class="inforCheckbox" style="' + checkboxStyle + '"></div></div></div>';
            if (value === undefined)
                return '<div class="inforCheckboxContainer ' + (isReadonly ? 'uneditable readonly"' : '"') + ' style="display: flex; justify-content: center;"> <div class="inforCheckbox ' + (isReadonly ? ' readonly"' : '"') + '><div><input type="checkbox" class="inforCheckbox" style="' + checkboxStyle + '"></div></div></div>';
            if (value.toString() === '1' || value === 1 || value === true || value.toString().toLowerCase() === 'yes') {
                //return '<div class="inforCheckboxContainer ' + (isReadonly ? 'uneditable readonly"' : '"') + ' style="display: flex; justify-content: center;"> <div class="inforCheckbox ' + (isReadonly ? ' readonly"' : '"') + '><div><input type="checkbox" [forCheckBox]="true" class="inforCheckbox" style="' + checkboxStyle + '"></div></div></div>';
                return '<div class="inforCheckboxContainer ' + (isReadonly ? 'uneditable readonly"' : '"') + ' style="display: flex; justify-content: center;"> <div class="inforCheckbox ' + (isReadonly ? ' readonly"' : '"') + '><div><input type="checkbox" IsChecked="true" class="inforCheckbox" style="' + checkboxStyle + '"></div></div></div>';
            }
            else {
                return '<div class="inforCheckboxContainer ' + (isReadonly ? 'uneditable readonly"' : '"') + ' style="display: flex; justify-content: center;"> <div class="inforCheckbox ' + (isReadonly ? ' readonly"' : '"') + '><div><input type="checkbox" class="inforCheckbox" style="' + checkboxStyle + '"></div></div></div>';
            }
        }
		*/
		
		/*
        var maxLeadTimeCol = {
            id: this.COL_INTERNAL,
            field: this.COL_INTERNAL,
            name: 'Internal',
            width: 100,
            cat: 'BOOL',
            IsChecked: true,
            fullName: 'EXINTI',
            //value: dataContext.ColInternal,
            headerCssClass: 'listHeaderCapLabel alignRight',
            cssClass: 'alignRight',
            dataType: 'DECIMAL',
            formatter: SelectionCheckbox
        };
		*/
		
		const internalCol = {
			id: this.COL_INTERNAL,
			field: this.COL_INTERNAL,
			name: 'Internal',
			//columnType: 'CHECKBOX',
			dataType: 'DECIMAL',
			width: 100,
			isEditable: true, // TODO: Depends on value
		}
		console.log('internalCol:', internalCol);
		
		const formats = [
			//{ name: 'S1IVDT', columnType: 'INPUT' },
			{ name: this.COL_INTERNAL, columnType: 'CHECKBOX' },
		];
		
        // Add column on the last position
        this.columns.push(internalCol);
        this.grid.setColumns(this.columns);
		this.grid.setColumnsFormat(formats);
        this.populateData();
		
		console.log('columns (after):', this.grid.getColumns());
         /*
        this.grid = this.controller.GetGrid();
        this.columns = this.grid.getColumns();

        var CheckboxCellFormatter = function (row, cell, value, columnDef, dataContext, gridOptions) {
            var isReadonly = false;
            if (columnDef.editability !== undefined && columnDef.editability(row, cell, value, columnDef, dataContext) || !gridOptions.editable)
                isReadonly = true;
            if (value === undefined)
                return '<div class="inforCheckboxContainer ' + (isReadonly ? 'uneditable readonly"' : '"') + '> <div class="inforCheckbox ' + (isReadonly ? ' readonly"' : '"') + '><span ' + (isReadonly ? 'class="readonly"' : '') + '><input class="inforCheckbox" ' + (isReadonly ? ' readonly' : '') + ' type="checkbox" style="filter: alpha(opacity = 0);opacity: 0;"></span></div></div>';
            if (value.toString() === '1' || value === 1 || value === true || value.toString().toLowerCase() === 'yes') {
                return '<div class="inforCheckboxContainer ' + (isReadonly ? 'uneditable readonly"' : '"') + '> <div class="inforCheckbox ' + (isReadonly ? ' readonly"' : '"') + '><span class="checked' + (isReadonly ? ' readonly"' : '"') + '><input id="checkedCheckBox" ' + (isReadonly ? ' readonly' : '') + ' class="inforCheckbox" type="checkbox" checked="checked" style="filter: alpha(opacity = 0);opacity: 0;" disabled></span></div></div>';
            }
            else {
                return '<div class="inforCheckboxContainer ' + (isReadonly ? 'uneditable readonly"' : '"') + '> <div class="inforCheckbox ' + (isReadonly ? ' readonly"' : '"') + '><span ' + (isReadonly ? 'class="readonly"' : '') + '><input class="inforCheckbox" ' + (isReadonly ? ' readonly' : '') + ' type="checkbox" style="filter: alpha(opacity = 0);opacity: 0;" disabled></span></div></div>';
            }
        };


        var maxLeadTimeCol = {
            id: this.COL_INTERNAL,
            field: this.COL_INTERNAL,
            name: 'Internal',
            width: 120,
            cat: 'BOOL',
            checkboxField: true,
            colFld: 'EXINTI',
            headerCssClass: 'listHeaderCapLabel alignRight',
            cssClass: 'alignRight',
            dataType: 'DECIMAL',
            formatters: [CheckboxCellFormatter]
        };

        this.columns.push(maxLeadTimeCol);
        this.grid.setColumns(this.columns);
          */

    };
    /**
     * Populate data of added columns
     */
    M347_OIS350B_AddInternalColumn.prototype.populateData = function () {
        //debugger;
        var _this = this;
        this.allRequests = [];
        var rows = _this.grid.getData();
        var count = rows.length;
        rows.forEach(function (row, i) {
            _this.getInternalValue(row, i);
        });
        this.lastRowIndex = count;
    };
    /**
     * Process additional row caused by scroll down
     */
    M347_OIS350B_AddInternalColumn.prototype.processAdditionalData = function () {
        //debugger;
        this.allRequests = [];
        // Get the grid reference to make sure we have the correct grid after changing sorting order
        // this.grid = this.controller.GetGrid();
        var rows = this.grid.getData().getItems();
        var count = rows.length;
        for (var i = this.lastRowIndex; i < count; i++) {
            var row = rows[i];
            this.getInternalValue(row, i);
        }
        this.lastRowIndex = count;
    };
    /**
     * Get facility's division
     */
    M347_OIS350B_AddInternalColumn.prototype.getDivision = function () {
        return __awaiter(this, void 0, void 0, function () {
            var req, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req = {
                            program: 'CRS008MI',
                            transaction: 'Get',
                            outputFields: ['DIVI'],
                            record: {
                                FACI: ScriptUtil.GetFieldValue('WWFACI', this.controller)
                            }
                        };
                        return [4 /*yield*/, MIService.Current.executeRequest(req)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.item.DIVI];
                }
            });
        });
    };
    /**
     * Get internal value
     */
    M347_OIS350B_AddInternalColumn.prototype.getInternalValue = function (row, i) {
        //debugger;
        var _this = this;
        var EXIN_field = "S" + this.controller.GetSortingOrder() + "EXIN";
        this.YEA4 = ScriptUtil.GetFieldValue('WWYEA4', this.controller);
        // If sorting order = 3
        if (this.sortingOrder === '3') {
            var IVDT = row["S" + this.controller.GetSortingOrder() + "IVDT"];
            this.YEA4 = '20' + IVDT.substr(IVDT.length - 2);
        }
        var req = {
            program: 'CMS100MI',
            transaction: 'LstODHEAD_M347',
            outputFields: ['EXINTI'],
            record: {
                UADIVI: this.DIVI,
                UAYEA4: this.YEA4,
                UAEXIN: row[EXIN_field]
            }
        };
        var getInternal = MIService.Current.executeRequest(req);
        this.allRequests.push(getInternal);
        getInternal.then(function (res) {
            // row[this.COL_USID] = `${res.item.USID}_${i}`;
            if (res.items.length>0) {
                debugger;
				row[_this.COL_INTERNAL] = res.items[0].EXINTI;
				/*
                if(res.items[0].EXINTI == "1"){
                    row[_this.COL_INTERNAL] = true;
                }
                else{
                    row[_this.COL_INTERNAL] = false;
                }
				*/
                //row[_this.COL_INTERNAL] = res.items[0].EXINTI;
                var dataset = _this.grid.getData();
                _this.grid.setData(dataset);
                //_this.refreshRow(i);
            }
        }).catch(function (err) {
            _this.log.Error(err.program + "." + err.transaction + " Error: " + err.errorMessage);
        });
        /*
        try {
            var result = MIService.Current.executeRequest(req);
            if (result.items.length > 0) {
                row[_this.COL_INTERNAL] = result.items[0].EXINTI;
                _this.refreshRow(i);
            } else {
                console.log("Error");
            }
        }catch(getFieldValueResGet) {
            console.log("Error in CMS100MI.LstODHEAD_M347: ", getFieldValueResGet);
            // M347_OIS350B_AddInternalColumn.prototype.CheckFlowonFail("Error in CMS100MI.LstODHEAD_M347: ", getFieldValueResGet.message);
        }
         */
    };
    /**
     * Get column id
     */
    M347_OIS350B_AddInternalColumn.prototype.getColId = function (field) {
        //debugger;
        for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
            var col = _a[_i];
            if (col.colFld === field) {
                return col.id;
            }
        }
        return null;
    };
    /**
     * Refresh row
     */
    M347_OIS350B_AddInternalColumn.prototype.refreshRow = function (index) {
        //debugger;
        //this.grid.invalidateRow(index);
        //this.grid.render();
    };
    /**
     * Check if script should be attached
     */
    M347_OIS350B_AddInternalColumn.prototype.checkPanel = function () {
        // Do not apply on sorting 5 or 8
        if (this.sortingOrder === '5' ||
            this.sortingOrder === '8') {
            return false;
        }
        return true;
    };
    /**
     *  Attach H5 lifecycle events
     */
    M347_OIS350B_AddInternalColumn.prototype.connect = function () {
        var _this = this;
        this.removeRequestCompleted = this.controller.RequestCompleted.On(function (e) {
            _this.onRequestCompleted(e);
        });
    };
    M347_OIS350B_AddInternalColumn.prototype.onRequestCompleted = function (args) {
        var _this = this;
        // Detach events when no longer on the panel or sorting order
        if (this.controller.GetPanelName() !== this.panelName ||
            this.controller.GetSortingOrder() !== this.sortingOrder) {
            this.disconnect();
            return;
        }
        if (args.commandType === 'PAGE' && args.commandValue === 'DOWN') {
            Promise.all(this.allRequests).then(function () {
                _this.processAdditionalData();
            });
        }
        else {
            Promise.all(this.allRequests).then(function () {
                _this.populateData();
            });
        }
    };
    /**
     *  Detach event
     */
    M347_OIS350B_AddInternalColumn.prototype.disconnect = function () {
        this.removeRequestCompleted();
        this.cache.Remove(this.controller, this.key);
        this.log.Info('...Script detached');
    };
    M347_OIS350B_AddInternalColumn.prototype.run = function () {
        this.contentElement = this.controller.GetContentElement();
        this.log.Info('...Script running');
        // Get the panel name where this script is attached
        this.panelName = this.controller.GetPanelName();
        // Get the sorting order where this scirpt is attached
        this.sortingOrder = this.controller.GetSortingOrder();
        this.main();
        // Check the instance cache to see if this script has already attached to this program instance.
        if (this.cache.ContainsKey(this.controller, this.key)) {
            // The script is already attached to this instance.
            return;
        }
        // Add a key to the instance cache to prevent other instances of this script on the same program instance.
        this.cache.Add(this.controller, this.key, true);
        // Attach event
        this.connect();
    };
    return M347_OIS350B_AddInternalColumn;
}());