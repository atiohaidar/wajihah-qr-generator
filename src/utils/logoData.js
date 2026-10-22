export const LOGO_MAP = {
  "al-fath": { relPath: "/LOGO WAJIHAH/AL-FATH.png", name: "AL-FATH" },
  "alfath": { relPath: "/LOGO WAJIHAH/AL-FATH.png", name: "AL-FATH" },
  "al-fath-logo": { relPath: "/LOGO WAJIHAH/al-fath-logo.png", name: "al-fath-logo" },
  "al-fath-notext": { relPath: "/LOGO WAJIHAH/al-fath-logo.png", name: "al-fath-logo" },
  "alfath-notext": { relPath: "/LOGO WAJIHAH/al-fath-logo.png", name: "al-fath-logo" },
  "badan-mentoring": { relPath: "/LOGO WAJIHAH/Badan Mentoring.png", name: "Badan Mentoring" },
  "mentoring": { relPath: "/LOGO WAJIHAH/Badan Mentoring.png", name: "Badan Mentoring" },
  "badanmentoring": { relPath: "/LOGO WAJIHAH/Badan Mentoring.png", name: "Badan Mentoring" },
  "dkmsu": { relPath: "/LOGO WAJIHAH/DKMSU.png", name: "DKMSU" },
  "ilmy": { relPath: "/LOGO WAJIHAH/ILMY.png", name: "ILMY" },
  "lazissu": { relPath: "/LOGO WAJIHAH/Lazissu.png", name: "Lazissu" },
  "mq": { relPath: "/LOGO WAJIHAH/MQ.png", name: "MQ" },
  "prisma": { relPath: "/LOGO WAJIHAH/PRISMA.png", name: "PRISMA" },
  "feb": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FEB.png", name: "FEB" },
  "fif": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FIF.png", name: "FIF" },
  "fik": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FIK.png", name: "FIK" },
  "fit": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FIT.png", name: "FIT" },
  "fkb": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FKB.png", name: "FKB" },
  "fri": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FRI.png", name: "FRI" },
  "fte": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FTE.png", name: "FTE" },
  "al-fath-fakultas/feb": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FEB.png", name: "FEB" },
  "al-fath-fakultas/fif": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FIF.png", name: "FIF" },
  "al-fath-fakultas/fik": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FIK.png", name: "FIK" },
  "al-fath-fakultas/fit": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FIT.png", name: "FIT" },
  "al-fath-fakultas/fkb": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FKB.png", name: "FKB" },
  "al-fath-fakultas/fri": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FRI.png", name: "FRI" },
  "al-fath-fakultas/fte": { relPath: "/LOGO WAJIHAH/Al-Fath Fakultas/FTE.png", name: "FTE" },
};

export function resolveLogo(logoNameOrPath) {
  if (!logoNameOrPath) return null;
  const clean = String(logoNameOrPath).trim().toLowerCase();
  if (LOGO_MAP[clean]) {
    return { dataUri: LOGO_MAP[clean].relPath, relPath: LOGO_MAP[clean].relPath, name: LOGO_MAP[clean].name };
  }
  const key = clean.split('/').pop().replace('.png', '').replace(/\s+/g, '-');
  if (LOGO_MAP[key]) {
    return { dataUri: LOGO_MAP[key].relPath, relPath: LOGO_MAP[key].relPath, name: LOGO_MAP[key].name };
  }
  for (const [k, v] of Object.entries(LOGO_MAP)) {
    if (clean.includes(k) || k.includes(clean)) {
      return { dataUri: v.relPath, relPath: v.relPath, name: v.name };
    }
  }
  if (clean.startsWith('http') || clean.startsWith('data:') || clean.startsWith('/')) {
    return { dataUri: logoNameOrPath, relPath: logoNameOrPath, name: 'custom' };
  }
  return null;
}
