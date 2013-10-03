# Walled worlds
An interactive guide to walls of the world.

## Image Processing
Images come from LandSat. Band 4 is red, band 3 is green and band 2 is blue. Band 8 is panchromatic.

1. otbcli_BundleToPerfectSensor -ram 4096 -inp LC81740382013249LGN00_B8.TIF -inxs 3.tif -out pan-3.tif uint16
2. Combine the bands into one image. convert -combine pan-{4,3,2}.tif final-rgb.tif
3. gdalwarp to reproject into a EPSG 3785 map projection
4. convert -channel B -gamma 0.985 -channel R -gamma 1.01 -channel RGB -sigmoidal-contrast 25x20% RGB.tiff RGB-corrected.tiff

## Map data areas
West Bank improved imagery: LC81740382013249LGN00 06 Sep 2013
Western Sahara: LC82020412013253LGN00 10 Sep 2013

Tarball of these images are on the shared drive at:
afp://afs3.dmz.gnl/Editorial (afs3)/GNM Interactive Team/Users Interactive Team/Daan Louter/Daan Louter, Public/walled-worlds

## Image processing steps
- Build VRT
- Pansharpen the image
- Translate the image
- Projection warping

## Client side 
- jQuery
- Backbone

## Required developer tools
- ImageMagick
- GDAL
- Orfeo Toolbox
- Earth Explorer