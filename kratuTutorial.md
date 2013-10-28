Kratu Tutorial - Spaceship Comparison Analysis
==============================================
In this tutorial we'll build a product comparison analysis that can help users figure out which spaceship to buy.
If you get stuck along the way, you can find the final source code here: [https://github.com/google/kratu/tree/master/examples/spaceshipselector/](https://github.com/google/kratu/tree/master/examples/spaceshipselector)

## Before you start
Take your time to read the [Installation and Quick start](./index.html).

This tutorial assumes you have familiarity with HTML and Javascript.

## Overview
**How everything fits together:**
![Kratu Overview](http://google.github.com/kratu/img/overview.png)

In it's simplest form, Kratu takes a bunch of data (specifically a Javascript array with objects) and renders it in a table.

You can easily add pagination and have an awesome table renderer, but it offers so much more if you add a *report definition*.
This allows you to specify how Kratu will interpret your data, by assigning weights and thresholds to each data point category.
Further still, you can add *signal definitions* to have full flexibility over how data is processed, formatted and calculated.

In this tutorial we'll walk you through the various steps to build a full fledged analysis.

## Getting started
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
    <h1>Kratu Spaceship Selector</h1>
    <div id="kratuReport"></div>
  </body>
</html>
```

## Loading the data
Our data comes from a CSV-file with all the available spaceship models. You can find it in the [examples/spaceshipselector/](https://github.com/google/kratu/tree/master/examples/spaceshipselector/) folder.

Kratu comes with a simple CSV-loader/parser, so let's use that.
Include the following lines as the last line in the &lt;head&gt; section:
```html
<script src='js/dataproviders/csv.js'></script>
<script type="text/javascript">
  // We'll do our coding here
</script>
```

The following snippet will use our CSV-loader to load our spaceships and log them to our console:
```javascript
window.onload = function () {
  var csvProvider = new KratuCSVProvider();
  csvProvider.load('./spaceships_data.csv', function (ships) {
    console.log(ships);
  });
};
```

Your console should look something like this:
![Kratu Overview](http://google.github.com/kratu/img/tut_console.png)

## Rendering a basic report
Now that we've loaded our spaceships, let's see if we can get Kratu to list our data directly. Change your code to reflect the following:

```javascript
window.onload = function () {
  var csvProvider = new KratuCSVProvider();
  csvProvider.load('./spaceships_data.csv', function (ships) {

    // Instantiate a new Kratu object
    var kratu = new Kratu();

    // Give Kratu our spaceships
    kratu.setEntities(ships);

    // Tell Kratu where to render our report
    kratu.setRenderElement(document.getElementById('kratuReport'));

    // And render it!
    kratu.renderReport();

  });
};
```

And we should be able to see our first report:
![Our first report](http://google.github.com/kratu/img/tut_firstreport.png)


## Adding some weights
All right! Looks good, but not super useful as a comparison tool.

Let's add some weights and thresholds. Weights allow you to tell Kratu how important each datapoint is, relative to the other.
You can also supply thresholds, so Kratu knows when a datapoint is good or bad (see the *Signals, weights and thresholds* section in the end of this document for more information).

The easiest way to supply Kratu with this information, is to define a *report definition*.
The report definition is a javascript data structure that you can easily serialize to/from [JSON](http://en.wikipedia.org/wiki/JSON).

Here's a basic report definition that allows us to put weights and thresholds to the different datapoints for our spaceships:
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
Save this as *spaceship_reportdefinition.json*

(As you will see later, you can also supply a signal defintion written in javascript, adding powerful flexibility to your signals. The reason they are separated is to make it easy to store the report definition, enabling individual settings per user of your report. It also allows for code reuse, as the same signal definitions can be use by multiple report definitions).

To load this as a file, we use the simple JSON-loader supplied (feel free to use your favorite framwork instead).
Include the KratuJsonProvider...
```html
<script src='../../js/dataproviders/json.js'></script>
````
...and load *and* set the reportdefinition:
```javascript
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
        kratu.setReportDefinition(reportDefinition, function() {
          kratu.renderReport();
       });
      })
  });
};
```

Now it's starting to look like something:

![Added some weights](http://google.github.com/kratu/img/tut_addedweights.png)

## Ranking and formatting
But we can do even better!

Surely we need to consider price and other signals. We don't want to set specific limits to these, instead we want them to be dynamically ranked based on the other values.

In addition, we want to format our values properly, and we want to display the images of the models.
 
We would also want to make the user able to toggle which columns s/he cares about.

To do this, we need to add a bit of javascript:
First, let's update our report definition, so that Kratu knows that we will use a Javascript file to tell Kratu how each signal should be interpreted:

```json
{
  "signalDefinitionUrl":"./spaceships_signaldefinition.js",
  "signals": [
    {"key":"name", "name" : "Name"},
    ....
```

Then, let's create the file *spaceships_signaldefinition.js* and add the following to it:
```javascript
 function KratuSignalDefinitions(kratu) {
  // For name and model, we want to use the overall score.
  // This can be done by using the built in sumScore function
  this.name = {
    calculateWeight: kratu.calculations.sumScore
  };
  this.model = {
    calculateWeight: kratu.calculations.sumScore
  };

  // We want to be able to render the image using the url in
  // A custom format function allows us to do this
  this.imageUrl = {
    format: function (value, elm) {
      var img = document.createElement('img');
      img.src = value;
      elm.classList.add('spaceshipImage');
      elm.appendChild(img);
      return null;
    }
  };

  // Define common event handler signals to be togglable
  var toggleSignal = {click: kratu.eventHandlers.toggleSignal};

  // For the other signals, we're using built in formatters, and
  // built in ranking calculations instead of thresholds
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
(Have a look through the comments to better understand what's going on)

No need to update the code in our page, as Kratu will automatically load the specified signal definition supplied in the report definition.

## Final report
Congrats! We now have a complete spaceship comparison tool!
Notice the toggled columns:
![Final report](http://google.github.com/kratu/img/tut_finalreport.png)

# More Info
Kratu code itself is documented using JSDoc.

Below you will find detailed documentation on most of Kratu's features.

Take a deep dive in the examples included for more advanced usage.

### Summaries and averages
You can easily add summary and average rows to your report through the _report definition_.
Add a _summaryRows_ key to the _report definition_ with an array containing one object for each row you want to add.
The row objects must have keys for _type_ (_average_ or _sum_) and _location_ (_top_ or _bottom_):

```json
  "summaryRows":[
    {
      "location":"top",
      "type"    :"average"
    },
    {
      "location":"bottom",
      "type"    :"sum"
    }
  ]
```

For an advanced usage, check out the [AdWords Healtcheck example](https://github.com/google/kratu/tree/master/examples/adwordshealtcheck).


### Data composition
Datapoints for a given entity can be taken directly and unprocessed from the data source, or it can be combined by specifying a getData-function in the signal definition.
As an example, consider the following:

```javascript
this.resellValue = {
  getData:function (spaceship) {
    return spaceship.cost - (spaceship.cost * spaceship.resellValueDrop / 100);
  }
};

```
You can even introduce new signals, but remember to include these in the report definition, as this is what defines what ends up in the final report.


### Pagination
Kratu has built in pagination support. This helps rendering times when you're dealing with a lot of data.
See the [bugreport example](https://github.com/google/kratu/tree/master/examples/bugreport) for a fully implemented solution.

The methods supplied to support pagination are as follows:

* setPageSize(pageSize)
* getPageSize()
* clearPageSize()
* getNumPages()
* setCurrentPage(currentPage)
* getCurrentPage()
* renderPage(opt_pageNumber, opt_callback)
* renderCurrentPage(opt_callback)
* renderPreviousPage(opt_callback)
* renderNextPage(opt_callback)

### Eventhandlers
Kratu supports adding event handlers to both the cells in the report as well as the header. All standard Javascript events are supported.
Simply add your handlers in the _signal defintion_ like so:

```javascript
this.signal = {
  headerEventHandlers: {
    click: function (args) {
      var kratu = this;
      //...
    }
  },
  cellEventHandlers: {
    click: function (args) {
      var kratu = this;
      //...
    }
  }
};
```

Your handler will be called with the Kratu instance as the context object, and it will be supplied with an argument object comprising of 
* elm - the calling element object
* evt - the event object
* signal - the signal object
* entity - the data object (only for cellEventHandlers)
* score - the calculated score for this signal and entity (only for cellEventHandlers)
* value - the value for this signal and entity (only for cellEventHandlers)

### Toggling of signals
Kratu has built in support for toggling which signal goes into the overall calculation and prioritization of data.
To add toggling, simply add the built in _kratu.eventHandlers.toggleSignal_ as a click handler in the signal definitions:

```javascript
this.signalToBeTogglable = {
  headerEventHandlers: {
    click: kratu.eventHandlers.toggleSignal
  }
};
```
### Dynamic Adjustments of signals
Similarly to toggling, you can add UI for adjustments of signals (see the [AdWords Healtcheck example](https://github.com/google/kratu/tree/master/examples/adwordshealtcheck) for a working example):

```javascript
this.signalToBeTogglable = {
  headerEventHandlers: {
    click: kratu.eventHandlers.adjustSignal
  }
};
```

### Formatting
Signals can format their values and the cell they are presented in by supplying a format function in the _signal definition_;

```javascript
this.signalToBeFormatted = {
  format:function (value, cell) {
    cell.style.textAlign = 'center';
    return value+' kg';
  }
};
```

Kratu supplies built in formatters that can be used like this:

```javascript
this.signalToBeFormatted = {
  format:kratu.formatters.percentage
};
```

Available formatters are:
* boolean
* decimal
* percentage
* money
* singleDecimal
* integer
* string

### Custom score calculations
You can define how Kratu should calculate a score by defining a calculateScore function in the _signal definition_:

```javascript
this.signal = {
  calculateScore:function (spaceship) {
    var signal = this;
    if (spaceship.isPoorPerformer) return 0;
    else return 1 * signal.weight;
  }
};
```
(Calling context object is the Kratu Signal object.)

Advanced: If your function returns another function, this will be called after all signals have been calculated with a summary object containing the sum of all scores and the sum of all weights
This allows you to do intermediate staged calculations which you can use in the summaries.

### Sum Score for a signal
If you want a signal to be marked with the overall score and color of the entity, you can utilize the built in sumScore mechanism as we saw in the name and model signals above:

```javascript
this.name = {
  calculateWeight: kratu.calculations.sumScore
};
```

### Ranking and Sum Score
If your signal has an unknown range of potential value (ie. you can't set predetermined thresholds), you might want to consider using the built in rank calculation.
This looks at all your values for the particular signal and uses the maximum and minium value as boundaries for a distributed percentage. It then multiplies this value with the weight, yielding the score for that signal.

Like we saw above, this can look like this:

```javascript
this.kesselRunRecord = {
  calculateWeight: kratu.calculations.rankSmallToLarge,
};
this.freightCapacity = {
  calculateWeight: kratu.calculations.rankLargeToSmall,
};
```

### Signals, weights and thresholds

A _Kratu Signal_ is basically what ends up as the column in your report
The Kratu Signal gets defined by the _report definition_ and values found here will override any values specified in the optional _signal definition_.
Unless specified otherwise, each signal get's a calculated score. This score is based upon the _weight_ of the signal and the _thresholds_ of the signals (see below).

The report definition can describe the following attributes of a signal:

<dl>
  <dt>key</dt><dd>String (mandatory), identifying name of the signal</dd>
  <dt>name</dt><dd>String, descriptive name of signal</dd>
  <dt>weight</dt><dd>Float, Maximal impact signal can represent (0.0 - 100.0)</dd>
  <dt>lMax</dt><dd>Float, lowest point of low threshold where signal yields maximum opportunity. When getData &lt;= lMax, calc. weight = weight</dd>
  <dt>lMin</dt><dd>Float, lowest point of high threshold where signal yields minimum opportunity. When getData &gt; lMin (and &lt; hMin, if defined), calculated weight = 0</dd>
  <dt>hMin</dt><dd>Float, lowest point of high threshold where signal yields minimum opportunity. When getData &lt; hMin (and &gt; lMin, if defined), calculated weight = 0</dd>
  <dt>hMax</dt><dd>Float, highest point of high threshold where signal yields maximum opportunity.  When getData &gt;= hMax, calculated weight = weight</dd>
  <dt>scaleExponent</dt><dd>float, used to ease the curve between lMax/lMin and hMin/hMax - see adjustment of signal to visualize.</dd>
</dl>

The signal definition can additionaly describe:

<dl>
  <dt>getData</dt><dd>Function, method that will be called to get the data for this signal. If not provided, the signals key will be used to lookup the corresponding value in the account-object</dd>
  <dt>range</dt><dd>Object, provides boundaries for adjusting the signal and should contain an object with a min, max and step key/value</dd>
  <dt>format</dt><dd>Function, function that takes the return data from getData as first argument</dd>
  <dt>isBoolean</dt><dd>Boolean, flag to show that this is a boolean signal</dd>
  <dt>hasCalculation</dt><dd>Function, method that determines wether to calculate a score for this signal</dd>
  <dt>calculateWeight</dt><dd>Function, overridable method for calculating the score for this signal.</dd>
</dl>
