import Anthropic from "@anthropic-ai/sdk";
import { getDb, getPool } from "./db";
import { productsTable } from "@shared/schema";
import { eq } from "drizzle-orm";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const client = ANTHROPIC_KEY ? new Anthropic() : null;

// ============ L1: IN-MEMORY CACHE ============

const translationCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string): string | null {
  const entry = translationCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.text;
  return null;
}

function setCache(key: string, text: string) {
  translationCache.set(key, { text, timestamp: Date.now() });
  if (translationCache.size > 2000) {
    const oldest = [...translationCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) translationCache.delete(oldest[0]);
  }
}

// ============ L2: DATABASE PERSISTENCE ============

/** Load cached translation from DB for a product */
export async function getDbTranslation(productId: number): Promise<{ descriptionEs: string; featuresEs: string[] } | null> {
  try {
    const db = getDb();
    if (!db) return null;
    const [row] = await db.select({
      descriptionEs: productsTable.descriptionEs,
      featuresEs: productsTable.featuresEs,
    }).from(productsTable).where(eq(productsTable.id, productId));
    if (!row) return null;
    const desc = row.descriptionEs || "";
    const feats = (row.featuresEs as string[]) || [];
    if (desc || feats.length > 0) {
      return { descriptionEs: desc, featuresEs: feats };
    }
    return null;
  } catch (e: any) {
    console.error("[TRANSLATE] DB read error:", e.message);
    return null;
  }
}

/** Save translation to DB for a product */
export async function saveDbTranslation(productId: number, descriptionEs: string, featuresEs: string[]): Promise<void> {
  try {
    const db = getDb();
    if (!db) return;
    await db.update(productsTable)
      .set({ descriptionEs, featuresEs })
      .where(eq(productsTable.id, productId));
  } catch (e: any) {
    console.error("[TRANSLATE] DB save error:", e.message);
  }
}

// ============ DICTIONARY-BASED FALLBACK ============

/** Comprehensive dictionary for translating product descriptions without API */
const DICTIONARY_REPLACEMENTS: [RegExp, string][] = [
  // ── SENTENCE-LEVEL PATTERNS (must come first) ──
  [/\bThis product features\b/gi, "Este producto cuenta con"],
  [/\bThis product is\b/gi, "Este producto es"],
  [/\bThis product comes with\b/gi, "Este producto viene con"],
  [/\bThis product includes\b/gi, "Este producto incluye"],
  [/\bDesigned for\b/gi, "Diseñado para"],
  [/\bDesigned to\b/gi, "Diseñado para"],
  [/\bPerfect for\b/gi, "Perfecto para"],
  [/\bIdeal for\b/gi, "Ideal para"],
  [/\bGreat for\b/gi, "Genial para"],
  [/\bSuitable for\b/gi, "Adecuado para"],
  [/\bMade with\b/gi, "Hecho con"],
  [/\bMade from\b/gi, "Hecho de"],
  [/\bMade of\b/gi, "Hecho de"],
  [/\bMade in\b/gi, "Hecho en"],
  [/\bCrafted from\b/gi, "Fabricado con"],
  [/\bCrafted with\b/gi, "Fabricado con"],
  [/\bBuilt with\b/gi, "Construido con"],
  [/\bBuilt for\b/gi, "Construido para"],
  [/\bBuilt-in\b/gi, "Incorporado"],
  [/\bIncludes\b/gi, "Incluye"],
  [/\bIncluding\b/gi, "Incluyendo"],
  [/\bFeatures\b/gi, "Características"],
  [/\bComes with\b/gi, "Viene con"],
  [/\bComes in\b/gi, "Viene en"],
  [/\bAvailable in\b/gi, "Disponible en"],
  [/\bEasy to use\b/gi, "Fácil de usar"],
  [/\bEasy to clean\b/gi, "Fácil de limpiar"],
  [/\bEasy to install\b/gi, "Fácil de instalar"],
  [/\bEasy to carry\b/gi, "Fácil de transportar"],
  [/\bEasy to set up\b/gi, "Fácil de configurar"],
  [/\bEasy to store\b/gi, "Fácil de guardar"],
  [/\bHigh quality\b/gi, "Alta calidad"],
  [/\bHigh performance\b/gi, "Alto rendimiento"],
  [/\bLong lasting\b/gi, "Duradero"],
  [/\bLong-lasting\b/gi, "Duradero"],
  [/\bBattery life\b/gi, "Duración de batería"],
  [/\bBattery powered\b/gi, "Alimentado por batería"],
  [/\bWhat you get\b/gi, "Lo que recibes"],
  [/\bWhat's in the box\b/gi, "Contenido de la caja"],
  [/\bNote:\b/gi, "Nota:"],
  [/\bPlease note\b/gi, "Por favor tenga en cuenta"],
  [/\bImportant:\b/gi, "Importante:"],
  [/\bWarning:\b/gi, "Advertencia:"],
  [/\bTips?:\b/gi, "Consejo:"],
  [/\bHow to use\b/gi, "Cómo usar"],
  [/\bDo not\b/gi, "No"],
  [/\bCan be used\b/gi, "Se puede usar"],
  [/\bIt can\b/gi, "Puede"],
  [/\bIt is\b/gi, "Es"],
  [/\bThere are\b/gi, "Hay"],
  [/\bThere is\b/gi, "Hay"],
  [/\bAs well as\b/gi, "así como"],
  [/\bIn addition\b/gi, "Además"],
  [/\bIn order to\b/gi, "Para"],
  [/\bSuch as\b/gi, "como"],
  [/\bWhether you're\b/gi, "Ya sea que estés"],
  [/\bWhether you are\b/gi, "Ya sea que estés"],
  [/\bLook no further\b/gi, "No busques más"],
  [/\bTake it anywhere\b/gi, "Llévalo a cualquier parte"],
  [/\bOn the go\b/gi, "en movimiento"],
  [/\bAll day\b/gi, "todo el día"],
  [/\bAll night\b/gi, "toda la noche"],
  [/\bDay and night\b/gi, "día y noche"],
  [/\bIndoor and outdoor\b/gi, "interior y exterior"],
  [/\bIndoor\/outdoor\b/gi, "interior/exterior"],
  [/\bMoney back guarantee\b/gi, "Garantía de devolución"],
  [/\bSatisfaction guaranteed\b/gi, "Satisfacción garantizada"],
  [/\b100% satisfaction\b/gi, "100% satisfacción"],
  [/\bRisk free\b/gi, "Sin riesgo"],
  [/\bFree shipping\b/gi, "Envío gratis"],
  [/\bNo assembly required\b/gi, "No requiere ensamblaje"],
  [/\bSome assembly required\b/gi, "Requiere algo de ensamblaje"],
  [/\bBPA free\b/gi, "Libre de BPA"],
  [/\bLead free\b/gi, "Libre de plomo"],
  [/\bNon-toxic\b/gi, "No tóxico"],
  [/\bEco-?friendly\b/gi, "Ecológico"],
  [/\bEnergy efficient\b/gi, "Eficiente en energía"],
  [/\bWeather resistant\b/gi, "Resistente al clima"],
  [/\bHeat resistant\b/gi, "Resistente al calor"],
  [/\bScratch resistant\b/gi, "Resistente a rayaduras"],
  [/\bShock resistant\b/gi, "Resistente a golpes"],
  [/\bDust resistant\b/gi, "Resistente al polvo"],
  [/\bSlip resistant\b/gi, "Antideslizante"],
  [/\bNon-slip\b/gi, "Antideslizante"],
  [/\bAnti-slip\b/gi, "Antideslizante"],
  [/\bBreathable\b/gi, "Transpirable"],
  [/\bStretchable\b/gi, "Elástico"],
  [/\bMachine washable\b/gi, "Lavable a máquina"],
  [/\bHand wash\b/gi, "Lavar a mano"],
  [/\bDishwasher safe\b/gi, "Apto para lavavajillas"],
  [/\bMicrowave safe\b/gi, "Apto para microondas"],
  [/\bOven safe\b/gi, "Apto para horno"],
  [/\bFood grade\b/gi, "Grado alimenticio"],
  [/\bMulti-?purpose\b/gi, "Multiusos"],
  [/\bMulti-?functional?\b/gi, "Multifuncional"],
  [/\bAll-?in-?one\b/gi, "Todo en uno"],
  [/\bPlug and play\b/gi, "Plug and play"],
  [/\bUser friendly\b/gi, "Fácil de usar"],
  [/\bChild safe\b/gi, "Seguro para niños"],
  [/\bPet friendly\b/gi, "Apto para mascotas"],

  // ── AMAZON CLEANUP ──
  [/Amazon Basics/gi, "Copikon Basics"],
  [/Amazon Echo/gi, "Echo"],
  [/Amazon Fire/gi, "Fire"],
  [/Amazon Kids/gi, "Kids"],
  [/Amazon Exclusive/gi, "Exclusivo"],
  [/Amazon's? Choice/gi, ""],
  [/Best Seller/gi, ""],
  [/Amazon/gi, ""],

  // ── ADJECTIVES / DESCRIPTORS ──
  [/\bWireless\b/gi, "Inalámbrico"],
  [/\bPortable\b/gi, "Portátil"],
  [/\bRechargeable\b/gi, "Recargable"],
  [/\bWaterproof\b/gi, "Resistente al agua"],
  [/\bWater resistant\b/gi, "Resistente al agua"],
  [/\bAdjustable\b/gi, "Ajustable"],
  [/\bFoldable\b/gi, "Plegable"],
  [/\bCollapsible\b/gi, "Plegable"],
  [/\bRemovable\b/gi, "Removible"],
  [/\bDetachable\b/gi, "Desmontable"],
  [/\bRetractable\b/gi, "Retráctil"],
  [/\bRotating\b/gi, "Giratorio"],
  [/\bReversible\b/gi, "Reversible"],
  [/\bStainless Steel\b/gi, "Acero inoxidable"],
  [/\bNoise Cancell?ing\b/gi, "Cancelación de ruido"],
  [/\bLightweight\b/gi, "Liviano"],
  [/\bDurable\b/gi, "Duradero"],
  [/\bSturdy\b/gi, "Resistente"],
  [/\bRobust\b/gi, "Robusto"],
  [/\bCompact\b/gi, "Compacto"],
  [/\bSlim\b/gi, "Delgado"],
  [/\bUltra-?thin\b/gi, "Ultra delgado"],
  [/\bFlexible\b/gi, "Flexible"],
  [/\bSoft\b/gi, "Suave"],
  [/\bSmooth\b/gi, "Suave"],
  [/\bThick\b/gi, "Grueso"],
  [/\bThin\b/gi, "Delgado"],
  [/\bWide\b/gi, "Ancho"],
  [/\bNarrow\b/gi, "Estrecho"],
  [/\bDeep\b/gi, "Profundo"],
  [/\bShallow\b/gi, "Poco profundo"],
  [/\bHeavy Duty\b/gi, "Resistente"],
  [/\bHeavy\b/gi, "Pesado"],
  [/\bExtra Large\b/gi, "Extra Grande"],
  [/\bSmall\b/gi, "Pequeño"],
  [/\bLarge\b/gi, "Grande"],
  [/\bMedium\b/gi, "Mediano"],
  [/\bMini\b/gi, "Mini"],
  [/\bTiny\b/gi, "Diminuto"],
  [/\bHuge\b/gi, "Enorme"],
  [/\bPowerful\b/gi, "Potente"],
  [/\bQuiet\b/gi, "Silencioso"],
  [/\bSilent\b/gi, "Silencioso"],
  [/\bLoud\b/gi, "Fuerte"],
  [/\bBright\b/gi, "Brillante"],
  [/\bDim\b/gi, "Tenue"],
  [/\bClear\b/gi, "Claro"],
  [/\bCrystal clear\b/gi, "Cristalino"],
  [/\bSharp\b/gi, "Nítido"],
  [/\bFast\b/gi, "Rápido"],
  [/\bQuick\b/gi, "Rápido"],
  [/\bSlow\b/gi, "Lento"],
  [/\bSecure\b/gi, "Seguro"],
  [/\bSafe\b/gi, "Seguro"],
  [/\bReliable\b/gi, "Confiable"],
  [/\bEfficient\b/gi, "Eficiente"],
  [/\bEffective\b/gi, "Efectivo"],
  [/\bConvenient\b/gi, "Conveniente"],
  [/\bComfortable\b/gi, "Cómodo"],
  [/\bErgonomic\b/gi, "Ergonómico"],
  [/\bModern\b/gi, "Moderno"],
  [/\bClassic\b/gi, "Clásico"],
  [/\bElegant\b/gi, "Elegante"],
  [/\bStylish\b/gi, "Elegante"],
  [/\bFashionable\b/gi, "De moda"],
  [/\bVintage\b/gi, "Vintage"],
  [/\bOrganic\b/gi, "Orgánico"],
  [/\bNatural\b/gi, "Natural"],
  [/\bPremium\b/gi, "Premium"],
  [/\bOriginal\b/gi, "Original"],
  [/\bCompatible\b/gi, "Compatible"],
  [/\bProfessional\b/gi, "Profesional"],
  [/\bHypoallergenic\b/gi, "Hipoalergénico"],
  [/\bAntibacterial\b/gi, "Antibacterial"],
  [/\bUnbreakable\b/gi, "Irrompible"],
  [/\bShatterproof\b/gi, "A prueba de golpes"],
  [/\bOdorless\b/gi, "Sin olor"],
  [/\bScented\b/gi, "Con aroma"],
  [/\bUnscented\b/gi, "Sin aroma"],
  [/\bFragrance free\b/gi, "Sin fragancia"],
  [/\bReusable\b/gi, "Reutilizable"],
  [/\bDisposable\b/gi, "Desechable"],
  [/\bBiodegradable\b/gi, "Biodegradable"],
  [/\bRecyclable\b/gi, "Reciclable"],
  [/\bSustainable\b/gi, "Sostenible"],
  [/\bVersatile\b/gi, "Versátil"],
  [/\bEssential\b/gi, "Esencial"],
  [/\bUltimate\b/gi, "Definitivo"],
  [/\bAdvanced\b/gi, "Avanzado"],
  [/\bUpgraded\b/gi, "Mejorado"],
  [/\bImproved\b/gi, "Mejorado"],
  [/\bEnhanced\b/gi, "Mejorado"],
  [/\bLatest\b/gi, "Último"],
  [/\bNewest\b/gi, "Más nuevo"],
  [/\bNew\b/g, "Nuevo"],
  [/\bWorks\b/gi, "Funciona"],
  [/\bSimple\b/gi, "Simple"],

  // ── COLORS ──
  [/\bBlack\b/g, "Negro"], [/\bWhite\b/g, "Blanco"], [/\bBlue\b/g, "Azul"],
  [/\bRed\b/g, "Rojo"], [/\bGreen\b/g, "Verde"], [/\bPink\b/g, "Rosa"],
  [/\bGold\b/g, "Dorado"], [/\bSilver\b/g, "Plateado"], [/\bGray\b/g, "Gris"],
  [/\bGrey\b/g, "Gris"], [/\bPurple\b/g, "Morado"], [/\bOrange\b/g, "Naranja"],
  [/\bYellow\b/g, "Amarillo"], [/\bBrown\b/g, "Marrón"], [/\bBeige\b/g, "Beige"],
  [/\bNavy\b/g, "Azul marino"], [/\bTeal\b/g, "Verde azulado"],
  [/\bCoral\b/g, "Coral"], [/\bTurquoise\b/g, "Turquesa"],
  [/\bMulticolor\b/gi, "Multicolor"], [/\bTransparent\b/gi, "Transparente"],

  // ── PREPOSITIONS & CONNECTORS ──
  [/\bfor\b/gi, "para"], [/\bwith\b/gi, "con"], [/\band\b/gi, "y"],
  [/\bor\b/gi, "o"], [/\bbut\b/gi, "pero"], [/\bnot\b/gi, "no"],
  [/\bfrom\b/gi, "de"], [/\binto\b/gi, "dentro de"],
  [/\bby\b/gi, "por"], [/\bin\b/gi, "en"], [/\bon\b/gi, "en"],
  [/\bto\b/gi, "a"], [/\bof\b/gi, "de"], [/\bat\b/gi, "en"],
  [/\bup to\b/gi, "hasta"], [/\bmore than\b/gi, "más de"],
  [/\bless than\b/gi, "menos de"], [/\babout\b/gi, "aproximadamente"],
  [/\bover\b/gi, "más de"], [/\bunder\b/gi, "menos de"],
  [/\balso\b/gi, "también"], [/\beven\b/gi, "incluso"],
  [/\bjust\b/gi, "solo"], [/\bonly\b/gi, "solo"],
  [/\bvery\b/gi, "muy"], [/\bmost\b/gi, "más"],
  [/\ball\b/gi, "todos"], [/\bevery\b/gi, "cada"],
  [/\beach\b/gi, "cada"], [/\bany\b/gi, "cualquier"],
  [/\bsome\b/gi, "algunos"], [/\bmany\b/gi, "muchos"],
  [/\bfew\b/gi, "pocos"], [/\bother\b/gi, "otro"],
  [/\banother\b/gi, "otro"], [/\bboth\b/gi, "ambos"],
  [/\bwhile\b/gi, "mientras"], [/\bwhen\b/gi, "cuando"],
  [/\bwhere\b/gi, "donde"], [/\bhow\b/gi, "cómo"],
  [/\bwhat\b/gi, "qué"], [/\bwhich\b/gi, "cual"],
  [/\bwho\b/gi, "quien"], [/\bthat\b/gi, "que"],
  [/\bthis\b/gi, "este"], [/\bthese\b/gi, "estos"],
  [/\bthose\b/gi, "esos"], [/\bthen\b/gi, "entonces"],
  [/\bthan\b/gi, "que"],

  // ── ARTICLES & PRONOUNS ──
  [/\bthe\b/gi, "el"], [/\ba\b/gi, "un"], [/\ban\b/gi, "un"],
  [/\byour\b/gi, "tu"], [/\byou\b/gi, "tú"],
  [/\bour\b/gi, "nuestro"], [/\bits\b/gi, "su"],
  [/\btheir\b/gi, "su"], [/\bthem\b/gi, "ellos"],
  [/\bthey\b/gi, "ellos"], [/\bwe\b/gi, "nosotros"],
  [/\bit\b/gi, "ello"],

  // ── VERBS ──
  [/\bprovides\b/gi, "proporciona"],
  [/\bprovide\b/gi, "proporcionar"],
  [/\boffers\b/gi, "ofrece"],
  [/\boffer\b/gi, "ofrecer"],
  [/\bensures\b/gi, "asegura"],
  [/\bensure\b/gi, "asegurar"],
  [/\ballows\b/gi, "permite"],
  [/\ballow\b/gi, "permitir"],
  [/\benables\b/gi, "permite"],
  [/\bsupports\b/gi, "soporta"],
  [/\bsupport\b/gi, "soporte"],
  [/\bprotects\b/gi, "protege"],
  [/\bprotect\b/gi, "proteger"],
  [/\bprevents\b/gi, "previene"],
  [/\breduces\b/gi, "reduce"],
  [/\bimproves\b/gi, "mejora"],
  [/\benhances\b/gi, "mejora"],
  [/\bmaximizes\b/gi, "maximiza"],
  [/\bminimizes\b/gi, "minimiza"],
  [/\bdelivers\b/gi, "entrega"],
  [/\bkeeps\b/gi, "mantiene"],
  [/\bkeep\b/gi, "mantener"],
  [/\bfits\b/gi, "se adapta"],
  [/\bfit\b/gi, "ajuste"],
  [/\bhold\b/gi, "sostener"],
  [/\bholds\b/gi, "sostiene"],
  [/\bworks\b/gi, "funciona"],
  [/\bwork\b/gi, "funcionar"],
  [/\buse\b/gi, "usar"],
  [/\buses\b/gi, "usa"],
  [/\busing\b/gi, "usando"],
  [/\bcreate\b/gi, "crear"],
  [/\bcreates\b/gi, "crea"],
  [/\bmake\b/gi, "hacer"],
  [/\bmakes\b/gi, "hace"],
  [/\bgiving\b/gi, "dando"],
  [/\bgive\b/gi, "dar"],
  [/\bgives\b/gi, "da"],
  [/\bget\b/gi, "obtener"],
  [/\bgets\b/gi, "obtiene"],
  [/\bneed\b/gi, "necesitar"],
  [/\bneeds\b/gi, "necesita"],
  [/\bwant\b/gi, "querer"],
  [/\blike\b/gi, "como"],
  [/\blove\b/gi, "amor"],
  [/\benjoy\b/gi, "disfrutar"],
  [/\bhelps\b/gi, "ayuda"],
  [/\bhelp\b/gi, "ayudar"],
  [/\bkeeping\b/gi, "manteniendo"],
  [/\bhas\b/gi, "tiene"],
  [/\bhave\b/gi, "tienen"],
  [/\bis\b/gi, "es"],
  [/\bare\b/gi, "son"],
  [/\bwas\b/gi, "fue"],
  [/\bwere\b/gi, "fueron"],
  [/\bcan\b/gi, "puede"],
  [/\bwill\b/gi, "será"],
  [/\bshould\b/gi, "debería"],
  [/\bmay\b/gi, "puede"],

  // ── PACK/SIZE PATTERNS ──
  [/\bPack of (\d+)\b/gi, "Paquete de $1"],
  [/\b(\d+)[- ]?Pack\b/gi, "Paquete de $1"],
  [/\bSet of (\d+)\b/gi, "Set de $1"],
  [/\bCompatible with\b/gi, "Compatible con"],
  [/\bCount\b/gi, "Unidades"],
  [/\bSize\b/g, "Talla"],
  [/\bPieces\b/gi, "Piezas"],
  [/\bPiece\b/gi, "Pieza"],

  // ── UNITS ──
  [/\bInch\b/gi, "Pulgadas"], [/\binches\b/gi, "Pulgadas"],
  [/\bFeet\b/gi, "Pies"], [/\bfoot\b/gi, "pie"],
  [/\bPound\b/gi, "Libras"], [/\bpounds\b/gi, "Libras"],
  [/\bounces?\b/gi, "Onzas"],
  [/\bgallon\b/gi, "Galón"], [/\bgallons\b/gi, "Galones"],
  [/\bliter\b/gi, "Litro"], [/\bliters\b/gi, "Litros"],
  [/\bhours?\b/gi, "horas"], [/\bminutes?\b/gi, "minutos"],
  [/\bdays?\b/gi, "días"], [/\bweeks?\b/gi, "semanas"],
  [/\bmonths?\b/gi, "meses"], [/\byears?\b/gi, "años"],

  // ── PRODUCT TYPES ──
  [/\bHeadphones\b/gi, "Audífonos"], [/\bEarbuds\b/gi, "Auriculares"],
  [/\bEarphones\b/gi, "Auriculares"], [/\bHeadset\b/gi, "Audífonos"],
  [/\bSpeaker\b/gi, "Altavoz"], [/\bSpeakers\b/gi, "Altavoces"],
  [/\bCharger\b/gi, "Cargador"], [/\bChargers\b/gi, "Cargadores"],
  [/\bCase\b/g, "Funda"], [/\bCover\b/gi, "Funda"],
  [/\bScreen Protector\b/gi, "Protector de pantalla"],
  [/\bKeyboard\b/gi, "Teclado"], [/\bMouse\b/g, "Ratón"],
  [/\bMonitor\b/gi, "Monitor"], [/\bDisplay\b/gi, "Pantalla"],
  [/\bCamera\b/gi, "Cámara"], [/\bWebcam\b/gi, "Cámara web"],
  [/\bMicrophone\b/gi, "Micrófono"],
  [/\bLaptop\b/gi, "Portátil"], [/\bTablet\b/gi, "Tableta"],
  [/\bWatch\b/g, "Reloj"], [/\bBattery\b/gi, "Batería"],
  [/\bBatteries\b/gi, "Baterías"],
  [/\bCable\b/gi, "Cable"], [/\bCables\b/gi, "Cables"],
  [/\bAdapter\b/gi, "Adaptador"], [/\bAdapters\b/gi, "Adaptadores"],
  [/\bHolder\b/gi, "Soporte"], [/\bStand\b/g, "Soporte"],
  [/\bMount\b/gi, "Soporte"], [/\bBracket\b/gi, "Soporte"],
  [/\bBag\b/g, "Bolsa"], [/\bBags\b/gi, "Bolsas"],
  [/\bBackpack\b/gi, "Mochila"],
  [/\bBottle\b/gi, "Botella"], [/\bBottles\b/gi, "Botellas"],
  [/\bBlanket\b/gi, "Manta"], [/\bBlankets\b/gi, "Mantas"],
  [/\bPillow\b/gi, "Almohada"], [/\bPillows\b/gi, "Almohadas"],
  [/\bTowel\b/gi, "Toalla"], [/\bTowels\b/gi, "Toallas"],
  [/\bShoes\b/gi, "Zapatos"], [/\bSneakers\b/gi, "Zapatillas"],
  [/\bBoots\b/gi, "Botas"], [/\bSandals\b/gi, "Sandalias"],
  [/\bShirt\b/gi, "Camisa"], [/\bShirts\b/gi, "Camisas"],
  [/\bPants\b/gi, "Pantalones"], [/\bJeans\b/gi, "Jeans"],
  [/\bDress\b/g, "Vestido"], [/\bSkirt\b/gi, "Falda"],
  [/\bJacket\b/gi, "Chaqueta"], [/\bCoat\b/gi, "Abrigo"],
  [/\bSocks\b/gi, "Medias"], [/\bGloves\b/gi, "Guantes"],
  [/\bHat\b/gi, "Sombrero"], [/\bCap\b/gi, "Gorra"],
  [/\bSunglasses\b/gi, "Gafas de sol"],
  [/\bWallet\b/gi, "Billetera"], [/\bPurse\b/gi, "Cartera"],
  [/\bBelt\b/gi, "Cinturón"],
  [/\bRing\b/gi, "Anillo"], [/\bBracelet\b/gi, "Pulsera"],
  [/\bNecklace\b/gi, "Collar"], [/\bEarrings\b/gi, "Aretes"],
  [/\bWipes\b/gi, "Toallitas"],
  [/\bScent\b/gi, "Aroma"],
  [/\bLight\b/g, "Luz"], [/\bLights\b/gi, "Luces"],
  [/\bLamp\b/gi, "Lámpara"], [/\bLamps\b/gi, "Lámparas"],
  [/\bBulb\b/gi, "Bombillo"], [/\bBulbs\b/gi, "Bombillos"],
  [/\bFan\b/gi, "Ventilador"],
  [/\bHeater\b/gi, "Calentador"],
  [/\bFilter\b/gi, "Filtro"], [/\bFilters\b/gi, "Filtros"],
  [/\bTool\b/gi, "Herramienta"], [/\bTools\b/gi, "Herramientas"],
  [/\bKit\b/gi, "Kit"], [/\bKits\b/gi, "Kits"],
  [/\bBox\b/gi, "Caja"], [/\bContainer\b/gi, "Contenedor"],
  [/\bStorage\b/gi, "Almacenamiento"],
  [/\bOrganizer\b/gi, "Organizador"],
  [/\bRack\b/gi, "Estante"], [/\bShelf\b/gi, "Estante"],
  [/\bDrawer\b/gi, "Cajón"],
  [/\bMat\b/gi, "Alfombra"], [/\bRug\b/gi, "Alfombra"],
  [/\bCurtain\b/gi, "Cortina"], [/\bCurtains\b/gi, "Cortinas"],
  [/\bMirror\b/gi, "Espejo"],
  [/\bClock\b/gi, "Reloj"],
  [/\bFrame\b/gi, "Marco"],
  [/\bTape\b/gi, "Cinta"],
  [/\bGlue\b/gi, "Pegamento"],
  [/\bBrush\b/gi, "Cepillo"], [/\bBrushes\b/gi, "Cepillos"],
  [/\bComb\b/gi, "Peine"],
  [/\bScissors\b/gi, "Tijeras"],
  [/\bKnife\b/gi, "Cuchillo"], [/\bKnives\b/gi, "Cuchillos"],
  [/\bSpoon\b/gi, "Cuchara"], [/\bFork\b/gi, "Tenedor"],
  [/\bPlate\b/gi, "Plato"], [/\bPlates\b/gi, "Platos"],
  [/\bCup\b/gi, "Taza"], [/\bCups\b/gi, "Tazas"],
  [/\bGlass\b/gi, "Vaso"], [/\bBowl\b/gi, "Tazón"],
  [/\bPot\b/gi, "Olla"], [/\bPan\b/gi, "Sartén"],
  [/\bTray\b/gi, "Bandeja"],
  [/\bToothbrush\b/gi, "Cepillo de dientes"],
  [/\bToothpaste\b/gi, "Pasta dental"],
  [/\bShampoo\b/gi, "Champú"],
  [/\bConditioner\b/gi, "Acondicionador"],
  [/\bSoap\b/gi, "Jabón"],
  [/\bLotion\b/gi, "Loción"],
  [/\bCream\b/gi, "Crema"],
  [/\bSunscreen\b/gi, "Protector solar"],
  [/\bDeodorant\b/gi, "Desodorante"],
  [/\bPerfume\b/gi, "Perfume"],
  [/\bVitamins?\b/gi, "Vitaminas"],
  [/\bSupplement\b/gi, "Suplemento"],
  [/\bProtein\b/gi, "Proteína"],
  [/\bToy\b/gi, "Juguete"], [/\bToys\b/gi, "Juguetes"],
  [/\bGame\b/gi, "Juego"], [/\bGames\b/gi, "Juegos"],
  [/\bPuzzle\b/gi, "Rompecabezas"],
  [/\bDoll\b/gi, "Muñeca"],
  [/\bSticker\b/gi, "Calcomanía"], [/\bStickers\b/gi, "Calcomanías"],
  [/\bPen\b/gi, "Bolígrafo"], [/\bPens\b/gi, "Bolígrafos"],
  [/\bPencil\b/gi, "Lápiz"], [/\bPencils\b/gi, "Lápices"],
  [/\bNotebook\b/gi, "Cuaderno"],
  [/\bFolder\b/gi, "Carpeta"],
  [/\bPaper\b/gi, "Papel"],
  [/\bBook\b/gi, "Libro"], [/\bBooks\b/gi, "Libros"],

  // ── PEOPLE ──
  [/\bRunning\b/gi, "Correr"],
  [/\bTraining\b/gi, "Entrenamiento"],
  [/\bMen\b/g, "Hombre"], [/\bWomen\b/g, "Mujer"],
  [/\bMen's\b/gi, "de Hombre"], [/\bWomen's\b/gi, "de Mujer"],
  [/\bBoys\b/g, "Niños"], [/\bGirls\b/g, "Niñas"],
  [/\bKids\b/gi, "Niños"], [/\bBaby\b/gi, "Bebé"],
  [/\bToddler\b/gi, "Niño pequeño"],
  [/\bAdult\b/gi, "Adulto"], [/\bAdults\b/gi, "Adultos"],
  [/\bFamily\b/gi, "Familia"],
  [/\bHome\b/gi, "Hogar"],
  [/\bOffice\b/gi, "Oficina"],
  [/\bSchool\b/gi, "Escuela"],
  [/\bGym\b/gi, "Gimnasio"],
  [/\bOutdoor\b/gi, "Exterior"],
  [/\bIndoor\b/gi, "Interior"],
  [/\bKitchen\b/gi, "Cocina"],
  [/\bBathroom\b/gi, "Baño"],
  [/\bBedroom\b/gi, "Dormitorio"],
  [/\bGarden\b/gi, "Jardín"],
  [/\bTravel\b/gi, "Viaje"],
  [/\bCamping\b/gi, "Camping"],
  [/\bBeach\b/gi, "Playa"],
  [/\bPool\b/gi, "Piscina"],

  // ── NOUNS ──
  [/\bColor\b/gi, "Color"],
  [/\bDesign\b/gi, "Diseño"],
  [/\bStyle\b/gi, "Estilo"],
  [/\bShape\b/gi, "Forma"],
  [/\bPattern\b/gi, "Patrón"],
  [/\bTexture\b/gi, "Textura"],
  [/\bMaterial\b/gi, "Material"],
  [/\bFabric\b/gi, "Tela"],
  [/\bLeather\b/gi, "Cuero"],
  [/\bCotton\b/gi, "Algodón"],
  [/\bSilicone\b/gi, "Silicona"],
  [/\bRubber\b/gi, "Goma"],
  [/\bPlastic\b/gi, "Plástico"],
  [/\bMetal\b/gi, "Metal"],
  [/\bWood\b/gi, "Madera"],
  [/\bGlass\b/gi, "Vidrio"],
  [/\bCeramic\b/gi, "Cerámica"],
  [/\bQuality\b/gi, "Calidad"],
  [/\bValue\b/gi, "Valor"],
  [/\bPrice\b/gi, "Precio"],
  [/\bWarranty\b/gi, "Garantía"],
  [/\bGuarantee\b/gi, "Garantía"],
  [/\bCustomer service\b/gi, "Servicio al cliente"],
  [/\bPackage\b/gi, "Paquete"],
  [/\bPackaging\b/gi, "Empaque"],
  [/\bContents\b/gi, "Contenido"],
  [/\bWeight\b/gi, "Peso"],
  [/\bHeight\b/gi, "Altura"],
  [/\bWidth\b/gi, "Ancho"],
  [/\bLength\b/gi, "Largo"],
  [/\bDepth\b/gi, "Profundidad"],
  [/\bDimensions?\b/gi, "Dimensiones"],
  [/\bCapacity\b/gi, "Capacidad"],
  [/\bPower\b/gi, "Potencia"],
  [/\bSpeed\b/gi, "Velocidad"],
  [/\bTemperature\b/gi, "Temperatura"],
  [/\bPressure\b/gi, "Presión"],
  [/\bVolume\b/gi, "Volumen"],
  [/\bSound\b/gi, "Sonido"],
  [/\bMusic\b/gi, "Música"],
  [/\bVideo\b/gi, "Video"],
  [/\bScreen\b/gi, "Pantalla"],
  [/\bButton\b/gi, "Botón"],
  [/\bSwitch\b/gi, "Interruptor"],
  [/\bConnector\b/gi, "Conector"],
  [/\bPort\b/gi, "Puerto"],
  [/\bSlot\b/gi, "Ranura"],
  [/\bMemory\b/gi, "Memoria"],
  [/\bSensor\b/gi, "Sensor"],
  [/\bTimer\b/gi, "Temporizador"],
  [/\bAlarm\b/gi, "Alarma"],
  [/\bRemote\b/gi, "Control remoto"],
  [/\bSignal\b/gi, "Señal"],
  [/\bRange\b/gi, "Alcance"],
  [/\bConnection\b/gi, "Conexión"],
  [/\bInstallation\b/gi, "Instalación"],
  [/\bSetup\b/gi, "Configuración"],
  [/\bMaintenance\b/gi, "Mantenimiento"],
  [/\bCleaning\b/gi, "Limpieza"],
  [/\bProtection\b/gi, "Protección"],
  [/\bSafety\b/gi, "Seguridad"],
  [/\bComfort\b/gi, "Comodidad"],
  [/\bConvenience\b/gi, "Conveniencia"],
  [/\bPerformance\b/gi, "Rendimiento"],
  [/\bExperience\b/gi, "Experiencia"],
  [/\bSolution\b/gi, "Solución"],
  [/\bOption\b/gi, "Opción"],
  [/\bChoice\b/gi, "Elección"],
  [/\bGift\b/gi, "Regalo"],
  [/\bSurprise\b/gi, "Sorpresa"],
];

/**
 * Dictionary-based translation: applies regex replacements for ~70% Spanish coverage.
 * Always available, no API key needed.
 */
export function dictionaryTranslate(text: string): string {
  if (!text || text.trim().length < 5) return text;
  let result = text;
  for (const [pattern, replacement] of DICTIONARY_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  result = result.replace(/\s+/g, " ").trim();
  return result;
}

/**
 * Dictionary-based translation for bullet arrays.
 */
export function dictionaryTranslateBullets(bullets: string[]): string[] {
  return bullets.map(b => dictionaryTranslate(b));
}

// ============ L3: API TRANSLATION (Anthropic or Dictionary fallback) ============

/**
 * Translates a product description from English to natural Venezuelan Spanish.
 * Uses Anthropic API if available, otherwise falls back to dictionary.
 */
export async function translateDescription(englishText: string): Promise<string> {
  if (!englishText || englishText.trim().length < 5) return englishText;

  // L1: In-memory cache
  const cached = getCached(`desc:${englishText}`);
  if (cached) return cached;

  // Try Anthropic API first
  if (client) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Traduce esta descripción de producto de Amazon al español natural para consumidores venezolanos.

Reglas:
- Español natural y fluido, NO traducción literal/robótica
- NO traduzcas marcas, nombres de modelos, números de modelo, siglas técnicas (USB-C, Bluetooth, WiFi, HD, etc.)
- Preserva números, medidas y especificaciones técnicas exactas
- Preserva el formato: si hay viñetas o saltos de línea, mantenlos
- NO agregues información extra ni comentarios
- Responde SOLO con la traducción, nada más

Texto:
${englishText}`
        }],
      });

      const translated = (response.content[0] as any).text?.trim() || englishText;
      setCache(`desc:${englishText}`, translated);
      return translated;
    } catch (e: any) {
      console.error("[TRANSLATE] Anthropic description error, falling back to dictionary:", e.message);
    }
  }

  // Fallback: dictionary-based translation
  const translated = dictionaryTranslate(englishText);
  setCache(`desc:${englishText}`, translated);
  return translated;
}

/**
 * Translates an array of feature bullets from English to Spanish.
 * Uses Anthropic API if available, otherwise falls back to dictionary.
 */
export async function translateBullets(bullets: string[]): Promise<string[]> {
  if (!bullets || bullets.length === 0) return bullets;

  const cacheKey = `bullets:${bullets.join("|||")}`;
  const cached = getCached(cacheKey);
  if (cached) return cached.split("|||");

  // Try Anthropic API first
  if (client) {
    try {
      const numbered = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{
          role: "user",
          content: `Traduce estas características de producto de Amazon al español natural para consumidores venezolanos.

Reglas:
- Español natural y fluido, NO traducción literal
- NO traduzcas marcas, nombres de modelos, siglas técnicas (USB-C, Bluetooth, WiFi, HD, LED, etc.)
- Preserva números, medidas y especificaciones exactas
- Responde SOLO con las líneas traducidas, numeradas igual (1. 2. 3. etc.), sin comentarios extra

Características:
${numbered}`
        }],
      });

      const text = (response.content[0] as any).text?.trim() || "";
      const translated = text
        .split("\n")
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((line: string) => line.length > 0);

      if (translated.length === bullets.length) {
        setCache(cacheKey, translated.join("|||"));
        return translated;
      }
    } catch (e: any) {
      console.error("[TRANSLATE] Anthropic bullets error, falling back to dictionary:", e.message);
    }
  }

  // Fallback: dictionary-based translation
  const translated = dictionaryTranslateBullets(bullets);
  setCache(cacheKey, translated.join("|||"));
  return translated;
}
