# PDF Citation Slice Proof-of-Concept

This minimal prototype demonstrates an end-to-end “slice” of the pipeline:
  • PDF upload → citation extraction (URLs, DOIs, ISBNs)
  • Construction of a simple citation graph
  • Interactive D3.js visualization in the browser

## Prerequisites
  • Python 3.8+
  • pip

## Setup
```bash
cd slice_poc
python3 -m venv venv          # create virtual environment
source venv/bin/activate     # on Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

## Run the server
```bash
uvicorn server:app --reload
```

## Testing Spidering & Layout
You can control the depth of online spidering via the `depth` query parameter (default `1`).
For example, to allow two levels of link-following:
```bash
# POST with depth=2
curl -F "file=@mydoc.pdf" "http://127.0.0.1:8000/upload?depth=2"
```

In the browser: drop a PDF onto the page, and:
- Nodes are colored by type: red=document, blue=online_source, green=offline_source, gray=pruned_online_source (dead-end online chains).
- Graph is laid out horizontally: the uploaded document is fixed to the right, sources to the left.

By default, the static client is served at http://127.0.0.1:8000/. Open that URL in your browser and drag & drop a PDF file onto the page. The extracted citation graph will render interactively.

## Notes
- This POC uses simple regex-based parsing (restricted to the References/Bibliography section when detected) and PyPDF2 for text extraction. Swap in a GROBID client or other parser for more robust citation parsing.
+ Only single-level extraction is performed (no deep spidering).
  
## Project Dashboard

An interactive project dashboard is available at the `/documentation` endpoint (or via `static/docs.html`). It provides an evolving overview of:
  - Available API endpoints and functionality
  - Testing status and coverage notes
  - Ready-to-use commands for exercising the service