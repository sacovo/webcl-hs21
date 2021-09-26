import { Observable, ObservableList } from "../observable/observable.js";
import { Attribute }      from "../presentationModel/presentationModel.js";
import { Scheduler }      from "../dataflow/dataflow.js";
import { fortuneService } from "./fortuneService.js";

export { TodoController, TodoItemsView, TodoDetailView, TodoTotalView, TodoOpenView}

const TodoController = () => {

    const Todo = () => {                               // facade
        const textAttr = Attribute("text");
        const doneAttr = Attribute(false);

        const attrs = [textAttr, doneAttr];

        const dirtyObs = Observable(false);
        const setDirty = () => dirtyObs.setValue(attrs.some(attr => attr.dirtyObs.getValue()))
        attrs.map(attr => attr.dirtyObs.onChange(setDirty));

        const save = () => attrs.map(attr => attr.save());
        const reset = () => attrs.map(attr => attr.reset());

        textAttr.setConverter( input => input.toUpperCase() );
        textAttr.setValidator( input => input.length >= 3   );

        return {
            getDone:            doneAttr.valueObs.getValue,
            setDone:            doneAttr.setValue,
            getDoneDirty:       doneAttr.dirtyObs.getValue,
            onDoneChanged:      doneAttr.valueObs.onChange,
            getText:            textAttr.valueObs.getValue,
            setText:            textAttr.setConvertedValue,
            getTextDirty:       textAttr.dirtyObs.getValue,
            onTextChanged:      textAttr.valueObs.onChange,
            onTextValidChanged: textAttr.validObs.onChange,
            onDirtyChanged:     dirtyObs.onChange,
            save,
            reset,
        }
    };

    const todoModel = ObservableList([]); // observable array of Todos, this state is private
    const selection = Observable(null);

    const setSelection = todo => selection.setValue(todoModel.list.indexOf(todo));
    const getSelectedTodo = () => todoModel.list[selection.getValue()];

    todoModel.onDel((removedItem, index) => {
        if (index <= selection.getValue()) {
            selection.setValue(selection.getValue() - 1);
        }
    })

    const scheduler = Scheduler();

    const addTodo = () => {
        const newTodo = Todo();
        todoModel.add(newTodo);
        setSelection(newTodo);
        return newTodo;
    };

    const addFortuneTodo = () => {

        const newTodo = Todo();

        todoModel.add(newTodo);
        newTodo.setText('...');

        scheduler.add( ok =>
           fortuneService( text => {
                   newTodo.setText(text);
                   ok();
               }
           )
        );

    };

    return {
        numberOfTodos:      todoModel.count,
        numberOfopenTasks:  () => todoModel.countIf( todo => ! todo.getDone() ),
        addTodo:            addTodo,
        addFortuneTodo:     addFortuneTodo,
        setSelection,
        removeTodo:         todoModel.del,
        onTodoAdd:          todoModel.onAdd,
        onTodoRemove:       todoModel.onDel,
        onSelectionChanged: selection.onChange,
        selectedTodo:       getSelectedTodo,
        removeTodoRemoveListener: todoModel.removeDeleteListener, // only for the test case, not used below
    }
};


// View-specific parts

const TodoItemsView = (todoController, rootElement) => {

    const render = todo => {

        function createElements() {
            const row = document.createElement('TR');
            row.innerHTML = `
                <td>
                  <input type="checkbox" class="todo-checked" disabled/>
                  <span class="todo-text"></span>
                </td>
                <td><button class="delete">&times;</button></td>            
            `;
            return row;
        }
        const row = createElements();
        const [checkboxElement] = row.getElementsByClassName('todo-checked');
        const [textElement] = row.getElementsByClassName('todo-text');
        const [deleteButton] = row.getElementsByClassName('delete');

        const updateText = () => {
            textElement.innerText = todo.getText();
            if (todo.getTextDirty()) {
                textElement.classList.add('dirty');
            } else {
                textElement.classList.remove('dirty');
            }
        }
        todo.onTextChanged(updateText);
        updateText();


        const updateCheckbox = () => {
            checkboxElement.checked = todo.getDone();
            if (todo.getDoneDirty()) {
                checkboxElement.classList.add('dirty');
            } else {
                checkboxElement.classList.remove('dirty');
            }
        }
        todo.onDoneChanged(updateCheckbox);
        updateCheckbox();

        todo.onDirtyChanged(() => {
            updateText();
            updateCheckbox();
        })

        deleteButton.onclick    = _ => todoController.removeTodo(todo);

        todoController.onTodoRemove( (removedTodo, _, removeMe) => {
            if (removedTodo !== todo) return;
            rootElement.removeChild(row);
            removeMe();
        } );

        todoController.onSelectionChanged(_ => {
            if (todoController.selectedTodo() === todo) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        })

        textElement.onclick = _ => todoController.setSelection(todo);

        rootElement.appendChild(row);
    };

    // binding

    todoController.onTodoAdd(render);

    // we do not expose anything as the view is totally passive.
};

const TodoDetailView = (todoController, inputElement, checkboxElement, saveButton, resetButton) => {
    const render = todo => {
        if (!todo) {
            inputElement.value = '';
            checkboxElement.checked = false;
            return;
        }

        inputElement.value = todo.getText();
        checkboxElement.checked = todo.getDone();

        checkboxElement.onclick = _ => todo.setDone(checkboxElement.checked);

        inputElement.oninput = _ => todo.setText(inputElement.value);

        todo.onTextChanged(() => inputElement.value = todo.getText());

        todo.onTextValidChanged(
            valid => valid
                ? inputElement.classList.remove("invalid")
                : inputElement.classList.add("invalid")
        );

        saveButton.onclick = _ => todo.save();
        resetButton.onclick = _ => todo.reset();
    };

    todoController.onSelectionChanged(() => render(todoController.selectedTodo()));
};

const TodoTotalView = (todoController, numberOfTasksElement) => {

    const render = () =>
        numberOfTasksElement.innerText = "" + todoController.numberOfTodos();

    // binding

    todoController.onTodoAdd(render);
    todoController.onTodoRemove(render);
};

const TodoOpenView = (todoController, numberOfOpenTasksElement) => {

    const render = () =>
        numberOfOpenTasksElement.innerText = "" + todoController.numberOfopenTasks();

    // binding

    todoController.onTodoAdd(todo => {
        render();
        todo.onDoneChanged(render);
    });
    todoController.onTodoRemove(render);
};
