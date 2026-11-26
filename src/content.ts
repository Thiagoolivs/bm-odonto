// Todo o conteúdo da página num só lugar (fácil de revisar com a clínica).
// Regras do Código de Ética Odontológica: sem preços, descontos, parcelamento
// ou formas de pagamento; sem a expressão proibida de comparação; sem promessa de resultado.

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
  { label: "Tratamentos", href: "#tratamentos" },
  { label: "Técnicas", href: "#tecnicas" },
  { label: "Doutores", href: "#doutores" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Localização", href: "#localizacao" },
];

export const HERO = {
  label: "Estética que realça o que te faz único",
  title: ["Um sorriso que", "combina com você."],
  cta: "Agendar avaliação",
  seals: [
    { title: "Em uma única sessão", note: "(casos indicados)", icon: "session" },
    { title: "Até 4 horas", note: "de procedimento", icon: "clock" },
    { title: "12 meses de garantia", note: "em contrato", icon: "seal" },
  ] as const,
};

export const STORY = [
  {
    n: "01",
    title: "Avaliação",
    text: "Conversamos sobre o que você deseja e analisamos sorriso, gengiva e mordida para entender se a lente em resina é indicada para o seu caso.",
  },
  {
    n: "02",
    title: "Planejamento individual",
    text: "Cor, formato e espessura são definidos para o seu rosto, respeitando as proporções e a naturalidade do seu sorriso.",
  },
  {
    n: "03",
    title: "Aplicação",
    text: "A resina é aplicada em camadas, de forma confortável e minimamente invasiva — em uma única sessão nos casos indicados.",
  },
];

export const SHADES = [
  { key: "BL1", lens: "#fffdf9", tooth: "#fbf8f1", swatch: "#fbf9f4" },
  { key: "BL2", lens: "#fdfaf3", tooth: "#f5f0e6", swatch: "#f4efe5" },
  { key: "B1", lens: "#fbf4e7", tooth: "#efe5d2", swatch: "#eee3cd" },
  { key: "A1", lens: "#f8eedb", tooth: "#ebdcc0", swatch: "#e9dabb" },
  { key: "A2", lens: "#f5e9d3", tooth: "#e8d6b6", swatch: "#e0c9a0" },
] as const;

export const SHAPES = [
  { key: "oval", label: "Oval" },
  { key: "quadrado", label: "Quadrado" },
  { key: "triangular", label: "Triangular" },
] as const;

export const SIMULATOR_NOTE = "Simulação ilustrativa. A indicação final é feita na avaliação.";

export const TECNICAS = [
  {
    key: "tradicional",
    title: "Tradicional",
    text: "Menos camadas e cor mais uniforme, para um sorriso claro, limpo e harmônico.",
    layers: 2,
  },
  {
    key: "estratificada",
    title: "Estratificada",
    text: "Camadas com opacidades diferentes reproduzem a profundidade do dente natural: dentina, esmalte e translucidez.",
    layers: 4,
  },
  {
    key: "realista",
    title: "Realista",
    text: "Caracterização minuciosa — halo incisal, translucidez e microtextura — que imita o esmalte natural de perto.",
    layers: 6,
  },
];

export const RESULTADOS = [
  2, 4, 12, 3, 5, 9, 6, 10, 8, 11, 13, 14, 7, 1,
].map((n) => `/assets/resultados/resultado-${String(n).padStart(2, "0")}.webp`);

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

export const JORNADA = [
  { title: "Contato", text: "Você fala com a nossa equipe pelo WhatsApp e escolhe o melhor horário." },
  { title: "Avaliação", text: "Consulta presencial para entender seu sorriso, sua saúde bucal e o que você deseja." },
  { title: "Plano individual", text: "Cor, formato e técnica definidos para você, com cada etapa explicada antes de começar." },
  { title: "Acompanhamento", text: "Retornos a cada 6 meses para manutenção: limpeza, polimento e blindagem." },
];

export const OUTROS = [
  { title: "Limpeza", text: "Profilaxia e remoção de tártaro para a saúde da gengiva." },
  { title: "Restaurações", text: "Recuperação de forma e função com resina na cor do dente." },
  { title: "Implantes", text: "Reposição de dentes perdidos com planejamento cuidadoso." },
  { title: "Extrações", text: "Procedimentos conduzidos com calma, conforto e orientação." },
  { title: "Cirurgias", text: "Cirurgias orais com acompanhamento próximo em cada etapa." },
];

export const FAQ = [
  {
    q: "Quanto tempo duram as lentes em resina?",
    a: "Em média, de 5 a 8 anos. A durabilidade varia de pessoa para pessoa e depende dos cuidados diários e das manutenções periódicas.",
  },
  {
    q: "Precisa de manutenção?",
    a: "Sim. Recomendamos retornos a cada 6 meses para limpeza, polimento e blindagem, que ajudam a preservar o brilho e a integridade da resina.",
  },
  {
    q: "Quais técnicas vocês utilizam?",
    a: "Trabalhamos com as técnicas tradicional, estratificada e realista. A escolha é feita na avaliação, de acordo com o seu caso e com o que você deseja para o seu sorriso.",
  },
  {
    q: "Posso escolher a cor?",
    a: "Pode. A cor é definida junto com você no planejamento, buscando um tom que harmonize com o seu rosto e com a naturalidade do sorriso.",
  },
  {
    q: "A aplicação é desconfortável?",
    a: "A aplicação é confortável e minimamente invasiva. Cada etapa é explicada e combinada com você antes de começar.",
  },
  {
    q: "Lente em resina causa mau hálito?",
    a: "Não. Com higiene adequada — escovação, fio dental e as manutenções periódicas — as lentes não causam mau hálito.",
  },
];

export const FORM = {
  incomodos: ["Cor", "Formato", "Espaços", "Desgaste", "Outro"],
  origens: ["Instagram", "Anúncio", "Google", "Indicação", "Outro"],
};

export const LOCAL = {
  address: "Av. Brigadeiro Luís Antônio, 2050, sala 41",
  city: "São Paulo/SP",
  notes: ["~200 m do Metrô Brigadeiro", "Perto da Av. Paulista", "Atendimento com agendamento"],
};

export const RESPONSAVEIS = "Dr. Israel Marcos · CRO-SP 150317 | Dra. Alexia Mayara · CRO-SP 134840";
