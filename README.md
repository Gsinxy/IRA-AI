# IRA AI — Academic Intelligence Platform

> **Democratizing advanced academic intelligence for every learner.**

IRA AI is a premium, concept-first educational companion designed to bridge the opportunity gap for students in rural and semi-urban areas. Founded by **Gaurav Naik**, an Economics student at **Government Autonomous College, Sundargarh (Odisha, India)**, IRA AI delivers highly tailored, rigorous academic guidance. Instead of simply generating fast copy-paste answers, it guides students through deep concept breakdowns, logical derivations, real-world analogies, and personalized study aids.

The application is structured as a robust, production-grade **Full-Stack React + Vite + Node/Express** architecture, complete with interactive dual-duplex WebSockets powered by the **Gemini Live API**.

---

## 🎨 Design Philosophy & User Experience

The application is built on a custom **Luxury Academic & Apple-Inspired Minimalist** design language, emphasizing deep intellectual focus and pristine text density.

- **Dual-Mode Sophistication**: Clean, high-contrast off-white sheets (**Ivory Warmth**) paired with a distraction-free charcoal dark canvas (**Cosmic Slate**) with generous negative space.
- **Fluid Animation Dynamics**: Handcrafted transitions and layout animations via `motion/react` to convey high-fidelity premium feedback.
- **Claude-inspired Workspace**: A focus-driven central editor and layout separating chat streams from interactive educational materials.
- **Touch-Optimized Responsive Layout**: Adapts gracefully to all screen sizes, supporting both mobile browsers and desktop study stations with intuitive drawer-based secondary menus.

---

## 🚀 Key Features

### 1. Concept-First Tutorial Logic
IRA AI uses an elite academic prompting cascade. It explains concepts step-by-step, builds custom mathematical models, derives formulas, and structures historical context rather than facilitating cheating.

### 2. Live Voice Assistant (Founder Beta)
An advanced, dual-duplex voice pipeline powered by the **Gemini Live API** via standard WebSockets. Students can speak naturally, interrupt the assistant mid-sentence, and receive human-speed auditory feedback (currently in preview for administrative accounts).

### 3. Integrated Academic Profiles
Custom profile builders allow users to specify their university, active major (e.g., Economics, Computer Science, Literature), and specific coursework, tuning responses to their precise academic perspective.

### 4. Admin / Founder Dashboard
An executive system diagnostic center containing:
- **Interactive Voice Audits**: Live mic-to-speaker diagnostics executing complete speech-to-text, prompt-reasoning, and ElevenLabs text-to-speech syntheses.
- **Provider Health Checks**: Real-time checking of API configurations, models, and latency metrics.
- **Database System Logs**: Thorough audit records detailing model attempts, success/failover logs, and response snippet statistics.

---

## 🛠️ Technical Architecture

```
├── server.ts               # Express Backend & WebSockets server (Vite middleware in Dev)
├── src/
│   ├── App.tsx             # Main React entry point & routing coordinator
│   ├── main.tsx            # Vite client bootstrap
│   ├── index.css           # Global Tailwind CSS 4.0 configuration & Google Web Fonts
│   ├── types.ts            # Core TypeScript interfaces & types
│   ├── db-store.ts         # High-speed JSON database & audit log engine
│   └── components/         # Modular React components
│       ├── LandingPage.tsx        # High-fidelity Startup-style Homepage
│       ├── ChatArea.tsx           # Advanced interactive drafting workspace
│       ├── LiveVoiceScreen.tsx    # Immersive WebSocket voice assistant interface
│       ├── Sidebar.tsx            # Context & study file navigation panel
│       ├── FounderDashboard.tsx   # Premium system analytics and diagnostics
│       ├── VoiceAuditPanel.tsx    # Live pipeline voice diagnostic tests
│       ├── AuthCard.tsx           # User authentication module
│       ├── PricingPlans.tsx       # Student plans catalog
│       └── ProfileModal.tsx       # Academic profile configuration
├── tsconfig.json           # Type configurations for Node & React
├── vite.config.ts          # Vite engine bundler settings
├── package.json            # Scripts & dependencies
└── .env.example            # Environment variables blueprint
```

### Tech Stack Breakdown
- **Client**: React 19, Vite, Tailwind CSS v4.0, motion, Lucide Icons.
- **Server**: Express.js, Node.js, `ws` (WebSocket server for Gemini Live stream).
- **Bundler & Compiler**: Built with `vite` for client-side assets and `esbuild` to compile `server.ts` into a fast, compiled, single-file CommonJS module (`dist/server.cjs`) to prevent ES Module path resolution errors on production runtimes.

---

## 🔑 Environment Variables Setup

Configure these keys inside your hosting dashboard or your local `.env` file (copied from `.env.example`). Do **not** prefix keys with `VITE_` unless they are safe to be exposed to the browser. All key operations are safely handled on the Express backend server (`server.ts`).

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | **Yes** | Powers the core educational cascade and the Live Voice WebSocket stream. |
| `OPENROUTER_API_KEY` | Optional | Serves as high-speed fallback provider (DeepSeek, Claude, Llama). |
| `ELEVENLABS_API_KEY` | Optional | Powers custom text-to-speech voice generation inside diagnostic panels. |
| `TAVILY_API_KEY` | Optional | Powers live search grounding for research academic modes. |
| `APP_URL` | Optional | Auto-detected for WebSockets; override this with your live URL in production. |

---

## 🖥️ Local Installation & Development

Follow these steps to run the complete workspace locally.

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd ira-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Configuration
Copy the sample environment file and insert your API credentials:
```bash
cp .env.example .env
```
*Edit `.env` to supply your `GEMINI_API_KEY`.*

### 4. Boot Up Development Server
```bash
npm run dev
```
The server will start on [http://localhost:3000](http://localhost:3000). The development server uses `tsx` to run the TypeScript Express backend directly, mounting Vite as a middleware for live Hot Module Replacement (HMR).

---

## 📦 Production Build & Deployment

To prepare this full-stack application for GitHub deployment and hosting platforms like **Cloud Run**, **Heroku**, **Render**, or **Railway**:

### 1. Build the production package
```bash
npm run build
```
This single command executes a dual compilation pipeline:
1. Compiles and minifies the React frontend code into the static folder (`dist/`).
2. Compiles the custom TypeScript backend (`server.ts`) into a single standalone CommonJS file located at `dist/server.cjs` via `esbuild`.

### 2. Run the compiled server
```bash
npm run start
```
This executes `node dist/server.cjs`, launching the optimized production Express server on port `3000`, serving the static client-side React code and opening the secure WebSocket gateways.

---

## 🎓 About the Gaurav Naik Initiative
IRA AI is built to demonstrate how technology can level the playing field for students worldwide. Named in tribute to the spark of intellectual exploration, **IRA AI** stands as a beacon for educational equity, academic rigor, and the persistent pursuit of knowledge across all geographical and socioeconomic borders.
