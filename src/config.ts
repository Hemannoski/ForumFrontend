// Adresse de l'API PHP (sans "/" final).
// Sur téléphone, "localhost" ne fonctionne pas : utilise l'adresse IP de ton PC sur le réseau Wi-Fi.
// Tu peux la changer ici ou dans un fichier .env (voir .env.example).
export const API_URL: string = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.10/FORUM/api/index.php'
).replace(/\/+$/, '');
