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
    var myResizer = new Resizer(__dirname + "/public");
    
Then you attach some Presets to the Resizer:
  
    myResizer.attach("squareThumbs")
        .from("/uploads")
        .resizeAndCrop({
            width: 100,
            height: 100,
        })
        .quality(50)
        .to("/thumbs");

    myResizer.attach("preview")
        .from("/uploads")
        .resize({
            width: 600,
            height: 600,
        })
        .quality(75)
        .to("/preview");

Then use it as a middleware in your app:

    var app = express();
    app.use(myResizer);

###new(publicDir)

Initialize a new Resizer object with a public directory.

###attach(presetName)O

Attaches a new preset to a resizer. A name is required, because this is used to generate view helpers.

###from(sourceDirectory)

Defines the directory where your source files are located relatively to the public directory.

###to(targetDirectory)

Defines the where the resized images should be stored relatively to the public directory.

__Attention__: this freezes the preset object and should therefore be called as your last action.

###resize(options)

Scales the source image to fit __within__ the specified dimensions. Options can contain `width` and `height`. In most cases one side of the image will be smaller than the specified dimensions.

###resizeAndCrop(options)

Scales and crops the source image to fill the specified dimensions. Options can contain `width`, `height` and `gravity`. The dimensions of the image will be exactly the specified dimensions. Images are cropped from the center if you do not specify a `gravity`.

`gravity` can be center, northwest, north, ....

##Stale caches

Resizer checks the modified date for a file and if the source is newer than
the cached image will be regenerated. Therefore it's essential that the
Resizer middleware is used before any static file server.

##Views Helper

In your views you can generate a path to your presets with automatically generated helper functions that follow the scheme: PresetNamePath and PresetNameImage

    img.thumb(src="#{squareThumbPath("/uploads/test.jpg")}") // /thumbs/test.jpg
    !#{squareThumbImage("/uploads/test.jpg", "Thumb")        // <img src="/thumbs/test.jpg" alt="Thumb">

    img.preview(src="#{PreviewPath("/uploads/test.jpg)}")    // /preview/test.jpg
    !#{previewImage("/uploads/test.jpg", "Preview")          // <img src="/preview/test.jpg" alt="Preview">

##CleanUp Caches

You have two options to clean file caches:

###Clear all files from a Preset

    var Resizer = require("express-resizer");
    var myResizer = new Resizer(__dirname + "/public");

    //attach a preset
    myResizer.attach("squareThumbs")
        .from("/uploads")
        .resizeAndCrop({
            width: 100,
            height: 100,
        })
        .quality(50)
        .to("/thumbs");
    
    //use the middleware
    var app = express();
    app.use(myResizer);

    //clear a preset
    app.resizer.clearSquareThumb(function (err) {});

Now all cached images in the thumbs folder or deleted.

###Delete all image caches for a file

    var Resizer = require("express-resizer");
    var myResizer = new Resizer(__dirname + "/public");

    //attach a preset
    myResizer.attach("squareThumbs")
        .from("/uploads")
        .resizeAndCrop({
            width: 100,
            height: 100,
        })
        .quality(50)
        .to("/thumbs");
    
    //use the middleware
    var app = express();
    app.use(myResizer);

    //clear all file caches for test.png
    app.resizer.clear("/uploads/subfolder/test.png", function (err) {});
