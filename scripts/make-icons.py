"""Genera los íconos de la app a partir de store-assets/Logo_MCFP.png.

Uso: python scripts/make-icons.py [preview.png]  (requiere Pillow)

El PNG trae el cuadriculado de "transparencia" dibujado (todos los píxeles
son opacos), así que el fondo se quita por saturación: el cuadriculado es
gris/blanco (R≈G≈B) y el logo es azul/verde azulado muy saturado.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

FRONT = Path(__file__).resolve().parent.parent
SRC = FRONT / "store-assets/Logo_MCFP.png"
RES = FRONT / "android/app/src/main/res"
OUT_PREVIEW = Path(sys.argv[1]) if len(sys.argv) > 1 else None

BG = (255, 255, 255, 255)  # fondo del ícono

img = Image.open(SRC).convert("RGBA")
px = img.load()
w, h = img.size
for y in range(h):
    for x in range(w):
        r, g, b, _ = px[x, y]
        chroma = max(r, g, b) - min(r, g, b)
        # <=18: gris del cuadriculado -> transparente; >=55: logo -> opaco;
        # en medio, borde antialiasado -> alfa proporcional.
        a = 0 if chroma <= 18 else 255 if chroma >= 55 else int((chroma - 18) / 37 * 255)
        px[x, y] = (r, g, b, a)

# Quita motas sueltas: solo cuenta como logo lo que tenga alfa alto al recortar.
alpha = img.getchannel("A").point(lambda v: 255 if v > 200 else 0)
bbox = alpha.getbbox()
logo = img.crop(bbox)
side = max(logo.size)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(logo, ((side - logo.width) // 2, (side - logo.height) // 2), logo)
print("bbox", bbox, "square", square.size)


def logo_on(canvas_px: int, logo_frac: float, bg=None, shape=None) -> Image.Image:
    canvas = Image.new("RGBA", (canvas_px, canvas_px), (0, 0, 0, 0))
    if bg is not None:
        mask = Image.new("L", (canvas_px, canvas_px), 0)
        d = ImageDraw.Draw(mask)
        if shape == "circle":
            d.ellipse((0, 0, canvas_px - 1, canvas_px - 1), fill=255)
        else:
            d.rounded_rectangle((0, 0, canvas_px - 1, canvas_px - 1), radius=canvas_px // 5, fill=255)
        canvas.paste(Image.new("RGBA", (canvas_px, canvas_px), bg), (0, 0), mask)
    size = round(canvas_px * logo_frac)
    l = square.resize((size, size), Image.LANCZOS)
    off = (canvas_px - size) // 2
    canvas.alpha_composite(l, (off, off))
    return canvas


DENSITIES = {"ldpi": 0.75, "mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for name, k in DENSITIES.items():
    d = RES / f"mipmap-{name}"
    # Adaptativo: lienzo de 108dp; zona segura de 66dp => logo al ~58%.
    fg = logo_on(round(108 * k), 0.64)
    fg.save(d / "ic_launcher_foreground.png")
    Image.new("RGBA", fg.size, BG).save(d / "ic_launcher_background.png")
    # Heredado (Android < 8): 48dp con fondo propio.
    logo_on(round(48 * k), 0.78, BG, "rounded").save(d / "ic_launcher.png")
    logo_on(round(48 * k), 0.70, BG, "circle").save(d / "ic_launcher_round.png")

# PWA / web
pub = FRONT / "public"
logo_on(1024, 0.80, BG, "rounded").save(pub / "icon-source-1024.png")
logo_on(512, 0.80, BG, "rounded").save(pub / "pwa-512x512.png")
logo_on(192, 0.80, BG, "rounded").save(pub / "pwa-192x192.png")
full = Image.new("RGBA", (512, 512), BG)
full.alpha_composite(logo_on(512, 0.62))  # maskable: zona segura ~80% del círculo
full.save(pub / "pwa-maskable-512x512.png")
apple = Image.new("RGBA", (180, 180), BG)
apple.alpha_composite(logo_on(180, 0.78))
apple.convert("RGB").save(pub / "apple-touch-icon.png")

# Ícono de la ficha de Play Store: 512x512, sin transparencia; Play redondea solo.
store = FRONT / "store-assets"
store.mkdir(exist_ok=True)
play = Image.new("RGBA", (512, 512), BG)
play.alpha_composite(logo_on(512, 0.80))
play.convert("RGB").save(store / "play-icon-512.png")

if OUT_PREVIEW:
    prev = Image.new("RGBA", (900, 300), (40, 40, 40, 255))
    prev.alpha_composite(logo_on(256, 0.78, BG, "rounded"), (20, 22))
    prev.alpha_composite(logo_on(256, 0.70, BG, "circle"), (320, 22))
    # simulación de la máscara circular del adaptativo
    ad = Image.new("RGBA", (256, 256), BG)
    ad.alpha_composite(logo_on(256, 0.64))
    m = Image.new("L", (256, 256), 0)
    ImageDraw.Draw(m).ellipse((0, 0, 255, 255), fill=255)
    prev.paste(ad, (620, 22), m)
    prev.save(OUT_PREVIEW)
    # bordes: logo sin fondo sobre gris oscuro, ampliado
    edge = Image.new("RGBA", (600, 600), (30, 30, 30, 255))
    edge.alpha_composite(square.resize((1200, 1200), Image.LANCZOS).crop((300, 0, 900, 600)))
    edge.save(OUT_PREVIEW.with_name("edge.png"))
print("ok")
