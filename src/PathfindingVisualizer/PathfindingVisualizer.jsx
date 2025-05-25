import React, { Component } from "react";
import Node from './Node/Node';

import './PathfindingVisualizer.css';
import { dijkstra, getNodesInShortestPathOrder } from "./Algorithms/Dijkstra";
import { aStar } from "./Algorithms/AStar";
import { greedyBestFirstSearch } from "./Algorithms/gbfs";

export default class PathfindingVisualizer extends Component {
    
    animationTimeouts = []; 

    constructor(props) {
        super(props);
        this.state = {
            grid: [],
            mouseIsPressed: false,
            isAnimating: false,
            startNodeRow: 10,
            startNodeCol: 15,
            finishNodeRow: 10,
            finishNodeCol: 35,
        };
    }

    componentDidMount() {
        const grid = this.getEmptyGrid(20, 50);
        this.setState({grid});
    }

    handleMouseDown(e, row, col) {
        if(this.state.isAnimating === true) return;
        if (e.button === 0) {
            const newGrid = this.getNewGridWithWallsToggled(this.state.grid, row, col); 
            this.setState({grid: newGrid, mouseIsPressed: true});
        } else if (e.button === 1) {
            const newGrid = this.getGridWithNewSpecialNode(this.state.grid, row, col, 'isStart');
            this.setState({grid: newGrid, startNodeRow: row, startNodeCol: col});
        } else if (e.button === 2) {
            const newGrid = this.getGridWithNewSpecialNode(this.state.grid, row, col, 'isFinish');
            this.setState({grid: newGrid, finishNodeRow: row, finishNodeCol: col})
        }
    }

    handleMouseUp() {
        this.setState({mouseIsPressed: false});
    }

    handleMouseEnter(row, col) {
        if (!this.state.mouseIsPressed) return;
        const newGrid = this.getNewGridWithWallsToggled(this.state.grid, row, col);
        this.setState({grid: newGrid});
    }

    handleContextMenu(e) {
        e.preventDefault();
    }
    
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                let timeout = setTimeout(() => {
                this.animateShortestPath(nodesInShortestPathOrder);
                }, 20 * i);
                this.animationTimeouts.push(timeout);  
                return;
            }
            let timeout = setTimeout(() => {
                    const node = visitedNodesInOrder[i];
                    document.getElementById(`node-${node.row}-${node.col}`).classList.add('node-visited')
                }, 20 * i);
            this.animationTimeouts.push(timeout); 
        }
    }

    animateShortestPath(nodesInShortestPathOrder) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            let timeout = setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                document.getElementById(`node-${node.row}-${node.col}`).classList.add('node-shortest-path');

                // Only when the last node animation completes...
                if (i === nodesInShortestPathOrder.length - 1) {
                    this.setState({ isAnimating: false });    
                }
            }, 50 * i);
            this.animationTimeouts.push(timeout);
        }
    }


    cancelAnimation() {
        this.animationTimeouts.forEach(clearTimeout);
        this.animationTimeouts = [];
    }

    visualizeAlgorithm(algorithm) {
        this.cancelAnimation();
        this.clearGrid();
        this.setState({isAnimating: true});
        let { grid, startNodeCol, startNodeRow, finishNodeCol, finishNodeRow } = this.state;
        // deep copy of the grid to prevent stale mutation or wall confusion
        grid = grid.map(row =>
            row.map(node => ({
            ...node,
            distance: Infinity,
            isVisited: false,
            previousNode: null,
            }))
        );
        const startNode = grid[startNodeRow][startNodeCol];
        const finishNode = grid[finishNodeRow][finishNodeCol];
        const visitedNodesInOrder = algorithm(grid, startNode, finishNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }
    
    clearGrid = () => {
        this.cancelAnimation();
        const nodes = document.querySelectorAll('.node');
        nodes.forEach((node) => {
            node.classList.remove('node-shortest-path', 'node-visited');
        });
    }

    clearWalls = () => {
        const newGrid = this.state.grid.map(row =>
            row.map(node => ({
                ...node,
                isWall: false,
            }))
        );
        this.setState({grid: newGrid});
    }

    createNode = (col, row) => {
        return {
            col,
            row,
            isStart: row === this.state.startNodeRow && col === this.state.startNodeCol,
            isFinish: row  === this.state.finishNodeRow && col === this.state.finishNodeCol,
            isVisited: false,
            isWall: false,
            distance: Infinity,
            previousNode: null
        };
    };

      render() {
    const {grid, mouseIsPressed} = this.state;

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Pathfiniding Visualizer</h1>
                <div className="button-group">
                    <button onClick={() => this.visualizeAlgorithm(dijkstra)}>
                    Visualize Dijkstra's Algorithm
                    </button>
                    <button onClick={() => this.visualizeAlgorithm(aStar)}>
                    Visualize A* Algorithm
                    </button>
                    <button onClick={() => this.visualizeAlgorithm(greedyBestFirstSearch)}>
                    Visualize GBFS Algorithm
                    </button>
                    <button className="clear" onClick={() => {this.clearGrid(); this.clearWalls()}}> 
                    Clear Grid
                    </button>
                </div>
            </header>
            <div className="legend">
                <div><span className="legend-box node-start"></span> Start Node (Middle Click)</div>
                <div><span className="legend-box node-finish"></span> Finish Node (Right Click)</div>
                <div><span className="legend-box node-wall"></span> Wall (Left Click & Drag)</div>
            </div>
            <div className="grid">
                {grid.map((row, rowIdx) => {
                    return (
                    <div key={rowIdx}>
                        {row.map((node, nodeIdx) => {
                        const {row, col, isFinish, isStart, isWall} = node;
                        return (
                            <Node
                            key={nodeIdx}
                            col={col}
                            isFinish={isFinish}
                            isStart={isStart}
                            isWall={isWall}
                            mouseIsPressed={mouseIsPressed}
                            onMouseDown={(e, row, col) => this.handleMouseDown(e, row, col)}
                            onMouseEnter={(row, col) =>
                                this.handleMouseEnter(row, col)
                            }
                            onMouseUp={() => this.handleMouseUp()}
                            onContextMenu={(e) => this.handleContextMenu(e)}
                            row={row}></Node>
                        );
                        })}
                    </div>
                    );
                })}
            </div>
        </div>
        );
    }

    getEmptyGrid = (rowSize, colSize) => {
        const grid = [];
        for (let row = 0; row < rowSize ; row++) {
            const currentRow = [];
            for (let col = 0; col < colSize; col++) {
                currentRow.push(this.createNode(col, row));
            }
            grid.push(currentRow);
        }
        return grid;
    };

    getNewGridWithWallsToggled = (grid, row, col) => {
        const newGrid = grid.slice();
        const node = newGrid[row][col];
        const newNode = {
            ...node,
            isWall: !node.isWall,
        };
        newGrid[row][col] = newNode;
        return newGrid;
    };

    getGridWithNewSpecialNode = (grid, row, col, flagName) => {
        return grid.map((gridRow, rIdx) =>
            gridRow.map((node, cIdx) => ({
                ...node,
                [flagName]: rIdx === row && cIdx === col,
            }))
        );
    };
    

}

