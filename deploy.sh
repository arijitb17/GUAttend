# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Rebuild
npm run build

# Restart all services
pm2 restart all
pm2 save

# Wait a bit
sleep 5

# Check status
pm2 status

# Test the app
curl http://localhost:3000
curl http://localhost:8000/health