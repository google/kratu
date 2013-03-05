Kratu
=====
> Kratu is an Open Source client-side analysis framework to create simple yet powerful renditions of data. It allows you to dynamically adjust your view of the data to highlight opportunities, issues and correlations in the data.
> [Kratu is a Sanskrit](http://spokensanskrit.de/index.php?tinput=kratu&script=&direction=SE&link=yes) word and means enlightenment, understanding and intelligence.

You can use Kratu to analyze data for support queue prioritization, account quality optimization, performance analysis, product comparison and much more.

![Example Kratu Report](http://google.github.com/kratu/img/tut_finalreport.png)

## Installation
**Note: if running locally, you might have to start your browser with a flag to allow local file loading. For Chrome, use _--allow-file-access-from-files_**
Simply [download Kratu](https://github.com/google/kratu/archive/master.zip) and extract, or check out the repository:

```
$ git clone https://github.com/google/kratu.git
```
## Quick start
If you want to see more of what Kratu can do, download (see above) and look at the examples included.

Otherwise, here's a quick look at how to render a simple report
```javascript
// Instantiate a new Kratu object
var kratu = new Kratu();

// Set the data we'd like to render
kratu.setEntities(data);

// Tell Kratu where to render our report
kratu.setRenderElement( document.getElementById('kratuReport') );

// And render it!
kratu.renderReport();
```

## In-depth tutorial
To get a better understanding of what Kratu has to offer, go through [this in-depth tutorial](https://github.com/google/kratu/generated_pages/tutorial), where we'll build a [product comparison analysis](https://github.com/google/kratu/examples/spaceshipselector/) that can help users figure out which spaceship to buy.

## Fine print
Pull requests are very much appreciated. Please sign the [Google Code contributor license agreement](http://code.google.com/legal/individual-cla-v1.0.html) (There is a convenient online form) before submitting.

<dl>
  <dt>Author</dt><dd><a href="https://plus.google.com/115142215538295075810">Tarjei Vassbotn (Google Inc.)</a></dd>
  <dt>Copyright</dt><dd>Copyright © 2013 Google, Inc.</dd>
  <dt>License</dt><dd>Apache 2.0</dd>
</dl>

