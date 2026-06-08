import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivihcbceyzsvaduryuqv.supabase.co",
  "sb_publishable_ZIW6cmjZ-WRsUzQJvwtmsQ_t6hlzbJp",
);

// Official 61 constituencies
const CANONICAL = [
  "Bobirwa", "Boteti East", "Boteti West", "Charleshill", "Chobe",
  "Francistown East", "Francistown South", "Francistown West",
  "Gabane / Mankgodi",
  "Gaborone Bonnington North", "Gaborone Bonnington South",
  "Gaborone Central", "Gaborone North", "Gaborone South",
  "Gamalete", "Ghanzi",
  "Goodhope - Mmathethe",
  "Jwaneng - Mabutsane",
  "Kanye East", "Kanye West",
  "Kgalagadi North", "Kgalagadi South",
  "Kgatleng Central", "Kgatleng East", "Kgatleng West",
  "Lentsweletau - Lephepe", "Letlhakeng", "Lobatse",
  "Mahalapye East", "Mahalapye West",
  "Maun East", "Maun North", "Maun West",
  "Mmadinare", "Mmopane - Metsimotlhabe",
  "Mogoditshane East", "Mogoditshane West",
  "Molepolole North", "Molepolole South",
  "Moshupa - Manyana",
  "Nata - Gweta", "Ngami", "Nkange",
  "Okavango East", "Okavango West", "Palapye",
  "Selibe Phikwe East", "Selibe Phikwe West",
  "Serowe North", "Serowe South", "Serowe West",
  "Shashe West", "Shoshong", "Takatokwane",
  "Tati East", "Tati West",
  "Thamaga - Kumakwane", "Tlokweng", "Tonota",
  "Tswapong North", "Tswapong South",
];

// Case-insensitive lookup index: lowercase → canonical
const LOWER_TO_CANONICAL = {};
for (const c of CANONICAL) LOWER_TO_CANONICAL[c.toLowerCase()] = c;

// Explicit overrides: raw DB value (exact) → canonical or null
// These handle cases that can't be resolved by case-insensitive match alone:
// - "Bonnington North/South" (missing "Gaborone" prefix)
// - alternate spellings / abbreviations / clearly invalid
const OVERRIDE = {
  // ── Gabane variants ──
  "Gabane Mankgodi - Constituency South-East District": "Gabane / Mankgodi",
  "Gabane Mmankgodi": "Gabane / Mankgodi",
  "Gabane- Mmankgodi": "Gabane / Mankgodi",
  "Gabane -Mmankgodi": "Gabane / Mankgodi",
  "Gabane-Mankgodi": "Gabane / Mankgodi",
  "Gabane-Mmankgodi": "Gabane / Mankgodi",
  "Gabane-Mmankgodi Constituency": "Gabane / Mankgodi",
  "Gabane-Mmankgodi (formerly Kweneng South East)": "Gabane / Mankgodi",
  "Gabane/ Mankgodi": "Gabane / Mankgodi",
  "Gabane/Mmankgodi": "Gabane / Mankgodi",
  "Gabane/Mankgodi": "Gabane / Mankgodi",
  "Gabane -Mankgodi": "Gabane / Mankgodi",
  "Gabane MankgodiConstituency": "Gabane / Mankgodi",
  "GABANE- MMANKGODI": "Gabane / Mankgodi",
  "Gabane - Mankgodi": "Gabane / Mankgodi",

  // ── Gaborone Bonnington (missing "Gaborone" prefix) ──
  "Bonnington North": "Gaborone Bonnington North",
  "Bonnington north": "Gaborone Bonnington North",
  "bonnington north": "Gaborone Bonnington North",
  "Bonnington South": "Gaborone Bonnington South",
  "Bonnington south": "Gaborone Bonnington South",
  "Bonington south": "Gaborone Bonnington South",
  "Bonninton": "Gaborone Bonnington South",
  "Bonninton North": "Gaborone Bonnington North",
  "Bonninton North": "Gaborone Bonnington North",
  "Bonninton south": "Gaborone Bonnington South",
  "Bonington North": "Gaborone Bonnington North",
  "Bonnington west": null,
  "Gaborone Boningtin South": "Gaborone Bonnington South",
  "Gaborone Bonnington": null,
  "Gaborone Bonington South": "Gaborone Bonnington South",
  "Gaborone Bonninton South": "Gaborone Bonnington South",
  "Gaborone bornington south": "Gaborone Bonnington South",
  "Gaborone Bonnington south": "Gaborone Bonnington South",
  "gaborone bonnington north": "Gaborone Bonnington North",
  "Gaborone bonnington south": "Gaborone Bonnington South",
  "Gaborone Bennington North": "Gaborone Bonnington North",
  "Bonningtin South": "Gaborone Bonnington South",
  "Bonninton North": "Gaborone Bonnington North",
  "Gaborone-Bonnington": null,
  "Gaborone Bonington North": "Gaborone Bonnington North",
  "Bonninton south": "Gaborone Bonnington South",

  // ── Gaborone other ──
  "Gaborone": null,
  "GABORONE": null,
  "Gaborone West": null,
  "Gaborone west": null,
  "Gaborone East": null,
  "Gaborone east": null,
  "Gaborone Tsholofelo": null,
  "Gaborone Tlokweng": "Tlokweng",
  "Gaborone Village": null,
  "Gaborone North West": "Gaborone North",
  "Gaborone North Constituency": "Gaborone North",
  "Gaborone Central Constituency": "Gaborone Central",
  "Gaborone centra": "Gaborone Central",
  "Gaborone-South": "Gaborone South",
  "South Gaborone": "Gaborone South",
  "Gaborone Gaborone sauth": null,
  "Gaborone. Broadhurst. Tsholofelo": null,
  "Central Gaborone": "Gaborone Central",
  "Gaborone White City": null,
  "Gaborone white city": null,
  "Tawana Gaborone": null,
  "Gaborone- Block8": null,
  "Block8 Gaborone": null,
  "Block 8": null,
  "Block 3": null,
  "block 9": null,
  "Gaborone, Ledumang": null,
  "Gaborone Tati": null,

  // ── Goodhope ──
  "Goodhope - Mmathethe": "Goodhope - Mmathethe",
  "Goodhope-Mmathethe": "Goodhope - Mmathethe",
  "Goodhope Mmathethe": "Goodhope - Mmathethe",
  "Goodhope_Mmathethe": "Goodhope - Mmathethe",
  "Goodhope -Mmathethe": "Goodhope - Mmathethe",
  "GoodHope- Mmathethe": "Goodhope - Mmathethe",
  "Good Hope- Mmathethe": "Goodhope - Mmathethe",
  "Goodhope/ Mmathethe": "Goodhope - Mmathethe",
  "Goodhope-Mathethe": "Goodhope - Mmathethe",
  "Good-Hope/Mmathethe": "Goodhope - Mmathethe",
  "Goodbope-Mmathethe": "Goodhope - Mmathethe",
  "Goodhop-Mmathethe": "Goodhope - Mmathethe",
  "Goodhope": null,
  "GOODHOPE": null,
  "Goodhope-Mabule": null,
  "Goodhope Mabule": null,
  "Mathethe/ Molapowabojang constituency": null,
  "Mmathethe Digawana": null,

  // ── Jwaneng ──
  "Jwaneng – Mabutsane": "Jwaneng - Mabutsane",
  "Jwaneng -Mabutsane": "Jwaneng - Mabutsane",
  "Jwaneng-Mabutsane": "Jwaneng - Mabutsane",
  "Jwaneng Mabutsane constituency": "Jwaneng - Mabutsane",
  "Jwaneng - Mabutsane Constituency": "Jwaneng - Mabutsane",
  "Jwaneng": null,
  "Mabutsane constituency": "Jwaneng - Mabutsane",
  "Mabutsane": "Jwaneng - Mabutsane",

  // ── Kanye ──
  "Kanye": null,
  "Kanye North": null,
  "Kanye South": null,
  "kanye south": null,
  "Kanye south": null,
  "KANYE SOUTH": null,
  "Kanye-North": null,
  "Central Kanye": null,

  // ── Kgatleng ──
  "Kgatleng": null,
  "Kgatleng District": null,
  "Kgatleng north": null,
  "Kgatleng Boseja South": null,
  "Kgatleng South": null,
  "Mochudi": null,
  "Mochudi East": null,
  "Mochudi West": null,
  "Mochudi, Central": null,
  "Mochudi, Boseja Central": null,
  "MOCHUDI EAST": null,
  "Boseja": null,
  "Mochudi, Central": null,

  // ── Lentsweletau ──
  "Lentsweletau": "Lentsweletau - Lephepe",
  "Kopong-lentsweletau constituency": "Lentsweletau - Lephepe",
  "Kopong lentsweletau": "Lentsweletau - Lephepe",
  "kopong lentsweletau": "Lentsweletau - Lephepe",
  "Lentsweletau/lephephe": "Lentsweletau - Lephepe",
  "Lentsweletau - Lephepe": "Lentsweletau - Lephepe",
  "Kopong": null,
  "kopong": null,

  // ── Lobatse ──
  "Lobatse Constituency": "Lobatse",
  "Lobatse district": "Lobatse",
  "Lobatse thema": "Lobatse",
  "South East ,Lobatse": null,
  "South East, Lobatse": null,
  "Tsopeng south-Lobatse": null,
  "Pitikwe ward, Lobatse": null,
  "Ramotswa Lesetlhana": null,

  // ── Mahalapye ──
  "Mahalapye": null,
  "central Mahalapye": null,
  "Mahalapye South": null,
  "Mahalaye South": null,
  "Mahalapye east": "Mahalapye East",
  "Mahalapye west": "Mahalapye West",
  "MAHALAPYE WEST": "Mahalapye West",

  // ── Maun ──
  "Maun East Constituency": "Maun East",
  "Maun east": "Maun East",
  "Maun north": "Maun North",
  "Maun west": "Maun West",

  // ── Mmadinare ──
  "Mmadinare": "Mmadinare",
  "MMADINARE": "Mmadinare",
  "Madinare": "Mmadinare",
  "Mmadinare Constituency": "Mmadinare",
  "Mmadinare West": null,

  // ── Mmopane ──
  "Mmopane - Metsimotlhabe": "Mmopane - Metsimotlhabe",
  "Mmopane-Metsimotlhabe": "Mmopane - Metsimotlhabe",
  "Mmopane- Metsimotlhabe": "Mmopane - Metsimotlhabe",
  "Mmopane-Metsimotlhabe constituency": "Mmopane - Metsimotlhabe",
  "Mmopane block 1 Constituency": "Mmopane - Metsimotlhabe",
  "Metsimotlhabe": "Mmopane - Metsimotlhabe",
  "Mmopane": null,
  "Mmopane,Gaborone": null,

  // ── Mogoditshane ──
  "Mogoditshane": null,
  "MOGODITSHANE": null,
  "Mogoditshane west": "Mogoditshane West",
  "MOGODITSHANE EAST": "Mogoditshane East",
  "MOGODITSHANE WEST": "Mogoditshane West",
  "Mogoditshane east": "Mogoditshane East",
  "Mogoditshane/ Thamaga": null,
  "Mogoditshane - Thamaga": null,
  "Mogoditshane/Thamaga": null,
  "mogoditshane": null,
  "Mogoditshane central": null,

  // ── Molepolole ──
  "Molepolole": null,
  "molepolole": null,
  "Molepololole North": "Molepolole North",
  "MOLEPOLOLE NORTH": "Molepolole North",
  "Molepolole North Tshosa ward": "Molepolole North",
  "Molepolole south": "Molepolole South",
  "Molepolole north": "Molepolole North",

  // ── Moshupa ──
  "Moshupa - Manyana": "Moshupa - Manyana",
  "Moshupa-Manyana": "Moshupa - Manyana",
  "moshupa-manyana": "Moshupa - Manyana",
  "Moshupa-Manyana Constituency": "Moshupa - Manyana",
  "Moshupa Manyana": "Moshupa - Manyana",
  "Moshupa manyana": "Moshupa - Manyana",
  "Moshupa -manyana": "Moshupa - Manyana",
  "MOSHUPA MANYANA CONSTITUENCY": "Moshupa - Manyana",
  "Moshupa": null,
  "Moshawana": null,

  // ── Nata ──
  "Nata -Gweta": "Nata - Gweta",
  "Nata – Gweta": "Nata - Gweta",
  "NATA GWETA": "Nata - Gweta",
  "Nata-Gweta": "Nata - Gweta",
  "Nata Gweta": "Nata - Gweta",
  "Nata/Gweta": "Nata - Gweta",
  "Nata Gweta Constituency": "Nata - Gweta",
  "Nata-gweta": "Nata - Gweta",
  "Central Nata Gweta": "Nata - Gweta",
  "Nata constituency": null,
  "Nata-Gweta constituency": "Nata - Gweta",

  // ── Ngami ──
  "Ngamiland": "Ngami",
  "Ngamiland district": "Ngami",

  // ── Nkange ──
  "Nkange constituecy": "Nkange",
  "Nkange constituency": "Nkange",
  "Nkange Constituancy": "Nkange",
  "Nkange Constituency": "Nkange",
  "NKANGE": "Nkange",
  "Nkange contituency": "Nkange",
  "Nkange Tutume": null,

  // ── Okavango ──
  "Okavango west": "Okavango West",
  "OKAVANGO WEST": "Okavango West",
  "Okavango East": "Okavango East",
  "OKAVANGO EAST": "Okavango East",
  "Okavango district": null,

  // ── Palapye ──
  "Palapye Contituency": "Palapye",
  "Palapye Constituency": "Palapye",
  "PALAPYE": "Palapye",
  "palapye": "Palapye",
  "Palapye East": null,
  "palapye central": null,
  "Palapye-Central": null,
  "Palapye-serowe sub District": null,
  "Palapye 454": null,

  // ── Ghanzi (Gantsi) ──
  "Ghanzi North": "Ghanzi",
  "Ghanzi South": null,
  "Ghandzi": "Ghanzi",
  "GHANZI": "Ghanzi",
  "Gantsi North Constituency": "Ghanzi",
  "Gantsi constituency": "Ghanzi",
  "Gantsi South": null,
  "Gantsi North": "Ghanzi",
  "Ghanzi district": "Ghanzi",

  // ── Gamalete ──
  "Gamalete Constituency": "Gamalete",
  "gamalete constituency": "Gamalete",
  "Gamalete- Mothubakwane": "Gamalete",
  "GaMalete": "Gamalete",
  "Gmalate": "Gamalete",

  // ── Selibe Phikwe ──
  "Selebi Phikwe East": "Selibe Phikwe East",
  "Selebi Phikwe West": "Selibe Phikwe West",
  "Selibe Phikwe": null,
  "Selibe phikwe west": "Selibe Phikwe West",
  "SELIBE PHIKWE EAST": "Selibe Phikwe East",
  "Selebi- Phikwe": null,
  "phikwe east": "Selibe Phikwe East",

  // ── Serowe ──
  "Serowe": null,
  "Serowe south": "Serowe South",
  "Serowe west": "Serowe West",
  "serowe north": "Serowe North",
  "Serowe North Constituency": "Serowe North",
  "Serowe north constituency": "Serowe North",
  "Serowe west Constituency": "Serowe West",
  "Serowe South Constituency": "Serowe South",
  "Serowe North East": null,

  // ── Shashe ──
  "shashe west": "Shashe West",
  "Shashe west": "Shashe West",
  "shashe contituency": "Shashe West",
  "shashe west constituency": "Shashe West",
  "Shashe": null,
  "Shashe East": null,
  "Shashe West constituency": "Shashe West",

  // ── Shoshong ──
  "Shoshong Constituency": "Shoshong",
  "Shoshong constituency": "Shoshong",
  "SHOSHONG CONSTITUENCY": "Shoshong",
  "SHOSHONG SOUTH": null,

  // ── Takatokwane ──
  "Takatokwane Constituency": "Takatokwane",
  "Takatokwane constituency": "Takatokwane",
  "TAKATOKWANE": "Takatokwane",

  // ── Tati ──
  "Tati east": "Tati East",
  "TATI EAST": "Tati East",
  "Tati west": "Tati West",
  "TATI WEST": "Tati West",
  "Tatisiding East": null,
  "Tati-east": "Tati East",
  "Tati -West Constituency": "Tati West",
  "Tati we": "Tati West",

  // ── Thamaga ──
  "Thamaga - Kumakwane": "Thamaga - Kumakwane",
  "Thamaga-Kumakwane": "Thamaga - Kumakwane",
  "Thamaga/Kumakwane": "Thamaga - Kumakwane",
  "Kumakwane - Thamaga": "Thamaga - Kumakwane",
  "Thamaga-nkumakwane": "Thamaga - Kumakwane",
  "THAMAGA KUMAKWANE": "Thamaga - Kumakwane",
  "Thamaga": null,
  "Thamaga Central": null,

  // ── Tlokweng ──
  "Tlokweng-Mmokolodi": "Tlokweng",
  "TLOKWENG": "Tlokweng",
  "Tlokweng Constituency": "Tlokweng",
  "Tlokweng Constitutiency": "Tlokweng",
  "Tlokweng constituency": "Tlokweng",
  "tlokweng": "Tlokweng",
  "Maratanang tlokweng": "Tlokweng",

  // ── Tonota ──
  "TONOTA": "Tonota",
  "tonota": "Tonota",
  "Tonota South": null,
  "Tonota south": null,
  "Tonota east": null,
  "Tonota East": null,
  "Tonota west": null,
  "Tonota West": null,
  "Tonota District": null,
  "Tonota South East": null,
  "Tonota Constituency": "Tonota",
  "Tonota constituency": "Tonota",
  "Tonota continuency": "Tonota",
  "Tonota Consittuency": "Tonota",
  "Tonota district": null,
  "Tonota Central": null,
  "Tonota south east": null,

  // ── Tswapong ──
  "Tswapong": null,
  "Tswapong north": "Tswapong North",
  "Tswapong south": "Tswapong South",
  "Tswapong north constituency": "Tswapong North",
  "Tswapong north": "Tswapong North",
  "Tswapong south": "Tswapong South",
  "Tswapong North Constituency": "Tswapong North",
  "TSWAPONG NORTH": "Tswapong North",

  // ── Francistown ──
  "Francistown": null,
  "Francistown Constituency": null,
  "Francistown east": "Francistown East",
  "Francistown south": "Francistown South",
  "Francistown west": "Francistown West",
  "Fancistown": null,

  // ── Boteti ──
  "Boteti": null,
  "Boteti east": "Boteti East",
  "Boteti west": "Boteti West",
  "Boteti East Constituency": "Boteti East",
  "Boteti east constituency": "Boteti East",
  "Boteti South": null,
  "Boteti west constituency": "Boteti West",

  // ── Kgalagadi ──
  "Kgalagadi south": "Kgalagadi South",
  "Kgalagadi north": "Kgalagadi North",
  "Kgalagadi District": null,

  // ── Kgatleng ──
  "kgatleng central": "Kgatleng Central",
  "kgatleng west": "Kgatleng West",
  "Kgatleng east": "Kgatleng East",
  "Kgatleng west": "Kgatleng West",
  "KGATLENG EAST": "Kgatleng East",
  "Kgatleng central": "Kgatleng Central",

  // ── Lerala / Ramotswa / Tutume ──
  "Lerala": null,
  "Lerala _ Maunatlala Costituency": null,
  "Lerala-Maunatlala": null,
  "Lerala /Maunatala": null,
  "Lerala/Maunatlala": null,
  "Ramotswa": null,
  "Ramotswa south": null,
  "Tutume": null,
  "Tutume Sub District": null,
  "Tutume Costituency": null,
  "Tutume district": null,
  "Tutume District": null,
  "Bobonong": null,
  "Bobonong/Bobirwa Constituency": null,
  "Bobirwa Constituency": "Bobirwa",
  "BOBIRWA": "Bobirwa",

  // ── Kweneng ──
  "Kweneng": null,
  "Kweneng north": null,
  "Kweneng district": null,
  "kweneng District": null,
  "Kweneng District": null,
  "Kweneng East": null,
  "Kweneng West": null,
  "Kweneng  south": null,

  // ── Phakalane ──
  "Phakalane": "Tlokweng",

  // ── Kasane / Kazungula / Chobe ──
  "Kasane": "Chobe",
  "Kazungula": "Chobe",
  "Kazungula west": null,
  "Chobe district": "Chobe",
  "Chobe constituency": "Chobe",
  "Chobe Constituency": "Chobe",
  "CHOBE": "Chobe",

  // ── Gaborone North/South misc ──
  "North East": null,
  "north east": null,
  "North East district": null,
  "North East constituency": null,
  "Northeast": null,
  "North West District": null,
  "North west": null,
  "North": null,
  "South": null,
  "South East": null,
  "south east": null,
  "South east": null,
  "Southeast District": null,
  "Southern district": null,
  "Southern District": null,
  "Southern constituency": null,
  "Southern Constituency": null,
  "Southern": null,
  "Southern District-Tlokweng": null,
  "Central": null,
  "central": null,
  "CENTRAL": null,
  "Central district": null,
  "Central District": null,
  "LEDUMADUMANE": null,
  "Ledumadumane West": null,
  "Central Gaborone": "Gaborone Central",

  // ── Sefhare ──
  "Sefhare - Ramokgonami": null,
  "Sefhare-Ramokgonami": null,
  "Sefhare Ramokgonami constituency": null,
  "Sefhare_ Ramokgonami": null,
  "Sefhare Ramokgonami": null,

  // ── Invalid / addresses / wards / names ──
  "Babusi, Extension 14": null,
  "Phakalane": "Tlokweng",
  "Extension 3": null,
  "Satellite": null,
  "Block 8": null,
  "Block 3": null,
  "block 9": null,
  "Phase 1": null,
  "Maraleng": null,
  "Dibete-Poloka": null,
  "Bokaa": null,
  "Borolong": null,
  "Gakuto": null,
  "Magopane": null,
  "Magotlhwane": null,
  "Makaleng": null,
  "Matshelagabedi": null,
  "Mmatseta": null,
  "Moeti": null,
  "Nswazwi": null,
  "Letlhakane": null,
  "Letlhakene": null,
  "Letlhakane east": null,
  "Letlhakane North": null,
  "Letlhakane West": null,
  "Letlhakeng constituency": "Letlhakeng",
  "Letlhakeng District": null,
  "Disana": null,
  "Jaxau": null,
  "Otse north": null,
  "Senyedimane": null,
  "Boswelatlou": null,
  "Mmathethe Digawana": null,
  "Gaborone Tsholofelo": null,
  "Kgalagadi District": null,
  "Tsabong": null,
  "North East": null,
  "Raserura": null,
  "Ngwaketsi east": null,
  "Ngwaketse": null,
  "Ngwaketsi West": null,
  "Lesetlhana": null,
  "Lesetlhana North": null,
  "Lesetlhana east": null,
  "Khwai-Sankoyo": null,
  "Gumare South": null,
  "Gumare North": null,
  "Lotsane": null,
  "Tsienyane north": null,
  "Mathathane": null,
  "Mmadinare West": null,
  "Khumas": null,
  "Khomas": null,
  "Monarch": null,
  "Monarch west": null,
  "Manyanda": null,
  "Lekgwapheng": null,
  "Bohlabela": null,
  "Bophirima": null,
  "Malotwana": null,
  "Mokapela": null,
  "Mafitlakgosi": null,
  "Tshwaragano": null,
  "Marang": null,
  "Matebeleng": null,
  "Madiba": null,
  "Kooneosi": null,
  "Tshiamo": null,
  "Omaweneno": null,
  "Thema 2": null,
  "Shashe East": null,
  "Botshabelo": null,
  "Ikageng ward": null,
  "Masetlheng ward": null,
  "Sesinyi Ward": null,
  "Old kgosing": null,
  "KGOSING": null,
  "RATHOLO": null,
  "MAREKO": null,
  "NWDC": null,
  "Airwing": null,
  "Metlhabeng , Tlokweng": null,
  "Khudiring, Boatle": null,
  "Mmaphula Central": null,
  "Mmaphula East": null,
  "Onyanya constituency": null,
  "BAMALETE CONSTITUENCY": null,
  "Tswapong north": "Tswapong North",
  "Mochudi, Boseja Central": null,
  "Peleng East": null,
  "Senete": null,
  "Gamalete Constituency": "Gamalete",
  "Maulane ward": null,
  "Moshawana": null,
  "Lentsweletau/lephephe": "Lentsweletau - Lephepe",
  "Kgalagadi south": "Kgalagadi South",
  "N/A": null,
  "Not specified": null,
  "S": null,
  "KASEMBA": null,
  "Newstance": null,
  "Extension 3": null,
  "Helen": null,
  "Leah": null,
  "Nelly": null,
  "Precious": null,
  "Cathrine Mpho Gabototwe": null,
  "Omphile Queen Mosutlhane": null,
  "Botswana Congress Party": null,
  "Siviya": null,
  "siviya": null,
  "Manyanda": null,
  "Lotsane": null,
  "North west": null,
  "NORTH WEST": null,
  "Okavango district": null,
  "Motorcar Lehlabula": null,
  "Morale": null,
  "Satellite": null,
  "Moshupa": null,
  "Mmopane": null,
};

// ── Resolve function ──────────────────────────────────────────────────────────

function resolve(raw) {
  if (!raw) return { skip: true };
  const trimmed = raw.trim();
  if (!trimmed) return { skip: true };

  // 1. Exact canonical match → already good
  const canonicalSet = new Set(CANONICAL);
  if (canonicalSet.has(trimmed)) return { canonical: trimmed, alreadyCanon: true };

  // 2. Explicit override
  if (trimmed in OVERRIDE) return { canonical: OVERRIDE[trimmed] };

  // 3. Case-insensitive canonical match
  const lower = trimmed.toLowerCase();
  if (lower in LOWER_TO_CANONICAL) return { canonical: LOWER_TO_CANONICAL[lower] };

  // 4. Unknown
  return { unknown: true, value: trimmed };
}

// ── Fetch ALL rows with pagination ───────────────────────────────────────────

const DRY_RUN = !process.argv.includes("--apply");
if (DRY_RUN) console.log("DRY RUN — pass --apply to execute updates\n");

const PAGE = 1000;
let allRows = [];
let from = 0;

while (true) {
  const { data, error } = await supabase
    .from("applications")
    .select("id, constituency")
    .not("constituency", "is", null)
    .neq("constituency", "")
    .range(from, from + PAGE - 1);

  if (error) { console.error("Fetch error:", error.message); process.exit(1); }
  if (!data || data.length === 0) break;
  allRows = allRows.concat(data);
  if (data.length < PAGE) break;
  from += PAGE;
}

console.log(`Fetched ${allRows.length} rows with non-null constituency.\n`);

// Group changes
const changes = {};
let alreadyCanonical = 0;
const unknowns = {};

for (const row of allRows) {
  const r = resolve(row.constituency);
  if (r.skip) continue;
  if (r.alreadyCanon) { alreadyCanonical++; continue; }
  if (r.unknown) { unknowns[r.value] = (unknowns[r.value] || 0) + 1; continue; }

  const canonical = r.canonical;
  const raw = (row.constituency || "").trim();
  if (canonical === raw) { alreadyCanonical++; continue; }

  const key = `${raw}|||${canonical}`;
  if (!changes[key]) changes[key] = { from: raw, canonical, ids: [] };
  changes[key].ids.push(row.id);
}

const unknownList = Object.entries(unknowns).sort((a, b) => b[1] - a[1]);
console.log(`Already canonical: ${alreadyCanonical}`);
console.log(`Unknown (will be ignored): ${unknownList.length} distinct values`);
if (unknownList.length > 0) {
  for (const [v, n] of unknownList.slice(0, 20)) console.log(`  [${n}] "${v}"`);
  if (unknownList.length > 20) console.log(`  ... and ${unknownList.length - 20} more`);
}
console.log(`\nChanges to apply: ${Object.keys(changes).length} distinct transformations\n`);
for (const { from, canonical, ids } of Object.values(changes)) {
  const target = canonical === null ? "null (cleared)" : `"${canonical}"`;
  console.log(`  [${ids.length}] "${from}" → ${target}`);
}

if (DRY_RUN) { console.log("\nRe-run with --apply to commit."); process.exit(0); }

// ── Apply ────────────────────────────────────────────────────────────────────

console.log("\nApplying...");
let totalUpdated = 0, errors = 0;

for (const { from, canonical, ids } of Object.values(changes)) {
  const BATCH = 200;
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const { error: err } = await supabase
      .from("applications")
      .update({ constituency: canonical })
      .in("id", batch);
    if (err) { console.error(`  ERROR "${from}": ${err.message}`); errors++; }
    else totalUpdated += batch.length;
  }
  const target = canonical === null ? "null" : `"${canonical}"`;
  console.log(`  ✓ [${ids.length}] "${from}" → ${target}`);
}

console.log(`\nDone. Updated ${totalUpdated} rows. Errors: ${errors}`);
