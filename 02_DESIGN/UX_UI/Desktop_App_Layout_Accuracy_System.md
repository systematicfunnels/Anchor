# 🖥 Desktop App Layout Accuracy System 

## Design + Development Contract 

### (Project Intelligence Workspace) 

! `https://img02.mockplus.com/image/2024-08-09/3763d420-5601-11ef-aec5-e56592e51743.png`  

! `https://uicookies.com/wp-content/uploads/2019/05/gentelella.jpg`  

! `https://cdn.prod.website-files.com/65130e79c72ae8812db3412e/656fc5bb7f636858878ec9e3_grids-35.jpeg`  

--- 

## 0. Purpose of This Document (Read This First) 

This document defines **non-negotiable layout laws** for the desktop application. 

It exists to: 

* Prevent layout drift 
* Align design and development 
* Eliminate subjective interpretation 
* Ensure long-term consistency 
* Enable predictable, professional UX 

If design and development disagree, **this document wins**. 

--- 

## 1. Product UI Class (Locked) 

This product is a: 

> **Desktop, workspace-based, evidence-driven application** 

It is **NOT**: 

* Page-based 
* Mobile-first 
* Card-first 
* Dashboard-only 
* Decorative 

The UI behaves like an **IDE-class workbench**, not a website. 

--- 

## 2. Global Layout Grid (Non-Negotiable) 

### Grid System 

| Property          | Value       | 
| ----------------- | ----------- | 
| Grid Type         | 12-column   | 
| Base Unit         | 8px         | 
| Max Content Width | 1440–1600px | 
| Page Padding      | 24–32px     | 
| Column Gutter     | 24px        | 

### Rules 

* All layout alignment snaps to grid 
* No arbitrary widths 
* No percentage-based guessing 
* Grid applies to **all screens and views** 

--- 

## 3. Canonical App Shell (Fixed) 

This shell **never changes**. 

``` 
┌────────────────────────────────────────────────────┐ 
│ Top Bar (Global Context & Actions)                 │ 56–64px 
├───────────────┬────────────────────────────────────┤ 
│ Left Panel    │ Primary Workspace View             │ 
│ (Explorer)    │ (Document / Table / Graph)         │ 
│ 240–280px     │                                    │ 
│               │                                    │ 
└───────────────┴────────────────────────────────────┘ 
``` 

### Shell Rules 

* Top bar: sticky, never scrolls 
* Left panel: fixed width, independent scroll 
* Center area: **only scroll container** 
* No nested scroll regions 

--- 

## 4. Spacing System (Token-Only) 

### Allowed Spacing Tokens 

``` 
space-1 = 8px 
space-2 = 16px 
space-3 = 24px 
space-4 = 32px 
space-6 = 48px 
``` 

### Usage Rules 

| Context           | Token             | 
| ----------------- | ----------------- | 
| Inside components | space-2           | 
| Between sections  | space-3 / space-4 | 
| Page boundaries   | space-4 / space-6 | 

🚫 No custom margins 
🚫 No inline spacing 
🚫 No visual tweaking per screen 

--- 

## 5. Alignment Rules (Strict) 

### Text & Content 

* Left-aligned always 
* Never center paragraphs, lists, or tables 

### Exceptions (Right-aligned only) 

* Numeric values 
* Version numbers 
* Action columns in tables 

Centered enterprise UI is considered **incorrect**. 

--- 

## 6. Primary View Categories (Allowed) 

Only these **view types** are allowed in the main workspace: 

1. Document View (long-form, markdown) 
2. Table View (structured data) 
3. Graph / Relationship View 
4. Comparison / Diff View 
5. Timeline / Audit View 
6. Dashboard Summary View (read-only) 

New view types **require formal approval**. 

--- 

## 7. Tables (Critical Surface) 

### Table Specifications 

| Property      | Value     | 
| ------------- | --------- | 
| Header Height | 48–56px   | 
| Row Height    | 44–48px   | 
| Cell Padding  | 16px      | 
| Sticky Header | Mandatory | 
| Layout        | Fixed     | 

### Table Rules 

* Horizontal scroll > wrapping 
* First column fixed (identity) 
* Action column always last 
* No variable row heights 

Tables are **evidence surfaces**, not flexible layouts. 

--- 

## 8. Forms & Configuration Views 

### Layout Rules 

* Single column only 
* Max width: 720px 
* Labels above inputs 
* Sections separated visually 
* Actions pinned bottom-right 

``` 
[ Section Title ] 
----------------- 
Label 
[ Input Field ] 

Label 
[ Dropdown ] 

                    [ Cancel ] [ Save ] 
``` 

If users scroll to find **Save**, the layout is invalid. 

--- 

## 9. Component Bounding Boxes 

| Component | Height  | Padding | Notes           | 
 | --------- | ------- | ------- | --------------- | 
 | Button    | 32–36px | 12–16px | Compact allowed | 
 | Input     | 36–40px | 12px    | Minimal radius  | 
 | Card      | Auto    | 16–24px | Flat preferred  | 

Flat UI > decorative elevation. 

--- 

## 10. Interaction Density (Desktop-First) 

### Required 

* Hover states 
* Tooltips for truncated content 
* Context menus (right-click) 

### Avoid 

* Mobile gestures 
* Swipe patterns 
* Heavy animations 
* Motion-first UI 

Mouse-first, precision-first. 

--- 

## 11. Responsiveness Policy (Honest) 

| Width       | Behavior                  | 
 | ----------- | ------------------------- | 
 | ≥1440px     | Full layout               | 
 | 1024–1439px | Condensed sidebar         | 
 | <1024px     | Limited support / warning | 

This is an enterprise desktop tool. 
Mobile parity is **not a goal**. 

--- 

## 12. Layout Accuracy Audit (Mandatory) 

### Audit Prompt 

> You are my desktop layout auditor. 
 > Review layout accuracy for: **[screen/view name]** 

### Checklist 

* Grid respected? 
* Sidebar width correct? 
* Spacing tokens only? 
* Alignment correct? 
* Single scroll container? 
* Table rules respected? 

### Output Format 

| Area | Issue | Severity | 
 | ---- | ----- | -------- | 

--- 

## 13. Design ↔ Dev Enforcement Rules 

### Design 

* Designs must declare: 

   * View category 
   * Grid usage 
   * Spacing tokens 
 * No “visual-only” decisions 

### Development 

* CSS Grid for shell 
* Flexbox for components 
* No inline styles 
* Tokens only 
* Fixed table layouts 

Mismatch = bug. 

--- 

## 14. Absolute Non-Negotiable Law 

If a layout change is requested that violates this system, it must be rejected or the system must be formally updated first. 
