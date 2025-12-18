# main.py

from fastapi import FastAPI  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel  # pyright: ignore[reportMissingImports]
from typing import List, Dict, Any

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline):

    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)

    # Adjacency List
    adjacency = {node["id"]: [] for node in pipeline.nodes}

    for edge in pipeline.edges:
        source = edge.get("source")
        target = edge.get("target")
        if source and target:
            adjacency[source].append(target)

    visited = set()
    path = set()

    def dfs(node):
        if node in path:
            return True  # cycle
        if node in visited:
            return False

        visited.add(node)
        path.add(node)

        for nxt in adjacency.get(node, []):
            if dfs(nxt):
                return True

        path.remove(node)
        return False

    # Check for cycles
    is_dag = True
    for node_id in adjacency:
        if dfs(node_id):
            is_dag = False
            break
        path.clear()

    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": is_dag,
    }
