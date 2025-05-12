# Story 1.1 — Sécurisation initiale du VPS OVH (Debian 12, iptables)

**Status :** Draft  
**Epic :** 1 — Mise en place de l’infrastructure

### Goal & Context

> En tant qu'Administrateur Système, je veux sécuriser un VPS OVH sous Debian 12 en durcissant SSH, en activant un pare-feu **iptables-nft**, en installant fail2ban et unattended-upgrades, afin de disposer d'une base fiable pour mes applications.

### Acceptance Criteria

| ID                    | Critère                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC1**               | SSH par clé, `PasswordAuthentication no`, `PermitRootLogin no`, `ChallengeResponseAuthentication no`.                                                                                  |
| **AC2**               | Pare-feu iptables actif ; politiques : `INPUT DROP`, `FORWARD DROP`, `OUTPUT ACCEPT` ; exceptions : SSH (22 ou personnalisé), HTTP 80, HTTPS 443, ICMP, loopback, connexions établies. |
| **AC3**               | fail2ban installé 1 h de bannissement après 5 tentatives sur `sshd`.                                                                                                                   |
| **AC4**               | Système à jour (`apt full-upgrade`) ; unattended-upgrades activé.                                                                                                                      |
| **AC5** *(optionnel)* | 2FA TOTP pour les comptes admins.                                                                                                                                                      |

### Fichiers concernés

* `/etc/ssh/sshd_config.d/90-security.conf`
* `/etc/ssh/sshd_config.d/95-custom-port.conf` *(si port ≠ 22)*
* `/etc/fail2ban/jail.local`
* `/etc/iptables/rules.v4` et `rules.v6` (créés par **iptables-persistent**) ([Ask Ubuntu][4])
* `/etc/apt/apt.conf.d/20auto-upgrades` / `50unattended-upgrades`

### Tasks / Sub-tasks détaillés

<details>
<summary>Étapes et commandes</summary>

#### 0. Vérifier le backend iptables

```bash
sudo iptables -V
# → "iptables v1.8.x (nf_tables)" = backend nftables
# sinon basculer :
sudo update-alternatives --config iptables     # choisir iptables-nft
```

Debian 12 utilise iptables-nft par défaut ; iptables-legacy est à éviter pour ne pas dupliquer la table de filtres ([Server World][5], [Debian Wiki][1]).

#### 1. Mise à jour système

```bash
sudo apt update && sudo apt full-upgrade -y     # préfère full-upgrade 
```

#### 2. Durcissement SSH

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

`sshd_config.d` est prioritaire sur le fichier principal depuis OpenSSH 8.9+ ([packages.debian.org][6]).

#### 3. Configuration du pare-feu iptables

```bash
# 3.1 Sauvegarde
sudo iptables-save > ~/iptables-backup-$(date +%F).rules

# 3.2 Réinitialisation (facultatif)
sudo iptables -F
sudo iptables -X

# 3.3 Politiques par défaut
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# 3.4 Règles autorisées
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -p icmp -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22  -j ACCEPT   # ou 2222
sudo iptables -A INPUT -p tcp --dport 80  -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 3.5 Persistance
sudo apt install iptables-persistent netfilter-persistent -y   # plugin iptables :contentReference[oaicite:6]{index=6}
sudo netfilter-persistent save                                  # crée /etc/iptables/rules.v[4|6]
sudo systemctl enable netfilter-persistent
sudo iptables -L -v
```

`netfilter-persistent` recharge les règles au démarrage ; en cas d'échec, une console KVM OVH permet de rétablir la connectivité ([Reddit][7]).

#### 4. Installation fail2ban

```bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.{conf,local}
sudo sed -i -e 's/^backend = .*/backend = systemd/' \
            -e 's/^\[sshd\]/[sshd]\nenabled = true/' \
            /etc/fail2ban/jail.local                   # backend systemd Debian12 :contentReference[oaicite:8]{index=8}
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

#### 5. Mises à jour automatiques

```bash
sudo apt install unattended-upgrades apt-listchanges -y    # non installé par défaut 
sudo dpkg-reconfigure --priority=low unattended-upgrades
systemctl list-timers | grep apt
```

#### 6. (Option) 2FA TOTP

```bash
sudo apt install libpam-google-authenticator -y
google-authenticator -t -d -f -r 3 -R 30 -W
echo "auth required pam_google_authenticator.so nullok" | sudo tee -a /etc/pam.d/sshd
sudo sed -i 's/^#*\(KbdInteractiveAuthentication\).*/\1 yes/' \
           /etc/ssh/sshd_config.d/90-security.conf
sudo systemctl restart ssh
```

Voir la doc PAM pour Debian 12 et les bonnes pratiques OTP ([Unix & Linux Stack Exchange][3]).

</details>

### Tests

1. **SSH** : connexion par clé = OK ; tentatives root/mot de passe = KO.
2. **Pare-feu** : `iptables -L -v` n'affiche que les ports 22/80/443 + ICMP + connexions établies.
3. **fail2ban** : après 5 échecs, l'IP apparaît bannie (`fail2ban-client status sshd`).
4. **Mises à jour** : pas de paquets listés par `apt list --upgradable` ; logs dans `/var/log/unattended-upgrades/`.
5. **2FA** : refus sans OTP, succès avec OTP.

### Suivi des étapes

- [x] 0. Vérifier le backend iptables
  - [ ] Confirmer l'utilisation d'iptables-nft

- [x] 1. Mise à jour système
  - [ ] Exécuter `apt update && apt full-upgrade`

- [x] 2. Durcissement SSH
  - [ ] Copier la clé SSH
  - [ ] Configurer les restrictions de sécurité
  - [ ] (Optionnel) Configurer un port SSH personnalisé
  - [ ] Redémarrer le service SSH

- [x] 3. Configuration du pare-feu iptables
  - [ ] Sauvegarder la configuration actuelle
  - [ ] Définir les politiques par défaut
  - [ ] Configurer les règles autorisées
  - [ ] Installer et configurer la persistance
  - [ ] Vérifier la configuration

- [ ] 4. Installation fail2ban
  - [ ] Installer le package
  - [ ] Configurer jail.local
  - [ ] Activer le service
  - [ ] Vérifier le statut

- [ ] 5. Mises à jour automatiques
  - [ ] Installer unattended-upgrades
  - [ ] Configurer unattended-upgrades
  - [ ] Vérifier la programmation des mises à jour

- [ ] 6. (Optionnel) 2FA TOTP
  - [ ] Installer google-authenticator
  - [ ] Configurer l'authentification à deux facteurs
  - [ ] Activer dans la configuration SSH
  - [ ] Tester la connexion avec 2FA

### Risques & mitigations

| Risque                                 | Mesures                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| Conflit nftables/iptables              | Utiliser iptables-nft uniquement ; ne pas installer ufw ou règles nft indépendantes. |
| Blocage réseau après `DROP` par défaut | Tester dans une session SSH parallèle ; conserver la console OVH.                    |
| fail2ban ban local                     | Ajouter votre IP dans `ignoreip` ; surveiller via `systemctl status fail2ban`.       |

---