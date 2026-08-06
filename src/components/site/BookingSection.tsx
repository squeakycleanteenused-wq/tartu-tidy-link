import { useState } from "react";
import { format } from "date-fns";
import { et as etLocale, enUS } from "date-fns/locale";
import { CalendarIcon, Send, Clock, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { submitBooking } from "@/lib/booking.functions";
import { sendBookingEmails } from "@/lib/emailjs";

const slotsForDay = (d: Date) => {
  const weekday = d.getDay();
  if (weekday === 0) return [];
  const base = [
    { time: "08:00 – 12:00", region: "Tartu" },
    { time: "12:00 – 17:00", region: "Tartu" },
    { time: "09:00 – 13:00", region: "Põlva" },
  ];
  if (weekday === 6) return base.slice(0, 1);
  if (weekday % 2 === 0) return base.slice(0, 2);
  return base;
};

export function BookingSection() {
  const { t, lang } = useLang();
  const locale = lang === "et" ? etLocale : enUS;

  const [date, setDate] = useState<Date | undefined>();
  const [service, setService] = useState("");
  const [clientType, setClientType] = useState("person");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [billing, setBilling] = useState("");
  const [object, setObject] = useState("");
  const [same, setSame] = useState(true);
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");
  const [extra, setExtra] = useState("");
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState<null | {
    name: string;
    email: string;
    service: string;
    date: string;
    time: string;
    city: string;
    address: string;
  }>(null);

  const slots = date ? slotsForDay(date) : [];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const objectAddress = same ? billing : object;
    if (
      !service ||
      name.trim().length < 2 ||
      code.trim().length < 4 ||
      billing.trim().length < 4 ||
      objectAddress.trim().length < 4 ||
      !city ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ||
      phone.trim().length < 5 ||
      !date ||
      !time ||
      !c1 ||
      !c2
    ) {
      toast.error(t.booking.required);
      return;
    }
    setSending(true);
    try {
      const payload = {
        service,
        clientType: clientType === "person" ? t.booking.person : t.booking.companyType,
        name: name.trim(),
        code: code.trim(),
        billingAddress: billing.trim(),
        objectAddress: objectAddress.trim(),
        city,
        email: email.trim(),
        phone: phone.trim(),
        date: format(date, "yyyy-MM-dd"),
        time,
        extra: extra.trim(),
        consentTerms: c1,
        consentWithdrawal: c2,
      };

      // Frontend-only email delivery via EmailJS.
      await sendBookingEmails(payload);

      // Best-effort backup copy in the database; never blocks the booking.
      await submitBooking({ data: { ...payload, lang } }).catch((err) =>
        console.warn("[booking] database backup skipped", err),
      );
      toast.success(t.booking.success);
      setConfirmed({
        name: name.trim(),
        email: email.trim(),
        service,
        date: format(date, "PPP", { locale }),
        time,
        city,
        address: objectAddress.trim(),
      });
      setC1(false);
      setC2(false);
      setExtra("");
    } catch {
      toast.error(t.booking.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section id="kalender" className="scroll-mt-28 border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.calendar.title}</h2>
          <p className="mt-2 text-muted-foreground">{t.calendar.subtitle}</p>
          <div className="mt-8 grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
            <div className="surface-card p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={locale}
                disabled={{ before: new Date() }}
                className={cn("pointer-events-auto p-3")}
              />
            </div>
            <div className="surface-card p-6">
              <h3 className="text-base font-bold">{t.calendar.free}</h3>
              {!date && <p className="mt-3 text-sm text-muted-foreground">{t.calendar.select}</p>}
              {date && slots.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">{t.calendar.none}</p>
              )}
              <ul className="mt-4 space-y-2">
                {slots.map((s) => (
                  <li
                    key={s.time + s.region}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      <Clock className="size-4 shrink-0 text-primary" />
                      {s.time}
                      <span className="text-muted-foreground">· {s.region}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 rounded-full"
                      onClick={() => {
                        setTime(s.time.startsWith("08") || s.time.startsWith("09") ? t.booking.morning : t.booking.afternoon);
                        toast.success(t.calendar.chosen);
                        document.getElementById("broneerimine")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {t.calendar.choose}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="broneerimine" className="scroll-mt-28 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.booking.title}</h2>
          <p className="mt-2 text-muted-foreground">{t.booking.subtitle}</p>

          <form onSubmit={onSubmit} className="surface-card mt-8 space-y-6 p-6 sm:p-8">
            <div className="grid gap-2">
              <Label>{t.booking.service}</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue placeholder={t.booking.servicePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {t.booking.serviceOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t.booking.clientType}</Label>
              <RadioGroup value={clientType} onValueChange={setClientType} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="person" id="ct-person" />
                  <Label htmlFor="ct-person" className="font-normal">
                    {t.booking.person}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="company" id="ct-company" />
                  <Label htmlFor="ct-company" className="font-normal">
                    {t.booking.companyType}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">{t.booking.name}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">{t.booking.code}</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={40} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t.booking.email}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t.booking.phone}</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billing">{t.booking.billingAddress}</Label>
              <Input id="billing" value={billing} onChange={(e) => setBilling(e.target.value)} maxLength={200} />
            </div>

            <div className="grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="object">{t.booking.objectAddress}</Label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={same} onCheckedChange={(v) => setSame(v === true)} />
                  {t.booking.sameAddress}
                </label>
              </div>
              <Input
                id="object"
                value={same ? billing : object}
                disabled={same}
                onChange={(e) => setObject(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>{t.booking.city}</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.booking.city} />
                  </SelectTrigger>
                  <SelectContent>
                    {t.booking.cityOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t.booking.date}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("justify-start font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="size-4" />
                      {date ? format(date, "PPP", { locale }) : t.booking.pickDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={locale}
                      disabled={{ before: new Date() }}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>{t.booking.time}</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.booking.time} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={t.booking.morning}>{t.booking.morning}</SelectItem>
                    <SelectItem value={t.booking.afternoon}>{t.booking.afternoon}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="extra">{t.booking.extra}</Label>
              <Textarea
                id="extra"
                rows={4}
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder={t.booking.extraPlaceholder}
                maxLength={2000}
              />
            </div>

            <div className="space-y-3 rounded-xl bg-secondary/70 p-4">
              <label className="flex gap-3 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={c1}
                  onCheckedChange={(v) => setC1(v === true)}
                />
                <span>
                  {t.booking.consent1}{" "}
                  <Link to="/tingimused" className="text-primary underline">
                    {t.terms.link}
                  </Link>
                </span>
              </label>
              <label className="flex gap-3 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={c2}
                  onCheckedChange={(v) => setC2(v === true)}
                />
                <span>{t.booking.consent2}</span>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full rounded-full" disabled={sending}>
              <Send className="size-4" />
              {t.booking.submit}
            </Button>
          </form>
        </div>
      </section>

      <Dialog open={confirmed !== null} onOpenChange={(o) => !o && setConfirmed(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-primary-soft text-primary">
                <Check className="size-5" />
              </span>
              {t.booking.confirmTitle}
            </DialogTitle>
            <DialogDescription>
              {t.booking.confirmText
                .replace("{name}", confirmed?.name ?? "")
                .replace("{email}", confirmed?.email ?? "")}
            </DialogDescription>
          </DialogHeader>
          {confirmed && (
            <div className="rounded-xl bg-secondary/70 p-4 text-sm">
              <p className="font-semibold">{t.booking.confirmSummary}</p>
              <dl className="mt-3 space-y-1.5">
                {[
                  [t.booking.service, confirmed.service],
                  [t.booking.date, confirmed.date],
                  [t.booking.time, confirmed.time],
                  [t.booking.city, confirmed.city],
                  [t.booking.objectAddress, confirmed.address],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-wrap justify-between gap-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full rounded-full" onClick={() => setConfirmed(null)}>
              {t.booking.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}