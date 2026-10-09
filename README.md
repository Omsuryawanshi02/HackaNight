# 🏗️ AI-Powered Construction Milestone Verifier

**Multi-Stage Construction Milestone Verification with Vision-Language Model (VLM) Audit & Anomaly Detection**

An AI-assisted construction auditing platform that helps project managers verify milestone evidence, analyze construction site photos, identify discrepancies in invoices and material records, and flag potential anomalies for human review.

Powered by **Qwen2.5-VL-7B-Instruct**, computer vision, and rule-based auditing, the platform combines visual observations with project and financial records to make construction progress reviews more transparent and traceable.

---

## 🚨 Problem Statement

Construction projects involve multiple contractors, milestones, invoices, material deliveries, and progress reports. Verifying these records manually can be time-consuming and error-prone.

Potential issues include:

- Progress claims that are not adequately supported by site photographs.
- Repeated or previously submitted construction images.
- Differences between claimed material quantities and delivery records.
- Invoice amounts that exceed approved budgets.
- Delays in milestone completion compared with planned schedules.
- Limited traceability between reported progress and supporting evidence.

Traditional manual verification can make it difficult to identify these inconsistencies early.

## 💡 Our Solution

We are building an AI-assisted construction audit platform that combines vision-language AI, computer vision, and deterministic validation rules to support construction milestone verification.

Users can upload construction photographs, enter milestone details, and provide relevant invoices or material records. The system analyzes the evidence and generates explainable findings for human review.

### Key Features

- **📸 AI-Powered Photo Analysis:** Uses Qwen2.5-VL-7B-Instruct to describe visible construction activities and identify potential evidence gaps.
- **🏗️ Milestone Evidence Review:** Compares visible observations with the description and acceptance criteria of a construction milestone.
- **🔁 Duplicate Photo Detection:** Uses image hashing to identify exact or visually similar photographs submitted multiple times.
- **🧾 Invoice Reconciliation:** Compares claimed invoice amounts with approved budgets and recorded expenses.
- **📦 Material Quantity Verification:** Compares claimed material quantities with available delivery records and flags discrepancies.
- **📅 Schedule Deviation Detection:** Identifies differences between planned and reported milestone dates.
- **⚠️ Anomaly Flagging:** Combines independent findings to highlight cases requiring further investigation.
- **📊 Audit Dashboard:** Presents findings, supporting evidence, discrepancies, and recommended follow-up actions.
- **📄 Audit Reporting:** Designed to support exportable audit summaries for project managers and reviewers.

> **Important:** The platform identifies inconsistencies and evidence gaps; it does not automatically establish fraud, certify structural safety, or authorize payments.

---

## 🧠 AI Model

### Qwen2.5-VL-7B-Instruct

We use Qwen2.5-VL-7B-Instruct, an open-weight vision-language model capable of processing images and text together.

**Model:** [Qwen2.5-VL-7B-Instruct on Hugging Face](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)

The model helps the system:

- Describe visible construction activities.
- Answer questions about submitted site photographs.
- Identify potentially relevant visual evidence.
- Highlight missing information or limitations.
- Generate structured observations for the audit interface.

The model's output is treated as an observation, not a verified fact. Exact financial calculations, quantity comparisons, and date checks are handled separately by deterministic backend logic.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Vision-Language Model | Qwen2.5-VL-7B-Instruct |
| Model Hosting | Hugging Face Inference Endpoint or compatible inference provider |
| Image Processing | Pillow, OpenCV |
| Duplicate Image Detection | Perceptual hashing |
| Data Processing | Pandas |
| API Communication | REST API, JSON |
| Configuration | Environment variables |
| Data Storage | SQLite or Supabase (planned/optional) |

*Update the table to reflect the components actually implemented in your final version.*

---

## 🏛️ System Architecture

```text
                  ┌────────────────────────┐
                  │    React Frontend      │
                  │ Uploads & Audit Panel  │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │     FastAPI Backend     │
                  │ Validation & Workflow  │
                  └───────────┬────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
      ┌──────────────────┐       ┌──────────────────┐
      │ Qwen2.5-VL-7B    │       │ Python Audit     │
      │ Image Analysis   │       │ Rules & Checks   │
      └─────────┬────────┘       └─────────┬────────┘
                │                          │
                └────────────┬─────────────┘
                             ▼
                  ┌────────────────────────┐
                  │ Findings & Audit Report│
                  │ Human Review Required  │
                  └────────────────────────┘
```

---

## 🔄 How It Works

1. **Create a project:** Enter the project name, milestone description, planned dates, and relevant budget information.
2. **Upload evidence:** Submit construction site photographs and the relevant milestone details.
3. **Analyze photographs:** The VLM produces observations about visible work and evidence limitations.
4. **Check for repeated images:** Image hashing compares new photographs with previously submitted images.
5. **Validate project records:** Backend rules compare claimed quantities, invoice values, delivery records, and planned dates.
6. **Combine findings:** The system organizes visual observations and record discrepancies into an audit summary.
7. **Review the results:** A project manager examines the evidence and decides whether further documentation or physical inspection is necessary.

---

## 🧪 Example Use Case

Consider a construction milestone in which a subcontractor reports using **500 cement bags**, while the available delivery records show **350 bags**.

The system may identify the following:

| Check | Example finding |
|---|---|
| Photo analysis | A concrete slab is visible, but the full work area is not shown |
| Material reconciliation | 150-bag discrepancy between the claim and available delivery records |
| Evidence review | Additional photographs and supporting documents may be required |
| Recommended action | Reconcile delivery records and request additional evidence before approving the claim |

The discrepancy is a signal for investigation, not proof that materials were stolen. Delivery records may be incomplete, or materials may have arrived through another documented source.

---

## 📂 Project Structure

```text
construction-milestone-verifier/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py
│   ├── audit/
│   │   ├── photo_analysis.py
│   │   ├── duplicate_detection.py
│   │   ├── invoice_validation.py
│   │   └── schedule_validation.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── data/
│   └── sample_records/
│
├── docs/
│   └── architecture.md
│
├── .gitignore
└── README.md
```

*This is a suggested structure. Remove folders or files that do not exist in your repository.*

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Python 3.10 or later, compatible with your selected dependencies.
- Node.js and npm.
- Git.
- A Hugging Face account or another supported model-inference provider.
- A deployed Qwen2.5-VL-7B-Instruct endpoint that supports image inputs.

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd construction-milestone-verifier
```

Replace the repository URL with your actual public GitHub repository.

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

On Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file inside the backend directory:

```env
HF_TOKEN=your_huggingface_token
HF_ENDPOINT_URL=https://your-endpoint-url/v1
HF_MODEL=Qwen/Qwen2.5-VL-7B-Instruct
```

The endpoint URL and model identifier must match the interface and configuration of your deployed inference service.

**Security:** Never commit `.env` or expose your Hugging Face token in frontend code.

### 4. Run the backend

```bash
uvicorn main:app --reload
```

The API should be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

### 6. Test the application

- Open the frontend.
- Select a valid construction site photograph.
- Enter the milestone description.
- Run the photo audit.
- Review the returned observations and evidence gaps.

Invoice reconciliation, duplicate detection, and schedule checks must also be implemented and connected before those features will work end-to-end.

---

## 🔐 Security and Responsible AI

Construction audits can affect financial decisions. The application should therefore:

- Keep API credentials on the backend.
- Validate uploaded files and enforce file-size limits.
- Avoid exposing private project records or site images publicly.
- Store only the information needed for the audit.
- Link each finding to the relevant source record or uploaded photograph.
- Distinguish model observations from deterministic calculation results.
- Communicate uncertainty and evidence limitations.
- Require human review before financial or contractual decisions.
- Avoid presenting AI-generated findings as proof of fraud or structural defects.

## 🚧 Current Limitations

- A single photograph cannot reliably establish the exact percentage of milestone completion.
- Ordinary site photographs cannot confirm hidden structural quality or precise quantities of concrete and other materials.
- Similar images may be legitimate progress
