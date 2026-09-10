# IntelliRoute — Smart Campus Transportation System

IntelliRoute is a full-stack smart campus transportation management system designed to help students request rides between campus locations while enabling administrators to efficiently manage locations, routes, shuttles, and ride assignments.

The system combines **React, Node.js, Express, MongoDB, and algorithmic route optimization** to provide an interactive and intelligent campus commuting experience.

### Key Features

* 🗺️ **Interactive Campus Maps** using Leaflet
* 🚗 **Student Ride Requests** with source and destination selection
* 🛣️ **Shortest Path Calculation** using Dijkstra's Algorithm
* 🚐 **Automatic Ride-Shuttle Matching** using the Hungarian Algorithm
* 📍 **Campus Location & Path Management**
* 👥 **Student and Admin Role-Based Access**
* 🔐 **JWT Authentication** with HTTP-only cookies
* 👤 **User Profile & Session Management**
* 📊 **Ride History and Ride Status Tracking**
* 📏 **Distance Calculation** using the Haversine Formula
* 🎨 **Responsive React Interface** with CSS Modules

### Algorithms

**Dijkstra's Algorithm** is used to find the shortest route between campus locations. The campus is represented as a weighted graph, where locations are nodes and paths are edges. Edge weights are calculated using geographical distances.

**Hungarian Algorithm** is used to optimally assign pending ride requests to available shuttles while minimizing the total travel distance.

**Haversine Formula** calculates geographical distances between latitude and longitude coordinates and is used to determine the weights of graph edges.

### Technology Stack

**Frontend**

* React
* Vite
* React Router
* React Leaflet
* Leaflet
* React Icons
* CSS Modules

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* CORS
* Cookie Parser

### Project Architecture

The project is divided into two main applications:

* `IntelliRoute-frontend` — React-based user interface, maps, ride requests, profiles, and admin dashboard.
* `IntelliRoute-backend` — REST API, authentication, database models, routing algorithms, ride management, shuttle management, and matching logic.

Overall, IntelliRoute demonstrates how **graph algorithms, optimization algorithms, geospatial calculations, and full-stack web development** can be combined to solve a real-world campus transportation problem.
