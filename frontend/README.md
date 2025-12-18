# VectorShift Pipeline Builder

A simplified workflow builder demonstrating node abstraction, execution modeling, and backend integration.

## Highlights
- Config-driven node abstraction
- Dynamic Text nodes with variable handles (`{{node.field}}`)
- VectorShift-style floating Outputs panel
- DAG validation via FastAPI
- Mock pipeline execution with visual feedback

## Tech Stack
Frontend: React, React Flow, Zustand  
Backend: FastAPI (Python)

## Running Locally
Frontend:
npm install
npm start

Backend:
uvicorn main:app --reload
