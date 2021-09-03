 // ==UserScript==
// @name         Betra_RSF
// @version      2.0
// @description  Betra RSF
// @author       veethreedev
// @match        https://rsf.is/markadir/limmidaprentun*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      http://code.jquery.com/jquery-latest.js
// @downloadURL  https://raw.githubusercontent.com/veethree/Betra_rsf/master/betra_rsf.js
// ==/UserScript==

// Elements with the following CSS Selectors will be hidden once the page loads.
let elements_to_hide = [
    "#lots-between",
    "#lot-id-between",
    "#rsf-form-row > form > div:nth-child(10)",
    "#rsf-form-row > form > div:nth-child(9)",
    "#rsf-form-row > form > div:nth-child(8)",
    "#rsf-form-row > form > div:nth-child(7)",
    "#rsf-form-row > form > div:nth-child(6)",
    "#rsf-form-row > form > div:nth-child(5)",
    "#rsf-form-row > form > div:nth-child(4)",
    "#rsf-form-row > form > div:nth-child(2)",
    "#submit-container > div:nth-child(6)",
    "#submit-container > div:nth-child(7)",
    "#submit-container > div:nth-child(8)",
    "#submit-container > div:nth-child(9)",
    "#content-row > div.rsf-page-header",
    "#submit-container"
]

// HTML Elements
let search_bar = `
<div id="search" style="display: block">
    <form>
    <input type="text" name="q" id="q" class="form-control" placeholder="Velja kaupand" autocomplete="off">
    </form>
</div>
`


// data-command legend
let data_command_keys = [
    "sl",
    "sell_date",
    "land_date",
    "lot_id",
    "tub_id",
    "buyer_id",
    "buyer_name",
    "ship_name",
    "ship_id",
    "fish_type",
    "fish_size",
    "fish_age",
    "fish_weight",
    "market",
    "tub_index",
    "tub_count",
    "sm",
    "idk",
    "all_tub_id"
]

// This array will be populated with "construct_data_array" once the page is loaded.
let data = {}

// This function parses the data-command attributes and constructs a nice key indexed array
function construct_data_array() {
    let data = []
    $( "tr[id^='tr_']" ).each(function(lot_index, lot_element) {
        data.push({})
        let lot_data = $(this).attr("data-command").split("||")
        data_command_keys.forEach(function(item, index) {
            data[lot_index][item] = lot_data[index]
        })
        data[lot_index]["element"] = lot_element
    })
    return data
}

// Checks/unchecks the specified lot
function check_lot(index, status) {
    $(data[index].element).find("#transaction_id_").prop("checked", status)
}

// Unchecks all lots
function uncheck_all() {
    data.forEach(function(lot, index) {
        check_lot(index, false)
    })
}

// Selects each lot that has a tub id
function select_by_tub_id() {
    data.forEach(function(lot, index) {
        if (lot["tub_id"].length > 0) {
            check_lot(index, true)
        } 
    })
}

// Document load
$(document).ready(function() {
    // Populating data array
    data = construct_data_array()

    // Clearing checkboxes
    uncheck_all()

    // Hiding elements
    elements_to_hide.forEach(function(selector, index) {
        $(selector).hide()
        //$("#search-bar").remove()
    })

    // Modifying elements
    $("#submit-container > button").addClass("btn-lg")

    // Adding custom elements
    $("#main-container").prepend(search_bar)
})

