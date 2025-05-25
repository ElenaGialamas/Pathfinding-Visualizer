import TinyQueue from "tinyqueue";

export function dijkstra(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;

  const compare = (a, b) => a.distance - b.distance;
  const queue = new TinyQueue([startNode], compare);

  while (queue.length) {
    const closestNode = queue.pop();
    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
      const newDist = closestNode.distance + 1;
      if (newDist < neighbor.distance) {
        neighbor.distance = newDist;
        neighbor.previousNode = closestNode;
        queue.push(neighbor);
      }
    }
  }
  return visitedNodesInOrder;
}

export function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode != null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
