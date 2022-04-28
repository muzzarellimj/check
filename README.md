# Check

Check is a simple to-do list application meant to serve as the final project of ASE 285, Software Engineering and 
Security Fundamentals. 

## Documentation

### Checklist Conversion and Downloading

There is a benefit to using our checklist web application, but to access data more freely in a local, non-web-based
environment, conversion to a separate file format may be necessary. For printing or viewing in a text editor,
[Markdown](https://en.wikipedia.org/wiki/Markdown) may be best. For input in another application, [XML](https://en.wikipedia.org/wiki/XML)
or [YAML](https://en.wikipedia.org/wiki/YAML) may be best. In order to convert a checklist to another format, at least
one item must exist within it, and the conversion process can be accessed via the 'Convert' dropdown navigation link.

#### Markdown Conversion at `/convert/markdown`

All existing checklist items are retrieved from our database and converted to Markdown with [json2md](https://github.com/IonicaBizau/json2md).

#### XML Conversion at `/convert/xml`

All existing checklist items are retrieved from our database and converted to XML with [jstoxml](https://github.com/davidcalhoun/jstoxml).

#### YAML Conversion at `/convert/yaml`

All existing checklist items are retrieved from our database and converted to YAML with [json-to-pretty-yaml](https://github.com/alexcrist/json-to-pretty-yaml).