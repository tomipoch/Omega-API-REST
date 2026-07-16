const OpenAI = require('openai');
const Productos = require('../models/productosModel');
const logger = require('../utils/logger');

// Proveedor IA OpenAI-compatible (OpenAI, MiniMax, Kimi, GLM, etc.)
// Configurable vía env: AI_BASE_URL, AI_API_KEY, AI_MODEL
const buildClient = () => {
  if (!process.env.AI_API_KEY) {
    throw new Error('AI_API_KEY no configurada');
  }
  return new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    timeout: Number(process.env.AI_TIMEOUT_MS) || 15000
  });
};

const FAQS = {
  horarios: {
    keywords: ['horario', 'hora', 'abierto', 'cerrado', 'atienden', 'abren', 'cierran'],
    respuesta: 'Nuestro horario de atención es de lunes a viernes de 10:00 a 20:00 hrs y sábados de 10:00 a 14:00 hrs. Domingos y festivos permanecemos cerrados.'
  },
  envios: {
    keywords: ['envío', 'envio', 'despacho', 'entrega', 'delivery', 'shipping', 'enviar'],
    respuesta: 'Actualmente no realizamos envíos. Todas las compras deben ser retiradas presencialmente en nuestra tienda.'
  },
  pagos: {
    keywords: ['pago', 'pagar', 'medio de pago', 'tarjeta', 'efectivo', 'transferencia', 'cuotas'],
    respuesta: 'El pago se realiza únicamente en tienda. Aceptamos tarjetas de crédito y débito, transferencia bancaria y efectivo.'
  },
  cambios: {
    keywords: ['cambio', 'devolución', 'devolucion', 'garantía', 'garantia', 'reembolso'],
    respuesta: 'Ofrecemos cambios dentro de los 30 días posteriores a la compra, presentando boleta y con el producto sin uso. La garantía es de 1 año en relojería.'
  },
  ubicacion: {
    keywords: ['ubicación', 'ubicacion', 'dirección', 'direccion', 'donde', 'dónde', 'local', 'tienda'],
    respuesta: 'Nos encontramos en Av. Providencia 2550, Local 45, Providencia, Santiago, a pasos del Metro Pedro de Valdivia.'
  }
};

const KEYWORDS_CATEGORIA = {
  relojes: ['reloj', 'relojes', 'relojería', 'relojeria', 'watch', 'watches'],
  anillos: ['anillo', 'anillos', 'sortija', 'sortijas', 'ring', 'rings', 'compromiso'],
  pulseras: ['pulsera', 'pulseras', 'brazalete', 'brazaletes', 'bracelet', 'bracelets'],
  collares: ['collar', 'collares', 'cadena', 'cadenas', 'necklace', 'necklaces'],
  aretes: ['arete', 'aretes', 'aro', 'aros', 'pendiente', 'pendientes', 'earring', 'earrings']
};

const SYSTEM_PROMPT = `Eres el asistente virtual oficial de Omega Joyería. 
Debes responder SIEMPRE con profesionalismo, claridad y un tono amable y formal (trato de "usted"). 
No inventes stock, precios ni productos. 

INFORMACIÓN OFICIAL:
- La plataforma SOLO permite reservas de productos, servicios y eventos.
- No existe pasarela de pago en línea. Todos los pagos se realizan presencialmente.
- NO se realizan envíos.
- Horario: Lunes a viernes 10:00–20:00 / Sábado 10:00–14:00 / Domingo cerrado.
- Métodos de pago en tienda: tarjetas, transferencia y efectivo.
- Cambios hasta 30 días con boleta; garantía 1 año en relojería.

REGLAS:
- No ofrecer envíos.
- No mencionar pasarelas de pago.
- NO INVENTES información. Si te dan datos específicos, úsalos exactamente.`;

const buscarEnFAQs = (mensaje) => {
  const mensajeLower = mensaje.toLowerCase();
  for (const faq of Object.values(FAQS)) {
    if (faq.keywords.some(keyword => mensajeLower.includes(keyword))) {
      return faq.respuesta;
    }
  }
  return null;
};

const detectarCategoria = (mensaje) => {
  const mensajeLower = mensaje.toLowerCase();
  for (const [categoria, keywords] of Object.entries(KEYWORDS_CATEGORIA)) {
    if (keywords.some(keyword => mensajeLower.includes(keyword))) {
      return categoria;
    }
  }
  return null;
};

const cargarProductos = async () => {
  try {
    return await Productos.obtenerTodos();
  } catch (error) {
    logger.warn(`No se pudieron cargar productos: ${error.message}`);
    return [];
  }
};

const filtrarProductosPorCategoria = (productos, categoria) => {
  if (!categoria) return [];
  const keywords = KEYWORDS_CATEGORIA[categoria];
  return productos.filter(p =>
    keywords.some(k => p.nombre_producto?.toLowerCase().includes(k))
  ).slice(0, 10);
};

const llamarProveedorIA = async ({ mensaje, systemPrompt, productosContexto }) => {
  if (!process.env.AI_API_KEY) {
    return {
      respuesta: 'El servicio de IA no está disponible en este momento. Por favor contacta directamente a la tienda.',
      modelo: null
    };
  }

  const client = buildClient();
  const contextoStr = productosContexto.length
    ? `\n\nProductos disponibles:\n${productosContexto.map(p =>
        `- ${p.nombre_producto}: $${p.precio_producto} (stock: ${p.stock})`
      ).join('\n')}`
    : '';

  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt + contextoStr },
      { role: 'user', content: mensaje }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  return {
    respuesta: completion.choices[0].message.content,
    modelo: completion.model
  };
};

const procesarMensaje = async ({ mensaje }) => {
  if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
    const { ValidationError } = require('../utils/errors');
    throw new ValidationError('El mensaje es requerido');
  }

  // 1. Intentar FAQ local primero (gratis)
  const faqRespuesta = buscarEnFAQs(mensaje);
  if (faqRespuesta) {
    return {
      tipo: 'faq',
      respuesta: faqRespuesta,
      productos: null,
      modelo: null
    };
  }

  // 2. Detectar categoría
  const categoria = detectarCategoria(mensaje);
  const productos = await cargarProductos();
  const productosFiltrados = categoria ? filtrarProductosPorCategoria(productos, categoria) : [];

  // 3. Llamar al proveedor IA
  const { respuesta, modelo } = await llamarProveedorIA({
    mensaje,
    systemPrompt: SYSTEM_PROMPT,
    productosContexto: categoria ? productosFiltrados : productos.slice(0, 5)
  });

  return {
    tipo: categoria ? 'categoria' : 'general',
    respuesta,
    productos: productosFiltrados.length ? productosFiltrados : undefined,
    modelo
  };
};

module.exports = {
  procesarMensaje,
  buscarEnFAQs,
  detectarCategoria,
  FAQS
};