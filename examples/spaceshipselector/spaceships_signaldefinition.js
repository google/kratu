/**
 * @license Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Signal definitions for the Spaceships Selector
 * @constructor
 * @param {Kratu} kratu class instance.
 **/
 function KratuSignalDefinitions(kratu) {
  var toggleSignal = {click: kratu.eventHandlers.toggleSignal,     contextmenu: kratu.eventHandlers.adjustSignal};
  this.name = {
    calculateWeight: kratu.calculations.sumScore
  };
  this.model = {
    calculateWeight: kratu.calculations.sumScore
  };
  this.imageUrl = {
    format: function (value, elm) {
      var img = document.createElement('img');
      img.src = value;
      elm.classList.add('spaceshipImage');
      elm.appendChild(img);
      return null;
    }
  };
  this.cost = {
    format: kratu.formatters.money,
    calculateWeight: kratu.calculations.rankSmallToLarge,
    headerEventHandlers: toggleSignal
  };
  this.resellValueDrop = {
    format: kratu.formatters.percentage,
    headerEventHandlers: toggleSignal
  };
  this.engineSize = {
    format: kratu.formatters.singleDecimal,
    calculateWeight: kratu.calculations.rankLargeToSmall,
    headerEventHandlers: toggleSignal
  };
  this.hyperdrive = {
    format: kratu.formatters.boolean,
    headerEventHandlers: toggleSignal
  };
  this.kesselRunRecord = {
    format: kratu.formatters.integer,
    calculateWeight: kratu.calculations.rankSmallToLarge,
    headerEventHandlers: toggleSignal
  };
  this.freightCapacity = {
    calculateWeight: kratu.calculations.rankLargeToSmall,
    headerEventHandlers: toggleSignal
  };
  this.passengerCapacity = {
    format: kratu.formatters.integer,
    calculateWeight: kratu.calculations.rankLargeToSmall,
    headerEventHandlers: toggleSignal
  };
}
