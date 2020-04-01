# Chrome Extension for WordPress

## Purpose
This Chrome extension allows administrators to easily list plugin updates in a quick compact way to help with reporting and maintenance. 

## How does it work?
This Chrome extension uses a few simple `querySelectorAll()` calls to parse the plugin listing page (wp-admin/plugins.php | wp-admin/network/plugins.php) and then takes that list and shows in a smaller list near the extension icon.

## Features Coming soon
* Count of how many plugins need updating
* Ability to copy a formatted list of plugins that need updating
* Ability to copy a `wppackagist/plugin-name` list to easily update the composer.json
* Ability to copy a .csv for importing into a spreadsheet etc

## FAQ

*Q:* How does this extension interact with my WordPress install
*A:* This plugin limits visibility to (`wp-admin/plugins.php` | `wp-admin/network/plugins.php`). It does not technically interact with the install in any way other than reading the contents of the DOM for that current page. And is limited to strictly the plugin list table itself.

*Q:* How do I know this extension isn't doing something malicous
*A:* All the code is within this repo, take a look. The extension is very simple in how it works. But witht hat being said, use at your own risk.
