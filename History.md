
0.6.2 / 2012-10-16 
==================

  * fixed re-watching file

0.6.1 / 2012-10-16 
==================

  * fixed -w if glob in config file

0.6.0 / 2012-10-05 
==================

  * option to show copyright when minifying

0.5.3 / 2012-09-27 
==================

  * add support for file globs

0.5.2 / 2012-08-10 
==================

  * fixed stupid error

0.5.1 / 2012-08-10 
==================

  * join out directory when filename is set

0.5.0 / 2012-08-10 
==================

  * added blank readme
  * removed old examples
  * print out size of file
  * be able to force filename with filename option
  * fixed test so path.existsSync warning wouldn't get called
  * removed nib support
  * throw if minification fails, need to fix in resistance

0.5.0alpha4 / 2012-08-03 
==================

  * read stylus imports when watching files

0.5.0alpha3 / 2012-08-03 
==================

  * fixed issues with cli args and passing in config file
  * remove <feff>

0.5.0alpha2 / 2012-08-01 
==================

  * added watch support
  * able to override config file with arguments passed in
  * refactored preprocessors a little

0.5.0alpha1 / 2012-07-25 
==================

  * froze deps, fixed test
  * cli
  * pass in config file, separated out mash.js and set.js
  * removed console-trace from unit tests
  * removed unused deps
  * able to pass in array of objects, changed return to be an object
  * make test
  * complete rewrite, added tests
  * nib support

0.4.2 / 2012-06-29 
==================

  * fix: check if options doesn't exist in helper

0.4.1 / 2012-05-02 
==================

  * host for compressed file

0.4.0 / 2012-05-02 
==================

  * option to pass in host to express helper

0.3.0 / 2012-04-24 
==================

  * caching on dev middleware
  * refactored paths
  * style('blah', true) to render inline

0.2.3 / 2012-04-21 
==================

  * check if mapping file exists

0.2.2 / 2012-04-20 
==================

  * inheritance example
  * put inherited groups before group's assets

0.2.1 / 2012-04-18 
==================

  * check if mapping key exists

0.2.0 / 2012-04-17 
==================

  * read mapping file (if exists) to speed up server startup time

0.1.14 / 2012-04-11 
==================

  * fix for cache buster and content-type setting

0.1.13 / 2012-04-11 
==================

  * allow ?cache=busters on middleware

0.1.12 / 2012-04-04 
==================

  * allow groups to have specific plugins

0.1.11 / 2012-03-29 
==================

  * fixed less parser, added middleware support for less

0.1.10 / 2012-03-29 
==================

  * output size of mashed file
  * added compress plugin do handle both css and js
  * renamed uglify plugins to compress, don't load them by default
  * less plugin

0.1.9 / 2012-03-28
==================

  * check if files exist 

0.1.8 / 2012-03-27
==================

  * if build is called, set debug to false 

0.1.7 / 2012-03-26
==================

  * use cjson to allow comments in json file, throw error in stylus plugin 

0.1.6 / 2012-03-26
==================

  * added ability to include other groups 
