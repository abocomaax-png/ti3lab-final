'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import {
  Save, ArrowLeft, Loader2, AlertCircle, CheckCircle,
  Lock, Unlock, Plus, Info, Upload, FileArchive, X,
} from 'lucide-react';

const TRACKS = [
  { id: 'networking', name: 'Networking' },
  { id: 'linux',      name: 'Linux'       },
  { id: 'pentesting', name: 'Pentesting'  },
  { id: 'web',        name: 'Web'         },
];

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

function deriveId(track: string, topic: string, name: string) {
  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return [track, slugify(topic), slugify(name)].filter(Boolean).join('-');
}

export default function AdminAddLabPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [message,      setMessage]      = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [idAvailable,  setIdAvailable]  = useState<boolean | null>(null);
  const [checkingId,   setCheckingId]   = useState(false);
  const [hints,        setHints]        = useState<string[]>(['']);
  const [labShortName, setLabShortName] = useState('');

  // File upload state
  const [selectedFile,   setSelectedFile]   = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedUrl,    setUploadedUrl]     = useState('');
  const [uploadError,    setUploadError]     = useState('');

  const [formData, setFormData] = useState({
    id:              '',
    title:           '',
    titleAr:         '',
    description:     '',
    descriptionAr:   '',
    difficulty:      'easy' as 'easy' | 'medium' | 'hard',
    track:           'web'  as 'networking' | 'linux' | 'pentesting' | 'web',
    topic:           '',
    topicAr:         '',
    flag:            '',
    points:          100,
    order:           1,
    isLocked:        true,
    setupInstructions: '',
  });

  // Auto-derive Lab ID
  useEffect(() => {
    const derived = deriveId(formData.track, formData.topic, labShortName);
    if (derived) {
      setFormData(prev => ({ ...prev, id: derived }));
      setIdAvailable(null);
    }
  }, [formData.track, formData.topic, labShortName]);

  const checkAdminStatus = async (email: string) => {
    try {
      const res = await fetch('/api/check-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return (await res.json()).isAdmin;
    } catch { return false; }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const admin = await checkAdminStatus(currentUser.email || '');
        setIsAdmin(admin);
        if (!admin) router.push('/labs');
      } else { router.push('/auth/signin'); }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const checkLabId = async () => {
    if (!formData.id) return;
    setCheckingId(true);
    try {
      const snap = await getDoc(doc(db, 'labs', formData.id));
      setIdAvailable(!snap.exists());
    } catch { setIdAvailable(null); }
    finally { setCheckingId(false); }
  };

  // ── File Handling ──────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/zip', 'application/x-zip-compressed', 'application/gzip', 'text/yaml', 'text/plain', ''];
    // accept .yml .yaml .zip .gz by extension if MIME is ambiguous
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['yml', 'yaml', 'zip', 'gz'].includes(ext || '')) {
      setUploadError('Only .yml / .yaml / .zip / .gz files are allowed.');
      return;
    }
    setUploadError('');
    setSelectedFile(file);
    setUploadedUrl('');
    setUploadProgress(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.id) return;
    setUploadProgress(0);
    setUploadError('');

    try {
      const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
      const GITHUB_OWNER = 'abocomaax-png';
      const GITHUB_REPO  = 'ti3lab-labs';

      // Convert file to base64 (safe for large files)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      setUploadProgress(30);

      const cleanName = selectedFile.name.replace(/\s+/g, '-').replace(/[()]/g, '');
      const filePath = `labs/${formData.id}/${cleanName}`;
      const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

      // Check if file already exists (to get its SHA for update)
      let sha: string | undefined;
      try {
        const checkRes = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
          },
        });
        if (checkRes.ok) {
          const existing = await checkRes.json();
          sha = existing.sha;
        }
      } catch {}

      setUploadProgress(60);

      const uploadRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add lab file: ${formData.id}`,
          content: base64,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.message || 'Upload failed');
      }

      setUploadProgress(90);

      const result = await uploadRes.json();
      const downloadUrl = result.content.download_url;

      setUploadedUrl(downloadUrl);
      setUploadProgress(null);

    } catch (err: any) {
      setUploadError(err.message || 'Upload failed — try again.');
      setUploadProgress(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadedUrl('');
    setUploadProgress(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const { id, title, titleAr, description, descriptionAr, track, topic, topicAr, flag } = formData;
    if (!id || !title || !titleAr || !description || !descriptionAr || !track || !topic || !topicAr || !flag) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    if (idAvailable === false) { setMessage({ type: 'error', text: 'Lab ID is already taken.' }); return; }
    if (!uploadedUrl) { setMessage({ type: 'error', text: 'Please upload the docker-compose / zip file first.' }); return; }

    setSubmitting(true);
    try {
      await setDoc(doc(db, 'labs', id), {
        ...formData,
        dockerFileUrl: uploadedUrl,
        hints:         hints.filter(h => h.trim()),
        solveCount:    0,
        createdAt:     Timestamp.now(),
      });
      setMessage({ type: 'success', text: 'Lab added successfully!' });
      setTimeout(() => router.push('/admin/labs/manage'), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save lab.' });
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );
  if (!isAdmin) return null;

  const inputCls = "w-full bg-black border border-gray-800 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-gray-600 transition-colors";

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>

        <h1 className="text-2xl font-bold text-white mb-8">Add Lab</h1>

        {message && (
          <div className={`mb-6 p-3.5 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/8 border border-red-500/20 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
          </div>
        )}

        <div className="space-y-5">

          {/* ── Identity ── */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identity</p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Track" required>
                <select value={formData.track} onChange={e => setFormData({ ...formData, track: e.target.value as any })} className={inputCls}>
                  {TRACKS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="Topic (EN)" required>
                <input type="text" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="SQL Injection" className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Topic (AR)" required>
                <input type="text" value={formData.topicAr} onChange={e => setFormData({ ...formData, topicAr: e.target.value })}
                  placeholder="حقن SQL" className={inputCls} />
              </Field>
              <Field label="Lab Short Name" required>
                <input type="text" value={labShortName} onChange={e => setLabShortName(e.target.value)}
                  placeholder="basic-login-bypass" className={inputCls} />
              </Field>
            </div>

            {/* Auto-generated ID */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500">Lab ID — auto-generated from track + topic + short name</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-primary font-mono bg-black/40 px-3 py-2 rounded border border-gray-800">
                  {formData.id || '...'}
                </code>
                <button onClick={checkLabId} disabled={!formData.id || checkingId}
                  className="px-3 py-2 text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors">
                  {checkingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
                </button>
              </div>
              {idAvailable === true  && <p className="text-emerald-400 text-xs mt-1.5">✓ Available</p>}
              {idAvailable === false && <p className="text-red-400 text-xs mt-1.5">✗ Already taken</p>}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title (EN)" required>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Title (AR)" required>
                <input type="text" value={formData.titleAr} onChange={e => setFormData({ ...formData, titleAr: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Description (EN)" required>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3} className={`${inputCls} resize-none`} />
              </Field>
              <Field label="Description (AR)" required>
                <textarea value={formData.descriptionAr} onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={3} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>

          {/* ── Lab File Upload ── */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lab File</p>
            <p className="text-xs text-gray-600">Upload the <code className="text-gray-400">docker-compose.yml</code> or a <code className="text-gray-400">.zip</code> containing the full lab. Stored in Firebase Storage under <code className="text-gray-400">labs/{'{'}labId{'}'}/</code></p>

            {/* Drop / select area */}
            {!selectedFile && !uploadedUrl && (
              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-800 rounded-xl p-8 cursor-pointer hover:border-gray-600 transition-colors group">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Click to select file</p>
                  <p className="text-xs text-gray-600 mt-0.5">.yml · .yaml · .zip · .gz</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".yml,.yaml,.zip,.gz" onChange={handleFileSelect} className="hidden" />
              </label>
            )}

            {/* Selected but not uploaded yet */}
            {selectedFile && !uploadedUrl && uploadProgress === null && (
              <div className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileArchive className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!formData.id && (
                    <p className="text-xs text-amber-400">Set Lab ID first</p>
                  )}
                  <button onClick={handleUpload} disabled={!formData.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40">
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                  <button onClick={clearFile} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Uploading {selectedFile?.name}...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Upload success */}
            {uploadedUrl && (
              <div className="flex items-center justify-between bg-emerald-500/6 border border-emerald-500/20 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-emerald-400 font-medium">File uploaded successfully</p>
                    <p className="text-xs text-emerald-400/50 font-mono truncate max-w-xs">{selectedFile?.name}</p>
                  </div>
                </div>
                <button onClick={clearFile} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
              </p>
            )}
          </div>

          {/* ── Setup Instructions ── */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Setup Instructions</p>
              <p className="text-xs text-gray-600 mt-1">Plain-text steps shown to the student on the lab page (e.g. how to run docker-compose, which port to hit, etc.)</p>
            </div>
            <textarea
              value={formData.setupInstructions}
              onChange={e => setFormData({ ...formData, setupInstructions: e.target.value })}
              rows={6}
              placeholder={`1. Make sure Docker is running\n2. Run: docker-compose up -d\n3. Open http://localhost:8080 in your browser\n4. Login with admin / admin123\n5. Find the flag and submit it below`}
              className={`${inputCls} resize-none font-mono text-xs leading-relaxed`}
            />
          </div>

          {/* ── Settings ── */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Difficulty">
                <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })} className={inputCls}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Field>
              <Field label="Points">
                <input type="number" value={formData.points} onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })} className={inputCls} />
              </Field>
              <Field label="Order">
                <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })} className={inputCls} />
              </Field>
            </div>
            <Field label="Flag" required>
              <input type="text" value={formData.flag} onChange={e => setFormData({ ...formData, flag: e.target.value })}
                placeholder="ti3lab{...}" className={`${inputCls} font-mono`} />
            </Field>
            <div className="flex items-center gap-3">
              <button onClick={() => setFormData({ ...formData, isLocked: !formData.isLocked })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  formData.isLocked
                    ? 'bg-red-500/8 border-red-500/20 text-red-400'
                    : 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400'
                }`}>
                {formData.isLocked ? <><Lock className="w-3.5 h-3.5" /> Locked</> : <><Unlock className="w-3.5 h-3.5" /> Unlocked</>}
              </button>
              <span className="text-gray-600 text-xs">Locked by default — unlock after the session</span>
            </div>
          </div>

          {/* ── Hints ── */}
          <div className="border border-gray-800 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hints</p>
            <div className="space-y-2">
              {hints.map((hint, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={hint} onChange={e => { const n = [...hints]; n[i] = e.target.value; setHints(n); }}
                    placeholder={`Hint ${i + 1}`} className={inputCls} />
                  {hints.length > 1 && (
                    <button onClick={() => setHints(hints.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 transition-colors px-2">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setHints([...hints, ''])} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1">
                <Plus className="w-3.5 h-3.5" /> Add Hint
              </button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submitting ? 'Saving...' : 'Add Lab'}
          </button>

        </div>
      </div>
    </div>
  );
}
