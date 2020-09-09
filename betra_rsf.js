// ==UserScript==
// @name         Betra_RSF_lite
// @namespace    http://veethreedev.pythonanywhere.com/
// @version      0.5
// @description  Betra RSF.LITE
// @author       veethreedev
// @match        https://rsf.is/markadir/limmidaprentun*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      http://code.jquery.com/jquery-latest.js
// @downloadURL  http://veethreedev.pythonanywhere.com/betra_rsf
// ==/UserScript==

// GLOBALS
var BATAR = []
var SELECTED = 0
var CURRENT_LIST = []
var CURRENT_SELECTED = 0
var hide_printed = false
var titleColor = "rgb(46, 123, 179)";
var atnColor = "rgb(217, 233, 255)";

var KAUPANDA_NR = 5;
var KAUPANDA_NAFN = 6;
var BATUR_NAFN = 7;
var BATUR_NR = 8
var TEGUNG = 9;
var STÆRÐ = 10;
var ALDUR = 11;

// KEYS
var NEXT_ITEM = "ArrowDown"
var PREV_ITEM = "ArrowUp" 

// Search term for selecting any not new lots
var OLD_SEARCH_TERM = "1-dags,0-1 dags,1-2 daga,1-3 daga,1-4 daga,1-5 daga,1-6 daga,1-7 daga,1-8 daga,1-9 daga,2 daga"

// Creats BRSF's UI
function createUI() {
    $("<div id='BRSF' class='container'></div>").insertAfter(".clearfix");
    $("#BRSF").append("<h4 style='text-align: center; color: " + titleColor + ";'>-    Betra RSF    -</h4>");

    $("#BRSF").append("<a id='select_tub_id' class='btn btn-info' style='font-size: 14px'}>Velja stæður með karanúmerum</a>   ");
    $("#BRSF").append("<a id='select_age' class='btn btn-default' style='font-size: 14px'}>Velja 1-dags stæður</a>");

    $("#BRSF").append("<input class='pull-right' type=text id='search_bar' autocomplete='off' placeholder='Leita' style='font-size: 18px; width: 30%'}>");

    $("#BRSF").append("<hr><div class='form-group submit-checkbox'><div><input type='checkbox' id='select_printed'>");
    $("#BRSF").append("<label for='select_printed' class='checkbox-inline'>Veja prentaðar stæður?</label></div></div>");

    $("#BRSF").append("<div class='form-group submit-checkbox'><div><input type='checkbox' id='hide_printed'>");
    $("#BRSF").append("<label for='hide_printed' class='checkbox-inline'>Fela prentaðar stæður?</label></div></div>");

    $("#BRSF").append("<div class='form-group submit-checkbox'><div><input type='checkbox' id='show_names'>");
    $("#BRSF").append("<label for='show_names' class='checkbox-inline'>Sýna nöfn á bátum?</label></div></div>");

    $("#rsf-form-row").append("<br><p id='notification' style='font-size: 16px; color: " + titleColor + "; text-align: center'}></p>");
}

// Sets the notification text
function sprint(msg) {
    $("#notification").text(msg);
    //$("#notification").fadeIn("fast");
    //clearTimeout();
    //setTimeout(clearSprint, 5000);
}

// Clears the notification text
function clearSprint() {
    $("#notification").text("");
    //$("#notification").fadeOut("fast");
}

// Unchecks all lots
function uncheckAll() {
    $("#check_lots").prop("checked", false);
    $(".lot_checkbox").each(function(i, e) {
        e.checked = false;
    });
    SELECTED = 0;
}

// Counts currently checked lots
function countChecked() {
    //$("#check_lots").prop("checked", false);
    var count = 0;
    $(".lot_checkbox").each(function(i, e) {
        if (e.checked) {
            count ++;
        }
    });
    SELECTED = count;
}

// Hides printed lots
function hidePrinted() {
    $(".printed").hide();
}

// Shows printed lots
function showPrinted() {
    $(".printed").show();
}

// Unchecks all printed lots
function uncheckPrinted() {
    var count = SELECTED;
    $("#check_lots").prop("checked", false);
    $("tr[data-command]").each(function(index, element) {
        if ($(this).hasClass("printed")) {
            $(this).find(".lot_checkbox").prop("checked", false);
            count = count - 1;
        }
    });
    countChecked();
}

// Replaces ship ID's with names
function replaceID() {
    BATAR.forEach(function(element, index) {
        $("td").each(function() {
            if ( $(this).text() == index ) {
                $(this).text(element + " (" + index + ")");
            }
        })
    })
}

// Replaces ship names with ID's
function replaceNames() {
    BATAR.forEach(function(element, index) {
        $("td").each(function() {
            if ( $(this).text() == element + " (" + index + ")" ) {
                $(this).text(index);
            }
        })
    })
}

// Gets all the data from the table and puts it into an array
// Used for the search  function
function getTableData() {
    var res = [[],[]];
    $("tr[data-command]").each(function(index, element) {
        var data = $(this).attr("data-command");
        var split_data = data.split("||");
        res[1].push($(this));
        res[0].push(split_data);
        BATAR[split_data[BATUR_NR]] = split_data[BATUR_NAFN]
    });
    return res
}

// Selects all lots with tub id's
function selectByTubId() {
    var count = 0;
    clearStyle();
    CURRENT_LIST = []
    $(".glyphicon.glyphicon-info-sign").each(function(index) {
        var parent = $(this).parent().parent();
        parent.find(":input").prop("checked", true);
        parent.css("background-color", atnColor);
        count ++
        CURRENT_LIST.push("#" + $(parent).attr("id"))
    });
    countChecked();
    CURRENT_SELECTED = 0
    gotoElement(CURRENT_LIST[CURRENT_SELECTED]);
}   

// Selects lots based on a search term. Searches any value within the array returned by 'getTableData'.
// if search_term has a CSV format ("x,y,z"), It will match all values.
// The CSV values are also trimmed, So a search term like "x, y, z" is possible.
// search_term is not case sensitive.
function selectBySearch(search_term) {
    var table = getTableData();
    var split_search_term = search_term.split(",");

    // Constructing the search term from CSV
    search_term = "";
    for (var o=0; o < split_search_term.length; o++) {
        search_term = search_term + split_search_term[o].trim();
        if (o < split_search_term.length - 1) {
            search_term = search_term + "|";
        }
    }
    search_term = search_term.toLowerCase();

    var count = 0;
    $("#search_bar").val("");
    for (var i=0; i < table[0].length; i ++) {
        var row = table[0][i]
        var element = table[1][i]
        var match = false;
        element.css("background-color", "");
        for (var j=0; j < row.length; j ++) {
            if (typeof(row[j]) == "string") {
                if (row[j].toLowerCase().search(search_term) !== -1) {
                    match = true;
                    break
                }
            }
        }
        if (match) {
            element.find(".lot_checkbox").prop("checked", true);
            element.css("background-color", atnColor);
            count ++;
        }
    }
    countChecked();
}

function clearStyle() {
    var table = getTableData();
    for (var i=0; i < table[0].length; i ++) {
        var element = table[1][i].css("background-color", "");
        }
}

function highlightAll() {
    var table = getTableData();
    for (var i=0; i < table[0].length; i ++) {
        var element = table[1][i].css("background-color", atnColor);
        }
}

function gotoElement(selector) {
    location.href = "#";
    location.href = selector;
}

function clearList() {

}


$(document).ready(function() {
    //Init
    createUI();
    uncheckAll();
    sprint("Valdar stæður: " + SELECTED);
    getTableData() // This needs to be called to construct the "BATAR" array used to replaces ship id's with names.
    $("#select_printed").prop("checked", GM_getValue("select_printed"));
    $("#hide_printed").prop("checked", GM_getValue("hide_printed"));
    $("#show_names").prop("checked", GM_getValue("show_names"));
    if ($("#hide_printed").prop("checked")) { hidePrinted() }

    // Click events
    $("#select_tub_id").click(function() {
        var select_printed = $("#select_printed").prop("checked");
        uncheckAll();
        selectByTubId();
        if (!select_printed) { uncheckPrinted() };
        sprint("Valdar stæður: " + SELECTED);
    });

    $("#select_age").click(function() {
        var select_printed = $("#select_printed").prop("checked");
        uncheckAll();
        selectBySearch(OLD_SEARCH_TERM);
        if (!select_printed) { uncheckPrinted() };
        sprint("Valdar stæður: " + SELECTED);
    });

    $("#select_printed").click(function() {
        GM_setValue("select_printed", $(this).prop("checked"));
    })

    $("#hide_printed").click(function() {
        if ($(this).prop("checked") == true) {
            hide_printed = setInterval(function() { hidePrinted()}, 100);
        } else {
            clearInterval(hide_printed);
            showPrinted();
        }
        GM_setValue("hide_printed", $(this).prop("checked"));
    })

    $("#show_names").click(function() {
        if ($(this).prop("checked") == true) {
            replaceID();
        } else {
           replaceNames();
        }
        GM_setValue("show_names", $(this).prop("checked"));
    })

    $(".lot_checkbox").click(function() {
        var parent = $(this).parent().parent();
        if ($(this).prop("checked") == true) {
            parent.css("background-color", atnColor);
        } else {
           parent.css("background-color", "");
        }
    })

    $("#check_lots").click(function() {
        if ($(this).prop("checked") == true) {
            highlightAll()
        } else {
            clearStyle()
        }
    })

    $("tbody tr").click(function() {
        var checkBox = $(this).find(".lot_checkbox");
        if (checkBox.prop("checked") == true) {
            $(this).find(":input").prop("checked", false);
            $(this).css("background-color", "");
        } else {
            $(this).find(":input").prop("checked", true);
            $(this).css("background-color", atnColor);
        }

        console.log("Lot clicked!");
    })

    // Keypress events
    $("#search_bar").keypress(function(event) {
        var select_printed = $("#select_printed").prop("checked");
        if (event.which == 13) {
            event.preventDefault()
            uncheckAll();
            selectBySearch($("#search_bar").val());
            if (!select_printed) { uncheckPrinted() };
            sprint("Valdar stæður: " + SELECTED);
        }
    })

    // Replaces the ship id's with ship names in the table
    if (GM_getValue("show_names")) {
        replaceID();
    }
});

$(document).keydown(function(event) {
    if (event.altKey && event.key == NEXT_ITEM) {
        CURRENT_SELECTED += 1
        gotoElement(CURRENT_LIST[CURRENT_SELECTED]);
        console.log(event.code)
    }

    if (event.altKey && event.key == PREV_ITEM) {
        CURRENT_SELECTED -= 1
        gotoElement(CURRENT_LIST[CURRENT_SELECTED]); 
        console.log(CURRENT_SELECTED)
    }
})







