import io
import re
import json
import time
import logging
import PyPDF2
import networkx as nx
import httpx
from collections import deque
# Configure console logging for stats and diagnostics
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# Helper: isolate the References section of the extracted text, if any
def extract_reference_section(text: str) -> str:
    lines = text.splitlines()
    start = None
    # look for common bibliography headings
    for i, line in enumerate(lines):
        if re.match(r'^\s*(References|Bibliography|Works Cited)\s*$', line, flags=re.IGNORECASE):
            start = i + 1
            break
    if start is not None and start < len(lines):
        return '\n'.join(lines[start:])
    # fallback to full text
    return text

import PyPDF2
import httpx
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for demo purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static assets under /static (index.html served at root)
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)
@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serve the main HTML page."""
    return FileResponse("static/index.html")

@app.get("/network", response_class=HTMLResponse)
async def serve_network():
    """Serve the advanced network dashboard."""
    return FileResponse("static/network.html")

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), depth: int = 1):
    """Return the complete citation graph as JSON."""
    import time as _time
    # Initialize timing logs
    t0 = _time.monotonic()
    logs = []
    logs.append({"stage": "upload_received", "timestamp_ms": 0})
    # Read and parse PDF
    contents = await file.read()
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(contents))
    except Exception as e:
        return JSONResponse({"error": f"Failed to read PDF: {e}"}, status_code=400)
    text = ""
    for page in reader.pages:
        try:
            text += (page.extract_text() or "") + "\n"
        except Exception:
            continue
    # Log PDF parsing time
    t1 = _time.monotonic()
    logs.append({"stage": "parsed_pdf", "duration_ms": round((t1 - t0) * 1000, 2)})
    # Restrict to References section if present, else use full text
    ref_text = extract_reference_section(text)
    # Regex patterns
    url_pat = r'https?://[^\s)]+'
    doi_pat = r'\b10\.\d{4,9}/\S+\b'
    isbn_pat = r'\b(?:ISBN(?:-1[03])?:?\s*)?((?:\d[\d\- ]{9,16}[\dX]))\b'
    # Initial citations
    # find URLs, strip trailing punctuation
    raw_urls = re.findall(url_pat, ref_text, flags=re.IGNORECASE)
    urls = set(u.rstrip('.,;)') for u in raw_urls)
    # DOIs and ISBNs
    dois = set(re.findall(doi_pat, ref_text, flags=re.IGNORECASE))
    isbns = set(m for m in re.findall(isbn_pat, ref_text, flags=re.IGNORECASE))
    doc_id = "document"
    # Prepare seen sets
    seen_nodes = set([doc_id])
    seen_links = set()
    # Build initial cluster
    init_nodes = [{"id": doc_id, "label": file.filename, "type": "document"}]
    init_edges = []
    for u in urls:
        nid = f"url:{u}"; seen_nodes.add(nid)
        init_nodes.append({"id": nid, "label": u, "type": "online_source"})
        init_edges.append({"source": doc_id, "target": nid}); seen_links.add(f"{doc_id}|{nid}")
    for d in dois:
        nid = f"doi:{d}"; seen_nodes.add(nid)
        init_nodes.append({"id": nid, "label": d, "type": "offline_source"})
        init_edges.append({"source": doc_id, "target": nid}); seen_links.add(f"{doc_id}|{nid}")
    for i in isbns:
        nid = f"isbn:{i}"; seen_nodes.add(nid)
        init_nodes.append({"id": nid, "label": i, "type": "offline_source"})
        init_edges.append({"source": doc_id, "target": nid}); seen_links.add(f"{doc_id}|{nid}")
    # Log initial citation extraction
    t2 = _time.monotonic()
    logs.append({
        "stage": "initial_citations",
        "duration_ms": round((t2 - t0) * 1000, 2),
        "counts": {"urls": len(urls), "dois": len(dois), "isbns": len(isbns)}
    })

    # Build full graph including spidering up to specified depth
    nodes = list(init_nodes)
    edges = list(init_edges)
    queue = deque((u, 0) for u in urls)
    visited = set()
    async with httpx.AsyncClient() as client:
        while queue:
            cur, lvl = queue.popleft()
            if lvl >= depth or cur in visited:
                continue
            visited.add(cur)
            src_id = f"url:{cur}"
            try:
                resp = await client.get(cur, timeout=5)
                content = resp.text or ""
            except Exception:
                continue
            # Extract citations on this page
            raw_urls2 = re.findall(url_pat, content, flags=re.IGNORECASE)
            urls2 = set(u.rstrip('.,;)') for u in raw_urls2)
            dois2 = set(re.findall(doi_pat, content, flags=re.IGNORECASE))
            isbns2 = set(m for m in re.findall(isbn_pat, content, flags=re.IGNORECASE))
            has_off = bool(dois2 or isbns2)
            # Offline sources
            for d2 in dois2:
                nid = f"doi:{d2}"
                if nid not in seen_nodes:
                    seen_nodes.add(nid)
                    nodes.append({"id": nid, "label": d2, "type": "offline_source"})
                key = f"{src_id}|{nid}"
                if key not in seen_links:
                    seen_links.add(key)
                    edges.append({"source": src_id, "target": nid})
            for i2 in isbns2:
                nid = f"isbn:{i2}"
                if nid not in seen_nodes:
                    seen_nodes.add(nid)
                    nodes.append({"id": nid, "label": i2, "type": "offline_source"})
                key = f"{src_id}|{nid}"
                if key not in seen_links:
                    seen_links.add(key)
                    edges.append({"source": src_id, "target": nid})
            # Online sources
            for u2 in urls2:
                nid = f"url:{u2}"
                if nid not in seen_nodes:
                    seen_nodes.add(nid)
                    node_type = "online_source" if has_off else "pruned_online_source"
                    nodes.append({"id": nid, "label": u2, "type": node_type})
                key = f"{src_id}|{nid}"
                if key not in seen_links:
                    seen_links.add(key)
                    edges.append({"source": src_id, "target": nid})
                if has_off:
                    queue.append((u2, lvl + 1))
    # Record crawl duration
    t3 = _time.monotonic()
    crawl_ms = round((t3 - t2) * 1000, 2)
    total_ms = round((t3 - t0) * 1000, 2)
    # Compute node/edge counts and breakdown by type
    total_nodes = len(nodes)
    total_edges = len(edges)
    by_type = {}
    for n in nodes:
        t = n.get("type", "unknown")
        by_type[t] = by_type.get(t, 0) + 1
    stats = {
        "pdf_parse_ms": logs[1]["duration_ms"],
        "initial_citations_ms": logs[2]["duration_ms"],
        "crawl_ms": crawl_ms,
        "total_ms": total_ms,
        "counts": {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
            "by_type": by_type
        }
    }
    # Log upload stats to console
    logging.info(f"upload_pdf: filename={file.filename}, depth={depth}, stats={json.dumps(stats)}")
    # Return graph data with stats
    return JSONResponse({"nodes": nodes, "edges": edges, "stats": stats})

@app.get("/isbn/{isbn}")
async def isbn_metadata(isbn: str):
    """Fetch book metadata for a given ISBN from OpenLibrary."""
    # Clean ISBN string
    cleaned = isbn.replace('-', '').strip()
    ol_url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{cleaned}&format=json&jscmd=data"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(ol_url, timeout=5)
            resp.raise_for_status()
            info = resp.json()
            key = f"ISBN:{cleaned}"
            book = info.get(key)
            if not book:
                return JSONResponse({"error": "Book not found"}, status_code=404)
            # Prepare metadata response
            data = {
                "id": f"isbn:{cleaned}",
                "label": cleaned,
                "type": "offline_source",
                "title": book.get("title"),
                "authors": [a.get("name") for a in book.get("authors", []) if a.get("name")],
                "publishers": [p.get("name") for p in book.get("publishers", []) if p.get("name")]
            }
            return JSONResponse(data)
        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)