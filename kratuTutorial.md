Kratu Tutorial - Spaceship Comparison Analysis
==============================================
In this tutorial we'll build a product comparison analysis that can help users figure out which spaceship to buy.
If you get stuck along the way, you can find the final source code here: [https://github.com/google/kratu/tree/master/examples/spaceshipselector](https://github.com/google/kratu/tree/master/examples/spaceshipselector)

### Before you start
Take your time to read the [Installation and Quick start](./index.html) or perhaps watch the [video](http://youtu.be/xyz123)

### Overview
Chart showing how everything fits together:
![Kratu Overview](http://google.github.com/kratu/img/overview.png)

XXX

### Getting started
Let's create a basic HTML page and include a reference to the Kratu library itself and it's stylesheet.
*Note: We're assuming you place this page on the root of where you checked out Kratu.*

```html
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Kratu Spaceship Selector</title>
    <link rel="stylesheet" href="css/kratu.css">
    <script src='js/kratu.js'></script>
  </head>
  <body>
    <div class="kratuLogo small">
      <a href="">k</a><span>powered by</span>
    </div>
    <h1>Kratu Spaceship Selector</h1>
    <div id="kratuReport"></div>
  </body>
</html>
```

#### Loading the data
Our data comes from a CSV-file with all the available spaceship models. You can find it in the *examples/spaceshipselector/* folder.

Kratu comes with a simple CSV-loader/parser, so let's use that.
Include the following line as the last line in the head section:
```html
<script src='js/dataproviders/csv.js'></script>
```

And directly after that, put the following snippet to use the CSV-loader to load our spaceships and log them to our console:
```javascript
<script type="text/javascript">
  window.onload = function () {
    var csvProvider = new KratuCSVProvider();
    csvProvider.load('./spaceships_data.csv', function (ships) {
      console.log(ships);
    });
  };
</script>
```

Your console should look something like this:
![Kratu Overview](http://google.github.com/kratu/img/tut_console.png)

### Rendering a basic report
Now that we have loaded our spaceships, let's see if we can get Kratu to list our data directly:

```javascript
<script type="text/javascript">
  window.onload = function () {
    var csvProvider = new KratuCSVProvider();
    csvProvider.load('./spaceships_data.csv', function (ships) {
      // Instantiate a new Kratu object
      var kratu = new Kratu();

      // Give Kratu our spaceships
      kratu.setEntities(spaceships);

      // Tell Kratu where to render our report
      kratu.setRenderElement(document.getElementById('kratuReport'));

      // And render it!
      kratu.renderReport();
    });
  };
</script>
```

And we should see our first glimpse of a report:
![Our first report](http://google.github.com/kratu/img/tut_firstreport.png)


### Adding some weights
All right! Looks good, but not very useful as a comparison tool.

Let's add some weights and thresholds.
With Kratu, you can define a ReportDefinition where you can define how Kratu should interpret signals.
You can choose how you define it, but if you use [JSON](http://en.wikipedia.org/wiki/JSON), it's very easy to store the configuration either server or client side, and thus enable multiple settings per user of your system.

Here's a report definition that allows us to put weights and values to the different data points on our spaceships.
Save this as *spaceship_reportdefinition.json*:

```json
{
  "signalDefinitionUrl":"./spaceships_signaldefinition.js",
  "signals": [
    {"key":"name", "name":"Name"},
    {"key":"model", "name":"Model"},
    {"key":"imageUrl", "name":"Image"},
    {"key":"cost", "name":"Cost", "weight":100},
    {"key":"resellValueDrop", "name":"Resell Value Drop",
     "weight":80, "lMax": 20, "lMin": 50},
    {"key":"engineSize", "name":"Engine Size",
     "weight":10},
    {"key":"propulsionType", "name":"Propulsion Type",
     "weight":100, "lMin":0, "lMax":100},
    {"key":"hyperdrive", "name":"Hyperdrive",
     "weight":40, "hMin":0, "hMax":1},
    {"key":"kesselRunRecord", "name":"Kessel Run Record",
     "weight":20},
    {"key":"freightCapacity", "name":"Freight Capacity",
     "weight":30},
    {"key":"passengerCapacity", "name":"Passenger Capacity",
     "weight":40}
    ]
}
```

To load this as a file, you can use the simple JSON-loader supplied, but if you use other frameworks such as jQuery, feel free to use these to load the reportdefinition.

Include the KratuJsonProvider:
```html
<script src='../../js/dataproviders/json.js'></script>
````

And then load and set the reportdefinition:
```javascript
<script type="text/javascript">
  window.onload = function () {
    var csvProvider = new KratuCSVProvider();
    csvProvider.load('./spaceships_data.csv', function (ships) {
      // Instantiate a new Kratu object
      var kratu = new Kratu();

      // Give Kratu our spaceships
      kratu.setEntities(spaceships);

      // Tell Kratu where to render our report
      kratu.setRenderElement(document.getElementById('kratuReport'));

      var jsonProvider = new KratuJsonProvider();
      jsonProvider.load('./spaceships_reportdefinition.json', 
        function (reportDefinition) {
          kratu.setReportDefinition(reportDefinition);
          kratu.renderReport();
        })
    });
  };
</script>
```

That looks much better!

![Added some weights](http://google.github.com/kratu/img/tut_addedweights.png)

### Ranking and formatting
But we can do better - surely we need to consider price and other signals.
We don't want to set specific limits to these, instead we want them to be dynamically ranked based on the other values.
In addition, we want to format our values so we can display the images, and we also want to make the user able to toggle which
columns he wants to compare in the report.

To do this, we need a bit of javascript power.
First, let's update our report definition, so that Kratu knows that we will add a Javascript file that allows us to tell Kratu how each signal will behave:

XXX Comment this code

```json
{
  "signalDefinitionUrl":"./spaceships_signaldefinition.js",
  "signals": [
    {"key":"name", "name" : "Name"},
    ....
```
Then, let's create add the following to the file *spaceships_signaldefinition.js*

```javascript
function KratuSignalDefinitions(kratu) {
  var toggleSignal = {click: kratu.eventHandlers.toggleSignal};
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
```

### Final report
We now have a complete spaceship comparison tool!
Notice the toggled columns.

![Final report](http://google.github.com/kratu/img/tut_finalreport.png)

### More info
Kratu code itself is documented using JSDoc.
As time progresses we'll probably add more documentation, but take a deep dive in the examples included for more advanced usage. 

#### Signals, weights and thresholds

XXX

* @param {Object} signalDefinition - can either come directly
 *  from the report definition or the signal definition reference in the report
 *  signalDefinition can consist of the following key/values:
 *  key : String - mandatory, identifying name of the signal
 *  name : String - optional, descriptive name of signal
 *  getData : Function - optional, method that will be called to get the data
 *    for this signal. If not provided, the signals key will be used to lookup
 *    the corresponding value in the account-object
 *  weight : Float - optional, Maximal impact signal can represent (0.0 - 100.0)
 *  lMax : Float - optional, lowest point of low threshold where signal
 *    yields maximum opportunity. When getData <= lMax, calc. weight = weight
 *  lMin : Float - optional, lowest point of high threshold where signal
 *    yields minimum opportunity.
 *    When getData > lMin (and < jMin, if defined), calculated weight = 0
 *  hMin : Float - optional, lowest point of high threshold where signal
 *    yields minimum opportunity.
 *    When getData < hMin (and > lMin, if defined), calculated weight = 0
 *  hMax : Float - optional, highest point of high threshold where signal
 *    yields maximum opportunity.
 *    When getData >= hMax, calculated weight = weight
 *  scaleExponent : float - optional, used to ease the curve between
 *    lMax/lMin and hMin/hMax - see adjustment of signal to visualize.
 *  range : Object - optional, provides boundaries for adjusting the signal and
 *    should contain an object with a min, max and step key/value
 *  format : Function - optional, function that takes the return
 *    data from getData as first argument
 *  isBoolean : Boolean - optional, flag to show that this is a boolean signal
 *  hasCalculation : Function - optional, method that determines wether to
 *    calculate a score for this signal
 *  calculateWeight : Function - optional, overridable method for
 *    calculating the score for this signal.
 