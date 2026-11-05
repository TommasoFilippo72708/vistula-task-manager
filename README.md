# Task Manager

**Course:** Team Project – IT  
**Student ID:** 72708  
**GitHub:** [TommasoFilippo72708](https://github.com/TommasoFilippo72708)

## Project Description

Task Manager is a simple web application that allows users to manage their daily tasks.

The application uses HTML, CSS and JavaScript for the frontend and Supabase as its database and REST API.

## Technologies

- HTML5
- CSS3
- JavaScript
- Supabase (PostgreSQL and REST API)
- Git and GitHub
- GitHub Pages

## Features

- Display all tasks
- Create new tasks
- Edit existing tasks
- Mark tasks as completed or incomplete
- Delete tasks
- Store tasks permanently in Supabase
- Display error and status messages

## Database

The application uses a Supabase table named `tasks`.

| Column | Type |
|---|---|
| id | BIGINT (Primary Key) |
| title | TEXT |
| description | TEXT |
| completed | BOOLEAN |

## Project Structure

- `index.html` – Main application page
- `app.js` – Application logic and Supabase communication
- `style.css` – Application styling
- `config.json` – Public Supabase configuration

## Running the Project

Open `index.html` in a browser or use a local development server.

The application requires an active Supabase project and a correctly configured `config.json` file.

## Deployment

The application is published using GitHub Pages.

**Application URL:**  
https://tommasofilippo72708.github.io/vistula-task-manager/

## Team Collaboration

This project includes a GitHub Pull Request collaboration exercise.

The contributor page and contributor information file will be added by another student through a Pull Request.

## Author

Tommaso Filippo  
Student ID: 72708  
Vistula University