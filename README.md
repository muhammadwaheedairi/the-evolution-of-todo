# The Evolution of Todo

> **A Journey from Console to Cloud-Native AI**

*Hackathon II: Mastering Spec-Driven Development & Cloud Native AI*

---

## 🌟 The Story

This repository documents the complete evolution of a todo application, progressing through five distinct stages—from a simple Python console script to a production-grade, AI-powered, cloud-native distributed system.

**Each phase represents a real-world progression in software development:**
```
Console Script → Web Application → AI Chatbot → Kubernetes → Cloud Production
```

---

## 📖 Evolution Stages

| Stage | Description | Status | Live Demo |
|-------|-------------|--------|-----------|
| **[Phase 1: Console](./phase-1-console/)** | In-memory Python CLI | ✅ Complete | - |
| **[Phase 2: Full-Stack](./phase-2-fullstack/)** | Multi-user web app | ✅ Complete | [View →](https://your-deployment-url.vercel.app) |
| **[Phase 3: AI Chatbot](./phase-3-ai-chatbot/)** | Natural language interface | 📋 Planned | TBD |
| **[Phase 4: Kubernetes](./phase-4-kubernetes/)** | Containerized deployment | 📋 Planned | Local (Minikube) |
| **[Phase 5: Cloud Native](./phase-5-cloud/)** | Event-driven production | 📋 Planned | Azure/GCP |

---

## 🎯 Project Highlights

### **✅ Completed (Phase 1 & 2)**

- ✅ **Phase 1**: Console todo app with in-memory storage
- ✅ **Phase 2**: Full-stack web application
  - Next.js 16 frontend with responsive UI
  - FastAPI backend with RESTful APIs
  - Custom JWT authentication
  - PostgreSQL database (Neon)
  - Deployed on Vercel + Railway

### **🚧 In Progress (Phase 3-5)**

- 📋 AI-powered chatbot with natural language
- 📋 Kubernetes deployment
- 📋 Cloud-native production system

---

## 🏗️ Architecture Evolution

### Phase 1: Console App
```
┌─────────────┐
│   Python    │
│   Script    │
└─────────────┘
     ↓
 In-Memory
```

### Phase 2: Web Application
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Next.js  │────▶│ FastAPI  │────▶│  Neon    │
│ Frontend │     │ Backend  │     │  DB      │
└──────────┘     └──────────┘     └──────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, SQLModel |
| **Database** | Neon PostgreSQL |
| **Authentication** | Custom JWT + bcrypt |
| **Deployment** | Vercel, Railway |
| **Development** | Claude Code (Spec-Driven) |

---

## 🚀 Quick Start

### Phase 1: Console App
```bash
cd phase-1-console
python src/main.py
```

### Phase 2: Web Application
```bash
cd phase-2-fullstack

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**See individual phase README files for detailed setup.**

---

## 📚 Documentation

- **[Phase 1 README](./phase-1-console/README.md)** - Console app setup
- **[Phase 2 README](./phase-2-fullstack/README.md)** - Web app setup
- **[Specifications](./specs/)** - Feature specs & technical plans
- **[AGENTS.md](./AGENTS.md)** - AI agent instructions

---

## 🎓 Development Approach

This project follows **Spec-Driven Development (SDD)**:

1. **Specify** - Write clear requirements
2. **Plan** - Design technical approach
3. **Task** - Break into actionable items
4. **Implement** - Build with Claude Code

All phases are built using this methodology with zero manual coding.

---

## 🏆 Hackathon Information

**Event**: Hackathon II - Spec-Driven Development  
**Organization**: GIAIC / PIAIC / Panaversity  
**Timeline**: December 2025 - January 2026  
**Participant**: Muhammad Waheed (GIAIC ID: 00081685)

---

## 📊 Project Status

- **Total Phases**: 5
- **Completed**: 2/5 (40%)
- **In Progress**: Phase 3
- **Lines of Code**: ~3,000+
- **Deployment**: 2 live applications

---

## 📹 Demo Videos

- [Phase 1: Console App](https://youtube.com/watch?v=...) *(coming soon)*
- [Phase 2: Web Application](https://youtube.com/watch?v=...) *(coming soon)*

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

---

## 🤝 Acknowledgments

- **Claude Code** - AI-powered development assistant
- **GIAIC/PIAIC** - Educational organization
- **Panaversity** - Cloud-native AI initiative

---

## 📞 Contact

**Muhammad Waheed**
- GitHub: [@muhammadwaheedairi](https://github.com/muhammadwaheedairi)
- Email: wm0297567@gmail.com
- WhatsApp: 03180297567

---

<div align="center">

**⭐ Star this repo if you found it helpful! ⭐**

*Built with 💙 using Spec-Driven Development*

</div>