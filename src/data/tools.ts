export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolSeoGuide {
  intro: string;
  howToUse: string[];
  useCases: { title: string; detail: string }[];
  faqs: ToolFaq[];
}

export interface ConverterToolConfig {
  slug: string;
  navLabel: string;
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  placeholder: string;
  sampleData: string;
  aiHint: string;
  exportFilename: string;
  seoGuide: ToolSeoGuide;
}

export const MAX_INPUT_CHARS = 6000;

export const CONVERTER_TOOLS: ConverterToolConfig[] = [
  {
    slug: '/',
    navLabel: 'Universal',
    title: 'Universal Messy Text to Excel & CSV Converter',
    subtitle: 'Paste chaotic notes, mixed lists, or raw logs and turn them into a structured spreadsheet.',
    metaTitle: 'CleanSheet AI — Universal Messy Text to Excel & CSV Converter',
    metaDescription: 'Free, private messy text to clean spreadsheet converter. Turn unstructured notes, contacts, and order snippets into Excel tables and CSV files instantly.',
    placeholder: 'Paste any messy text, mixed notes, contact lines, or raw records here (up to 6,000 characters)...',
    sampleData: `Priya Nair - priya.nair@apexcraft.in | +91 98201 44120 — Ordered 3x Ergonomic Desk Stand (Black), ₹2,450 each, Pune, Status: Paid via UPI
Order #4082 from Rohan Mehta (rohan.m@kinetix.co / 98114-77290): 1x Mechanical Keyboard Keychron K2 - Rs 8999 - Gurugram - Pending COD
09/11: Ananya Sharma, ananya@vervelabs.org, phone 9740012883 -> 2x USB-C Hub 7-in-1 @ 1899/unit, Bengaluru (Paid)
Vikramaditya Rao | vikram.rao@finbridge.in | 99002 55311 - 5x Aluminium Laptop Riser - ₹1,200 - Hyderabad - Dispatched
Meera Iyer (meera@studioiyer.com), +91-98450-31922, bought 1x Studio Monitor Arm ₹4,200, Chennai, Paid`,
    aiHint: 'Extract every distinct record into clean normalized columns such as Name, Email, Phone, Order ID, Item, Quantity, Unit Price, City, and Payment Status. Keep currency formatting consistent.',
    exportFilename: 'cleansheet-universal-export.csv',
    seoGuide: {
      intro: 'Unstructured business notes, chat logs, and copied snippets slow down operations when every record follows a slightly different format. One line separates fields with pipes and dashes while the next uses parentheses, slashes, or informal shorthand. CleanSheet AI reads inconsistent delimiters, recognizes entities such as customer names, emails, phone numbers, SKUs, quantities, currencies, and cities, and normalizes them into uniform spreadsheet columns ready for Microsoft Excel or Google Sheets without writing complex formulas or regular expressions. Because everything runs strictly in memory without logins or ads, operations teams can clean sensitive daily exports in seconds.',
      howToUse: [
        'Copy your raw, unformatted text from emails, chat threads, sticky notes, or legacy system exports and paste up to 6,000 characters into the input workspace on the left.',
        'Click "Convert to Clean Table" to parse entities in memory, align mismatched fields into consistent columns, and standardize formatting across every row automatically.',
        'Inspect the interactive preview table on the right, click any cell to make quick inline edits if needed, and click "Copy Table (For Excel/Sheets)" or "Download .CSV".'
      ],
      useCases: [
        {
          title: 'Mixed Contact & Order Logs',
          detail: 'Separate customer names, phone numbers, email addresses, product names, unit prices, and order statuses from informal daily operational notes and sales logs without manual column splitting.'
        },
        {
          title: 'Operations & Support Handoffs',
          detail: 'Turn daily shift summaries, field agent updates, or Slack threads into structured rows ready for pivot tables, inventory counts, SLA tracking, and weekly management reporting.'
        },
        {
          title: 'Ad-Hoc Data Cleanup & Migration',
          detail: 'Normalize inconsistent date styles, currency symbols, and separators before importing records into Airtable, Notion, CRM systems, or cloud accounting software.'
        }
      ],
      faqs: [
        {
          question: 'Is my pasted text stored or used to train models?',
          answer: 'No. Your text is processed strictly in memory during your request and discarded immediately after generating the table. CleanSheet AI uses zero database storage, zero user accounts, and zero tracking cookies.'
        },
        {
          question: 'Can I paste the converted table straight into Excel or Google Sheets?',
          answer: 'Yes. Clicking "Copy Table (For Excel/Sheets)" formats your headers and rows as clean tab-separated values so pasting directly into cell A1 populates each column accurately without using Text to Columns.'
        },
        {
          question: 'Why is there a 6,000-character limit per conversion?',
          answer: 'Capping each request at 6,000 characters keeps processing fast, prevents timeouts, and ensures consistently high column accuracy across every row. Larger datasets can be converted cleanly in quick batches.'
        }
      ]
    }
  },
  {
    slug: '/bank-statement-text-to-excel',
    navLabel: 'Bank & UPI',
    title: 'Bank Statement & UPI Text to Excel Converter',
    subtitle: 'Clean raw copy-pasted bank and UPI transaction lines into reconciliation-ready Debit and Credit columns.',
    metaTitle: 'Bank Statement & UPI Text to Excel Converter | CleanSheet AI',
    metaDescription: 'Convert copy-pasted Indian bank statements and UPI transaction text into clean Excel tables with Date, Description, Reference, Debit, Credit, and Balance columns.',
    placeholder: 'Paste raw bank statement lines or UPI SMS/PDF copy-pasted text here...',
    sampleData: `01/11/2026 UPI/DR/430618291045/ZOMATO MEDIA/HDFC/zomato@hdfcbank 642.00 Dr Bal: 84,210.50
02 Nov 2026   NEFT-INW-SBIN0001928-ACME CONSULTING PVT LTD   Cr 45,000.00   Balance 1,29,210.50
03-11-26 ATM WDL/MG ROAD BENGALURU/REF 992817  5,000.00(Dr) 124210.50
04/11/2026 UPI/CR/430988120944/RAHUL VERMA/ICICI/Payment for Oct Invoice   12,500.00 Cr  Bal 1,36,710.50
05/11/2026 POS 4591XXXX8821 AMAZON PAY INDIA   3,299.00 Dr   1,33,411.50
06 Nov 26  ACH-DR-HDFC-AIRTEL BROADBAND-9928102  1,178.82 Dr  Bal: 1,32,232.68`,
    aiHint: 'Parse financial transaction lines into structured ledger columns: Date, Mode/Channel, Reference/UTR, Particulars/Merchant, Debit, Credit, and Balance. Keep Debit and Credit in separate numeric columns (leave blank when not applicable) and preserve exact amounts.',
    exportFilename: 'bank-upi-statement-clean.csv',
    seoGuide: {
      intro: 'Copy-pasting transactions from internet banking portals, PDF passbooks, or UPI alerts almost always breaks column alignment in spreadsheets. Debit and credit markers merge directly into merchant narrations, dates alternate between slash and hyphen formats, and Indian numbering commas break Excel SUM formulas. CleanSheet AI restructures raw banking and UPI transaction text into clean, audit-ready accounting columns with zero manual text splitting, making monthly reconciliation faster for founders, freelancers, small business owners, and chartered accountants.',
      howToUse: [
        'Select and copy your raw transaction lines directly from a netbanking portal, downloaded PDF statement, or exported text passbook (up to 6,000 characters per batch).',
        'Paste the transaction block into the left workspace and click "Convert to Clean Table" to separate transaction dates, payment channels, UTR reference numbers, particulars, debits, credits, and closing balances.',
        'Verify the ledger columns in the interactive table on the right, make quick inline edits if needed, copy directly into Excel or Google Sheets for reconciliation, or download as a clean CSV file.'
      ],
      useCases: [
        {
          title: 'Monthly GST & Bookkeeping Prep',
          detail: 'Separate UPI business expenses, SaaS charges, and incoming client NEFT or IMPS settlements into structured Debit and Credit columns before handing clean ledgers to your chartered accountant.'
        },
        {
          title: 'Reimbursable Expense Claims',
          detail: 'Extract travel bookings, client meals, fuel charges, and software subscriptions from mixed personal-and-work statement snippets in seconds without exposing full passbook files.'
        },
        {
          title: 'Multi-Bank Ledger Consolidation',
          detail: 'Standardize inconsistent copy-paste formats from HDFC, ICICI, SBI, Axis, or Kotak bank statements into one uniform schema for accurate weekly cash-flow tracking.'
        }
      ],
      faqs: [
        {
          question: 'Does CleanSheet AI separate Debit and Credit into two columns?',
          answer: 'Yes. It detects Dr/Cr indicators, parenthetical markers, and narration context to place outgoing amounts in a dedicated Debit column and incoming funds in a Credit column so Excel SUM formulas work cleanly.'
        },
        {
          question: 'Is it safe to paste financial transaction lines here?',
          answer: 'Yes. Your text is processed strictly in memory to generate the table and is never logged, cached, or saved to any database. For extra peace of mind, you can mask account numbers before pasting.'
        },
        {
          question: 'Can it handle UPI reference IDs and multi-line narrations?',
          answer: 'Yes. It isolates 12-digit UPI UTR numbers, NEFT/IMPS codes, and merchant names into dedicated columns even when long bank narrations wrap across multiple lines.'
        }
      ]
    }
  },
  {
    slug: '/whatsapp-order-list-to-csv',
    navLabel: 'WhatsApp',
    title: 'WhatsApp Customer Orders to CSV Converter',
    subtitle: 'Turn messy WhatsApp customer messages into clean shipping and fulfillment spreadsheets.',
    metaTitle: 'WhatsApp Customer Orders to CSV Converter | CleanSheet AI',
    metaDescription: 'Convert messy WhatsApp order messages into clean CSV spreadsheets with customer name, phone number, items, sizes, quantities, and delivery city.',
    placeholder: 'Paste copied WhatsApp order messages here...',
    sampleData: `[10:14 AM, 11/24/2026] Neha Kulkarni: Hi! Please book 2 Cotton Kurtis (Size M, Teal & Mustard) and 1 Palazzo White L. Ph: 9822019384, Pune 411004. Paid GPay.
[10:32 AM, 11/24/2026] +91 98103 66421 (Arjun Kapoor): Need 1x Oversized Linen Shirt XL Olive + 2x Chino Shorts 32 Beige. Deliver to Sector 18 Noida. COD please!
[11:05 AM, 11/24/2026] Divya Menon: Hey, order for Divya Menon - 3 Linen Sarees (2 Blush Pink, 1 Ivory), size Free, mobile 9447022190, Kochi Kerala. Transfer done.
[11:48 AM, 11/24/2026] Farhan Siddiqui: Book 4x Printed Tote Bags (Canvas Natural) for Farhan, 9831044512, Park Street Kolkata 700016, Prepaid`,
    aiHint: 'Extract WhatsApp customer orders into fulfillment columns: Customer Name, Phone, Item, Variant/Size/Color, Quantity, City/Address, and Payment Mode. If a customer ordered multiple distinct items, output one clean row per item with customer details repeated so fulfillment teams can filter by SKU.',
    exportFilename: 'whatsapp-orders-clean.csv',
    seoGuide: {
      intro: 'Small D2C brands, home bakeries, boutique apparel sellers, and wholesale distributors receive hundreds of customer orders through WhatsApp chats every week. Manually retyping customer names, garment sizes, phone numbers, delivery pin codes, and payment confirmations into shipping spreadsheets wastes hours and invites costly dispatch mistakes. CleanSheet AI turns raw copied WhatsApp chat threads into fulfillment-ready CSV files in seconds so small teams ship faster with zero manual data entry or copy-paste errors across daily order batches.',
      howToUse: [
        'Highlight and copy a batch of incoming order messages directly from WhatsApp Web, desktop app, or mobile chat exports (up to 6,000 characters per conversion).',
        'Paste the raw chat thread into the left workspace and click "Convert to Clean Table" to extract structured customer, phone, product, variant, quantity, city, and payment mode columns.',
        'Review or tweak any cell inline on the right, then download the CSV to upload into courier aggregators like Shiprocket or copy straight into your master Google Sheet.'
      ],
      useCases: [
        {
          title: 'Boutique & D2C Order Dispatch',
          detail: 'Split multi-item chat messages into clean per-item rows with exact size, color, and quantity columns so warehouse packers and tailors never miss a requested variant.'
        },
        {
          title: 'Prepaid vs. COD Reconciliation',
          detail: 'Automatically flag GPay, UPI, Bank Transfer, Prepaid, and Cash on Delivery mentions in a dedicated payment column for quick daily accounts and courier reconciliation.'
        },
        {
          title: 'Event, Workshop & Catering Lists',
          detail: 'Convert messy group chat RSVPs, meal preferences, T-shirt sizes, dietary notes, and headcounts into structured attendee checklists in one clean pass.'
        }
      ],
      faqs: [
        {
          question: 'What happens if one WhatsApp message contains multiple products?',
          answer: 'CleanSheet AI splits multi-item orders into clear, normalized rows while repeating the customer name, phone number, and delivery city so your inventory counts, packing slips, and courier manifests stay completely accurate.'
        },
        {
          question: 'Does it remove WhatsApp timestamps and brackets automatically?',
          answer: 'Yes. Chat prefixes such as "[10:14 AM, 11/24/2026]" and sender phone labels are parsed cleanly without cluttering your customer name, product variant, or delivery address columns.'
        },
        {
          question: 'Can I edit a customer address or size before downloading the CSV?',
          answer: 'Yes. Every cell in the preview table is clickable and editable right in your browser before you copy to Google Sheets or export the final CSV file.'
        }
      ]
    }
  },
  {
    slug: '/pdf-table-copy-paste-fixer',
    navLabel: 'PDF Fixer',
    title: 'Broken PDF Table Copy-Paste Fixer',
    subtitle: 'Reconstruct fragmented multi-line tables copied out of PDFs back into aligned spreadsheet columns.',
    metaTitle: 'Broken PDF Table Copy-Paste Fixer | CleanSheet AI',
    metaDescription: 'Fix broken tables copied from PDF documents. Reassemble wrapped multi-line rows and jumbled columns into clean Excel and CSV spreadsheets.',
    placeholder: 'Paste broken, wrapped table text copied from a PDF here...',
    sampleData: `SKU-1042 Ergonomic Mesh
Office Chair (Charcoal)
Warehouse A-12
48
units  $189.00
SKU-1089 Dual Monitor
Gas Spring Arm
Warehouse B-04
112 units
$64.50
SKU-1120 Standing Desk
Converter 36-inch Matte Black
Warehouse A-03
19 units $142.00
SKU-1154 Acoustic Felt
Desk Divider Panel (Set of 2)
Warehouse C-01 85 units $38.25`,
    aiHint: 'Reconstruct broken multi-line PDF table rows into clean single-record rows with aligned columns such as SKU, Product Name, Warehouse Location, Stock Quantity, Unit, and Unit Price.',
    exportFilename: 'pdf-table-fixed.csv',
    seoGuide: {
      intro: 'Copying a data table out of a PDF viewer almost always destroys the spreadsheet grid. Long product titles wrap onto three separate lines, warehouse codes jump into numeric columns, and spaces collapse between quantities and prices. Instead of manually joining wrapped rows in Excel for half an hour, CleanSheet AI detects repeating record boundaries and stitches fragmented PDF lines back into crisp, properly aligned columns ready for immediate filtering, pivot tables, and accurate inventory analysis across finance and procurement teams.',
      howToUse: [
        'Select and copy the garbled table text directly from Adobe Acrobat, Chrome PDF Viewer, Edge, or macOS Preview and paste it into the input panel on the left.',
        'Click "Convert to Clean Table" to merge broken line wraps, separate merged columns, and realign shifted values automatically in server memory.',
        'Inspect the reconstructed grid in the right preview table, adjust any cell inline if desired, and copy to Excel/Sheets or download as a clean CSV file.'
      ],
      useCases: [
        {
          title: 'Supplier Price Lists & Catalogs',
          detail: 'Turn multi-page PDF wholesale catalogs, distributor rate cards, and SKU sheets into filterable spreadsheets for fast vendor price and margin comparisons.'
        },
        {
          title: 'Warehouse & Inventory Audits',
          detail: 'Realign wrapped bin locations, stock counts, units of measure, and unit prices copied from legacy ERP-generated PDF reports without manual formula hacks.'
        },
        {
          title: 'Research & Financial Reports',
          detail: 'Extract statistical tables, quarterly financial schedules, and academic benchmarks from published PDF papers cleanly without manual retyping or broken line breaks.'
        }
      ],
      faqs: [
        {
          question: 'Why do PDF tables break when pasted into Excel?',
          answer: 'PDF files store visual page coordinates rather than true spreadsheet cells, so wrapped text inside a narrow column becomes hard line breaks that push values into the wrong rows when pasted into Excel.'
        },
        {
          question: 'Can CleanSheet AI merge descriptions that wrapped across 2 or 3 lines?',
          answer: 'Yes. It identifies where each new record starts (such as SKU codes, dates, or item numbers) and joins wrapped lines back into the proper cell without losing any words or numbers.'
        },
        {
          question: 'Do I need to install any browser extension or desktop software?',
          answer: 'No. Everything runs right in your web browser with zero downloads, zero sign-ups, zero intrusive ads, and zero persistent data storage on our servers.'
        }
      ]
    }
  },
  {
    slug: '/invoice-text-to-spreadsheet',
    navLabel: 'Invoices',
    title: 'Raw Invoice Line-Items to Spreadsheet Converter',
    subtitle: 'Convert unformatted invoice line items, quantities, tax rates, and totals into clean accounting rows.',
    metaTitle: 'Raw Invoice Line-Items to Spreadsheet Converter | CleanSheet AI',
    metaDescription: 'Extract messy invoice line items, HSN codes, quantities, unit prices, GST percentages, and totals into clean Excel and CSV spreadsheets.',
    placeholder: 'Paste raw invoice line items, tax details, and totals here...',
    sampleData: `Inv #INV-2026-884 | Vendor: PixelForge Prints
1. Tri-Fold Brochures 300gsm Matte (HSN 4911) - Qty: 2,500 pcs @ Rs 8.40/pc | GST 12% | Tax: 2,520.00 | Total: 23,520.00
2. Custom Die-Cut Packaging Boxes 12x8x4 (HSN 4819) Qty 500 units Rate 42.00 GST 18% (3,780.00) Line Total 24,780.00
3. Acrylic Table Standee A5 Clear - 40 nos x 285.00 | 18% GST = 2,052.00 | Net: 13,452.00
4. Graphic Layout & Print Setup Fee (SAC 9983) 1 Lot 3500.00 + 18% IGST (630) = 4,130.00`,
    aiHint: 'Extract invoice line items into accounting-ready columns: Item No, Description, HSN/SAC Code, Quantity, Unit, Unit Rate, Tax Rate, Tax Amount, and Line Total. Preserve numeric precision.',
    exportFilename: 'invoice-line-items-clean.csv',
    seoGuide: {
      intro: 'Vendor bills, proforma quotes, and PDF invoices pack critical financial details—HSN or SAC codes, quantities, unit rates, GST or VAT percentages, tax amounts, and line totals—into dense, inconsistent text blocks. Re-keying every line item into accounting software, ERP sheets, or purchase order trackers takes valuable finance team hours and risks costly arithmetic typos. CleanSheet AI unpacks raw invoice text into structured, audit-ready columns for reconciliation, vendor cost tracking, purchase order audits, and monthly tax filing without tedious manual spreadsheet cleanup.',
      howToUse: [
        'Copy the line-item section from an emailed supplier quote, PDF bill, or OCR text dump and paste up to 6,000 characters into the input box on the left.',
        'Click "Convert to Clean Table" to isolate item descriptions, HSN/SAC codes, quantities, units, unit rates, tax rates, tax amounts, and line totals automatically.',
        'Verify the extracted numbers in the interactive preview table, adjust any cell inline if needed, and export straight to Excel, Google Sheets, or downloadable CSV.'
      ],
      useCases: [
        {
          title: 'Accounts Payable & PO Matching',
          detail: 'Compare supplier-billed quantities, unit rates, discounts, and freight charges directly against your approved purchase order spreadsheet before releasing vendor payments.'
        },
        {
          title: 'GST & Input Tax Credit Audits',
          detail: 'Break out taxable values, HSN/SAC codes, and 5%, 12%, or 18% GST/IGST amounts into clean, formula-ready columns for monthly return reconciliation and audit verification.'
        },
        {
          title: 'Vendor Quote Comparison',
          detail: 'Normalize competing supplier quotes formatted inside email bodies or PDF attachments into one standardized comparison sheet for fast procurement and finance review.'
        }
      ],
      faqs: [
        {
          question: 'Can it extract HSN/SAC codes and GST percentages separately?',
          answer: 'Yes. CleanSheet AI detects HSN/SAC tax codes and GST/VAT percentages embedded inside parentheses or item descriptions and places them into their own dedicated columns for clean tax reporting.'
        },
        {
          question: 'Are numbers formatted cleanly for Excel SUM and multiplication formulas?',
          answer: 'Yes. Numeric quantities, unit rates, tax amounts, and line totals are separated cleanly from units like pcs or nos so spreadsheets can run SUM and audit calculations immediately.'
        },
        {
          question: 'What if an invoice includes a service fee without a physical unit?',
          answer: 'Service line items with units such as Lot, Hours, or Flat Fee are preserved accurately alongside physical SKU items in the same clean table without dropping tax details.'
        }
      ]
    }
  },
  {
    slug: '/email-leads-to-csv',
    navLabel: 'Email Leads',
    title: 'Unstructured Email Signatures & Leads to CSV',
    subtitle: 'Turn raw email signatures and inbound lead blocks into clean CRM-ready contact spreadsheets.',
    metaTitle: 'Email Signatures & Leads to CSV Converter | CleanSheet AI',
    metaDescription: 'Extract Name, Role, Company, Phone, Email, and Website from unstructured email signatures and lead blocks into a clean CRM-ready CSV file.',
    placeholder: 'Paste unstructured email signatures or inbound lead snippets here...',
    sampleData: `Warm regards,
Siddharth Malhotra
VP of Supply Chain | Meridian Logistics Group
M: +91 98204 11890 | D: +91 22 4091 2200
s.malhotra@meridianlogistics.in | www.meridianlogistics.in | Mumbai, India

---
Best,
Claire Vance, Head of Partnerships at Northstar Cloud Inc.
Reach me at claire.vance@northstarcloud.io or +1 (415) 890-3341
San Francisco, CA

---
Thanks & Regards,
Karthik Subramanian — Founder & CEO, GreenGrid Energy Solutions
Phone: +91-99401-88219 | Email: karthik@greengrid.co.in | Chennai`,
    aiHint: 'Extract contact and lead fields into CRM-ready columns: Full Name, Role/Title, Company, Email, Phone, Website, and Location. Leave missing fields blank cleanly.',
    exportFilename: 'email-leads-crm.csv',
    seoGuide: {
      intro: 'Inbound inquiries, trade show follow-ups, and B2B email threads contain high-value prospect details buried inside multi-line email signatures. Manually copying full names, job titles, company names, direct phone numbers, and websites into HubSpot, Salesforce, Zoho CRM, or Pipedrive wastes hours every week for sales, marketing, and partnerships teams. CleanSheet AI parses raw signature blocks and lead notes into clean, CRM-importable CSV spreadsheets without complex scraping plugins, browser extensions, or manual copy-paste formatting.',
      howToUse: [
        'Copy one or more email signatures, LinkedIn message intros, or raw lead notes (separated by blank lines or dashes) and paste up to 6,000 characters into the left textarea.',
        'Click "Convert to Clean Table" to extract Full Name, Role/Title, Company, Email Address, Phone Number, Website, and Location into aligned columns.',
        'Review the structured lead table on the right, make any quick inline edits if needed, and copy directly to Google Sheets or download the CSV for bulk CRM import.'
      ],
      useCases: [
        {
          title: 'CRM Contact Bulk Import',
          detail: 'Prepare clean CSV contact lists for HubSpot, Zoho CRM, Salesforce, or Pipedrive without writing regular expressions or manually splitting names, roles, and domains across columns.'
        },
        {
          title: 'Conference & Event Follow-Ups',
          detail: 'Paste raw attendee intros, business card OCR text, and email signature blocks collected after webinars or trade shows into an organized sales outreach tracker within seconds.'
        },
        {
          title: 'Recruiting & Candidate Pipelines',
          detail: 'Normalize candidate email footers, current job titles, employers, phone numbers, portfolio links, and city locations into structured hiring, outreach, and talent sourcing spreadsheets.'
        }
      ],
      faqs: [
        {
          question: 'Can I paste multiple email signatures at once?',
          answer: 'Yes. Paste as many signatures as you want (up to 6,000 characters per batch), separated by blank lines or dashes, and each contact becomes its own clean, deduplicated spreadsheet row ready for CRM import.'
        },
        {
          question: 'What happens if one signature includes a website and another does not?',
          answer: 'CleanSheet AI maintains consistent columns across all contacts and simply leaves missing fields blank for contacts without a listed website, city, or second phone line.'
        },
        {
          question: 'Does it keep international phone number formats intact?',
          answer: 'Yes. Country codes such as +91 or +1 and regional formatting are preserved clearly so dialers, WhatsApp tools, outreach teams, and CRMs recognize every contact number accurately.'
        }
      ]
    }
  }
];

export const TOOL_MAP: Record<string, ConverterToolConfig> = Object.fromEntries(
  CONVERTER_TOOLS.map((tool) => [tool.slug, tool])
);

export function getToolByPath(pathname: string): ConverterToolConfig {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return TOOL_MAP[normalized] ?? CONVERTER_TOOLS[0];
}
