import { useState, useEffect, useCallback } from "react";
import {
  Home, ShoppingCart, FileText, Users, Boxes, MapPin, ShoppingBag,
  Truck, Scissors, PackageCheck, Building2, Coins, Wallet, PieChart,
  Settings, Menu, X, Plus, Trash2, Edit2, Search, ChevronLeft, Save,
  AlertCircle, LogOut, Lock
} from "lucide-react";

// ============================================================
// Supabase connection
// ============================================================
const SUPABASE_URL = "https://yftqcurdvjcdetjaejqq.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHFjdXJkdmpjZGV0amFlanFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTgzNzMsImV4cCI6MjEwMjI5NDM3M30.aHJocIyQq0J5syW0JwXcHtLujn_zzFv4_QJT0pRzMEM";
const SESSION_KEY = "factory-erp-session";

async function apiRequest(path, { method = "GET", token, body, prefer } = {}) {
  const headers = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token || ANON_KEY}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers["Prefer"] = prefer;
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.message || j.error_description || j.msg || msg; } catch (e) {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_description || json.msg || "فشل تسجيل الدخول");
  return json;
}

async function requestPasswordReset(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, options: { redirect_to: window.location.origin } }),
  });
  if (!res.ok) {
    let msg = "تعذّر إرسال رابط إعادة التعيين";
    try { const j = await res.json(); msg = j.error_description || j.msg || msg; } catch (e) {}
    throw new Error(msg);
  }
}

async function updatePassword(token, newPassword) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_description || json.msg || "تعذّر تغيير كلمة المرور");
  return json;
}

const T = { list: "*", // helper unused
};

const list = (table, token, query = "select=*&order=date.desc") => apiRequest(`/rest/v1/${table}?${query}`, { token });
const insert = (table, token, row) => apiRequest(`/rest/v1/${table}`, { method: "POST", token, body: row, prefer: "return=representation" });
const update = (table, token, id, patch) => apiRequest(`/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", token, body: patch, prefer: "return=representation" });
const remove = (table, token, id) => apiRequest(`/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", token });
const rpc = (fn, token, args) => apiRequest(`/rest/v1/rpc/${fn}`, { method: "POST", token, body: args });

function uid() { return Math.random().toString(36).slice(2, 10); }
function fmt(n) { return (Number(n) || 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 }); }
function today() { return new Date().toISOString().slice(0, 10); }

const ACCENT = "#D4AF37";
const LOGO_DATA_URI = "data:image/jpeg;base64,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";

// ============================================================
// ROOT
// ============================================================
export default function FactoryERP() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [recoveryToken, setRecoveryToken] = useState(null);

  useEffect(() => {
    // اكتشاف رابط إعادة تعيين كلمة المرور القادم من الإيميل
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const at = params.get("access_token");
      if (at) { setRecoveryToken(at); return; }
    }
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      setSession(raw ? JSON.parse(raw) : null);
    } catch (e) { setSession(null); }
  }, []);

  const handleLogin = (sess) => {
    setSession(sess);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(sess)); } catch (e) {}
  };
  const handleLogout = () => {
    setSession(null);
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  };

  if (recoveryToken) {
    return <ResetPasswordScreen token={recoveryToken} onDone={() => { setRecoveryToken(null); window.location.hash = ""; setSession(null); }} />;
  }
  if (session === undefined) return <CenterMsg>جارِ التحميل...</CenterMsg>;
  if (!session) return <LoginScreen onLogin={handleLogin} />;
  if (session.role === "sales_only") return <POSOnlyApp session={session} onLogout={handleLogout} />;
  return <AdminApp session={session} onLogout={handleLogout} />;
}

function CenterMsg({ children }) {
  return <div style={{ background: "#0d0d10", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT, fontFamily: "system-ui" }}>{children}</div>;
}

// ============================================================
// RESET PASSWORD (from email link)
// ============================================================
function ResetPasswordScreen({ token, onDone }) {
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(""); setMsg("");
    if (pw1.length < 6) { setErr("كلمة المرور يجب أن تكون 6 حروف/أرقام على الأقل"); return; }
    if (pw1 !== pw2) { setErr("كلمتا المرور غير متطابقتين"); return; }
    setBusy(true);
    try {
      await updatePassword(token, pw1);
      setMsg("تم تغيير كلمة المرور بنجاح، تقدر تسجّل دخول بيها دلوقتي.");
      setTimeout(onDone, 2000);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#111115", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 30, width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src={LOGO_DATA_URI} alt="4Brothers" style={{ width: 72, height: 72, margin: "0 auto 10px", borderRadius: 14, objectFit: "cover", border: `2px solid ${ACCENT}` }} />
          <h1 style={{ fontSize: 17, margin: 0, fontWeight: 800 }}>تعيين كلمة مرور جديدة</h1>
        </div>
        <div onKeyDown={e => { if (e.key === "Enter") submit(); }} style={{ display: "grid", gap: 12 }}>
          <Field label="كلمة المرور الجديدة"><Input type="password" value={pw1} onChange={e => setPw1(e.target.value)} /></Field>
          <Field label="تأكيد كلمة المرور"><Input type="password" value={pw2} onChange={e => setPw2(e.target.value)} /></Field>
          {err && <div style={{ color: "#c0392b", fontSize: 12.5 }}>{err}</div>}
          {msg && <div style={{ color: "#1a7f37", fontSize: 12.5 }}>{msg}</div>}
          <PrimaryBtn onClick={submit} disabled={busy} style={{ justifyContent: "center", marginTop: 4 }}>
            <Lock size={15} /> {busy ? "جارِ الحفظ..." : "حفظ كلمة المرور"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("login"); // login | forgot
  const [forgotMsg, setForgotMsg] = useState("");

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const auth = await login(email.trim(), password);
      const profRes = await apiRequest(`/rest/v1/profiles?id=eq.${auth.user.id}&select=role`, { token: auth.access_token });
      const role = profRes?.[0]?.role || "admin";
      onLogin({ token: auth.access_token, refreshToken: auth.refresh_token, userId: auth.user.id, email: auth.user.email, role });
    } catch (e2) {
      setErr(e2.message || "بيانات الدخول غير صحيحة");
    } finally { setBusy(false); }
  };

  const submitForgot = async () => {
    setErr(""); setForgotMsg(""); setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setForgotMsg("تم إرسال رابط إعادة تعيين كلمة المرور على إيميلك. افتح الإيميل ودوس على الرابط.");
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#111115", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 30, width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src={LOGO_DATA_URI} alt="4Brothers" style={{ width: 72, height: 72, margin: "0 auto 10px", borderRadius: 14, objectFit: "cover", border: `2px solid ${ACCENT}` }} />
          <h1 style={{ fontSize: 17, margin: 0, fontWeight: 800 }}>نظام إدارة المصنع</h1>
          <p style={{ fontSize: 12.5, color: "#8a8a92", marginTop: 4 }}>{mode === "login" ? "سجّل الدخول بحسابك" : "استرجاع كلمة المرور"}</p>
        </div>

        {mode === "login" ? (
          <div onKeyDown={e => { if (e.key === "Enter") submit(); }} style={{ display: "grid", gap: 12 }}>
            <Field label="البريد الإلكتروني"><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <Field label="كلمة المرور"><Input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></Field>
            {err && <div style={{ color: "#c0392b", fontSize: 12.5, display: "flex", gap: 6, alignItems: "center" }}><AlertCircle size={14} />{err}</div>}
            <PrimaryBtn onClick={submit} disabled={busy} style={{ justifyContent: "center", marginTop: 4 }}>
              <Lock size={15} /> {busy ? "جارِ الدخول..." : "دخول"}
            </PrimaryBtn>
            <button onClick={() => { setMode("forgot"); setErr(""); setForgotMsg(""); }} style={{ background: "transparent", border: "none", color: "#8a8a92", fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
              نسيت كلمة المرور؟
            </button>
          </div>
        ) : (
          <div onKeyDown={e => { if (e.key === "Enter") submitForgot(); }} style={{ display: "grid", gap: 12 }}>
            <Field label="البريد الإلكتروني"><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></Field>
            {err && <div style={{ color: "#c0392b", fontSize: 12.5 }}>{err}</div>}
            {forgotMsg && <div style={{ color: "#1a7f37", fontSize: 12.5 }}>{forgotMsg}</div>}
            <PrimaryBtn onClick={submitForgot} disabled={busy} style={{ justifyContent: "center", marginTop: 4 }}>
              {busy ? "جارِ الإرسال..." : "إرسال رابط إعادة التعيين"}
            </PrimaryBtn>
            <button onClick={() => { setMode("login"); setErr(""); setForgotMsg(""); }} style={{ background: "transparent", border: "none", color: "#8a8a92", fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
              الرجوع لتسجيل الدخول
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// POS-ONLY APP (sales_only role)
// ============================================================
function POSOnlyApp({ session, onLogout }) {
  const [products, setProducts] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [cart, setCart] = useState([]);
  const [pick, setPick] = useState("");
  const [paid, setPaid] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [receipt, setReceipt] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        rpc("pos_products", session.token, {}),
        apiRequest(`/rest/v1/customers?select=id,name,type&order=name.asc`, { token: session.token }),
      ]);
      setProducts(p || []);
      setCustomers(c || []);
      setCustomerId(c?.[0]?.id || "");
    } catch (e) { setErr(e.message); }
  }, [session.token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const priceFor = useCallback((prod, custId) => {
    const cust = (customers || []).find(c => c.id === custId);
    if (cust && cust.type === "مخزن" && prod.wholesale_price) return Number(prod.wholesale_price);
    return Number(prod.price);
  }, [customers]);

  // إعادة حساب أسعار السلة تلقائيًا لو اتغيّر العميل
  useEffect(() => {
    if (!products) return;
    setCart(c => c.map(i => {
      const prod = products.find(p => p.id === i.productId);
      return prod ? { ...i, price: priceFor(prod, customerId) } : i;
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  if (products === null || customers === null) return <CenterMsg>جارِ التحميل...</CenterMsg>;

  const total = cart.reduce((a, i) => a + i.qty * i.price, 0);

  const addProductToCart = (prod) => {
    if (!prod) return;
    const price = priceFor(prod, customerId);
    setCart(c => {
      const existing = c.find(i => i.productId === prod.id);
      if (existing) return c.map(i => i.productId === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { productId: prod.id, name: prod.name, qty: 1, price, maxStock: prod.stock }];
    });
  };
  const addItem = () => addProductToCart(products.find(p => p.id === pick));
  const handleBarcodeEnter = (e) => {
    if (e.key !== "Enter") return;
    const code = barcodeInput.trim();
    setBarcodeInput("");
    if (!code) return;
    const prod = products.find(p => p.barcode && p.barcode === code);
    if (prod) { addProductToCart(prod); setErr(""); }
    else setErr(`مفيش منتج بالباركود: ${code}`);
  };
  const updateQty = (pid, qty) => setCart(c => c.map(i => i.productId === pid ? { ...i, qty: Number(qty) } : i));
  const removeItem = (pid) => setCart(c => c.filter(i => i.productId !== pid));

  const checkout = async () => {
    if (cart.length === 0 || !customerId) return;
    setBusy(true); setErr(""); setMsg("");
    try {
      const paidAmt = Number(paid) || 0;
      const saleId = await rpc("create_sale", session.token, {
        p_customer_id: customerId,
        p_items: cart.map(({ productId, qty, price }) => ({ productId, qty, price })),
        p_total: total,
        p_paid: paidAmt,
      });
      setSessionTotal(t => t + total);
      setSessionCount(c => c + 1);
      setMsg("تم تسجيل الفاتورة بنجاح ✅");
      setReceipt({
        id: saleId, date: today(), customerName: customers.find(c => c.id === customerId)?.name || "-",
        items: cart, total, paid: paidAmt,
      });
      setCart([]); setPaid("");
      loadAll();
      setTimeout(() => setMsg(""), 3000);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", background: "#f3f3f5", minHeight: "100vh" }}>
      <header style={{ background: "#111115", color: "#fff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>نقطة بيع — {session.email}</div>
        <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #444", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
          <LogOut size={14} /> خروج
        </button>
      </header>

      <div style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <StatCard label="عدد فواتير الجلسة" value={sessionCount} />
          <StatCard label="إجمالي مبيعات الجلسة" value={fmt(sessionTotal)} color="#1a7f37" />
        </div>

        {msg && <div style={{ background: "#e9f9ee", color: "#1a7f37", padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontWeight: 700, fontSize: 13.5 }}>{msg}</div>}
        {err && <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13.5 }}>{err}</div>}

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <SectionTitle>إضافة أصناف</SectionTitle>
          <div style={{ marginBottom: 12 }}>
            <Field label="امسح الباركود">
              <Input autoFocus value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleBarcodeEnter} placeholder="وجّه السكانر هنا وامسح الكود..." style={{ borderColor: ACCENT }} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Select value={pick} onChange={e => setPick(e.target.value)}>
              <option value="">أو اختر منتج يدويًا...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} — متاح {p.stock}</option>)}
            </Select>
            <PrimaryBtn onClick={addItem}><Plus size={15} /> إضافة</PrimaryBtn>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>الصنف</Th><Th>الكمية</Th><Th>السعر</Th><Th>الإجمالي</Th><Th></Th></tr></thead>
            <tbody>
              {cart.map(i => (
                <tr key={i.productId}>
                  <Td>{i.name}</Td>
                  <Td><Input type="number" min="1" value={i.qty} onChange={e => updateQty(i.productId, e.target.value)} style={{ width: 70 }} /></Td>
                  <Td>{fmt(i.price)}</Td>
                  <Td style={{ fontWeight: 700 }}>{fmt(i.qty * i.price)}</Td>
                  <Td><GhostBtn onClick={() => removeItem(i.productId)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn></Td>
                </tr>
              ))}
              {cart.length === 0 && <EmptyRow colSpan={5} text="السلة فارغة" />}
            </tbody>
          </table>
        </Card>

        <Card style={{ padding: 16 }}>
          <SectionTitle>إتمام الفاتورة</SectionTitle>
          <Field label="العميل">
            <Select value={customerId} onChange={e => setCustomerId(e.target.value)}>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.type === "مخزن" ? " (مخزن)" : ""}</option>)}
            </Select>
          </Field>
          {customers.find(c => c.id === customerId)?.type === "مخزن" && (
            <div style={{ fontSize: 12, color: "#b8860b", marginTop: 6 }}>سيتم استخدام سعر المخازن تلقائيًا للأصناف المتاح لها سعر جملة.</div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0 6px", fontSize: 15 }}>
            <span>الإجمالي</span><strong>{fmt(total)} ج</strong>
          </div>
          <Field label="المبلغ المدفوع"><Input type="number" value={paid} onChange={e => setPaid(e.target.value)} placeholder={String(total)} /></Field>
          <PrimaryBtn onClick={checkout} style={{ justifyContent: "center", width: "100%", marginTop: 12 }} disabled={busy}>
            <Save size={15} /> {busy ? "جارِ الحفظ..." : "إتمام البيع"}
          </PrimaryBtn>
        </Card>
      </div>
      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

// ============================================================
// ADMIN APP
// ============================================================
const NAV_SECTIONS = [
  { label: null, items: [{ key: "home", label: "الرئيسية", icon: Home }] },
  { label: "المبيعات", items: [
    { key: "pos", label: "نقطة البيع (POS)", icon: ShoppingCart },
    { key: "invoices", label: "سجل الفواتير", icon: FileText },
    { key: "customers", label: "العملاء", icon: Users },
  ]},
  { label: "العمليات", items: [
    { key: "products", label: "المنتجات والمخزون", icon: Boxes },
    { key: "track", label: "تتبع المنتجات", icon: MapPin },
    { key: "purchases", label: "مشتريات", icon: ShoppingBag },
    { key: "suppliers", label: "الموردين", icon: Truck },
    { key: "cutting", label: "متابعة القصات", icon: Scissors },
    { key: "shipping", label: "متابعة الشحن", icon: PackageCheck },
    { key: "shippers", label: "شركات الشحن", icon: Building2 },
  ]},
  { label: "المالية والإدارة", items: [
    { key: "treasury", label: "الخزينة والحسابات", icon: Coins },
    { key: "expenses", label: "المصروفات والمسحوبات", icon: Wallet },
    { key: "reports", label: "التقارير", icon: PieChart },
    { key: "salaries", label: "الرواتب", icon: Wallet },
    { key: "settlement", label: "تصفية صاحب المشروع", icon: Coins },
    { key: "settings", label: "الإعدادات", icon: Settings },
  ]},
];

function AdminApp({ session, onLogout }) {
  const [view, setView] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const loadAll = useCallback(async () => {
    try {
      const [products, customers, suppliers, sales, purchases, cutting, shipping, expenses, settings, shippers, employees, salaryPayments, settlements] = await Promise.all([
        list("products", session.token, "select=*&order=name.asc"),
        list("customers", session.token, "select=*&order=name.asc"),
        list("suppliers", session.token, "select=*&order=name.asc"),
        list("sales", session.token, "select=*&order=date.desc"),
        list("purchases", session.token, "select=*&order=date.desc"),
        list("cutting", session.token, "select=*&order=date.desc"),
        list("shipping", session.token, "select=*&order=date.desc"),
        list("expenses", session.token, "select=*&order=date.desc"),
        list("settings", session.token, "select=*"),
        list("shippers", session.token, "select=*&order=name.asc"),
        list("employees", session.token, "select=*&order=name.asc"),
        list("salary_payments", session.token, "select=*&order=date.desc"),
        list("settlements", session.token, "select=*&order=date.desc"),
      ]);
      setData({ products, customers, suppliers, sales, purchases, cutting, shipping, expenses, shippers, employees, salaryPayments, settlements, season: settings?.[0]?.season || "-" });
    } catch (e) { setErr(e.message); }
  }, [session.token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (err) return <CenterMsg>خطأ: {err}</CenterMsg>;
  if (!data) return <CenterMsg>جارِ التحميل...</CenterMsg>;

  const activeItem = NAV_SECTIONS.flatMap(s => s.items).find(i => i.key === view);
  const ctx = { session, data, reload: loadAll };

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", background: "#f3f3f5", minHeight: "100vh", color: "#1b1b1f" }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 268, background: "#111115", color: "#eee", flexShrink: 0, position: "fixed", top: 0, bottom: 0, right: 0, overflowY: "auto", zIndex: 40, boxShadow: "-2px 0 12px rgba(0,0,0,.2)" }} className="erp-sidebar">
          <div style={{ padding: "22px 18px 14px", textAlign: "center", borderBottom: "1px solid #24242a" }}>
            <img src={LOGO_DATA_URI} alt="4Brothers" style={{ width: 68, height: 68, margin: "0 auto 10px", borderRadius: 14, objectFit: "cover", border: `2px solid ${ACCENT}` }} />
            <div style={{ fontWeight: 700, fontSize: 14 }}>{session.email}</div>
            <div style={{ fontSize: 12, color: "#9a9aa2", marginTop: 2 }}>مدير عام</div>
          </div>
          <nav style={{ padding: "10px 10px 24px" }}>
            {NAV_SECTIONS.map((sec, si) => (
              <div key={si} style={{ marginTop: sec.label ? 14 : 4 }}>
                {sec.label && <div style={{ fontSize: 11, color: "#7b7b84", padding: "6px 10px", fontWeight: 600 }}>{sec.label}</div>}
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const activeStyle = view === item.key ? { background: "#fff", color: "#111", fontWeight: 700 } : { background: "transparent", color: "#e5e5e8" };
                  return (
                    <button key={item.key} onClick={() => { setView(item.key); setSidebarOpen(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14.5, marginBottom: 3, ...activeStyle }}>
                      <span>{item.label}</span><Icon size={17} />
                    </button>
                  );
                })}
              </div>
            ))}
            <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, marginTop: 16, background: "transparent", color: "#e06666" }}>
              <span>تسجيل خروج</span><LogOut size={16} />
            </button>
          </nav>
        </aside>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 30 }} />}
        <main style={{ flex: 1, marginRight: 268, minWidth: 0 }} className="erp-main">
          <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid #e6e6ea", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="erp-menu-btn" onClick={() => setSidebarOpen(v => !v)} style={{ display: "none", border: "none", background: "#f0f0f3", borderRadius: 8, padding: 8, cursor: "pointer" }}><Menu size={18} /></button>
              <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{activeItem?.label || ""}</h1>
            </div>
            <div style={{ fontSize: 13, background: "#fdf6e3", color: "#8a6d1a", border: `1px solid ${ACCENT}55`, padding: "6px 12px", borderRadius: 20, fontWeight: 600 }}>الموسم الحالي: {data.season}</div>
          </header>
          <div style={{ padding: 20 }}>
            {view === "home" && <HomeView {...ctx} setView={setView} />}
            {view === "pos" && <POSView {...ctx} />}
            {view === "invoices" && <InvoicesView {...ctx} />}
            {view === "customers" && <CustomersView {...ctx} />}
            {view === "products" && <ProductsView {...ctx} />}
            {view === "track" && <TrackView {...ctx} />}
            {view === "purchases" && <PurchasesView {...ctx} />}
            {view === "suppliers" && <SuppliersView {...ctx} />}
            {view === "cutting" && <CuttingView {...ctx} />}
            {view === "shipping" && <ShippingView {...ctx} />}
            {view === "shippers" && <ShippersView {...ctx} />}
            {view === "treasury" && <TreasuryView {...ctx} />}
            {view === "expenses" && <ExpensesView {...ctx} />}
            {view === "reports" && <ReportsView {...ctx} />}
            {view === "salaries" && <SalariesView {...ctx} />}
            {view === "settlement" && <SettlementView {...ctx} />}
            {view === "settings" && <SettingsView {...ctx} />}
          </div>
        </main>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .erp-sidebar { transform: translateX(100%); transition: transform .2s ease; }
          .erp-main { margin-right: 0 !important; }
          .erp-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}

// ================= shared UI =================
function Card({ children, style }) { return <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ecebef", boxShadow: "0 1px 3px rgba(0,0,0,.04)", ...style }}>{children}</div>; }
function StatCard({ label, value, sub, color }) {
  return <Card style={{ padding: 18, flex: "1 1 180px" }}>
    <div style={{ fontSize: 13, color: "#8a8a92", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color: color || "#1b1b1f" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "#a0a0a8", marginTop: 4 }}>{sub}</div>}
  </Card>;
}
function Th({ children }) { return <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 12.5, color: "#8a8a92", fontWeight: 700, borderBottom: "1px solid #eee" }}>{children}</th>; }
function Td({ children, style }) { return <td style={{ padding: "10px 12px", fontSize: 13.5, borderBottom: "1px solid #f2f2f4", ...style }}>{children}</td>; }
function PrimaryBtn({ children, onClick, style, type, disabled }) {
  return <button type={type || "button"} onClick={onClick} disabled={disabled} style={{ background: disabled ? "#666" : "#111115", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13.5, fontWeight: 700, cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, ...style }}>{children}</button>;
}
function GhostBtn({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: "#f2f2f5", color: "#333", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, ...style }}>{children}</button>;
}
function Input(props) { return <input {...props} style={{ width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid #e3e3e8", fontSize: 13.5, outline: "none", ...(props.style || {}) }} />; }
function Select(props) { return <select {...props} style={{ width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid #e3e3e8", fontSize: 13.5, outline: "none", background: "#fff", ...(props.style || {}) }} />; }
function EmptyRow({ colSpan, text }) { return <tr><td colSpan={colSpan} style={{ padding: 24, textAlign: "center", color: "#a0a0a8", fontSize: 13 }}>{text}</td></tr>; }
function SectionTitle({ children, action }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
    <h2 style={{ fontSize: 15.5, fontWeight: 800, margin: 0 }}>{children}</h2>{action}
  </div>;
}
function Modal({ children, onClose, title }) {
  return <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,12,.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 20, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ border: "none", background: "#f2f2f5", borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} /></button>
      </div>
      {children}
    </div>
  </div>;
}
function Field({ label, children }) {
  return <label style={{ display: "block", fontSize: 12.5, color: "#6c6c74", fontWeight: 600 }}>
    <div style={{ marginBottom: 4 }}>{label}</div>{children}
  </label>;
}
function ErrBanner({ err }) { if (!err) return null; return <div style={{ background: "#fdecea", color: "#c0392b", padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13.5 }}>{err}</div>; }

// ================= RECEIPT / PRINTABLE INVOICE =================
function ReceiptModal({ receipt, onClose }) {
  const ref = "INV-" + (receipt.id ? String(receipt.id).slice(0, 8).toUpperCase() : "");
  const remaining = receipt.total - receipt.paid;
  const doPrint = () => window.print();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,12,.6)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} className="receipt-overlay">
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, maxHeight: "92vh", overflowY: "auto" }}>
        <div id="print-area" style={{ padding: 24 }} dir="rtl">
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <img src={LOGO_DATA_URI} alt="4Brothers" style={{ width: 56, height: 56, borderRadius: 12, margin: "0 auto 8px" }} />
            <div style={{ fontWeight: 800, fontSize: 15 }}>مصنع 4Brothers</div>
            <div style={{ fontSize: 11, color: "#8a8a92" }}>فاتورة بيع</div>
          </div>
          <div style={{ fontSize: 12.5, marginBottom: 10, display: "flex", justifyContent: "space-between", color: "#555" }}>
            <span>{ref}</span><span>{receipt.date}</span>
          </div>
          <div style={{ fontSize: 13, marginBottom: 12 }}><strong>العميل:</strong> {receipt.customerName}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 12 }}>
            <thead><tr style={{ borderBottom: "1px solid #ddd" }}>
              <th style={{ textAlign: "right", padding: "6px 2px" }}>الصنف</th>
              <th style={{ textAlign: "center", padding: "6px 2px" }}>كمية</th>
              <th style={{ textAlign: "left", padding: "6px 2px" }}>سعر</th>
              <th style={{ textAlign: "left", padding: "6px 2px" }}>إجمالي</th>
            </tr></thead>
            <tbody>
              {receipt.items.map((i, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f2f2f4" }}>
                  <td style={{ padding: "6px 2px" }}>{i.name}</td>
                  <td style={{ padding: "6px 2px", textAlign: "center" }}>{i.qty}</td>
                  <td style={{ padding: "6px 2px", textAlign: "left" }}>{fmt(i.price)}</td>
                  <td style={{ padding: "6px 2px", textAlign: "left" }}>{fmt(i.qty * i.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: "1px dashed #ccc", paddingTop: 10, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15 }}><span>الإجمالي</span><span>{fmt(receipt.total)} ج</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>المدفوع</span><span>{fmt(receipt.paid)} ج</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, color: remaining > 0 ? "#c0392b" : "#1a7f37" }}><span>المتبقي</span><span>{fmt(remaining)} ج</span></div>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#a0a0a8" }}>شكرًا لتعاملكم معنا</div>
        </div>
        <div className="receipt-actions" style={{ display: "flex", gap: 8, padding: "0 24px 20px" }}>
          <PrimaryBtn onClick={doPrint} style={{ flex: 1, justifyContent: "center" }}>طباعة / حفظ PDF</PrimaryBtn>
          <GhostBtn onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>إغلاق</GhostBtn>
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; right: 0; width: 100%; }
          .receipt-actions { display: none !important; }
          .receipt-overlay { position: static !important; background: none !important; }
        }
      `}</style>
    </div>
  );
}

// ================= HOME =================
function HomeView({ data, setView }) {
  const totalSales = data.sales.reduce((a, s) => a + Number(s.total), 0);
  const totalPaid = data.sales.reduce((a, s) => a + Number(s.paid), 0);
  const totalPurchases = data.purchases.reduce((a, p) => a + Number(p.total), 0);
  const totalExpenses = data.expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const cash = totalPaid - data.purchases.reduce((a, p) => a + Number(p.paid || 0), 0) - totalExpenses;
  const lowStock = data.products.filter(p => Number(p.stock) <= 10);

  return <div>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
      <StatCard label="إجمالي المبيعات" value={fmt(totalSales)} sub="جنيه" color="#1a7f37" />
      <StatCard label="إجمالي المشتريات" value={fmt(totalPurchases)} sub="جنيه" color="#b8860b" />
      <StatCard label="المصروفات" value={fmt(totalExpenses)} sub="جنيه" color="#c0392b" />
      <StatCard label="رصيد الخزينة التقريبي" value={fmt(cash)} sub="جنيه" color="#1b1b1f" />
    </div>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      <Card style={{ padding: 18, flex: "2 1 380px" }}>
        <SectionTitle action={<GhostBtn onClick={() => setView("invoices")}>عرض الكل <ChevronLeft size={14} /></GhostBtn>}>آخر الفواتير</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>التاريخ</Th><Th>العميل</Th><Th>القيمة</Th><Th>الحالة</Th></tr></thead>
          <tbody>
            {data.sales.slice(0, 5).map(s => (
              <tr key={s.id}>
                <Td>{s.date}</Td>
                <Td>{data.customers.find(c => c.id === s.customer_id)?.name || "-"}</Td>
                <Td style={{ fontWeight: 700 }}>{fmt(s.total)}</Td>
                <Td><span style={{ color: s.status === "مدفوعة" ? "#1a7f37" : "#c0892b", fontWeight: 700 }}>{s.status}</span></Td>
              </tr>
            ))}
            {data.sales.length === 0 && <EmptyRow colSpan={4} text="لا توجد فواتير بعد" />}
          </tbody>
        </table>
      </Card>
      <Card style={{ padding: 18, flex: "1 1 240px" }}>
        <SectionTitle>تنبيهات المخزون</SectionTitle>
        {lowStock.length === 0 && <div style={{ fontSize: 13, color: "#8a8a92" }}>كل المنتجات بكميات جيدة</div>}
        {lowStock.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f2f2f4", fontSize: 13 }}>
            <AlertCircle size={15} color="#c0392b" /><span style={{ flex: 1 }}>{p.name}</span>
            <span style={{ fontWeight: 700, color: "#c0392b" }}>{p.stock} {p.unit}</span>
          </div>
        ))}
      </Card>
    </div>
  </div>;
}

// ================= PRODUCTS =================
function ProductsView({ session, data, reload }) {
  const [form, setForm] = useState(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const filtered = data.products.filter(p => p.name.includes(q) || (p.sku || "").includes(q));

  const save = async () => {
    setErr("");
    try {
      const payload = { name: form.name, sku: form.sku, barcode: form.barcode || null, category: form.category, cost: Number(form.cost), price: Number(form.price), wholesale_price: form.wholesale_price ? Number(form.wholesale_price) : null, stock: Number(form.stock), unit: form.unit };
      if (form.id) await update("products", session.token, form.id, payload);
      else await insert("products", session.token, payload);
      setForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { try { await remove("products", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setForm({ name: "", sku: "", barcode: "", category: "", cost: "", price: "", wholesale_price: "", stock: "", unit: "قطعة" })}><Plus size={15} /> منتج جديد</PrimaryBtn>}>المنتجات والمخزون</SectionTitle>
    <ErrBanner err={err} />
    <div style={{ marginBottom: 12, maxWidth: 320 }}>
      <div style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", right: 10, top: 11, color: "#9a9aa2" }} />
        <Input placeholder="بحث بالاسم أو الكود..." value={q} onChange={e => setQ(e.target.value)} style={{ paddingRight: 32 }} />
      </div>
    </div>
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
        <thead><tr><Th>الاسم</Th><Th>الكود</Th><Th>الفئة</Th><Th>التكلفة</Th><Th>سعر البيع</Th><Th>سعر المخازن</Th><Th>المخزون</Th><Th></Th></tr></thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id}>
              <Td style={{ fontWeight: 600 }}>{p.name}</Td><Td>{p.sku}</Td><Td>{p.category}</Td>
              <Td>{fmt(p.cost)}</Td><Td>{fmt(p.price)}</Td><Td>{p.wholesale_price ? fmt(p.wholesale_price) : "—"}</Td>
              <Td><span style={{ color: p.stock <= 10 ? "#c0392b" : "#1a7f37", fontWeight: 700 }}>{p.stock} {p.unit}</span></Td>
              <Td><div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => setForm({ ...p, wholesale_price: p.wholesale_price || "" })}><Edit2 size={13} /></GhostBtn>
                <GhostBtn onClick={() => del(p.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn>
              </div></Td>
            </tr>
          ))}
          {filtered.length === 0 && <EmptyRow colSpan={8} text="لا توجد منتجات" />}
        </tbody>
      </table>
    </Card>
    {form && <Modal onClose={() => setForm(null)} title={form.id ? "تعديل منتج" : "منتج جديد"}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="اسم المنتج"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="الكود (SKU)"><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></Field>
        <Field label="الباركود"><Input value={form.barcode || ""} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="امسحه بالسكانر أو اكتبه يدويًا" /></Field>
        <Field label="الفئة"><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="التكلفة"><Input type="number" required value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></Field>
          <Field label="سعر البيع"><Input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></Field>
        </div>
        <Field label="سعر البيع للمخازن (اختياري)"><Input type="number" value={form.wholesale_price || ""} onChange={e => setForm({ ...form, wholesale_price: e.target.value })} placeholder="يُستخدم تلقائيًا مع عملاء نوعهم مخزن" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="الكمية بالمخزون"><Input type="number" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></Field>
          <Field label="الوحدة"><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></Field>
        </div>
        <PrimaryBtn onClick={save} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

// ================= POS (admin) =================
function POSView({ session, data, reload }) {
  const [customerId, setCustomerId] = useState(data.customers[0]?.id || "");
  const [cart, setCart] = useState([]);
  const [pick, setPick] = useState("");
  const [paid, setPaid] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [receipt, setReceipt] = useState(null);
  const total = cart.reduce((a, i) => a + i.qty * i.price, 0);

  const priceFor = (prod, custId) => {
    const cust = data.customers.find(c => c.id === custId);
    if (cust && cust.type === "مخزن" && prod.wholesale_price) return Number(prod.wholesale_price);
    return Number(prod.price);
  };

  useEffect(() => {
    setCart(c => c.map(i => {
      const prod = data.products.find(p => p.id === i.productId);
      return prod ? { ...i, price: priceFor(prod, customerId) } : i;
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const addProductToCart = (prod) => {
    if (!prod) return;
    const price = priceFor(prod, customerId);
    setCart(c => {
      const existing = c.find(i => i.productId === prod.id);
      if (existing) return c.map(i => i.productId === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { productId: prod.id, name: prod.name, qty: 1, price }];
    });
  };
  const addItem = () => addProductToCart(data.products.find(p => p.id === pick));
  const handleBarcodeEnter = (e) => {
    if (e.key !== "Enter") return;
    const code = barcodeInput.trim();
    setBarcodeInput("");
    if (!code) return;
    const prod = data.products.find(p => p.barcode && p.barcode === code);
    if (prod) { addProductToCart(prod); setErr(""); }
    else setErr(`مفيش منتج بالباركود: ${code}`);
  };
  const updateQty = (pid, qty) => setCart(c => c.map(i => i.productId === pid ? { ...i, qty: Number(qty) } : i));
  const removeItem = (pid) => setCart(c => c.filter(i => i.productId !== pid));

  const checkout = async () => {
    if (cart.length === 0) return;
    setBusy(true); setErr("");
    try {
      const saleId = await rpc("create_sale", session.token, {
        p_customer_id: customerId,
        p_items: cart.map(({ productId, qty, price }) => ({ productId, qty, price })),
        p_total: total, p_paid: Number(paid) || 0,
      });
      setReceipt({
        id: saleId, date: today(), customerName: data.customers.find(c => c.id === customerId)?.name || "-",
        items: cart, total, paid: Number(paid) || 0,
      });
      setCart([]); setPaid(""); reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
    <ErrBanner err={err} />
    <Card style={{ padding: 16, flex: "2 1 380px" }}>
      <SectionTitle>إضافة أصناف</SectionTitle>
      <div style={{ marginBottom: 12 }}>
        <Field label="امسح الباركود">
          <Input autoFocus value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleBarcodeEnter} placeholder="وجّه السكانر هنا وامسح الكود..." style={{ borderColor: ACCENT }} />
        </Field>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Select value={pick} onChange={e => setPick(e.target.value)}>
          <option value="">أو اختر منتج يدويًا...</option>
          {data.products.map(p => <option key={p.id} value={p.id}>{p.name} — متاح {p.stock}</option>)}
        </Select>
        <PrimaryBtn onClick={addItem}><Plus size={15} /> إضافة</PrimaryBtn>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><Th>الصنف</Th><Th>الكمية</Th><Th>السعر</Th><Th>الإجمالي</Th><Th></Th></tr></thead>
        <tbody>
          {cart.map(i => (
            <tr key={i.productId}>
              <Td>{i.name}</Td>
              <Td><Input type="number" min="1" value={i.qty} onChange={e => updateQty(i.productId, e.target.value)} style={{ width: 70 }} /></Td>
              <Td>{fmt(i.price)}</Td><Td style={{ fontWeight: 700 }}>{fmt(i.qty * i.price)}</Td>
              <Td><GhostBtn onClick={() => removeItem(i.productId)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn></Td>
            </tr>
          ))}
          {cart.length === 0 && <EmptyRow colSpan={5} text="السلة فارغة" />}
        </tbody>
      </table>
    </Card>
    <Card style={{ padding: 16, flex: "1 1 260px", alignSelf: "flex-start" }}>
      <SectionTitle>الفاتورة</SectionTitle>
      <Field label="العميل"><Select value={customerId} onChange={e => setCustomerId(e.target.value)}>
        {data.customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.type === "مخزن" ? " (مخزن)" : ""}</option>)}
      </Select></Field>
      {data.customers.find(c => c.id === customerId)?.type === "مخزن" && (
        <div style={{ fontSize: 12, color: "#b8860b", marginTop: 6 }}>سيتم استخدام سعر المخازن تلقائيًا للأصناف المتاح لها سعر جملة.</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0 6px", fontSize: 15 }}><span>الإجمالي</span><strong>{fmt(total)} ج</strong></div>
      <Field label="المبلغ المدفوع"><Input type="number" value={paid} onChange={e => setPaid(e.target.value)} placeholder={String(total)} /></Field>
      <PrimaryBtn onClick={checkout} disabled={busy} style={{ justifyContent: "center", width: "100%", marginTop: 12 }}><Save size={15} /> {busy ? "جارِ الحفظ..." : "إتمام البيع"}</PrimaryBtn>
    </Card>
    {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
  </div>;
}

// ================= INVOICES =================
function InvoicesView({ data }) {
  return <Card style={{ overflow: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
      <thead><tr><Th>التاريخ</Th><Th>العميل</Th><Th>عدد الأصناف</Th><Th>الإجمالي</Th><Th>المدفوع</Th><Th>الحالة</Th></tr></thead>
      <tbody>
        {data.sales.map(s => (
          <tr key={s.id}>
            <Td>{s.date}</Td><Td>{data.customers.find(c => c.id === s.customer_id)?.name || "-"}</Td>
            <Td>{(s.items || []).length}</Td><Td style={{ fontWeight: 700 }}>{fmt(s.total)}</Td><Td>{fmt(s.paid)}</Td>
            <Td><span style={{ color: s.status === "مدفوعة" ? "#1a7f37" : s.status === "جزئي" ? "#c0892b" : "#c0392b", fontWeight: 700 }}>{s.status}</span></Td>
          </tr>
        ))}
        {data.sales.length === 0 && <EmptyRow colSpan={6} text="لا توجد فواتير بعد" />}
      </tbody>
    </table>
  </Card>;
}

// ================= CUSTOMERS =================
function CustomersView({ session, data, reload }) {
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    try {
      const payload = { name: form.name, phone: form.phone, address: form.address, type: form.type || "عادي" };
      if (form.id) await update("customers", session.token, form.id, payload);
      else await insert("customers", session.token, payload);
      setForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { try { await remove("customers", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setForm({ name: "", phone: "", address: "", type: "عادي" })}><Plus size={15} /> عميل جديد</PrimaryBtn>}>العملاء</SectionTitle>
    <ErrBanner err={err} />
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
        <thead><tr><Th>الاسم</Th><Th>النوع</Th><Th>الهاتف</Th><Th>العنوان</Th><Th>إجمالي المشتريات</Th><Th></Th></tr></thead>
        <tbody>
          {data.customers.map(c => {
            const totalBuy = data.sales.filter(s => s.customer_id === c.id).reduce((a, s) => a + Number(s.total), 0);
            return <tr key={c.id}>
              <Td style={{ fontWeight: 600 }}>{c.name}</Td>
              <Td><span style={{ color: c.type === "مخزن" ? "#b8860b" : "#8a8a92", fontWeight: 700 }}>{c.type || "عادي"}</span></Td>
              <Td>{c.phone}</Td><Td>{c.address}</Td><Td>{fmt(totalBuy)}</Td>
              <Td><div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => setForm({ ...c, type: c.type || "عادي" })}><Edit2 size={13} /></GhostBtn>
                <GhostBtn onClick={() => del(c.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn>
              </div></Td>
            </tr>;
          })}
          {data.customers.length === 0 && <EmptyRow colSpan={6} text="لا يوجد عملاء" />}
        </tbody>
      </table>
    </Card>
    {form && <Modal onClose={() => setForm(null)} title={form.id ? "تعديل عميل" : "عميل جديد"}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="الاسم"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="الهاتف"><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="العنوان"><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="نوع العميل">
          <Select value={form.type || "عادي"} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="عادي">عادي</option>
            <option value="مخزن">مخزن (سعر جملة)</option>
          </Select>
        </Field>
        <PrimaryBtn onClick={save} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

// ================= SUPPLIERS =================
function SuppliersView({ session, data, reload }) {
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.id) await update("suppliers", session.token, form.id, payload);
      else await insert("suppliers", session.token, payload);
      setForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { try { await remove("suppliers", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setForm({ name: "", phone: "" })}><Plus size={15} /> مورد جديد</PrimaryBtn>}>الموردين</SectionTitle>
    <ErrBanner err={err} />
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead><tr><Th>الاسم</Th><Th>الهاتف</Th><Th>إجمالي المشتريات منه</Th><Th></Th></tr></thead>
        <tbody>
          {data.suppliers.map(s => {
            const totalBuy = data.purchases.filter(p => p.supplier_id === s.id).reduce((a, p) => a + Number(p.total), 0);
            return <tr key={s.id}>
              <Td style={{ fontWeight: 600 }}>{s.name}</Td><Td>{s.phone}</Td><Td>{fmt(totalBuy)}</Td>
              <Td><div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => setForm(s)}><Edit2 size={13} /></GhostBtn>
                <GhostBtn onClick={() => del(s.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn>
              </div></Td>
            </tr>;
          })}
          {data.suppliers.length === 0 && <EmptyRow colSpan={4} text="لا يوجد موردين" />}
        </tbody>
      </table>
    </Card>
    {form && <Modal onClose={() => setForm(null)} title={form.id ? "تعديل مورد" : "مورد جديد"}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="الاسم"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="الهاتف"><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
        <PrimaryBtn onClick={save} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

// ================= PURCHASES =================
function PurchasesView({ session, data, reload }) {
  const [supplierId, setSupplierId] = useState(data.suppliers[0]?.id || "");
  const [pick, setPick] = useState("");
  const [cart, setCart] = useState([]);
  const [paid, setPaid] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const total = cart.reduce((a, i) => a + i.qty * i.cost, 0);

  const addItem = () => {
    const prod = data.products.find(p => p.id === pick);
    if (!prod) return;
    setCart(c => {
      const existing = c.find(i => i.productId === prod.id);
      if (existing) return c.map(i => i.productId === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { productId: prod.id, name: prod.name, qty: 1, cost: prod.cost }];
    });
  };
  const updateQty = (pid, qty) => setCart(c => c.map(i => i.productId === pid ? { ...i, qty: Number(qty) } : i));
  const removeItem = (pid) => setCart(c => c.filter(i => i.productId !== pid));

  const confirmPurchase = async () => {
    if (cart.length === 0 || !supplierId) return;
    setBusy(true); setErr("");
    try {
      for (const item of cart) {
        const prod = data.products.find(p => p.id === item.productId);
        await update("products", session.token, item.productId, { stock: Number(prod.stock) + item.qty });
      }
      await insert("purchases", session.token, {
        supplier_id: supplierId,
        items: cart.map(({ productId, qty, cost }) => ({ productId, qty, cost })),
        total, paid: Number(paid) || 0,
      });
      setCart([]); setPaid(""); reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
    <ErrBanner err={err} />
    <Card style={{ padding: 16, flex: "2 1 380px" }}>
      <SectionTitle>فاتورة شراء جديدة</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Select value={pick} onChange={e => setPick(e.target.value)}>
          <option value="">اختر منتج...</option>
          {data.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <PrimaryBtn onClick={addItem}><Plus size={15} /> إضافة</PrimaryBtn>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><Th>الصنف</Th><Th>الكمية</Th><Th>التكلفة</Th><Th>الإجمالي</Th><Th></Th></tr></thead>
        <tbody>
          {cart.map(i => (
            <tr key={i.productId}>
              <Td>{i.name}</Td>
              <Td><Input type="number" min="1" value={i.qty} onChange={e => updateQty(i.productId, e.target.value)} style={{ width: 70 }} /></Td>
              <Td>{fmt(i.cost)}</Td><Td style={{ fontWeight: 700 }}>{fmt(i.qty * i.cost)}</Td>
              <Td><GhostBtn onClick={() => removeItem(i.productId)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn></Td>
            </tr>
          ))}
          {cart.length === 0 && <EmptyRow colSpan={5} text="لم تتم إضافة أصناف" />}
        </tbody>
      </table>
    </Card>
    <Card style={{ padding: 16, flex: "1 1 260px", alignSelf: "flex-start" }}>
      <SectionTitle>بيانات المورد</SectionTitle>
      <Field label="المورد"><Select value={supplierId} onChange={e => setSupplierId(e.target.value)}>
        <option value="">اختر مورد...</option>
        {data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </Select></Field>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0 6px", fontSize: 15 }}><span>الإجمالي</span><strong>{fmt(total)} ج</strong></div>
      <Field label="المدفوع للمورد"><Input type="number" value={paid} onChange={e => setPaid(e.target.value)} /></Field>
      <PrimaryBtn onClick={confirmPurchase} disabled={busy} style={{ justifyContent: "center", width: "100%", marginTop: 12 }}><Save size={15} /> {busy ? "جارِ الحفظ..." : "تأكيد الشراء"}</PrimaryBtn>
    </Card>
    <Card style={{ padding: 16, flex: "1 1 100%", overflow: "auto" }}>
      <SectionTitle>سجل المشتريات</SectionTitle>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead><tr><Th>التاريخ</Th><Th>المورد</Th><Th>الإجمالي</Th><Th>المدفوع</Th></tr></thead>
        <tbody>
          {data.purchases.map(p => (
            <tr key={p.id}><Td>{p.date}</Td><Td>{data.suppliers.find(s => s.id === p.supplier_id)?.name || "-"}</Td>
              <Td style={{ fontWeight: 700 }}>{fmt(p.total)}</Td><Td>{fmt(p.paid)}</Td></tr>
          ))}
          {data.purchases.length === 0 && <EmptyRow colSpan={4} text="لا توجد مشتريات بعد" />}
        </tbody>
      </table>
    </Card>
  </div>;
}

// ================= TRACK =================
function TrackView({ data }) {
  return <Card style={{ overflow: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
      <thead><tr><Th>المنتج</Th><Th>الكود</Th><Th>الرصيد الحالي</Th><Th>مباع (كل الفترات)</Th><Th>مشترى (كل الفترات)</Th></tr></thead>
      <tbody>
        {data.products.map(p => {
          const sold = data.sales.flatMap(s => s.items || []).filter(i => i.productId === p.id).reduce((a, i) => a + Number(i.qty), 0);
          const bought = data.purchases.flatMap(pu => pu.items || []).filter(i => i.productId === p.id).reduce((a, i) => a + Number(i.qty), 0);
          return <tr key={p.id}>
            <Td style={{ fontWeight: 600 }}>{p.name}</Td><Td>{p.sku}</Td>
            <Td><span style={{ fontWeight: 700, color: p.stock <= 10 ? "#c0392b" : "#1a7f37" }}>{p.stock} {p.unit}</span></Td>
            <Td>{sold}</Td><Td>{bought}</Td>
          </tr>;
        })}
        {data.products.length === 0 && <EmptyRow colSpan={5} text="لا توجد منتجات" />}
      </tbody>
    </table>
  </Card>;
}

// ================= CUTTING =================
function CuttingView({ session, data, reload }) {
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const statusColor = { "لم يبدأ": "#8a8a92", "جاري القص": "#c0892b", "تم القص": "#1a7f37" };
  const save = async () => {
    setErr("");
    try {
      const payload = { date: form.date, order_name: form.orderName, fabric_qty: Number(form.fabricQty) || null, cut_qty: Number(form.cutQty) || null, status: form.status, notes: form.notes };
      if (form.id) await update("cutting", session.token, form.id, payload);
      else await insert("cutting", session.token, payload);
      setForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { try { await remove("cutting", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setForm({ date: today(), orderName: "", fabricQty: "", cutQty: "", status: "لم يبدأ", notes: "" })}><Plus size={15} /> أمر قص جديد</PrimaryBtn>}>متابعة القصات</SectionTitle>
    <ErrBanner err={err} />
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
        <thead><tr><Th>التاريخ</Th><Th>اسم الطلبية</Th><Th>كمية القماش</Th><Th>الكمية المقصوصة</Th><Th>الحالة</Th><Th></Th></tr></thead>
        <tbody>
          {data.cutting.map(c => (
            <tr key={c.id}>
              <Td>{c.date}</Td><Td style={{ fontWeight: 600 }}>{c.order_name}</Td><Td>{c.fabric_qty}</Td><Td>{c.cut_qty}</Td>
              <Td><span style={{ color: statusColor[c.status] || "#333", fontWeight: 700 }}>{c.status}</span></Td>
              <Td><div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => setForm({ id: c.id, date: c.date, orderName: c.order_name, fabricQty: c.fabric_qty, cutQty: c.cut_qty, status: c.status, notes: c.notes })}><Edit2 size={13} /></GhostBtn>
                <GhostBtn onClick={() => del(c.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn>
              </div></Td>
            </tr>
          ))}
          {data.cutting.length === 0 && <EmptyRow colSpan={6} text="لا توجد أوامر قص بعد" />}
        </tbody>
      </table>
    </Card>
    {form && <Modal onClose={() => setForm(null)} title={form.id ? "تعديل أمر قص" : "أمر قص جديد"}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="التاريخ"><Input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="اسم الطلبية"><Input required value={form.orderName} onChange={e => setForm({ ...form, orderName: e.target.value })} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="كمية القماش (متر)"><Input type="number" value={form.fabricQty} onChange={e => setForm({ ...form, fabricQty: e.target.value })} /></Field>
          <Field label="الكمية المقصوصة"><Input type="number" value={form.cutQty} onChange={e => setForm({ ...form, cutQty: e.target.value })} /></Field>
        </div>
        <Field label="الحالة"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option>لم يبدأ</option><option>جاري القص</option><option>تم القص</option>
        </Select></Field>
        <Field label="ملاحظات"><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
        <PrimaryBtn onClick={save} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

// ================= SHIPPING =================
function ShippingView({ session, data, reload }) {
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const statusColor = { "قيد التجهيز": "#8a8a92", "في الطريق": "#c0892b", "تم التسليم": "#1a7f37" };
  const save = async () => {
    setErr("");
    try {
      const payload = { date: form.date, customer_id: form.customerId, company: form.company, tracking_no: form.trackingNo, status: form.status };
      if (form.id) await update("shipping", session.token, form.id, payload);
      else await insert("shipping", session.token, payload);
      setForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { try { await remove("shipping", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setForm({ date: today(), customerId: data.customers[0]?.id || "", company: "", trackingNo: "", status: "قيد التجهيز" })}><Plus size={15} /> شحنة جديدة</PrimaryBtn>}>متابعة الشحن</SectionTitle>
    <ErrBanner err={err} />
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
        <thead><tr><Th>التاريخ</Th><Th>العميل</Th><Th>شركة الشحن</Th><Th>رقم التتبع</Th><Th>الحالة</Th><Th></Th></tr></thead>
        <tbody>
          {data.shipping.map(s => (
            <tr key={s.id}>
              <Td>{s.date}</Td><Td>{data.customers.find(c => c.id === s.customer_id)?.name || "-"}</Td><Td>{s.company}</Td><Td>{s.tracking_no}</Td>
              <Td><span style={{ color: statusColor[s.status] || "#333", fontWeight: 700 }}>{s.status}</span></Td>
              <Td><div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => setForm({ id: s.id, date: s.date, customerId: s.customer_id, company: s.company, trackingNo: s.tracking_no, status: s.status })}><Edit2 size={13} /></GhostBtn>
                <GhostBtn onClick={() => del(s.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn>
              </div></Td>
            </tr>
          ))}
          {data.shipping.length === 0 && <EmptyRow colSpan={6} text="لا توجد شحنات بعد" />}
        </tbody>
      </table>
    </Card>
    {form && <Modal onClose={() => setForm(null)} title={form.id ? "تعديل شحنة" : "شحنة جديدة"}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="التاريخ"><Input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="العميل"><Select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
          {data.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select></Field>
        <Field label="شركة الشحن">
          {(data.shippers && data.shippers.length > 0) ? (
            <Select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}>
              <option value="">اختر شركة شحن...</option>
              {data.shippers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </Select>
          ) : (
            <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="أضف شركات شحن أولًا من قسم شركات الشحن" />
          )}
        </Field>
        <Field label="رقم التتبع"><Input value={form.trackingNo} onChange={e => setForm({ ...form, trackingNo: e.target.value })} /></Field>
        <Field label="الحالة"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option>قيد التجهيز</option><option>في الطريق</option><option>تم التسليم</option>
        </Select></Field>
        <PrimaryBtn onClick={save} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

function ShippersView({ session, data, reload }) {
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    try {
      const payload = { name: form.name, phone: form.phone, notes: form.notes };
      if (form.id) await update("shippers", session.token, form.id, payload);
      else await insert("shippers", session.token, payload);
      setForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { try { await remove("shippers", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setForm({ name: "", phone: "", notes: "" })}><Plus size={15} /> شركة شحن جديدة</PrimaryBtn>}>شركات الشحن</SectionTitle>
    <ErrBanner err={err} />
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead><tr><Th>الاسم</Th><Th>رقم التواصل</Th><Th>ملاحظات (تسعيرة/مناطق)</Th><Th></Th></tr></thead>
        <tbody>
          {(data.shippers || []).map(s => (
            <tr key={s.id}>
              <Td style={{ fontWeight: 600 }}>{s.name}</Td><Td>{s.phone}</Td><Td>{s.notes}</Td>
              <Td><div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => setForm(s)}><Edit2 size={13} /></GhostBtn>
                <GhostBtn onClick={() => del(s.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn>
              </div></Td>
            </tr>
          ))}
          {(!data.shippers || data.shippers.length === 0) && <EmptyRow colSpan={4} text="لا توجد شركات شحن مضافة بعد" />}
        </tbody>
      </table>
    </Card>
    {form && <Modal onClose={() => setForm(null)} title={form.id ? "تعديل شركة شحن" : "شركة شحن جديدة"}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="الاسم"><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="رقم التواصل"><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="ملاحظات (تسعيرة الشحن، المناطق المخدومة...)"><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
        <PrimaryBtn onClick={save} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

// ================= TREASURY =================
function TreasuryView({ data }) {
  const totalIn = data.sales.reduce((a, s) => a + Number(s.paid), 0);
  const totalOutPurchases = data.purchases.reduce((a, p) => a + Number(p.paid || 0), 0);
  const totalOutExpenses = data.expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const balance = totalIn - totalOutPurchases - totalOutExpenses;
  const movements = [
    ...data.sales.map(s => ({ date: s.date, desc: `تحصيل من ${data.customers.find(c => c.id === s.customer_id)?.name || "عميل"}`, amount: Number(s.paid), type: "in" })),
    ...data.purchases.map(p => ({ date: p.date, desc: `دفع لمورد ${data.suppliers.find(s => s.id === p.supplier_id)?.name || ""}`, amount: Number(p.paid), type: "out" })),
    ...data.expenses.map(e => ({ date: e.date, desc: e.type || "مصروف", amount: Number(e.amount || 0), type: "out" })),
  ].filter(m => m.amount).sort((a, b) => (a.date < b.date ? 1 : -1));

  return <div>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
      <StatCard label="إجمالي التحصيلات" value={fmt(totalIn)} color="#1a7f37" />
      <StatCard label="مدفوعات للموردين" value={fmt(totalOutPurchases)} color="#b8860b" />
      <StatCard label="المصروفات" value={fmt(totalOutExpenses)} color="#c0392b" />
      <StatCard label="رصيد الخزينة" value={fmt(balance)} color="#1b1b1f" />
    </div>
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead><tr><Th>التاريخ</Th><Th>البيان</Th><Th>الحركة</Th><Th>القيمة</Th></tr></thead>
        <tbody>
          {movements.map((m, i) => (
            <tr key={i}><Td>{m.date}</Td><Td>{m.desc}</Td>
              <Td><span style={{ color: m.type === "in" ? "#1a7f37" : "#c0392b", fontWeight: 700 }}>{m.type === "in" ? "قبض" : "صرف"}</span></Td>
              <Td style={{ fontWeight: 700 }}>{fmt(m.amount)}</Td></tr>
          ))}
          {movements.length === 0 && <EmptyRow colSpan={4} text="لا توجد حركات بعد" />}
        </tbody>
      </table>
    </Card>
  </div>;
}

// ================= EXPENSES =================
function ExpensesView({ session, data, reload }) {
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    try {
      const payload = { date: form.date, type: form.type, amount: Number(form.amount), notes: form.notes };
      if (form.id) await update("expenses", session.token, form.id, payload);
      else await insert("expenses", session.token, payload);
      setForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { try { await remove("expenses", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setForm({ date: today(), type: "", amount: "", notes: "" })}><Plus size={15} /> مصروف جديد</PrimaryBtn>}>المصروفات والمسحوبات</SectionTitle>
    <ErrBanner err={err} />
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead><tr><Th>التاريخ</Th><Th>النوع</Th><Th>القيمة</Th><Th>ملاحظات</Th><Th></Th></tr></thead>
        <tbody>
          {data.expenses.map(x => (
            <tr key={x.id}>
              <Td>{x.date}</Td><Td>{x.type}</Td><Td style={{ fontWeight: 700, color: "#c0392b" }}>{fmt(x.amount)}</Td><Td>{x.notes}</Td>
              <Td><div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => setForm(x)}><Edit2 size={13} /></GhostBtn>
                <GhostBtn onClick={() => del(x.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn>
              </div></Td>
            </tr>
          ))}
          {data.expenses.length === 0 && <EmptyRow colSpan={5} text="لا توجد مصروفات بعد" />}
        </tbody>
      </table>
    </Card>
    {form && <Modal onClose={() => setForm(null)} title={form.id ? "تعديل مصروف" : "مصروف جديد"}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="التاريخ"><Input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="النوع"><Input required placeholder="إيجار / كهرباء / سحب شخصي..." value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} /></Field>
        <Field label="القيمة"><Input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="ملاحظات"><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
        <PrimaryBtn onClick={save} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

// ================= REPORTS =================
function ReportsView({ data }) {
  const bySales = data.products.map(p => {
    const qty = data.sales.flatMap(s => s.items || []).filter(i => i.productId === p.id).reduce((a, i) => a + Number(i.qty), 0);
    const revenue = data.sales.flatMap(s => s.items || []).filter(i => i.productId === p.id).reduce((a, i) => a + Number(i.qty) * Number(i.price), 0);
    return { ...p, qty, revenue };
  }).sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = data.sales.reduce((a, s) => a + Number(s.total), 0);
  const totalCost = data.sales.flatMap(s => s.items || []).reduce((a, i) => {
    const prod = data.products.find(p => p.id === i.productId);
    return a + (prod ? Number(prod.cost) * Number(i.qty) : 0);
  }, 0);
  const profit = totalRevenue - totalCost;

  return <div>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
      <StatCard label="إجمالي الإيرادات" value={fmt(totalRevenue)} color="#1a7f37" />
      <StatCard label="تكلفة البضاعة المباعة" value={fmt(totalCost)} color="#b8860b" />
      <StatCard label="إجمالي الربح التقريبي" value={fmt(profit)} color={profit >= 0 ? "#1a7f37" : "#c0392b"} />
    </div>
    <Card style={{ overflow: "auto" }}>
      <div style={{ padding: "14px 16px 0" }}><strong style={{ fontSize: 14.5 }}>الأصناف الأكثر مبيعًا</strong></div>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600, marginTop: 8 }}>
        <thead><tr><Th>المنتج</Th><Th>الكمية المباعة</Th><Th>الإيراد</Th></tr></thead>
        <tbody>
          {bySales.map(p => <tr key={p.id}><Td style={{ fontWeight: 600 }}>{p.name}</Td><Td>{p.qty}</Td><Td style={{ fontWeight: 700 }}>{fmt(p.revenue)}</Td></tr>)}
          {bySales.length === 0 && <EmptyRow colSpan={3} text="لا توجد بيانات مبيعات بعد" />}
        </tbody>
      </table>
    </Card>
  </div>;
}

// ================= SETTINGS =================
// ================= SALARIES =================
function SalariesView({ session, data, reload }) {
  const [empForm, setEmpForm] = useState(null);
  const [payForm, setPayForm] = useState(null);
  const [err, setErr] = useState("");

  const saveEmp = async () => {
    setErr("");
    try {
      const payload = { name: empForm.name, phone: empForm.phone, role: empForm.role, monthly_salary: Number(empForm.monthly_salary) || 0 };
      if (empForm.id) await update("employees", session.token, empForm.id, payload);
      else await insert("employees", session.token, payload);
      setEmpForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const delEmp = async (id) => { try { await remove("employees", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  const savePay = async () => {
    setErr("");
    try {
      const payload = { employee_id: payForm.employeeId, date: payForm.date, month: payForm.month, amount: Number(payForm.amount) || 0, notes: payForm.notes };
      await insert("salary_payments", session.token, payload);
      setPayForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const delPay = async (id) => { try { await remove("salary_payments", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  const employees = data.employees || [];
  const payments = data.salaryPayments || [];

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setEmpForm({ name: "", phone: "", role: "", monthly_salary: "" })}><Plus size={15} /> موظف جديد</PrimaryBtn>}>الرواتب</SectionTitle>
    <ErrBanner err={err} />
    <Card style={{ overflow: "auto", marginBottom: 16 }}>
      <div style={{ padding: "14px 16px 0" }}><strong style={{ fontSize: 14.5 }}>الموظفين</strong></div>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650, marginTop: 8 }}>
        <thead><tr><Th>الاسم</Th><Th>الوظيفة</Th><Th>الهاتف</Th><Th>الراتب الشهري</Th><Th></Th></tr></thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id}>
              <Td style={{ fontWeight: 600 }}>{e.name}</Td><Td>{e.role}</Td><Td>{e.phone}</Td><Td>{fmt(e.monthly_salary)}</Td>
              <Td><div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => setEmpForm(e)}><Edit2 size={13} /></GhostBtn>
                <GhostBtn onClick={() => delEmp(e.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn>
              </div></Td>
            </tr>
          ))}
          {employees.length === 0 && <EmptyRow colSpan={5} text="لا يوجد موظفين مضافين بعد" />}
        </tbody>
      </table>
    </Card>

    <Card style={{ overflow: "auto" }}>
      <div style={{ padding: "14px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 14.5 }}>سجل صرف الرواتب</strong>
        <PrimaryBtn onClick={() => setPayForm({ employeeId: employees[0]?.id || "", date: today(), month: "", amount: "", notes: "" })} style={{ margin: "10px 16px 0 0" }}><Plus size={15} /> صرف راتب</PrimaryBtn>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650, marginTop: 8 }}>
        <thead><tr><Th>التاريخ</Th><Th>الموظف</Th><Th>الشهر</Th><Th>القيمة</Th><Th>ملاحظات</Th><Th></Th></tr></thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <Td>{p.date}</Td><Td>{employees.find(e => e.id === p.employee_id)?.name || "-"}</Td><Td>{p.month}</Td>
              <Td style={{ fontWeight: 700 }}>{fmt(p.amount)}</Td><Td>{p.notes}</Td>
              <Td><GhostBtn onClick={() => delPay(p.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn></Td>
            </tr>
          ))}
          {payments.length === 0 && <EmptyRow colSpan={6} text="لا توجد مرتبات مصروفة بعد" />}
        </tbody>
      </table>
    </Card>

    {empForm && <Modal onClose={() => setEmpForm(null)} title={empForm.id ? "تعديل موظف" : "موظف جديد"}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="الاسم"><Input required value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} /></Field>
        <Field label="الوظيفة"><Input value={empForm.role} onChange={e => setEmpForm({ ...empForm, role: e.target.value })} /></Field>
        <Field label="الهاتف"><Input value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} /></Field>
        <Field label="الراتب الشهري"><Input type="number" value={empForm.monthly_salary} onChange={e => setEmpForm({ ...empForm, monthly_salary: e.target.value })} /></Field>
        <PrimaryBtn onClick={saveEmp} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}

    {payForm && <Modal onClose={() => setPayForm(null)} title="صرف راتب">
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="الموظف">
          <Select value={payForm.employeeId} onChange={e => setPayForm({ ...payForm, employeeId: e.target.value })}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
        </Field>
        <Field label="التاريخ"><Input type="date" required value={payForm.date} onChange={e => setPayForm({ ...payForm, date: e.target.value })} /></Field>
        <Field label="عن شهر"><Input placeholder="مثال: أغسطس 2026" value={payForm.month} onChange={e => setPayForm({ ...payForm, month: e.target.value })} /></Field>
        <Field label="القيمة"><Input type="number" required value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} /></Field>
        <Field label="ملاحظات"><Input value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} /></Field>
        <PrimaryBtn onClick={savePay} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

// ================= OWNER SETTLEMENT =================
function SettlementView({ session, data, reload }) {
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");

  const totalRevenue = data.sales.reduce((a, s) => a + Number(s.total), 0);
  const totalCost = data.sales.flatMap(s => s.items || []).reduce((a, i) => {
    const prod = data.products.find(p => p.id === i.productId);
    return a + (prod ? Number(prod.cost) * Number(i.qty) : 0);
  }, 0);
  const totalExpenses = data.expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalSalaries = (data.salaryPayments || []).reduce((a, p) => a + Number(p.amount || 0), 0);
  const netProfit = totalRevenue - totalCost - totalExpenses - totalSalaries;
  const settlements = data.settlements || [];
  const totalDistributed = settlements.reduce((a, s) => a + Number(s.amount || 0), 0);
  const remaining = netProfit - totalDistributed;

  const save = async () => {
    setErr("");
    try {
      await insert("settlements", session.token, { date: form.date, partner_name: form.partnerName, amount: Number(form.amount) || 0, notes: form.notes });
      setForm(null); reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { try { await remove("settlements", session.token, id); reload(); } catch (e) { setErr(e.message); } };

  return <div>
    <SectionTitle action={<PrimaryBtn onClick={() => setForm({ date: today(), partnerName: "", amount: "", notes: "" })}><Plus size={15} /> تسجيل تصفية</PrimaryBtn>}>تصفية صاحب المشروع</SectionTitle>
    <ErrBanner err={err} />
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
      <StatCard label="صافي الربح التقريبي (بعد المصروفات والرواتب)" value={fmt(netProfit)} color={netProfit >= 0 ? "#1a7f37" : "#c0392b"} />
      <StatCard label="إجمالي الموزّع على الشركاء" value={fmt(totalDistributed)} color="#b8860b" />
      <StatCard label="المتبقي غير موزّع" value={fmt(remaining)} color={remaining >= 0 ? "#1b1b1f" : "#c0392b"} />
    </div>
    <Card style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead><tr><Th>التاريخ</Th><Th>الشريك</Th><Th>القيمة</Th><Th>ملاحظات</Th><Th></Th></tr></thead>
        <tbody>
          {settlements.map(s => (
            <tr key={s.id}>
              <Td>{s.date}</Td><Td style={{ fontWeight: 600 }}>{s.partner_name}</Td><Td style={{ fontWeight: 700 }}>{fmt(s.amount)}</Td><Td>{s.notes}</Td>
              <Td><GhostBtn onClick={() => del(s.id)} style={{ color: "#c0392b" }}><Trash2 size={13} /></GhostBtn></Td>
            </tr>
          ))}
          {settlements.length === 0 && <EmptyRow colSpan={5} text="لا توجد عمليات تصفية مسجّلة بعد" />}
        </tbody>
      </table>
    </Card>
    {form && <Modal onClose={() => setForm(null)} title="تسجيل عملية تصفية">
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="التاريخ"><Input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="اسم الشريك"><Input required value={form.partnerName} onChange={e => setForm({ ...form, partnerName: e.target.value })} /></Field>
        <Field label="القيمة"><Input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="ملاحظات"><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
        <PrimaryBtn onClick={save} style={{ justifyContent: "center", marginTop: 6 }}><Save size={15} /> حفظ</PrimaryBtn>
      </div>
    </Modal>}
  </div>;
}

function SettingsView({ session, data, reload }) {
  const [season, setSeason] = useState(data.season);
  const [err, setErr] = useState("");
  const saveSeason = async () => {
    try { await update("settings", session.token, 1, { season }); reload(); } catch (e) { setErr(e.message); }
  };
  return <Card style={{ padding: 20, maxWidth: 420 }}>
    <SectionTitle>إعدادات عامة</SectionTitle>
    <ErrBanner err={err} />
    <Field label="الموسم الحالي"><Input value={season} onChange={e => setSeason(e.target.value)} /></Field>
    <PrimaryBtn style={{ marginTop: 12, justifyContent: "center" }} onClick={saveSeason}><Save size={15} /> حفظ التغييرات</PrimaryBtn>
  </Card>;
}
