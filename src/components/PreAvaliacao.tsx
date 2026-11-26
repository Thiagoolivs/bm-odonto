import { useState, type FormEvent } from "react";
import { FORM, WHATSAPP_DISPLAY, whatsappLink } from "../content";
import { ArrowRight, WhatsAppIcon } from "./Icons";
import { Label, Sparkle, Title } from "./ui";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const STEPS = ["Sobre você", "Seu sorriso", "Como nos conheceu"];

function Chip({
  active,
  onClick,
  children,
  role = "checkbox",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  role?: "checkbox" | "radio";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={active}
      onClick={onClick}
      className={`rounded-full border px-5 py-3 text-[0.8rem] tracking-[0.04em] transition-all duration-400 ease-[var(--ease-lux)] ${
        active ? "border-gold bg-gold text-ink" : "border-cream/25 text-cream/85 hover:border-gold/70"
      }`}
    >
      {children}
    </button>
  );
}

export function PreAvaliacao() {
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState("");
  const [fone, setFone] = useState("");
  const [incomodos, setIncomodos] = useState<string[]>([]);
  const [origem, setOrigem] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const digits = fone.replace(/\D/g, "");
  const valid = [nome.trim().length >= 2 && digits.length >= 10, incomodos.length > 0, origem !== ""];

  const next = () => {
    if (!valid[step]) {
      setError(
        step === 0
          ? "Informe seu nome e um WhatsApp com DDD."
          : step === 1
            ? "Escolha ao menos uma opção."
            : "Escolha uma opção.",
      );
      return;
    }
    setError("");
    setStep((s) => Math.min(2, s + 1));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) return next();
    if (!valid.every(Boolean)) return next();
    const msg = [
      "Olá! Gostaria de fazer uma pré-avaliação na BM Odontologia.",
      "",
      `• Nome: ${nome.trim()}`,
      `• WhatsApp: ${fone}`,
      `• O que me incomoda no sorriso: ${incomodos.join(", ")}`,
      `• Conheci a BM por: ${origem}`,
    ].join("\n");
    const url = whatsappLink(msg);
    setSent(url);
    window.open(url, "_blank", "noopener");
  };

  const toggle = (v: string) => setIncomodos((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]));

  return (
    <section id="agendar" className="grain relative z-10 overflow-hidden bg-ink px-6 py-24 text-cream md:px-10 md:py-36" aria-label="Pré-avaliação">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(185,140,75,.22),transparent_65%)]" />
      <div className="relative z-10 mx-auto max-w-[1400px] md:grid md:grid-cols-[1fr_1.15fr] md:gap-20">
        <div className="relative">
          <Label>Pré-avaliação</Label>
          <Title lines={["Conte um pouco", "sobre você."]} italic={1} className="mt-5 text-[clamp(2.6rem,11vw,5.2rem)] text-cream" />
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-cream/65" data-reveal>
            Três passos rápidos. No final, abrimos o WhatsApp da clínica com a sua mensagem pronta.
          </p>
          <Sparkle className="right-6 top-0" size={14} delay={0.9} />
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="relative mt-12 rounded-[28px] border border-gold/25 bg-ink-2/70 p-6 md:mt-0 md:p-10"
          aria-describedby="form-status"
        >
          {/* progresso */}
          <div className="flex items-center justify-between">
            <p className="label text-[0.6rem] text-cream/65">
              Passo {step + 1} de 3 · <span className="text-gold">{STEPS[step]}</span>
            </p>
            {step > 0 && !sent && (
              <button type="button" onClick={() => (setError(""), setStep((s) => s - 1))} className="label text-[0.58rem] text-cream/65 hover:text-gold">
                Voltar
              </button>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="relative h-px overflow-hidden bg-cream/15">
                <span
                  className="absolute inset-0 origin-left bg-gold transition-transform duration-700 ease-[var(--ease-lux)]"
                  style={{ transform: `scaleX(${i <= step ? 1 : 0})` }}
                />
              </span>
            ))}
          </div>

          <div className="relative mt-8 min-h-[250px]">
            {/* passo 1 */}
            <fieldset
              className="absolute inset-0 transition-all duration-700 ease-[var(--ease-lux)]"
              style={{ opacity: step === 0 ? 1 : 0, transform: `translateX(${(0 - step) * 40}px)`, visibility: step === 0 ? "visible" : "hidden" }}
            >
              <legend className="sr-only">Sobre você</legend>
              <label className="block">
                <span className="label text-[0.6rem] text-cream/65">Seu nome</span>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                  className="mt-2 w-full border-b border-gold/40 bg-transparent py-3 font-serif text-[1.6rem] text-cream placeholder:text-cream/25 focus:border-gold focus:outline-none"
                />
              </label>
              <label className="mt-8 block">
                <span className="label text-[0.6rem] text-cream/65">WhatsApp</span>
                <input
                  value={fone}
                  onChange={(e) => setFone(maskPhone(e.target.value))}
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="(11) 90000-0000"
                  className="mt-2 w-full border-b border-gold/40 bg-transparent py-3 font-serif text-[1.6rem] text-cream placeholder:text-cream/25 focus:border-gold focus:outline-none"
                />
              </label>
            </fieldset>

            {/* passo 2 */}
            <fieldset
              className="absolute inset-0 transition-all duration-700 ease-[var(--ease-lux)]"
              style={{ opacity: step === 1 ? 1 : 0, transform: `translateX(${(1 - step) * 40}px)`, visibility: step === 1 ? "visible" : "hidden" }}
            >
              <legend className="font-serif text-[1.8rem] leading-tight text-cream">O que te incomoda no sorriso?</legend>
              <p className="mt-1 text-[0.8rem] text-cream/62">Pode escolher mais de uma opção.</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {FORM.incomodos.map((v) => (
                  <Chip key={v} active={incomodos.includes(v)} onClick={() => toggle(v)}>
                    {v}
                  </Chip>
                ))}
              </div>
            </fieldset>

            {/* passo 3 */}
            <fieldset
              className="absolute inset-0 transition-all duration-700 ease-[var(--ease-lux)]"
              style={{ opacity: step === 2 ? 1 : 0, transform: `translateX(${(2 - step) * 40}px)`, visibility: step === 2 ? "visible" : "hidden" }}
            >
              <legend className="font-serif text-[1.8rem] leading-tight text-cream">Como conheceu a BM?</legend>
              <div className="mt-6 flex flex-wrap gap-2.5" role="radiogroup">
                {FORM.origens.map((v) => (
                  <Chip key={v} role="radio" active={origem === v} onClick={() => setOrigem(v)}>
                    {v}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>

          <p id="form-status" role="status" className="min-h-[1.4em] text-[0.8rem] text-gold-soft">
            {error}
          </p>

          {sent ? (
            <div className="mt-4 rounded-2xl border border-gold/30 p-5">
              <p className="font-serif text-[1.5rem] text-cream">Pronto, {nome.split(" ")[0]}!</p>
              <p className="mt-1 text-[0.88rem] text-cream/65">Abrimos o WhatsApp com a sua mensagem. Se não abriu, toque abaixo.</p>
              <a href={sent} target="_blank" rel="noopener" className="btn-gold solid mt-5 w-full">
                <WhatsAppIcon size={18} /> Abrir WhatsApp
              </a>
            </div>
          ) : (
            <button type="submit" className="btn-gold solid mt-4 w-full">
              {step < 2 ? (
                <>
                  Continuar <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <WhatsAppIcon size={18} /> Enviar pelo WhatsApp
                </>
              )}
            </button>
          )}
          <p className="mt-5 text-center text-[0.7rem] leading-relaxed text-cream/65">
            Seus dados são usados apenas para o contato da clínica · {WHATSAPP_DISPLAY}
          </p>
        </form>
      </div>
    </section>
  );
}
