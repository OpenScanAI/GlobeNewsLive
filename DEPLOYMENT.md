# 🚀 Deployment Guide

Complete guide to deploy XDC World Feed on your own server.

## Prerequisites

- Ubuntu 20.04+ or similar Linux server
- Node.js 18+ (via nvm recommended)
- nginx
- Domain name pointed to your server

## Step 1: Install Node.js

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install 20
nvm use 20
```

## Step 2: Install PM2

```bash
npm install -g pm2
```

## Step 3: Clone & Install

```bash
# Create directory
mkdir -p /var/www
cd /var/www

# Clone (or copy files)
git clone https://github.com/your-username/xdc-world-feed.git
cd xdc-world-feed

# Install dependencies
npm install

# Build for production
npm run build
```

## Step 4: Start with PM2

```bash
# Start the app
pm2 start npm --name "xdc-world-feed" -- start

# Verify it's running
pm2 status
pm2 logs xdc-world-feed

# Save PM2 config (auto-restart on reboot)
pm2 save
pm2 startup
```

## Step 5: Configure nginx

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/feed.xdc.network
```

Paste this configuration:

```nginx
server {
    server_name feed.xdc.network;

    # ACME challenge for SSL
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3400;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    listen 80;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/feed.xdc.network /etc/nginx/sites-enabled/
sudo nginx -t
sudo nginx -s reload
```

## Step 6: SSL with Certbot

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --webroot -w /var/www/html -d feed.xdc.network
```

Update nginx config to use SSL:

```nginx
server {
    server_name feed.xdc.network;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3400;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/feed.xdc.network/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/feed.xdc.network/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name feed.xdc.network;
    return 301 https://$host$request_uri;
}
```

Reload nginx:

```bash
sudo nginx -t
sudo nginx -s reload
```

## Step 7: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs xdc-world-feed --lines 20

# Test HTTPS
curl -I https://feed.xdc.network
```

## Maintenance

### Update the Application

```bash
cd /var/www/xdc-world-feed
git pull
npm install
npm run build
pm2 restart xdc-world-feed
```

### View Logs

```bash
pm2 logs xdc-world-feed
pm2 logs xdc-world-feed --lines 100
```

### Restart

```bash
pm2 restart xdc-world-feed
```

### Stop

```bash
pm2 stop xdc-world-feed
```

### Monitor

```bash
pm2 monit
```

## Troubleshooting

### Port already in use

```bash
# Check what's using port 3400
lsof -i :3400

# Kill if needed
kill -9 <PID>
```

### nginx errors

```bash
# Test config
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log
```

### PM2 not starting on reboot

```bash
pm2 startup
# Run the command it outputs
pm2 save
```

### SSL certificate renewal

Certbot auto-renews, but you can test:

```bash
sudo certbot renew --dry-run
```

## Security Recommendations

1. **Firewall**: Only allow ports 22, 80, 443
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **SSH**: Disable password auth, use keys only

3. **Updates**: Keep system updated
   ```bash
   sudo apt update && sudo apt upgrade
   ```

4. **Fail2ban**: Install to prevent brute force
   ```bash
   sudo apt install fail2ban
   ```

## Performance Optimization

### Enable gzip in nginx

Add to nginx config inside `server` block:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### Increase Node.js memory (if needed)

```bash
pm2 delete xdc-world-feed
NODE_OPTIONS="--max-old-space-size=1024" pm2 start npm --name "xdc-world-feed" -- start
pm2 save
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `pm2 status` | Check app status |
| `pm2 logs xdc-world-feed` | View logs |
| `pm2 restart xdc-world-feed` | Restart app |
| `pm2 stop xdc-world-feed` | Stop app |
| `pm2 monit` | Real-time monitoring |
| `nginx -t` | Test nginx config |
| `nginx -s reload` | Reload nginx |

---

**Your dashboard is now live!** 🎉

Visit https://feed.xdc.network to see it in action.
