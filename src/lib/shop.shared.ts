/* E-poe abifunktsioonid, mida kasutavad nii leht kui ka server. */
export const euro = (cents: number) =>
  `${(cents / 100).toLocaleString("et-EE", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })} €`;

export const DIGITAL_CONSENT_TEXT =
  "Nõustun, et digitaalne sisu tehakse mulle kättesaadavaks kohe pärast makset, ja olen teadlik, et sellega kaotan 14-päevase taganemisõiguse.";
