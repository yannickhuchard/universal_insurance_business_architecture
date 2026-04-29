# Universal Insurance Architecture Data Model

This document serves as the single source of truth for the Enterprise Architecture Capability Map data model. 
All schema evolutions must be recorded here to ensure alignment between the SQLite backend and the TypeScript frontend.

## 1. Capabilities Entity (Version 1.0)

The core entity representing a business capability within the enterprise architecture.

### 1.1 Relational Schema (SQLite)
Table Name: `capabilities`

| Column | Type | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Auto | `PRIMARY KEY` | Unique identifier for the capability |
| `l1` | `TEXT` | - | `NOT NULL` | Level 1 Domain (e.g., "Core Insurance", "Corporate Support") |
| `l2` | `TEXT` | - | `NOT NULL` | Level 2 Grouping (e.g., "Policy Administration") |
| `l3` | `TEXT` | - | `NOT NULL` | Level 3 Specific Capability Name (e.g., "Policy Issuance") |
| `desc` | `TEXT` | - | - | Detailed description of the capability's function |
| `isStrategic` | `BOOLEAN` | `0` (false) | `0` or `1` | Flag indicating if this is a high-priority capability |
| `state` | `TEXT` | `'as-is'` | - | Architectural state. Enums: `'as-is'`, `'to-be'` |
| `coverage` | `INTEGER` | `0` | - | Organizational adoption score (0-100) |
| `security` | `INTEGER` | `0` | - | Security compliance score (0-100) |
| `privacy` | `INTEGER` | `0` | - | Data privacy risk score (0-100) |
| `debt` | `INTEGER` | `0` | - | Technical debt accumulation score (0-100) |
| `risk` | `INTEGER` | `0` | - | Operational risk score (0-100) |
| `techStack` | `TEXT` | - | - | JSON serialized string array of technologies (e.g., `["React", "Node"]`) |
| `applications` | `TEXT` | - | - | JSON serialized string array of mapping applications (e.g., `["Guidewire"]`) |

### 1.2 TypeScript Definition (Frontend)
Located in `src/App.tsx` and related components.

```typescript
type Capability = {
  id?: number;              // Database assigned ID
  l1: string;               // Level 1 Domain
  l2: string;               // Level 2 Group
  l3: string;               // Level 3 Capability
  desc: string;             // Description
  scores: {                 // Grouped scores (0-100 scale)
    coverage: number;
    security: number;
    privacy: number;
    debt: number;
    risk: number;
  };
  techStack?: string[];     // Array of underlying tech
  applications?: string[];  // Array of applications delivering the capability
  isStrategic?: boolean;    // Strategic indicator
  state?: string;           // "as-is" or "to-be"
};
```

## Evolution Log

*   **v1.0 (2026-04-29)**: Initial migration from static `capabilities.json` to local SQLite relational structure. Added `state` to support As-Is/To-Be roadmap modeling.
*   **v1.1 (2026-04-29)**: Data normalization of L1 domains. Transitioned from legacy Product Segments to 15 Canonical Capabilities: Actuarial & Capital Management, Claims Management, Core Insurance Operations, Customer Management & Experience, Data & Analytics, Distribution & Channel Management, Enterprise Risk & Compliance, Finance & Accounting, Information Technology Management, Marketing & Sales, New Business & Underwriting, Operations & Corporate Services, Policy Administration, Product Management, Reinsurance.
