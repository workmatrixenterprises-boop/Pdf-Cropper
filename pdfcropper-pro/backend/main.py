# backend/main.py  ✅ FULL FILE (copy–paste replace)
import io
import os
from typing import List, Optional

import fitz  # PyMuPDF
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse, Response

from presets import PRESETS

# --- FNSKU generator dependencies ---
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
import barcode
from barcode.writer import ImageWriter
from PIL import Image

MAX_MB = int(os.getenv("MAX_UPLOAD_MB", "25"))

app = FastAPI(title="PDF Cropper API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------
# Basic routes
# --------------------------
@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <h2>PDF Cropper API is running ✅</h2>
    <p>Open <a href="/docs">/docs</a> to test endpoints.</p>
    <p>Health: <a href="/health">/health</a></p>
    """


@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)


@app.get("/health")
def health():
    return {"ok": True}


# --------------------------
# Helpers
# --------------------------
def _ensure_pdf(file: UploadFile, raw: bytes):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")
    if not raw or len(raw) < 100:
        raise HTTPException(status_code=400, detail="Empty/invalid PDF.")
    if len(raw) > MAX_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large (max {MAX_MB}MB).")


def _open_pdf(raw: bytes) -> fitz.Document:
    try:
        return fitz.open(stream=raw, filetype="pdf")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read PDF.")


def _ratio_rect(page: fitz.Page, x0r: float, y0r: float, x1r: float, y1r: float) -> fitz.Rect:
    """
    Ratios are 0..1 relative to page width/height.
    (0,0) top-left, (1,1) bottom-right.
    """
    r = page.rect
    w = r.width
    h = r.height

    x0r = max(0.0, min(1.0, x0r))
    x1r = max(0.0, min(1.0, x1r))
    y0r = max(0.0, min(1.0, y0r))
    y1r = max(0.0, min(1.0, y1r))

    if x1r <= x0r or y1r <= y0r:
        raise HTTPException(status_code=400, detail="Invalid crop ratios.")

    return fitz.Rect(r.x0 + w * x0r, r.y0 + h * y0r, r.x0 + w * x1r, r.y0 + h * y1r)


def _find_invoice_y(page: fitz.Page) -> Optional[float]:
    """
    Finds y-position of invoice start (various spellings).
    Returns y0 (top) of the first matching text, or None.
    """
    keys = [
        "TAX INVOICE",
        "Tax Invoice",
        "TAX  INVOICE",
        "Tax  Invoice",
        "INVOICE",
        "Invoice",
    ]
    candidates: List[fitz.Rect] = []
    for k in keys:
        rects = page.search_for(k)
        if rects:
            candidates.extend(rects)

    if not candidates:
        return None

    return min(r.y0 for r in candidates)


# --------------------------
# Smart Crops
# --------------------------
def crop_above_invoice_keep_line(page: fitz.Page, fallback_keep_ratio: float = 0.55, include_line_padding: float = 12) -> fitz.Rect:
    """
    Generic: crop everything above invoice start, but keep the separator line above invoice.
    """
    r = page.rect
    y = _find_invoice_y(page)

    if y is None:
        return fitz.Rect(r.x0, r.y0, r.x1, r.y0 + r.height * fallback_keep_ratio)

    bottom_y = min(r.y1, y + include_line_padding)
    bottom_y = max(bottom_y, r.y0 + 50)
    return fitz.Rect(r.x0, r.y0, r.x1, bottom_y)


def crop_flipkart_label_tight(page: fitz.Page) -> fitz.Rect:
    """
    Flipkart FINAL crop:
    1) Cut bottom using 'Not for resale' marker (remove invoice)
    2) Tight-crop using: text + drawings + images so left barcode & bottom lines are included
    """
    r = page.rect

    # ---- Step 1: find bottom boundary (remove invoice)
    matches = page.search_for("Not for resale")
    if not matches:
        matches = page.search_for("Not for resale.") or page.search_for("Not for") or page.search_for("not for resale")

    if matches:
        footer_rect = matches[0]
        bottom_y = min(r.y1, footer_rect.y1 + 30)  # keep bottom barcode + B3/B4
    else:
        bottom_y = r.y0 + r.height * 0.70  # fallback

    # ---- Step 2: collect bounds from TEXT + DRAWINGS + IMAGES
    x0, y0, x1, y1 = r.x1, bottom_y, r.x0, r.y0  # init inverted

    def add_rect(rr: fitz.Rect):
        nonlocal x0, y0, x1, y1
        if rr is None:
            return
        # consider only content above invoice cut
        if rr.y0 > bottom_y:
            return
        rr2 = fitz.Rect(rr.x0, rr.y0, rr.x1, min(rr.y1, bottom_y))
        x0 = min(x0, rr2.x0)
        y0 = min(y0, rr2.y0)
        x1 = max(x1, rr2.x1)
        y1 = max(y1, rr2.y1)

    # TEXT bounds (words)
    for w in page.get_text("words"):
        add_rect(fitz.Rect(w[0], w[1], w[2], w[3]))

    # DRAWINGS bounds (lines/rectangles/borders/barcodes often here)
    try:
        drawings = page.get_drawings()
        for d in drawings:
            # bbox exists in recent PyMuPDF
            bb = d.get("bbox")
            if bb:
                add_rect(bb)
    except Exception:
        pass

    # IMAGES bounds (QR etc.)
    try:
        for b in page.get_text("blocks"):
            # blocks can include images; text blocks have type 0, image blocks type 1 in some versions
            # We can safely include any block rect
            add_rect(fitz.Rect(b[0], b[1], b[2], b[3]))
    except Exception:
        pass

    # If we still didn’t find anything, fallback
    if x1 <= x0 or y1 <= y0:
        return fitz.Rect(r.x0, r.y0, r.x1, bottom_y)

    # ---- Padding to keep full borders visible
    pad_left = -129  # increase if left still not tight enough
    pad_right = -20
    pad_top = 5
    pad_bottom = -20

    final = fitz.Rect(
        max(r.x0, x0 - pad_left),
        max(r.y0, y0 - pad_top),
        min(r.x1, x1 + pad_right),
        min(bottom_y, y1 + pad_bottom),
    )

    # Safety clamp
    if final.x1 <= final.x0 or final.y1 <= final.y0:
        return fitz.Rect(r.x0, r.y0, r.x1, bottom_y)

    return final


# --------------------------
# Presets
# --------------------------
@app.get("/presets")
def presets():
    return {"presets": list(PRESETS.keys())}


@app.post("/crop/preset")
async def crop_with_preset(
    file: UploadFile = File(...),
    preset: str = Form(...),
    rotate_degrees: int = Form(0),  # 0/90/180/270
):
    raw = await file.read()
    _ensure_pdf(file, raw)

    if preset not in PRESETS:
        raise HTTPException(status_code=400, detail="Unknown preset.")

    src = _open_pdf(raw)
    out = fitz.open()

    # ratio defaults (used for presets where we don't override)
    x0r, y0r, x1r, y1r = PRESETS[preset]

    for i in range(src.page_count):
        p = src.load_page(i)

        if rotate_degrees:
            p.set_rotation((p.rotation + rotate_degrees) % 360)

        # Smart overrides
        if preset == "meesho_label":
            rect = crop_above_invoice_keep_line(p, fallback_keep_ratio=0.55, include_line_padding=12)
        elif preset == "flipkart_label":
            rect = crop_flipkart_label_tight(p)
        else:
            rect = _ratio_rect(p, x0r, y0r, x1r, y1r)

        p.set_cropbox(rect)
        out.insert_pdf(src, from_page=i, to_page=i)

    buf = io.BytesIO()
    out.save(buf, garbage=4, deflate=True)
    out.close()
    src.close()
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{preset}.pdf"'},
    )


# --------------------------
# Manual crop (draw rectangle -> crop all pages)
# --------------------------
@app.post("/crop/manual")
async def crop_manual(
    file: UploadFile = File(...),
    x0r: float = Form(...),
    y0r: float = Form(...),
    x1r: float = Form(...),
    y1r: float = Form(...),
    rotate_degrees: int = Form(0),
):
    raw = await file.read()
    _ensure_pdf(file, raw)

    if not (0 <= x0r < x1r <= 1 and 0 <= y0r < y1r <= 1):
        raise HTTPException(status_code=400, detail="Invalid crop ratios. Must be 0..1 and x1>x0, y1>y0.")

    src = _open_pdf(raw)
    out = fitz.open()

    for i in range(src.page_count):
        p = src.load_page(i)

        if rotate_degrees:
            p.set_rotation((p.rotation + rotate_degrees) % 360)

        rect = _ratio_rect(p, x0r, y0r, x1r, y1r)
        p.set_cropbox(rect)
        out.insert_pdf(src, from_page=i, to_page=i)

    buf = io.BytesIO()
    out.save(buf, garbage=4, deflate=True)
    out.close()
    src.close()
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="manual-crop.pdf"'},
    )


# --------------------------
# PDF Merge
# --------------------------
@app.post("/pdf/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    if not files or len(files) < 2:
        raise HTTPException(status_code=400, detail="Upload at least 2 PDFs.")

    out = fitz.open()

    for f in files:
        raw = await f.read()
        _ensure_pdf(f, raw)
        doc = _open_pdf(raw)
        out.insert_pdf(doc)
        doc.close()

    buf = io.BytesIO()
    out.save(buf, garbage=4, deflate=True)
    out.close()
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="merged.pdf"'},
    )


# --------------------------
# PDF Rearrange
# --------------------------
@app.post("/pdf/rearrange")
async def rearrange_pdf(
    file: UploadFile = File(...),
    order: str = Form(...),  # e.g. "1,3,2" (1-based)
):
    raw = await file.read()
    _ensure_pdf(file, raw)
    src = _open_pdf(raw)

    try:
        pages = [int(x.strip()) for x in order.split(",") if x.strip()]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order format. Use comma-separated numbers.")

    if not pages:
        raise HTTPException(status_code=400, detail="Order cannot be empty.")

    if any(p < 1 or p > src.page_count for p in pages):
        raise HTTPException(status_code=400, detail=f"Order contains out-of-range pages. PDF has {src.page_count} pages.")

    out = fitz.open()
    for pnum in pages:
        out.insert_pdf(src, from_page=pnum - 1, to_page=pnum - 1)

    buf = io.BytesIO()
    out.save(buf, garbage=4, deflate=True)
    out.close()
    src.close()
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="rearranged.pdf"'},
    )


# --------------------------
# FNSKU generator (barcode + optional price -> PDF 4x6 sheets)
# --------------------------
@app.post("/fnsku/generate")
async def generate_fnsku_label(
    fnsku: str = Form(...),
    price: str = Form(""),
    qty: int = Form(1),
):
    fnsku = (fnsku or "").strip()
    price = (price or "").strip()

    if not fnsku:
        raise HTTPException(status_code=400, detail="FNSKU is required.")
    if qty < 1 or qty > 500:
        raise HTTPException(status_code=400, detail="Qty must be between 1 and 500.")

    # 4x6 inches
    PAGE_W, PAGE_H = (6 * inch, 4 * inch)

    buf = io.BytesIO()
    c = rl_canvas.Canvas(buf, pagesize=(PAGE_W, PAGE_H))

    def draw_one():
        code128 = barcode.get_barcode_class("code128")
        b = code128(fnsku, writer=ImageWriter())

        img_bytes = io.BytesIO()
        b.write(img_bytes, options={"module_height": 12.0, "font_size": 10, "text_distance": 2, "quiet_zone": 2})
        img_bytes.seek(0)

        pil = Image.open(img_bytes).convert("RGB")
        barcode_io = io.BytesIO()
        pil.save(barcode_io, format="PNG")
        barcode_io.seek(0)

        img = ImageReader(barcode_io)

        margin = 0.35 * inch
        c.setFont("Helvetica-Bold", 16)
        c.drawString(margin, PAGE_H - margin, "FNSKU LABEL")

        img_w = PAGE_W - 2 * margin
        img_h = 1.6 * inch
        c.drawImage(
            img,
            margin,
            PAGE_H / 2 - img_h / 2,
            width=img_w,
            height=img_h,
            preserveAspectRatio=True,
            anchor="c",
        )

        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(PAGE_W / 2, margin + 0.7 * inch, fnsku)

        if price:
            c.setFont("Helvetica-Bold", 22)
            c.drawCentredString(PAGE_W / 2, margin + 0.25 * inch, f"₹ {price}")

    for _ in range(qty):
        draw_one()
        c.showPage()

    c.save()
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="fnsku-labels-4x6.pdf"'},
    )
