# Presets expressed as ratios of the page:
# (x0_ratio, y0_ratio, x1_ratio, y1_ratio)
# 0..1 where (0,0) = top-left and (1,1) = bottom-right in page coordinates.
# These are converted to a PyMuPDF Rect via the page.rect.

PRESETS = {
    # Meesho: sample shows label on top and invoice below
    # Keep top 50% (safe default). Tune if needed.
    "meesho_label": (0.00, 0.00, 1.00, 0.50),

    # Generic defaults; tune with real PDFs from each platform
    "amazon_label": (0.00, 0.00, 1.00, 0.50),
    "flipkart_label": (0.00, 0.00, 1.00, 0.50),
    "shopsy_label": (0.00, 0.00, 1.00, 0.50),
    "jiomart_label": (0.00, 0.00, 1.00, 0.50),
    "myntra_label": (0.00, 0.00, 1.00, 0.50),
    "ajio_label": (0.00, 0.00, 1.00, 0.50),
    "snapdeal_label": (0.00, 0.00, 1.00, 0.50),
    "glowroad_label": (0.00, 0.00, 1.00, 0.50),
}
