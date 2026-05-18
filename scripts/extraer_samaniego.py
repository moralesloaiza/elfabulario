#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extractor de fábulas de Samaniego — El Fabulario (v3)
=====================================================

Estrategia: dos pasadas sobre el HTML.

Pasada 1 (texto plano): identificar la secuencia "Libro X" → "Fábula Y"
para conocer los OFFSETS de cada fábula dentro del HTML serializado.

Pasada 2 (estructural): extraer cada <td style="white-space:nowrap">
del documento, asociarlo a su fábula por offset, normalizar whitespace
interno (reunifica versos partidos) y detectar inicio de estrofa por
sangría triple (>=3 caracteres NBSP al inicio del verso).

Sale: esqueletos .md con
  - estrofas separadas por línea en blanco
  - tradicion: hispanica activa
  - última estrofa envuelta en ***...*** como hipótesis de moraleja
  - personajes/temas comentados (curaduría humana)

Uso:
    python3 extraer_samaniego_v3.py --libro IV --out ./salida
    python3 extraer_samaniego_v3.py --listar
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
        "fabulas-en-verso-castellano-para-uso-del-real-seminario-bascongado--0/html/")
TOMO_URLS = {
    1: BASE + "ffc3e7f8-82b1-11df-acc7-002185ce6064_2.html",
    2: BASE + "ffc3e7f8-82b1-11df-acc7-002185ce6064_3.html",
}
ROMAN = r"[IVXLC]+"

INDICE = {
    "I": ["El Asno y el Cochino", "La Cigarra y la Hormiga", "El Muchacho y la Fortuna",
          "La Codorniz", "El Águila y el Escarabajo", "El León vencido por el Hombre",
          "La Zorra y el Busto", "El Ratón de la corte y el del campo", "El Herrero y el Perro",
          "La Zorra y la Cigüeña", "Las Moscas", "El Leopardo y las Monas",
          "El Ciervo en la fuente", "El león y la Zorra", "La Cierva y el Cervato",
          "El Labrador y la Cigüeña", "La Serpiente y la Lima", "El Calvo y la Mosca",
          "Los dos Amigos y el Oso", "La Águila, la Gata y la Jabalina"],
    "II": ["El León con su ejército", "La Lechera", "El Asno sesudo", "El Zagal y las Ovejas",
           "La Águila, la Corneja y la Tortuga", "El Lobo y la Cigüeña", "El Hombre y la Culebra",
           "El Pájaro herido de una flecha", "El Pescador y el Pez", "El Gorrión y la Liebre",
           "Júpiter y la Tortuga", "El Charlatán", "El Milano y las Palomas", "Las dos Ranas",
           "El parto de los Montes", "Las Ranas pidiendo Rey", "El Asno y el Caballo",
           "El Cordero y el Lobo", "Las Cabras y los Chivos", "El Caballo y el Ciervo"],
    "III": ["La Águila y el Cuervo", "Los Animales con peste", "El Milano enfermo",
            "El León envejecido", "La Zorra y la Gallina", "La Cierva y el León",
            "El León enamorado", "Congreso de los Ratones", "El Lobo y la Oveja",
            "El Hombre y la Pulga", "El Cuervo y la Serpiente", "El Asno y las Ranas",
            "El Asno y el Perro", "El León y el Asno cazando", "El Charlatán y el Rústico"],
    "IV": ["La Mona corrida", "El Asno y Júpiter", "El Cazador y la Perdiz",
           "El Viejo y la Muerte", "El Enfermo y el Médico", "La Zorra y las Uvas",
           "La Cierva y la Viña", "El Asno cargado de reliquias", "Los dos Machos",
           "El Cazador y el Perro", "La Tortuga y el Águila", "El León y el Ratón",
           "Las Liebres y las Ranas", "El Gallo y el Zorro", "El León y la Cabra",
           "La Hacha y el Mango", "La Onza y los Pastores", "El Grajo vano",
           "El Hombre y la Comadreja", "Batalla de las Comadrejas y los Ratones",
           "El León y la Rana", "El Ciervo y los Bueyes", "Los Navegantes",
           "El Torrente y el Río", "El León, el Lobo y la Zorra"],
    "V": ["Los Ratones y el Gato", "El Asno y el Lobo", "El Asno y el Caballo",
          "El Labrador y la Providencia", "El Asno vestido de León",
          "La Gallina de los huevos de oro", "Los Cangrejos", "Las Ranas sedientas",
          "El Cuervo y el Zorro", "Un Cojo y un Picarón", "El Carretero y Hércules",
          "La Zorra y el Chivo", "El Lobo, la Zorra y el Mono juez", "Los dos Gallos",
          "La Mona y la Zorra", "La Gata mujer", "La Leona y el Oso",
          "El Lobo y el Perro flaco", "La Oveja y el Ciervo", "La Alforja",
          "El Asno infeliz", "El Jabalí y la Zorra", "El Perro y el Cocodrilo",
          "La Comadreja y los Ratones", "El Lobo y el Perro"],
    "VI": ["El Pastor y el Filósofo", "El Hombre y la Fantasma", "El Jabalí y el Carnero",
           "El Raposo, la Mujer y el Gallo", "El Filósofo y el Rústico",
           "La Pava y la Hormiga", "El Enfermo y la Visión", "El Camello y la Pulga",
           "El Cerdo, el Carnero y la Cabra", "El León, el Tigre y el Caminante",
           "La Muerte", "El Amor y la Locura"],
    "VII": ["El Raposo enfermo", "Las exequias de la Leona", "El Poeta y la Rosa",
            "El Búho y el Hombre", "La Mona", "Esopo y un Ateniense",
            "Demetrio y Menandro", "Las Hormigas", "Los Gatos escrupulosos",
            "El Águila y la asamblea de los Animales", "La Paloma", "El Chivo afeitado"],
    "VIII": ["El Naufragio de Simónides", "El Filósofo y la Pulga", "El Cazador y los Conejos",
             "El Filósofo y el Faisán", "El Zapatero médico", "El Murciélago y la Comadreja",
             "La Mariposa y el Caracol", "Los dos Titiriteros", "El Raposo y el Perro"],
    "IX": ["El Gato y las Aves", "La danza pastoril", "Los dos Perros", "La Moda",
           "El Lobo y el Mastín", "La Hermosa y el Espejo", "El Viejo y el Chalán",
           "La Gata con cascabeles", "El Ruiseñor y el Mochuelo", "El Amo y el Perro",
           "Los dos Cazadores", "El Gato y el Cazador", "El Pastor", "El Tordo flautista",
           "El Raposo y el Lobo", "El Ciudadano Pastor", "El Ladrón",
           "El joven Filósofo y sus compañeros",
           "El Elefante, el Toro, el Asno y los demás Animales"],
}
LIBRO_TOMO = {"I": 1, "II": 1, "III": 1, "IV": 1, "V": 1,
              "VI": 2, "VII": 2, "VIII": 2, "IX": 2}


# ── Utilidades ───────────────────────────────────────────────────────────────

def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^\w\s]", " ", s)
    return " ".join(s.split())


def slugify(titulo: str) -> str:
    return norm(titulo).replace(" ", "-")


def _roman_seq(count: int) -> list[str]:
    vals = [(100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
            (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
    seq = []
    for num in range(1, count + 1):
        r, x = "", num
        for v, sym in vals:
            while x >= v:
                r += sym
                x -= v
        seq.append(r)
    return seq


def descargar(tomo: int) -> str:
    req = urllib.request.Request(TOMO_URLS[tomo], headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r:
        return r.read().decode("utf-8", errors="replace")


# ── Pasada 1: localizar fábulas por orden de aparición ───────────────────────

def _localizar_fabulas(soup: BeautifulSoup, tomo: int) -> list[dict]:
    """
    Devuelve una lista de fábulas en orden de aparición en el DOM, con
    metadatos básicos y una marca temporal para emparejar con los versos
    en la pasada 2. Marca = índice incremental de un contador que se
    incrementa en cada hallazgo de "Fábula X" en el DOM (en orden).
    """
    fabulas = []
    libro_actual = None

    # Iteramos sobre <h4> que contienen "Fábula X" (forma canónica del
    # marcador en este HTML), evitando los duplicados de <td>.
    for h4 in soup.find_all("h4"):
        txt = re.sub(r"\s+", " ", h4.get_text(" ")).strip()
        mlib = re.fullmatch(rf"Libro ({ROMAN})", txt)
        mfab = re.fullmatch(rf"F[aá]bula ({ROMAN})", txt)
        if mlib:
            libro_actual = mlib.group(1)
            continue
        if mfab and libro_actual and LIBRO_TOMO.get(libro_actual) == tomo:
            num = mfab.group(1)
            try:
                pos = _roman_seq(len(INDICE[libro_actual])).index(num)
                titulo = INDICE[libro_actual][pos]
            except (KeyError, ValueError):
                titulo = f"[Libro {libro_actual}, fábula {num}]"
            fabulas.append({
                "libro": libro_actual,
                "num": num,
                "titulo": titulo,
                "slug": slugify(titulo),
                "h4_node": h4,
                "estrofas": [],
            })

    # En este HTML no hay <h4> para "Libro X" — los Libros viven en <h3>.
    # Reparamos con un segundo pase sobre <h3>:
    # En realidad, el patrón del HTML observado tiene "Libro X" en un
    # nodo distinto. Detectamos también divs con texto exacto "Libro X".
    return fabulas


def _localizar_fabulas_v2(soup: BeautifulSoup, tomo: int) -> list[dict]:
    """
    Versión refinada: barremos en orden todos los elementos del documento
    buscando texto exacto "Libro X" o "Fábula X" (case-sensitive con tildes).
    Cuando encontramos "Fábula X", registramos el nodo y su posición.
    """
    fabulas = []
    libro_actual = None
    seen_fab_pos = set()  # evitar duplicados (mismo "Fábula I" en td y div)

    # find_all() devuelve en orden de aparición en el documento
    for elem in soup.find_all(True):
        # Solo nos importan elementos con texto corto (marcadores)
        # para evitar matchear texto largo que contenga la frase
        txt = elem.get_text(" ", strip=True)
        txt = re.sub(r"\s+", " ", txt).strip()
        if len(txt) > 30:
            continue

        mlib = re.fullmatch(rf"Libro ({ROMAN})", txt)
        mfab = re.fullmatch(rf"F[aá]bula ({ROMAN})", txt)

        if mlib:
            # Solo aceptar el primer hit en un grupo de duplicados consecutivos
            # (los Libros también pueden estar en td+div)
            libro_actual = mlib.group(1)
            continue

        if mfab and libro_actual and LIBRO_TOMO.get(libro_actual) == tomo:
            num = mfab.group(1)
            # Deduplicar por (libro, num) — nos quedamos con el primer hit
            key = (libro_actual, num)
            if key in seen_fab_pos:
                continue
            seen_fab_pos.add(key)
            try:
                pos = _roman_seq(len(INDICE[libro_actual])).index(num)
                titulo = INDICE[libro_actual][pos]
            except (KeyError, ValueError):
                titulo = f"[Libro {libro_actual}, fábula {num}]"
            fabulas.append({
                "libro": libro_actual,
                "num": num,
                "titulo": titulo,
                "slug": slugify(titulo),
                "marker_node": elem,
                "estrofas": [],
            })
    return fabulas


# ── Pasada 2: extraer versos y atribuirlos ───────────────────────────────────

def _clean_verso(texto: str) -> str:
    """Normaliza whitespace dentro de una celda, preservando información
    de sangría inicial (NBSP) como prefijo separable."""
    # Reemplazar tabs, saltos de línea por espacio simple
    texto = texto.replace("\t", " ").replace("\n", " ").replace("\r", " ")
    # Detectar y preservar NBSP iniciales (sangría de estrofa)
    nbsp_inicial = 0
    i = 0
    while i < len(texto) and texto[i] in ("\xa0", " "):
        if texto[i] == "\xa0":
            nbsp_inicial += 1
        i += 1
    # El resto: colapsar whitespace (incluido NBSP) a espacio simple
    resto = re.sub(r"[\s\xa0]+", " ", texto).strip()
    return "\xa0" * nbsp_inicial + resto if nbsp_inicial else resto


def _es_inicio_estrofa(verso: str, umbral_nbsp: int = 2) -> bool:
    """True si el verso empieza con >= umbral_nbsp NBSP consecutivos."""
    nbsp = 0
    for ch in verso:
        if ch == "\xa0":
            nbsp += 1
        else:
            break
    return nbsp >= umbral_nbsp


def _limpiar_sangria(verso: str) -> str:
    """Quita NBSP/whitespace inicial; usado para el texto final del .md."""
    return verso.lstrip("\xa0 ").rstrip()


def _es_verso_real(texto: str) -> bool:
    """Filtra basura: navegación, números, vacíos."""
    t = _limpiar_sangria(texto)
    if not t:
        return False
    if t in ("Arriba", "Abajo"):
        return False
    if re.fullmatch(r"\d+", t):
        return False
    return True


def _atribuir_versos(soup: BeautifulSoup, fabulas: list[dict]) -> None:
    """
    Recorre todas las celdas <td style="white-space:nowrap"> en orden y
    las atribuye a la fábula correcta según el orden de los marker_node.

    Como BeautifulSoup mantiene orden de documento, usamos sourcepos
    aproximado contando el orden lineal de descubrimiento.
    """
    # Construimos índice ordinal: a cada elemento del documento le
    # asignamos un número creciente.
    # Para asociar versos a fábula correcta, calculamos el ordinal del
    # marker_node de cada fábula y el ordinal de cada <td> de verso, luego
    # asignamos cada verso al último marker_node que lo precede.

    # 1) Asignar ordinales a todos los elementos
    ordinal = {}
    for i, elem in enumerate(soup.find_all(True)):
        ordinal[id(elem)] = i

    # 2) Ordenar fábulas por ordinal del marker
    for f in fabulas:
        f["_ord"] = ordinal[id(f["marker_node"])]
    fabulas.sort(key=lambda f: f["_ord"])

    # 3) Recorrer celdas de verso en orden y atribuir
    celdas = soup.find_all("td", style=re.compile(r"white-space:\s*nowrap"))
    idx_fab = 0
    estrofa_actual = []  # versos pendientes de cerrar como estrofa
    fabula_actual = None

    def cerrar_estrofa():
        nonlocal estrofa_actual
        if fabula_actual is not None and estrofa_actual:
            fabula_actual["estrofas"].append([_limpiar_sangria(v) for v in estrofa_actual])
        estrofa_actual = []

    for td in celdas:
        ord_td = ordinal[id(td)]

        # Avanzar a la fábula correspondiente
        while (idx_fab + 1 < len(fabulas)
               and ord_td >= fabulas[idx_fab + 1]["_ord"]):
            # cambio de fábula: cerrar estrofa pendiente en la anterior
            cerrar_estrofa()
            idx_fab += 1
            fabula_actual = fabulas[idx_fab]

        if fabula_actual is None and idx_fab < len(fabulas):
            # Aún no hemos pasado el primer marker → inicializar al primero
            if ord_td >= fabulas[0]["_ord"]:
                fabula_actual = fabulas[0]

        if fabula_actual is None:
            continue

        # Solo procesar celdas que pertenecen a la fábula actual
        # (después del marker y antes del siguiente)
        if ord_td < fabula_actual["_ord"]:
            continue

        verso_raw = _clean_verso(td.get_text(" "))
        if not _es_verso_real(verso_raw):
            continue

        # ¿Inicio de estrofa? → cerrar la anterior y comenzar nueva
        if _es_inicio_estrofa(verso_raw):
            cerrar_estrofa()

        estrofa_actual.append(verso_raw)

    # Cerrar última estrofa
    cerrar_estrofa()

    # Limpiar campos temporales
    for f in fabulas:
        del f["_ord"]
        del f["marker_node"]


def parsear_tomo(html: str, tomo: int) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    fabulas = _localizar_fabulas_v2(soup, tomo)
    _atribuir_versos(soup, fabulas)
    return fabulas


def todas() -> list[dict]:
    out = []
    for tomo in (1, 2):
        out += parsear_tomo(descargar(tomo), tomo)
    return out


# ── Cuerpo del .md ───────────────────────────────────────────────────────────

def cuerpo_markdown(estrofas: list[list[str]]) -> str:
    """
    Versos normalizados, estrofas separadas por línea en blanco.
    Normalización de diálogo: `- ` → `—` cuando sigue a inicio/espacio y
    precede mayúscula/¡/¿. Última estrofa envuelta en ***...***.
    """
    dialogo_re = re.compile(r"(^|\s)-\s*(?=[A-ZÁÉÍÓÚÑ¡¿])", re.M)

    bloques = []
    for estrofa in estrofas:
        versos = [dialogo_re.sub(lambda m: (m.group(1) or "") + "—", v) for v in estrofa]
        bloques.append("\n".join(versos))

    if not bloques:
        return ""

    if len(bloques) >= 2:
        bloques[-1] = "***\n" + bloques[-1] + "\n***"

    return "\n\n".join(bloques)


def esqueleto_md(fab: dict, fecha: str) -> str:
    return f"""---
titulo: {fab['titulo']}
# resumen: pendiente de curaduría
fecha: {fecha}   # MARCADOR — fijar la fecha real al publicar
borrador: true
# --- Taxonomía: PENDIENTE DE CURADURÍA (rellenar antes de build) ---
# personajes: []          # lista cerrada en src/utils/taxonomia.ts
# temas: []               # al menos uno, obligatorio
forma: verso
tradicion: hispanica
autor: felix-maria-de-samaniego
curador: Don Alejandro
es_seudonimo: true
nombre_real: Alejandro Morales Loaiza
# --- Procedencia ---
# Libro {fab['libro']}, Fábula {fab['num']} — ed. Emilio Palacios Fernández,
# Biblioteca Virtual Miguel de Cervantes (texto de dominio público).
# Última estrofa envuelta en ***...*** como hipótesis de moraleja; revisar.
---
{cuerpo_markdown(fab['estrofas'])}
"""


# ── CLI ──────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Extractor de fábulas de Samaniego v3")
    ap.add_argument("--libro", help="Libro a generar (I, II, ... IX)")
    ap.add_argument("--out", default="./fabulas_salida", help="Carpeta de salida")
    ap.add_argument("--listar", action="store_true", help="Listar fábulas parseadas")
    args = ap.parse_args()

    fabulas = todas()
    print(f"Parseadas {len(fabulas)} fábulas de Cervantes Virtual.", file=sys.stderr)

    if args.listar:
        for f in fabulas:
            n_estrofas = len(f["estrofas"])
            n_versos = sum(len(e) for e in f["estrofas"])
            print(f"  L{f['libro']:<4} F{f['num']:<6} estrofas={n_estrofas:<3} versos={n_versos:<4} {f['slug']}")
        return

    if args.libro:
        libro = args.libro.upper()
        sel = [f for f in fabulas if f["libro"] == libro]
        if not sel:
            sys.exit(f"Libro '{libro}' no encontrado. Usa I…IX.")
        out = Path(args.out)
        out.mkdir(parents=True, exist_ok=True)
        hoy = datetime.date.today().isoformat()
        for f in sel:
            destino = out / f"{f['slug']}.md"
            destino.write_text(esqueleto_md(f, hoy), encoding="utf-8")
            print(f"  escrito  {destino} ({len(f['estrofas'])} estrofas, "
                  f"{sum(len(e) for e in f['estrofas'])} versos)")
        print(f"\n{len(sel)} esqueletos del Libro {libro} en {out}/")
        return

    ap.print_help()


if __name__ == "__main__":
    main()
