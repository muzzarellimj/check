# Check: Status Report

## Summary

Check is a lightweight to-do list web application built to simplify the creation and management of lists and the items
within them. Standard to-do list applications often hold two major disadvantages: (1) lists cannot be exported and must 
remain within a potentially limited space, and (2) items within these lists are difficult to find when lists become too
long. Check aims to combat these disadvantages by providing the ability to (1) export lists in popular file formats, and
(2) curate items within a list by creating distinct user profiles, tagging items with keywords, and searching through
all items to display only those that match a query. Check is meant to be lightweight client-side and scalable to support
a variety of features as the need arises.

## Rules and Tools

Check was developed in [Node.js](https://nodejs.dev/) with both [Microsoft Visual Studio Code](https://code.visualstudio.com/) 
and [JetBrains WebStorm](https://www.jetbrains.com/webstorm/). A primary repository was published [here](https://github.com/muzzarellimj/check),
and local changes were managed via forking this repository and creating pull requests. Our team chose [Discord](https://discord.com/)
as a communication source and [Asana](https://asana.com/) as the project management application to track milestones and
deadlines. This project was built atop the golden rule of software engineering, keep it simple and stupid, and focused
on that principle as we employed the following rules:

- Divide and conquer - each team member was responsible for an independent, decoupled, single-responsibility module, and
  joint contributions (navigation, report, etc.) were appropriately divided among the team.
- No Silver Bullet (NSB) law - due to preference and capability, no IDE would be effective for the entire group; as 
  such, our team leaned into GitHub and IDE extensions to unify our workflow.
- Vertical slice rule - the base application and each feature were developed over a number of commits, each working to
  solve (and remove, if applicable) issues and better improve function and design.

## Features and Contributions

Our features were chosen with the goal of solving a problem and/or managing the complexity that a standard to-do list 
application may provide. While the features were initially designed and written individually, they were improved and 
debugged in a joint effort, be it by manually committing the changes (with author approval) or assisting with changes
through effective research and communication.

### Checklist Conversion via Michael Muzzarelli

There is a benefit to using our checklist web application, but to access data more freely in a local, non-web-based 
environment, conversion to a separate file format may be necessary. For printing or viewing in a text editor, [Markdown](https://en.wikipedia.org/wiki/Markdown) 
may be best. For input in another application, [XML](https://en.wikipedia.org/wiki/XML) or [YAML](https://en.wikipedia.org/wiki/YAML) 
may be best. All checklist items will be formatted in the chosen file format and be presented with a file that can be
printed, downloaded, or copied into another application.

### Registration via Trung Cao

As users use and interact with our Check app, it is essential for users to have registration and un-registration for
accounts feature as users can create their own tasks, see a list of tasks, modify tasks, and delete tasks as they wish.
Users can also decide to delete their account if they no longer want to use the Check app.

### Searching via Quentin Roa

The search api uses the /search/:query and /search modules to allow for search functionality. :query is where you put
what you want to search, using dashes as spaces. /search/:query takes the :query string, replaces the dashes with
spaces, then queries the mongodb atlas database to return an array of todo list cards. /search/:query then sends the
array to list.ejs to display the results of the query. /search catches a get request and properly formats the request
then redirects it to /search/:query. You can actually use either when using the url, to format for /search it would be
/search?q=query. You would replace query with what you would like to search using plus signs as spaces.

### Tagging via Nghi Tran

Tagging feature is used to provide tag for any item. Tagging helps to describe what the to-do task is about and make it
easy to locate. Tagging feature is chosen instead of category is because user usually finds it easier to assign tags to
their scans instead of looking for it under a specific category. For example, when user want to look for his/her dog
Dusty's vaccination appointment in to-do list, user probably does not know under which category it belongs (dog? Dusty?
vaccination? appointment?), but tags correspond to all the words users can look up to find it: vet, dog, dusty, pet, and
vaccinate.

In this web app, users will be able to identify items more easily by filtering the search with a tag or combination of
tags. In addition, users will be able to add, update, delete tags for any to-do item.

## Conclusion

Check is a simple application that I believe, with the proper time and resources, could become enriched by a variety of 
features including a more robust user interface, support for a mobile environment, and better management of checklist 
items through targeted suggestions within distinct user profiles and the ability to view a set of related items without
searching or viewing by tag.