const fs = require('fs');
const path = require('path');

const dataRaw = fs.readFileSync('c:/Users/Facun/OneDrive/Escritorio/PROYECTOS PERSONALES/PRECIOS/BRUJULA-DE-PRECIOS/data/output_maxiconsumo.json', 'utf8');
const data = JSON.parse(dataRaw);

const queryMap = {
  // Almacén
  aceite:       { sector: 'Almacén',    subcategoria: 'Aceites' },
  condimento:   { sector: 'Almacén',    subcategoria: 'Condimentos' },
  arroz:        { sector: 'Almacén',    subcategoria: 'Arroz' },
  cacao:        { sector: 'Almacén',    subcategoria: 'Cacao y Café' },
  caldos:       { sector: 'Almacén',    subcategoria: 'Caldos y Sopas' },
  cereales:     { sector: 'Almacén',    subcategoria: 'Cereales' },
  conservas:    { sector: 'Almacén',    subcategoria: 'Conservas' },
  dulces:       { sector: 'Almacén',    subcategoria: 'Dulces' },
  encurtidos:   { sector: 'Almacén',    subcategoria: 'Encurtidos' },
  azucar:       { sector: 'Almacén',    subcategoria: 'Azúcar' },
  galletitas:   { sector: 'Almacén',    subcategoria: 'Galletitas' },
  harina:       { sector: 'Almacén',    subcategoria: 'Harinas' },
  te:           { sector: 'Almacén',    subcategoria: 'Infusiones' },
  fideos:       { sector: 'Almacén',    subcategoria: 'Pastas' },
  polenta:      { sector: 'Almacén',    subcategoria: 'Polenta' },
  snacks:       { sector: 'Almacén',    subcategoria: 'Snacks' },
  yerba:        { sector: 'Almacén',    subcategoria: 'Yerba' },
  // Bebidas
  agua:         { sector: 'Bebidas',    subcategoria: 'Aguas' },
  cerveza:      { sector: 'Bebidas',    subcategoria: 'Cervezas' },
  gaseosa:      { sector: 'Bebidas',    subcategoria: 'Gaseosas' },
  jugo:         { sector: 'Bebidas',    subcategoria: 'Jugos' },
  vino:         { sector: 'Bebidas',    subcategoria: 'Vinos' },
  // Limpieza
  detergente:   { sector: 'Limpieza',   subcategoria: 'Detergentes' },
  lavandina:    { sector: 'Limpieza',   subcategoria: 'Lavandina' },
  limpiador:    { sector: 'Limpieza',   subcategoria: 'Limpiadores' },
};

const counts = {};
data.forEach(item => {
    if (item.precio <= 0) return;
    
    let meta = queryMap[item.query?.toLowerCase()];
    
    if (!meta || ['almacen', 'bebidas', 'frescos', 'limpieza', 'perfumeria', 'perfumería'].includes(item.query?.toLowerCase())) {
      const nombreLower = item.nombre.toLowerCase();
      const coincidencia = Object.entries(queryMap).find(([key]) => nombreLower.includes(key));
      if (coincidencia) {
        meta = coincidencia[1];
      }
    }

    const sector = item.sector || meta?.sector || 'Almacén';
    const subcat = meta?.subcategoria || sector;
    
    if (!counts[sector]) counts[sector] = { total: 0, subcats: {} };
    counts[sector].total++;
    if (!counts[sector].subcats[subcat]) counts[sector].subcats[subcat] = 0;
    counts[sector].subcats[subcat]++;
});

console.log(JSON.stringify(counts, null, 2));
