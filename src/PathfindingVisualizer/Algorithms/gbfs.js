import { getUnvisitedNeighbors } from "./Dijkstra";
import TinyQueue from "tinyqueue";

export function greedyBestFirstSearch(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const queue = new TinyQueue([], (a, b) => a.heuristic - b.heuristic);

  startNode.heuristic = manhattanDistance(startNode, finishNode);
  queue.push(startNode);

  while (queue.length > 0) {
    const current = queue.pop();
    if (current.isWall || current.isVisited) continue;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current === finishNode) return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(current, grid);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited) continue;

      neighbor.heuristic = manhattanDistance(neighbor, finishNode);
      neighbor.previousNode = current;
      queue.push(neighbor);
    }
  }

  return visitedNodesInOrder;
}

function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}
