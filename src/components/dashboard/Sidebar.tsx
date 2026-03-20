'use client';

import { useState } from 'react';
import { MOCK_USER, MOCK_NOTES, MOCK_COLLECTIONS, MOCK_TAGS } from '@/lib/mock-data';
import type { Collection, Note, Tag } from '@/types/dashboard';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function SidebarNavItem({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
      <span className="shrink-0 w-3.5 h-3.5">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <span className="text-xs tabular-nums">{count}</span>
    </button>
  );
}

function CollectionItem({ collection }: { collection: Collection }) {
  return (
    <button className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
        />
      </svg>
      <span className="flex-1 text-left truncate">{collection.name}</span>
      {collection.isFavorite && (
        <svg
          className="w-3 h-3 text-accent shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z" />
        </svg>
      )}
      <span className="text-xs tabular-nums">{collection.noteCount}</span>
    </button>
  );
}

function NoteItem({ note }: { note: Note }) {
  return (
    <button className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
        />
      </svg>
      <span className="flex-1 text-left truncate">{note.title}</span>
      {note.isPinned && (
        <svg className="w-3 h-3 text-accent shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
}

function SectionHeader({
  label,
  expanded,
  onToggle,
  action,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center mb-1 px-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 flex-1 text-xs font-medium text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
      >
        <svg
          className={`w-3 h-3 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {label}
      </button>
      {action}
    </div>
  );
}

function TagItem({ tag }: { tag: Tag }) {
  return (
    <button className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
        />
      </svg>
      <span className="flex-1 text-left truncate">{tag.name}</span>
      <span className="text-xs tabular-nums">{tag.noteCount}</span>
    </button>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const allNotesCount = MOCK_NOTES.length;
  const favoritesCount = MOCK_NOTES.filter((n) => n.isFavorite).length;
  const pinnedCount = MOCK_NOTES.filter((n) => n.isPinned).length;

  const recentCollections = MOCK_COLLECTIONS;

  const [notesExpanded, setNotesExpanded] = useState(true);
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);

  const initials = MOCK_USER.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border
          w-full
          md:relative md:inset-auto md:z-auto
          transition-all duration-300
          ${
            isOpen
              ? 'translate-x-0 md:w-60'
              : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-r-0'
          }
        `}
      >
        {/* Inner wrapper keeps content at fixed width while outer animates */}
        <div
          className={`w-full md:w-60 flex flex-col h-full overflow-hidden bg-surface transition-opacity ${
            isOpen ? 'opacity-100 duration-200 delay-150' : 'opacity-0 duration-150 delay-0'
          }`}
        >
          {/* Scrollable nav */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            {/* Notes — Quick Access */}
            <section className="px-3">
              <div className="flex items-center justify-between mb-1 px-2">
                <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Quick Access
                </h3>
                <button
                  onClick={onClose}
                  className="md:hidden p-1 rounded hover:bg-surface-hover text-text-secondary transition-colors"
                  aria-label="Close sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-0.5">
                <SidebarNavItem
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
                      />
                    </svg>
                  }
                  label="All Notes"
                  count={allNotesCount}
                />
                <SidebarNavItem
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z"
                      />
                    </svg>
                  }
                  label="Favorites"
                  count={favoritesCount}
                />
                <SidebarNavItem
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  }
                  label="Pinned"
                  count={pinnedCount}
                />
              </nav>
            </section>

            {/* Notes */}
            <section className="px-3">
              <SectionHeader
                label="Notes"
                expanded={notesExpanded}
                onToggle={() => setNotesExpanded(!notesExpanded)}
              />
              {notesExpanded && (
                <nav className="space-y-0.5">
                  {MOCK_NOTES.map((note) => (
                    <NoteItem key={note.id} note={note} />
                  ))}
                </nav>
              )}
            </section>

            {/* Collections */}
            <section className="px-3">
              <SectionHeader
                label="Collections"
                expanded={collectionsExpanded}
                onToggle={() => setCollectionsExpanded(!collectionsExpanded)}
                action={
                  <button className="text-text-secondary hover:text-text-primary transition-colors leading-none text-base">
                    +
                  </button>
                }
              />
              {collectionsExpanded && (
                <nav className="space-y-0.5">
                  {recentCollections.map((col) => (
                    <CollectionItem key={col.id} collection={col} />
                  ))}
                </nav>
              )}
            </section>

            {/* Tags */}
            <section className="px-3">
              <SectionHeader
                label="Tags"
                expanded={tagsExpanded}
                onToggle={() => setTagsExpanded(!tagsExpanded)}
              />
              {tagsExpanded && (
                <nav className="space-y-0.5">
                  {MOCK_TAGS.map((tag) => (
                    <TagItem key={tag.id} tag={tag} />
                  ))}
                </nav>
              )}
            </section>
          </div>

          {/* User area */}
          <div className="px-3 py-3 border-t border-border shrink-0 flex items-center gap-1">
            <button className="flex items-center gap-3 flex-1 min-w-0 px-2 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{MOCK_USER.name}</p>
                {MOCK_USER.isPro && <p className="text-xs text-accent">Pro</p>}
              </div>
            </button>
            <button
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary shrink-0"
              aria-label="Settings"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
