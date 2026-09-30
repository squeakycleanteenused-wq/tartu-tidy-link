import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";

/* "Küsi nõu fotoga": klient valib kuni 5 fotot, kirjutab küsimuse ja saadab selle meile.
   Fotod vähendatakse enne saatmist (max 1280 px, JPEG) ja EXIF (sh asukoht) eemaldatakse.
   NB! Ilma serveripoolse osata ei saa fotosid e-kirjale automaatselt manustada:
   - mobiilis: nupp "Jaga" lisab fotod automaatselt (valid Gmaili vms)
   - arvutis: e-kiri avaneb ja klient lisab fotod ise manusena. */

const MAX_PHOTOS = 5;
const MAX_SIDE = 1280;

type Photo = { id: string; file: File; url: string };

async function shrink(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.78));
  if (!blob) throw new Error("no blob");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "foto"}.jpg`, { type: "image/jpeg" });
}

const COPY = {
  et: {
    title: "Küsi nõu fotoga",
    subtitle: "Pole kindel, kas midagi on võimalik puhastada? Saada foto ja küsimus, vastame e-postiga.",
    what: "Mis see on?",
    whatOpts: ["Polstermööbel", "Vaip", "Madrats", "Ahi", "Aken või rõdu", "Muu"],
    question: "Sinu küsimus",
    questionPh: "nt Kas seda plekki on võimalik eemaldada? Kui vana on vaip ja mis materjalist?",
    email: "Sinu e-post (vastuse saatmiseks)",
    name: "Sinu nimi (valikuline)",
    photos: "Fotod",
    photosHint: `Kuni ${MAX_PHOTOS} fotot. Vähendame need saatmiseks ja eemaldame asukohaandmed.`,
    add: "Lisa fotod",
    remove: "Eemalda foto",
    tooMany: `Kuni ${MAX_PHOTOS} fotot.`,
    readErr: "Fotot ei õnnestunud lugeda. Proovi mõnda teist (JPG või PNG).",
    consent:
      "Saadan fotod, et saada nõu. Olen veendunud, et fotodel ei ole inimesi ega isikuandmeid (dokumendid, kirjad, aadressisildid). Nõustun, et Squeaky Clean Teenused OÜ kasutab fotosid ja minu andmeid ainult vastuse andmiseks.",
    note: "Vastus fotode põhjal on hinnanguline. Lõpliku hinnangu annab koristaja kohapeal. See ei ole siduv pakkumine ega leping. Fotosid ja kirju säilitame ainult nii kaua, kui see on vajalik vastuse andmiseks ja võimalike nõuete kaitsmiseks.",
    mail: "Saada e-postiga",
    share: "Jaga telefonist (fotod lisatakse automaatselt)",
    errFields: "Palun kirjuta küsimus ja sisesta korrektne e-post.",
    errConsent: "Palun kinnita nõusolek.",
    errPhotos: "Lisa vähemalt üks foto.",
    afterMail: (n: number) =>
      `Avasime sinu e-posti programmis valmis kirja. Lisa sellele oma ${n} foto${n === 1 ? "" : "t"} manusena ja vajuta „Saada“. Kui kiri ei avanenud, saada küsimus ja fotod aadressile ${RENTAL_COMPANY.email}.`,
    afterShare: `Valitud rakenduses saada kiri aadressile ${RENTAL_COMPANY.email}.`,
    subject: "Küsimus fotoga",
    mailLines: { head: "KÜSIMUS FOTOGA", what: "Mis see on", q: "Küsimus", email: "Vastuse e-post", name: "Nimi", photos: "Fotosid", attach: "Lisa fotod kirjale manusena." },
    shareTitle: "Küsimus fotoga",
    shareTo: "Saada aadressile",
  },
  en: {
    title: "Ask with a photo",
    subtitle: "Not sure if something can be cleaned? Send a photo and your question and we will reply by email.",
    what: "What is it?",
    whatOpts: ["Upholstered furniture", "Carpet", "Mattress", "Oven", "Window or balcony", "Other"],
    question: "Your question",
    questionPh: "e.g. Can this stain be removed? How old is the carpet and what is it made of?",
    email: "Your email (for our reply)",
    name: "Your name (optional)",
    photos: "Photos",
    photosHint: `Up to ${MAX_PHOTOS} photos. We shrink them for sending and remove location data.`,
    add: "Add photos",
    remove: "Remove photo",
    tooMany: `Up to ${MAX_PHOTOS} photos.`,
    readErr: "Could not read the photo. Try another one (JPG or PNG).",
    consent:
      "I am sending the photos to get advice. I have made sure there are no people or personal data in them (documents, letters, address plates). I agree that Squeaky Clean Teenused OÜ uses the photos and my details only to reply.",
    note: "An answer based on photos is an estimate. The final assessment is made by the cleaner on site. This is not a binding offer or contract. We keep photos and emails only as long as needed to reply and to defend possible claims.",
    mail: "Send by email",
    share: "Share from phone (photos attached automatically)",
    errFields: "Please write your question and enter a valid email.",
    errConsent: "Please confirm your consent.",
    errPhotos: "Add at least one photo.",
    afterMail: (n: number) =>
      `We opened a ready-made email in your mail app. Attach your ${n} photo${n === 1 ? "" : "s"} to it and press “Send”. If it did not open, send your question and photos to ${RENTAL_COMPANY.email}.`,
    afterShare: `In the app you chose, send the message to ${RENTAL_COMPANY.email}.`,
    subject: "Question with a photo",
    mailLines: { head: "QUESTION WITH A PHOTO", what: "What is it", q: "Question", email: "Reply email", name: "Name", photos: "Photos", attach: "Attach the photos to this email." },
    shareTitle: "Question with a photo",
    shareTo: "Send to",
  },
} as const;

export function PhotoQuestion() {
  const { lang } = useLang();
  const c = COPY[lang];
  const [what, setWhat] = useState(0);
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    const probe = new File(["x"], "x.jpg", { type: "image/jpeg" });
    setCanShare(typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [probe] }));
    return () => urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setError("");
    setInfo("");
    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) setError(c.tooMany);
    setBusy(true);
    const added: Photo[] = [];
    for (const f of files.slice(0, Math.max(room, 0))) {
      try {
        const small = await shrink(f);
        const url = URL.createObjectURL(small);
        urlsRef.current.push(url);
        added.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, file: small, url });
      } catch {
        setError(c.readErr);
      }
    }
    setPhotos((p) => [...p, ...added]);
    setBusy(false);
  };

  const removePhoto = (id: string) => {
    setPhotos((p) => {
      const gone = p.find((x) => x.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return p.filter((x) => x.id !== id);
    });
  };

  const validate = () => {
    if (question.trim().length < 5 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return c.errFields;
    if (!photos.length) return c.errPhotos;
    if (!ok) return c.errConsent;
    return "";
  };

  const messageText = () => {
    const m = c.mailLines;
    return [
      m.head,
      "",
      `${m.what}: ${c.whatOpts[what]}`,
      `${m.q}: ${question.trim()}`,
      `${m.email}: ${email.trim()}`,
      `${m.name}: ${name.trim() || "-"}`,
      `${m.photos}: ${photos.length}`,
    ].join("\n");
  };

  const sendMail = () => {
    const err = validate();
    setError(err);
    if (err) return;
    const body = `${messageText()}\n\n${c.mailLines.attach}`;
    setInfo(c.afterMail(photos.length));
    window.location.href = `mailto:${RENTAL_COMPANY.email}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareIt = async () => {
    const err = validate();
    setError(err);
    if (err) return;
    try {
      await navigator.share({
        title: c.shareTitle,
        text: `${c.shareTo}: ${RENTAL_COMPANY.email}\n\n${messageText()}`,
        files: photos.map((p) => p.file),
      });
      setInfo(c.afterShare);
    } catch {
      /* kasutaja katkestas */
    }
  };

  return (
    <section id="kusi-nou" className="scroll-mt-28 border-t border-border py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-2xl font-bold sm:text-3xl">
          {c.title}
        </h2>
        <p className="mt-2 text-muted-foreground">{c.subtitle}</p>

        <div className="surface-card mt-6 space-y-4 p-6">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">{c.what}</span>
            <select
              value={what}
              onChange={(e) => setWhat(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {c.whatOpts.map((o, i) => (
                <option key={o} value={i}>
                  {o}
                </option>
              ))}
            </select>
          </label>

          <div className="text-sm">
            <span className="mb-1 block font-medium">{c.photos}</span>
            <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick} className="hidden" />
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={busy || photos.length >= MAX_PHOTOS}
              onClick={() => inputRef.current?.click()}
            >
              {c.add} ({photos.length}/{MAX_PHOTOS})
            </Button>
            <span className="mt-1 block text-xs text-muted-foreground">{c.photosHint}</span>
            {photos.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-3">
                {photos.map((p) => (
                  <li key={p.id} className="relative">
                    <img src={p.url} alt="" className="size-24 rounded-lg border border-border object-cover" />
                    <button
                      type="button"
                      aria-label={c.remove}
                      onClick={() => removePhoto(p.id)}
                      className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-foreground text-background"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">{c.question}</span>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={1000}
              placeholder={c.questionPh}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">{c.email}</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">{c.name}</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
            </label>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 size-4 accent-primary" />
            <span>{c.consent}</span>
          </label>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="button" size="lg" className="rounded-full px-6" onClick={sendMail}>
              {c.mail}
            </Button>
            {canShare && (
              <Button type="button" size="lg" variant="outline" className="rounded-full px-6" onClick={shareIt}>
                {c.share}
              </Button>
            )}
          </div>
          {info && <p className="rounded-xl border border-border bg-primary-soft/60 p-3 text-sm text-secondary-foreground">{info}</p>}
          <p className="text-xs text-muted-foreground">{c.note}</p>
        </div>
      </div>
    </section>
  );
}
