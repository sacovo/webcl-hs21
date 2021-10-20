
import { MasterController, SelectionController, MasterView, MasterTableView, DetailView } from './person.js';

const masterController    = MasterController();
const selectionController = SelectionController();

// create the sub-views, incl. binding

MasterView(masterController, selectionController, document.getElementById('masterContainer'));
DetailView(selectionController, document.getElementById('detailContainer'));
MasterTableView(masterController, selectionController, document.getElementById('masterTableContainer'));

// binding of the main view

document.querySelectorAll(".plus").forEach((btn) => btn.onclick = _ => masterController.addPerson());

