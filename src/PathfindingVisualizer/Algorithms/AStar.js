import TinyQueue from "tinyqueue";
import { getUnvisitedNeighbors } from "./Dijkstra";

export function aStar(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];

  const heuristic = (nodeA, nodeB) =>
    Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  startNode.distance = 0;
  startNode.heuristic = heuristic(startNode, finishNode);

  const compare = (a, b) =>
    a.heuristicDistance + a.distance - (b.heuristicDistance + b.distance);
  const queue = new TinyQueue([startNode], compare);

  while (queue.length) {
    const closestNode = queue.pop();

    if (closestNode.isWall) continue;
    if (closestNode.totalCost === Infinity) return visitedNodesInOrder;

    closestNode.isVisitd = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
      const tentativeDistance = closestNode.distance + 1;
      if (tentativeDistance < (neighbor.distance ?? Infinity)) {
        neighbor.distance = tentativeDistance;
        neighbor.heuristicDistance = heuristic(neighbor, finishNode);
        neighbor.previousNode = closestNode;
        queue.push(neighbor);
      }
    }
  }

  return visitedNodesInOrder;
}
