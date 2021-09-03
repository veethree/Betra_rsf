 // ==UserScript==
// @name         Betra_RSF
// @version      2.0
// @description  Betra RSF (EXPERIMENTAL)
// @author       veethreedev
// @match        https://rsf.is/markadir/limmidaprentun*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      http://code.jquery.com/jquery-latest.js
// @downloadURL  https://raw.githubusercontent.com/veethree/Betra_rsf/master/betra_rsf.js
// ==/UserScript==

// Elements with the following Selectors will be hidden once the page loads.
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
    "#content-row > div.rsf-page-header"
]

// Table columns that will be hidden
let table_columns_to_hide = [7, 9, 10, 11]

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

// Key bindings
let key = {
    select_by_tub_id: "k",
    select_by_age: "o",
    refresh_page: "r",
    print_label: "m",
    select_all: "a",
    select_none: "z"
}

// A list of currently selected lots
let selected_lots = []

// These classes will be applied to selected table rows.
let selected_class = ["alert-info"]

// Custom HTML Elements
//let search_bar = "<input class='pull-left' type=text id='search_bar' autocomplete='off' placeholder='Velja kaupanda' style='width: 20%; margin-bottom: 12px'}>"
let search_bar = `
<div class="form-group col-sm-4 col-md-3" style="display: block;">
  <label for="search_bar">Leita</label>

  <input type="text" id="search_bar" placeholder="Leita" class="form-control autocomplete='off'"></input>
</div>
`

let show_hidden_elements = "<a id='unhide_elements' class='btn btn-outline-primary float-left' style='font-size: 14px'}>Sýna allt</a>"
let alert_bar = "<div id='betra_alert' class='alert alert-success'></div>"

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

// ALERT
function alert(text, _class="alert-success") {
    $("#betra_alert").show().addClass(_class).text(text)
}

function clear_alert() {
    $("#betra_alert").hide()
}

function clear_selected_lots() {
    selected_lots = []
}

function add_selected_lot(index) {
    
}

// Checks/unchecks the specified lot
function check_lot(index, status) {
    $(data[index].element).find("#transaction_id_").prop("checked", status)
    if (status) {
        // Adding selected class
        selected_class.forEach(function(item) {
            $(data[index].element).addClass(item);
        })

        // Counting
        if (!selected_lots.includes(data[index])) {
            selected_lots.push(data[index])
        }
    } else {
        selected_class.forEach(function(item) {
            $(data[index].element).removeClass(item);
        })
        // Counting
        if (selected_lots.includes(data[index])) {
            delete selected_lots[selected_lots.indexOf(data[index])]
        }
    }
}

// Unchecks all lots
function uncheck_all() {
    data.forEach(function(lot, index) {
        check_lot(index, false)
    })
    clear_selected_lots()
    clear_alert()
}

// Selects each lot that has a tub id
function select_by_tub_id() {
    uncheck_all()
    data.forEach(function(lot, index) {
        if (lot["tub_id"].length > 0) {
            check_lot(index, true)
        } 
    })
    alert("Valdi " + selected_lots.length + " stæður með karanúmerum.")
}

// Selects lots that are not new
function select_by_age() {
    uncheck_all()
    data.forEach(function(lot, index) {
        if (lot["fish_age"] != "Nýr") {
            check_lot(index, true)
        } 
    })
    alert("Valdi " + selected_lots.length + " stæður sem eru 1-dags eða eldri.")
}

// Selects lots for a certain buyer
function select_by_buyer(buyer_id) {
    uncheck_all()
    data.forEach(function(lot, index) {
        if (lot["buyer_id"] == buyer_id) {
            check_lot(index, true)
        } 
    })
    let out = "Kaupandi " + buyer_id + " kaupir efitfarandi stæður:"
    selected_lots.forEach(function(lot, index) {
        out = out + "\n" + lot["fish_type"] + " af " + lot["ship_name"] + ", "
    })
    alert(out)
}

// Hides unwanted page elements
function hide_unwanted_elements() {
    elements_to_hide.forEach(function(selector, index) {
        $(selector).hide()
    })
}

// Hides unwanted page elements
function show_unwanted_elements() {
    elements_to_hide.forEach(function(selector, index) {
        $(selector).show()
    })
}

// Hides the unwanted table columns
function hide_table_columns() {
    //Modifying header
    $("#label_print_lots > thead > tr").children("th").each(function(index, element) {
        if (table_columns_to_hide.includes(index)) {
            $(element).hide()
        }
    })

    //Hiding columns
    data.forEach(function(lot, index) {
        $(lot.element).children("td").each(function(index, element) {
            $(this).attr("style", "user-select: none")
            if (table_columns_to_hide.includes(index)) {
                $(element).remove()
            }
        })
    })
}

// Document load
$(document).ready(function() {
    // Populating data array
    data = construct_data_array()
    console.log(data)
    // Page setup
    hide_table_columns()
    uncheck_all()
    hide_unwanted_elements()
    
    // Modifying existing elements
    $("#submit-container > button").addClass("btn-lg btn-block") // Submit button
    // Table
    $("#label_print_lots").removeClass("table-auto-width, table-striped") 
    $("#label_print_lots").addClass("table-bordered table-sm")
    $("#label_print_lots").attr("style", "width: auto; margin: 0 auto")

    // Adding custom elements
    $(search_bar).insertAfter("#lot-id-between")
    $("#content-row").prepend(show_hidden_elements)
    $("#content-row").prepend(alert_bar)
    $("#betra_alert").hide()
    
    // Custom click events
    // Unhide link
    $("#unhide_elements").click(function() {
    	show_unwanted_elements();
    	$("#unhide_elements").hide();
    })

    // Alert
    $("#betra_alert").click(function() {
    	$("#betra_alert").hide();
    })

    // Makes the whole row clickable
    $("tbody > tr").click(function() {
        let element = $(this)
        var checkBox = $(this).find(".lot_checkbox");
        if (checkBox.prop("checked") == true) {
            $(this).find(":input").prop("checked", false);
            selected_class.forEach(function(item) {
                $(element).removeClass(item);
            })
        } else {
            $(this).find(":input").prop("checked", true);
            selected_class.forEach(function(item) {
                $(element).addClass(item);
            })
        }
    })

    // Custom key press events
    $("#search_bar").keypress(function(event) {
        //var select_printed = $("#select_printed").prop("checked");
        if (event.key == "Enter") {
            event.preventDefault()
            select_by_buyer($(this).val())
            $(this).val("").blur()
        }
    })
})

// Key events
$(document).keydown(function(event) {
    if (document.activeElement.nodeName == "BODY") {
        if (event.key == key.refresh_page) {
            $("#submit-container > button").click()
		} else if (event.key == key.select_by_tub_id) {
            select_by_tub_id()
        } else if (event.key == key.select_by_age) {
            select_by_age()
        } else if (event.key == key.print_label) {
            $("#print_lots").click()
            alert("Prenta " + selected_lots.length + " stæður.")
        } else if (event.key == key.select_all) {
            data.forEach(function(lot, index) {
                check_lot(index, true)
            })
        } else if (event.key == key.select_none) {
            uncheck_all()
        }
    }
})