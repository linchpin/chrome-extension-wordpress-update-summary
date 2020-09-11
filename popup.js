function getCurrentTabUrl(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {

        let activeTab = tabs[0];

        if ( typeof (activeTab) === 'undefined' || ! activeTab.url ) {
            document.getElementById("report-handler").classList.add('hide');
            document.getElementById("report-loader").classList.add('hide');
            document.getElementById("report-warning").classList.remove('hide');
        } else if (activeTab.url.match(/wp-admin(\/network)?\/(plugins|update-core)\.php/) == null) {
            document.getElementById("report-handler").classList.add('hide');
            document.getElementById("report-loader").classList.add('hide');
            document.getElementById("report-warning").classList.remove('hide');
        }

        getResults(activeTab);
    });
}

/**
 * Listen for the content of the DOM to be DOMContentLoaded
 * once complete, get the contents of the admin page
 */
document.addEventListener("DOMContentLoaded", function (event) {
    getCurrentTabUrl();
});

let currentURL;
let data = {}

/**
 * Send a query to our content.js to get our list of WordPress update
 * to a showResults callback that is used to populate popup.html
 */
const getResults = () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getWordPressUpdates"}, (response) => {
            storeResults(response);
            showResults(response);

            chrome.browserAction.setBadgeText({text: (response.length).toString(), tabId: tabs[0].id});
        });
    });
}

const storeResults = ( response ) => {
    if ( response ) {
        data = response;
    }
}

/**
 * Send the results/response to the popup.html
 */
const showResults = ( response ) => {
    if ( response ) {

        let jsonTable = json2table(response);

        let resultsElement = document.getElementById("results");
            resultsElement.innerHTML = jsonTable; // @todo should this be sanitized in any way?

        let menu           = document.createElement("control-menu");
            menu.id        = "control-menu";
            menu.className = "control-menu";
            resultsElement.append( menu );

        document.getElementById("report-handler").classList.remove('hide');
        document.getElementById("report-warning").classList.add('hide');
        document.getElementById("report-loader").classList.add('hide');

        buildControls();
    }
}

/**
 * Add a button to our controls
 *
 * @param label
 * @param id
 * @param className
 * @param callback
 */
const addMenuButton = (label, id, className, callback ) => {
    let button       = document.createElement("button");
    let buttonlabel  = document.createTextNode(label);
    button.className = className;
    button.id        = id;
    button.appendChild( buttonlabel );

    let controlMenu = document.getElementById('control-menu' );

    controlMenu.appendChild( button );

    document.getElementById( id ).addEventListener("click", callback );
}

/**
 * Build our clipboard menu
 *
 * @return {HTMLElement}
 */
const buildControls = () => {
    addMenuButton( 'Copy HTML Report', 'copy-html', 'button copy-html', copyHTMLReport );
    addMenuButton( 'Copy Changelog Report', 'copy-report', 'button copy-report', copyChangelogReport );
    addMenuButton( 'Copy Composer/Packagist', 'copy-cli', 'button copy-cli', copyComposerPackages );
}

/**
 * Capitalize the first letter of a string. (We can probably do this with css)
 *
 * @param string
 * @return {string}
 */
const capitalizeFirstLetter = ( string ) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Format our results into a table
 *
 * @param  json
 * @param  classes
 * @return {string}
 */
const json2table = ( json, classes ) => {

    if ( ! json[0] ) {
        return 'Invalid Json';
    }

    let cols      = Object.keys( json[0] );
    let headerRow = '';
    let bodyRows  = '';

    classes = classes || '';

    cols.map( (col) => {
        headerRow += '<th>' + capitalizeFirstLetter( col ) + '</th>';
    });
    json.map( ( row ) => {
        bodyRows += '<tr>';

        cols.map( ( colName) => {
            bodyRows += '<td>' + row[ colName ] + '</td>';
        } );

        bodyRows += '</tr>';
    } );

    return '<table class="' +
        classes +
        '"><thead><tr>' +
        headerRow +
        '</tr></thead><tbody>' +
        bodyRows +
        '</tbody></table>';
}

/**
 * Copy a .csv formatted report to the users clipboard
 */
const copyCSV = () => {
    console.log('copy csv');
}

/**
 * Copy a html formatted table of the report to the users clipboard
 */
const copyHTMLReport = () => {
    copyToClipboard( json2table( data ) );
}

/**
 * Copy a json formatted report for the changelog
 */
const copyChangelogReport = () => {

    let bodyRows = '';

    data.map( ( row ) => {

        if ( ! row.plugin ) {
            return
        }

        bodyRows += '* Updated "' + row.plugin + '" from version ' + row.currentVersion + ' to ' + row.nextVersion + "\n";
    } );

    copyToClipboard( bodyRows );
}

/**
 * Copy a json formatted report to the users clipboard
 */
const copyComposerPackages = () => {

    let bodyRows = '';

    data.map( ( row ) => {
        if ( ! row.skipComposer ) {
            bodyRows += '"wpackagist-plugin/' + row.slug + '": "' + row.nextVersion + '",' + "\n";
        }
    } );

    copyToClipboard( bodyRows );
}

/**
 * Pass a string to copy to clipboard. Utilized by all copy buttons.
 *
 * @param str
 */
const copyToClipboard = str => {
    const clipBoardTextArea = document.createElement( 'textarea' );
    clipBoardTextArea.value = str;
    document.body.appendChild( clipBoardTextArea );
    clipBoardTextArea.select();
    document.execCommand('copy');
    document.body.removeChild( clipBoardTextArea );
};
