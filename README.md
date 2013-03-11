#Express Resizer [![Dependency Status](https://gemnasium.com/thomaspeklak/express-resizer.png)](https://gemnasium.com/thomaspeklak/express-resizer)

Resizes images on the fly and stores them in a cache directory for later usage. You can define _presets_ that provide source and target directories and image manipulation functions. Express-Resizer is an Express app that can be mounted on an existing app.

##Status

__WIP__

Working but not tested in production. API might change significantly.

##Installation

    npm install express-resizer

##Usage

###Resizer and Presets

First you need to define a Resizer app that is the home for your presets.

    var Resizer = require("express-resizer");
    var myResizer = new Resizer();
    
Then you attach some Presets to the Resizer:
  
    myResizer.attach((new Preset("squareThumbs")
        .publicDir(__dirname + "/public")
        .from("/uploads")
        .resizeAndCrop({
            width: 100,
            height: 100,
        })
        .quality(50)
        .to("/thumbs"));

    myResizer.attach((new Preset("preview")
        .publicDir(__dirname + "/public")
        .from("/uploads")
        .resize({
            width: 600,
            height: 600,
        })
        .quality(75)
        .to("/preview"));


##Views Helper

In your views you can generate a path to your presets with automatically generated helper functions that follow the scheme: PresetNamePath and PresetNameImage

    img.thumb(src="#{squareThumbPath("test.jpg")}") // /thumbs/test.jpg
    !#{squareThumbImage("test.jpg", "Thumb")        // <img src="/thumbs/test.jpg" alt="Thumb">

    img.preview(src="#{PreviewPath("test.jpg)}")    // /preview/test.jpg
    !#{previewImage("test.jpg", "Preview")          // <img src="/preview/test.jpg" alt="Preview">
