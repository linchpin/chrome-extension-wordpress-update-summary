// listen for getWordPressUpdates request, call getWordPressUpdates which includes callback to sendResponse
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if ( request.action === "getWordPressUpdates" ) {
            getWordPressUpdates(request, sender, sendResponse);
            return true; // this is required to use sendResponse asynchronously
        }
    }
);

// Get all references to WordPress plugins that need updating, give the current versionInfo
// and what version it can be updated to
const getWordPressUpdates = (request, sender, sendResponse) => {

    // plugin pages
    let updates = [];
    let updateElements = document.querySelectorAll('tr.update');

    [...updateElements].forEach((updateElement) => {

        let versionInfo = updateElement.querySelector('.plugin-version-author-uri').textContent;
        let updateInfo = updateElement.nextSibling.querySelector('a').textContent;

        let pluginData = {
            plugin: updateElement.querySelector('.plugin-title strong').textContent,
            slug: updateElement.getAttribute('data-slug'),
            currentVersion: versionInfo.replace(/[^0-9\.]+/g, '').replace(/\.$/, ''),
            nextVersion: updateInfo.replace(/[^0-9\.]+/g, '').replace(/\.$/, ''),
        };

        updates.push(pluginData);
    });


    let updatablePlugins = document.querySelectorAll('td.plugin-title');

    [...updatablePlugins].forEach((updateElement) => {


        let pluginText = updateElement.getElementsByTagName('p')[0].textContent;
        let pluginUpdatesAvailable = pluginText.match(/([0-9\.]{3,5})/gm);

        if (pluginUpdatesAvailable.length === 0) { // no version so bail
            return;
        }

        let updateUrl   = updateElement.querySelector('.open-plugin-details-modal');

        if ( updateUrl ) {
            updateUrl = updateUrl.getAttribute( 'href'); // Themes don't have a link..
        }

        let urlParams   = new URLSearchParams( updateUrl );

        let pluginData = {
            plugin: updateElement.querySelector('strong').textContent,
            slug: urlParams.get('plugin'),
            currentVersion: pluginUpdatesAvailable[0].replace(/\.$/, ''),
            nextVersion: pluginUpdatesAvailable[1].replace(/\.$/, ''),
        };

        updates.push(pluginData);
    });

    console.log( updates );

    // You have version 4.1.3 installed. Update to 4.1.6.
    // Update WordPress Page

    return sendResponse(updates);
}
