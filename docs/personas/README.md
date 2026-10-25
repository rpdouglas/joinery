# Personas and roles

The `role` custom claim (`shared/schemas/roles.ts`) is set only by an owner-only Function. Staff at
both locations share data at the role level (ADR 0001 context, stack §1). Details are decided in
ADR 0003; this table is updated in the same PR as any rule change.

| Role | Who | Reads | Writes | Notes |
|---|---|---|---|---|
| `owner` | Business owners | Everything | Everything, incl. roles and restricted documents (staff notes, design fee, budget) | Role changes and exports are audit-logged |
| `designer` | Design staff, both locations | Leads, consultations, designs, schedules | Their working records | Restricted documents per spec |
| `installer` | Install crews | Only Function-written `visits/{id}` documents and their measurements and photos | Measurements and photos on their visits | Pending ADR 0003 |
| `tradePartner` | External trades | No Firestore access | No Firestore access | Task links served by a Function (ADR 0003) |

Each feature spec in `projects/` adds a persona section when it introduces a new screen or record type.
