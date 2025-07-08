# 🚀 Trio - A Trello-Inspired Kanban Board App 📋


### Website link 
[Trio](https://trio-j5ev.onrender.com/ "Link to trio app")

## Table of Contents

- [Introduction](#introduction)
- [Main Features](#main-features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Showcase](#showcase)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)
- [License](#license)

## Introduction

Trio is a pixel-perfect, end-to-end clone of Trello, a popular project and task management platform. Inspired by the functionality of Trello, Trio aims to provide a familiar and feature-rich experience for managing projects and tasks using a kanban board. This application offers a range of unique features in addition to Trello's core functionality, enhancing your project management experience.

## Main Features

- **Create and Manage Boards**: Use drag-and-drop functionality to effortlessly create, remove, and update lists and tasks on your boards.
- **Task Customization**: Customize tasks to the deepest level with options such as labels, due dates, members, cover images, checklists, activity logs, copying, moving, and archiving.
- **Side Menu**: Easily change the board's background using the Unsplash Photo API, filter tasks by members or labels, and access the general activity log.
- **Accessibility Features**: We've implemented a Blind Color Mode to aid users with color blindness and a voice assistant that accepts vocal commands for effortless task management.

## My Role

This was a collaborative project with 3 developers.  
**My personal contributions included:**
- Implementing the board and group layout logic
- Building the drag & drop feature
- Creating the task preview modal system
- Integrating Vuex state updates across board views

## Technologies

Trio is built using the MERN stack:

- **MongoDB**: A NoSQL database for storing data.
- **Express**: A Node.js web application framework for building the server.
- **Vue**: A JavaScript library for building the user interface.
- **Node.js**: A runtime environment for executing server-side JavaScript.
- **WebSockets**: Real-time board updates are achieved using WebSockets.
- **REST API**: Communication between the frontend and backend is facilitated using RESTful API calls.

## Getting Started

To get Trio up and running on your local machine, follow these steps for both the frontend and backend repositories:

#### Backend Setup:

1. Clone the Backend Repository:
```shell
git clone https://github.com/APerlinx/Sprint4-backend.git
```

2. Navigate to the Backend Folder & Install Dependencies:
```shell
cd Sprint4-backend
npm install
```

3. Start the Backend Server:
```shell
npm start
```
You should see a console output indicating that the server is up and running on port 3030.

#### Frontend Setup:

1. Clone the Frontend Repository:
```shell
git clone https://github.com/APerlinx/Sprint4-frontend.git
```

2. Navigate to the Frontend Folder & Install Dependencies:
```shell
cd Sprint4-frontend
npm install
```

3. Start the Frontend Application:
```shell
npm start
```

Enjoy!

## Showcase

### Homepage

The landing page in which the user can sign up / login, or press the call to action button to start demo if the are limited with time.
![Alt text](https://res.cloudinary.com/dcj5nzsix/image/upload/v1695227139/Troi-homepage_odpkqr.png)

### Workspace

The landing page in which the user can sign up / login, or press the call to action button to start demo if the are limited with time.
The workspace displays all of the user's boards, offering the ability to create new boards, switch between them, and use the built-in voice assistant for enhanced productivity.
![Home page](https://res.cloudinary.com/dcj5nzsix/image/upload/v1695227134/Trio-workspace_nkhxjz.png)


### Board

All the functionality that you have in Trello. D&D, live-updates, editing tasks to the deepest level, side-menu, editing board members and much more...
![Alt text](https://res.cloudinary.com/dcj5nzsix/image/upload/v1695227138/Trio-board_cznvw3.png)

### Task Details & Side menu

Here the user can edit their tasks and to watch it happens live, in this page and behind. Every button on the right menu opens an dynamic modal which fits the content accordingly to the pressed button.
Edit task details and witness live updates as changes are made. Dynamic modals provide detailed information on task elements.
![Alt text](https://res.cloudinary.com/dcj5nzsix/image/upload/v1695227128/Trio-edit_f77suy.png)


### Mobile Experience

Just a taste of the mobile experience. We used different mixins, conditional rendering. The layout we have built from the very first moment enabled us to make the website responsive without a lot of effort.

<p align="center">
  <img src="https://res.cloudinary.com/dcj5nzsix/image/upload/v1695227120/Trio-mobile_iirfbz.png" alt="Trio-mobile" width="auto" height="500">
</p>

## Authors
- **Alon Perlin**
- **Shay Zigdon**
- **Guy Dahan**


## Acknowledgments
We would like to express our gratitude to the Trello team for inspiring this project and to the developers of the third-party libraries that contributed to its feature set. Thank you for considering Trio for your project management needs!

## Credits
This app was developed during a sprint in the Coding Academy bootcamp. Inspired by Trello’s UX.

## License

This project is open source and available under the [MIT License](LICENSE).

