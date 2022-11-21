function subMenuHandler(info, tab){
    var query = info.selectionText;
    var tab_url = tab.url

    var used_url_prefix = ""

    if (tab_url.includes("testnet"))
        used_url_prefix = "testnet-"
    else if (tab_url.includes("devnet"))
        used_url_prefix = "devnet-"

    var gateway_url = "https://" + used_url_prefix + "gateway.elrond.com"
    var api_url = "https://" + used_url_prefix + "api.elrond.com"

    if (info.menuItemId === "BASE64_TO_STRING")
        //chrome.tabs.create({url: "http://www.elrond.com/define.php?term=" + query});
        alert(query);

    if (info.menuItemId === "BASE64_TO_HEX")
        alert(query);

    if (info.menuItemId === "HEX_TO_STRING")
        alert(query);

    if (info.menuItemId === "HEX_TO_DECIMAL")
        alert(query);

    if (info.menuItemId === "DENOMINATED_TO_AMOUNT")
        alert(query);

    if (info.menuItemId === "GW_TRANSACTIONS")
        chrome.tabs.create({url: gateway_url + "/transaction/" + query + "/?withResults=true"});

    if (info.menuItemId === "API_TRANSACTIONS")
        chrome.tabs.create({url: api_url + "/transactions/" + query});

    if (info.linkUrl){
        var link = info.linkUrl;
        query = link.substring(link.lastIndexOf("/")+1);
    }

    if (info.menuItemId === "GW_ADDRESS_ESDTS")
        chrome.tabs.create({url: gateway_url + "/address/" + query + "/esdt"});

    if (info.menuItemId === "API_ESDT_DATA")
        chrome.tabs.create({url: api_url + "/tokens/" + query});

    if (info.menuItemId === "API_NFT_DATA")
        chrome.tabs.create({url: api_url + "/nfts/" + query});
 };

var contextConverters = {
    "id": "CONTEXT_CONVERTERS",
    "title": "multiversx converters",
    "contexts": ["selection"],
    "enabled": false
};

var contextBase64ToString = {
    "id": "BASE64_TO_STRING",
    "title": "Base64 string to string",
    "contexts": ["selection"],
    "parentId": "CONTEXT_CONVERTERS"
}

var contextBase64ToHex = {
    "id": "BASE64_TO_HEX",
    "title": "Base64 string to hex",
    "contexts": ["selection"],
    "parentId": "CONTEXT_CONVERTERS"
}

var ContextHexToString = {
    "id": "HEX_TO_STRING",
    "title": "Hex string to string",
    "contexts": ["selection"],
    "parentId": "CONTEXT_CONVERTERS"
}

var contextHexToDec = {
    "id": "HEX_TO_DECIMAL",
    "title": "Hex to decimal",
    "contexts": ["selection"],
    "parentId": "CONTEXT_CONVERTERS"
}

var contextDenominatedToAmount = {
    "id": "DENOMINATED_TO_AMOUNT",
    "title": "Denominated amount to amount",
    "contexts": ["selection"],
    "parentId": "CONTEXT_CONVERTERS"
}

var contextData = {
    "id": "CONTEXT_DATA",
    "title": "multiversx data",
    "contexts": ["link", "selection"]
};

var contextGwTransactions = {
    "id": "GW_TRANSACTIONS",
    "title": "Gateway transaction data",
    "contexts": ["selection"],
    "parentId": "CONTEXT_DATA"
};

var contextApiTransactions = {
    "id": "API_TRANSACTIONS",
    "title": "API transaction data",
    "contexts": ["selection"],
    "parentId": "CONTEXT_DATA"
};

var contextGwAddressEsdts = {
    "id": "GW_ADDRESS_ESDTS",
    "title": "Gateway account ESDT data",
    "contexts": ["link", "selection"],
    "parentId": "CONTEXT_DATA"
};

var contextApiEsdtData = {
    "id": "API_ESDT_DATA",
    "title": "API ESDT data",
    "contexts": ["link", "selection"],
    "parentId": "CONTEXT_DATA"
};

var contextApiNftData = {
    "id": "API_NFT_DATA",
    "title": "API NFT data",
    "contexts": ["link", "selection"],
    "parentId": "CONTEXT_DATA"
};


    chrome.contextMenus.create(contextConverters);
    chrome.contextMenus.create(contextBase64ToString);
    chrome.contextMenus.create(contextBase64ToHex);
    chrome.contextMenus.create(ContextHexToString);
    chrome.contextMenus.create(contextHexToDec);
    chrome.contextMenus.create(contextDenominatedToAmount);

    chrome.contextMenus.create(contextData);
    chrome.contextMenus.create(contextGwTransactions);
    chrome.contextMenus.create(contextApiTransactions);
    chrome.contextMenus.create(contextGwAddressEsdts);
    chrome.contextMenus.create(contextApiEsdtData);
    chrome.contextMenus.create(contextApiNftData);

    chrome.contextMenus.onClicked.addListener(subMenuHandler);