import { buildGraph, dijkstra } from "../utilities/dijkstra.utility.js";

// Calculate the shortest path distance using Dijkstra's algorithm
async function calculateDistance(sourceLocation, destLocation, graph) {
    if (!sourceLocation || !destLocation || !graph) {
        return Number.MAX_SAFE_INTEGER;
    }
    
    const sourceId = sourceLocation._id.toString();
    const destId = destLocation._id.toString();
    
    // Check if both nodes exist in graph
    if (!graph[sourceId] || !graph[destId]) {
        return Number.MAX_SAFE_INTEGER;
    }
    
    const result = dijkstra(graph, sourceId, destId);
    
    // Return large value if no path exists
    return result.distance === Infinity ? Number.MAX_SAFE_INTEGER : result.distance;
}

// Build the cost matrix (ride × shuttle) using Dijkstra's algorithm
async function buildCostMatrix(rides, shuttles) {
    // Build graph once for all calculations
    const { graph } = await buildGraph();
    
    const costMatrix = [];
    for (const ride of rides) {
        const row = [];
        for (const shuttle of shuttles) {
            const distance = await calculateDistance(
                ride.sourceLocation,
                shuttle.currentLocation,
                graph
            );
            row.push(distance);
        }
        costMatrix.push(row);
    }
    
    return costMatrix;
}

// Pad a matrix to square form with large finite values (no Infinity!)
function padMatrixToSquare(matrix) {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const size = Math.max(rows, cols);
    const LARGE_COST = 1e9; // effectively "infinite" but finite

    for (let i = 0; i < rows; i++) {
        for (let j = cols; j < size; j++) {
            matrix[i].push(LARGE_COST);
        }
    }
    for (let i = rows; i < size; i++) {
        matrix.push(Array(size).fill(LARGE_COST));
    }

    return matrix;
}

/**
 * Finite-safe Hungarian Algorithm (Kuhn–Munkres)
 * Returns optimal assignments: [ [row, col], ... ]
 */
function hungarianAlgorithm(costMatrix) {
    const n = costMatrix.length;
    const m = costMatrix[0].length;
    const size = Math.max(n, m);

    // Sanity check for non-finite values
    for (const row of costMatrix) {
        for (const val of row) {
            if (!Number.isFinite(val)) {
                throw new Error("Cost matrix contains non-finite values!");
            }
        }
    }

    // Extend costMatrix to be size x size (safety)
    const matrix = padMatrixToSquare(costMatrix);

    const u = Array(size + 1).fill(0);
    const v = Array(size + 1).fill(0);
    const p = Array(size + 1).fill(0);
    const way = Array(size + 1).fill(0);

    for (let i = 1; i <= size; i++) {
        p[0] = i;
        let j0 = 0;
        const minv = Array(size + 1).fill(Number.MAX_SAFE_INTEGER);
        const used = Array(size + 1).fill(false);

        do {
            used[j0] = true;
            const i0 = p[j0];
            let delta = Number.MAX_SAFE_INTEGER;
            let j1 = 0;

            for (let j = 1; j <= size; j++) {
                if (used[j]) continue;

                const cur = matrix[i0 - 1][j - 1] - u[i0] - v[j];
                if (cur < minv[j]) {
                    minv[j] = cur;
                    way[j] = j0;
                }
                if (minv[j] < delta) {
                    delta = minv[j];
                    j1 = j;
                }
            }

            for (let j = 0; j <= size; j++) {
                if (used[j]) {
                    u[p[j]] += delta;
                    v[j] -= delta;
                } else {
                    minv[j] -= delta;
                }
            }

            j0 = j1;
        } while (p[j0] !== 0 && isFinite(j0)); // ensure break condition

        // Backtrack augmenting path
        do {
            const j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0 !== 0);
    }

    // Extract valid assignments
    const assignment = [];
    for (let j = 1; j <= size; j++) {
        if (p[j] && p[j] - 1 < n && j - 1 < m) {
            assignment.push([p[j] - 1, j - 1]);
        }
    }

    return assignment;
}

export {
    calculateDistance,
    buildCostMatrix,
    padMatrixToSquare,
    hungarianAlgorithm,
};
