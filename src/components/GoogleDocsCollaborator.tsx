import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  PlusCircle,
  ArrowRight,
  LogOut,
  RefreshCw,
  Check,
  AlertTriangle,
  ExternalLink,
  Sliders,
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/docs');

export default function GoogleDocsCollaborator() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Docs operation state
  const [documentIdInput, setDocumentIdInput] = useState('');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [docData, setDocData] = useState<any>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // New doc creation
  const [newDocTitle, setNewDocTitle] = useState('Creative Brief - Custom Brand');
  const [isCreating, setIsCreating] = useState(false);

  // Write state
  const [noteToAppend, setNoteToAppend] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [writeSuccess, setWriteSuccess] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Saved documents history list
  const [docHistory, setDocHistory] = useState<{ id: string; title: string; visitedAt: string }[]>([]);

  // Track Firebase Auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        // We can request the token silently if already signed in,
        // but popUp is safer for full authorization scopes.
        // We will retrieve cache from localStorage if signed in already:
        const storedToken = localStorage.getItem('gdocs_access_token');
        if (storedToken) {
          setAccessToken(storedToken);
        }
      } else {
        setCurrentUser(null);
        setAccessToken(null);
        localStorage.removeItem('gdocs_access_token');
      }
      setAuthLoading(false);
    });

    // Load document history
    try {
      const historyStr = localStorage.getItem('gdocs_doc_history');
      if (historyStr) {
        setDocHistory(JSON.parse(historyStr));
      }
    } catch (e) {
      console.error('Failed to parse history', e);
    }

    return () => unsubscribe();
  }, []);

  // Save history helper
  const addToHistory = (id: string, title: string) => {
    const updated = [
      { id, title, visitedAt: new Date().toLocaleDateString() },
      ...docHistory.filter((item) => item.id !== id)
    ].slice(0, 5); // Max 5 items
    setDocHistory(updated);
    localStorage.setItem('gdocs_doc_history', JSON.stringify(updated));
  };

  // Google Authentication Handler
  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        localStorage.setItem('gdocs_access_token', credential.accessToken);
        setFetchError(null);
      } else {
        throw new Error('No access token returned from Google Sign-In.');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setFetchError('Google Sign-In failed or was cancelled. Please authorize the Docs scope.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAccessToken(null);
      setCurrentUser(null);
      setDocData(null);
      setActiveDocId(null);
      localStorage.removeItem('gdocs_access_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Load a document by Google Doc ID or full URL
  const handleLoadDocument = async (idOrUrl?: string) => {
    const input = idOrUrl || documentIdInput.trim();
    if (!input) return;

    // Direct extraction of ID from URL
    // e.g. https://docs.google.com/document/d/1A_B_C_D/edit -> 1A_B_C_D
    let docId = input;
    if (input.includes('docs.google.com/document/d/')) {
      const parts = input.split('/document/d/');
      if (parts[1]) {
        docId = parts[1].split('/')[0];
      }
    }

    if (!docId) {
      setFetchError('Invalid Google Doc URL or ID');
      return;
    }

    if (!accessToken) {
      setFetchError('Authentication required to read Google Docs.');
      return;
    }

    setDocLoading(true);
    setFetchError(null);
    setWriteSuccess(false);

    try {
      const response = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Permission denied. Ensure your Google account has access to this document, or click sign-in again to refresh your session.');
        }
        throw new Error(`Failed to read document (status: ${response.status})`);
      }

      const data = await response.json();
      setDocData(data);
      setActiveDocId(docId);
      addToHistory(docId, data.title || 'Untitled Brief');
    } catch (err: any) {
      console.error('Fetch Doc Error:', err);
      setFetchError(err.message || 'Error occurred while loading Google Doc.');
    } finally {
      setDocLoading(false);
    }
  };

  // Create a brand new design document
  const handleCreateDocument = async () => {
    const title = newDocTitle.trim();
    if (!title) return;

    if (!accessToken) {
      setFetchError('Authentication required to create a document.');
      return;
    }

    setIsCreating(true);
    setFetchError(null);
    setWriteSuccess(false);

    try {
      const response = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create document (status: ${response.status})`);
      }

      const rawNewDoc = await response.json();
      const newDocId = rawNewDoc.documentId;
      
      // We also append clean template text to start the design brief!
      const initialText = `TITLE: ${title}\n=========================================\n\nDELIVERED TAGLINE:\n[Insert Creative Vibe Tagline here]\n\nDESIGN PALETTE REFERENCE:\n- Primary: #FF0000 (Red Impact)\n- Accent: #0B0B0B (Deep Charcoal)\n\nINDUSTRY SPECIFICATIONS:\n- Bold graphic branding\n- Minimal layout aesthetics\n\n----------------- BRIEF END -----------------\n\n`;
      
      await fetch(`https://docs.googleapis.com/v1/documents/${newDocId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                text: initialText,
                endOfSegmentLocation: {}
              }
            }
          ]
        })
      });

      // Load it immediately!
      await handleLoadDocument(newDocId);
      setNewDocTitle('Creative Brief - Custom Brand');
    } catch (err: any) {
      console.error('Doc Creation Error:', err);
      setFetchError(err.message || 'Could not create new Google Doc.');
    } finally {
      setIsCreating(false);
    }
  };

  // Write creative specs/notes updates
  const handleWriteNotes = async () => {
    if (!activeDocId || !accessToken || !noteToAppend.trim()) return;

    // Explicit confirmation mandated by workspace guidelines!
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsWriting(true);
    setWriteError(null);
    setWriteSuccess(false);

    const fullMessageToAppend = `[DESIGN SPECS SYNCED ${new Date().toLocaleString()}]\n${noteToAppend}\n\n`;

    try {
      const response = await fetch(`https://docs.googleapis.com/v1/documents/${activeDocId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                text: fullMessageToAppend,
                endOfSegmentLocation: {}
              }
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update document (status: ${response.status})`);
      }

      setNoteToAppend('');
      setWriteSuccess(true);
      setShowConfirm(false);
      // Refresh current doc content
      await handleLoadDocument(activeDocId);
    } catch (err: any) {
      console.error('Doc Write Error:', err);
      setWriteError(err.message || 'Could not write creative notes back to Docs.');
    } finally {
      setIsWriting(false);
    }
  };

  // Append preset values instantly
  const handleInsertPalette = (palette: string) => {
    setNoteToAppend((prev) => prev + `\n🎨 PALETTE REASONING:\n- Colors: ${palette}\n- Alignment: High precision grid framework`);
  };

  return (
    <section id="docs" className="relative py-24 px-6 md:px-12 bg-[#F4F4F4] text-neutral-900 border-t-4 border-black border-none select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 text-left">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-[#FF0000] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
              05 // COLLABORATIVE WORKSTATION
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-black uppercase leading-tight tracking-tight text-neutral-900">
              GOOGLE DOCS <br />
              <span className="text-[#FF0000]">CREATIVE BRIEFS</span>
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="font-sans text-xs text-neutral-500 font-medium leading-relaxed uppercase">
              Connect Google Docs with permission to review, write, and create brand manuals and tactical briefs in real-time. Sync feedback instantly to your cloud-stored designer records.
            </p>
          </div>
        </div>

        {/* Auth Required State */}
        {!accessToken ? (
          <div className="bg-[#0B0B0B] text-white p-8 sm:p-12 border-4 border-black shadow-2xl relative text-left scroll-mt-20">
            <div className="absolute top-4 right-4 text-white/5 font-mono text-4xl tracking-tighter">CLOUD</div>
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-8 h-8 text-[#FF0000]" />
                <h3 className="font-mono text-xs font-black uppercase tracking-widest text-[#FF0000]">AUTHORIZATION SYSTEM</h3>
              </div>
              <h4 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight mb-4">
                AUTHENTICATE GOOGLE DOCS SUITE
              </h4>
              <p className="font-sans text-sm text-neutral-400 leading-relaxed mb-6">
                See the card below to connect Google Docs to your interactive designer workspace. Once enabled, you will have the ability to review, list, edit, and append project specifications and design briefs directly. The app will access or update your document data with your permission.
              </p>

              <button
                onClick={handleSignIn}
                className="gsi-material-button text-black bg-white font-mono hover:bg-neutral-200 transition-all font-bold px-6 py-3.5 border-2 border-[#FF0000] text-sm tracking-wider uppercase inline-flex items-center gap-3 cursor-pointer shadow-[4px_4px_0px_0px_#FF0000]"
                id="gsi-auth-btn"
              >
                <div className="gsi-material-button-icon w-5 h-5 flex items-center justify-center">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span>Connect Google Docs Account</span>
              </button>

              {fetchError && (
                <div className="mt-6 flex items-start gap-2 bg-[#FF0000]/10 border border-[#FF0000] p-4 text-xs font-mono text-[#FF0000]">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{fetchError}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Logged In Dashboard Container */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT CONTROL PANEL - Manage Docs & Settings */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              
              {/* Profile Card & Log out */}
              <div className="bg-[#0B0B0B] text-white p-5 border-4 border-black relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentUser?.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Google Account"
                        className="w-10 h-10 border-2 border-[#FF0000] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#FF0000] flex items-center justify-center font-black font-mono text-white text-lg">
                        {currentUser?.displayName?.[0] || 'D'}
                      </div>
                    )}
                    <div>
                      <span className="font-mono text-[9px] text-[#FF0000] font-black uppercase tracking-wider block">CONNECTED OPERATOR</span>
                      <h4 className="font-display font-black text-sm uppercase">{currentUser?.displayName || 'Designer Enthusiast'}</h4>
                      <p className="font-mono text-[10px] text-gray-500 truncate max-w-[200px]">{currentUser?.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="p-2.5 bg-neutral-900 border border-white/10 hover:bg-[#FF0000] group transition-colors cursor-pointer"
                    title="Disconnect Google Docs Scope"
                  >
                    <LogOut className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Document Loader Portal */}
              <div className="bg-[#0B0B0B] text-white p-6 border-4 border-black flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#FF0000]" />
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest text-[#FF0000]">LOAD CUSTOM DOCUMENT</h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="docIdOrUrl" className="font-mono text-[10px] text-gray-400 uppercase">Paste Google Doc Link / Identification ID</label>
                  <div className="flex gap-2">
                    <input
                      id="docIdOrUrl"
                      type="text"
                      placeholder="https://docs.google.com/document/d/... or ID"
                      value={documentIdInput}
                      onChange={(e) => setDocumentIdInput(e.target.value)}
                      className="bg-[#1A1A1A] text-white px-3 py-2 border border-white/15 focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000] outline-none text-xs font-mono flex-grow font-medium"
                    />
                    <button
                      onClick={() => handleLoadDocument()}
                      disabled={docLoading || !documentIdInput.trim()}
                      className="bg-[#FF0000] hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white p-2.5 font-bold transition-all border border-black max-w-[50px] flex items-center justify-center font-mono hover:scale-105 duration-200 cursor-pointer"
                      title="Fetch Document"
                    >
                      {docLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 leading-snug">
                    *Ensure you own the document or it is shared with your Google email.
                  </span>
                </div>

                {/* Quick History List */}
                {docHistory.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block">RECENT DESIGN SPECS</span>
                    <div className="flex flex-col gap-1.5">
                      {docHistory.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleLoadDocument(item.id)}
                          className="w-full flex items-center justify-between text-left p-2 bg-[#1A1A1A] border border-transparent hover:border-[#FF0000] transition-colors hover:bg-neutral-900 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#FF0000] flex-shrink-0" />
                            <span className="font-mono text-xs text-white uppercase truncate font-semibold duration-150">{item.title}</span>
                          </div>
                          <span className="font-mono text-[9px] text-gray-500 flex-shrink-0">{item.visitedAt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Creator Card */}
              <div className="bg-white text-black p-6 border-4 border-black flex flex-col gap-4 shadow-[4px_4px_0px_0px_#000000]">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-[#FF0000]" />
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest text-black">CREATE NEW DESIGN BRIEF</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="newDocTitle" className="font-mono text-[10px] text-neutral-500 uppercase">Document Title</label>
                    <input
                      id="newDocTitle"
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="Creative Brief - Neo Apparel"
                      className="bg-neutral-50 border-2 border-black px-3 py-2 font-mono text-xs text-black focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]"
                    />
                  </div>

                  <button
                    onClick={handleCreateDocument}
                    disabled={isCreating || !newDocTitle.trim()}
                    className="w-full py-2.5 bg-[#FF0000] hover:bg-red-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-mono text-xs font-bold font-black border-2 border-black hover:translate-y-[-2px] transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000000] uppercase"
                  >
                    {isCreating ? 'Synchronizing File...' : 'Provision Blank Google Doc'}
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE PANEL - Content Reader and Spec Writer */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left w-full h-full min-h-[500px]">
              
              {/* Document Reader Board */}
              <div className="bg-white text-black border-4 border-black shadow-[6px_6px_0px_0px_#FF0000] flex flex-col flex-grow relative overflow-hidden min-h-[450px]">
                <div className="bg-[#0B0B0B] text-white px-5 py-3 border-b-2 border-black flex items-center justify-between">
                  {activeDocId && docData ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 bg-[#34A853] animate-pulse rounded-full flex-shrink-0" />
                      <span className="font-mono text-xs text-stone-300 font-bold uppercase tracking-wider truncate">
                        ACTIVE DOC: {docData.title}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#FF0000] rounded-full" />
                      <span className="font-mono text-xs text-stone-300 font-black uppercase tracking-wider">
                        NO DOCUMENT SELECTION
                      </span>
                    </div>
                  )}

                  {activeDocId && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLoadDocument(activeDocId)}
                        disabled={docLoading}
                        className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Force reload specs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${docLoading ? 'animate-spin' : ''}`} />
                      </button>
                      <a
                        href={`https://docs.google.com/document/d/${activeDocId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-[#FF0000] transition-colors"
                        title="Open in Google Docs Workspace"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Live Output content area */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[380px] bg-amber-50/15 flex-grow">
                  
                  {docLoading ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 gap-3">
                      <RefreshCw className="w-8 h-8 text-[#FF0000] animate-spin" />
                      <span className="font-mono text-xs uppercase font-bold text-neutral-600">Retrieving Layout Framework...</span>
                    </div>
                  ) : activeDocId && docData ? (
                    <div className="prose prose-sm max-w-none">
                      {/* Document Meta Header inside editorial canvas */}
                      <div className="border-b border-black/10 pb-4 mb-4 font-mono text-[10px] text-neutral-500 flex justify-between">
                        <span>REvISION: V{docData.revisionId || '1.0'}</span>
                        <span>DOC ID: {activeDocId.substring(0, 8)}...</span>
                      </div>
                      
                      {/* Parsed Output elements */}
                      {docData.body?.content?.length > 0 ? (
                        <div className="space-y-4 font-sans text-sm text-neutral-800 leading-relaxed text-left">
                          {docData.body.content.map((element: any, idx: number) => {
                            if (element.paragraph && element.paragraph.elements) {
                              const styleType = element.paragraph.paragraphStyle?.namedStyleType;
                              const text = element.paragraph.elements
                                .map((el: any) => el.textRun?.content || '')
                                .join('');
                              
                              if (!text.trim()) return null;

                              if (styleType === 'TITLE' || styleType === 'SUBTITLE') {
                                return (
                                  <h1 key={idx} className="font-display text-2xl font-black text-[#0B0B0B] border-b-2 border-[#FF0000]/60 pb-1.5 mb-3 uppercase tracking-tight">
                                    {text.replace('\n', '')}
                                  </h1>
                                );
                              }
                              if (styleType === 'HEADING_1') {
                                return (
                                  <h2 key={idx} className="font-display text-md font-black text-[#0B0B0B] border-l-4 border-[#FF0000] pl-2 mt-6 mb-2 uppercase tracking-wide">
                                    {text.replace('\n', '')}
                                  </h2>
                                );
                              }
                              if (styleType === 'HEADING_2') {
                                return (
                                  <h3 key={idx} className="font-display text-sm font-bold text-[#FF0000] mt-4 mb-1 uppercase">
                                    {text.replace('\n', '')}
                                  </h3>
                                );
                              }
                              return (
                                <p key={idx} className="text-neutral-700 font-medium">
                                  {text}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-neutral-400">Empty Document Content</span>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-neutral-400 gap-4">
                      <FileText className="w-12 h-12 text-neutral-300 stroke-[1.5]" />
                      <div className="text-center max-w-xs flex flex-col gap-1">
                        <span className="font-mono text-xs font-black uppercase text-neutral-600">WORKSPACE OFFLINE</span>
                        <p className="font-sans text-xs text-neutral-500">
                          Paste a Document ID on the left toolbar, select from your history list, or create a brand new Creative Brief to trigger the interactive canvas.
                        </p>
                      </div>
                    </div>
                  )}

                  {fetchError && (
                    <div className="mt-4 flex items-start gap-2 bg-[#FF0000]/10 border border-[#FF0000]/40 p-4 text-xs font-mono text-[#FF0000]">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{fetchError}</span>
                    </div>
                  )}
                </div>

                {/* Submitting annotation tools area */}
                {activeDocId && docData && (
                  <div className="bg-[#F9F9F9] p-4 border-t-2 border-black flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider font-bold">APPEND CREATIVE NOTEBACK</span>
                      <div className="flex gap-2">
                        {/* Preset color injection chips */}
                        <button
                          onClick={() => handleInsertPalette('RED #FF0000 / DARK #0B0B0B')}
                          type="button"
                          className="px-2 py-0.5 bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 font-mono text-[9px] hover:bg-[#FF0000] hover:text-white cursor-pointer"
                        >
                          + Red/Dark Palette
                        </button>
                        <button
                          onClick={() => handleInsertPalette('WHITE #FFFFFF / BLUE #1A5276')}
                          type="button"
                          className="px-2 py-0.5 bg-neutral-200 text-neutral-700 border border-neutral-300 font-mono text-[9px] hover:bg-neutral-800 hover:text-white cursor-pointer"
                        >
                          + Clean/Slate Palette
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <textarea
                        rows={3}
                        value={noteToAppend}
                        onChange={(e) => setNoteToAppend(e.target.value)}
                        placeholder="Append color choices, client markup requests, typography constraints, or general design reviews directly to the end of your Google Doc."
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#FF0000]"
                      />

                      {/* Explicit confirmation mandate by workspace guidelines */}
                      <AnimatePresence mode="wait">
                        {showConfirm ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-amber-500/10 border-2 border-amber-500 p-3 flex flex-col gap-2.5 text-xs font-mono text-amber-900"
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                              <span className="text-left font-bold">
                                CONFIRM WORKSPACE UPDATE: Overwrite or insert annotations to active cloud document? This will append {noteToAppend.length} characters to Google Docs.
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleWriteNotes}
                                disabled={isWriting}
                                className="px-3 py-1 bg-amber-600 font-bold font-black text-white hover:bg-amber-700 border border-black cursor-pointer uppercase text-[10px]"
                              >
                                {isWriting ? 'Syncing...' : 'Confirm Update'}
                              </button>
                              <button
                                onClick={() => setShowConfirm(false)}
                                className="px-3 py-1 bg-neutral-200 hover:bg-neutral-300 border border-neutral-400 text-neutral-800 cursor-pointer uppercase text-[10px]"
                              >
                                Abort
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={handleWriteNotes}
                            disabled={!noteToAppend.trim() || isWriting}
                            className="w-full py-2 bg-[#0B0B0B] hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-mono text-xs font-bold font-black uppercase text-center cursor-pointer tracking-wider"
                          >
                            Append Creative Brief Specifications
                          </button>
                        )}
                      </AnimatePresence>

                      {writeSuccess && (
                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono font-bold mt-1 bg-emerald-500/10 p-2.5 border border-emerald-500/30">
                          <Check className="w-4 h-4 flex-shrink-0" />
                          <span>Google Doc updated successfully with new visual annotations!</span>
                        </div>
                      )}

                      {writeError && (
                        <div className="flex items-start gap-2 text-[#FF0000] text-xs font-mono mt-1 bg-[#FF0000]/10 p-2.5 border border-[#FF0000]/30">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{writeError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
