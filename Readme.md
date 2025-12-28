# GUAttend - Smart Attendance System

![GUAttend Logo](public/logo.png)

## 🎓 Overview

**GUAttend** is an intelligent, AI-powered face recognition attendance system designed specifically for the Department of Information Technology at Gauhati University. This system leverages modern computer vision technology to automate attendance tracking, eliminating the need for manual roll calls and reducing proxy attendance.

**Live Application**: [https://guattend.duckdns.org/](https://guattend.duckdns.org/)

### Key Features

- 🎯 **Real-time Face Recognition** - Accurate facial detection and recognition using advanced AI models
- 📊 **Automated Attendance Tracking** - Seamless attendance marking with timestamp and location data
- 👥 **Student & Faculty Management** - Comprehensive user registration and profile management
- 📈 **Analytics Dashboard** - Visual insights into attendance patterns and statistics
- 🔐 **Secure Authentication** - Role-based access control for students, faculty, and administrators
- 📱 **Responsive Design** - Works seamlessly across desktop, tablet, and mobile devices
- 🚀 **Cloud Deployed** - Hosted on AWS EC2 for high availability and scalability

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Reusable component library
- **React Hook Form** - Form state management

#### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Production database
- **Python FastAPI** - Face recognition service

#### AI/ML
- **OpenCV** - Computer vision library
- **dlib** - Face detection and recognition
- **FaceNet** - Deep learning face embeddings (128d)
- **NumPy** - Numerical computations
- **Pickle** - Model serialization

#### Infrastructure
- **AWS EC2** - Application hosting
- **DuckDNS** - Dynamic DNS service
- **PM2** - Process management
- **Nginx** - Reverse proxy (recommended)

---

## 📁 Project Structure

```
GUAttend/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   ├── (auth)/              # Authentication pages
│   ├── dashboard/           # Main dashboard
│   └── attendance/          # Attendance management
├── components/              
│   └── ui/                  # Reusable UI components
├── lib/                     # Utility functions
├── prisma/                  # Database schema and migrations
│   └── schema.prisma        # Prisma schema definition
├── public/                  # Static assets
│   ├── logo.png
│   └── bg.jpg
├── scripts/                 # Utility scripts
├── dataset/                 # Face image datasets
├── output/                  # Generated outputs
├── test-images/             # Test images for verification
├── main.py                  # Face recognition Python service
├── camera.py                # Camera handling module
├── requirements.txt         # Python dependencies
├── face_embeddings.pkl      # Trained face embeddings
├── training_visualization.png
├── deploy.sh                # Deployment script
├── package.json             # Node.js dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.8+
- **PostgreSQL** 14+
- **Git**
- **Webcam** (for face capture)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/arijitb17/GUAttend.git
cd GUAttend
```

#### 2. Install Node.js Dependencies

```bash
npm install
# or
yarn install
```

#### 3. Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 4. Set Up Database

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/guattend"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
```

Run Prisma migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

#### 5. Seed Initial Data (Optional)

```bash
npx prisma db seed
```

---

## 🎯 Running the Application

### Development Mode

#### Start the Next.js Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

#### Start the Python Face Recognition Service

```bash
python main.py
```

The face recognition API will run on `http://localhost:5000`

### Production Mode

#### Build the Application

```bash
npm run build
npm start
```

---

## 🖼️ Face Recognition System

### How It Works

The face recognition system uses a multi-stage pipeline:

1. **Face Detection** - Detects faces in the camera feed using Haar Cascades or HOG
2. **Face Alignment** - Normalizes face orientation for better recognition
3. **Feature Extraction** - Extracts 128-dimensional face embeddings using FaceNet
4. **Face Matching** - Compares embeddings with stored faces using cosine similarity
5. **Attendance Marking** - Records attendance with timestamp and confidence score

### Training New Faces

1. Navigate to the registration page
2. Upload multiple clear images of the student (recommended: 20-30 images)
3. System processes images and generates face embeddings
4. Embeddings are stored in `face_embeddings.pkl`
5. Student can now be recognized during attendance

### Model Details

- **Algorithm**: FaceNet (128d embeddings)
- **Recognition Threshold**: 0.6 (configurable)
- **Processing Speed**: ~30 FPS on modern hardware
- **Accuracy**: 95%+ under good lighting conditions

---

## 📊 Features in Detail

### For Students

- Register with email and student ID
- Capture face images for training
- Mark attendance via face recognition
- View attendance history and statistics
- Download attendance reports

### For Faculty

- Create and manage classes
- Start attendance sessions
- View real-time attendance status
- Generate attendance reports
- Export data to CSV/Excel

### For Administrators

- User management (students & faculty)
- System configuration
- Database management
- Analytics and insights
- Audit logs

---

## 🔒 Security Features

- **Password Hashing** - Bcrypt for secure password storage
- **JWT Authentication** - Secure session management
- **Role-Based Access Control** - Separate permissions for users
- **HTTPS Enabled** - SSL/TLS encryption on production
- **Rate Limiting** - Protection against brute force attacks
- **SQL Injection Prevention** - Parameterized queries via Prisma

---

## 🌐 Deployment on AWS EC2

### EC2 Instance Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install python3 python3-pip python3-venv

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2
```

### Application Deployment

```bash
# Clone repository
git clone https://github.com/arijitb17/GUAttend.git
cd GUAttend

# Install dependencies
npm install
pip install -r requirements.txt

# Build application
npm run build

# Set up environment variables
nano .env

# Start with PM2
pm2 start npm --name "guattend-web" -- start
pm2 start main.py --name "guattend-ml" --interpreter python3

# Save PM2 configuration
pm2 save
pm2 startup
```

### Configure DuckDNS

1. Register at [DuckDNS](https://www.duckdns.org/)
2. Create subdomain: `guattend.duckdns.org`
3. Set up automatic IP update with cron:

```bash
# Create update script
echo "echo url=\"https://www.duckdns.org/update?domains=guattend&token=YOUR_TOKEN&ip=\" | curl -k -o ~/duckdns/duck.log -K -" > ~/duckdns/duck.sh
chmod 700 ~/duckdns/duck.sh

# Add to crontab
crontab -e
# Add line: */5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

### Optional: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name guattend.duckdns.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/face {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Python tests
pytest
```

### Test Face Recognition

```bash
# Test with sample images
python camera.py --test --image test-images/sample1.jpg
```

---

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Attendance Endpoints

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/report` - Generate report

### Face Recognition Endpoints

- `POST /api/face/train` - Train new face model
- `POST /api/face/recognize` - Recognize face from image

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Face recognition not working
- **Solution**: Ensure good lighting and face is clearly visible. Check camera permissions.

**Issue**: Database connection errors
- **Solution**: Verify DATABASE_URL in `.env` file and PostgreSQL service is running.

**Issue**: Python dependencies installation fails
- **Solution**: Try upgrading pip: `pip install --upgrade pip` and install dependencies individually.

**Issue**: Port 3000 already in use
- **Solution**: Change port in `package.json` or kill the process using the port.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

**Developer**: [Arijit Banik](https://github.com/arijitb17)

**Institution**: Department of Information Technology, Gauhati University

---

## 📞 Support

For issues and questions:
- 🐛 [GitHub Issues](https://github.com/arijitb17/GUAttend/issues)
- 📧 Email: support@guattend.edu
- 🌐 Website: [https://guattend.duckdns.org/](https://guattend.duckdns.org/)

---

## 🙏 Acknowledgments

- Gauhati University Department of Information Technology
- OpenCV and dlib communities
- Next.js and Vercel teams
- All contributors and testers

---

## 📈 Roadmap

### Current Version (v1.0)
- ✅ Basic face recognition
- ✅ Attendance marking
- ✅ User management
- ✅ Dashboard and reports

### Future Enhancements (v2.0)
- [ ] Mobile application (React Native)
- [ ] Multi-camera support
- [ ] Advanced analytics with ML insights
- [ ] Integration with university ERP
- [ ] SMS/Email notifications
- [ ] Biometric fallback (fingerprint)
- [ ] Offline mode support

---

## 📚 References

- [FaceNet Paper](https://arxiv.org/abs/1503.03832)
- [OpenCV Documentation](https://docs.opencv.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Made with ❤️ at Gauhati University**
