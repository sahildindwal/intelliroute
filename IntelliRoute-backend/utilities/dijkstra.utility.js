import { Location, Path } from "../models/models.js";

/**
 * Calculate the Haversine distance between two geographic coordinates
 * @param {Number} lat1 - Latitude of first point
 * @param {Number} lon1 - Longitude of first point
 * @param {Number} lat2 - Latitude of second point
 * @param {Number} lon2 - Longitude of second point
 * @returns {Number} Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Build a graph from locations and paths
 * @returns {Object} Graph with adjacency list and location map
 */
async function buildGraph() {
    const locations = await Location.find();
    const paths = await Path.find().populate("node1 node2");
    
    const graph = {};
    const locationMap = {};
    
    // Initialize graph nodes
    for (const location of locations) {
        const locId = location._id.toString();
        graph[locId] = [];
        locationMap[locId] = location;
    }
    
    // Build adjacency list with edge weights (distances)
    for (const path of paths) {
        const node1Id = path.node1._id.toString();
        const node2Id = path.node2._id.toString();
        
        // Calculate distance between connected nodes
        const distance = haversineDistance(
            path.node1.latitude,
            path.node1.longitude,
            path.node2.latitude,
            path.node2.longitude
        );
        
        // Add bidirectional edges (undirected graph)
        graph[node1Id].push({ node: node2Id, weight: distance });
        graph[node2Id].push({ node: node1Id, weight: distance });
    }
    
    return { graph, locationMap };
}

/**
 * Dijkstra's algorithm to find shortest path between two nodes
 * @param {Object} graph - Adjacency list representation of graph
 * @param {String} startId - Starting node ID
 * @param {String} endId - Ending node ID
 * @returns {Object} Object containing distance and path
 */
function dijkstra(graph, startId, endId) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const queue = [];
    
    // Initialize distances
    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[startId] = 0;
    
    // Priority queue (min-heap simulation)
    queue.push({ node: startId, distance: 0 });
    
    while (queue.length > 0) {
        // Sort queue by distance (simple approach, can be optimized with proper heap)
        queue.sort((a, b) => a.distance - b.distance);
        const { node: currentNode, distance: currentDistance } = queue.shift();
        
        if (visited.has(currentNode)) continue;
        visited.add(currentNode);
        
        // Early exit if we reached the destination
        if (currentNode === endId) break;
        
        // Check neighbors
        if (graph[currentNode]) {
            for (const neighbor of graph[currentNode]) {
                const { node: neighborNode, weight } = neighbor;
                const newDistance = currentDistance + weight;
                
                if (newDistance < distances[neighborNode]) {
                    distances[neighborNode] = newDistance;
                    previous[neighborNode] = currentNode;
                    queue.push({ node: neighborNode, distance: newDistance });
                }
            }
        }
    }
    
    // Reconstruct path
    const path = [];
    let current = endId;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    // If path doesn't start with startId, no path exists
    if (path[0] !== startId) {
        return { distance: Infinity, path: [] };
    }
    
    return { distance: distances[endId], path };
}

/**
 * Calculate shortest distance between two locations using Dijkstra's algorithm
 * @param {Object} sourceLocation - Source location object with _id
 * @param {Object} destLocation - Destination location object with _id
 * @param {Object} graph - Pre-built graph (optional, will build if not provided)
 * @returns {Number} Shortest distance in kilometers
 */
async function calculateShortestDistance(sourceLocation, destLocation, graph = null) {
    if (!sourceLocation || !destLocation) {
        return Number.MAX_SAFE_INTEGER;
    }
    
    const sourceId = sourceLocation._id.toString();
    const destId = destLocation._id.toString();
    
    // Build graph if not provided
    if (!graph) {
        const { graph: builtGraph } = await buildGraph();
        graph = builtGraph;
    }
    
    // Check if both nodes exist in graph
    if (!graph[sourceId] || !graph[destId]) {
        return Number.MAX_SAFE_INTEGER;
    }
    
    const result = dijkstra(graph, sourceId, destId);
    
    // Return large value if no path exists
    return result.distance === Infinity ? Number.MAX_SAFE_INTEGER : result.distance;
}

export { buildGraph, dijkstra, haversineDistance, calculateShortestDistance };
