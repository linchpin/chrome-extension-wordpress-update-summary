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

    let $body = document.querySelector('body');

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

    // Only run this on the update-core.php
    if ( $body.classList.contains('update-core-php') ) {
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

            let requestUrl = 'https://api.wordpress.org/plugins/info/1.0/' + row.slug + '.json';

            var xhr = new XMLHttpRequest();
            xhr.open("GET", requestUrl, true);
            xhr.onload = function (e) {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                  pluginData.skipComposer = false;
                } else {
                  pluginData.skipComposer = true;
                }
              }
            };
            xhr.onerror = function (e) {
              console.error(xhr.statusText);
            };
            xhr.send(null);

            console.log(pluginData);

            updates.push(pluginData);
        });
    }

    return sendResponse(updates);
}
