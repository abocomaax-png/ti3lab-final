'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, writeBatch,
} from 'firebase/firestore';
import {
  ArrowLeft, Plus, Trash2, Loader2, AlertCircle, CheckCircle,
  Network, Terminal, Target, Globe, Tag, Shield, Edit2, X, Check,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;        // slug used as `track` field in Lab
  name: string;      // display name (English)
  nameAr: string;    // display name (Arabic)
  icon: string;      // icon key: network | terminal | target | globe | tag
  color: string;     // tailwind text-color class
  labCount?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { key: 'network',  Icon: Network,  label: 'Network'  },
  { key: 'terminal', Icon: Terminal, label: 'Terminal' },
  { key: 'target',   Icon: Target,   label: 'Target'   },
  { key: 'globe',    Icon: Globe,    label: 'Globe'    },
  { key: 'tag',      Icon: Tag,      label: 'Tag'      },
  { key: 'shield',   Icon: Shield,   label: 'Shield'   },
];

const COLOR_OPTIONS = [
  { key: 'text-blue-400',    label: 'Blue'   },
  { key: 'text-emerald-400', label: 'Green'  },
  { key: 'text-orange-400',  label: 'Orange' },
  { key: 'text-purple-400',  label: 'Purple' },
  { key: 'text-red-400',     label: 'Red'    },
  { key: 'text-amber-400',   label: 'Amber'  },
  { key: 'text-pink-400',    label: 'Pink'   },
  { key: 'text-cyan-400',    label: 'Cyan'   },
];

const ICON_MAP: Record<string, any> = {
  network: Network, terminal: Terminal, target: Target,
  globe: Globe, tag: Tag, shield: Shield,
};

// Default categories that match current Lab.track values
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'networking', name: 'Networking', nameAr: 'شبكات',    icon: 'network',  color: 'text-blue-400'    },
  { id: 'linux',      name: 'Linux',      nameAr: 'لينكس',    icon: 'terminal', color: 'text-emerald-400' },
  { id: 'pentesting', name: 'Pentesting', nameAr: 'اختبار اختراق', icon: 'target', color: 'text-orange-400' },
  { id: 'web',        name: 'Web',        nameAr: 'ويب',       icon: 'globe',    color: 'text-purple-400'  },
];

const EMPTY_FORM = { name: '', nameAr: '', icon: 'tag', color: 'text-blue-400' };

// ─── Helper ───────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [loading, setLoading]     = useState(true);
  const [isAdmin, setIsAdmin]     = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [message, setMessage]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add-form state
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // Edit-inline state
  const [editing, setEditing]     = useState<string | null>(null);
  const [editForm, setEditForm]   = useState(EMPTY_FORM);

  // Confirm-delete state
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const checkAdminStatus = async (email: string) => {
    try {
      const res = await fetch('/api/check-admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return (await res.json()).isAdmin;
    } catch { return false; }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const admin = await checkAdminStatus(u.email || '');
        setIsAdmin(admin);
        if (!admin) { router.push('/labs'); return; }
        await loadCategories();
      } else { router.push('/auth/signin'); }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadCategories = async () => {
    try {
      // Load from Firestore `categories` collection
      const snap = await getDocs(collection(db, 'categories'));
      let cats: Category[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));

      // If the collection is empty, seed with defaults
      if (cats.length === 0) {
        const batch = writeBatch(db);
        DEFAULT_CATEGORIES.forEach(c => {
          batch.set(doc(db, 'categories', c.id), {
            name: c.name, nameAr: c.nameAr, icon: c.icon, color: c.color,
          });
        });
        await batch.commit();
        cats = DEFAULT_CATEGORIES;
      }

      // Attach lab counts
      const labsSnap = await getDocs(collection(db, 'labs'));
      const countMap: Record<string, number> = {};
      labsSnap.docs.forEach(d => {
        const track = d.data().track as string;
        if (track) countMap[track] = (countMap[track] || 0) + 1;
      });
      cats = cats.map(c => ({ ...c, labCount: countMap[c.id] || 0 }));
      cats.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(cats);
    } catch (e) { console.error(e); }
  };

  // ── Add ───────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('الاسم الإنجليزي مطلوب'); return; }
    if (!form.nameAr.trim()) { setFormError('الاسم العربي مطلوب'); return; }
    const id = slugify(form.name);
    if (!id) { setFormError('اسم غير صالح'); return; }
    if (categories.some(c => c.id === id)) { setFormError(`الكاتيجوري "${id}" موجودة بالفعل`); return; }

    setSaving(true);
    try {
      await setDoc(doc(db, 'categories', id), {
        name: form.name.trim(), nameAr: form.nameAr.trim(),
        icon: form.icon, color: form.color,
      });
      setMessage({ type: 'success', text: `تم إضافة كاتيجوري "${form.name}" بنجاح` });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      await loadCategories();
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الإضافة' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setEditForm({ name: cat.name, nameAr: cat.nameAr, icon: cat.icon, color: cat.color });
  };

  const handleEdit = async (id: string) => {
    if (!editForm.name.trim() || !editForm.nameAr.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'categories', id), {
        name: editForm.name.trim(), nameAr: editForm.nameAr.trim(),
        icon: editForm.icon, color: editForm.color,
      });
      setMessage({ type: 'success', text: 'تم تحديث الكاتيجوري بنجاح' });
      setEditing(null);
      await loadCategories();
    } catch {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء التحديث' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (cat: Category) => {
    setDeleting(cat.id);
    try {
      await deleteDoc(doc(db, 'categories', cat.id));
      setMessage({ type: 'success', text: `تم حذف كاتيجوري "${cat.name}" بنجاح` });
      setConfirmDelete(null);
      await loadCategories();
    } catch {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحذف' });
    } finally {
      setDeleting(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const CategoryIcon = ({ iconKey, colorClass }: { iconKey: string; colorClass: string }) => {
    const Icon = ICON_MAP[iconKey] || Tag;
    return <Icon className={`w-5 h-5 ${colorClass}`} />;
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')}
              className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">إدارة الكاتيجوريز</h1>
              <p className="text-gray-600 text-xs mt-0.5">{categories.length} كاتيجوري</p>
            </div>
          </div>
          <button onClick={() => { setShowAdd(true); setFormError(''); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> إضافة كاتيجوري
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-3 p-3 rounded-lg mb-6 text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
              : 'bg-red-950/40 border-red-800 text-red-400'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Add Form */}
        {showAdd && (
          <div className="border border-gray-700 rounded-xl p-5 mb-6 bg-gray-900/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">إضافة كاتيجوري جديدة</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">الاسم (English) <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: Cloud Security"
                  className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">الاسم (عربي) <span className="text-red-400">*</span></label>
                <input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))}
                  placeholder="مثال: أمان السحابة"
                  className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500" />
              </div>
            </div>

            {form.name && (
              <p className="text-xs text-gray-600 mb-4">
                سيتم استخدام الـ ID: <span className="text-gray-400 font-mono">{slugify(form.name)}</span>
              </p>
            )}

            {/* Icon picker */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">الأيقونة</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(({ key, Icon, label }) => (
                  <button key={key} onClick={() => setForm(p => ({ ...p, icon: key }))}
                    title={label}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                      form.icon === key
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2">اللون</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(({ key, label }) => (
                  <button key={key} onClick={() => setForm(p => ({ ...p, color: key }))}
                    title={label}
                    className={`px-3 py-1 rounded-full border text-xs transition-all ${key} ${
                      form.color === key
                        ? 'border-current bg-current/10 font-semibold'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 mb-3">
                <AlertCircle className="w-3.5 h-3.5" /> {formError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                إلغاء
              </button>
              <button onClick={handleAdd} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                إضافة
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="border border-gray-800 rounded-xl overflow-hidden">
              {editing === cat.id ? (
                /* ── Edit row ── */
                <div className="p-4 bg-gray-900/30">
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                      className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500" />
                    <input value={editForm.nameAr} onChange={e => setEditForm(p => ({ ...p, nameAr: e.target.value }))}
                      className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500" />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {ICON_OPTIONS.map(({ key, Icon }) => (
                      <button key={key} onClick={() => setEditForm(p => ({ ...p, icon: key }))}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                          editForm.icon === key
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-gray-700 text-gray-500 hover:border-gray-500'
                        }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {COLOR_OPTIONS.map(({ key, label }) => (
                      <button key={key} onClick={() => setEditForm(p => ({ ...p, color: key }))}
                        className={`px-2.5 py-0.5 rounded-full border text-xs transition-all ${key} ${
                          editForm.color === key ? 'border-current bg-current/10 font-semibold' : 'border-gray-700 hover:border-gray-500'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(null)}
                      className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                      إلغاء
                    </button>
                    <button onClick={() => handleEdit(cat.id)} disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:opacity-90 disabled:opacity-50">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      حفظ
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Display row ── */
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg border border-gray-800 flex items-center justify-center bg-gray-900/50">
                      <CategoryIcon iconKey={cat.icon} colorClass={cat.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{cat.name}</p>
                        <span className="text-gray-600 text-xs">·</span>
                        <p className="text-sm text-gray-400">{cat.nameAr}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-xs text-gray-600 font-mono">{cat.id}</code>
                        <span className="text-gray-700 text-xs">·</span>
                        <span className="text-xs text-gray-600">{cat.labCount} لاب</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(cat)}
                      className="p-2 rounded-lg border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 transition-all"
                      title="تعديل">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDelete(cat.id)}
                      className="p-2 rounded-lg border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-800 transition-all"
                      title="حذف">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm delete banner */}
              {confirmDelete === cat.id && (
                <div className="border-t border-red-900/50 bg-red-950/20 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-400 font-medium">تأكيد الحذف</p>
                    {cat.labCount && cat.labCount > 0 ? (
                      <p className="text-xs text-red-500 mt-0.5">
                        ⚠️ هذه الكاتيجوري تحتوي على {cat.labCount} لاب — اللابات لن تُحذف لكنها لن تظهر في أي كاتيجوري
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-0.5">لا توجد لابات مرتبطة بهذه الكاتيجوري</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                      إلغاء
                    </button>
                    <button onClick={() => handleDelete(cat)} disabled={deleting === cat.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 text-white rounded-lg text-xs hover:opacity-90 disabled:opacity-50">
                      {deleting === cat.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Trash2 className="w-3 h-3" />}
                      حذف
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد كاتيجوريز بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
