import { useState, useEffect, useRef } from 'react';
import './EditPage.css';
import { supabase } from './supabaseClient';
import { formatRichTextForEditor, formatRichTextForRender, sanitizeRichText } from './richTextUtils';

export default function EditPage() {
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [sections, setSections] = useState([]);
  const [editingStates, setEditingStates] = useState({});
  const [reorderingSection, setReorderingSection] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState([]);
  const editorRefs = useRef({});

  // Load available pages from Supabase on mount
  useEffect(() => {
    const loadPages = async () => {
      try {
        const { data, error: err } = await supabase
          .from('pages')
          .select('page_id, title')
          .order('page_id', { ascending: true });

        if (err) throw err;
        setPages(data || []);
      } catch (err) {
        console.error('Error loading pages:', err);
        setError(err.message);
      }
    };

    loadPages();
  }, []);

  // Handle page selection - fetch from Supabase
  const handlePageSelect = async (pageId) => {
    setLoading(true);
    setError(null);
    try {
      setSelectedPageId(pageId);

      // Get the page UUID from page_id
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('page_id', pageId)
        .single();

      if (pageError) throw pageError;

      // Get all sections for this page
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('page_id', pageData.id)
        .order('position', { ascending: true });

      if (sectionsError) throw sectionsError;

      // Get all content blocks for these sections
      const { data: blocksData, error: blocksError } = await supabase
        .from('content_blocks')
        .select('*')
        .in('section_id', sectionsData.map(s => s.id));

      if (blocksError) throw blocksError;

      // Reconstruct sections with their content blocks
      const sectionsWithBlocks = sectionsData.map(section => {
        const contentBlocks = blocksData
          .filter(block => block.section_id === section.id)
          .sort((a, b) => a.block_index - b.block_index)
          .map(block => ({
            text: block.text || '',
            image: block.image_url || null,
            imagePosition: block.image_position || 'left'
          }));

        return {
          id: section.id,
          section_id: section.section_id,
          title: section.title,
          position: section.position,
          contentBlocks: contentBlocks.length > 0 ? contentBlocks : [{ text: '', image: null, imagePosition: 'left' }]
        };
      });

      setSections(sectionsWithBlocks);

      // Initialize editing states
      const newEditingStates = {};
      const newCollapsedStates = {};
      sectionsWithBlocks.forEach((section) => {
        newEditingStates[section.id] = {
          title: section.title,
          contentBlocks: section.contentBlocks
        };
        newCollapsedStates[section.id] = true;
      });
      setEditingStates(newEditingStates);
      setCollapsedSections(newCollapsedStates);

      console.log('Loaded sections from Supabase:', sectionsWithBlocks);
    } catch (err) {
      console.error('Error loading page:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes during editing
  const handleFieldChange = (sectionId, field, value, blockIndex = null) => {
    setEditingStates((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: field === 'contentBlocks' && blockIndex !== null
          ? prev[sectionId][field].map((block, index) =>
              index === blockIndex
                ? { ...block, [value.field]: value.value }
                : block
            )
          : value
      }
    }));
  };

  // Handle image file selection
  const handleImageChange = (sectionId, blockIndex, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleFieldChange(sectionId, 'contentBlocks', {
          field: 'image',
          value: e.target.result
        }, blockIndex);
      };
      reader.readAsDataURL(file);
    } else {
      handleFieldChange(sectionId, 'contentBlocks', {
        field: 'image',
        value: null
      }, blockIndex);
    }
  };

  // Handle adding a content block to a section
  const handleAddContentBlock = (sectionId) => {
    setEditingStates((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        contentBlocks: [...prev[sectionId].contentBlocks, { text: '', image: null, imagePosition: 'left' }]
      }
    }));
    console.log(`Added content block to section ${sectionId}`);
  };

  // Handle deleting a content block from a section
  const handleDeleteContentBlock = (sectionId, blockIndex) => {
    setEditingStates((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        contentBlocks: prev[sectionId].contentBlocks.filter((_, index) => index !== blockIndex)
      }
    }));
    console.log(`Deleted content block ${blockIndex} from section ${sectionId}`);
  };

  // Handle save all sections to Supabase
  const handleSaveAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the page UUID
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('page_id', selectedPageId)
        .single();

      if (pageError) throw pageError;

      // Save each section and its content blocks
      for (const section of sections) {
        const sectionData = editingStates[section.id];
        
        // Update or insert section
        const { error: sectionError } = await supabase
          .from('sections')
          .upsert({
            id: section.id,
            page_id: pageData.id,
            section_id: section.section_id,
            title: sectionData.title,
            position: sections.indexOf(section) + 1
          }, { onConflict: 'id' });

        if (sectionError) throw sectionError;

        // Delete old content blocks for this section
        const { error: deleteError } = await supabase
          .from('content_blocks')
          .delete()
          .eq('section_id', section.id);

        if (deleteError) throw deleteError;

        // Insert new content blocks
        if (sectionData.contentBlocks && sectionData.contentBlocks.length > 0) {
          const blocksToInsert = sectionData.contentBlocks.map((block, index) => ({
            section_id: section.id,
            text: block.text || '',
            image_url: block.image || null,
            image_position: block.imagePosition || 'left',
            block_index: index
          }));

          const { error: blocksError } = await supabase
            .from('content_blocks')
            .insert(blocksToInsert);

          if (blocksError) throw blocksError;
        }
      }

      console.log('All sections saved to Supabase successfully');
      alert('All changes saved successfully!');
    } catch (err) {
      console.error('Error saving sections:', err);
      setError(err.message);
      alert(`Error saving: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new section
  const handleAddSection = async () => {
    try {
      // Get the page UUID
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('page_id', selectedPageId)
        .single();

      if (pageError) throw pageError;

      // Create a new section in Supabase to get a UUID
      const newPosition = sections.length + 1;
      const { data: newSectionData, error: insertError } = await supabase
        .from('sections')
        .insert({
          page_id: pageData.id,
          section_id: `section-${Date.now()}`,
          title: '',
          position: newPosition
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newSection = {
        id: newSectionData.id,
        section_id: newSectionData.section_id,
        title: '',
        position: newPosition,
        contentBlocks: [{ text: '', image: null, imagePosition: 'left' }]
      };

      setSections((prev) => [...prev, newSection]);

      // Initialize editing state for the new section
      setEditingStates((prev) => ({
        ...prev,
        [newSectionData.id]: {
          title: '',
          contentBlocks: [{ text: '', image: null, imagePosition: 'left' }]
        }
      }));

      // Add to collapsed sections
      setCollapsedSections((prev) => ({
        ...prev,
        [newSectionData.id]: true
      }));

      console.log('New section added:', newSectionData.id);
    } catch (err) {
      console.error('Error adding section:', err);
      setError(err.message);
    }
  };

  // Handle deleting a section
  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        // Delete from Supabase
        const { error } = await supabase
          .from('sections')
          .delete()
          .eq('id', sectionId);

        if (error) throw error;

        // Update local state
        setSections((prev) => prev.filter((section) => section.id !== sectionId));
        
        setEditingStates((prev) => {
          const newState = { ...prev };
          delete newState[sectionId];
          return newState;
        });
        
        setCollapsedSections((prev) => {
          const newState = { ...prev };
          delete newState[sectionId];
          return newState;
        });
        
        setReorderingSection(null);
        console.log('Section deleted:', sectionId);
      } catch (err) {
        console.error('Error deleting section:', err);
        setError(err.message);
      }
    }
  };

  // Handle reordering a section
  const handleReorderSection = async (sectionId, newPosition) => {
    const currentIndex = sections.findIndex(section => section.id === sectionId);
    const newIndex = newPosition - 1; // Convert to 0-based index

    if (currentIndex === newIndex || newIndex < 0 || newIndex >= sections.length) {
      setReorderingSection(null);
      return;
    }

    try {
      // Reorder sections in state
      const newSections = [...sections];
      const [movedSection] = newSections.splice(currentIndex, 1);
      newSections.splice(newIndex, 0, movedSection);

      // Update Supabase with new positions
      for (let i = 0; i < newSections.length; i++) {
        const { error } = await supabase
          .from('sections')
          .update({ position: i + 1 })
          .eq('id', newSections[i].id);

        if (error) throw error;
      }

      setSections(newSections);
      setReorderingSection(null);
      console.log(`Section "${movedSection.title || movedSection.id}" moved from position ${currentIndex + 1} to ${newPosition}`);
    } catch (err) {
      console.error('Error reordering section:', err);
      setError(err.message);
    }
  };

  // Handle toggling section collapse state
  const toggleCollapse = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const insertHtmlAtCursor = (html) => {
    if (document.queryCommandSupported && document.queryCommandSupported('insertHTML')) {
      document.execCommand('insertHTML', false, html);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleRichTextPaste = (sectionId, blockIndex, event) => {
    event.preventDefault();
    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');
    const content = html ? sanitizeRichText(html) : formatRichTextForRender(text);
    insertHtmlAtCursor(content || '');

    setTimeout(() => {
      const currentHtml = event.currentTarget.innerHTML;
      handleFieldChange(sectionId, 'contentBlocks', {
        field: 'text',
        value: sanitizeRichText(currentHtml)
      }, blockIndex);
    }, 0);
  };

  const handleRichTextInput = (sectionId, blockIndex, event) => {
    handleFieldChange(sectionId, 'contentBlocks', {
      field: 'text',
      value: event.currentTarget.innerHTML
    }, blockIndex);
  };

  const handleRichTextBlur = (sectionId, blockIndex, event) => {
    const cleanHtml = sanitizeRichText(event.currentTarget.innerHTML);
    event.currentTarget.innerHTML = cleanHtml;
    handleFieldChange(sectionId, 'contentBlocks', {
      field: 'text',
      value: cleanHtml
    }, blockIndex);
  };

  const setRichTextEditorRef = (sectionId, blockIndex, blockText) => (element) => {
    if (!element) return;

    const key = `${sectionId}-${blockIndex}`;
    editorRefs.current[key] = element;

    const nextHtml = formatRichTextForEditor(blockText || '');
    const isFocused = document.activeElement === element;

    // Keep cursor stable while typing/backspacing by not re-syncing focused editors.
    if (!isFocused && element.innerHTML !== nextHtml) {
      element.innerHTML = nextHtml;
    }
  };

  // Get the currently selected page name for display
  const selectedPageName = selectedPageId
    ? pages.find(p => p.page_id === selectedPageId)?.title || 'Page'
    : 'No page selected';

  return (
    <div className="edit-page-container">
      <h1>Edit Page Content</h1>

      <div className="page-selector-section">
        <label htmlFor="page-dropdown">Select a Page:</label>
        <select
          id="page-dropdown"
          value={selectedPageId || ''}
          onChange={(e) => handlePageSelect(e.target.value)}
          className="page-dropdown-select"
          disabled={loading}
        >
          <option value="">-- Choose a page --</option>
          {pages.map((page) => (
            <option key={page.page_id} value={page.page_id}>
              {page.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="loading-message">
          Loading...
        </div>
      )}

      {selectedPageId && (
        <div className="edit-page-content">
          <h2>Editing: {selectedPageName}</h2>

          {sections.length > 0 ? (
            <div className="sections-list">
              {sections.map((section, index) => (
                <div key={section.id} className="section-editor">
                  <div className="section-header">
                    <button
                      onClick={() => toggleCollapse(section.id)}
                      className="collapse-button"
                      title={collapsedSections[section.id] ? 'Expand' : 'Collapse'}
                    >
                      {collapsedSections[section.id] ? '▶' : '▼'}
                    </button>
                    <span className="section-title-display">
                      {editingStates[section.id]?.title || '(Untitled)'}
                    </span>
                    <span className="section-position">Position: {index + 1}</span>
                  </div>

                  {!collapsedSections[section.id] && (
                    <>
                      <div className="form-group">
                    <label htmlFor={`title-${section.id}`}>Section Title:</label>
                    <input
                      id={`title-${section.id}`}
                      type="text"
                      value={editingStates[section.id]?.title || ''}
                      onChange={(e) =>
                        handleFieldChange(section.id, 'title', e.target.value)
                      }
                      placeholder="Enter section title"
                      className="section-title-input"
                    />
                  </div>

                  <div className="content-blocks-container">
                    <label>Content Blocks:</label>
                    {editingStates[section.id]?.contentBlocks?.map((block, blockIndex) => (
                      <div key={blockIndex} className="content-block-item">
                        <div className="content-block-header">
                          <span className="content-block-label">Block {blockIndex + 1}</span>
                          {editingStates[section.id]?.contentBlocks?.length > 1 && (
                            <button
                              onClick={() => handleDeleteContentBlock(section.id, blockIndex)}
                              className="delete-content-block-btn"
                              title="Delete this content block"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Image Upload Section */}
                        <div className="image-controls">
                          <label className="image-upload-label">
                            <span>Image:</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(section.id, blockIndex, e.target.files[0])}
                              className="image-input"
                            />
                          </label>

                          {block.image && (
                            <div className="image-preview-container">
                              <img
                                src={block.image}
                                alt={`Block ${blockIndex + 1} preview`}
                                className="image-preview"
                              />
                              <button
                                onClick={() => handleImageChange(section.id, blockIndex, null)}
                                className="remove-image-btn"
                                title="Remove image"
                              >
                                Remove Image
                              </button>
                            </div>
                          )}

                          <div className="position-controls">
                            <label>Position:</label>
                            <select
                              value={block.imagePosition || 'left'}
                              onChange={(e) => handleFieldChange(section.id, 'contentBlocks', {
                                field: 'imagePosition',
                                value: e.target.value
                              }, blockIndex)}
                              className="position-select"
                            >
                              <option value="left">Left of text</option>
                              <option value="right">Right of text</option>
                              <option value="above">Above text</option>
                              <option value="below">Below text</option>
                            </select>
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="text-content-container">
                          <label htmlFor={`content-${section.id}-${blockIndex}`}>Content:</label>
                          <div
                            id={`content-${section.id}-${blockIndex}`}
                            contentEditable
                            suppressContentEditableWarning
                            ref={setRichTextEditorRef(section.id, blockIndex, block.text || '')}
                            onInput={(e) => handleRichTextInput(section.id, blockIndex, e)}
                            onBlur={(e) => handleRichTextBlur(section.id, blockIndex, e)}
                            onPaste={(e) => handleRichTextPaste(section.id, blockIndex, e)}
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                insertHtmlAtCursor('&nbsp;&nbsp;&nbsp;&nbsp;');
                              }
                            }}
                            className="section-content-textarea"
                            role="textbox"
                            aria-label={`Content for block ${blockIndex + 1}`}
                            data-placeholder={`Enter content for block ${blockIndex + 1}`}
                          />
                        </div>

                        {/* Preview */}
                        {(block.text || block.image) && (
                          <div className="content-block-preview">
                            <h5>Preview:</h5>
                            <div className={`image-position-${block.imagePosition || 'left'} ${block.image ? 'has-image' : 'no-image'}`}>
                              {block.image && block.imagePosition === 'above' && (
                                <img
                                  src={block.image}
                                  alt={`Block ${blockIndex + 1} preview`}
                                  style={{ maxWidth: '150px', borderRadius: '4px', width: '100%' }}
                                />
                              )}
                              {block.image && (block.imagePosition === 'left' || block.imagePosition === 'right') && (
                                <img
                                  src={block.image}
                                  alt={`Block ${blockIndex + 1} preview`}
                                  style={{ maxWidth: '150px', borderRadius: '4px', order: block.imagePosition === 'left' ? -1 : 1 }}
                                />
                              )}
                              {block.text && (
                                <div
                                  style={{ textAlign: 'left', whiteSpace: 'normal' }}
                                  dangerouslySetInnerHTML={{ __html: formatRichTextForRender(block.text) }}
                                />
                              )}
                              {block.image && block.imagePosition === 'below' && (
                                <img
                                  src={block.image}
                                  alt={`Block ${blockIndex + 1} preview`}
                                  style={{ maxWidth: '150px', borderRadius: '4px', width: '100%', order: 1 }}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddContentBlock(section.id)}
                      className="add-content-block-btn"
                      title="Add new content block"
                    >
                      <span className="plus-icon-small">+</span>
                      Add Content Block
                    </button>
                  </div>
                    </>
                  )}

                  <div className="section-actions">
                    <button
                      onClick={() => setReorderingSection(reorderingSection === section.id ? null : section.id)}
                      className="reorder-button"
                      title="Reorder section"
                    >
                      {reorderingSection === section.id ? 'Cancel' : 'Reorder'}
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="delete-button"
                      title="Delete section"
                    >
                      Delete
                    </button>
                  </div>

                  {reorderingSection === section.id && (
                    <div className="reorder-controls">
                      <label htmlFor={`position-${section.id}`}>Move to position:</label>
                      <select
                        id={`position-${section.id}`}
                        onChange={(e) => handleReorderSection(section.id, parseInt(e.target.value))}
                        defaultValue={index + 1}
                        className="position-select"
                      >
                        {sections.map((_, posIndex) => (
                          <option key={posIndex + 1} value={posIndex + 1}>
                            {posIndex + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-sections-message">
              No sections available for this page.
            </p>
          )}

          {/* Action Buttons */}
          <div className="add-section-container">
            <button
              onClick={handleAddSection}
              className="add-section-button"
              title="Add new section"
            >
              <span className="plus-icon">+</span>
              Add New Section
            </button>
            <button
              onClick={handleSaveAll}
              className="save-all-button"
              title="Save all changes"
            >
              💾 Save All Changes
            </button>
          </div>
        </div>
      )}

      {!selectedPageId && (
        <div className="no-page-selected">
          <p>Select a page from the dropdown above to start editing.</p>
        </div>
      )}
    </div>
  );
}
