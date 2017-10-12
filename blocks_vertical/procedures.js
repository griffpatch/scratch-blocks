/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Procedure blocks for Scratch.
 */
'use strict';

goog.provide('Blockly.Blocks.procedures');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');


Blockly.Blocks['procedures_defnoreturn'] = {
  /**
   * Block for defining a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "define %1",
      "args0": [
        {
          "type": "input_statement",
          "name": "custom_block"
        }
      ],
      "extensions": ["colours_more", "shape_hat"]
    });
  }
};


Blockly.Blocks['procedures_callnoreturn'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setCategory(Blockly.Categories.more);
    this.setColour(Blockly.Colours.more.primary,
      Blockly.Colours.more.secondary,
      Blockly.Colours.more.tertiary);
    this._procCode = '';
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('proccode', this._procCode);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this._procCode = xmlElement.getAttribute('proccode');
    this._updateDisplay();
  },
  _updateDisplay: function() {
    // Split the proc into components, by %n, %b, and %s (ignoring escaped).
    var procComponents = this._procCode.split(/(?=[^\\]\%[nbs])/);
    procComponents = procComponents.map(function(c) {
      return c.trim(); // Strip whitespace.
    });
    // Create inputs and shadow blocks as appropriate.
    var inputPrefix = 'input';
    var inputCount = 0;
    for (var i = 0, component; component = procComponents[i]; i++) {
      var newLabel;
      if (component.substring(0, 1) == '%') {
        var inputType = component.substring(1, 2);
        newLabel = component.substring(2).trim();
        var inputName = inputPrefix + (inputCount++);
        switch (inputType) {
          case 'n':
            var input = this.appendValueInput(inputName);
            var num = this.workspace.newBlock('math_number');
            num.setShadow(true);
            num.outputConnection.connect(input.connection);
            break;
          case 'b':
            var input = this.appendValueInput(inputName);
            input.setCheck('Boolean');
            break;
          case 's':
            var input = this.appendValueInput(inputName);
            var text = this.workspace.newBlock('text');
            text.setShadow(true);
            text.outputConnection.connect(input.connection);
            break;
        }
      } else {
        newLabel = component.trim();
      }
      this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
    }
  }
};
Blockly.Blocks['procedures_callnoreturn_internal'] = {
  /**
   * Block for calling a procedure with no return value, for rendering inside
   * define block.
   * @this Blockly.Block
   */
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setCategory(Blockly.Categories.more);
    this.setColour(Blockly.Colours.more.primary,
      Blockly.Colours.more.secondary,
      Blockly.Colours.more.tertiary);

    /* Data known about the procedure. */
    this.procCode_ = '';
    this.argumentNames_ = [];
    this.argumentDefaults_ = [];
    this.warp_ = false;
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {

    var container = document.createElement('mutation');
    container.setAttribute('proccode', this.procCode_);
    container.setAttribute('argumentnames', JSON.stringify(this.argumentNames_));
    container.setAttribute('argumentdefaults', JSON.stringify(this.argumentDefaults_));
    container.setAttribute('warp', this.warp_);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.procCode_ = xmlElement.getAttribute('proccode');
    this.argumentNames_ =  JSON.parse(xmlElement.getAttribute('argumentnames'));
    this.argumentDefaults_ =  JSON.parse(xmlElement.getAttribute('argumentdefaults'));
    this.warp_ = xmlElement.getAttribute('warp');
    this.updateDisplay_();

  },
  updateDisplay_: function() {
    // Split the proc into components, by %n, %b, and %s (ignoring escaped).
    var procComponents = this.procCode_.split(/(?=[^\\]\%[nbs])/);
    procComponents = procComponents.map(function(c) {
      return c.trim(); // Strip whitespace.
    });
    // Create inputs and shadow blocks as appropriate.
    var inputPrefix = 'input';
    var inputCount = 0;
    for (var i = 0, component; component = procComponents[i]; i++) {
      var newLabel;
      if (component.substring(0, 1) == '%') {
        var inputType = component.substring(1, 2);
        newLabel = component.substring(2).trim();
        var inputName = inputPrefix + inputCount;
        var blockType = '';
        switch (inputType) {
          case 'n':
            blockType = 'argument_reporter_string_number';
            break;
          case 'b':
            blockType = 'argument_reporter_boolean';
            break;
          case 's':
            blockType = 'argument_reporter_string_number';
            break;
        }
        if (blockType) {
          var input = this.appendValueInput(inputName);
          var newBlock = this.workspace.newBlock(blockType);
          newBlock.setShadow(true);
          newBlock.setFieldValue(this.argumentNames_[inputCount], "VALUE");
          newBlock.outputConnection.connect(input.connection);
        }
        inputCount++;
      } else {
        newLabel = component.trim();
      }
      this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
    }
  }
};

Blockly.Blocks['procedures_param'] = {
  /**
   * Block for a parameter.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel(), 'paramName');

    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutput(true);

    this.setCategory(Blockly.Categories.more);
    this.setColour(Blockly.Colours.more.primary,
      Blockly.Colours.more.secondary,
      Blockly.Colours.more.tertiary);
    this._paramName = 'undefined';
    this._shape = 'r';
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('paramname', this._paramName);
    container.setAttribute('shape', this._shape);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this._paramName = xmlElement.getAttribute('paramname');
    this._shape = xmlElement.getAttribute('shape');
    this._updateDisplay();
  },
  _updateDisplay: function() {
    this.setFieldValue(this._paramName, 'paramName');
    switch (this._shape) {
      case 'b':
        this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
        this.setOutput(true, 'Boolean');
        break;
      case 's':
      default:
        this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
        this.setOutput(true, 'String');
        break;
    }
  }
};

Blockly.Blocks['argument_reporter_boolean'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_editable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "output_boolean"]
    });
  }
};

Blockly.Blocks['argument_reporter_string_number'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_editable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "output_number", "output_string"]
    });
  }
};
