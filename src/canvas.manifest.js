export const manifest = {
  screens: {
    scr_if9q4p: { name: "Splash", route: "/", state: { "authed": false, "step": "splash" }, position: { "x": 160, "y": 1820 } },
    scr_yw31i6: { name: "Welcome", route: "/", state: { "authed": false, "step": "welcome" }, position: { "x": 1560, "y": 1820 } },
    scr_tmxdjz: { name: "Sign in", route: "/", state: { "authed": false, "step": "signin" }, position: { "x": 2960, "y": 1820 } },
    scr_lve78l: { name: "Create account", route: "/", state: { "authed": false, "step": "signup" }, position: { "x": 4360, "y": 1820 } },
    scr_p3elgr: { name: "Verify email", route: "/", state: { "authed": false, "step": "verify" }, position: { "x": 5760, "y": 1820 } },
    scr_y175nd: { name: "Company setup", route: "/", state: { "authed": false, "step": "org" }, position: { "x": 7160, "y": 1820 } },
    scr_kt6033: { name: "Branch setup", route: "/", state: { "authed": false, "step": "branch" }, position: { "x": 8560, "y": 1820 } },
    scr_qpuhpw: { name: "Invite team", route: "/", state: { "authed": false, "step": "invite" }, position: { "x": 9960, "y": 1820 } },
    scr_3xxm26: { name: "Setup complete", route: "/", state: { "authed": false, "step": "success" }, position: { "x": 11360, "y": 1820 } },
    scr_ucglh5: { name: "Dashboard", route: "/home", position: { "x": 160, "y": 3800 } },
    scr_dmpfqh: { name: "Projects", route: "/projects", position: { "x": 160, "y": 5780 } },
    scr_n4iyt0: { name: "Project overview", route: "/projects/pr-1024", state: { "tab": "overview" }, position: { "x": 1560, "y": 5780 } },
    scr_gzxk1t: { name: "Project plans", route: "/projects/pr-1024", state: { "tab": "plans" }, position: { "x": 2960, "y": 5780 } },
    scr_sobo68: { name: "Project takeoffs", route: "/projects/pr-1024", state: { "tab": "takeoff" }, position: { "x": 4360, "y": 5780 } },
    scr_80dyd4: { name: "Project deliveries", route: "/projects/pr-1024", state: { "tab": "deliveries" }, position: { "x": 5760, "y": 5780 } },
    scr_cnx75n: { name: "New AI takeoff", route: "/takeoff/new", position: { "x": 160, "y": 7760 } },
    scr_lue0my: { name: "Takeoff workspace", route: "/takeoff/TK-1024", position: { "x": 1560, "y": 7760 } },
    scr_5o8ejv: { name: "Procurement pipeline", route: "/procurement", state: { "tab": "requests" }, position: { "x": 160, "y": 9740 } },
    scr_8cqjvq: { name: "Approved takeoffs", route: "/procurement", state: { "tab": "takeoffs" }, position: { "x": 1560, "y": 9740 } },
    scr_2et7mv: { name: "Supplier quotes", route: "/procurement", state: { "tab": "quotes" }, position: { "x": 2960, "y": 9740 } },
    scr_j872ql: { name: "New material request", route: "/procurement/requests/new", position: { "x": 160, "y": 11720 } },
    scr_qjv82b: { name: "Material requirement", route: "/procurement/requests/MR-1024", position: { "x": 1560, "y": 11720 } },
    scr_w27e8a: { name: "Quote comparison", route: "/procurement/requests/MR-1024/compare", position: { "x": 2960, "y": 11720 } },
    scr_tsrszv: { name: "Purchase orders", route: "/orders", position: { "x": 160, "y": 13700 } },
    scr_bu1avm: { name: "Purchase order", route: "/orders/PO-1024", position: { "x": 1560, "y": 13700 } },
    scr_3c8mbl: { name: "Deliveries", route: "/deliveries", position: { "x": 160, "y": 15680 } },
    scr_e5fqfb: { name: "Delivery tracking", route: "/deliveries/DL-1024", position: { "x": 1560, "y": 15680 } },
    scr_q7d042: { name: "Proof of delivery", route: "/deliveries/DL-0996", position: { "x": 2960, "y": 15680 } },
    scr_e9fsqu: { name: "Approvals", route: "/approvals", position: { "x": 160, "y": 17660 } },
    scr_eqdff8: { name: "Jobsite", route: "/jobsite", position: { "x": 160, "y": 21620 } },
    scr_xe08ck: { name: "Tasks", route: "/tasks", position: { "x": 160, "y": 23600 } },
    scr_6typwq: { name: "Invoices", route: "/accounting", position: { "x": 160, "y": 19640 } },
    scr_fxxvun: { name: "Invoice detail", route: "/accounting/invoices/INV-1024", position: { "x": 1560, "y": 19640 } },
    scr_7fythp: { name: "Payments", route: "/accounting/payments", position: { "x": 2960, "y": 19640 } },
    scr_i1j441: { name: "Documents", route: "/documents", position: { "x": 160, "y": 25580 } },
    scr_jz16jn: { name: "Plan version", route: "/documents/ps-3", position: { "x": 1560, "y": 25580 } },
    scr_rbpaxx: { name: "Suppliers", route: "/suppliers", position: { "x": 160, "y": 27560 } },
    scr_vpr9gv: { name: "Supplier profile", route: "/suppliers/sp-1", position: { "x": 1560, "y": 27560 } },
    scr_snv4xd: { name: "Messages", route: "/messages", position: { "x": 160, "y": 29540 } },
    scr_l6plwb: { name: "Message thread", route: "/messages/th-1", position: { "x": 1560, "y": 29540 } },
    scr_yiveaa: { name: "Notifications", route: "/notifications", position: { "x": 0, "y": 0 }, isDefaultRow: true },
    scr_89uv8a: { name: "Team & roles", route: "/team", position: { "x": 1400, "y": 0 }, isDefaultRow: true },
    scr_es7fbc: { name: "Search", route: "/search", position: { "x": 2800, "y": 0 }, isDefaultRow: true },
    scr_teaq64: { name: "Profile & settings", route: "/profile", position: { "x": 4200, "y": 0 }, isDefaultRow: true },
    scr_1qe56u: { name: "Activity log", route: "/activity", position: { "x": 5600, "y": 0 }, isDefaultRow: true }
  },
  sections: {
    sec_5x2a33: { name: "Onboarding & Auth", x: 0, y: 1600, width: 12720, height: 1180 },
    sec_hevi0w: { name: "Dashboard", x: 0, y: 3580, width: 1520, height: 1180 },
    sec_is35sl: { name: "Project Management", x: 0, y: 5560, width: 7120, height: 1180 },
    sec_idqxkv: { name: "Takeoff & Estimation", x: 0, y: 7540, width: 2920, height: 1180 },
    sec_7ui7io: { name: "Procurement Pipeline", x: 0, y: 9520, width: 4320, height: 1180 },
    sec_6n4isv: { name: "Material Requests", x: 0, y: 11500, width: 4320, height: 1180 },
    sec_sxc42p: { name: "Purchase Orders", x: 0, y: 13480, width: 2920, height: 1180 },
    sec_rtndm0: { name: "Deliveries", x: 0, y: 15460, width: 4320, height: 1180 },
    sec_iztf3e: { name: "Approvals", x: 0, y: 17440, width: 1520, height: 1180 },
    sec_a9lvm8: { name: "Accounting", x: 0, y: 19420, width: 4320, height: 1180 },
    sec_4elly8: { name: "Jobsite Management", x: 0, y: 21400, width: 1520, height: 1180 },
    sec_j6hx17: { name: "Tasks", x: 0, y: 23380, width: 1520, height: 1180 },
    sec_ozy2m3: { name: "Documents", x: 0, y: 25360, width: 2920, height: 1180 },
    sec_wxodhc: { name: "Suppliers", x: 0, y: 27340, width: 2920, height: 1180 },
    sec_1r75hd: { name: "Messaging", x: 0, y: 29320, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "screen", id: "scr_yiveaa" },
  { kind: "screen", id: "scr_89uv8a" },
  { kind: "screen", id: "scr_es7fbc" },
  { kind: "screen", id: "scr_teaq64" },
  { kind: "screen", id: "scr_1qe56u" },
  { kind: "section", id: "sec_5x2a33", children: [
    { kind: "screen", id: "scr_if9q4p" },
    { kind: "screen", id: "scr_yw31i6" },
    { kind: "screen", id: "scr_tmxdjz" },
    { kind: "screen", id: "scr_lve78l" },
    { kind: "screen", id: "scr_p3elgr" },
    { kind: "screen", id: "scr_y175nd" },
    { kind: "screen", id: "scr_kt6033" },
    { kind: "screen", id: "scr_qpuhpw" },
    { kind: "screen", id: "scr_3xxm26" }]
  },
  { kind: "section", id: "sec_hevi0w", children: [
    { kind: "screen", id: "scr_ucglh5" }]
  },
  { kind: "section", id: "sec_is35sl", children: [
    { kind: "screen", id: "scr_dmpfqh" },
    { kind: "screen", id: "scr_n4iyt0" },
    { kind: "screen", id: "scr_gzxk1t" },
    { kind: "screen", id: "scr_sobo68" },
    { kind: "screen", id: "scr_80dyd4" }]
  },
  { kind: "section", id: "sec_idqxkv", children: [
    { kind: "screen", id: "scr_cnx75n" },
    { kind: "screen", id: "scr_lue0my" }]
  },
  { kind: "section", id: "sec_7ui7io", children: [
    { kind: "screen", id: "scr_5o8ejv" },
    { kind: "screen", id: "scr_8cqjvq" },
    { kind: "screen", id: "scr_2et7mv" }]
  },
  { kind: "section", id: "sec_6n4isv", children: [
    { kind: "screen", id: "scr_j872ql" },
    { kind: "screen", id: "scr_qjv82b" },
    { kind: "screen", id: "scr_w27e8a" }]
  },
  { kind: "section", id: "sec_sxc42p", children: [
    { kind: "screen", id: "scr_tsrszv" },
    { kind: "screen", id: "scr_bu1avm" }]
  },
  { kind: "section", id: "sec_rtndm0", children: [
    { kind: "screen", id: "scr_3c8mbl" },
    { kind: "screen", id: "scr_e5fqfb" },
    { kind: "screen", id: "scr_q7d042" }]
  },
  { kind: "section", id: "sec_iztf3e", children: [
    { kind: "screen", id: "scr_e9fsqu" }]
  },
  { kind: "section", id: "sec_a9lvm8", children: [
    { kind: "screen", id: "scr_6typwq" },
    { kind: "screen", id: "scr_fxxvun" },
    { kind: "screen", id: "scr_7fythp" }]
  },
  { kind: "section", id: "sec_4elly8", children: [
    { kind: "screen", id: "scr_eqdff8" }]
  },
  { kind: "section", id: "sec_j6hx17", children: [
    { kind: "screen", id: "scr_xe08ck" }]
  },
  { kind: "section", id: "sec_ozy2m3", children: [
    { kind: "screen", id: "scr_i1j441" },
    { kind: "screen", id: "scr_jz16jn" }]
  },
  { kind: "section", id: "sec_wxodhc", children: [
    { kind: "screen", id: "scr_rbpaxx" },
    { kind: "screen", id: "scr_vpr9gv" }]
  },
  { kind: "section", id: "sec_1r75hd", children: [
    { kind: "screen", id: "scr_snv4xd" },
    { kind: "screen", id: "scr_l6plwb" }]
  }]

};