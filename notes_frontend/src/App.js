import React, { useState, useEffect } from "react";
import "./App.css";

// Color palette
const COLOR_PRIMARY = "#1976d2";
const COLOR_ACCENT = "#ffab00";
const COLOR_SECONDARY = "#424242";

// MOCK API service, ready to connect to real backend
// PUBLIC_INTERFACE
async function fetchNotes() {
  // Replace URL with actual backend endpoint for notes_database
  const resp = await fetch("/api/notes");
  if (!resp.ok) throw new Error("Failed to fetch notes");
  return await resp.json();
}
// PUBLIC_INTERFACE
async function createNote(note) {
  const resp = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!resp.ok) throw new Error("Failed to create note");
  return await resp.json();
}
// PUBLIC_INTERFACE
async function updateNote(note) {
  const resp = await fetch(`/api/notes/${note.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!resp.ok) throw new Error("Failed to update note");
  return await resp.json();
}
// PUBLIC_INTERFACE
async function deleteNote(noteId) {
  const resp = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
  if (!resp.ok) throw new Error("Failed to delete note");
  return true;
}

// Note List Sidebar Component
// PUBLIC_INTERFACE
function NotesSidebar({
  notes,
  selectedId,
  onSelect,
  onCreate,
  searchQuery,
  onSearch,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <input
          className="search-input"
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="accent-btn" onClick={onCreate}>
          + New
        </button>
      </div>
      <nav className="note-list">
        {notes.length === 0 ? (
          <span className="hint-text">No notes found.</span>
        ) : (
          notes.map((note) => (
            <div
              className={
                note.id === selectedId
                  ? "note-list-item selected"
                  : "note-list-item"
              }
              key={note.id}
              onClick={() => onSelect(note.id)}
              tabIndex={0}
              aria-label={`Select note: ${note.title}`}
            >
              <div className="note-title">{note.title || <em>Untitled</em>}</div>
              <div className="note-snippet">
                {note.content.slice(0, 30) || <em>No content</em>}
              </div>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}

// Note Details Main Area Component
// PUBLIC_INTERFACE
function NoteDetails({
  note,
  editing,
  onEdit,
  onCancel,
  onDelete,
  onSave,
  isNew,
  setEditingNote,
}) {
  const [error, setError] = useState("");

  // Controlled form fields for title/content
  useEffect(() => {
    if (!editing && error) setError("");
  }, [editing]);

  if (!note && !isNew)
    return (
      <div className="main-empty">
        <span className="hint-text">Select a note or create a new one</span>
      </div>
    );

  return (
    <section className="note-details">
      {editing ? (
        <form
          className="note-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.title.trim()) {
              setError("Title cannot be empty.");
              return;
            }
            onSave(note);
          }}
        >
          <input
            className="note-title-input"
            placeholder="Title"
            value={note.title}
            maxLength={80}
            autoFocus
            onChange={(e) =>
              setEditingNote((prev) => ({ ...prev, title: e.target.value }))
            }
            style={{ borderColor: error ? "red" : "var(--border-color)" }}
          />
          <textarea
            className="note-content-input"
            placeholder="Write your note..."
            value={note.content}
            rows={10}
            onChange={(e) =>
              setEditingNote((prev) => ({ ...prev, content: e.target.value }))
            }
          ></textarea>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="primary-btn">
              {isNew ? "Create" : "Save"}
            </button>
            <button type="button" className="secondary-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="note-display">
          <h2 className="note-title">{note.title || <em>Untitled</em>}</h2>
          <article className="note-content">
            {note.content ? note.content : <span className="hint-text">Empty note</span>}
          </article>
          <div className="actions-row">
            <button className="primary-btn" onClick={onEdit}>
              Edit
            </button>
            {!isNew && (
              <button
                className="danger-btn"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this note?"))
                    onDelete(note.id);
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function App() {
  // State for notes, search, selected note, editing mode, draft, etc.
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme] = useState("light"); // Always light theme for this implementation (can expand for toggling later)
  const [errorMsg, setErrorMsg] = useState("");

  // Load notes
  useEffect(() => {
    setLoading(true);
    fetchNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg("Failed to load notes.");
        setLoading(false);
      });
  }, []);

  // Select note when notes or selectedId changes
  const selectedNote = notes.find((n) => n.id === selectedId);

  // Search functionality
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create new note
  const handleCreate = () => {
    setIsNew(true);
    setEditing(true);
    setEditingNote({
      id: null,
      title: "",
      content: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setSelectedId(null);
  };

  // Edit note
  const handleEdit = () => {
    if (!selectedNote) return;
    setIsNew(false);
    setEditing(true);
    setEditingNote({ ...selectedNote });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);
    setEditingNote(null);
    setIsNew(false);
  };

  // Save handler
  const handleSave = async (note) => {
    setLoading(true);
    try {
      let saved;
      if (isNew) {
        saved = await createNote(note);
        setNotes((prev) => [saved, ...prev]);
        setSelectedId(saved.id);
      } else {
        saved = await updateNote(note);
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? saved : n))
        );
        setSelectedId(saved.id);
      }
      setEditing(false);
      setEditingNote(null);
      setIsNew(false);
      setErrorMsg("");
    } catch (e) {
      setErrorMsg("Failed to save note.");
    }
    setLoading(false);
  };

  // Delete handler
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setEditing(false);
      setSelectedId(null);
    } catch (e) {
      setErrorMsg("Failed to delete note.");
    }
    setLoading(false);
  };

  // Select note
  const handleSelect = (id) => {
    setSelectedId(id);
    setEditing(false);
    setIsNew(false);
    setEditingNote(null);
  };

  // Update editing note
  const handleSetEditingNote = (newNote) => {
    setEditingNote((prev) => ({ ...prev, ...newNote }));
  };

  return (
    <div className="root-layout" data-theme={theme}>
      <NotesSidebar
        notes={filteredNotes}
        selectedId={selectedId}
        onSelect={handleSelect}
        onCreate={handleCreate}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
      <main className="main-area">
        <header className="main-header">
          <h1 className="main-title">📝 Notes</h1>
        </header>
        {errorMsg && <div className="global-error">{errorMsg}</div>}
        {loading && (
          <div className="global-loading">
            <span className="loader"></span> Loading...
          </div>
        )}
        {!loading && (
          <NoteDetails
            note={editing ? editingNote : selectedNote}
            editing={editing}
            isNew={isNew}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onSave={handleSave}
            setEditingNote={handleSetEditingNote}
          />
        )}
      </main>
      <style>
        {`
        :root {
          --primary: ${COLOR_PRIMARY};
          --accent: ${COLOR_ACCENT};
          --secondary: ${COLOR_SECONDARY};
          --bg-main: #f6f7fb;
          --sidebar-bg: #fff;
          --border-color: #e0e0e0;
          --sidebar-width: 275px;
        }
        `}
      </style>
    </div>
  );
}

export default App;
