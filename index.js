// TASK: import helper functions from utils
// TASK: import initialData
import { deleteTask, getTasks } from './utils/taskFunctions.js';
import { initialData } from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

console.log(initialData)

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  boardsContainer: document.getElementById('boards-nav-links-div'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  newtaskTitleInput: document.getElementById('title-input'),
  newTaskDescInput: document.getElementById('desc-input'),
  newTaskStatusSelect: document.getElementById('select-status'),
  modalWindow: document.getElementById('new-task-modal-window'),
  filterDiv: document.getElementById('filterDiv'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editTaskStatusSelect: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('create-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  columnDivs: document.querySelectorAll('.column-div'),
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  elements.boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {  // Replaced click with correct event listener
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    elements.boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); // Added '===' for correct comaprison and made 'task' plural

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    let tasksContainer = column.querySelector('.tasks-container');
    if (!tasksContainer) { // Creating a new container if one does not exist
      tasksContainer = document.createElement("div");
      tasksContainer.className = 'tasks-container';
      column.appendChild(tasksContainer);
    }

    filteredTasks.filter(task => task.status === status).forEach(task => { // Added === for comparison
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { // Replaced click with addEvent Listener
        openEditTaskModal(task);
      });

    tasksContainer.appendChild(taskElement);
  });
});
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { // Changed 'foreach()' to 'forEach()'

    if (btn.textContent === boardName) {
      btn.classList.add('active') // Added 'classList' to properly add a class
    }
    else {
      btn.classList.remove('active'); // Added 'classList' to properly remove a class
    }
  });
  addTaskToUI(task); //
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); // Fixed the template literal
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  tasksContainer.appendChild(taskElement); // Added 'taskElement' to append
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal)); // Added an event listener for 'click'

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);  // Opens modal
    elements.filterDiv.style.display = 'block';  // Show overlay
  });

  // Add new task form submission event listener
  elements.addNewTaskBtn.addEventListener('click', (event) => {
    toogleModal(true)
    elements.filterDiv.style.display = 'block'
  });

  // Added an event listener to submit a task
  elements.createNewTaskBtn.addEventListener('click', (event) => {
    addTask(event);  // Handles task creation
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  //Assign user input to the task object
  const title = elements.newtaskTitleInput.value
  const description = elements.newTaskDescInput.value
  const status = elements.newTaskStatusSelect.value

  const tasks = getTasks();

  const nextTaskId = tasks.length > 0 ? tasks.length + 1 : 1;

  // Create a new task object
  const newTask = {
    id: nextTaskId,
    title,
    description,
    status,
    board: activeBoard
  }

  // Adding the task to the list
  tasks.push(newTask)
  localStorage.setItem('tasks', JSON.stringify(tasks))

  // Clear form fields after task creation
  elements.newtaskTitleInput.value = '';
  elements.newTaskDescInput.value = '';
  elements.newTaskStatusSelect.value = 'todo'; // Reset status dropdown to default (if "todo" is default)

  // Close the modal
  toggleModal(false);
  elements.filterDiv.style.display = 'none';

  // Refresh UI to show the new task
  refreshTasksUI();
  //  Refresh the board UI
  addTaskToUI(tasks)
}


function toggleSidebar(show) {
  const sidebar = document.getElementById("side-bar-div")
  const showButton = document.getElementById("show-side-bar-btn")

  if (show) {
    sidebar.style.display = 'block'
    showButton.style.display = 'none'
  } else {
    sidebar.style.display = 'none'
    showButton.style.display = 'block'
  }
}

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme')
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled')
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editTaskStatusSelect.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn')
  const deleteTaskBtn = document.getElementById('delete-task-btn')

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.onclick = function() {
    saveTaskChanges(task.id)
  }

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.onclick = function() {
    deleteTask(task.id)
    toggleModal(false, elements.editTaskModal)
    refreshTasksUI()
  }

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = elements.editTaskTitleInput.value
  const updatedDesc = elements.editTaskDescInput.value
  const updatedStatus = elements.editTaskStatusSelect.value

  // Create an object with the updated task details
  const tasks = getTasks()
  const taskIndex = tasks.findIndex(task => task.id === taskId) // Added correct task ID
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title:  updatedTitle,
    description:  updatedDesc,
    status: updatedStatus
  }

  // Update task using a hlper functoin
  localStorage.setItem('tasks', JSON.stringify(tasks))

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal)

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

function init() {
  initializeData()
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}

document.addEventListener('DOMContentLoaded', function () {
  init(); // init is called after the DOM is fully loaded
});