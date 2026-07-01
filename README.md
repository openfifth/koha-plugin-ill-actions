# ILL Actions — Koha Plugin

**Maintainer:** Open Fifth &nbsp;·&nbsp; **Version:** 2.9.0 &nbsp;·&nbsp; **Minimum Koha:** 25.05.00.000

Workflow enhancements for the Koha ILL module. All features are individually toggleable.

---

## Features

- **Quick Add Patron** — modal on ILL request forms to register a patron without leaving the page
- **Auto-fill from DOI / PubMed ID** — populates ILL form fields from a DOI or PubMed ID lookup; staff and OPAC independently configurable
- **New Request for User** — table and manage-page buttons to open a pre-filled new request for a patron
- **Default Library to User's Library** — pre-selects the logged-in staff member's home library on new request forms
- **Filter Requests to Staff Member's Library** — filters the ILL requests table to the staff user's library on load
- **Show New ILL Requests on Main Page** — pending request count on the Koha staff main page
- **Improved Staff Form Styling** — consistent input sizing and borders aligned with Koha's Vue component style ([bug 36285](https://bugs.koha-community.org/bugzilla3/show_bug.cgi?id=36285))
- **Unauthenticated Custom Fields** — configurable custom fields on ILL forms for unauthenticated users (staff and OPAC); supports dropdowns via authorised value categories and patron attribute mapping

---

## Requirements

| | |
|---|---|
| Koha | ≥ 25.05.00.000 |
| [Bug 35331](https://bugs.koha-community.org/bugzilla3/show_bug.cgi?id=35331) | ILL table actions hook |
| [Bug 26297](https://bugs.koha-community.org/bugzilla3/show_bug.cgi?id=26297) | Patron attribute form API |

---

## Installation

1. Download the `.kpz` release from the [releases page](../../releases).
2. **Administration → Plugins → Upload plugin**, upload the `.kpz` file, click **Install**.
3. **Administration → Plugins → ILL Actions → Configure** — enable what you need.

---

## Maintainer

[Open Fifth](https://openfifth.co.uk)
