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
| **[Phase 2: Full-Stack](./phase-2-fullstack/)** | Multi-user web app | ✅ Complete | [View →](https://the-evolution-of-todo-sandy.vercel.app/) |
| **[Phase 3: AI Chatbot](./phase-3-ai-chatbot/)** | AI-powered task management | ✅ Complete | [View →](https://the-evolution-of-todo-dun.vercel.app/) |
| **[Phase 4: Kubernetes](./phase-4-kubernetes/)** | Containerized deployment | 📋 Planned | Local (Minikube) |
| **[Phase 5: Cloud Native](./phase-5-cloud/)** | Event-driven production | 📋 Planned | Azure/GCP |

---

## 🎯 Project Highlights

### **✅ Completed Phases (1, 2, 3)**

- ✅ **Phase 1**: Console todo app with in-memory storage
- ✅ **Phase 2**: Full-stack web application with JWT auth, PostgreSQL, deployed on Vercel
- ✅ **Phase 3**: AI-powered chatbot with OpenAI Agents SDK, MCP tools, and natural language interface

### **📋 Upcoming Phases (4, 5)**

- 📋 **Phase 4**: Kubernetes containerized deployment
- 📋 **Phase 5**: Cloud-native production system with event-driven architecture

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

### Phase 3: AI Chatbot
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ ChatKit  │────▶│ FastAPI  │────▶│ OpenAI   │────▶│  Neon    │
│   UI     │     │   Chat   │     │  Agent   │     │  DB      │
│          │     │ Endpoint │     │ + MCP    │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.13, SQLModel |
| **Database** | Neon PostgreSQL (Serverless) |
| **Authentication** | Custom JWT + Argon2 |
| **AI/ML** | OpenAI Agents SDK, MCP Protocol, ChatKit |
| **Deployment** | Vercel, Railway, Hugging Face |
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

### Phase 3: AI Chatbot
```bash
cd phase-3-ai-chatbot

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -e .
alembic upgrade head
uvicorn src.main:app --reload
```

**See individual phase README files for detailed setup.**

---

## 📚 Documentation

### Phase READMEs
- **[Phase 1 README](./phase-1-console/README.md)** - Console app setup
- **[Phase 2 README](./phase-2-fullstack/README.md)** - Web app setup
- **[Phase 3 README](./phase-3-ai-chatbot/README.md)** - AI chatbot setup

### Specifications & Plans
- **[Phase 1 Specs](./phase-1-console/specs/todo-app/)** - Console app specifications
- **[Phase 2 Specs](./phase-2-fullstack/specs/001-task-crud-auth/)** - Full-stack web app specifications
- **[Phase 3 Specs](./phase-3-ai-chatbot/specs/)** - AI chatbot specifications (3 features)

### Architecture Decisions
- **[Phase 3 ADRs](./phase-3-ai-chatbot/history/adr/)** - Architecture Decision Records

---

## 🎓 Development Approach

This project follows **Spec-Driven Development (SDD)** using Claude Code:

1. **Specify** → 2. **Plan** → 3. **Task** → 4. **Implement**

All phases built with AI-assisted development and zero manual coding.

---

## 🏆 Hackathon Information

**Event**: Hackathon II - Spec-Driven Development  
**Organization**: GIAIC / PIAIC / Panaversity  
**Timeline**: December 2025 - January 2026  
**Participant**: Muhammad Waheed (GIAIC ID: 00081685)

---

## 📊 Project Status

- **Total Phases**: 5
- **Completed**: 3/5 (60%)
- **Next Up**: Phase 4 (Kubernetes)
- **Lines of Code**: ~5,000+
- **Live Deployments**: Phase 2 & Phase 3 on Vercel
- **AI Features**: 5 MCP tools, conversational interface, stateless agent

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