import {VALUE, VALID, EDITABLE, LABEL} from "../presentationModel/presentationModel.js";

export { personListItemProjector, personFormProjector, personTableRowProjector }

const bindTextInput = (textAttr, inputElement) => {
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    textAttr.getObs(VALID, true).onChange(
        valid => valid
          ? inputElement.classList.remove("invalid")
          : inputElement.classList.add("invalid")
    );

    textAttr.getObs(EDITABLE, true).onChange(
        isEditable => isEditable
        ? inputElement.removeAttribute("readonly")
        : inputElement.setAttribute("readonly", true));

    textAttr.getObs(LABEL, '').onChange(label => inputElement.setAttribute("title", label));
};

const personTextProjector = textAttr => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 20;

    bindTextInput(textAttr, inputElement);

    return inputElement;
};

function deleteButtonProjector(masterController, person) {
    const deleteButton = document.createElement("Button");
    deleteButton.setAttribute("class", "delete");
    deleteButton.innerHTML = "&times;";
    deleteButton.onclick = _ => masterController.removePerson(person);
    return deleteButton;
}

const personListItemProjector = (masterController, selectionController, rootElement, person) => {

    const deleteButton = deleteButtonProjector(masterController, person);

    const firstnameInputElement = personTextProjector(person.firstname);
    const lastnameInputElement  = personTextProjector(person.lastname);

    firstnameInputElement.onfocus = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onfocus  = _ => selectionController.setSelectedPerson(person);

    selectionController.onPersonSelected(
        selected => selected === person
          ? deleteButton.classList.add("selected")
          : deleteButton.classList.remove("selected")
    );

    masterController.onPersonRemove( (removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        rootElement.removeChild(deleteButton);
        rootElement.removeChild(firstnameInputElement);
        rootElement.removeChild(lastnameInputElement);
        selectionController.clearSelection();
        removeMe();
    } );

    rootElement.appendChild(deleteButton);
    rootElement.appendChild(firstnameInputElement);
    rootElement.appendChild(lastnameInputElement);
    selectionController.setSelectedPerson(person);
};

const addTableCell = (element, row) => {
    const td = document.createElement("td").appendChild(element);
    row.appendChild(td);
}

const personTableRowProjector = (masterController, selectionController, rootElement, person) => {
    const tableRow = document.createElement("tr");

    const deleteButton = deleteButtonProjector(masterController, person);

    const firstnameInputElement = personTextProjector(person.firstname);
    const lastnameInputElement = personTextProjector(person.lastname);

    firstnameInputElement.onfocus = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onfocus  = _ => selectionController.setSelectedPerson(person);

    selectionController.onPersonSelected(
        selected => selected === person
          ? tableRow.classList.add("selected")
            : tableRow.classList.remove("selected")
    );

    masterController.onPersonRemove( (removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        rootElement.removeChild(tableRow);
        selectionController.clearSelection();
        removeMe();
    });
    addTableCell(deleteButton, tableRow);
    addTableCell(firstnameInputElement, tableRow);
    addTableCell(lastnameInputElement, tableRow);

    rootElement.appendChild(tableRow);

    selectionController.setSelectedPerson(person);

}

const personFormProjector = (detailController, rootElement, person) => {

    const divElement = document.createElement("DIV");
    divElement.innerHTML = `
    <FORM>
        <DIV class="detail-form">
            <LABEL for="firstname"></LABEL>
            <INPUT TYPE="text" size="20" id="firstname">   
            <LABEL for="lastname"></LABEL>
            <INPUT TYPE="text" size="20" id="lastname">   
        </DIV>
    </FORM>`;

    bindTextInput(person.firstname, divElement.querySelector('#firstname'));
    bindTextInput(person.lastname,  divElement.querySelector('#lastname'));

    // beware of memory leak in person.firstname observables
    person.firstname.getObs(LABEL, '')
        .onChange(label => divElement.querySelector('[for=firstname]').textContent = label);
    person.lastname.getObs(LABEL, '')
        .onChange(label => divElement.querySelector('[for=lastname]').textContent = label);

    rootElement.firstChild.replaceWith(divElement);
};

