# Smart Campus Commuting - Frontend

An intelligent, interactive web application for campus transportation management built with **React** and **Vite**. Features real-time map visualization, algorithm-powered routing, and seamless ride request management.

## 📋 Table of Contents

- [Overview](#overview)
- [Live Deployment](#live-deployment)
- [Algorithm Visualization](#algorithm-visualization)
  - [Interactive Dijkstra Visualization](#interactive-dijkstra-visualization)
  - [Path Animation](#path-animation)
  - [Real-time Distance Calculation](#real-time-distance-calculation)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Component Architecture](#component-architecture)
- [Routing Structure](#routing-structure)
- [State Management](#state-management)
- [Styling Approach](#styling-approach)
- [Contributing](#contributing)

## 🎯 Overview

The Smart Campus Commuting Frontend is a modern React application that provides an intuitive interface for students and administrators to manage campus transportation. The application visualizes complex algorithms in real-time, making abstract concepts like Dijkstra's shortest path tangible and interactive.

**Key Highlights:**
- 🗺️ **Interactive Leaflet Maps** - Click-to-select locations, animated route visualization
- 🎨 **Algorithm Showcase** - Educational tabs explaining Dijkstra, Hungarian, and Haversine
- 📱 **Responsive Design** - Mobile-first approach with CSS modules
- 🔐 **Role-Based Access** - Different interfaces for students and admins
- ⚡ **Real-Time Updates** - Instant path calculation and distance display
- 🎭 **Smooth Animations** - Gradient paths, hover effects, and transitions

## 🌐 Live Deployment

**Frontend Application**: `https://intelliroute.mayankrajtools.me/`

**Backend API**: `https://api-intelliroute.mayankrajtools.me/api`

**Status**: ✅ Live and Active

### Quick Demo

Visit the live site and explore:
- **Home Page**: Algorithm explanations with interactive tabs
- **Campus Map**: Click on locations to see connections
- **Ride Request**: Interactive map with click-to-select and animated paths
- **Admin Panel**: Location, path, and shuttle management

## 🧮 Algorithm Visualization

The frontend brings backend algorithms to life through interactive visualizations.

---

### 1️⃣ Interactive Dijkstra Visualization

**Location**: `src/components/Map/RideRequestMap.jsx`, `src/pages/Home.jsx`

The application visualizes Dijkstra's shortest path algorithm in two ways:

#### Real-Time Path Calculation

```javascript
// When user selects source and destination
useEffect(() => {
  if (source && destination && source !== destination) {
    // Call backend Dijkstra endpoint
    fetch('/api/locations/shortest-path', {
      method: 'POST',
      body: JSON.stringify({ sourceId: source, destinationId: destination })
    })
    .then(res => res.json())
    .then(data => {
      // Render animated path on map
      setPathInfo(data.data);
    });
  }
}, [source, destination]);
```

#### Visual Components

**Path Rendering:**
- Blue polyline for complete graph
- Green animated gradient for shortest path
- Step-by-step location list with numbered badges

**Interactive Features:**
- Click map to select source (blue marker)
- Click again to select destination (red marker)
- Automatic path calculation
- Distance display: "📏 Total Distance: **2500.00 m**"

**Animation Effect:**
```css
/* Animated dashed line flowing along path */
.animatedPath {
  stroke-dasharray: 20 20;
  animation: dash 2s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -40;
  }
}
```

---

### 2️⃣ Path Animation

**Location**: `src/components/Map/RideRequestMap.jsx`

**Technique**: CSS stroke-dashoffset animation

```javascript
function AnimatedPath({ pathDetails }) {
  const [dashOffset, setDashOffset] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDashOffset(prev => (prev - 5) % 40);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Polyline
      positions={coordinates}
      pathOptions={{
        color: '#10b981',
        weight: 4,
        dashArray: '10, 10',
        dashOffset: dashOffset
      }}
    />
  );
}
```

**Visual Effect:**
- Green gradient flowing from source to destination
- Creates illusion of movement along the path
- Helps users understand the route direction

---

### 3️⃣ Real-time Distance Calculation

**Display Logic:**

```javascript
// Distance displayed in meters with 2 decimal precision
{pathInfo && (
  <div className={styles.distanceDisplay}>
    📏 Total Distance: <strong>{pathInfo.distanceInMeters} m</strong>
  </div>
)}
```

**Path Step Visualization:**
```javascript
{pathInfo.pathDetails.map((location, index) => (
  <div key={location._id} className={styles.pathStep}>
    <span className={styles.stepNumber}>{index + 1}</span>
    <span className={styles.stepName}>
      {location.name} ({location.code})
    </span>
    {index < pathInfo.pathDetails.length - 1 && (
      <span className={styles.arrow}>↓</span>
    )}
  </div>
))}
```

**Features:**
- Numbered steps showing exact route sequence
- Location names and codes for clarity
- Visual arrows indicating direction
- Hover effects for interactivity

---

### 4️⃣ Algorithm Education - Home Page

**Location**: `src/pages/Home.jsx`

The home page features an **Algorithm Showcase** with three tabs:

#### Tab 1: Dijkstra's Algorithm
```javascript
{
  icon: <FaRoute />,
  name: "Dijkstra's Algorithm",
  badge: "Graph Traversal • O(V²)",
  purpose: "Finds shortest path between any two campus locations",
  uses: [
    "Calculates optimal routes when students request rides",
    "Determines shortest distance between pickup and destination",
    "Powers the path visualization feature"
  ],
  code: `function dijkstra(graph, startId, endId) { ... }`
}
```

#### Tab 2: Hungarian Algorithm
```javascript
{
  icon: <TbMathFunction />,
  name: "Hungarian Algorithm",
  badge: "Assignment Problem • O(n³)",
  purpose: "Finds optimal matching between ride requests and shuttles",
  uses: [
    "Matches pending ride requests to available shuttles",
    "Minimizes total distance shuttles need to travel",
    "Ensures fair distribution of rides"
  ],
  code: `function hungarianAlgorithm(costMatrix) { ... }`
}
```

#### Tab 3: Haversine Formula
```javascript
{
  icon: <FaChartLine />,
  name: "Haversine Formula",
  badge: "Geospatial • O(1)",
  purpose: "Calculates great-circle distance between GPS coordinates",
  uses: [
    "Computes actual distances between campus locations",
    "Builds weighted edges in graph for Dijkstra",
    "Displays accurate distance metrics in meters"
  ],
  code: `function haversineDistance(lat1, lon1, lat2, lon2) { ... }`
}
```

**Interactive Elements:**
- Click tabs to switch between algorithms
- Syntax-highlighted code blocks
- Gradient animations on hover
- Badge showing time complexity

---

## ✨ Features

### For Students
- 🏠 **Interactive Home**: Algorithm education with code examples
- 🚗 **Request Rides**: Visual map-based source/destination selection
- 📊 **View History**: Track all past ride requests
- 🗺️ **Explore Campus**: Interactive map with all locations and paths
- 👤 **Profile Management**: Update personal information

### For Administrators
- 📍 **Location Management**: Add, edit, delete campus locations
- 🛤️ **Path Management**: Create and delete connections between locations
- 🚐 **Shuttle Management**: Add and manage shuttle fleet
- 🔄 **Ride Matching**: Execute Hungarian algorithm for assignments
- 📈 **View All Rides**: Monitor all ride requests and statuses

### Universal Features
- 🔐 **Secure Authentication**: JWT-based login with HTTP-only cookies
- 🎨 **Modern UI**: Glassmorphism, gradients, smooth animations
- 📱 **Fully Responsive**: Mobile, tablet, desktop optimized
- 🌙 **Accessible**: Proper ARIA labels and keyboard navigation
- ⚡ **Fast Loading**: Vite's lightning-fast HMR and optimized builds

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI component library |
| **Vite** | 6.0.1 | Build tool and dev server |
| **React Router** | 7.0.2 | Client-side routing |
| **Leaflet** | 1.9.4 | Interactive maps |
| **React-Leaflet** | 4.2.1 | React bindings for Leaflet |
| **React Icons** | 5.3.0 | Icon library (FontAwesome, Material, etc.) |
| **CSS Modules** | - | Scoped styling |
| **ESLint** | 9.17.0 | Code linting |

### Why These Technologies?

**React**: Component-based architecture perfect for reusable UI elements
**Vite**: 10-100x faster than Create React App, optimal for development
**Leaflet**: Open-source, lightweight alternative to Google Maps
**CSS Modules**: Scoped styles prevent conflicts, better than plain CSS
**React Router**: Declarative routing with nested routes support

## 📁 Project Structure

```
Frontend/
├── public/                         # Static Assets
│   ├── backtrack.png              # Back button icon
│   └── [other static files]
│
├── src/                            # Source Code
│   ├── main.jsx                   # Application entry point, routing config
│   ├── App.jsx                    # Root component, header + outlet
│   ├── App.css                    # Global app styles, overflow controls
│   ├── index.css                  # Global styles, Leaflet CSS import
│   ├── GlobalContext.jsx          # Context API for user state
│   │
│   ├── assets/                    # Images, fonts, media files
│   │
│   ├── components/                # Reusable Components
│   │   ├── Header.jsx             # Navigation bar with role-based links
│   │   ├── Header.module.css      # Header styling with glassmorphism
│   │   ├── Footer.jsx             # Footer component
│   │   ├── PopUp.jsx              # Reusable modal/popup
│   │   ├── AutoRedirect.jsx       # Conditional navigation component
│   │   ├── ProtectedRoute.jsx    # Auth guard for routes
│   │   ├── CustomDropdown.jsx     # Location selector dropdown
│   │   │
│   │   ├── Locations/             # Location Management Components
│   │   │   ├── AddLocation.jsx    # Form to add new locations
│   │   │   ├── LocationList.jsx   # Display all locations (admin)
│   │   │   ├── ViewLocations.jsx  # View locations with classification
│   │   │   ├── ViewLocationsStudent.jsx  # Student view of locations
│   │   │   ├── AddPath.jsx        # Form to create path connections
│   │   │   ├── ViewPath.jsx       # Admin view paths with map
│   │   │   ├── ViewPathStudent.jsx  # Student view paths with map
│   │   │   └── DeletePath.jsx     # Delete path connections
│   │   │
│   │   ├── Map/                   # Map Visualization Components
│   │   │   ├── CampusMap.jsx      # Basic campus map with locations
│   │   │   ├── PathViewMap.jsx    # Map showing selected location paths
│   │   │   └── RideRequestMap.jsx # Interactive map with click-to-select
│   │   │                          # + animated shortest path visualization
│   │   │
│   │   ├── Rides/                 # Ride Request Components
│   │   │   ├── CreateRide.jsx     # Request ride with map interface
│   │   │   ├── ViewAllRides.jsx   # Admin view of all rides
│   │   │   └── ViewRideHistory.jsx  # Student ride history
│   │   │
│   │   └── Shuttles/              # Shuttle Management Components
│   │       ├── AddShuttle.jsx     # Form to add shuttles
│   │       └── ShuttleList.jsx    # List all shuttles
│   │
│   ├── pages/                     # Page Components (Route Containers)
│   │   ├── Home.jsx               # Landing page with algorithm showcase
│   │   ├── Login.jsx              # User login form
│   │   ├── Register.jsx           # User registration form
│   │   ├── Profile.jsx            # User profile view
│   │   ├── UpdateProfile.jsx      # Edit profile form
│   │   ├── ChangePassword.jsx     # Password change form
│   │   ├── ServiceLocation.jsx    # Admin location service container
│   │   ├── StudentLocationService.jsx  # Student location service
│   │   ├── ShuttleService.jsx     # Admin shuttle service container
│   │   └── RideRequestService.jsx # Ride request service container
│   │
│   └── utilities/                 # Helper Functions
│       └── cookie.utility.js      # Cookie read/write operations
│
├── .env                           # Environment variables (not in git)
├── .gitignore                     # Git ignore rules
├── eslint.config.js               # ESLint configuration
├── vite.config.js                 # Vite build configuration
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

### 📂 Detailed Component Breakdown

#### **Map Components** (`src/components/Map/`)

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **CampusMap.jsx** | Display all campus locations and paths | Green markers (locations), Orange (turns), Blue polylines (paths), Auto-zoom to fit all markers |
| **PathViewMap.jsx** | Show connections for selected location | Red marker for selected, Red dashed lines for connections, Highlights connected nodes |
| **RideRequestMap.jsx** | Interactive ride request interface | Click-to-select source/destination, Animated shortest path (green gradient), Distance display, Mode indicator sync |

#### **Pages** (`src/pages/`)

| Page | Route | Purpose | Access |
|------|-------|---------|--------|
| **Home.jsx** | `/` | Algorithm showcase + quick actions | Public + Logged-in |
| **Login.jsx** | `/login` | User authentication | Public only |
| **Register.jsx** | `/signup` | New user registration | Public only |
| **Profile.jsx** | `/profile` | View user information | Protected |
| **ServiceLocation.jsx** | `/locations/*` | Location management hub | Admin only |
| **ShuttleService.jsx** | `/shuttles/*` | Shuttle management hub | Admin only |
| **RideRequestService.jsx** | `/ride-request/*` or `/my-rides/*` | Ride request interface | Role-based |

#### **Key Component Features**

**RideRequestMap.jsx** (Most Complex):
```javascript
// Features:
- Click mode state (source/destination)
- Nearest location detection on click
- Animated path with dashOffset
- Distance calculation display
- Marker color coding (blue/red)
- State synchronization with parent

// Props:
- locations, turns: Array of campus nodes
- sourceId, destinationId: Selected locations
- onSourceSelect, onDestinationSelect: Callbacks
- pathInfo: Shortest path data from backend
- onClickModeChange: Mode state sync
```

**Home.jsx** (Educational):
```javascript
// Features:
- Algorithm tab switching
- Syntax-highlighted code blocks
- Animated transitions
- Role-based quick actions
- Responsive grid layout

// State:
- activeTab: Current algorithm being displayed
- isLoggedIn: Show different content
- isAdmin: Different action cards
```

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| **Node.js** | v14.x or higher | `node --version` |
| **npm** | v6.x or higher | `npm --version` |
| **Git** | Latest | `git --version` |

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-campus-commuting.git

# Navigate to frontend directory
cd smart-campus-commuting/Frontend
```

#### 2. Install Dependencies

```bash
npm install
```

This installs:
- React and React DOM
- Vite and plugins
- React Router
- Leaflet and React-Leaflet
- React Icons
- ESLint and related packages

**Installation Time**: ~2-3 minutes depending on internet speed

#### 3. Configure Environment Variables

Create a `.env` file in the Frontend directory:

```bash
# Create .env file
touch .env

# Or on Windows
type nul > .env
```

Add the following variables:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000

# For production, use your deployed backend URL:
# VITE_BACKEND_URL=https://your-backend-url.com
```

**Important**: All Vite environment variables must start with `VITE_`

#### 4. Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
VITE v6.0.1  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help
```

#### 5. Open in Browser

```bash
# Automatically opens in default browser
# Or manually navigate to:
http://localhost:5173
```

#### 6. Verify Setup

You should see:
- ✅ Home page with "IntelliRoute" title
- ✅ Algorithm showcase with three tabs
- ✅ Login/Sign Up buttons (if not logged in)
- ✅ No console errors

### 🔧 Troubleshooting

**Problem: Port 5173 already in use**
```bash
# Solution: Change port in vite.config.js
export default defineConfig({
  server: {
    port: 3000 // Use different port
  }
})
```

**Problem: Cannot connect to backend**
```bash
# Check:
1. Backend server is running (http://localhost:5000)
2. VITE_BACKEND_URL in .env is correct
3. No CORS issues (backend allows frontend origin)
```

**Problem: Leaflet map not showing**
```bash
# Solution: Ensure Leaflet CSS is imported
# Check src/index.css has:
@import 'leaflet/dist/leaflet.css';
```

**Problem: Module not found errors**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## ⚙️ Environment Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_BACKEND_URL` | Backend API base URL | Yes | - |

### Development vs Production

**Development** (`.env.development`):
```env
VITE_BACKEND_URL=http://localhost:5000
```

**Production** (`.env.production`):
```env
VITE_BACKEND_URL=https://your-backend-url.com
```

Vite automatically loads the correct file based on mode.

### CORS Configuration

Ensure backend allows your frontend origin:
```javascript
// Backend server.js
app.use(cors({
  origin: 'http://localhost:5173', // Dev
  // origin: 'https://your-frontend-url.com', // Prod
  credentials: true
}));
```

## 📜 Available Scripts

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run dev` | Start development server with HMR | Local development |
| `npm run build` | Build for production | Deployment preparation |
| `npm run preview` | Preview production build locally | Test before deployment |
| `npm run lint` | Run ESLint on source files | Code quality check |

### Detailed Script Usage

**Development:**
```bash
npm run dev
# - Starts Vite dev server on port 5173
# - Hot Module Replacement (HMR) enabled
# - Fast refresh for React components
# - Source maps for debugging
```

**Production Build:**
```bash
npm run build
# - Creates optimized bundle in /dist folder
# - Minifies JavaScript and CSS
# - Tree-shaking removes unused code
# - Generates source maps
# - Output: dist/ folder ready for deployment
```

**Preview Build:**
```bash
npm run preview
# - Serves the /dist folder locally
# - Test production build before deployment
# - Runs on port 4173 by default
```

**Linting:**
```bash
npm run lint
# - Checks code style and potential errors
# - Uses ESLint config from eslint.config.js
# - Run before committing code
```

### Build Output

After `npm run build`, you'll see:
```
dist/
├── assets/
│   ├── index-[hash].js      # Bundled JavaScript
│   ├── index-[hash].css     # Bundled CSS
│   └── [other assets]
├── index.html               # Entry HTML
└── [other static files]
```

## 🏗️ Component Architecture

### Design Patterns Used

**Container/Presentational Pattern:**
- **Containers**: Pages (ServiceLocation, RideRequestService)
- **Presentational**: Components (CreateRide, LocationList)

**Higher-Order Components:**
- `ProtectedRoute`: Wraps routes with authentication logic

**Custom Hooks:**
- Not explicitly used, but good for future: `useAuth`, `useMap`

**Context API:**
- `GlobalContext`: User state management across app

### Component Communication

```
App (Root)
 ├─ GlobalContext.Provider (State)
 ├─ Header (Consumes Context)
 └─ Outlet (Route Container)
     ├─ Home (Public/Protected)
     ├─ Login (Public)
     └─ ServiceLocation (Protected Admin)
         └─ Nested Outlets
             ├─ AddLocation
             ├─ ViewPath
             └─ DeletePath
```

### State Flow

```
1. User logs in
   ↓
2. JWT stored in HTTP-only cookie
   ↓
3. ProtectedRoute checks authentication
   ↓
4. GlobalContext updates user state
   ↓
5. Header re-renders with user info
   ↓
6. Components access context via useContext
```

## 🛣️ Routing Structure

```javascript
/ (Home - Public + Logged-in)
├─ /login (Public only)
├─ /signup (Public only)
├─ /profile (Protected)
├─ /change-password (Protected)
├─ /update-profile (Protected)
│
├─ /locations (Admin only)
│   ├─ /locations/add
│   ├─ /locations/view
│   ├─ /locations/add-path
│   ├─ /locations/view-path
│   └─ /locations/delete-path
│
├─ /shuttles (Admin only)
│   ├─ /shuttles/add
│   └─ /shuttles/view
│
├─ /ride-request (Admin only)
│   ├─ /ride-request/request
│   └─ /ride-request/view
│
├─ /my-rides (Student)
│   ├─ /my-rides/request
│   └─ /my-rides/history
│
├─ /view-locations (Student)
│   ├─ /view-locations/view
│   └─ /view-locations/view-path
│
└─ /campus-map (Protected)
```

## 🎨 Styling Approach

### CSS Modules

**Benefits:**
- Scoped class names (no conflicts)
- Clear component-style relationship
- Better than inline styles (reusability)
- Tree-shakeable (unused styles removed)

**Usage:**
```javascript
// Component.jsx
import styles from './Component.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

### Design System

**Colors:**
- Primary: `#0077ff` (Blue)
- Secondary: `#00c6ff` (Cyan)
- Accent: `#ff00e1` (Magenta)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)

**Typography:**
- Font Family: System fonts (San Francisco, Segoe UI, Roboto)
- Headings: 700-800 weight
- Body: 400-600 weight

**Effects:**
- Glassmorphism: `backdrop-filter: blur(20px)`
- Gradients: `linear-gradient(135deg, ...)`
- Shadows: `box-shadow: 0 4px 20px rgba(...)`
- Transitions: `cubic-bezier(0.4, 0, 0.2, 1)`

**Responsive Breakpoints:**
```css
@media (max-width: 1200px) { /* Tablet landscape */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile landscape */ }
@media (max-width: 480px)  { /* Mobile portrait */ }
```

## 🤝 Contributing

We welcome contributions to enhance the frontend!

### Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/smart-campus-commuting.git
   cd smart-campus-commuting/Frontend
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-map-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Use CSS Modules for new components
   - Add PropTypes or TypeScript types (if migrating)

4. **Test Locally**
   ```bash
   npm run dev
   npm run lint
   npm run build  # Ensure build succeeds
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new map feature"
   git push origin feature/new-map-feature
   ```

6. **Open Pull Request**

### Coding Standards

**React Components:**
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components under 300 lines
- Use meaningful prop names

**Styling:**
- Always use CSS Modules
- Follow BEM-like naming in CSS
- Mobile-first responsive design
- Consistent spacing (8px grid)

**File Organization:**
- Group by feature, not by type
- Co-locate related files
- Use index.js for cleaner imports

### Areas for Contribution

🎯 **High Priority:**
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Implement route optimization visualization
- [ ] Add real-time shuttle tracking on map
- [ ] Progressive Web App (PWA) features
- [ ] Dark mode support

🔧 **Enhancements:**
- [ ] Migrate to TypeScript
- [ ] Add Storybook for component documentation
- [ ] Implement lazy loading for routes
- [ ] Add error boundaries
- [ ] Improve accessibility (WCAG 2.1 AA)

📚 **Documentation:**
- [ ] Component usage examples
- [ ] Storybook stories
- [ ] Contribution guide
- [ ] Design system documentation

### Questions or Issues?

- 📧 Email: your-email@example.com
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

---

## 📄 License

ISC License - free for educational use

## 👨‍💻 Author

**Mayank Raj**

## 🙏 Acknowledgments

- React team for excellent documentation
- Leaflet for open-source mapping library
- Vite team for blazing-fast dev experience
- React Icons for comprehensive icon library

---

**⭐ Star this repo if you found it helpful!**

**Built with ❤️ and algorithms for Smart Campus Transportation**