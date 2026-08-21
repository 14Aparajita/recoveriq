# RecoverIQ – Agentic Failed-Payment Recovery

## 🎯 Problem
Most payment retry systems ignore *why* a payment failed, wasting attempts on unrecoverable declines.

## 💡 Solution
RecoverIQ classifies decline reasons, uses an LLM agent with a bandit policy to choose the best recovery action, and executes it via Razorpay Test Mode – with a full audit trail.

## 🏗️ Architecture
[Insert your architecture diagram here]

## 🛠️ Tech Stack
- Backend: FastAPI, SQLAlchemy, MySQL
- Frontend: React, Vite, Tailwind CSS
- AI: OpenAI GPT-4o-mini, Bandit Policy
- Payments: Razorpay Test Mode

## 📊 Evaluation
[Insert your evaluation results table]

## 🚀 Quick Start
[Your setup commands]

## 🔐 Security
- Test Mode keys only
- No PII stored
- Audit trail for all decisions

## 📝 License
MIT