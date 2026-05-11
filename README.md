# ☁️ CloudVault — Guide de démarrage
## Stack : Firebase Auth + Firestore · Cloudinary Storage (100% gratuit, sans carte)

---

## 🚀 Installation en 5 étapes

### Étape 1 — Installe les dépendances
```bash
npm install
```

---

### Étape 2 — Configure Firebase (Auth + Firestore seulement)
1. Va sur https://console.firebase.google.com
2. Ouvre ton projet **ClaudVault**
3. **Paramètres** → ton application Web → copie la config
4. Ouvre `src/firebase.js` et remplis :
```js
const firebaseConfig = {
  apiKey: "ta_clé",
  authDomain: "claudvault-6ebbb.firebaseapp.com",
  projectId: "claudvault-6ebbb",
  messagingSenderId: "1001431478842",
  appId: "1:1001431478842:web:cee73dc32a1bd56c5efb03"
}
// ⚠️ Pas besoin de storageBucket — on utilise Cloudinary !
```

---

### Étape 3 — Active Authentication Google
1. Menu gauche → **Sécurité** → **Authentication** → **Commencer**
2. Onglet **"Sign-in method"** → **Google** → Active → Enregistrer

---

### Étape 4 — Active Firestore
1. Menu gauche → **Bases de données** → **Firestore Database** → **Créer**
2. Mode **production** → région **europe-west1** → **Activer**
3. Onglet **Règles** → colle le contenu de `FIREBASE_RULES.txt` → **Publier**

---

### Étape 5 — Configure Cloudinary (25 Go gratuit, sans carte)
1. Va sur https://cloudinary.com → **Sign Up Free**
2. Note ton **Cloud name** dans le Dashboard (ex: `dxyz1234`)
3. **Settings** → **Upload** → **Add upload preset**
   - Signing mode : **Unsigned** ← important !
   - Nom : `cloudvault_preset`
   - Sauvegarde
4. Dans `src/firebase.js`, remplis :
```js
export const CLOUDINARY_CLOUD_NAME = "dxyz1234"
export const CLOUDINARY_UPLOAD_PRESET = "cloudvault_preset"
```

---

### Lance l'app
```bash
npm run dev
```
→ http://localhost:5173 🎉

---

## 💾 Limites gratuites
| Service       | Gratuit                     | Carte requise |
|---------------|-----------------------------|--------------|
| Cloudinary    | 25 Go stockage              | ❌ Non       |
| Firebase Auth | Illimité                    | ❌ Non       |
| Firestore     | 1 Go + 50k lectures/jour    | ❌ Non       |
