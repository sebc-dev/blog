# Story 1.1 — Sécurisation initiale du VPS OVH (Debian 12, iptables)

**Status :** Draft
**Epic :** 1 — Mise en place de l’infrastructure

---

### Goal & Context

> En tant qu'Administrateur Système, je veux sécuriser un VPS OVH sous Debian 12 en durcissant SSH, en activant un pare‑feu **iptables‑nft**, en installant fail2ban et unattended‑upgrades, afin de disposer d'une base fiable pour mes applications.

---

### Acceptance Criteria

| ID                    | Critère                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC1**               | Accès SSH par **clé** avec `PasswordAuthentication no`, `PermitRootLogin no`, `ChallengeResponseAuthentication no`.                                                              |
| **AC2**               | Pare‑feu iptables actif ; politiques : `INPUT DROP`, `FORWARD DROP`, `OUTPUT ACCEPT` ; exceptions : SSH (22 ou custom), HTTP 80, HTTPS 443, ICMP, loopback, connexions établies. |
| **AC3**               | fail2ban installé ; bannissement 1 h après 5 tentatives sur `sshd`.                                                                                                              |
| **AC4**               | Système à jour (`apt full-upgrade`) ; unattended‑upgrades activé.                                                                                                                |
| **AC5** *(optionnel)* | **2FA TOTP** pour les comptes admins — combinaison **clé SSH + OTP**, sans mot de passe Unix.                                                                                    |

---

### Fichiers concernés

* `/etc/ssh/sshd_config.d/90-security.conf`
* `/etc/ssh/sshd_config.d/95-custom-port.conf` *(si port ≠ 22)*
* `/etc/ssh/sshd_config.d/40-2fa.conf` *(créé à l’étape 6)*
* `/etc/pam.d/sshd`
* `/etc/fail2ban/jail.local`
* `/etc/iptables/rules.v4` et `rules.v6` (créés par **iptables-persistent**)
* `/etc/apt/apt.conf.d/20auto-upgrades` / `50unattended-upgrades`

---

### Tasks / Sub‑tasks détaillés

<details>
<summary>Étapes et commandes</summary>

#### 0. Vérifier le backend iptables

```bash
sudo iptables -V
# → "iptables v1.8.x (nf_tables)" = backend nftables
# sinon :
sudo update-alternatives --config iptables   # choisir iptables-nft
```

#### 1. Mise à jour système

```bash
sudo apt update && sudo apt full-upgrade -y
```

#### 2. Durcissement SSH (clé uniquement)

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub admin@<IP>

sudo tee /etc/ssh/sshd_config.d/90-security.conf <<'EOF'
PasswordAuthentication no
ChallengeResponseAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
EOF

# (option) port personnalisé
sudo tee /etc/ssh/sshd_config.d/95-custom-port.conf <<'EOF'
Port 2222
EOF

sudo systemctl restart ssh
```

`sshd_config.d` est prioritaire sur le fichier principal depuis OpenSSH 8.9.

#### 3. Configuration du pare‑feu iptables

```bash
# 3.1 Sauvegarde
autosave=~/iptables-backup-$(date +%F).rules
sudo iptables-save > "$autosave"

# 3.2 Politiques par défaut
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# 3.3 Règles autorisées
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -p icmp -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22  -j ACCEPT   # ou 2222
sudo iptables -A INPUT -p tcp --dport 80  -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 3.4 Persistance
sudo apt install iptables-persistent netfilter-persistent -y
sudo netfilter-persistent save
sudo systemctl enable netfilter-persistent
sudo iptables -L -v
```

#### 4. Installation fail2ban

```bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.{conf,local}

sudo sed -i -e 's/^backend = .*/backend = systemd/' \
            -e 's/^[# ]*\[sshd\]/[sshd]\nenabled = true/' \
            -e 's/^maxretry = .*/maxretry = 5/' \
            -e 's/^bantime  = .*/bantime = 1h/' \
            /etc/fail2ban/jail.local

sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

#### 5. Mises à jour automatiques

```bash
sudo apt install unattended-upgrades apt-listchanges -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
systemctl list-timers --all | grep apt
```

#### 6. (Option) **2FA TOTP — clé SSH + OTP, sans mot de passe**

```bash
# 6.0 Installer le module PAM
sudo apt install libpam-google-authenticator -y

# 6.1 Initialiser le jeton TOTP pour chaque compte admin
google-authenticator -t -d -f -r 3 -R 30 -W
```

##### 6.2 Configurer PAM (`/etc/pam.d/sshd`)

```pam
#%PAM-1.0
# --- 2FA : Google Authenticator ---------------------------------
auth    sufficient    pam_google_authenticator.so
auth    requisite     pam_deny.so
# -----------------------------------------------------------------
@include common-account
@include common-session
@include common-session-noninteractive
```

##### 6.3 Fragment sshd pour exiger clé **et** OTP

```bash
sudo tee /etc/ssh/sshd_config.d/40-2fa.conf <<'EOF'
AuthenticationMethods publickey,keyboard-interactive:pam
KbdInteractiveAuthentication yes
PasswordAuthentication no
UsePAM yes
EOF

sudo systemctl restart ssh
```

##### 6.4 Vérification

```bash
sshd -T | grep -E 'authenticationmethods|kbdinteractiveauthentication|usepam'
# authenticationmethods publickey,keyboard-interactive:pam
# kbdinteractiveauthentication yes
# usepam yes
```

</details>

---

### Tests

1. **SSH** : connexion par clé = OK ; tentatives root/mot de passe = KO.
2. **Pare‑feu** : `iptables -L -v` n'affiche que les ports 22/80/443 + ICMP + connexions établies.
3. **fail2ban** : après 5 échecs, l’IP est bannie (`fail2ban-client status sshd`).
4. **Mises à jour** : pas de paquets listés par `apt list --upgradable` ; logs dans `/var/log/unattended-upgrades/`.
5. **2FA** : sans OTP ⇒ rejet ; clé + OTP ⇒ succès, **sans** prompt mot de passe.

---

### Suivi des étapes

* [x] 0\. Vérifier le backend iptables

  * [x] Confirmer l'utilisation d'iptables-nft
* [x] 1\. Mise à jour système

  * [x] Exécuter `apt update && apt full-upgrade`
* [x] 2\. Durcissement SSH

  * [x] Copier la clé SSH
  * [x] Configurer les restrictions de sécurité
  * [x] (Optionnel) Configurer un port SSH personnalisé
  * [x] Redémarrer le service SSH
* [x] 3\. Configuration du pare‑feu iptables

  * [x] Sauvegarder la configuration actuelle
  * [x] Définir les politiques par défaut
  * [x] Configurer les règles autorisées
  * [x] Installer et configurer la persistance
  * [x] Vérifier la configuration
* [x] 4\. Installation fail2ban

  * [x] Installer le package
  * [x] Configurer jail.local
  * [x] Activer le service
  * [x] Vérifier le statut
* [x] 5\. Mises à jour automatiques

  * [x] Installer unattended-upgrades
  * [x] Configurer unattended-upgrades
  * [x] Vérifier la programmation des mises à jour
* [x] 6\. (Option) 2FA TOTP

  * [x] Installer google-authenticator
  * [x] Configurer l'authentification à deux facteurs
  * [x] Activer dans la configuration SSH
  * [x] Tester la connexion avec 2FA

---

### Risques & mitigations

| Risque                                 | Mesures                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| Conflit nftables/iptables              | Utiliser iptables-nft uniquement ; ne pas installer UFW ou règles nftables parallèles. |
| Blocage réseau après `DROP` par défaut | Tester dans une session SSH parallèle ; conserver la console OVH (KVM/VNC).            |
| Bannissement fail2ban local            | Ajouter votre IP dans `ignoreip` ; surveiller via `systemctl status fail2ban`.         |
| Verrouillage 2FA (perte du jeton)      | Garder les codes de secours ou un 2ᵉ appareil TOTP ; disposer d’un accès console OVH.  |
