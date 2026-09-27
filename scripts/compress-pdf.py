"""Reduce el tamaño de un PDF de las guías (las imágenes salen de Chrome sin comprimir).

Uso: python compress-pdf.py entrada.pdf salida.pdf
Necesita PyMuPDF (pip install pymupdf). Lo llama scripts/build-guides.mjs si está disponible.
"""
import sys

import pymupdf

src, dst = sys.argv[1], sys.argv[2]
doc = pymupdf.open(src)
doc.rewrite_images(dpi_threshold=170, dpi_target=150, quality=80)
doc.save(dst, garbage=4, deflate=True, clean=True)
