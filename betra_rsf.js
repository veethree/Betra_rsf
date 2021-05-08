// ==UserScript==
// @name         Betra_RSF
// @version      1.3
// @description  Betra RSF
// @author       veethreedev
// @match        https://rsf.is/markadir/limmidaprentun*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      http://code.jquery.com/jquery-latest.js
// @downloadURL  https://raw.githubusercontent.com/veethree/Betra_rsf/master/betra_rsf.js
// ==/UserScript==

// GLOBALS
var BOATS = []; // Used for replacing boat ID's with names
var SELECTED_COUNT = 0; // Number of currently selected lots
var LAST_PRINT = []

// Key bindings
var SELECT_TUBID = "k";
var SELECT_OLD = "o";
var SELECT_LAST_PRINT = "s"
var REFRESH = "r";
var PRINT = "m";
var SEARCH = "q";
var BACK = "Escape";
var SELECT_NONE = "z";
var SELECT_ALL = "a";

// Styling
var selectedClasses = ["alert-info"]

// Page elements to hide
var elementsToHide = [
	"#lot-id-between",
	"#lots-between",
	"#rsf-form-row > form > div:nth-child(10)",
	"#rsf-form-row > form > div:nth-child(8)",
	"#rsf-form-row > form > div:nth-child(7)",
	"#rsf-form-row > form > div:nth-child(6)",
	"#submit-container > div:nth-child(7)",
	"#submit-container > div:nth-child(8)",
	"#submit-container > div:nth-child(9)",
	"#submit-container > div:nth-child(6)"
]

// Table columns to hide
var columnsToHide = [0, 10, 11, 12, 13];

//Creates Betra_RSF's UI
function createUI() {
	// Title
    $("<div id='BRSF' class='container'></div>").insertAfter(".clearfix");
    //$("#BRSF").append("<p class='lead text-center text-success'>-    Betra RSF    -</p>");

    // Buttons
    $("#BRSF").append("<hr><a id='select_tub_id' class='btn btn-success d-inline'}>Velja stæður með karanúmerum</a>");
    $("#BRSF").append("  <a id='select_age' class='btn btn-success d-inline'}>Velja 1-dags stæður</a>");

    // Unhide unwanted elements button
    $("#rsf-form-row > form > div:nth-child(5)").append("<a id='unhide_elements' class='btn btn-outline-primary float-left' style='font-size: 14px'}>Sýna allt</a>")

    // Search bar
    $("#BRSF").append("<input class='pull-right' type=text id='search_bar' autocomplete='off' placeholder='Velja kaupanda' style='font-size: 18px; width: 20%'}>");

    // Select printed checkbox
    $("#BRSF").append("<br><div class='form-group submit-checkbox'><div><input type='checkbox' id='select_printed'>");
    $("#BRSF").append("<label for='select_printed' class='checkbox-inline'>Veja prentaðar stæður?</label></div></div>");

    // Hide printed checkbox
    $("#BRSF").append("<div class='form-group submit-checkbox'><div><input type='checkbox' id='hide_printed'>");
    $("#BRSF").append("<label for='hide_printed' class='checkbox-inline'>Fela prentaðar stæður?</label></div></div>");

    // Show ship names checkbox
    $("#BRSF").append("<div class='form-group submit-checkbox'><div><input type='checkbox' id='show_names'>");
    $("#BRSF").append("<label for='show_names' class='checkbox-inline'>Sýna nöfn á bátum?</label></div></div>");

    // Selected lots counter
    $("#rsf-form-row").append("<br><p class='text-center text-info lead' id='selected_count'}></p>");

    // Unhide hidden table rows link
    $("tfoot").append("<a id='unhide_table' class='btn btn-outline-primary float-left' style='font-size: 14px'}>Sýna allt</a>");

    // Key binding legend
    $("#wrap").append("<hr><div class='alert alert-info'><p class='text-center text-info font-weight-bold' id='selected_count'}><strong>BETRA RSF Takkar</strong><br>P: Prenta<br>R: Endurhlaða<br>K: Velja stæður með karanúmerum<br>O: Velja +1-dags stæður<br>Z: Velja ekkert</p></div>");
}

// Populates the BOATS table with the boats in the current table
// The index is the boats ID and the value is the name
function makeBoatList() {
    var table = getTableData();
    BOATS = [];
	for (var i=0; i < table[0].length; i ++) {
        var id = table[0][i][8];
        var name = table[0][i][7];
        BOATS[id] = name;
    }
}

// Replaces the ship ID's in the table with their names
function showNames() {
    BOATS.forEach(function(e, i) {
        $("td").each(function() {
            if ($(this).text() == i) {
                $(this).text(e + " (" + i + ")");
            }
        } );
    } );
}

// Reverts the change "showNames" made
function hideNames() {
    BOATS.forEach(function(e, i) {
        $("td").each(function() {
            if ($(this).text() == e + " (" + i + ")") {
                $(this).text(i);
            }
        } );
    } );
}

// Gets all the data from the lot table and puts it into an array
function getTableData() {
    var res = [[],[]];
    $("tr[data-command]").each(function(index, element) {
        var data = $(this).attr("data-command");
        var split_data = data.split("||");
        res[1].push($(this));
        res[0].push(split_data);
    });
    return res
}

// Updates selected lot counter
function updateCount() {
	$("#selected_count").text("Valdar Stæður: " + SELECTED_COUNT)
}

// Hides a column in the lot table
function hideColumn(id) {
    $("[id^=tr_] :nth-child(" + id + ")").each(function(index, val) {
        $(val).hide();
    })
    $("thead :nth-child(" + id + ")").hide()
}

// Shows a hidden column in the lot table
function showColumn(id) {
    $("[id^=tr_] :nth-child(" + id + ")").each(function(index, val) {
        $(val).show();
    })
    $("thead :nth-child(" + id + ")").show()
}

// Hides printed lots
function hidePrinted() {
    $(".printed").hide();
}

// Shows printed lots
function showPrinted() {
    $(".printed").show();
}

// Hides unwanted page elements and makes a few modifications to the page
// ****The page modifications should be moved to their own function!
function hideUnwantedElements() {
	for (var i=0; i < elementsToHide.length; i++) {
		$(elementsToHide[i]).hide();
	}

	// Modifies the "Sækja færslur" button
	$("#submit-container > button").addClass("btn-lg")
	$("#submit-container > button").addClass("btn-block")
    // Modies the lots table
    hideTableItems();
    $("table").each(function() {
        $(this).removeClass("table-striped");
        $(this).addClass("table-bordered");
    });
}

// Shows unwanted elements
function showUnwantedElements() {
	for (var i=0; i < elementsToHide.length; i++) {
		$(elementsToHide[i]).show();
    }
}

// Hides the table columns specified in the "columnsToHide" array
function hideTableItems() {
    for (var i=0; i < columnsToHide.length; i++) {
        hideColumn(columnsToHide[i]);
    }
}

// Reverts the change "hideTableItems()" made
function showTableItems() {
    for (var i=0; i < columnsToHide.length; i++) {
        showColumn(columnsToHide[i]);
    }
}

// Unchecks all rows
function uncheckAll() {
    SELECTED_COUNT = 0;
    var table = getTableData();
    for (var i=0; i < table[1].length; i++) {
        selectedClasses.forEach(function(item) {
            $(table[1][i]).removeClass(item);
        })
        $(table[1][i]).find(".lot_checkbox").prop("checked", false);
    }
    updateCount();
}

function checkAll() {
    SELECTED_COUNT = 0;
    var table = getTableData();
    for (var i=0; i < table[1].length; i++) {
        selectedClasses.forEach(function(item) {
            $(table[1][i]).addClass(item);
        })
        $(table[1][i]).find(".lot_checkbox").prop("checked", true);
    }
    updateCount();
}

function checkLastPrint() {
    uncheckAll()
    SELECTED_COUNT = 0;
    var table = LAST_PRINT
    for (var i=0; i < table.length; i++) {
        selectedClasses.forEach(function(item) {
            $(table[i]).addClass(item);
        })
        $(table[i]).find(".lot_checkbox").prop("checked", true);
    }
    updateCount();
}

function getCheckedLots() {
    var lots = []
    var table = getTableData();
    for (var i=0; i < table[1].length; i++) {
        if ($(table[1][i]).find(".lot_checkbox").prop("checked")) {
            lots.push(table[1][i])
        }
    }
    return lots
}

// Checks a specific row
function checkRow(id) {
	var table = getTableData();
	if (table[1][id].hasClass("printed")) {
        if (GM_getValue("select_printed")) {
		    $(table[1][id]).find(".lot_checkbox").prop("checked", true);
            selectedClasses.forEach(function(item) {
                $(table[1][id]).addClass(item);
            })
            SELECTED_COUNT += 1;
    }
} else {
    $(table[1][id]).find(".lot_checkbox").prop("checked", true);
    selectedClasses.forEach(function(item) {
        $(table[1][id]).addClass(item);
    })
    SELECTED_COUNT += 1;
}
}

// Row selector functions:
// Select all lots with tub ID's
function selectById() {
    uncheckAll();
    SELECTED_COUNT = 0;
	var table = getTableData();
	for (var i=0; i < table[0].length; i ++) {
        var row = table[0][i];
        var element = table[1][i];
        if (row[4] !== "") {
        	checkRow(i);
        }
    }
    updateCount();
}

// Selects all non-new lots
function selectByAge() {
	uncheckAll();
	SELECTED_COUNT = 0;
	var table = getTableData();
	for (var i=0; i < table[0].length; i ++) {
        var row = table[0][i];
        var element = table[1][i];
        if (row[11] !== "Nýr") {
        	checkRow(i);
        }
    }
    updateCount();
}

function selectByCustomerID(customer_id) {
    uncheckAll();
    SELECTED_COUNT = 0;
    var table = getTableData();

    for (var i=0; i < table[0].length; i ++) {
        var row = table[0][i]
        var element = table[1][i]
        var match = false;
        if (row[5] == customer_id.trim()) {
            checkRow(i)
        }
    }
    updateCount();
}

// Selects by search term
function selectBySearch(search_term) {
	uncheckAll();
	SELECTED_COUNT = 0;
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

    $("#search_bar").val("");
    for (var i=0; i < table[0].length; i ++) {
        var row = table[0][i]
        var element = table[1][i]
        var match = false;
        for (var j=0; j < row.length; j ++) {
            if (typeof(row[j]) == "string") {
                if (row[j].toLowerCase().search(search_term) !== -1) {
                    checkRow(i)
                    break
                }
            }
        }
    }
    updateCount();
}

// Document load
$(document).ready(function() {
    makeBoatList();
	hideUnwantedElements();
    createUI();
    uncheckAll()
    // Loading GM values
    $("#select_printed").prop("checked", GM_getValue("select_printed"));
    $("#hide_printed").prop("checked", GM_getValue("hide_printed"));
    $("#show_names").prop("checked", GM_getValue("show_names"));

    // Page modifications based on checkbox values
    // ****This should be put into a "modifyPage" function!
    if ($("#hide_printed").prop("checked")) { hidePrinted() }
    if ($("#show_names").prop("checked")) { showNames() }

    // Unhide link
    $("#unhide_elements").click(function() {
    	showUnwantedElements();
    	$("#unhide_elements").hide();
    })

    // Unhide link
    $("#unhide_table").click(function() {
    	showTableItems();
    	$("#unhide_table").hide();
    })

    // Select by ID button
    $("#select_tub_id").click(function() {
    	selectById();
    })

     // Select by Age button
    $("#select_age").click(function() {
    	selectByAge();
    })

    // Select by search keypress event
    $("#search_bar").keypress(function(event) {
        //var select_printed = $("#select_printed").prop("checked");
        if (event.key == "Enter") {
            event.preventDefault()
            selectByCustomerID($("#search_bar").val());
            $("#search_bar").val("");
        }
    })

    // Checkboxes
    $("#hide_printed").click(function() {
        if ($(this).prop("checked") == true) {
            hidePrinted();
        } else {
            showPrinted();
        }
        GM_setValue("hide_printed", $(this).prop("checked"));
    })

    $("#show_names").click(function() {
        if ($(this).prop("checked") == true) {
            showNames();
        } else {
            hideNames();
        }
        GM_setValue("show_names", $(this).prop("checked"));
    })

    $("#select_printed").click(function() {
        GM_setValue("select_printed", $(this).prop("checked"));
    })

    // Makes the entire row clickable
    // ****Also makes the checkboxes not function!
    $("tbody tr").click(function() {
        var element = this;
        var checkBox = $(this).find(".lot_checkbox");
        if (checkBox.prop("checked") == true) {
            $(this).find(":input").prop("checked", false);
            selectedClasses.forEach(function(item) {
                $(element).removeClass(item);
            })
        } else {
            $(this).find(":input").prop("checked", true);
            selectedClasses.forEach(function(item) {
                $(element).addClass(item);
            })
        }
    })
});

// Key events
$(document).keydown(function(event) {
    if (document.activeElement.nodeName == "BODY") {
		if (event.key == REFRESH) {
            $("#submit-container > button").click();
		}

		if (event.key == SELECT_TUBID) {
			selectById();
		}

		if (event.key == SELECT_OLD) {
			selectByAge();
		}

		if (event.key == PRINT) {
            LAST_PRINT = getCheckedLots()
			$("#print_lots").click()
		}

		if (event.key == SEARCH) {
			event.preventDefault();
			$("#search_bar").focus();
		}

		if (event.key == SELECT_NONE) {
            uncheckAll();
		}

        if (event.key == SELECT_ALL) {
            checkAll();
		}

        if (event.key == SELECT_LAST_PRINT) {
            checkLastPrint()
        }
	} else {
		if (event.key == BACK) {
			$("#search_bar").blur();
		}
	}
})

