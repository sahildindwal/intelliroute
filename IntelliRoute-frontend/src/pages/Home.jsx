import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { GlobalContext } from "../GlobalContext";
import styles from "./Home.module.css";
import { FaMapMarkerAlt, FaHistory, FaBus, FaCar, FaRoute, FaChartLine } from "react-icons/fa";
import { MdAdminPanelSettings, MdRoute, MdMap } from "react-icons/md";
import { TbMathFunction, TbNetwork } from "react-icons/tb";
import { SiCodeforces } from "react-icons/si";

export default function Home() {
    const { state } = useContext(GlobalContext);
    const isLoggedIn = !!state.user;
    const isAdmin = state.user?.role === "admin";
    const [activeTab, setActiveTab] = useState('dijkstra');

    const algorithms = {
        dijkstra: {
            icon: <FaRoute />,
            name: "Dijkstra's Algorithm",
            badge: "Graph Traversal • O(V²)",
            purpose: "Finds the shortest path between any two campus locations by traversing the weighted graph of connected nodes.",
            uses: [
                "Calculates optimal routes when students request rides",
                "Determines shortest distance between pickup and destination",
                "Powers the path visualization feature",
                "Used by Hungarian algorithm to build cost matrix"
            ],
            code: `function dijkstra(graph, startId, endId) {
  const distances = {}, previous = {}, visited = new Set();
  for (const node in graph) distances[node] = Infinity;
  distances[startId] = 0;
  const queue = [{ node: startId, distance: 0 }];
  
  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const { node: current } = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    
    for (const { node, weight } of graph[current]) {
      const newDist = distances[current] + weight;
      if (newDist < distances[node]) {
        distances[node] = newDist;
        previous[node] = current;
        queue.push({ node, distance: newDist });
      }
    }
  }
  return { distance: distances[endId], path };
}`
        },
        hungarian: {
            icon: <TbMathFunction />,
            name: "Hungarian Algorithm",
            badge: "Assignment Problem • O(n³)",
            purpose: "Solves the assignment problem by finding optimal matching between ride requests and shuttles, minimizing total travel distance.",
            uses: [
                "Matches pending ride requests to available shuttles",
                "Minimizes total distance shuttles need to travel",
                "Ensures fair distribution of rides across shuttles",
                "Executed when admin triggers matching process"
            ],
            code: `function hungarianAlgorithm(costMatrix) {
  const size = Math.max(costMatrix.length, costMatrix[0].length);
  const u = Array(size + 1).fill(0);
  const v = Array(size + 1).fill(0);
  const p = Array(size + 1).fill(0);
  
  for (let i = 1; i <= size; i++) {
    const minv = Array(size + 1).fill(MAX);
    const used = Array(size + 1).fill(false);
    let j0 = 0; p[0] = i;
    
    do {
      used[j0] = true;
      const i0 = p[j0];
      for (let j = 1; j <= size; j++) {
        if (!used[j]) {
          const cur = costMatrix[i0-1][j-1] - u[i0] - v[j];
          if (cur < minv[j]) minv[j] = cur;
        }
      }
    } while (p[j0] !== 0);
  }
  return assignment;
}`
        },
        haversine: {
            icon: <FaChartLine />,
            name: "Haversine Formula",
            badge: "Geospatial • O(1)",
            purpose: "Calculates great-circle distance between two points on Earth's surface using latitude and longitude coordinates.",
            uses: [
                "Computes actual distances between campus locations",
                "Builds weighted edges in graph for Dijkstra",
                "Displays accurate distance metrics in meters",
                "Powers cost matrix calculation for assignments"
            ],
            code: `function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Usage:
const dist = haversineDistance(
  loc1.lat, loc1.lon, loc2.lat, loc2.lon
);
graph[node1].push({ node: node2, weight: dist });`
        }
    };

    const currentAlgo = algorithms[activeTab];

    return (
        <div className={styles.homePage}>
            <div className={styles.compactHero}>
                <h1 className={styles.title}>
                    Welcome to IntelliRoute
                    {state.user && <span className={styles.userName}>, {state.userName}</span>}
                </h1>
                <p className={styles.subtitle}>
                    {!isLoggedIn ? "Smart Campus Commuting System" : isAdmin ? "Manage campus transportation" : "Smart campus commuting"}
                </p>
                {!isLoggedIn && (
                    <div className={styles.heroActions}>
                        <Link to="/login" className={styles.btnPrimary}>Login</Link>
                        <Link to="/signup" className={styles.btnSecondary}>Sign Up</Link>
                    </div>
                )}
            </div>

            <div className={styles.contentGrid}>
                {/* Left: Algorithm Showcase */}
                <div className={styles.algoSection}>
                    <h2 className={styles.sectionTitle}>Algorithm Showcase</h2>
                    
                    <div className={styles.tabContainer}>
                        {Object.entries(algorithms).map(([key, algo]) => (
                            <button
                                key={key}
                                className={`${styles.tab} ${activeTab === key ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(key)}
                            >
                                <span className={styles.tabIcon}>{algo.icon}</span>
                                <span className={styles.tabName}>{algo.name.split("'")[0]}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.algoShowcase}>
                        <div className={styles.algoHeader}>
                            <div className={styles.algoIconBig}>{currentAlgo.icon}</div>
                            <div className={styles.algoTitle}>
                                <h3>{currentAlgo.name}</h3>
                                <span className={styles.complexityBadge}>{currentAlgo.badge}</span>
                            </div>
                        </div>

                        <div className={styles.algoBody}>
                            <div className={styles.algoDetails}>
                                <div className={styles.purposeSection}>
                                    <h4>Purpose</h4>
                                    <p>{currentAlgo.purpose}</p>
                                </div>
                                <div className={styles.usageSection}>
                                    <h4>Application</h4>
                                    <div className={styles.usageList}>
                                        {currentAlgo.uses.map((use, idx) => (
                                            <div key={idx} className={styles.usageItem}>
                                                <span className={styles.usageBullet}>✓</span>
                                                <span>{use}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.codeSection}>
                                <div className={styles.codeWrapper}>
                                    <div className={styles.codeTopBar}>
                                        <div className={styles.codeDots}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <span className={styles.codeFilename}>{activeTab}.js</span>
                                        <div className={styles.codeSpacer}></div>
                                    </div>
                                    <pre className={styles.codeContent}><code>{currentAlgo.code}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions */}
                <div className={styles.actionsSection}>
                    <h2 className={styles.sectionTitle}>{isLoggedIn ? "Quick Actions" : "Features"}</h2>
                    <div className={styles.actionGrid}>
                        {!isLoggedIn ? (
                            <>
                                <div className={styles.featureCard}>
                                    <FaRoute className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Smart Routing</h3>
                                        <p>AI-powered path optimization</p>
                                    </div>
                                </div>
                                <div className={styles.featureCard}>
                                    <FaBus className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Shuttle Service</h3>
                                        <p>Efficient campus transportation</p>
                                    </div>
                                </div>
                                <div className={styles.featureCard}>
                                    <FaMapMarkerAlt className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Interactive Maps</h3>
                                        <p>Real-time location tracking</p>
                                    </div>
                                </div>
                                <div className={styles.featureCard}>
                                    <TbMathFunction className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Optimal Matching</h3>
                                        <p>Hungarian algorithm efficiency</p>
                                    </div>
                                </div>
                                <div className={styles.featureCard}>
                                    <FaChartLine className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Distance Calculation</h3>
                                        <p>Precise geospatial metrics</p>
                                    </div>
                                </div>
                                <div className={styles.welcomeCard}>
                                    <h3>Get Started</h3>
                                    <p>Login or sign up to access the full system</p>
                                    <div className={styles.welcomeActions}>
                                        <Link to="/login" className={styles.btnLogin}>Login</Link>
                                        <Link to="/signup" className={styles.btnSignup}>Sign Up</Link>
                                    </div>
                                </div>
                            </>
                        ) : isAdmin ? (
                            <>
                                <Link to="/locations" className={styles.actionCard}>
                                    <FaMapMarkerAlt className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Locations</h3>
                                        <p>Manage campus locations</p>
                                    </div>
                                </Link>
                                <Link to="/shuttles" className={styles.actionCard}>
                                    <FaBus className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Shuttles</h3>
                                        <p>Manage shuttle fleet</p>
                                    </div>
                                </Link>
                                <Link to="/ride-request" className={styles.actionCard}>
                                    <MdAdminPanelSettings className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Manage Rides</h3>
                                        <p>Execute matching</p>
                                    </div>
                                </Link>
                                <Link to="/campus-map" className={styles.actionCard}>
                                    <MdMap className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Campus Map</h3>
                                        <p>View all paths</p>
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/my-rides/request" className={styles.actionCard}>
                                    <FaCar className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Request Ride</h3>
                                        <p>Book shuttle</p>
                                    </div>
                                </Link>
                                <Link to="/my-rides/history" className={styles.actionCard}>
                                    <FaHistory className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>History</h3>
                                        <p>View rides</p>
                                    </div>
                                </Link>
                                <Link to="/view-locations/view" className={styles.actionCard}>
                                    <FaMapMarkerAlt className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Locations</h3>
                                        <p>Browse campus</p>
                                    </div>
                                </Link>
                                <Link to="/campus-map" className={styles.actionCard}>
                                    <MdMap className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Campus Map</h3>
                                        <p>View paths</p>
                                    </div>
                                </Link>
                                <Link to="/view-locations/view-path" className={styles.actionCard}>
                                    <MdRoute className={styles.actionIcon} />
                                    <div className={styles.actionText}>
                                        <h3>Routes</h3>
                                        <p>Explore paths</p>
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
