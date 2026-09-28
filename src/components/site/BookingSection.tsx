import React, { useState } from "react";

export function BookingSection() {
  const [clientType, setClientType] = useState("eraisik");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [regCode, setRegCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [rooms, setRooms] = useState("");
  const [hasBathroom, setHasBathroom] = useState(true);
  const [bathroomDeepClean, setBathroomDeepClean] = useState(false);
  
  const [allergies, setAllergies] = useState("");
  const [details, setDetails] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [showCancellationForm, setShowCancellationForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("Palun kinnitage, et olete tingimustega tutvunud ja nõustute nendega.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <section className="py-12 px-4 max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 my-8 text-left">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Squeaky Clean Teenused OÜ</h2>
        <p className="text-sm text-gray-600 mt-1">
          Reg. kood: 16288747 | Tartu ja Põlva ning lähiümbrus[cite: 2]
        </p>
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg font-semibold space-y-1">
          <p>• Squeaky Clean Teenused OÜ ei ole käibemaksukohuslane – hinnale käibemaksu ei lisandu[cite: 2].</p>
          <p>• Arveldamine toimub pangaülekandega, sularahamakseid ei aktsepteerita[cite: 2].</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center">
          <h3 className="text-lg font-bold mb-2">Päring on edukalt esitatud!</h3>
          <p className="text-sm">Täname! Vaatame andmed üle ja saadame teile kinnituse või võtame ühendust.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PUNKT 1: Kliendi tüüp ja andmed */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">1. Kliendi andmed ja arve saaja</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kas tellite eraisikuna või ettevõttena?</label>
              <select 
                value={clientType} 
                onChange={(e) => setClientType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="eraisik">Eraisik</option>
                <option value="ettevote">Ettevõte</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teie nimi:</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon:</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-post:</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
            </div>

            {clientType === "ettevote" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ettevõtte nimi:</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Registrikood:</label>
                  <input type="text" required value={regCode} onChange={(e) => setRegCode(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
                </div>
              </div>
            )}
          </div>

          {/* PUNKT 2: Objekti ja koristuse info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">2. Objekti andmed ja koristuse maht</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Objekti täpne aadress:</label>
                <input type="text" required placeholder="nt Soola tn 5, Tartu" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Soovitud kuupäev ja kellaaeg:</label>
                <input type="text" required placeholder="nt 05.10.2026 kell 15:00" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mitu tuba / ruumid:</label>
                <input type="text" required placeholder="nt elutuba, magamistuba" value={rooms} onChange={(e) => setRooms(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
              </div>
              <div className="flex flex-col justify-end space-y-2 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={hasBathroom} onChange={(e) => setHasBathroom(e.target.checked)} className="h-4 w-4" />
                  Vannituba / WC koristus
                </label>
                {hasBathroom && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pl-6">
                    <input type="checkbox" checked={bathroomDeepClean} onChange={(e) => setBathroomDeepClean(e.target.checked)} className="h-4 w-4" />
                    Soovin vannitoa süvapuhastust / katlakivi eemaldust
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lisasoovid ja täpsustused:</label>
              <textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" placeholder="Kirjutage siia täiendavad soovid..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kas elanikel esineb allergiat või tundlikkust vahendite suhtes?</label>
              <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" placeholder="Ei / Jah (täpsustage)" />
            </div>
          </div>

          {/* PUNKT 3: Juriidilised tingimused ja tarbija õigused */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-bold text-sm">Olulised tingimused ja teenuseosutamise reeglid:</p>
            <p>• <strong>Õigus keelduda / hinda korrigeerida:</strong> Teenuseosutajal on õigus hinda kohapeal korrigeerida või tööst keelduda, kui elamispind või mustuse aste erineb oluliselt kirjeldatust (nt ehitustolm, tugev erakorraline mustus)[cite: 2].</p>
            <p>• <strong>Tööde sisu ja tühistamine:</strong> Klient kinnitab, et mõistab tellitava teenuse sisu ja mahtu. Tasuta tühistamine kuni 24h enne töö algust, hilisemal tühistamisel kehtib miinimumtasu 30 €[cite: 2].</p>
            <p>• <strong>Tarbija taganemisõigus:</strong> Eraisikust kliendil on õigus 14 päeva jooksul lepingust taganeda[cite: 2]. Taganemiseks võib esitada vabas vormis avalduse või kasutada allpool leitavat tüüpvormi[cite: 1, 2]. Teenuse osutamisel enne 14 päeva möödumist nõustub klient ooteaja lühendamisega ja teenuse täielikul osutamisel taganemisõigus kaob[cite: 2].</p>
            
            {/* Taganemisavalduse tüüpvormi nupp / vaade */}
            <div className="pt-2">
              <button 
                type="button" 
                onClick={() => setShowCancellationForm(!showCancellationForm)}
                className="text-blue-700 underline font-semibold focus:outline-none"
              >
                {showCancellationForm ? "Peida taganemisavalduse tüüpvorm" : "Vaata taganemisavalduse tüüpvormi (infovorm)"}
              </button>

              {showCancellationForm && (
                <div className="mt-3 p-3 bg-white border border-amber-300 rounded text-gray-800 space-y-2 text-left">
                  <p className="font-bold">Sidevahendi abil sõlmitud lepingust taganemise tüüpvorm</p>
                  <p className="text-[11px] text-gray-600">Kellele: Squeaky Clean Teenused OÜ, Reg. kood: 16288747, E-post: squeakycleanteenused@gmail.com[cite: 1]</p>
                  <p className="text-[11px]">Käesolevaga taganen lepingust, mille esemeks on hoolduskoristus[cite: 1]. Vormi kasutamine ei ole kohustuslik, sobib ka vabas vormis ühemõtteline avaldus e-posti teel[cite: 1, 2].</p>
                </div>
              )}
            </div>
          </div>

          {/* PUNKT 4: Kinnitus ja esitamine */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                required 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                Kinnitan, et olen tutvunud ja nõustun teenuseosutamise tingimustega, saan täielikult aru teenuse sisust ning mõistan, et sularahas arveldamist ei toimu[cite: 2]. Olen teadlik oma õigustest ja taganemisinfost.
              </span>
            </label>
          </div>

          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-lg transition duration-200 shadow-md"
          >
            Esita hinnapäring / broneering
          </button>
        </form>
      )}
    </section>
  );
}
