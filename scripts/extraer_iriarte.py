#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extractor de fabulas de Iriarte -- El Fabulario
================================================

Fuente: "Fabulas literarias" de Tomas de Iriarte, edicion
`fabulas-literarias--4` de la Biblioteca Virtual Miguel de Cervantes
(texto de dominio publico). El cuerpo vive paginado en los ficheros
_2 / _3 / _4 .html; las notas al pie en _1.html.

Diferencias de fondo respecto al extractor de Samaniego:
  - Obra unica, sin "Libro". Marcador de fabula: "- <ROMAN> -" en <h2>.
    El numeral XXI y XXII va fundido en una sola entrada, como la fuente.
  - El titulo es la linea de texto que sigue al marcador; se conserva
    tal cual aparece en la edicion (mayuscula inicial).
  - Los versos viven en tablas: cada fila real tiene 4 <td> y el verso
    esta en la columna 1. Hay una fila 0 anomala (el poema concatenado)
    que se descarta. Estrofa nueva = fila con verso vacio.
  - La moraleja es un <em> fuera de tabla, tras los versos. Se incrusta
    como bloque final del cuerpo en cursiva simple *...* (opcion A).
  - Notas al pie: marcador <a href="..._1.html#N_n_"> en el verso. Se
    elimina del verso (opcion a) y su texto, recuperado de _1.html, se
    vuelca a `nota_curador` en borrador.

Salida: esqueletos .md con borrador: true. NO compilan hasta curaduria
(temas es .min(1) obligatorio y queda comentado), por diseno.

Uso:
    python3 extraer_iriarte.py --out ./salida
    python3 extraer_iriarte.py --listar
"""

import argparse
import datetime
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("Falta beautifulsoup4:  pip install beautifulsoup4 lxml")

BASE = ("https://www.cervantesvirtual.com/obra-visor/"
        "fabulas-literarias--4/html/ff197066-82b1-11df-acc7-002185ce6064")
NOTAS_URL = BASE + "_1.html"
CUERPO_URLS = [BASE + "_2.html", BASE + "_3.html", BASE + "_4.html"]

ROMAN = r"[IVXLC]+"
# Marcador de fabula: "- I -" o el caso fundido "- XXI y XXII -".
MARCADOR_RE = re.compile(rf"-\s*({ROMAN}(?:\s+y\s+{ROMAN})?)\s*-")
NOTA_HREF_RE = re.compile(r"_1\.html#N_(\d+)_")


# -- Utilidades ---------------------------------------------------------------

def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^\w\s]", " ", s)
    return " ".join(s.split())


def slugify(titulo: str) -> str:
    return norm(titulo).replace(" ", "-")


def descargar(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r:
        return r.read().decode("utf-8", errors="replace")


def _txt(node) -> str:
    return re.sub(r"\s+", " ", node.get_text(" ")).strip()


# -- Notas al pie (de _1.html) ------------------------------------------------

def cargar_notas(html: str) -> dict[int, str]:
    """
    Mapa n -> texto de la nota. En _1.html cada nota es:
        <a name="N_n_"></a> <p>n</p> <a name="..."></a> <p>TEXTO</p>
    El texto real es el segundo <p> que sigue al anchor (el primero es
    solo el numero de la nota).
    """
    soup = BeautifulSoup(html, "lxml")
    notas: dict[int, str] = {}
    for a in soup.find_all(attrs={"name": re.compile(r"^N_(\d+)_$")}):
        n = int(re.fullmatch(r"N_(\d+)_", a.get("name")).group(1))
        ps = a.find_all_next("p", limit=2)
        if len(ps) >= 2:
            texto = re.sub(r"\s+", " ", ps[1].get_text(" ")).strip()
            if texto:
                notas[n] = texto
    return notas


# -- Cuerpo: localizar fabulas y extraer versos -------------------------------

def _es_marcador(node) -> str | None:
    """Si el nodo <h2> es un marcador de fabula, devuelve el numeral."""
    if node.name != "h2":
        return None
    t = _txt(node)
    if len(t) > 30:
        return None
    m = MARCADOR_RE.fullmatch(t)
    return m.group(1) if m else None


def _titulo_tras_marcador(h2) -> str:
    """Primera linea de texto significativa tras el marcador <h2>."""
    for sib in h2.next_elements:
        if isinstance(sib, str):
            t = re.sub(r"\s+", " ", sib).strip()
            if t and not MARCADOR_RE.fullmatch(t):
                return t
    return ""


def _verso_de_fila(tr) -> tuple[str | None, list[int]]:
    """
    Extrae el verso (columna 1) y las notas referenciadas en la fila.
    Devuelve (verso|None, notas):
      - verso con texto  -> verso real.
      - verso == ''      -> fila separadora de estrofa (cierra bloque).
      - None             -> fila a ignorar (fila 0 anomala de 257 td).
    Las filas que no son de 4 td (p. ej. la de 1 td que tambien separa
    estrofas en algunas fabulas) se tratan como separador, no como ruido.
    """
    tds = tr.find_all("td", recursive=False)
    if len(tds) != 4:
        # Fila 0 anomala: decenas de td con el poema concatenado -> ignorar.
        if len(tds) > 4:
            return None, []
        # Fila de 1 td (u otra forma corta): separador de estrofa.
        return "", []
    celda = tds[1]
    notas = [int(m.group(1)) for a in celda.find_all("a", href=True)
             if (m := NOTA_HREF_RE.search(a["href"]))]
    # Quitar enlaces (marcadores de nota y navegacion, opcion a). El texto
    # del verso se toma en plano: la cursiva interna ocasional (p. ej.
    # *PURISTA*) se deja a curaduria, para no arriesgar duplicar texto.
    for a in celda.find_all("a"):
        a.extract()
    verso = re.sub(r"\s+", " ", celda.get_text(" ")).strip()
    # Corregir espacio espurio antes de puntuacion (residuo de enlaces de
    # nota extraidos, p. ej. "PURISTA ;" -> "PURISTA;").
    verso = re.sub(r"\s+([;,.:!?»])", r"\1", verso)
    if verso in ("Arriba", "Abajo") or re.fullmatch(r"\d+", verso):
        return "", []
    return verso, notas


def _estrofas_de_tabla(tbl) -> tuple[list[list[str]], list[int]]:
    """
    Recorre las filas reales (4 td) saltando la fila 0 anomala (257 td).
    Agrupa versos en estrofas; fila con verso vacio cierra estrofa.
    """
    estrofas: list[list[str]] = []
    actual: list[str] = []
    notas_fab: list[int] = []

    def cerrar():
        if actual:
            estrofas.append(actual.copy())
            actual.clear()

    for tr in tbl.find_all("tr"):
        verso, notas = _verso_de_fila(tr)
        if verso is None:
            continue
        notas_fab.extend(notas)
        if verso == "":
            cerrar()
            continue
        actual.append(verso)
    cerrar()
    return estrofas, sorted(set(notas_fab))


def _moraleja_tras_tabla(tbl) -> str:
    """Primer <em> fuera de tabla que sigue a la tabla de versos."""
    for el in tbl.next_elements:
        if getattr(el, "name", None) == "em" and el.find_parent("table") is None:
            return re.sub(r"\s+", " ", el.get_text(" ")).strip()
        # Si aparece otra tabla antes que un <em>, no hay moraleja aqui.
        if getattr(el, "name", None) == "table":
            return ""
    return ""


def parsear_cuerpo(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    fabulas = []
    for h2 in soup.find_all("h2"):
        num = _es_marcador(h2)
        if not num:
            continue
        titulo = _titulo_tras_marcador(h2)
        # La tabla de versos de esta fabula es la primera <table> que sigue.
        tbl = h2.find_next("table")
        if tbl is None:
            continue
        estrofas, notas = _estrofas_de_tabla(tbl)
        moraleja = _moraleja_tras_tabla(tbl)
        fabulas.append({
            "num": num,
            "titulo": titulo,
            "slug": slugify(titulo),
            "estrofas": estrofas,
            "moraleja": moraleja,
            "notas": notas,
        })
    return fabulas


def todas(notas_map: dict[int, str]) -> list[dict]:
    out = []
    for url in CUERPO_URLS:
        out += parsear_cuerpo(descargar(url))
    return out


# -- Cuerpo del .md -----------------------------------------------------------

def cuerpo_markdown(fab: dict) -> str:
    """
    Estrofas separadas por linea en blanco. Moraleja como bloque final en
    cursiva simple *...* (opcion A). Normalizacion de dialogo `- ` -> `—`.
    """
    dialogo_re = re.compile(r"(^|\s)-\s*(?=[A-ZÁÉÍÓÚÑ¡¿])", re.M)
    bloques = []
    for estrofa in fab["estrofas"]:
        versos = [dialogo_re.sub(lambda m: (m.group(1) or "") + "—", v)
                  for v in estrofa]
        bloques.append("\n".join(versos))
    cuerpo = "\n\n".join(bloques)
    if fab["moraleja"]:
        cuerpo += f"\n\n*{fab['moraleja']}*"
    return cuerpo


def _nota_curador(fab: dict, notas_map: dict[int, str]) -> str:
    """Texto del campo nota_curador (borrador) si la fabula tiene notas."""
    if not fab["notas"]:
        return ""
    lineas = []
    for n in fab["notas"]:
        texto = notas_map.get(n, "[texto de nota no encontrado]")
        lineas.append(f"Nota original de la edicion [{n}]: {texto}")
    return " ".join(lineas) + " [Pendiente de redaccion curatorial.]"


def esqueleto_md(fab: dict, fecha: str, notas_map: dict[int, str]) -> str:
    nota = _nota_curador(fab, notas_map)
    nota_line = ""
    if nota:
        # Bloque escalar plegado para texto largo; comillas escapadas.
        nota_line = "nota_curador: >-\n  " + nota.replace("\n", "\n  ") + "\n"
    return f"""---
titulo: {fab['titulo']}
# resumen: pendiente de curaduria
fecha: {fecha}   # MARCADOR: fijar la fecha real al publicar
borrador: true
# Taxonomia PENDIENTE DE CURADURIA (rellenar antes de build):
# personajes: []          # lista cerrada en src/utils/taxonomia.ts
# temas: []               # al menos uno, OBLIGATORIO (el build falla sin esto)
forma: verso
tradicion: hispanica
autor: tomas-de-iriarte
curador: Don Alejandro
es_seudonimo: true
nombre_real: Alejandro Morales Loaiza
{nota_line}# Procedencia:
# Iriarte, Fabula {fab['num']} de "Fabulas literarias",
# Biblioteca Virtual Miguel de Cervantes (texto de dominio publico).
# Moraleja de la fuente incrustada como bloque final en *...* (revisar).
---
{cuerpo_markdown(fab)}
"""


# -- CLI ----------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Extractor de fabulas de Iriarte")
    ap.add_argument("--out", default="./fabulas_iriarte_salida",
                    help="Carpeta de salida")
    ap.add_argument("--listar", action="store_true",
                    help="Listar fabulas parseadas")
    args = ap.parse_args()

    notas_map = cargar_notas(descargar(NOTAS_URL))
    fabulas = todas(notas_map)
    print(f"Parseadas {len(fabulas)} fabulas de Cervantes Virtual.",
          file=sys.stderr)
    print(f"Notas al pie cargadas: {sorted(notas_map)}", file=sys.stderr)

    if args.listar:
        for f in fabulas:
            n_estrofas = len(f["estrofas"])
            n_versos = sum(len(e) for e in f["estrofas"])
            mor = "si" if f["moraleja"] else "NO"
            notas = f["notas"] or "-"
            print(f"  {f['num']:<10} estrofas={n_estrofas:<3} "
                  f"versos={n_versos:<4} moraleja={mor:<3} notas={notas!s:<6} "
                  f"{f['slug']}")
        return

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    hoy = datetime.date.today().isoformat()
    for f in fabulas:
        destino = out / f"{f['slug']}.md"
        destino.write_text(esqueleto_md(f, hoy, notas_map), encoding="utf-8")
        print(f"  escrito  {destino}  ({len(f['estrofas'])} estrofas, "
              f"{sum(len(e) for e in f['estrofas'])} versos)")
    print(f"\n{len(fabulas)} esqueletos en {out}/")


if __name__ == "__main__":
    main()
