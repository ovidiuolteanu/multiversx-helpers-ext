// Copyright (c) 2017, 2021 Pieter Wuille
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
var GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

const encodings = {
  BECH32: "bech32",
  BECH32M: "bech32m",
};

function getEncodingConst (enc) {
  if (enc == encodings.BECH32) {
    return 1;
  } else if (enc == encodings.BECH32M) {
    return 0x2bc830a3;
  } else {
    return null;
  }
}

function polymod (values) {
  var chk = 1;
  for (var p = 0; p < values.length; ++p) {
    var top = chk >> 25;
    chk = (chk & 0x1ffffff) << 5 ^ values[p];
    for (var i = 0; i < 5; ++i) {
      if ((top >> i) & 1) {
        chk ^= GENERATOR[i];
      }
    }
  }
  return chk;
}

function hrpExpand (hrp) {
  var ret = [];
  var p;
  for (p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) >> 5);
  }
  ret.push(0);
  for (p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) & 31);
  }
  return ret;
}

function verifyChecksum (hrp, data, enc) {
  return polymod(hrpExpand(hrp).concat(data)) === getEncodingConst(enc);
}

function createChecksum (hrp, data, enc) {
  var values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  var mod = polymod(values) ^ getEncodingConst(enc);
  var ret = [];
  for (var p = 0; p < 6; ++p) {
    ret.push((mod >> 5 * (5 - p)) & 31);
  }
  return ret;
}

export function encode (hrp, data, enc) {
  var combined = data.concat(createChecksum(hrp, data, enc));
  var ret = hrp + '1';
  for (var p = 0; p < combined.length; ++p) {
    ret += CHARSET.charAt(combined[p]);
  }
  return ret;
}

function decode (bechString, enc) {
  var p;
  var has_lower = false;
  var has_upper = false;
  for (p = 0; p < bechString.length; ++p) {
    if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
      return null;
    }
    if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
        has_lower = true;
    }
    if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
        has_upper = true;
    }
  }
  if (has_lower && has_upper) {
    return null;
  }
  bechString = bechString.toLowerCase();
  var pos = bechString.lastIndexOf('1');
  if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
    return null;
  }
  var hrp = bechString.substring(0, pos);
  var data = [];
  for (p = pos + 1; p < bechString.length; ++p) {
    var d = CHARSET.indexOf(bechString.charAt(p));
    if (d === -1) {
      return null;
    }
    data.push(d);
  }
  if (!verifyChecksum(hrp, data, enc)) {
    return null;
  }
  return {hrp: hrp, data: data.slice(0, data.length - 6)};
}


function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function a2hex(str) {
    var result = '';
    for (var i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
}

function h2d(s) {

    function add(x, y) {
        var c = 0, r = [];
        var x = x.split('').map(Number);
        var y = y.split('').map(Number);
        while(x.length || y.length) {
            var s = (x.pop() || 0) + (y.pop() || 0) + c;
            r.unshift(s < 10 ? s : s - 10); 
            c = s < 10 ? 0 : 1;
        }
        if(c) r.unshift(c);
        return r.join('');
    }

    var dec = '0';
    s.split('').forEach(function(chr) {
        var n = parseInt(chr, 16);
        for(var t = 8; t; t >>= 1) {
            dec = add(dec, dec);
            if(n & t) dec = add(dec, '1');
        }
    });
    return dec;
}

function d2h(str){ // .toString(16) only works up to 2^53
    var dec = str.toString().split(''), sum = [], hex = [], i, s
    while(dec.length){
        s = 1 * dec.shift()
        for(i = 0; s || i < sum.length; i++){
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while(sum.length){
        hex.push(sum.pop().toString(16))
    }
    var result = hex.join('')
    
    if (result.length % 2 != 0)
        result = "0" + result
    
        return result
}

function base64ToHex(str) {
    const raw = atob(str);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      const hex = raw.charCodeAt(i).toString(16);
      result += (hex.length === 2 ? hex : '0' + hex);
    }
    return result.toUpperCase();
}

function amountToDenominated(query) {
    var amount = query
    if (query.length > 18) {
        var index = query.length - 18
        amount = query.slice(0, index) + "." + query.slice(index)
    }
    else
    {
        const missing_zeros = 18 - query.length
        for (let i = 0; i < missing_zeros; i++) {
            amount = "0" + amount
        }
        amount = "0." + amount
    }

    return amount
}

function fromHexString(str) {
    if (str.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(str)) {
      return null;
    }
    let buffer = [];
    for (let i = 0; i < str.length / 2; i++) {
      buffer.push(parseInt(str.substr(2 * i, 2), 16));
    }
    return buffer;
}

function hex_to_bech32(query) {
    try {
        const buffer = fromHexString(query);
        if (!buffer) throw new TypeError('Invalid hex encoding of data');

        const encoding = encodings.BECH32;
        console.log(buffer)
        let enc = encode('erd', buffer, encoding);
        return enc;
    } catch (e) {
        console.log('Error: ' + e.message);
        return;
    }
}

function bech32_to_hex(query) {
    let hrp, decoded_data = decode(query, encodings.BECH32)
    console.log(hrp, decoded_data)
    return decoded_data
}

function decode_structure(attributes_hex, decode_struct) {
    function slide_indexes(j, no_bytes) {
        var index_f = j;
        var index_l = j + (no_bytes * 2);
        return [index_f, index_l];
    }

    function fixed_length_primitive(attributes, start_index, primitive_len) {
        var [index_first, index_last] = slide_indexes(start_index, primitive_len);
        var result_hex = attributes.slice(index_first, index_last);
        var result_int = h2d(result_hex);
        return [result_int, result_hex, index_last];
    }

    function u8(attributes, start_index) {
        let [result, _, index] = fixed_length_primitive(attributes, start_index, 1);
        return [result, index];
    }

    function u16(attributes, start_index) {
        let [result, _, index] = fixed_length_primitive(attributes, start_index, 2);
        return [result, index];
    }

    function u32(attributes, start_index) {
        let [result, _, index] = fixed_length_primitive(attributes, start_index, 4);
        return [result, index];
    }

    function u64(attributes, start_index) {
        let [result, _, index] = fixed_length_primitive(attributes, start_index, 8);
        return [result, index];
    }

    function biguint(attributes, start_index) {
        var [payload_size, _, index] = fixed_length_primitive(attributes, start_index, 4);
        var result = 0;
        if (payload_size)
            var [result, _, index] = fixed_length_primitive(attributes, index, payload_size);
        return [result, index];
    }

    function string(attributes, start_index) {
        var [payload_size, _, index] = fixed_length_primitive(attributes, start_index, 4);
        var result_string = "";
        if (payload_size)
            var [_, result, index] = fixed_length_primitive(attributes, index, payload_size);
            result_string = hex2a(result);
        return [result_string, index];
    }

    function bech32(attributes, start_index) {
        let [_, result, index] = fixed_length_primitive(attributes, start_index, 32);
        return [result, index];
    }

    var results_dict = {};
    var sliding_index = 0;
    var implemented_primitives = {'u8': u8,
                              'u16': u16,
                              'u32': u32,
                              'u64': u64,
                              'biguint': biguint,
                              'bech32': bech32,
                              'string': string};

    for (const [key, primitive] of Object.entries(decode_struct)) {
        if (typeof primitive === 'object') {
            var list_decode_fields = primitive;
            var [list_len, sliding_index] = implemented_primitives['u32'](attributes_hex, sliding_index);
            var decoded_list = [];
            for (let i = 0; i < list_len; i++) {
                var decoded_list_fields = {};
                for (const [field_key, field_primitive] of Object.entries(list_decode_fields)) {
                    if (field_primitive in implemented_primitives) {
                        var [decoded_result, sliding_index] = implemented_primitives[field_primitive](attributes_hex, sliding_index);
                        decoded_list_fields[field_key] = decoded_result;
                    }
                }
                decoded_list.push(decoded_list_fields);
            }
            results_dict[key] = decoded_list;
        }
        else if (primitive in implemented_primitives) {
            var [decoded_result, sliding_index] = implemented_primitives[primitive](attributes_hex, sliding_index)
            results_dict[key] = decoded_result
        }
    }

    return results_dict
}

function createRawNotification(data) {
    // chrome.notifications.create(
    //     "attributes-decode",
    //     {
    //         type: "list",
    //         iconUrl: "icon.png",
    //         title: "Decoded attributes",
    //         message: displayMessage,
    //         items: itemsList
    //     },
    //     function () {}
    // );

    chrome.storage.local.set({
        'shownItems': data
        });

        chrome.windows.create({
            url : "modal.html",
            focused : true,
            type : "popup",
            height: 200,
            width: 400
        });
}

function createDecodedNotification(selection, data_structure_format, hex_data = false) {

    let displayMessage = ""
    let decodedDataFlat = ""
    let itemsList = []

    if(!selection.length > 0) {
        displayMessage = "Selection is empty!"
    } else {
        try {
            let hex = base64ToHex(selection);
            if (hex_data === true){
                hex = selection
            }
            let decoded = decode_structure(hex, data_structure_format);
            displayMessage = "Token attributes:"
            
            for (const [key, primitive] of Object.entries(decoded)) {
                if (typeof primitive === 'object') {
                    for (const [_, decoded_structure] of Object.entries(primitive))
                    {
                        for (const [nested_key, nested_primitive] of Object.entries(decoded_structure)) {
                            decodedDataFlat += nested_key.concat(": ", nested_primitive.toString(), " "), function(){};
                            itemsList.push({title: nested_key, message: nested_primitive.toString()});
                        }
                    }
                } else if (typeof primitive != Object) {
                    decodedDataFlat += key.concat(": ", primitive.toString(), " "), function(){};
                    itemsList.push({title: key, message: primitive.toString()});
                }
            }

        }catch(e){
            console.log(e);
            throw new Error("Malformed return data, please verify the results.");
        };
    }

    createRawNotification(decodedDataFlat)
}

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

    if (tab_url.includes("testnet-do-multi"))
    {
        var gateway_url = "https://proxy-do-multi.elrond.ro"
        var api_url = "https://express-api-multi.elrond.ro"
    }

    if (tab_url.includes("testnet-do-shadowfork-four"))
    {
        var gateway_url = "https://proxy-shadowfork-four.elrond.ro"
        var api_url = "https://express-api-shadowfork-four.elrond.ro"
    }

    if (info.menuItemId === "HEX_TO_BECH32")
        createRawNotification(bech32_to_hex(query))
    
    if (info.menuItemId === "BASE64_TO_STRING")
        createRawNotification(atob(query))
    
    if (info.menuItemId === "STRING_TO_BASE64")
        createRawNotification(btoa(query))

    if (info.menuItemId === "BASE64_TO_HEX")
        createRawNotification(base64ToHex(query))

    if (info.menuItemId === "HEX_TO_STRING")
        createRawNotification(hex2a(query))

    if (info.menuItemId === "STRING_TO_HEX")
        createRawNotification(a2hex(query))

    if (info.menuItemId === "HEX_TO_DECIMAL")
        createRawNotification(h2d(query))

    if (info.menuItemId === "DECIMAL_TO_HEX")
        createRawNotification(d2h(query))

    if (info.menuItemId === "AMOUNT_TO_DENOMINATED") {
        var amount = amountToDenominated(query)
        createRawNotification(amount)
    }

    if (info.menuItemId === "GW_TRANSACTIONS")
        chrome.tabs.create({url: gateway_url + "/transaction/" + query + "/?withResults=true"});

    if (info.menuItemId === "API_TRANSACTIONS")
        chrome.tabs.create({url: api_url + "/transactions/" + query});

    if (info.linkUrl) {
        var link = info.linkUrl;
        query = link.substring(link.lastIndexOf("/")+1);
    }

    if (info.menuItemId === "GW_ADDRESS_ESDTS")
        chrome.tabs.create({url: gateway_url + "/address/" + query + "/esdt"});

    if (info.menuItemId === "API_ESDT_DATA")
        chrome.tabs.create({url: api_url + "/tokens/" + query});

    if (info.menuItemId === "API_NFT_DATA")
        chrome.tabs.create({url: api_url + "/nfts/" + query});

    if (info.menuItemId === "ATTRS_FARMV12") {
        var data_structure_format = {
            "reward_per_share": "biguint",
            "original_entering_epoch": "u64",
            "entering_epoch": "u64",
            "apr_multiplier": "u8",
            "with_locked_rewards": "u8",
            "initial_farming_amount": "biguint",
            "compounded_reward": "biguint",
            "current_farm_amount": "biguint",
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_FARMV13") {
        var data_structure_format = {
            "reward_per_share": "biguint",
            "original_entering_epoch": "u64",
            "entering_epoch": "u64",
            "initial_farming_amount": "biguint",
            "compounded_reward": "biguint",
            "current_farm_amount": "biguint",
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_FARMV2") {
        var data_structure_format = {
            "reward_per_share": "biguint",
            "entering_epoch": "u64",
            "compounded_reward": "biguint",
            "current_farm_amount": "biguint",
            "original_owner": "bech32",
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_LKTOKEN") {
        var data_structure_format = {
            "unlock_schedule_list": {
                "unlock_epoch": "u64",
                "unlock_percent": "u64"
            },
            "is_merged": "u8"
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_LKLP") {
        var data_structure_format = {
            "lp_token_id": "string",
            "lp_token_amount": "biguint",
            "locked_assets_invested": "biguint",
            "locked_assets_nonce": "u64"
        }
        createDecodedNotification(query, data_structure_format)
    }
    
    if (info.menuItemId === "ATTRS_LKFARM") {
        var data_structure_format = {
            "farm_token_id": "string",
            "farm_token_nonce": "u64",
            "farm_token_amount": "biguint",
            "proxy_token_id": "string",
            "proxy_token_nonce": "u64",
            "proxy_token_amount": "biguint",
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_ELKLP") {
        var data_structure_format = {
            "lp_token_id": "string",
            "lp_token_amount": "biguint",
            "locked_tokens_id": "string",
            "locked_tokens_nonce": "u64",
            "locked_tokens_amount": "biguint",
        }
        createDecodedNotification(query, data_structure_format)
    }
    
    if (info.menuItemId === "ATTRS_ELKFARM") {
        var data_structure_format = {
            "farm_token_id": "string",
            "farm_token_nonce": "u64",
            "farm_token_amount": "biguint",
            "proxy_token_id": "string",
            "proxy_token_nonce": "u64",
            "proxy_token_amount": "biguint",
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_ELKTOKEN" || info.menuItemId === "ATTRS_SLKTOKEN") {
        var data_structure_format = {
            "original_token_id": "string",
            "original_token_nonce": "u64",
            "unlock_epoch": "u64",
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_SLKLP") {
        var data_structure_format = {
            "lp_token_id": "string",
            "first_token_id": "string",
            "first_token_locked_nonce": "u64",
            "second_token_id": "string",
            "second_token_locked_nonce": "u64",
        }
        createDecodedNotification(query, data_structure_format)
    }
    
    if (info.menuItemId === "ATTRS_SLKFARM") {
        var data_structure_format = {
            "farm_type": "u8",
            "farm_token_id": "string",
            "farm_token_nonce": "u64",
            "farming_token_id": "string",
            "farming_token_locked_nonce": "u64",
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_ENERGYUPDATE") {
        var data_structure_format = {
            "old_enery_amount": "biguint",
            "old_last_update_epoch": "u64",
            "old_total_locked_tokens": "biguint",
            "new_enery_amount": "biguint",
            "new_last_update_epoch": "u64",
            "new_total_locked_tokens": "biguint",
        }
        createDecodedNotification(query, data_structure_format, true)
    }

    if (info.menuItemId === "ATTRS_STAKING") {
        var data_structure_format = {
            "reward_per_share": "biguint",
            "compounded_reward": "biguint",
            "current_farm_amount": "biguint"
        }
        createDecodedNotification(query, data_structure_format)
    }

    if (info.menuItemId === "ATTRS_METASTAKING") {
        var data_structure_format = {
            "lp_farm_token_nonce": "u64",
            "lp_farm_token_amount": "biguint",
            "staking_farm_token_nonce": "u64",
            "staking_farm_token_amount": "biguint"
        }
        createDecodedNotification(query, data_structure_format)
    }
 };

// ----------- PRINCIPAL MENU ITEMS ------------------

var contextConverters = {
    "id": "CONTEXT_CONVERTERS",
    "title": "multiversx converters",
    "contexts": ["selection"],
    "enabled": true
};

var contextData = {
    "id": "CONTEXT_DATA",
    "title": "multiversx data",
    "contexts": ["link", "selection"]
};

var contextAttributes = {
    "id": "CONTEXT_ATTRIBUTES",
    "title": "multiversx attributes",
    "contexts": ["link", "selection"]
};

// ----------- END OF PRINCIPAL MENU ITEMS ----------------

function create_context_item(parent, id, title, contexts) {
    var result_item = {
        "id": id,
        "title": title,
        "contexts": contexts,
        "parentId": parent["id"]
    };
    return result_item;
}

    var separator_ids = 1;
    var contexts_all = [ "all" ];
    var contexts_ls = ["link", "selection"];
    var contexts_l = ["link"];
    var contexts_s = ["selection"];

    chrome.contextMenus.create(contextConverters);
    chrome.contextMenus.create(create_context_item(contextConverters, "HEX_TO_BECH32", "Hex string to Bech32 address", contexts_s));
    chrome.contextMenus.create(create_context_item(contextConverters, "BASE64_TO_STRING", "Base64 string to string", contexts_s));
    chrome.contextMenus.create(create_context_item(contextConverters, "STRING_TO_BASE64", "String to Base64 string", contexts_s));
    chrome.contextMenus.create(create_context_item(contextConverters, "BASE64_TO_HEX", "Base64 string to hex", contexts_s));
    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all, "parentId":contextConverters["id"]});
    chrome.contextMenus.create(create_context_item(contextConverters, "HEX_TO_STRING", "Hex string to string", contexts_s));
    chrome.contextMenus.create(create_context_item(contextConverters, "STRING_TO_HEX", "String to hex string", contexts_s));
    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all, "parentId":contextConverters["id"]});
    chrome.contextMenus.create(create_context_item(contextConverters, "HEX_TO_DECIMAL", "Hex to decimal", contexts_s));
    chrome.contextMenus.create(create_context_item(contextConverters, "DECIMAL_TO_HEX", "Decimal to hex", contexts_s));
    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all, "parentId":contextConverters["id"]});
    chrome.contextMenus.create(create_context_item(contextConverters, "AMOUNT_TO_DENOMINATED", "Amount to denominated amount", contexts_s));

    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all  });

    chrome.contextMenus.create(contextData);
    chrome.contextMenus.create(create_context_item(contextData, "GW_TRANSACTIONS", "Gateway transaction data", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextData, "API_TRANSACTIONS", "API transaction data", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextData, "GW_ADDRESS_ESDTS", "Gateway account ESDT data", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextData, "API_ESDT_DATA", "API ESDT data", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextData, "API_NFT_DATA", "API NFT data", contexts_ls));

    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all  });

    chrome.contextMenus.create(contextAttributes);
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_FARMV12", "FarmV12 Token attributes", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_FARMV13", "FarmV13 Token attributes", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_FARMV2", "FarmV2 Token attributes", contexts_ls));
    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all, "parentId":contextAttributes["id"]});
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_LKTOKEN", "Locked Token attributes", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_LKLP", "Locked LP attributes", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_LKFARM", "Locked Farm attributes", contexts_ls));
    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all, "parentId":contextAttributes["id"]});
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_ELKTOKEN", "Locked EToken attributes", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_ELKLP", "Locked ELP attributes", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_ELKFARM", "Locked EFarm attributes", contexts_ls));
    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all, "parentId":contextAttributes["id"]});
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_SLKTOKEN", "Simple Locked Token attributes", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_SLKLP", "Simple Locked LP attributes", contexts_ls));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_SLKFARM", "Simple Locked Farm attributes", contexts_ls));
    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all, "parentId":contextAttributes["id"]});
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_ENERGYUPDATE", "Energy Updated Event data (hex)", contexts_s));
    chrome.contextMenus.create({id: "s"+(separator_ids++) ,type:"separator", "contexts":contexts_all, "parentId":contextAttributes["id"]});
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_STAKING", "Staking token attributes", contexts_s));
    chrome.contextMenus.create(create_context_item(contextAttributes, "ATTRS_METASTAKING", "Metastaking token attributes", contexts_s));
    // chrome.contextMenus.create(contextEnergyUpdatedEventAttributes);

    chrome.contextMenus.onClicked.addListener(subMenuHandler);