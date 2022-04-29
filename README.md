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

### User Registration

#### Registration API at `/api/register`

This API is used to accept a user POST request to create a new user account. When a user sends a POST request to
`/register` with request’s body, it will check if email entered by user exists in the database, if yes, it returns a
response with a BadRequest status code and a message to ask user to choose another email. If it does not exist in the
database, user’s password will be hashed for security and user’s account will be saved to the database. If succeeds, it
returns a response (in JSON format) with a Created status code, a message to let the user know that their account is
already created successfully, and user newly created account. If not, it will return a response with an Internal Server
Error status code and a message to let user know that something goes wrong.

#### Registration at `/register`

This is similar to `/api/register`, except the server responses by rendering ejs and display information/ error.

#### Un-registration API at `/api/unregister/:id`

This API is used to accept a user DELETE request to delete a user account. When a user sends a DELETE request to
`/unregister/:id`, it will first check if the id is valid by retrieving user with that id from database. If not found,
it returns a BadRequest status code and a message to let user know that user with that id cannot be found in the
database. If found, delete user’s account with that id, if succeeds, returns a response (in JSON format) with a No
Content status code with a message to let user know that their account is already delete successfully; if fails, it
will return a response with an Internal Server Error status code and a message to let user know that something goes
wrong.

#### Un-registration at `/unregister/:id`

This is similar to `/api/unregister/:id`, except the server responses by rendering ejs and display information/ error.

### Item Searching

#### Search at `/search/:query`

The search API can be used via the search bar or by `/search/:query`, replacing `:query` with your query string. If the
query string is contains spaces when using /search/:query replace the spaces with dashes. This search API does not do
keyword search functions it will search for the whole string entered. If nothing matches your query, it will show the
nav bar with nothing else. You can delete from this list, and it will affect the entire list. the search API uses
`list.ejs` to display the list of results.

The search bar sends a GET to `/search` holding string q. The `/search` module formats q properly and then redirects to
`/search/:query`, where `:query` is replaced with the properly formatted q.

### Tagging

This feature is used to provide tag for any item. Tagging helps to describe what the to-do task is about and make it easy to locate.

#### Add tag at `/add`

This API is used to make a POST request to add new item with tags. When user clicks submit, item with the tags will be saved.

#### Update tag at `/edit/:id`

This API make a GET request to the edit page of item (:id param is the id of item). User can update item's tag(s) on this page, then click submit to update the tag(s).

#### Access to list of all existing tags at `/tags`

This API make a GET request to get a list of all of the existing tags that come with all items. User can do a tag deletion or items searching on this page.

#### Delete tag at `/tags/delete`

This API make a DELETE request to a tag, then all those items having this tag will not have this tag anymore (delete tag for all items).

#### Search for items with specific tags at `/list/:tags`

This API make a GET requeset to a list of all items with specific tags. This feature will help users to identify items more easily by just filtering item search with a list of tag keywords.
