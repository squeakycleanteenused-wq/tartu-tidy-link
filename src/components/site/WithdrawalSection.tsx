import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY, companyContact } from "@/lib/rental-contract";
import { canSendDirect, sendRequest } from "@/lib/send-request";

/* Taganemisõiguse info ja lihtne taganemisvorm ("Taganen lepingust").
   Seadus (alates 1.09.2026) nõuab veebis sõlmitud tarbijalepingute puhul lihtsat taganemisvõimalust
   kogu taganemistähtaja jooksul. Jäta see sektsioon lehele alles ja lisa link menüüsse. */

const COPY = {
  et: {
    title: "Taganen lepingust",
    intro:
      "Eraisikust tellijal (tarbijal) on õigus sidevahendi teel sõlmitud lepingust 14 päeva jooksul põhjust avaldamata taganeda. Tähtaeg algab lepingu sõlmimisest ehk meie kinnituse päevast ja lõpeb 14 päeva möödumisel. Tähtaja pidamiseks piisab, kui saadad avalduse enne tähtaja lõppu ära. Ettevõttest tellijale taganemisõigus ei kohaldu.",
    how: "Taganemiseks täida allolev vorm ja vajuta „Kinnitan taganemise“ (avaneb valmis e-kiri, mille pead saatma) või saada meile vabas vormis ühemõtteline avaldus e-postiga. Kinnitame avalduse kättesaamise e-kirjaga viivitamata.",
    effects:
      "Kui oled taotlenud teenuse osutamise alustamist taganemistähtaja jooksul, tasud meile taganemise korral proportsionaalselt juba osutatud teenuse eest (võrreldes lepingu täieliku täitmisega). Teenuse täielikul osutamisel kaob taganemisõigus, kui oled sellega eelnevalt nõustunud. Muul juhul tagastame sinu tasutu viivitamata, kuid mitte hiljem kui 14 päeva jooksul taganemisavalduse kättesaamisest. Üüri puhul tagasta masin viivitamata, kuid mitte hiljem kui 14 päeva jooksul avalduse tegemisest.",
    name: "Sinu nimi",
    address: "Sinu aadress",
    contract: "Leping (nt teenus, kuupäev, tellimuse info)",
    contractPh: "nt hoolduskoristus 05.10.2026, Soola 5 Tartu",
    email: "E-post kinnituse saatmiseks",
    confirm: "Kinnitan taganemise",
    err: "Palun täida nimi, e-post ja leping, millest taganed.",
    formTitle: "Taganemisavalduse tüüpvorm (võid kasutada, ei ole kohustuslik)",
    formLines: [
      "(Täitke ja saatke see vorm ainult juhul, kui soovite lepingust taganeda.)",
      "Kellele: {company}",
      "Mina/meie (*) teatan/teatame (*) käesolevaga, et taganen/taganeme (*) minu/meie (*) sõlmitud lepingust, mille ese on järgmise teenuse osutamine / kauba müük (*): ……………………",
      "Tellitud (*)/kätte saadud (*) (kuupäev): ……………………",
      "Tarbija(te) nimi: ……………………",
      "Tarbija(te) aadress: ……………………",
      "Tarbija(te) allkiri (ainult juhul, kui vorm esitatakse paberil): ……………………",
      "Kuupäev: ……………………",
      "(*) Mittevajalik maha kriipsutada.",
    ],
    verify: "Tüüpvorm põhineb justiitsministri määrusel nr 41 (17.12.2013).",
    sending: "Saadan…",
    sentTitle: "Taganemisavaldus on saadetud",
    sentText: (email: string) => `Saime sinu avalduse kätte. Kinnituse (sisu, kuupäeva ja kellaajaga) saatsime aadressile ${email}. Kui kirja mõne minuti pärast ei ole, vaata rämpspostikausta.`,
    sentNoCopy: "Saime sinu avalduse kätte. Kinnituse saatmine sinu e-postile ei õnnestunud. Salvesta see teade ja tee sellest ekraanipilt.",
    failed: "Otse saatmine ei õnnestunud. Avame selle asemel e-posti programmi.",
    confirmMsg: (name: string, when: string, body: string) => `Tere, ${name}!\n\nKinnitame, et saime sinu taganemisavalduse kätte ${when}.\n\nAvalduse sisu:\n${body}\n\nTagastame sinu tasutu viivitamata, kuid hiljemalt 14 päeva jooksul avalduse kättesaamisest (arvestades juba osutatud teenuse proportsionaalset tasu, kui teenus on alanud sinu soovil). Üüri puhul tagasta masin viivitamata, kuid mitte hiljem kui 14 päeva jooksul avalduse tegemisest.\n\nSqueaky Clean Teenused OÜ`,
    mail: { subject: "Taganemisavaldus", head: "TAGANEMISAVALDUS", to: "Kellele", body: "Mina, {name}, teatan käesolevaga, et taganen lepingust", contract: "Leping", address: "Aadress", email: "E-post kinnituse saatmiseks", date: "Kuupäev" },
  },
  en: {
    title: "Withdraw from a contract",
    intro:
      "A private customer (consumer) has the right to withdraw from a contract concluded at a distance within 14 days without giving a reason. The period starts when the contract is concluded, i.e. on the day of our confirmation, and ends 14 days later. It is enough to send your notice before the period ends. The right of withdrawal does not apply to business customers.",
    how: "To withdraw, fill in the form below and press “Confirm withdrawal” (a ready-made email opens which you must send) or send us any unambiguous statement by email. We will confirm receipt of your notice by email without delay.",
    effects:
      "If you asked us to start the service during the withdrawal period, you pay proportionally for the service already provided (compared with full performance of the contract). The right of withdrawal is lost once the service has been fully performed, if you agreed to this in advance. Otherwise we refund what you paid without delay and no later than 14 days after receiving your notice. For a rental, return the machine without delay and no later than 14 days after your notice.",
    name: "Your name",
    address: "Your address",
    contract: "Contract (e.g. service, date, order details)",
    contractPh: "e.g. maintenance cleaning 05.10.2026, Soola 5 Tartu",
    email: "Email for our confirmation",
    confirm: "Confirm withdrawal",
    err: "Please fill in your name, email and the contract you are withdrawing from.",
    formTitle: "Standard withdrawal form (you may use it, it is not mandatory)",
    formLines: [
      "(Complete and return this form only if you wish to withdraw from the contract.)",
      "To: {company}",
      "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract for the provision of the following service / sale of the following goods (*): ……………………",
      "Ordered on (*)/received on (*): ……………………",
      "Name of consumer(s): ……………………",
      "Address of consumer(s): ……………………",
      "Signature of consumer(s) (only if this form is notified on paper): ……………………",
      "Date: ……………………",
      "(*) Delete as appropriate.",
    ],
    verify: "The standard form is based on Regulation No 41 of the Minister of Justice (17.12.2013).",
    sending: "Sending…",
    sentTitle: "Your withdrawal notice has been sent",
    sentText: (email: string) => `We received your notice. We sent a confirmation (with the content, date and time) to ${email}. If it does not arrive in a few minutes, check your spam folder.`,
    sentNoCopy: "We received your notice. Sending the confirmation to your email failed, please save this message and take a screenshot of it.",
    failed: "Direct sending failed. We will open your mail app instead.",
    confirmMsg: (name: string, when: string, body: string) => `Hello, ${name}!\n\nWe confirm that we received your withdrawal notice on ${when}.\n\nContent of the notice:\n${body}\n\nWe will refund what you paid without delay and no later than 14 days after receiving your notice (taking into account proportional payment for the service already provided, if it started at your request). For a rental, return the machine without delay and no later than 14 days after your notice.\n\nSqueaky Clean Teenused OÜ`,
    mail: { subject: "Withdrawal notice", head: "WITHDRAWAL NOTICE", to: "To", body: "I, {name}, hereby give notice that I withdraw from the contract", contract: "Contract", address: "Address", email: "Email for confirmation", date: "Date" },
  },
} as const;

export function WithdrawalSection() {
  const { lang } = useLang();
  const c = COPY[lang];
  const company = `${RENTAL_COMPANY.name}, ${companyContact()}`;
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sentCopyOk, setSentCopyOk] = useState<boolean | null>(null);

  const onConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contract.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError(c.err);
      return;
    }
    setError("");
    const m = c.mail;
    const today = new Date().toLocaleDateString(lang === "et" ? "et-EE" : "en-GB");
    const body = [
      m.head,
      "",
      `${m.to}: ${company}`,
      "",
      `${m.body.replace("{name}", name.trim())}: ${contract.trim()}`,
      `${m.address}: ${address.trim() || "-"}`,
      `${m.email}: ${email.trim()}`,
      `${m.date}: ${today}`,
    ].join("\n");
    const subject = `${m.subject}: ${name.trim()}`;
    const openMail = () => {
      window.location.href = `mailto:${RENTAL_COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    if (!canSendDirect()) {
      openMail();
      return;
    }
    const when = new Date().toLocaleString(lang === "et" ? "et-EE" : "en-GB");
    setSending(true);
    sendRequest({
      subject,
      message: body,
      clientEmail: email.trim(),
      clientName: name.trim(),
      clientMessage: c.confirmMsg(name.trim(), when, body),
    })
      .then((res) => setSentCopyOk(res.copy))
      .catch(() => {
        setError(c.failed);
        openMail();
      })
      .finally(() => setSending(false));
  };

  return (
    <section id="taganemine" className="scroll-mt-28 bg-ink py-16 text-white">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-2xl font-bold sm:text-3xl">
          {c.title}
        </h2>
        <p className="mt-3 text-sm text-white/85">{c.intro}</p>
        <p className="mt-2 text-sm text-white/85">{c.how}</p>
        <p className="mt-2 text-xs text-white/65">{c.effects}</p>

        <form onSubmit={onConfirm} noValidate className="mt-8 space-y-4 rounded-md bg-background p-6 text-foreground">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{c.name}</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{c.address}</span>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{c.contract}</span>
            <Input value={contract} onChange={(e) => setContract(e.target.value)} placeholder={c.contractPh} maxLength={300} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{c.email}</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
          </label>
          {error && (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="px-6" disabled={sending}>
            {sending ? c.sending : c.confirm}
          </Button>
          {sentCopyOk !== null && (
            <div className="rounded-md border border-border bg-secondary p-4 text-sm">
              <p className="font-semibold">{c.sentTitle}</p>
              <p className="mt-1 text-secondary-foreground">{sentCopyOk ? c.sentText(email.trim()) : c.sentNoCopy}</p>
            </div>
          )}
        </form>

        <details className="mt-4 rounded-md border border-white/20 p-4 text-sm">
          <summary className="cursor-pointer font-medium">{c.formTitle}</summary>
          <div className="mt-3 space-y-2 text-white/85">
            {c.formLines.map((l) => (
              <p key={l}>{l.replace("{company}", company)}</p>
            ))}
            <p className="text-xs text-white/65">{c.verify}</p>
          </div>
        </details>
      </div>
    </section>
  );
}
