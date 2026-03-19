/**
 * SEO Module for CopikonUSA
 * - robots.txt
 * - sitemap.xml (dynamic, from DB)
 * - Product/Category pre-rendered meta pages for search engines
 * - Schema.org structured data (JSON-LD)
 * - Canonical URLs
 */
import type { Express } from "express";
import { storage } from "./storage";
import { PgStorage } from "./pg-storage";

const DOMAIN = "https://copikonusa.com";

// Category SEO metadata in Spanish
const CATEGORY_SEO: Record<string, { title: string; description: string; h1: string }> = {
  tech: {
    title: "Tecnología — Laptops, Audífonos, Accesorios | CopikonUSA",
    description: "Compra laptops, audífonos, tablets, cámaras y accesorios tecnológicos de Estados Unidos con envío a Venezuela. Precios en bolívares.",
    h1: "Tecnología y Electrónica de Estados Unidos"
  },
  phones: {
    title: "Teléfonos y Accesorios para Celulares | CopikonUSA",
    description: "Fundas, cargadores, protectores de pantalla, audífonos y accesorios para celular desde USA. Envío aéreo a Venezuela, pago en bolívares.",
    h1: "Teléfonos y Accesorios"
  },
  gaming: {
    title: "Gaming — Controles, Sillas, Teclados, Audífonos | CopikonUSA",
    description: "Compra controles, sillas gaming, teclados mecánicos, audífonos y accesorios gamer de USA. Envío a Venezuela con pago en bolívares.",
    h1: "Gaming y Videojuegos"
  },
  beauty: {
    title: "Belleza — Maquillaje, Skincare, Perfumes | CopikonUSA",
    description: "Productos de belleza americanos: maquillaje, skincare, perfumes, tratamientos capilares. Compra desde Venezuela, pago en Bs.",
    h1: "Belleza y Cuidado Personal"
  },
  shoes: {
    title: "Calzado — Nike, Adidas, New Balance desde USA | CopikonUSA",
    description: "Zapatos, tenis, botas y sandalias originales de Estados Unidos. Las mejores marcas con envío aéreo a Venezuela.",
    h1: "Calzado desde Estados Unidos"
  },
  clothing: {
    title: "Ropa y Moda — Ropa Americana de Marca | CopikonUSA",
    description: "Camisetas, pantalones, chaquetas, vestidos y más ropa de marca desde USA. Envío aéreo a Venezuela, precios en bolívares.",
    h1: "Ropa y Moda Americana"
  },
  home: {
    title: "Hogar y Cocina — Electrodomésticos y Decoración | CopikonUSA",
    description: "Electrodomésticos, utensilios de cocina, decoración y organización del hogar desde USA. Envío a Venezuela.",
    h1: "Hogar y Cocina"
  },
  health: {
    title: "Salud — Vitaminas, Suplementos, Cuidado Personal | CopikonUSA",
    description: "Vitaminas, suplementos, equipos de salud y cuidado personal desde Estados Unidos. Envío a Venezuela con pago en bolívares.",
    h1: "Salud y Bienestar"
  },
  baby: {
    title: "Bebés y Niños — Coches, Sillas, Juguetes | CopikonUSA",
    description: "Productos para bebés y niños desde USA: coches, sillas de auto, juguetes educativos, ropa infantil. Envío a Venezuela.",
    h1: "Bebés y Niños"
  },
  sports: {
    title: "Deportes — Pesas, Yoga, Fitness desde USA | CopikonUSA",
    description: "Equipos deportivos, pesas, mats de yoga, ropa deportiva y accesorios fitness desde Estados Unidos. Envío a Venezuela.",
    h1: "Deportes y Fitness"
  },
  pets: {
    title: "Mascotas — Comida, Juguetes, Accesorios | CopikonUSA",
    description: "Comida premium, juguetes, accesorios y cuidado para mascotas desde USA. Las mejores marcas americanas con envío a Venezuela.",
    h1: "Mascotas"
  },
  food: {
    title: "Comestibles — Snacks, Dulces, Productos Americanos | CopikonUSA",
    description: "Snacks, dulces, cereales, salsas y productos comestibles americanos. Compra desde Venezuela con pago en bolívares.",
    h1: "Comestibles Americanos"
  },
  toys: {
    title: "Juguetes — LEGO, Hot Wheels, Muñecas, Juegos | CopikonUSA",
    description: "Juguetes de las mejores marcas americanas: LEGO, Hot Wheels, Barbie, juegos de mesa. Envío aéreo USA a Venezuela.",
    h1: "Juguetes"
  },
  auto: {
    title: "Autos y Herramientas — Accesorios y Repuestos | CopikonUSA",
    description: "Accesorios para autos, herramientas y repuestos desde Estados Unidos. Envío aéreo a Venezuela con pago en bolívares.",
    h1: "Autos y Herramientas"
  },
  office: {
    title: "Oficina — Escritorios, Sillas, Organizadores | CopikonUSA",
    description: "Muebles de oficina, organizadores, impresoras y suministros desde USA. Compra con envío a Venezuela.",
    h1: "Oficina y Papelería"
  },
};

export function registerSEORoutes(app: Express) {

  // ===== ROBOTS.TXT =====
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /checkout
Disallow: /carrito
Disallow: /mis-pedidos
Disallow: /pedido/
Disallow: /perfil
Disallow: /login
Disallow: /registro

Sitemap: ${DOMAIN}/sitemap.xml

# CopikonUSA - Tu Tienda Americana en Venezuela
# https://copikonusa.com
`);
  });

  // ===== SITEMAP.XML =====
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      
      // Get total products count to paginate
      let totalProducts = 0;
      try {
        const result = await storage.getProducts({ limit: 1, page: 1 });
        totalProducts = result.total || 0;
      } catch { totalProducts = 0; }

      const now = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>${DOMAIN}/catalogo</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${DOMAIN}/metodos-de-pago</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${DOMAIN}/sobre-nosotros</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${DOMAIN}/terminos</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${DOMAIN}/devoluciones</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Categories -->
`;
      for (const cat of categories) {
        xml += `  <url>
    <loc>${DOMAIN}/catalogo?category=${cat.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }

      // Get products in batches for sitemap
      const PAGE_SIZE = 100;
      const pages = Math.ceil(totalProducts / PAGE_SIZE);
      for (let p = 1; p <= Math.min(pages, 100); p++) { // max 10,000 products in sitemap
        const result = await storage.getProducts({ limit: PAGE_SIZE, page: p });
        const products = result.products || [];
        for (const prod of products) {
          if (!prod.isActive) continue;
          const imgUrl = prod.image?.startsWith("http") 
            ? `${DOMAIN}/api/img?url=${encodeURIComponent(prod.image)}`
            : prod.image;
          xml += `  <url>
    <loc>${DOMAIN}/producto/${prod.slug}</loc>
    <lastmod>${prod.createdAt ? prod.createdAt.split("T")[0] : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imgUrl ? `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(prod.name)}</image:title>
    </image:image>` : ""}
  </url>
`;
        }
      }

      xml += `</urlset>`;

      res.type("application/xml").send(xml);
    } catch (err) {
      console.error("[SEO] Sitemap error:", err);
      res.status(500).type("text/plain").send("Error generating sitemap");
    }
  });

  // ===== SEO-FRIENDLY PRODUCT PAGES (for crawlers) =====
  // Google bot can render JS now, but this helps with initial indexing
  // Serves a pre-rendered HTML with meta tags + JSON-LD for /p/:slug
  app.get("/p/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.redirect("/catalogo");

      const priceUsd = product.totalPriceUsd.toFixed(2);
      const imgUrl = product.image?.startsWith("http")
        ? `${DOMAIN}/api/img?url=${encodeURIComponent(product.image)}`
        : `${DOMAIN}${product.image}`;
      const catSeo = CATEGORY_SEO[product.category];
      const catName = catSeo?.h1 || product.category;

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `Compra ${product.name} en CopikonUSA con envío aéreo a Venezuela. Pago en bolívares.`,
        "image": imgUrl,
        "brand": {
          "@type": "Brand",
          "name": "CopikonUSA"
        },
        "offers": {
          "@type": "Offer",
          "url": `${DOMAIN}/producto/${product.slug}`,
          "priceCurrency": "USD",
          "price": priceUsd,
          "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "CopikonUSA"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "VE"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": { "@type": "QuantitativeValue", "minValue": 7, "maxValue": 15, "unitCode": "DAY" },
              "transitTime": { "@type": "QuantitativeValue", "minValue": 7, "maxValue": 15, "unitCode": "DAY" }
            }
          }
        },
        ...(product.rating && product.reviews ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating.toFixed(1),
            "reviewCount": product.reviews
          }
        } : {}),
        "category": catName
      };

      res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(product.name)} — CopikonUSA</title>
  <meta name="description" content="Compra ${escapeHtml(product.name)} por $${priceUsd} USD con envío aéreo desde USA a Venezuela. Pago en bolívares. ${catName} en CopikonUSA.">
  <meta property="og:title" content="${escapeHtml(product.name)} — CopikonUSA">
  <meta property="og:description" content="$${priceUsd} USD — Envío aéreo USA a Venezuela. Pago en bolívares.">
  <meta property="og:image" content="${imgUrl}">
  <meta property="og:url" content="${DOMAIN}/producto/${product.slug}">
  <meta property="og:type" content="product">
  <meta property="product:price:amount" content="${priceUsd}">
  <meta property="product:price:currency" content="USD">
  <link rel="canonical" href="${DOMAIN}/producto/${product.slug}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>${escapeHtml(product.name)}</h1>
  <p>Precio: $${priceUsd} USD</p>
  <p>${escapeHtml(product.description || "")}</p>
  <p>Categoría: ${escapeHtml(catName)}</p>
  <a href="${DOMAIN}/producto/${product.slug}">Ver producto en CopikonUSA</a>
  <script>window.location.href = "${DOMAIN}/producto/${product.slug}";</script>
</body>
</html>`);
    } catch (err) {
      console.error("[SEO] Product page error:", err);
      res.redirect("/");
    }
  });

  // ===== SEO CATEGORY PAGES =====
  app.get("/c/:category", async (req, res) => {
    try {
      const cat = req.params.category;
      const seo = CATEGORY_SEO[cat];
      if (!seo) return res.redirect("/catalogo");

      const result = await storage.getProducts({ category: cat, limit: 50, page: 1 });
      const products = result.products || [];

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": seo.h1,
        "description": seo.description,
        "url": `${DOMAIN}/catalogo?category=${cat}`,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": result.total || products.length,
          "itemListElement": products.slice(0, 20).map((p: any, i: number) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `${DOMAIN}/producto/${p.slug}`,
            "name": p.name
          }))
        }
      };

      const productListHtml = products.slice(0, 20).map((p: any) => 
        `<li><a href="${DOMAIN}/producto/${p.slug}">${escapeHtml(p.name)} — $${p.totalPriceUsd?.toFixed(2)} USD</a></li>`
      ).join("\n      ");

      res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title}</title>
  <meta name="description" content="${seo.description}">
  <meta property="og:title" content="${seo.title}">
  <meta property="og:description" content="${seo.description}">
  <meta property="og:url" content="${DOMAIN}/catalogo?category=${cat}">
  <meta property="og:type" content="website">
  <link rel="canonical" href="${DOMAIN}/catalogo?category=${cat}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>${seo.h1}</h1>
  <p>${seo.description}</p>
  <ul>
      ${productListHtml}
  </ul>
  <a href="${DOMAIN}/catalogo?category=${cat}">Ver todos los productos</a>
  <script>window.location.href = "${DOMAIN}/catalogo?category=${cat}";</script>
</body>
</html>`);
    } catch (err) {
      console.error("[SEO] Category page error:", err);
      res.redirect("/");
    }
  });

  // ===== HOMEPAGE JSON-LD =====
  // Inject Organization + WebSite schema into the main index.html
  app.get("/seo/schema", (_req, res) => {
    const schema = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "CopikonUSA",
        "url": DOMAIN,
        "logo": `${DOMAIN}/favicon.png`,
        "description": "En CopikonUSA consigues cualquier producto de Estados Unidos al mejor precio del mercado, con envío incluido y pago en bolívares.",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-786-969-5464",
          "contactType": "customer service",
          "availableLanguage": "Spanish"
        },
        "sameAs": [],
        "areaServed": {
          "@type": "Country",
          "name": "Venezuela"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CopikonUSA",
        "url": DOMAIN,
        "description": "Tu Tienda Americana en Venezuela — Compra productos de USA con envío aéreo y pago en bolívares",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${DOMAIN}/catalogo?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ];
    res.json(schema);
  });

  console.log("[SEO] Routes registered: robots.txt, sitemap.xml, /p/:slug, /c/:category, /seo/schema");
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
