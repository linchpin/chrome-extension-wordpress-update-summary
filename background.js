// Copyright (c) 2020 Linchpin, LLC. All rights reserved.
chrome.runtime.onInstalled.addListener(function () {

    // On change clear all rules
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                // Define our viewable actions
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {urlContains: 'wp-admin/plugins.php'},
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {urlContains: 'wp-admin/network/plugins.php'},
                    }),
                ],
                // Show the extension's page action.
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});

chrome.tabs.onActivated.addListener((info) => {
    chrome.tabs.get(info.tabId, (change) => {
        if (typeof (change) !== 'undefined' && !change.url) {
            chrome.browserAction.setIcon({path: './images/report16.png', tabId: info.tabId});
        } else if (typeof (change) !== 'undefined' && change.url.match(/wp-admin(\/network)?\/plugins\.php/) == null) {
            chrome.browserAction.setIcon({path: './images/report16.png', tabId: info.tabId});
        } else {
            chrome.browserAction.setIcon({path: './images/report_active16.png', tabId: info.tabId});
        }
    });
});

chrome.tabs.onUpdated.addListener(( tabId, change, tab ) => {
    if (typeof (tab) === 'undefined' || !tab.url) {
        return;
    } else if (tab.url.match(/wp-admin(\/network)?\/plugins\.php/) == null) {
        chrome.browserAction.setIcon({path: './images/report16.png', tabId: tabId});
    } else {
        chrome.browserAction.setIcon({path: './images/report_active16.png', tabId: tabId});
    }
});
