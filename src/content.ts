// Todo o conteúdo da página num só lugar.
// Código de Ética Odontológica: sem preços, descontos, parcelamento ou formas de pagamento;
// sem a expressão de comparação proibida; sem promessa de resultado; CROs visíveis.

export const WHATSAPP_NUMBER = "5511973524548";
export const WHATSAPP_DISPLAY = "(11) 97352-4548";
export const WHATSAPP_DEFAULT_MESSAGE =
  "Olá, tudo bem? Quero saber mais das lentes em resina ultra realistas da BM Odontologia 😄";

export const whatsappLink = (message = WHATSAPP_DEFAULT_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const LINKS = {
  instagram: "https://www.instagram.com/bmodonto/",
  instagramHandle: "@bmodonto",
  googleReviews: "https://maps.app.goo.gl/6D25dwDvtskqCVMZ7",
  maps: "https://maps.app.goo.gl/6D25dwDvtskqCVMZ7",
  mapsEmbed:
    "https://www.google.com/maps?q=Av.+Brigadeiro+Lu%C3%ADs+Ant%C3%B4nio,+2050,+S%C3%A3o+Paulo&output=embed",
};

export const SIGNATURE = "Naturalidade e sofisticação em forma de sorriso.";

export const NAV = [
  { label: "Lentes", href: "#lentes" },
  { label: "Resultados", href: "#resultados" },
  { label: "Doutores", href: "#doutores" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Localização", href: "#localizacao" },
];

export const HERO = {
  eyebrow: "Estética que realça o que te faz único",
  title: ["Um sorriso", "que combina", "com você."],
  cta: "Agendar avaliação",
  seals: [
    { title: "Em uma única sessão", note: "Casos indicados" },
    { title: "Até 4 horas", note: "De procedimento" },
    { title: "12 meses de garantia", note: "Em contrato" },
  ],
};

/** frases da sequência do sorriso (rolagem) */
export const SEQUENCE = [
  { at: [0.02, 0.24], lines: ["Tudo começa", "com um sorriso."] },
  { at: [0.3, 0.52], lines: ["O seu.", "Do seu jeito."] },
  { at: [0.58, 0.78], lines: ["Lentes em resina", "ultrafinas."] },
  { at: [0.84, 1.01], lines: ["Feitas à mão,", "uma a uma."] },
];

export const PROCESS = [
  {
    n: "01",
    title: "Avaliação",
    text: "Analisamos sorriso, gengiva e mordida para entender se a lente em resina é indicada para você.",
  },
  {
    n: "02",
    title: "Planejamento individual",
    text: "Cor, formato e espessura definidos para o seu rosto, respeitando a naturalidade do sorriso.",
  },
  {
    n: "03",
    title: "Aplicação",
    text: "Resina aplicada em camadas, de forma confortável e minimamente invasiva.",
  },
];

export const TECNICAS = [
  { title: "Tradicional", text: "Menos camadas, cor uniforme e acabamento limpo." },
  { title: "Estratificada", text: "Camadas de opacidades diferentes que reproduzem a profundidade do dente." },
  { title: "Realista", text: "Halo incisal, translucidez e microtextura que imitam o esmalte de perto." },
];

export const SHADES = [
  { key: "BL1", lens: "#fffdf9", tooth: "#fbf8f1", swatch: "#f7f5f0" },
  { key: "BL2", lens: "#fdfaf3", tooth: "#f5f0e6", swatch: "#f1ece2" },
  { key: "B1", lens: "#fdf9f1", tooth: "#f4eee2", swatch: "#ebe1cd" },
  { key: "A1", lens: "#fbf6ec", tooth: "#f1e8d6", swatch: "#e6d6b8" },
  { key: "A2", lens: "#faf3e6", tooth: "#ede1cb", swatch: "#dcc7a2" },
] as const;

export const SHAPES = [
  { key: "oval", label: "Oval" },
  { key: "quadrado", label: "Quadrado" },
  { key: "triangular", label: "Triangular" },
] as const;

export const SIMULATOR_NOTE = "Simulação ilustrativa. A indicação final é feita na avaliação.";

export const RESULTADOS = [2, 4, 12, 3, 5, 9, 6, 10, 8, 11, 13, 14, 7, 1].map(
  (n) => `/assets/resultados/resultado-${String(n).padStart(2, "0")}.webp`,
);

export const VIDEOS = [1, 2, 3].map((n) => ({
  src: `/assets/videos/video_${n}.mp4`,
  poster: `/assets/videos/video_${n}-poster.webp`,
}));

export const DOUTORES = [
  {
    name: "Dra. Alexia Mayara",
    cro: "CRO-SP 134840",
    area: "Estética odontológica e lentes em resina",
    photo: "/assets/dra-alexia.webp",
    instagram: "https://www.instagram.com/dra.alexiamorais/",
    handle: "@dra.alexiamorais",
  },
  {
    name: "Dr. Israel Marcos",
    cro: "CRO-SP 150317",
    area: "Estética odontológica e lentes em resina",
    photo: "/assets/dr-israel.webp",
    instagram: "https://www.instagram.com/dr.israael/",
    handle: "@dr.israael",
  },
];

export const DEPOIMENTOS = [
  { text: "Profissional excelente, extremamente competente e cuidadosa.", name: "Gessica S." },
  { text: "Clínica excelente e atendimento impecável.", name: "André S." },
  { text: "Super cuidadosos desde o primeiro contato.", name: "Carla P." },
  { text: "Conheci a clínica pelo Instagram e estou feliz e realizada.", name: "Luz M." },
];

export const FAQ = [
  {
    q: "Quanto tempo duram as lentes em resina?",
    a: "Em média, de 5 a 8 anos. A durabilidade varia de pessoa para pessoa e depende dos cuidados diários e das manutenções.",
  },
  {
    q: "Precisa de manutenção?",
    a: "Sim. Recomendamos retornos a cada 6 meses para limpeza, polimento e blindagem.",
  },
  {
    q: "Posso escolher a cor?",
    a: "Pode. A cor é definida com você no planejamento, buscando um tom que harmonize com o seu rosto.",
  },
  {
    q: "A aplicação é desconfortável?",
    a: "A aplicação é confortável e minimamente invasiva. Cada etapa é explicada antes de começar.",
  },
  {
    q: "Lente em resina causa mau hálito?",
    a: "Não. Com higiene adequada e as manutenções periódicas, as lentes não causam mau hálito.",
  },
];

export const LOCAL = {
  address: "Av. Brigadeiro Luís Antônio, 2050, sala 41",
  city: "São Paulo, SP",
  notes: ["200 m do Metrô Brigadeiro", "Perto da Av. Paulista", "Atendimento com agendamento"],
};

export const RESPONSAVEIS = [
  "Dr. Israel Marcos · CRO-SP 150317",
  "Dra. Alexia Mayara · CRO-SP 134840",
];
