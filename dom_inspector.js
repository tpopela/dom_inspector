/*
 *  dom_inspector
 *  https://github.com/tpopela/dom_inspector
 *  Tomas Popela
 */

// start of script on onload event
if (window.addEventListener) {
    window.addEventListener("load",function() { this.startDOMLogic(); },false);
}
else if (window.attachEvent) {
    window.attachEvent("onload",function() { this.startDOMLogic(); });
}
else {
    window.onload=function() { this.startDOMLogic(); };
}

var iterator = 0;
var currentElement = null;
var currentElementDOM = null;

// returns actually selected DOM tree element
function getSelectedElement() {
    return currentElement;
}

// "main" of this scipt
function startDOMLogic() {
    this.loadCssStyles();    
    this.showFrame();
    this.initializeDOMList();
    this.parseDomTree(document, null);
    this.installBodyOnClick();

    document.getElementById("idInput").style.display = "inline";
    document.getElementById("idInputLabel").style.display = "block";
    document.getElementById("idInputButton") .style.display = "inline";
    document.getElementById("classInput") .style.display = "inline";
    document.getElementById("classInputLabel").style.display = "block";
    document.getElementById("classInputButton").style.display = "inline";
    document.getElementById("inputDiv").style.display = "block";
}

// sets onload event on BODY element
function installBodyOnClick() {
    document.body.onclick = function() {
        var element = window.event ? event.srcElement : arguments[0].target;
        // if we're not clicking on element in DOM elements list
        if (element.className.indexOf("domFont") == -1) {
            element.className += ' DOMInspectorPageItemSelected ';
            iterator = 0;
            searchSelectedItem(document, null, null);
        }
    }
}

// loads CSS styles
function loadCssStyles() {
    var cssFile = document.createElement('link');
    cssFile.setAttribute("rel", "stylesheet");
    cssFile.setAttribute("type", "text/css");
    cssFile.setAttribute("href", "dom_inspector.css");

    document.getElementsByTagName("head")[0].appendChild(cssFile);
}

// creates and sets GUI of dom_inspector
function showFrame() {
    var body = document.getElementsByTagName("body")[0];
    var elem = document.createElement("div");
    var inputDiv = document.createElement("div");
    var idDiv = document.createElement("div");
    var classDiv = document.createElement("div");
    var idInput = document.createElement("input");
    var idInputLabel = document.createElement("label");
    var idInputButton = document.createElement("button");
    var classInput = document.createElement("input");
    var classInputLabel = document.createElement("label");
    var classInputButton = document.createElement("button");

    elem.id = "domDiv";
    elem.style.display = "inline-block";
    elem.style.position = "absolute";
    elem.style.minWidth = "160px";
    elem.style.zIndex = "10000";

    inputDiv.id = 'inputDiv';
    inputDiv.style.width = "100%";
    inputDiv.style.paddingBottom = "5px";
    inputDiv.style.display = "none";

    idDiv.id = 'classDiv';
    idDiv.style.display = "inline";

    idInput.type = "text";
    idInput.id = "idInput";
    idInput.style.width = "80%";
    idInput.disabled = "disabled";

    idInputLabel.id = 'idInputLabel';
    idInputLabel.htmlFor = idInput.id;
    idInputLabel.style.textAlign = "center";
    idInputLabel.innerHTML = "Element's ID";

    idInputButton.id = 'idInputButton';
    idInputButton.innerHTML = '&#10003;';
    idInputButton.onclick = this.changeIdOfElement;
    idInputButton.disabled = "disabled";
    idInputButton.style.cssFloat = "right";
    idInputButton.style.width = "14%";

    classDiv.id = 'classDiv';
    classDiv.style.display = "inline";

    classInput.id = "classInput";
    classInput.type = "text";
    classInput.style.width = "80%";
    classInput.disabled = "disabled";
    classInput.style.cssFloat = "center";

    classInputLabel.id = 'classInputLabel';
    classInputLabel.htmlFor = idInput.id;
    classInputLabel.style.textAlign = "center";
    classInputLabel.innerHTML = "Element's Classes";

    classInputButton.id = 'classInputButton';
    classInputButton.innerHTML = '&#10003;';
    classInputButton.onclick = this.changeClassOfElement;
    classInputButton.disabled = "disabled";
    classInputButton.style.cssFloat = "right";
    classInputButton.style.width = "14%";

    idDiv.appendChild(idInput);
    idDiv.appendChild(idInputButton);

    classDiv.appendChild(classInput);
    classDiv.appendChild(classInputButton);

    inputDiv.appendChild(idInputLabel);
    inputDiv.appendChild(idInput);
    inputDiv.appendChild(idInputButton);
    inputDiv.appendChild(classInputLabel);
    inputDiv.appendChild(idDiv);
    inputDiv.appendChild(classDiv);
    body.appendChild(elem);
    elem.appendChild(inputDiv);
}

// inicialization of list, that represents DOM tree
function initializeDOMList() {
    var domInspectorDiv = document.getElementById("domDiv");
    var domTree = document.createElement("ul");

    domTree.id = "domList";
    domTree.className += ' DOMListItem';
    domTree.style.marginLeft = "10px";

    domInspectorDiv.appendChild(domTree);
}

// inserts new sublist to the top level of DOM tree list
function addListSublist(sublistId) {
    var listRoot = document.getElementById("domList");
    var newItem = document.createElement('ul');

    newItem.id = sublistId + 'UL';
    newItem.className += ' DOMListItem';

    listRoot.insertBefore(newItem, listRoot.nextSibling);
}

// inserts new sublist into given list
function addSpecifiedListSublist(listId, sublistId) {
    var listRoot = document.getElementById(listId);
    var newItem = document.createElement('ul');

    newItem.id = sublistId + 'UL';
    newItem.className += ' DOMListItem';

    listRoot.insertBefore(newItem, listRoot.nextSibling);
}

// inserts new item into given list
function addNewItemToSublist(sublistId, item) {
    var listRoot = document.getElementById(sublistId);
    var newItem = document.createElement('li');
    var newHref = document.createElement('a');
    var itemId;
   
    if (item.tagName)
        itemId = item.tagName + iterator;
    else
        itemId = 'TEXT' + iterator;

    newItem.id = itemId;

    newHref.id = itemId + 'LINK';
    newHref.href = "javascript:void(0)";
    newHref.onclick = function() { showSelectedItem(itemId); };
    newHref.ondblclick = function() { collapseDOMTree(newHref.id); };
    newHref.className += ' domFont';
    newHref.style.textDecoration = "none";
    if (item.tagName)
        newHref.innerHTML = item.tagName;
    else
        newHref.innerHTML = 'TEXT';

    newItem.appendChild(newHref);
    listRoot.insertBefore(newItem, listRoot.nextSibling);
}

// expand/collapse the DOM tree list items
function collapseDOMTree(elementId) {
    var ulId = elementId.replace('LINK','UL');
    var domList = document.getElementById(ulId);
    var domLink = document.getElementById(elementId);

    if (domList) {
        if (domList.style.display == "block") {
            domList.style.display = "none";
            domLink.style.fontStyle = "italic";
            domLink.style.fontWeight = "bolder";
        }
        else {
            domList.style.display = "block";
            domLink.style.fontStyle = "normal";
            domLink.style.fontWeight = "normal";
        }
    }
}

// highlights selected inline item (eg. <BR>) or DOM Text element on page 
// and in DOM tree list
function highlightInlineItem(element, destNameIt) {
    if (element.parentNode.className.indexOf('highlightPageItem') == -1) {
        if (currentElement != null) {
            var currentDOMListItem = document.getElementById(currentElementDOM);
            var currentDOMListItemList = document.getElementById(currentElementDOM + 'UL');
            var currentDOMListItemLink = document.getElementById(currentElementDOM + 'LINK');

            if (currentElement.className) {
                currentElement.className = currentElement.className.replace(' highlightPageItem','');
            }
            else {
                var span = document.getElementById("pageInlineItemHighlight");
                span.parentNode.replaceChild(span.firstChild, span);
            }

            if (currentDOMListItem)
                currentDOMListItem.className = currentDOMListItem.className.replace(' highlightDomItem', '');
            if (currentDOMListItemList)
                currentDOMListItemList.className = currentDOMListItemList.className.replace(' highlightDomItem', '');
            if (currentDOMListItemLink)
                currentDOMListItemLink.className = currentDOMListItemLink.className.replace(' highlightDomItem', '');

        }

        var textSpan = document.createElement("span");
        textSpan.className += ' highlightPageItem';
        textSpan.id = 'pageInlineItemHighlight';
        var newNode = element.cloneNode(true);
        textSpan.appendChild(newNode);
        element.parentNode.replaceChild(textSpan, element);

        var domListItemLink = document.getElementById(destNameIt + 'LINK');

        if (domListItemLink)
            domListItemLink.className += ' highlightDomItem';

        this.clearElementProperities(element);
        this.fillElementProperities(element);

        currentElement = element;
        currentElementDOM = destNameIt;
    }
    else {
        var span = document.getElementById("pageInlineItemHighlight");
        span.parentNode.replaceChild(span.firstChild, span);

        var domListItemLink = document.getElementById(destNameIt + 'LINK');

        if (domListItemLink)
            domListItemLink.className = domListItemLink.className.replace(' highlightDomItem', '')

        currentElement = null;
        currentElementDOM = null;
    }
}

// highlights selected element on page and in DOM tree list
function highlightItem(element, destNameIt) {
    var domListItem = document.getElementById(destNameIt);
    var domListItemList = document.getElementById(destNameIt + 'UL');
    var domListItemLink = document.getElementById(destNameIt + 'LINK');

    if (element.className.indexOf('DOMInspectorPageItemSelected') != -1) {
        element.className = element.className.replace(' DOMInspectorPageItemSelected', '');
        if (domListItem)
            domListItem.className = domListItem.className.replace(' DOMInspectorPageItemSelected', '');
        if (domListItemList)
            domListItemList.className = domListItemList.className.replace(' DOMInspectorPageItemSelected', '');
        if (domListItemLink)
            domListItemLink.className = domListItemLink.className.replace(' DOMInspectorPageItemSelected', '');
        this.clearElementProperities(element);
    }

    if (element.className.indexOf("highlightPageItem") != -1) {
        element.className = element.className.replace(' highlightPageItem', '');
        if (domListItem)
            domListItem.className = domListItem.className.replace(' highlightDomItem', '');
        if (domListItemList)
            domListItemList.className = domListItemList.className.replace(' highlightDomItem', '');
        if (domListItemLink)
            domListItemLink.className = domListItemLink.className.replace(' highlightDomItem', '');
        this.clearElementProperities(element);
        currentElement = null;
        currentElementDOM = null;
    }
    else {
        element.className += ' highlightPageItem';
        if (domListItem)
            domListItem.className += ' highlightDomItem';
        if (domListItemList)
            domListItemList.className += ' highlightDomItem';
        if (domListItemLink)
            domListItemLink.className += ' highlightDomItem';
        this.fillElementProperities(element);
        if (currentElement != null) {
            var currentDOMListItem = document.getElementById(currentElementDOM);
            var currentDOMListItemList = document.getElementById(currentElementDOM + 'UL');
            var currentDOMListItemLink = document.getElementById(currentElementDOM + 'LINK');

            if (currentElement.className) {
                currentElement.className = currentElement.className.replace(' highlightPageItem','');
            }
            else {
                var span = document.getElementById("pageInlineItemHighlight");
                span.parentNode.replaceChild(span.firstChild, span);
            }

            if (currentDOMListItem)
                currentDOMListItem.className = currentDOMListItem.className.replace(' highlightDomItem', '');
            if (currentDOMListItemList)
                currentDOMListItemList.className = currentDOMListItemList.className.replace(' highlightDomItem', '');
            if (currentDOMListItemLink)
                currentDOMListItemLink.className = currentDOMListItemLink.className.replace(' highlightDomItem', '');
        }
        currentElement = element;
        currentElementDOM = destNameIt;
    }
}

// fills up inputs with selected element's id and its CSS classes
function fillElementProperities(element) {
    var idInput = document.getElementById('idInput');
    var classInput = document.getElementById('classInput');
    var idInputButton = document.getElementById('idInputButton');
    var classInputButton = document.getElementById('classInputButton');

    if (element.nodeName != '#text') {
        idInput.disabled = "";
        classInput.disabled = "";
        idInputButton.disabled = "";
        classInputButton.disabled = "";

        idInput.value = element.id;
        var tempClassName = element.className.replace(' highlightPageItem', '');
        classInput.value = tempClassName.replace(' DOMInspectorPageItemSelected', '');
    }
}

// cleares inputs with element's id and CSS classes 
function clearElementProperities(element) {
    var idInput = document.getElementById('idInput');
    var classInput = document.getElementById('classInput');
    var idInputButton = document.getElementById('idInputButton');
    var classInputButton = document.getElementById('classInputButton');

    idInput.disabled = "disabled";
    classInput.disabled = "disabled";
    idInputButton.disabled = "disabled";
    classInputButton.disabled = "disabled";

    idInput.value = '';
    classInput.value = '';
}

// changes id of element to given one
function changeIdOfElement() {
    if (currentElement != null) {
        var idInput = document.getElementById('idInput');
        currentElement.id = idInput.value;
    }
}

// changes CSS classes of element 
function changeClassOfElement() {
    if (currentElement != null) {
        var classInput = document.getElementById('classInput');
        currentElement.className = '';
        currentElement.className += ' highlightPageItem';
        currentElement.className += ' ' + classInput.value;
    }
}

// finds actually selected element in DOM tree list or on page
// if it's find, it also highlights it
function searchSelectedItem(element, sublistID, destNameIt) {

    if (element.id == "domDiv")
        return;
    if (element.id == 'domParserCssClass1' || element.id == "domParserCssClass2" || element.id == 'domFont')
        return;

    var i = 0;
    var sListID = null;
    var childCount = element.childNodes.length;

    var tagName = element.tagName;

    if (tagName) {
        if (childCount != 0) {
            if (sublistID != null) {
                if (childCount >= 1) {
                    sListID = tagName + iterator + 'UL';
                    if (destNameIt == tagName + iterator) {
                        this.highlightItem(element, destNameIt);
                        iterator = 0;
                    }
                    if (element.className.indexOf('DOMInspectorPageItemSelected') != -1) {
                        this.highlightItem(element, tagName + iterator);
                        iterator = 0;
                    }
                }
                if (tagName != 'SPAN' && (element.className.indexOf('highlightPageItem') == -1))
                    iterator++;
                if (tagName == 'SPAN' && (element.className.indexOf('highlightPageItem') == -1))
                    iterator++;
                if (tagName != 'SPAN' && (element.className.indexOf('highlightPageItem') != -1))
                    iterator++;
            }
            else {
                sListID = tagName + iterator + 'UL';
                if (destNameIt == tagName + iterator) {
                    this.highlightItem(element, destNameIt);
                    iterator = 0;
                }
                if (element.className.indexOf('DOMInspectorPageItemSelected') != -1) {
                    this.highlightItem(element, tagName + iterator);
                    iterator = 0;
                }
                if (tagName != 'SPAN' && (element.className.indexOf('highlightPageItem') == -1))
                    iterator++;
                if (tagName == 'SPAN' && (element.className.indexOf('highlightPageItem') == -1))
                    iterator++;
            }
        }
        else {
            if (destNameIt == tagName + iterator) {
                if (tagName != 'BR')
                    this.highlightItem(element, destNameIt);
                else 
                    this.highlightInlineItem(element, destNameIt);
                iterator = 0;
            }
            if (element.className.indexOf('DOMInspectorPageItemSelected') != -1) {
                this.highlightItem(element, tagName + iterator);
                iterator = 0;
            }
            iterator++;
        }
    }
    else {
        if (element.nodeName == '#text') {
            var text = element.nodeValue.replace(/^\s+|\s+$/g, '');
            if (text.length > 0) {
                if (('TEXT' + iterator)  == destNameIt) {
                    this.highlightInlineItem(element, destNameIt);
                    iterator = 0;
                }
                iterator++;
            }
        }
    }

    if (childCount != 0) {
        for (i = 0; i < childCount; i++) {
            searchSelectedItem(element.childNodes[i], sListID, destNameIt);
        }
    }
}

// searches element with its id from DOM tree 
function showSelectedItem(elementId) {
    iterator = 0;
    this.searchSelectedItem(document, null, elementId);
}

// creates list (GUI) of DOM elements
function parseDomTree(element, sublistID) {

    if (element.id == "domDiv")
        return;
    if (element.id == 'domParserCssClass1' || element.id == "domParserCssClass2" || element.id == 'domFont')
        return;

    var i = 0;
    var sListID = null;
    var childCount = element.childNodes.length;

    var tagName = element.tagName;

    if (tagName) {
        if (childCount != 0) {
            if (sublistID != null) {
                this.addNewItemToSublist(sublistID, element);
                if (childCount >= 1) {
                    this.addSpecifiedListSublist(sublistID, tagName + iterator);
                    sListID = tagName + iterator + 'UL';
                }
                iterator++;
            }
            else {
                this.addNewItemToSublist('domList', element);
                this.addListSublist(tagName + iterator);
                sListID = tagName + iterator + 'UL';
                iterator++;
            }
        }
        else {
            if (sublistID != null) {
                this.addNewItemToSublist(sublistID, element)
            }
            else {
                this.addNewItemToSublist('domList', element);
                sListID = null;
            }
            iterator++;
        }
    }
    else {
        if (element.nodeName == '#text') {
            tagName = 'TEXT';
            childCount = 0;
            var text = element.nodeValue.replace(/^\s+|\s+$/g, '');
            if (text.length > 0) {
                if (sublistID != null) {
                    this.addNewItemToSublist(sublistID, element)
                }
                else {
                    this.addNewItemToSublist('domList', element);
                    sListID = null;
                }
                iterator++;
           }
        }
    }

    if (childCount != 0) {
        for (i = 0; i < childCount; i++) {
            parseDomTree(element.childNodes[i], sListID);
        }
    }
}

