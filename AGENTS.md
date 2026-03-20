# BRÚJULA MAYORISTA — AGENTS.md

## Stack
Next.js 16 App Router, TypeScript estricto, TailwindCSS v4,
Framer Motion v11, ReactBits (local), GSAP, Radix UI

## Design tokens
--bg: #f7f9fb
--surface: #ffffff  
--surface-2: #f2f4f6
--green: #006d38
--green-tint: #e8f5ee
--bomb: #ff4700
--bomb-tint: #fff1ec
--amber: #fea619
--text-1: #0f172a
--text-2: #64748b

## Tipografía
Manrope → precios, títulos, números grandes
Inter → cuerpo, labels, secundario

## Regla No-Line ABSOLUTA
Cero borders 1px sólidos para separar secciones.
Jerarquía SOLO por color de fondo + espacio negativo.

## ReactBits disponibles (usar siempre)
Particles, CountUp, SplitText, BlurText, 
AnimatedList, Magnet, SpotlightCard, TiltedCard

## Nunca
- Borders 1px sólidos para separar
- Sombras en cards estáticas
- any en TypeScript
- Modificar /docs/ ni /engine/

## Estado del Proyecto (18/03/2026)
- Scraper Maxiconsumo: Refinado para precios por unidad y bulto. 
- Categorización: Lógica `detectarSubcategoria` en `lib/data.ts` es la fuente de verdad (regex sobre nombre).
- Filtros: 100% operativos. Sincronía garantizada entre `queryMap`, `sectores` y `productos`.
- Nota: Al agregar productos, asegurar que el nombre contenga palabras clave presentes en `queryMap`.
